import {accountSession,digest,emailKey} from '../../lib/commissioner-account.js';
import {poolFor,sessionFor} from '../../lib/college.js';
import {activeDailyVenues} from '../../lib/daily-venues.js';
import {resetAt} from '../../lib/daily-challenge.js';
import {centralDay,dailyShots,simulate,validInput,weekStart,streaks,RULES_VERSION} from '../../../public/new-build/daily-shot-core.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}}),fail=(message,status=400)=>Object.assign(Error(message),{status});
export async function ensureDailyShot(db){for(const sql of [
 'CREATE TABLE IF NOT EXISTS links_shot_profiles(owner TEXT PRIMARY KEY,public_id TEXT UNIQUE NOT NULL,name TEXT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS links_shot_runs(owner TEXT NOT NULL,day TEXT NOT NULL,attempt INTEGER NOT NULL,id TEXT UNIQUE NOT NULL,version INTEGER NOT NULL DEFAULT 0,seed TEXT NOT NULL,state TEXT NOT NULL,started_at INTEGER NOT NULL,deadline INTEGER NOT NULL,next_at INTEGER NOT NULL,completed_at INTEGER,score INTEGER NOT NULL DEFAULT 0,venue_id TEXT,venue_name TEXT,pool_id INTEGER,PRIMARY KEY(owner,day,attempt))',
 'CREATE INDEX IF NOT EXISTS links_shot_board ON links_shot_runs(day,completed_at,score DESC)',
 'CREATE INDEX IF NOT EXISTS links_shot_pool ON links_shot_runs(pool_id,day)'
 ])await db.prepare(sql).run();}
function visible(row){return row?{id:row.id,version:row.version,attempt:row.attempt,day:row.day,seed:row.seed,shots:JSON.parse(row.state).shots,score:row.score,complete:row.completed_at!==null,deadline:row.deadline,nextAt:row.next_at,venueId:row.venue_id,venueName:row.venue_name}:null;}
export async function dailyShotRequest({request,env},services={}){try{
 if(!['GET','POST'].includes(request.method))throw fail('Method not allowed.',405);
 const post=request.method==='POST',url=new URL(request.url),now=services.now?.()??Date.now(),day=centralDay(now),seed='daily-shot-v1:'+day,db=env.DB;
 if(!db)throw fail('Daily Shot scores are temporarily unavailable. Practice is still available.',503);
 if(post&&request.headers.get('Origin')!==url.origin)throw fail('Open Daily Shot on LINKS before saving.',403);
 let b={};if(post){const text=await request.text();if(text.length>1800)throw fail('Request too large.',413);try{b=JSON.parse(text)}catch{throw fail('Invalid shot request.')}if(!b||Array.isArray(b))throw fail('Invalid shot request.');}
 const period=url.searchParams.get('period')||'today',scope=url.searchParams.get('scope')||'all';if(!['today','week'].includes(period)||!['all','pool','venue'].includes(scope))throw fail('Choose a valid leaderboard.');
 await ensureDailyShot(db);const venues=await activeDailyVenues(db),account=await (services.session||accountSession)(request,db);
 let pool=null,poolSession=null;const poolId=b.pool||url.searchParams.get('pool');if(poolId){const found=await poolFor(db,poolId);if(found){poolSession=await sessionFor(request,db,found.id);if(poolSession){const member=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?)').bind(found.id,poolSession.player_name||'').first();if(member)pool=found;else poolSession=null;}}}
 const identity=account?.email?'account:'+emailKey(account.email):poolSession?.player_name?'pool:'+pool.id+':'+poolSession.player_name.trim().toLowerCase():null;
 const owner=identity?await digest('daily-shot:'+identity):null;
 const display=String(account?.displayName||poolSession?.player_name||'').trim().replace(/[<>\u0000-\u001f]/g,'').slice(0,32),name=display&&!display.includes('@')?display:owner?'Player '+owner.slice(0,4).toUpperCase():'Guest';
 if(owner)await db.prepare('INSERT INTO links_shot_profiles VALUES(?,?,?) ON CONFLICT(owner) DO UPDATE SET name=excluded.name WHERE links_shot_profiles.name<>excluded.name').bind(owner,await digest('public-shot:'+owner),name).run();
 let run=owner?await db.prepare('SELECT * FROM links_shot_runs WHERE owner=? AND day=? AND completed_at IS NULL AND deadline>? ORDER BY attempt DESC LIMIT 1').bind(owner,day,now).first():null;
 if(post){
  if(!owner)throw fail('Sign in to save a ranked score. Unlimited practice is free.',401);
  if(b.action==='start'){
   if(!run){const venue=b.venueId?venues.find(v=>v.id===b.venueId):null;if(b.venueId&&!venue)throw fail('Choose an active venue, or play without a venue.');
    const id=crypto.randomUUID(),deadline=Math.min(now+20*60000,Date.parse(resetAt(now)));
    const saved=await db.prepare('INSERT INTO links_shot_runs(owner,day,attempt,id,seed,state,started_at,deadline,next_at,venue_id,venue_name,pool_id) SELECT ?,?,COALESCE(MAX(attempt),0)+1,?,?,?,?,?,?,?,?,? FROM links_shot_runs WHERE owner=? AND day=? HAVING COUNT(*)<3 AND NOT EXISTS(SELECT 1 FROM links_shot_runs WHERE owner=? AND day=? AND completed_at IS NULL AND deadline>?)').bind(owner,day,id,seed,JSON.stringify({rulesVersion:RULES_VERSION,shots:[]}),now,deadline,now,venue?.id??null,venue?.name??null,pool?.id??null,owner,day,owner,day,now).run();
    run=await db.prepare('SELECT * FROM links_shot_runs WHERE owner=? AND day=? AND completed_at IS NULL AND deadline>? ORDER BY attempt DESC LIMIT 1').bind(owner,day,now).first();
    if(!run)throw fail('You have used today’s three ranked runs. Practice is unlimited; a new challenge starts at midnight Central.',409);
   }
  }else if(b.action==='shoot'){
   const saved=await db.prepare('SELECT * FROM links_shot_runs WHERE owner=? AND id=?').bind(owner,String(b.id||'')).first();
   if(!saved||saved.day!==day||saved.completed_at!==null||saved.deadline<=now)throw fail('This run has finished or expired. Refresh to start your next run.',409);
   if(!Number.isInteger(b.version)||b.version!==saved.version)throw fail('This shot was already saved or another tab changed the run. Refresh to resume.',409);
   if(now<saved.next_at)throw fail('Let the current shot finish before shooting again.',409);
   if(!validInput(b.input))throw fail('Choose a valid aim and power.');
   const state=JSON.parse(saved.state);if(state.rulesVersion!==RULES_VERSION||state.shots.length>=5)throw fail('Refresh your run before shooting.',409);
   const input={aim:Math.round(b.input.aim*100000)/100000,power:Math.round(b.input.power*100000)/100000},result=simulate(dailyShots(saved.seed)[state.shots.length],input);state.shots.push({input,...result});
   const score=state.shots.reduce((n,s)=>n+s.points,0),complete=state.shots.length===5;
   const updated=await db.prepare('UPDATE links_shot_runs SET version=version+1,state=?,score=?,next_at=?,completed_at=? WHERE owner=? AND id=? AND version=? AND completed_at IS NULL AND deadline>? AND next_at<=?').bind(JSON.stringify(state),score,now+Math.ceil(result.duration*1000),complete?now:null,owner,saved.id,b.version,now,now).run();
   if(!updated.meta?.changes)throw fail('The shot was already saved, the run expired, or another tab changed it. Refresh to resume.',409);
   run=await db.prepare('SELECT * FROM links_shot_runs WHERE owner=? AND id=?').bind(owner,saved.id).first();
  }else throw fail('Choose start or shoot.');
 }
 const used=owner?await db.prepare('SELECT COUNT(*) used,MAX(CASE WHEN completed_at IS NOT NULL THEN score END) best FROM links_shot_runs WHERE owner=? AND day=?').bind(owner,day).first():{used:0,best:null};
 const from=period==='week'?weekStart(day):day,args=[from,day];let filter='';
 if(scope==='pool'){if(!pool)throw fail('Sign in to your pool to see its Daily Shot board.',403);filter+=' AND pool_id=?';args.push(pool.id)}
 if(scope==='venue'){const v=url.searchParams.get('venue');if(!venues.some(x=>x.id===v))throw fail('Choose an active venue.');filter+=' AND venue_id=?';args.push(v)}
 // First take each player's best completed run per day, then add daily bests for the week.
 const rows=(await db.prepare(`SELECT p.public_id AS playerId,p.name,SUM(best.score) score,COUNT(*) days FROM (SELECT owner,day,MAX(score) score FROM links_shot_runs WHERE completed_at IS NOT NULL AND day>=? AND day<=?${filter} GROUP BY owner,day) best JOIN links_shot_profiles p ON p.owner=best.owner GROUP BY p.public_id,p.name ORDER BY score DESC,p.public_id LIMIT 50`).bind(...args).all()).results||[];
 let rank=0,prior=null;const leaderboard=rows.map((r,i)=>{if(r.score!==prior)rank=i+1;prior=r.score;return {...r,rank}});const publicId=owner?await digest('public-shot:'+owner):null;for(const r of leaderboard)r.isYou=r.playerId===publicId;
 const days=owner?((await db.prepare('SELECT DISTINCT day FROM links_shot_runs WHERE owner=? AND completed_at IS NOT NULL ORDER BY day DESC').bind(owner).all()).results||[]).map(r=>r.day):[];
 const lastRun=owner?await db.prepare('SELECT * FROM links_shot_runs WHERE owner=? AND day=? ORDER BY attempt DESC LIMIT 1').bind(owner,day).first():null;
 return json({lastRun:visible(lastRun),signedIn:!!owner,player:name,day,seed,shots:dailyShots(seed),rulesVersion:RULES_VERSION,resetAt:resetAt(now),serverNow:now,remaining:Math.max(0,3-Number(used.used)),used:Number(used.used),best:used.best??null,streak:streaks(days,day),run:visible(run),pool,venues,period,scope,leaderboard});
 }catch(e){return json({error:e.status?e.message:'Daily Shot could not connect. Your saved shots are unchanged; free practice is still available.'},e.status||503)}}
export const onRequest=dailyShotRequest;
