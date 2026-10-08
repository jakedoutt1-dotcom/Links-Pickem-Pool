import {grantPackage} from '../../lib/owner-package-grant.js';
import {ownerPoolDelete} from '../../lib/owner-pool-delete.js';
import {ensureOwner,ownerHash,ownerPasswordOk,ownerAttempt,ownerSession} from '../../lib/owner-auth.js';
import {ensureAccounts,emailKey,allowance} from '../../lib/commissioner-account.js';
import {ensureLoginActivity} from '../../lib/login-activity.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){const db=env.DB;if(!db)return json({error:'Database unavailable.'},503);await ensureOwner(db);
 if(request.method==='POST'){
 let b;try{b=await request.json()}catch{return json({error:'Invalid request.'},400)}
 if(b.action==='grant-package')return grantPackage(request,db,b);
 if(['delete-preview','delete-pool'].includes(b.action)){try{return await ownerPoolDelete(request,db,b)}catch(error){console.error('Owner pool deletion failed',error);return json({error:'Pool deletion could not be completed. Refresh LINKS Admin and try again. If this continues, the server needs attention.'},503)}}
 if(b.action==='logout'){const s=await ownerSession(request,db);if(s)await db.prepare('DELETE FROM links_admin_sessions WHERE token=?').bind(s.token).run();return json({ok:true})}
 if(!['login','password'].includes(b.action))return json({error:'Unknown action.'},400);
 if(!await ownerAttempt(request,db))return json({error:'Too many attempts. Try again in 15 minutes.'},429);
 if(!await ownerPasswordOk(db,b.password))return json({error:'Incorrect owner password.'},401);
 if(b.action==='password'){
 const password=String(b.newPassword||'');if(password.length<12||password.length>256)return json({error:'Use a new password of 12–256 characters.'},400);
 if(password===b.password)return json({error:'Choose a different password.'},400);
 const salt=crypto.randomUUID(),hash=await ownerHash(password,salt);
 await db.batch([db.prepare('INSERT INTO links_owner_password(id,salt,hash) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET salt=excluded.salt,hash=excluded.hash').bind(salt,hash),db.prepare('DELETE FROM links_admin_sessions')]);return json({ok:true});
 }
 const configured=await db.prepare('SELECT id FROM links_owner_password WHERE id=1').first();if(!configured)return json({setupRequired:true});
 const token=crypto.randomUUID()+crypto.randomUUID();await db.prepare('INSERT INTO links_admin_sessions(token,expires_at) VALUES(?,?)').bind(token,new Date(Date.now()+12*36e5).toISOString()).run();return json({token});
 }
 if(request.method!=='GET')return json({error:'Method not allowed.'},405);
 if(!await ownerSession(request,db))return json({error:'Owner sign-in required.'},401);
 await ensureAccounts(db);await ensureLoginActivity(db);
 const rows=async query=>(await db.prepare(query).all()).results||[];
 const pools=await rows('SELECT p.id,p.code,p.name,p.created_at,(SELECT COUNT(*) FROM pool_players pp WHERE pp.pool_id=p.id) player_count FROM pools p ORDER BY lower(p.name)');
 const owners=await rows('SELECT pool_id,email FROM links_pool_owners'),settings=await rows("SELECT pool_id,value FROM pool_settings WHERE key='commissioner_email'"),slots=await rows('SELECT email,pool_id,game_type,active FROM links_pool_slots WHERE pool_id IS NOT NULL'),games=await rows('SELECT pool_id,game_type,active FROM pool_active_games');
 const grants=await rows('SELECT id,email,plan,days,created_at,expires_at FROM links_package_grants ORDER BY created_at DESC');
 const purchasedPlans=await rows('SELECT email FROM links_account_plans');const emails=new Set([...grants,...purchasedPlans,...slots].map(r=>emailKey(r.email)).filter(Boolean));for(const p of pools){p.email=emailKey(owners.find(r=>r.pool_id===p.id)?.email||settings.find(r=>r.pool_id===p.id)?.value);if(p.email)emails.add(p.email);p.games=games.filter(g=>g.pool_id===p.id)}
 const accounts=[];for(const email of emails){const plan=await allowance(db,email);accounts.push({email,...plan,ownedPools:pools.filter(p=>p.email===email).map(p=>({id:p.id,name:p.name})),used:slots.filter(s=>emailKey(s.email)===email&&s.active===1).length})}
 return json({pools,accounts,grants,activity:await rows('SELECT a.*,p.name pool_name,p.code pool_code FROM pool_login_activity a JOIN pools p ON p.id=a.pool_id ORDER BY a.last_login_at DESC LIMIT 500'),accountActivity:await rows('SELECT * FROM links_account_login_activity ORDER BY last_login_at DESC LIMIT 500')});
}
