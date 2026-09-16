function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json;charset=UTF-8','cache-control':'no-store'}})}
async function session(request,DB){const h=request.headers.get('authorization')||'';const token=h.startsWith('Bearer ')?h.slice(7):'';if(!token)return null;return DB.prepare("SELECT pool_id,player_name,role,expires_at FROM pool_sessions WHERE token=? AND expires_at>?").bind(token,new Date().toISOString()).first()}
export async function onRequest(context){
 const {request,env}=context,DB=env.DB;if(!DB)return json({error:'Database unavailable.'},500);
 const s=await session(request,DB);if(!s)return json({error:'Please sign in.'},401);
 let player=String(s.player_name||'').trim();
 if(s.role==='admin'&&(!player||player==='Commissioner')){const r=await DB.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='commissioner_player_name'").bind(s.pool_id).first();player=String(r?.value||'').trim()}
 if(!player)return json({error:'Player profile is not linked to this sign-in.'},400);
 await DB.prepare("CREATE TABLE IF NOT EXISTS pool_player_contacts (pool_id INTEGER NOT NULL,player_name TEXT NOT NULL,email TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',PRIMARY KEY(pool_id,player_name))").run();
 if(request.method==='GET'){
  const c=await DB.prepare("SELECT email,phone FROM pool_player_contacts WHERE pool_id=? AND player_name=? COLLATE NOCASE").bind(s.pool_id,player).first();
  return json({player,email:c?.email||'',phone:c?.phone||''});
 }
 if(request.method==='POST'){
  let body={};try{body=await request.json()}catch(e){}
  const email=String(body.email||'').trim().toLowerCase(),phone=String(body.phone||'').trim();
  if(email&&!/^\S+@\S+\.\S+$/.test(email))return json({error:'Check the email address.'},400);
  await DB.prepare("INSERT INTO pool_player_contacts(pool_id,player_name,email,phone) VALUES(?,?,?,?) ON CONFLICT(pool_id,player_name) DO UPDATE SET email=excluded.email,phone=excluded.phone").bind(s.pool_id,player,email,phone).run();
  return json({ok:true,player,email,phone});
 }
 return json({error:'Method not allowed.'},405);
}