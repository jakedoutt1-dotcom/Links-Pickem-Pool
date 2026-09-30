const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const hash=async(password,salt)=>btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+password)))));
export async function onRequestPost({request,env}){
 const db=env.DB;if(!db)return reply({error:'Service unavailable.'},503);
 const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
 if(!token)return reply({error:'Sign in before changing your password.'},401);
 const session=await db.prepare('SELECT * FROM pool_sessions WHERE token=?').bind(token).first();
 if(!session||!Number.isFinite(Date.parse(session.expires_at))||Date.parse(session.expires_at)<=Date.now())return reply({error:'Your session expired. Sign in again.'},401);
 let b;try{b=await request.json()}catch{return reply({error:'Invalid request.'},400)}
 const current=String(b.currentPassword||''),next=String(b.newPassword||'');
 if(next.length<8||next.length>256||current.length>256)return reply({error:'Use a new password of 8–256 characters.'},400);
 if(next!==b.confirmPassword)return reply({error:'The new passwords do not match.'},400);
 if(current===next)return reply({error:'Choose a different password.'},400);
 const row=await db.prepare('SELECT name,password_hash,salt FROM pool_players WHERE pool_id=? AND lower(name)=lower(?)').bind(session.pool_id,session.player_name).first();
 if(!row||await hash(current,row.salt)!==row.password_hash)return reply({error:'Current password is incorrect.'},403);
 const salt=crypto.randomUUID(),digest=await hash(next,salt);
 const result=await db.batch([
 db.prepare('UPDATE pool_players SET password_hash=?,salt=? WHERE pool_id=? AND name=? AND password_hash=?').bind(digest,salt,session.pool_id,row.name,row.password_hash),
 db.prepare('DELETE FROM pool_sessions WHERE pool_id=? AND lower(player_name)=lower(?) AND token<>? AND EXISTS(SELECT 1 FROM pool_players WHERE pool_id=? AND name=? AND password_hash=?)').bind(session.pool_id,row.name,token,session.pool_id,row.name,digest)
 ]);
 if(!result[0].meta?.changes)return reply({error:'Password changed elsewhere. Please sign in again.'},409);
 return reply({success:true});
}
