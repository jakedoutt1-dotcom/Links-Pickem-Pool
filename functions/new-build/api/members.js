const te=new TextEncoder();
const json=(d,s=200)=>Response.json(d,{status:s,headers:{"Cache-Control":"no-store"}});
function b64(bytes){return btoa(String.fromCharCode(...new Uint8Array(bytes)))}
async function hashPassword(password,salt){return b64(await crypto.subtle.digest("SHA-256",te.encode(salt+":"+password)))}
function newSalt(){const a=new Uint8Array(16);crypto.getRandomValues(a);return b64(a)}
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
  const {results=[]}=await db.prepare("SELECT pp.name,COALESCE(a.status,'active') status FROM pool_players pp LEFT JOIN newbuild_player_access a ON a.pool_id=pp.pool_id AND lower(a.player_name)=lower(pp.name) WHERE pp.pool_id=? ORDER BY pp.rowid").bind(p.id).all();
  return json({success:true,resolvedPoolId:String(p.id),poolName:p.name,poolCode:p.code,members:results.map(x=>({playerId:x.name,displayName:x.name,email:"",role:String(x.name).toLowerCase()===comm?"commissioner":"player",status:x.status||"active"})),dataSource:"legacy-production-DB",build:"634"});
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
    return json({success:true,resolvedPoolId:String(p.id),poolName:p.name,poolCode:p.code,player:{id:row.name,displayName:row.name,email:"",role},dataSource:"legacy-production-DB",build:"634"});
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
  return json({success:false,error:"Unknown player action"},400);
}