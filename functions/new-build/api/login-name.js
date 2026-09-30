import {ensureLoginNames} from '../../lib/player-login-name.js';
const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){
 const db=env.DB;if(!db)return reply({error:'Service unavailable.'},503);
 const token=(request.headers.get('Authorization')||'').replace(/^Bearer /,'');
 const session=token?await db.prepare('SELECT * FROM pool_sessions WHERE token=?').bind(token).first():null;
 if(!session||!Number.isFinite(Date.parse(session.expires_at))||Date.parse(session.expires_at)<=Date.now())return reply({error:'Sign in again to manage your login name.'},401);
 await ensureLoginNames(db);
 if(request.method==='GET'){const row=await db.prepare('SELECT login_name FROM pool_login_names WHERE pool_id=? AND player_name=?').bind(session.pool_id,session.player_name).first();const names=await db.prepare('SELECT player_name,display_name FROM pool_display_names WHERE pool_id=?').bind(session.pool_id).all();return reply({loginName:row?.login_name||session.player_name,displayName:names.results.find(x=>x.player_name===session.player_name)?.display_name||session.player_name,names:names.results})}
 if(request.method!=='POST')return reply({error:'Method not allowed.'},405);
 let body;try{body=await request.json()}catch{return reply({error:'Invalid request.'},400)}
 const display=String(body.displayName||session.player_name).trim();if(display.length<2||display.length>60||/[\x00-\x1f\x7f]/.test(display))return reply({error:'Use a player name of 2–60 characters.'},400);
 const name=String(body.loginName||'').trim(),password=String(body.currentPassword||'');
 if(name.length<2||name.length>60||/[\x00-\x1f\x7f]/.test(name))return reply({error:'Use a login name of 2–60 characters.'},400);
 if(password.length>256)return reply({error:'Current password is incorrect.'},403);
 const me=await db.prepare('SELECT * FROM pool_players WHERE pool_id=? AND name=?').bind(session.pool_id,session.player_name).first();
 const digest=me?btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(me.salt+':'+password))))):'';
 if(!me||digest!==me.password_hash)return reply({error:'Current password is incorrect.'},403);
 const duplicate=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?) AND name<>?').bind(session.pool_id,name,me.name).first();
 const displayDuplicate=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?) AND name<>?').bind(session.pool_id,display,me.name).first();
 if(duplicate||displayDuplicate)return reply({error:'That login name is already used in this pool.'},409);
 try{await db.batch([db.prepare('INSERT INTO pool_login_names(pool_id,player_name,login_name) VALUES(?,?,?) ON CONFLICT(pool_id,player_name) DO UPDATE SET login_name=excluded.login_name').bind(session.pool_id,me.name,name),db.prepare('INSERT INTO pool_display_names(pool_id,player_name,display_name) VALUES(?,?,?) ON CONFLICT(pool_id,player_name) DO UPDATE SET display_name=excluded.display_name').bind(session.pool_id,me.name,display)])}catch(e){if(/unique/i.test(e.message))return reply({error:'That login name is already used in this pool.'},409);throw e}
 return reply({success:true,loginName:name,displayName:display});
}
