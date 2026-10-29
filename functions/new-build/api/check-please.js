import {accountSession,digest,emailKey} from '../../lib/commissioner-account.js';
import {centralDay} from '../../lib/daily-challenge.js';
import {activeDailyVenues} from '../../lib/daily-venues.js';
import {replay,STEP,DURATION} from '../../../public/new-build/check-please-engine.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const fail=(message,status=400)=>Object.assign(Error(message),{status});
export async function ensureCheckPlease(db){for(const sql of [
 'CREATE TABLE IF NOT EXISTS links_check_runs(owner TEXT PRIMARY KEY,id TEXT UNIQUE NOT NULL,day TEXT NOT NULL,started INTEGER NOT NULL,venue TEXT,name TEXT NOT NULL,result TEXT)',
 'CREATE TABLE IF NOT EXISTS links_check_scores(owner TEXT NOT NULL,day TEXT NOT NULL,public_id TEXT NOT NULL,name TEXT NOT NULL,venue TEXT,score INTEGER NOT NULL,deliveries INTEGER NOT NULL,dodges INTEGER NOT NULL,spills INTEGER NOT NULL,PRIMARY KEY(owner,day))',
 'CREATE INDEX IF NOT EXISTS links_check_rank ON links_check_scores(day,score DESC)'
])await db.prepare(sql).run()}
export async function checkPleaseRequest({request,env},services={}){try{
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
 if(!env.DB)throw fail('Leaderboards are temporarily unavailable. Practice still works.',503);
 const venueId=new URL(request.url).searchParams.get('venue')||null;if(venueId&&venueId.length>100)throw fail('Invalid venue.');
 if(request.method==='POST'&&request.headers.get('Origin')!==new URL(request.url).origin)throw fail('Open Check, Please! on LINKS to play.',403);
 const db=env.DB,now=services.now?.()??Date.now(),day=centralDay(now);await ensureCheckPlease(db);const venues=await activeDailyVenues(db),session=await(services.session||accountSession)(request,db),owner=session?.email?await digest('check-please:'+emailKey(session.email)):null;let run,result;
 if(request.method==='POST'){
  if(!owner)throw fail('Sign in to save a daily score. Guest play is free.',401);
  if(Number(request.headers.get('Content-Length')||0)>16000)throw fail('Round is too large.',413);const raw=await request.text();if(raw.length>16000)throw fail('Round is too large.',413);let body;try{body=JSON.parse(raw)}catch{throw fail('Invalid request.')}
  if(!body||!['start','finish'].includes(body.action))throw fail('Choose start or finish.');
  if(body.action==='start'){
   const venue=body.partnerId?venues.find(v=>v.id===body.partnerId):null;if(body.partnerId&&!venue)throw fail('Choose an active venue.');const id=crypto.randomUUID(),display=String(session.displayName||'').trim().replace(/[<>\u0000-\u001f]/g,'').slice(0,32),name=display&&!display.includes('@')?display:'Player '+owner.slice(0,4).toUpperCase();
   await db.prepare('INSERT INTO links_check_runs(owner,id,day,started,venue,name,result) VALUES(?,?,?,?,?,?,NULL) ON CONFLICT(owner) DO UPDATE SET id=excluded.id,day=excluded.day,started=excluded.started,venue=excluded.venue,name=excluded.name,result=NULL').bind(owner,id,day,now,venue?JSON.stringify(venue):null,name).run();run={id,seed:'daily:'+day,startedAt:new Date(now).toISOString(),duration:DURATION};
  }else{
   if(typeof body.id!=='string'||body.id.length>100)throw fail('Invalid round.');const saved=await db.prepare('SELECT * FROM links_check_runs WHERE owner=? AND id=?').bind(owner,body.id).first();if(!saved||saved.result)throw fail('This shift is replaced or already saved.',409);
   const elapsed=now-saved.started;if(elapsed<0||elapsed>105000)throw fail('This shift expired. Start another one.',409);
   try{result=replay('daily:'+saved.day,body.inputs)}catch(e){throw fail(e.message)}if(result.steps*STEP>elapsed+1000)throw fail('The shift does not match the server clock.');
   const packed=JSON.stringify(result),updates=await db.batch([
    db.prepare('UPDATE links_check_runs SET result=? WHERE owner=? AND id=? AND result IS NULL').bind(packed,owner,body.id),
    db.prepare('INSERT INTO links_check_scores(owner,day,public_id,name,venue,score,deliveries,dodges,spills) SELECT owner,day,?,name,venue,?,?,?,? FROM links_check_runs WHERE owner=? AND id=? AND result=? ON CONFLICT(owner,day) DO UPDATE SET name=excluded.name,venue=excluded.venue,score=excluded.score,deliveries=excluded.deliveries,dodges=excluded.dodges,spills=excluded.spills WHERE excluded.score>links_check_scores.score').bind(await digest('public:'+owner),result.score,result.deliveries,result.dodges,result.spills,owner,body.id,packed)
   ]);if(updates[0]?.meta?.changes!==1)throw fail('This shift was already saved.',409);
  }
 }
 const leaderboard=(await db.prepare("SELECT public_id AS profileId,name,json_extract(venue,'$.name') AS venueName,score,deliveries,dodges,spills FROM links_check_scores WHERE day=?"+(venueId?" AND json_extract(venue,'$.id')=?":'')+' ORDER BY score DESC,spills ASC,public_id LIMIT 100').bind(day,...(venueId?[venueId]:[])).all()).results;
 return json({signedIn:!!owner,day,seed:'daily:'+day,venues,leaderboard,...(run?{run}:{}),...(result?{result}:{})});
 }catch(e){return json({error:e.status?e.message:'Scores could not load. You can still play locally.'},e.status||503)}}
export const onRequest=checkPleaseRequest;
