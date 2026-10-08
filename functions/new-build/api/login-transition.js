import {ensureTransition,loginPhase} from '../../lib/login-transition.js';
import {ensureIdentity,identityTestHost} from '../../lib/player-identity.js';
import {ensureOwner,ownerSession} from '../../lib/owner-auth.js';
const reply=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){
 try{
 const db=env.DB;if(!db)return reply({error:'Login service unavailable.'},503);
 const url=new URL(request.url);await ensureTransition(db);
 if(request.method==='GET'&&!url.searchParams.has('admin')){const phase=await loginPhase(db);return reply({phase:identityTestHost(url.hostname)&&phase==='off'?'transition':phase})}
 if(!['GET','POST'].includes(request.method))return reply({error:'Method not allowed.'},405);
 if(request.method==='POST'&&request.headers.get('origin')!==url.origin)return reply({error:'Invalid origin.'},403);
 await ensureOwner(db);if(!await ownerSession(request,db))return reply({error:'Owner sign-in required.'},401);
 await ensureIdentity(db);
 if(request.method==='POST'){
 const raw=await request.text();if(raw.length>1024)return reply({error:'Request too large.'},400);const b=JSON.parse(raw);
 if(b.action==='start'){
 await db.batch([
 db.prepare("INSERT OR IGNORE INTO links_login_cohort SELECT p.pool_id,p.name FROM pool_players p LEFT JOIN newbuild_player_access x ON x.pool_id=p.pool_id AND x.player_name=p.name WHERE COALESCE(x.status,'active')='active' AND (SELECT phase FROM links_login_rollout WHERE id=1)='off'"),
 db.prepare("UPDATE links_login_rollout SET phase='transition',started_at=? WHERE id=1 AND phase='off'").bind(new Date().toISOString())]);
 }else if(b.action==='complete'){
 const changed=await db.prepare("UPDATE links_login_rollout SET phase='new' WHERE id=1 AND phase='transition' AND EXISTS(SELECT 1 FROM links_login_cohort) AND NOT EXISTS(SELECT 1 FROM links_login_cohort c JOIN pool_players p ON p.pool_id=c.pool_id AND p.name=c.player_name LEFT JOIN links_id_members m ON m.pool_id=c.pool_id AND m.player_name=c.player_name WHERE m.id IS NULL)").run();
 if(!changed.meta.changes)return reply({error:'Keep current pool login available until all tracked memberships are connected.'},409);
 }else return reply({error:'Unknown action.'},400);
 }
 const members=(await db.prepare('SELECT c.pool_id,p.name AS pool,c.player_name,a.username FROM links_login_cohort c JOIN pools p ON p.id=c.pool_id JOIN pool_players u ON u.pool_id=c.pool_id AND u.name=c.player_name LEFT JOIN links_id_members m ON m.pool_id=c.pool_id AND m.player_name=c.player_name LEFT JOIN links_id_accounts a ON a.id=m.account_id ORDER BY p.name,c.player_name').all()).results;
 return reply({phase:await loginPhase(db),members,total:members.length,completed:members.filter(m=>m.username).length,accounts:new Set(members.filter(m=>m.username).map(m=>m.username)).size});
 }catch(e){console.error('login transition',e.message);return reply({error:'Could not load login transition. Please retry.'},500)}
}
