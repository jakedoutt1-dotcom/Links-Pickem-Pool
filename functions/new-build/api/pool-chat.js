const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
async function schema(db){await db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS links_chat_messages(id INTEGER PRIMARY KEY AUTOINCREMENT,pool INTEGER NOT NULL,name TEXT NOT NULL,body TEXT NOT NULL,created INTEGER NOT NULL,deleted INTEGER NOT NULL DEFAULT 0,nonce TEXT NOT NULL,UNIQUE(pool,name,nonce))'),
 db.prepare('CREATE INDEX IF NOT EXISTS links_chat_pool ON links_chat_messages(pool,id)'),
 db.prepare('CREATE INDEX IF NOT EXISTS links_chat_rate ON links_chat_messages(pool,name,created)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_chat_reads(pool INTEGER,name TEXT,last_id INTEGER NOT NULL,PRIMARY KEY(pool,name))'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_chat_hidden(pool INTEGER,name TEXT,message INTEGER,PRIMARY KEY(pool,name,message))'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_chat_reactions(pool INTEGER,name TEXT,message INTEGER,emoji TEXT,PRIMARY KEY(pool,name,message,emoji))'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_chat_reports(pool INTEGER,name TEXT,message INTEGER,created INTEGER,PRIMARY KEY(pool,name,message))'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_chat_mutes(pool INTEGER,name TEXT,until INTEGER,PRIMARY KEY(pool,name))')
]);}
export async function onRequest({request,env}){try{
 if(!['GET','POST'].includes(request.method))return reply({error:'Method not allowed.'},405);
 const u=new URL(request.url),db=env.DB;if(!db)return reply({error:'Chat is unavailable.'},503);
 if(request.method==='POST'&&request.headers.get('Origin')!==u.origin)return reply({error:'Open chat on LINKS first.'},403);
 const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
 const s=await db.prepare('SELECT * FROM pool_sessions WHERE token=? AND expires_at>?').bind(token,new Date().toISOString()).first();
 if(!s)return reply({error:'Sign in to your pool to chat.'},401);
 if(u.searchParams.has('pool')&&String(s.pool_id)!==u.searchParams.get('pool'))return reply({error:'Open this pool from your locker room first.'},403);
 if(!await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND name=?').bind(s.pool_id,s.player_name).first())return reply({error:'You are no longer a member of this pool.'},403);
 await schema(db);const pool=s.pool_id,name=s.player_name,admin=s.role==='admin',now=Date.now();
 if(request.method==='POST'){
  const raw=await request.text();if(raw.length>8000)return reply({error:'Message is too long.'},400);let b;try{b=JSON.parse(raw)}catch{return reply({error:'Invalid request.'},400)}
  if(b.action==='send'){
   const body=String(b.text||'').trim(),nonce=String(b.nonce||'');if(!body||body.length>1000||!/^[a-zA-Z0-9-]{16,64}$/.test(nonce))return reply({error:'Enter a message of 1–1,000 characters.'},400);
   const old=await db.prepare('SELECT id FROM links_chat_messages WHERE pool=? AND name=? AND nonce=?').bind(pool,name,nonce).first();if(old)return reply({ok:true,id:old.id});
   const r=await db.prepare(`INSERT OR IGNORE INTO links_chat_messages(pool,name,body,created,nonce) SELECT ?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM links_chat_mutes WHERE pool=? AND name=? AND until>?) AND NOT EXISTS(SELECT 1 FROM links_chat_messages WHERE pool=? AND name=? AND created>?) AND (SELECT COUNT(*) FROM links_chat_messages WHERE pool=? AND name=? AND created>?)<10`).bind(pool,name,body,now,nonce,pool,name,now,pool,name,now-2000,pool,name,now-60000).run();
   if(!r.meta?.changes)return reply({error:'You are muted or sending too quickly. Please wait before trying again.'},429);
   return reply({ok:true});
  }
  if(b.action==='read'){
   const max=await db.prepare('SELECT COALESCE(MAX(id),0) AS id FROM links_chat_messages WHERE pool=?').bind(pool).first();const id=Math.max(0,Math.min(Number(b.id)||0,max.id));
   await db.prepare('INSERT INTO links_chat_reads(pool,name,last_id) VALUES(?,?,?) ON CONFLICT(pool,name) DO UPDATE SET last_id=MAX(last_id,excluded.last_id)').bind(pool,name,id).run();return reply({ok:true});
  }
  if(b.action==='mute'){
   if(!admin)return reply({error:'Only the commissioner can mute players.'},403);
   const target=String(b.name||'');if(target===name||!await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND name=?').bind(pool,target).first())return reply({error:'Choose another player in this pool.'},400);
   await db.prepare('INSERT INTO links_chat_mutes(pool,name,until) VALUES(?,?,?) ON CONFLICT(pool,name) DO UPDATE SET until=excluded.until').bind(pool,target,b.muted===false?0:now+86400000).run();return reply({ok:true});
  }
  const m=await db.prepare('SELECT id,name FROM links_chat_messages WHERE pool=? AND id=?').bind(pool,Number(b.id)||0).first();if(!m)return reply({error:'Message not found.'},404);
  if(b.action==='delete'){
   if(!admin&&m.name!==name)return reply({error:'Only your own messages can be deleted.'},403);
   await db.prepare("UPDATE links_chat_messages SET body='',deleted=1 WHERE pool=? AND id=?").bind(pool,m.id).run();
  }else if(b.action==='hide')await db.prepare('INSERT OR IGNORE INTO links_chat_hidden VALUES(?,?,?)').bind(pool,name,m.id).run();
  else if(b.action==='report')await db.prepare('INSERT OR IGNORE INTO links_chat_reports VALUES(?,?,?,?)').bind(pool,name,m.id,now).run();
  else if(b.action==='react'){
   if(!['🔥','😂','👏'].includes(b.emoji))return reply({error:'Choose a supported reaction.'},400);
   if(b.remove)await db.prepare('DELETE FROM links_chat_reactions WHERE pool=? AND name=? AND message=? AND emoji=?').bind(pool,name,m.id,b.emoji).run();
   else await db.prepare('INSERT OR IGNORE INTO links_chat_reactions VALUES(?,?,?,?)').bind(pool,name,m.id,b.emoji).run();
  }else return reply({error:'Unknown action.'},400);
  return reply({ok:true});
 }
 const unread=(await db.prepare(`SELECT COUNT(*) n FROM links_chat_messages m WHERE pool=? AND deleted=0 AND name<>? AND id>COALESCE((SELECT last_id FROM links_chat_reads WHERE pool=? AND name=?),0) AND NOT EXISTS(SELECT 1 FROM links_chat_hidden h WHERE h.pool=m.pool AND h.name=? AND h.message=m.id)`).bind(pool,name,pool,name,name).first()).n;
 if(u.searchParams.get('action')==='unread')return reply({unread,pool});
 const info=await db.prepare('SELECT name FROM pools WHERE id=?').bind(pool).first();
 const before=Number(u.searchParams.get('before'))||Number.MAX_SAFE_INTEGER;
 const messages=(await db.prepare(`SELECT id,name,body,created,deleted FROM links_chat_messages m WHERE pool=? AND id<? AND NOT EXISTS(SELECT 1 FROM links_chat_hidden h WHERE h.pool=m.pool AND h.name=? AND h.message=m.id) ORDER BY id DESC LIMIT 50`).bind(pool,before,name).all()).results.reverse();
 const ids=messages.map(m=>m.id);let reactions=[];if(ids.length)reactions=(await db.prepare(`SELECT message,emoji,COUNT(*) AS count,MAX(CASE WHEN name=? THEN 1 ELSE 0 END) AS mine FROM links_chat_reactions WHERE pool=? AND message IN (${ids.map(()=>'?').join(',')}) GROUP BY message,emoji`).bind(name,pool,...ids).all()).results;
 const reports=admin?(await db.prepare('SELECT r.message,r.name AS reporter,m.name,m.body,m.deleted FROM links_chat_reports r JOIN links_chat_messages m ON m.id=r.message AND m.pool=r.pool WHERE r.pool=? AND m.deleted=0 ORDER BY r.created DESC LIMIT 100').bind(pool).all()).results:[];
 const mutes=admin?(await db.prepare('SELECT name,until FROM links_chat_mutes WHERE pool=? AND until>?').bind(pool,now).all()).results:[];
 return reply({pool,poolName:info?.name||'Your pool',name,admin,unread,messages,reactions,reports,mutes});
 }catch{return reply({error:'Chat could not load. Please try again.'},503)}}
