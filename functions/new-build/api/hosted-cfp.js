import {accountSession,digest,emailKey} from '../../lib/commissioner-account.js';
import {ownerSession} from '../../lib/owner-auth.js';
import {hostedEvent,ensureHostedCFP} from '../../lib/hosted-cfp.js';
import {cfpSeason} from '../../../public/new-build/cfp-core.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
async function ensureEvent(db,season){const existing=await hostedEvent(db,season);if(existing)return existing;
   const code='LCFP'+crypto.randomUUID().replaceAll('-','').slice(0,12),stamp=new Date().toISOString(),secret=crypto.randomUUID()+crypto.randomUUID();
   const pid='(SELECT pool_id FROM links_hosted_cfp_events WHERE season=?)';
   await db.batch([
    db.prepare('INSERT INTO pools(code,name,admin_salt,admin_hash,created_at) SELECT ?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM links_hosted_cfp_events WHERE season=?)').bind(code,'LINKS College Playoff Challenge',secret,await digest(secret),stamp,season),
    db.prepare('INSERT OR IGNORE INTO links_hosted_cfp_events SELECT ?,id,? FROM pools WHERE code=?').bind(season,stamp,code),
    db.prepare('INSERT OR IGNORE INTO pool_active_games(pool_id,game_type,is_primary,active,added_at) VALUES('+pid+",'cfp',1,1,?)").bind(season,stamp),
    db.prepare('INSERT OR IGNORE INTO pool_players(pool_id,name,password_hash,salt) VALUES('+pid+",'LINKS Host',?,?)").bind(season,await digest(secret+':host'),secret),
    db.prepare('INSERT OR IGNORE INTO pool_settings(pool_id,key,value) VALUES('+pid+",'game_type','cfp')").bind(season)
   ]);return hostedEvent(db,season);
}
export async function onRequest({request,env}){try{
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
 if(request.method==='POST'&&request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Open the LINKS event before continuing.'},403);
 const db=env.DB;if(!db)return json({error:'Event unavailable. Try again shortly.'},503);
 const season=cfpSeason();await ensureHostedCFP(db);
 let event=await ensureEvent(db,season);const admin=!!await ownerSession(request,db),account=await accountSession(request,db);
 if(request.method==='POST'){
  const raw=await request.text();if(raw.length>1000)return json({error:'Request too large.'},413);let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
  if(b.action==='publish'){
   if(!admin)return json({error:'LINKS Owner Admin sign-in required.'},403);

  }else if(b.action==='join'){
   if(!account)return json({error:'Create a LINKS account or sign in before joining.'},401);
   if(!event)return json({error:'The LINKS event has not opened yet.'},409);
   const hash=await digest(emailKey(account.email)),base=String(account.displayName||'Player').replace(/[\x00-\x1f<>]/g,'').trim();
   const player=(base.includes('@')?'Player':base||'Player').slice(0,40)+' · '+hash.slice(0,6),stamp=new Date().toISOString(),secret=crypto.randomUUID();
   await db.batch([
    db.prepare('INSERT OR IGNORE INTO links_hosted_cfp_members VALUES(?,?,?,?)').bind(event.id,hash,player,stamp),
    db.prepare('INSERT OR IGNORE INTO pool_players(pool_id,name,password_hash,salt) SELECT pool_id,player,?,? FROM links_hosted_cfp_members WHERE pool_id=? AND account_hash=?').bind(await digest(secret),secret,event.id,hash),
    db.prepare('INSERT INTO links_cfp_access SELECT pool_id,?,player,1,? FROM links_hosted_cfp_members WHERE pool_id=? AND account_hash=? ON CONFLICT(pool_id,season,player) DO UPDATE SET unlocked=1,updated_at=excluded.updated_at').bind(season,stamp,event.id,hash)
   ]);
  }else return json({error:'Unknown action.'},400);
 }
 const membership=account&&event?await db.prepare('SELECT player FROM links_hosted_cfp_members WHERE pool_id=? AND account_hash=?').bind(event.id,await digest(emailKey(account.email))).first():null;
 const count=event?await db.prepare('SELECT COUNT(*) n FROM links_hosted_cfp_members WHERE pool_id=?').bind(event.id).first():{n:0};
 return json({event:event?{id:event.id,name:event.name,season:event.season}:null,season,signedIn:!!account,joined:!!membership,admin,participants:count.n});
 }catch{return json({error:'The hosted event could not finish this request. Please refresh before trying again.'},503)}}
