const te=new TextEncoder();
const json=(d,s=200)=>Response.json(d,{status:s,headers:{"Cache-Control":"no-store"}});
function b64(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes)))}
async function hashPassword(password,salt){return b64(await crypto.subtle.digest("SHA-256",te.encode(salt+":"+password)))}
function newSalt(){const a=new Uint8Array(16);crypto.getRandomValues(a);return b64(a)}
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]||c));
const emailCfg=env=>({key:String(env.RESEND_API_KEY||env.RESEND_KEY||"").trim(),from:String(env.RESEND_FROM_EMAIL||env.LINKS_EMAIL_FROM||env.EMAIL_FROM||"noreply@linkspickempools.com").trim()});
async function sendMail(env,to,subject,html){const cfg=emailCfg(env);if(!cfg.key)return {sent:false,reason:"RESEND_API_KEY_MISSING"};try{const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+cfg.key,"Content-Type":"application/json"},body:JSON.stringify({from:"Links Pickem Pools <"+cfg.from+">",to:[to],subject,html})});const raw=await r.text();let d={};try{d=JSON.parse(raw)}catch{}return r.ok&&d.id?{sent:true,id:d.id}:{sent:false,reason:String(d.message||raw||("HTTP "+r.status)).slice(0,300)}}catch(e){return {sent:false,reason:String(e?.message||e).slice(0,300)}}}
function setupHtml({origin,poolName,player,url}){return '<!doctype html><html><body style="margin:0;background:#090d11;font-family:Arial,sans-serif;color:#fff"><div style="max-width:650px;margin:auto;padding:24px"><div style="text-align:center;background:#111820;border:1px solid #333f48;border-radius:14px 14px 0 0;padding:18px"><img src="https://linkspickempools.com/app-logo.png" alt="LINKS Pickem Pools" style="max-width:260px;width:65%;height:auto"><div style="margin-top:8px;color:#aeb9c3;font-size:11px;font-weight:900;letter-spacing:1.5px">YOU PICK • WE TRACK • YOU WIN</div></div><div style="background:#10171d;border:1px solid #333f48;border-top:0;border-radius:0 0 14px 14px;padding:26px"><div style="color:#ff741f;font-size:12px;font-weight:900;letter-spacing:2px">YOUR PLAYER SPOT IS READY</div><h1 style="margin:8px 0;color:#fff">'+esc(poolName)+'</h1><p style="color:#e7edf1;line-height:1.7">Hi <b>'+esc(player)+'</b>. Your commissioner sent you a private LINKS login setup link.</p><p style="color:#e7edf1;line-height:1.7">Tap the button below, choose the password you want to use for this pool, then sign in and keep playing from your existing player spot.</p><p style="text-align:center;margin:26px 0"><a href="'+esc(url)+'" style="display:inline-block;background:#ff5f17;color:#fff;padding:16px 30px;border-radius:9px;text-decoration:none;font-weight:900">CHOOSE MY PASSWORD</a></p><p style="color:#9fabb4;font-size:12px">For your security, this private setup link can be used one time.</p><div style="border-top:1px solid #303b44;padding-top:14px;color:#9fabb4;font-size:12px">LINKS PICK’EM POOLS • YOU PICK • WE TRACK • YOU WIN</div></div></div></body></html>'}
async function ensureAccess(db){await db.prepare("CREATE TABLE IF NOT EXISTS newbuild_player_access(pool_id INTEGER NOT NULL,player_name TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'active',PRIMARY KEY(pool_id,player_name))").run()}
async function resolvePool(db,value,nameHint="",codeHint=""){
  const raw=String(value||"").trim(),name=String(nameHint||"").trim(),code=String(codeHint||"").trim();
  let p=null;
  if(raw&&/^\d+$/.test(raw))p=await db.prepare("SELECT id,code,name FROM pools WHERE id=? LIMIT 1").bind(Number(raw)).first();
  if(!p&&code)p=await db.prepare("SELECT id,code,name FROM pools WHERE upper(code)=upper(?) LIMIT 1").bind(code).first();
  if(!p&&name)p=await db.prepare("SELECT id,code,name FROM pools WHERE lower(trim(name))=lower(trim(?)) LIMIT 1").bind(name).first();
  if(!p&&raw)p=await db.prepare("SELECT id,code,name FROM pools WHERE upper(code)=upper(?) OR lower(trim(name))=lower(trim(?)) LIMIT 1").bind(raw,raw).first();
  return p;
}
async function commissionerName(db,poolId){
  const r=await db.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='commissioner_player_name' LIMIT 1").bind(poolId).first();
  return String(r?.value||"").trim();
}
export async function onRequestGet({request,env}){
  const db=env.DB;if(!db)return json({success:false,error:"Legacy LINKS database binding DB is unavailable",build:"634"},503);
  await ensureAccess(db);
  const q=new URL(request.url).searchParams,p=await resolvePool(db,q.get("pool"),q.get("name"),q.get("code"));
  if(!p)return json({success:false,error:"Pool not found"},404);
  const comm=(await commissionerName(db,p.id)).toLowerCase();
  const {results=[]}=await db.prepare("SELECT pp.name,COALESCE(a.status,'active') status,COALESCE(c.email,'') email,(SELECT last_login_at FROM pool_login_activity l WHERE l.pool_id=pp.pool_id AND lower(l.player_name)=lower(pp.name) LIMIT 1) last_login FROM pool_players pp LEFT JOIN newbuild_player_access a ON a.pool_id=pp.pool_id AND lower(a.player_name)=lower(pp.name) LEFT JOIN pool_player_contacts c ON c.pool_id=pp.pool_id AND lower(c.player_name)=lower(pp.name) WHERE pp.pool_id=? ORDER BY pp.rowid").bind(p.id).all();
  return json({success:true,resolvedPoolId:String(p.id),poolName:p.name,poolCode:p.code,members:results.map(x=>({playerId:x.name,displayName:x.name,email:x.email||"",role:String(x.name).toLowerCase()===comm?"commissioner":"player",status:x.status||"active",lastLogin:x.last_login||null})),dataSource:"legacy-production-DB",build:"634"});
}
export async function onRequestPost({request,env}){
  const db=env.DB;if(!db)return json({success:false,error:"Legacy LINKS database binding DB is unavailable",build:"634"},503);
  await ensureAccess(db);
  let b;try{b=await request.json()}catch{return json({success:false,error:"Invalid request"},400)}
  const p=await resolvePool(db,b.pool,b.poolName,b.poolCode);if(!p)return json({success:false,error:"Pool not found"},404);
  const action=String(b.action||"");
  if(action==="login"){
    const name=String(b.player||b.name||"").trim(),password=String(b.password||"");
    const row=await db.prepare("SELECT name,password_hash,salt FROM pool_players WHERE pool_id=? AND lower(name)=lower(?) LIMIT 1").bind(p.id,name).first();
    const access=await db.prepare("SELECT status FROM newbuild_player_access WHERE pool_id=? AND lower(player_name)=lower(?) LIMIT 1").bind(p.id,name).first();
    if(!row||String(access?.status||"active")==="pending"||await hashPassword(password,row.salt)!==row.password_hash)return json({success:false,error:"Incorrect name or password."},401);
    const comm=await commissionerName(db,p.id),role=comm&&comm.toLowerCase()===String(row.name).toLowerCase()?"commissioner":"player";
    try{const token=crypto.randomUUID()+crypto.randomUUID().replaceAll("-",""),exp=new Date(Date.now()+30*24*60*60*1000).toISOString();await db.prepare("INSERT INTO pool_sessions(token,pool_id,player_name,role,expires_at) VALUES(?,?,?,?,?)").bind(token,p.id,row.name,role==="commissioner"?"admin":"player",exp).run()}catch{}
    const loggedInAt=new Date().toISOString();try{await db.prepare("INSERT INTO pool_login_activity(pool_id,player_name,login_count,first_login_at,last_login_at) VALUES(?,?,1,?,?) ON CONFLICT(pool_id,player_name) DO UPDATE SET login_count=pool_login_activity.login_count+1,last_login_at=excluded.last_login_at").bind(p.id,row.name,loggedInAt,loggedInAt).run()}catch{}
    return json({success:true,resolvedPoolId:String(p.id),poolName:p.name,poolCode:p.code,player:{id:row.name,displayName:row.name,email:"",role,lastLogin:loggedInAt},dataSource:"legacy-production-DB",build:"634"});
  }
  if(action==="addPlayer"){
    const name=String(b.name||"").trim(),password=String(b.password||"");if(!name||password.length<4)return json({success:false,error:"Player name and temporary password of at least 4 characters required"},400);
    const exists=await db.prepare("SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?) LIMIT 1").bind(p.id,name).first();if(exists)return json({success:false,error:"That player already exists in this pool."},409);
    const salt=newSalt(),hash=await hashPassword(password,salt);await db.prepare("INSERT INTO pool_players(pool_id,name,password_hash,salt) VALUES(?,?,?,?)").bind(p.id,name,hash,salt).run();
    if(String(b.email||"").trim())try{await db.prepare("INSERT INTO pool_player_contacts(pool_id,player_name,email,phone) VALUES(?,?,?,'') ON CONFLICT(pool_id,player_name) DO UPDATE SET email=excluded.email").bind(p.id,name,String(b.email).trim().toLowerCase()).run()}catch{}
    return json({success:true,resolvedPoolId:String(p.id),player:{id:name,name,status:"active"},build:"634"});
  }
  if(action==="bulkAddPlayers"){
    const names=(Array.isArray(b.names)?b.names:[]).map(x=>String(x||"").trim()).filter(Boolean),password=String(b.password||"");if(!names.length||password.length<4)return json({success:false,error:"Player names and temporary password required"},400);
    const out=[];for(const name of names){let row=await db.prepare("SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?) LIMIT 1").bind(p.id,name).first();if(!row){const salt=newSalt(),hash=await hashPassword(password,salt);await db.prepare("INSERT INTO pool_players(pool_id,name,password_hash,salt) VALUES(?,?,?,?)").bind(p.id,name,hash,salt).run()}else{const salt=newSalt(),hash=await hashPassword(password,salt);await db.prepare("UPDATE pool_players SET password_hash=?,salt=? WHERE pool_id=? AND lower(name)=lower(?)").bind(hash,salt,p.id,name).run()}out.push({id:name,name,existing:!!row})}
    return json({success:true,count:out.length,players:out,resolvedPoolId:String(p.id),build:"634"});
  }
  if(action==="setPassword"||action==="resetPassword"){
    const name=String(b.player||b.name||"").trim(),password=String(b.password||"");if(!name||password.length<4)return json({success:false,error:"Player and password of at least 4 characters required"},400);
    const salt=newSalt(),hash=await hashPassword(password,salt),r=await db.prepare("UPDATE pool_players SET password_hash=?,salt=? WHERE pool_id=? AND lower(name)=lower(?)").bind(hash,salt,p.id,name).run();return r.meta?.changes?json({success:true,resolvedPoolId:String(p.id),build:"634"}):json({success:false,error:"Player not found"},404);
  }
  if(action==="setStatus"){
    const name=String(b.player||b.name||"").trim(),status=String(b.status||"").toLowerCase();if(!name||!["active","pending"].includes(status))return json({success:false,error:"Player and valid status required"},400);
    await db.prepare("INSERT INTO newbuild_player_access(pool_id,player_name,status) VALUES(?,?,?) ON CONFLICT(pool_id,player_name) DO UPDATE SET status=excluded.status").bind(p.id,name,status).run();return json({success:true,status,resolvedPoolId:String(p.id),build:"634"});
  }
  if(action==="sendSetupEmail"){
    const name=String(b.player||b.name||"").trim(),email=String(b.email||"").trim().toLowerCase();if(!name||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return json({success:false,error:"Player and valid email required"},400);
    const row=await db.prepare("SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?) LIMIT 1").bind(p.id,name).first();if(!row)return json({success:false,error:"Player not found"},404);
    try{await db.prepare("INSERT INTO pool_player_contacts(pool_id,player_name,email,phone) VALUES(?,?,?,'') ON CONFLICT(pool_id,player_name) DO UPDATE SET email=excluded.email").bind(p.id,row.name,email).run()}catch{}
    const token=crypto.randomUUID()+crypto.randomUUID().replaceAll("-",""),now=new Date().toISOString();
    await db.prepare("INSERT INTO pool_player_setup_invites(token,pool_id,player_name,email,status,created_at) VALUES(?,?,?,?,'PENDING',?)").bind(token,p.id,row.name,email,now).run();
    const origin=String(env.LINKS_BASE_URL||new URL(request.url).origin).replace(/\/+$/,""),url=origin+"/join?setup="+encodeURIComponent(token),delivery=await sendMail(env,email,"Choose your LINKS password — "+p.name,setupHtml({origin,poolName:p.name,player:row.name,url}));
    return json({success:true,sent:delivery.sent,url,email,player:row.name,emailDelivery:delivery,resolvedPoolId:String(p.id),build:"634"});
  }
  return json({success:false,error:"Unknown player action"},400);
}