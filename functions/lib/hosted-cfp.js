import {accountSession,digest,emailKey} from './commissioner-account.js';
import {ownerSession} from './owner-auth.js';
import {cfpSeason} from '../../public/new-build/cfp-core.mjs';
export async function ensureHostedCFP(db){await db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS links_cfp_access(pool_id INTEGER,season INTEGER,player TEXT,unlocked INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL,PRIMARY KEY(pool_id,season,player))'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_hosted_cfp_events(season INTEGER PRIMARY KEY,pool_id INTEGER UNIQUE NOT NULL,created_at TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_hosted_cfp_members(pool_id INTEGER,account_hash TEXT,player TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(pool_id,account_hash),UNIQUE(pool_id,player))')
]);}
export async function hostedEvent(db,season=cfpSeason()){await ensureHostedCFP(db);return db.prepare('SELECT e.season,p.id,p.name,p.code FROM links_hosted_cfp_events e JOIN pools p ON p.id=e.pool_id WHERE e.season=?').bind(season).first();}
export async function hostedActor(request,db,pool){
 await ensureHostedCFP(db);
 const event=await db.prepare('SELECT season FROM links_hosted_cfp_events WHERE pool_id=?').bind(pool).first();if(!event)return {hosted:false};
 if(await ownerSession(request,db))return {hosted:true,season:event.season,actor:{pool_id:pool,player_name:'LINKS Host',role:'admin',viewOnly:true,isHosted:true}};
 const account=await accountSession(request,db);if(!account)return {hosted:true,season:event.season,actor:null};
 const member=await db.prepare('SELECT player FROM links_hosted_cfp_members WHERE pool_id=? AND account_hash=?').bind(pool,await digest(emailKey(account.email))).first();
 return {hosted:true,season:event.season,actor:member?{pool_id:pool,player_name:member.player,role:'player',isHosted:true}:null};
}
