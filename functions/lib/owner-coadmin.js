import {ownerSession} from './owner-auth.js';
import {ensureIdentity} from './player-identity.js';
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function ownerCoadmin(request,db,body){
 if(!await ownerSession(request,db))return json({error:'LINKS Owner Admin sign-in required.'},401);
 if(request.headers.get('Origin')&&request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Open LINKS Owner Admin before continuing.'},403);
 const pool=await db.prepare('SELECT id,code,name FROM pools WHERE id=?').bind(Number(body.pool)).first();if(!pool)return json({error:'Pool not found.'},404);
 await ensureIdentity(db);
 const primary=await db.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='commissioner_player_name'").bind(pool.id).first();
 const members=(await db.prepare("SELECT m.account_id,m.player_name,a.username,a.display_name,CASE WHEN s.value='1' THEN 1 ELSE 0 END AS coadmin FROM links_id_members m JOIN links_id_accounts a ON a.id=m.account_id JOIN pool_players p ON p.pool_id=m.pool_id AND p.name=m.player_name LEFT JOIN pool_settings s ON s.pool_id=m.pool_id AND s.key='coadmin_account:'||m.account_id WHERE m.pool_id=? ORDER BY a.username").bind(pool.id).all()).results||[];
 if(body.action==='coadmin-preview')return json({pool,primary:primary?.value||null,members});
 if(body.confirm!==true)return json({error:'Confirm adding a co-admin while preserving the current commissioner.'},400);
 const target=members.find(m=>m.account_id===body.accountId);if(!target)return json({error:'Choose an existing verified account in this pool.'},400);
 if(primary?.value?.toLowerCase()===target.player_name.toLowerCase())return json({error:'This player is already the primary commissioner.'},409);
 // Only additive, exact-account updates. Never change the commissioner setting,
 // pool ownership, passwords, existing admin roles, picks, or access payments.
 await db.batch([
  db.prepare("INSERT INTO pool_settings(pool_id,key,value) VALUES(?,?,'1') ON CONFLICT(pool_id,key) DO UPDATE SET value='1'").bind(pool.id,'coadmin_account:'+target.account_id),
  db.prepare("UPDATE links_id_members SET role='admin' WHERE pool_id=? AND account_id=? AND player_name=?").bind(pool.id,target.account_id,target.player_name),
  db.prepare("UPDATE pool_sessions SET role='admin' WHERE pool_id=? AND player_name=?").bind(pool.id,target.player_name),
  db.prepare('INSERT INTO pool_settings(pool_id,key,value) VALUES(?,?,?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value').bind(pool.id,'coadmin_added:'+target.account_id,JSON.stringify({username:target.username,player:target.player_name,at:new Date().toISOString(),by:'LINKS Owner Admin'}))
 ]);
 return json({ok:true,pool,username:target.username,player:target.player_name,primary:primary?.value||null});
}
