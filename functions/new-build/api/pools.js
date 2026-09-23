const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
async function ensureSchema(db){await db.batch([
 db.prepare("CREATE TABLE IF NOT EXISTS pools(id TEXT PRIMARY KEY,code TEXT UNIQUE NOT NULL,name TEXT NOT NULL,commissioner_email TEXT NOT NULL,phone TEXT,active INTEGER DEFAULT 1,created_at TEXT NOT NULL)"),
 db.prepare("CREATE TABLE IF NOT EXISTS pool_games(pool_id TEXT NOT NULL,game TEXT NOT NULL,PRIMARY KEY(pool_id,game))"),
 db.prepare("CREATE TABLE IF NOT EXISTS players(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,display_name TEXT,created_at TEXT NOT NULL)"),
 db.prepare("CREATE TABLE IF NOT EXISTS memberships(pool_id TEXT NOT NULL,player_id TEXT NOT NULL,role TEXT DEFAULT 'player',status TEXT DEFAULT 'active',joined_at TEXT NOT NULL,PRIMARY KEY(pool_id,player_id))"),
 db.prepare("CREATE TABLE IF NOT EXISTS pool_game_settings(pool_id TEXT NOT NULL,game_type TEXT NOT NULL,period_key TEXT NOT NULL,lock_at TEXT,PRIMARY KEY(pool_id,game_type,period_key))"),
 db.prepare("CREATE TABLE IF NOT EXISTS picks(id TEXT PRIMARY KEY,pool_id TEXT NOT NULL,player_id TEXT NOT NULL,game_type TEXT NOT NULL,period_key TEXT NOT NULL,event_id TEXT NOT NULL,selection TEXT NOT NULL,points INTEGER,locked_at TEXT,saved_at TEXT NOT NULL,UNIQUE(pool_id,player_id,game_type,period_key,event_id))"),
 db.prepare("CREATE TABLE IF NOT EXISTS invites(id TEXT PRIMARY KEY,pool_id TEXT NOT NULL,email TEXT NOT NULL,token TEXT UNIQUE NOT NULL,status TEXT DEFAULT 'pending',created_at TEXT NOT NULL,accepted_at TEXT)")
]);}

export async function onRequestGet({request,env}){
 const db=env.LINKS_DB||env.DB;if(!db)return json({success:false,code:"DB_NOT_AVAILABLE",error:"LINKS database is not available"},503);try{await ensureSchema(db)}catch(e){return json({success:false,error:"LINKS database setup unavailable",detail:String(e?.message||e)},500)}
 const q=new URL(request.url).searchParams,code=(q.get("code")||"").trim().toUpperCase(),id=(q.get("id")||"").trim();
 if(!code&&!id)return json({success:false,error:"Pool code or id required"},400);
 try{const pool=await db.prepare("SELECT id,code,name,active,created_at AS createdAt FROM pools WHERE "+(id?"id=?":"upper(code)=?")+" LIMIT 1").bind(id||code).first();
 if(!pool)return json({success:false,error:"Pool not found"},404);
 const {results=[]}=await db.prepare("SELECT game FROM pool_games WHERE pool_id=? ORDER BY game").bind(pool.id).all();
 return json({success:true,pool:{...pool,games:results.map(x=>x.game),game:results[0]?.game||"",role:"player"}})}catch(e){return json({success:false,error:"Pool lookup unavailable"},500)}
}
export async function onRequestPost({request,env}){
 const db=env.LINKS_DB||env.DB;if(!db)return json({success:false,code:"DB_NOT_AVAILABLE",error:"LINKS database is not available"},503);try{await ensureSchema(db)}catch(e){return json({success:false,error:"LINKS database setup unavailable",detail:String(e?.message||e)},500)}
 let b;try{b=await request.json()}catch{return json({success:false,error:"Invalid request"},400)}
 const name=String(b.name||"").trim(),email=String(b.email||"").trim().toLowerCase(),phone=String(b.phone||"").trim(),games=[...new Set((Array.isArray(b.games)?b.games:[]).map(x=>String(x).trim()).filter(Boolean))];
 if(!name||!email||!games.length)return json({success:false,error:"Name, commissioner email and game required"},400);
 if(games.length>10)return json({success:false,error:"Too many game types selected"},400);
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return json({success:false,error:"Valid email required"},400);
 try{const row=await db.prepare("SELECT COUNT(*) AS n FROM pools WHERE lower(commissioner_email)=? AND active=1").bind(email).first();if(Number(row?.n||0)>=3)return json({success:false,code:"FREE_POOL_LIMIT",error:"Your three free active commissioner pools are already in use. Archive one before creating another active pool."},409)}catch(e){return json({success:false,error:"Could not verify free-pool eligibility"},500)}
 const id=crypto.randomUUID(),code="LNK-"+crypto.randomUUID().replace(/-/g,"").slice(0,7).toUpperCase(),now=new Date().toISOString();
 try{await db.prepare("INSERT INTO pools(id,code,name,commissioner_email,phone,active,created_at) VALUES(?,?,?,?,?,1,?)").bind(id,code,name,email,phone,now).run();
 for(const game of games)await db.prepare("INSERT INTO pool_games(pool_id,game) VALUES(?,?)").bind(id,game).run();
 let player=await db.prepare("SELECT id FROM players WHERE lower(email)=? LIMIT 1").bind(email).first();
 const playerId=player?.id||crypto.randomUUID();
 if(!player)await db.prepare("INSERT INTO players(id,email,display_name,created_at) VALUES(?,?,?,?)").bind(playerId,email,name+" Commissioner",now).run();
 await db.prepare("INSERT INTO memberships(pool_id,player_id,role,status,joined_at) VALUES(?,?,'commissioner','active',?) ON CONFLICT(pool_id,player_id) DO UPDATE SET role='commissioner',status='active'").bind(id,playerId,now).run();
 return json({success:true,pool:{id,code,name,email,phone,games,game:games[0],role:"commissioner",active:true,createdAt:now},playerId},201)}catch(e){console.error("pool-create",e);return json({success:false,error:"Pool creation unavailable"},500)}
}
export async function onRequestPatch({request,env}){const db=env.LINKS_DB||env.DB;if(!db)return json({success:false,code:"DB_NOT_AVAILABLE",error:"LINKS database is not available"},503);try{await ensureSchema(db)}catch(e){return json({success:false,error:"LINKS database setup unavailable",detail:String(e?.message||e)},500)}let b;try{b=await request.json()}catch{return json({success:false,error:"Invalid request"},400)}const id=String(b.id||""),active=b.active===true?1:b.active===false?0:null;if(!id||active===null)return json({success:false,error:"Pool id and active state required"},400);try{const r=await db.prepare("UPDATE pools SET active=? WHERE id=?").bind(active,id).run();if(!r.meta?.changes)return json({success:false,error:"Pool not found"},404);return json({success:true,id,active:Boolean(active)})}catch{return json({success:false,error:"Pool update unavailable"},500)}}