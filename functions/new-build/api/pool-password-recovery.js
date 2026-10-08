import {ensureIdentity,identityRate,identityChallenge,consumeIdentityChallenge} from '../../lib/player-identity.js';
import {findLoginPlayer} from '../../lib/player-login-name.js';
const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const digest=async text=>btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))));
export async function onRequestPost({request,env}){
 const db=env.DB;if(!db)return reply({error:'Recovery is temporarily unavailable.'},503);
 if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Invalid origin.'},403);
 try{
 await ensureIdentity(db);await identityRate(request,db,'old-pool-recovery');
 const text=await request.text();if(text.length>2048)return reply({error:'Request too large.'},400);const b=JSON.parse(text);
 if(b.action==='request'){
 const email=String(b.email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return reply({error:'Enter your saved email address.'},400);
 const player=await findLoginPlayer(db,Number(b.pool),String(b.player||''));
 const generic=()=>reply({challenge:crypto.randomUUID()+crypto.randomUUID(),message:'If this email matches your player, a code has been sent. If no email was saved, ask your commissioner to reset your pool password.'});
 if(!player)return generic();
 if(await db.prepare('SELECT id FROM links_id_members WHERE pool_id=? AND player_name=?').bind(player.pool_id,player.name).first())return reply({error:'You already set up your LINKS login. Use Forgot password on the new login instead.',useNewLogin:true},409);
 await db.prepare("CREATE TABLE IF NOT EXISTS pool_player_contacts(pool_id INTEGER NOT NULL,player_name TEXT NOT NULL,email TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',PRIMARY KEY(pool_id,player_name))").run();
 const contact=await db.prepare('SELECT email FROM pool_player_contacts WHERE pool_id=? AND player_name=?').bind(player.pool_id,player.name).first();
 if(String(contact?.email||'').trim().toLowerCase()!==email)return generic();
 const access=await db.prepare('SELECT status FROM newbuild_player_access WHERE pool_id=? AND player_name=?').bind(player.pool_id,player.name).first();if(access?.status==='pending')return generic();
 return await identityChallenge(db,{type:'pool-reset',email,poolId:player.pool_id,playerName:player.name,credential:await digest(player.salt+':'+player.password_hash)},env,request);
 }
 if(b.action==='reset'){
 const password=String(b.password||'');if(password.length<8||password.length>256)return reply({error:'Use a password of 8–256 characters.'},400);
 const p=await consumeIdentityChallenge(db,b);if(p.type!=='pool-reset')return reply({error:'Request a pool password recovery code.'},400);
 const player=await db.prepare('SELECT * FROM pool_players WHERE pool_id=? AND name=?').bind(p.poolId,p.playerName).first();
 if(!player||await digest(player.salt+':'+player.password_hash)!==p.credential)return reply({error:'Your pool login changed. Request a new code.'},409);
 const salt=crypto.randomUUID(),hash=await digest(salt+':'+password);
 const result=await db.batch([
 db.prepare("UPDATE pool_players SET salt=?,password_hash=? WHERE pool_id=? AND name=? AND password_hash=? AND NOT EXISTS(SELECT 1 FROM links_id_members WHERE pool_id=? AND player_name=?) AND NOT EXISTS(SELECT 1 FROM newbuild_player_access WHERE pool_id=? AND player_name=? AND status='pending')").bind(salt,hash,p.poolId,p.playerName,player.password_hash,p.poolId,p.playerName,p.poolId,p.playerName),
 db.prepare('DELETE FROM pool_sessions WHERE pool_id=? AND player_name=? AND EXISTS(SELECT 1 FROM pool_players WHERE pool_id=? AND name=? AND password_hash=?)').bind(p.poolId,p.playerName,p.poolId,p.playerName,hash)
 ]);
 if(!result[0].meta?.changes)return reply({error:'Your account changed. Return to login or ask your commissioner for help.'},409);
 return reply({ok:true});
 }
 return reply({error:'Unknown recovery action.'},400);
 }catch(e){if(e.status)return reply({error:e.message},e.status);return reply({error:'Recovery is temporarily unavailable. Please try again.'},503)}
}
