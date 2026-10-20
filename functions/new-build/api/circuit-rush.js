import {accountSession,digest,emailKey} from '../../lib/commissioner-account.js';
import {centralDay} from '../../lib/daily-challenge.js';
import {activeDailyVenues} from '../../lib/daily-venues.js';
import {createRun,rotateBoard,evaluateBoard} from '../../../public/new-build/circuit-rush-engine.mjs';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const fail=(message,status=400)=>Object.assign(Error(message),{status});
export async function ensureCircuit(db){for(const sql of [
 'CREATE TABLE IF NOT EXISTS links_circuit_runs(owner TEXT PRIMARY KEY,id TEXT UNIQUE NOT NULL,day TEXT NOT NULL,started INTEGER NOT NULL,venue TEXT,name TEXT NOT NULL,result TEXT)',
 'CREATE TABLE IF NOT EXISTS links_circuit_scores(owner TEXT NOT NULL,day TEXT NOT NULL,public_id TEXT NOT NULL,name TEXT NOT NULL,venue TEXT,score INTEGER NOT NULL,boards INTEGER NOT NULL,moves INTEGER NOT NULL,PRIMARY KEY(owner,day))',
 'CREATE INDEX IF NOT EXISTS links_circuit_rank ON links_circuit_scores(day,score DESC)'
])await db.prepare(sql).run()}
export function validateCircuitRun(seed,events,elapsed){
 if(!Array.isArray(events)||events.length>2000||!Number.isFinite(elapsed)||elapsed<0)throw fail('Invalid run.');
 const run=createRun(seed);let boards=0,moves=0,failedPulses=0,last=0;
 for(const e of events){
  if(!e||!['rotate','pulse'].includes(e.type)||!Number.isInteger(e.board)||e.board!==boards||boards>=3||!Number.isFinite(e.at)||e.at<last||e.at<0||e.at>elapsed+1500||e.at+failedPulses*3000>=90000)throw fail('Run actions do not match the clock or board.');
  last=e.at;const board=run.boards[boards];
  if(e.type==='rotate'){if(!Number.isInteger(e.index)||e.index<0||e.index>=board.tiles.length||board.tiles[e.index].locked)throw fail('Invalid tile rotation.');run.boards[boards]=rotateBoard(board,e.index);moves++}
  else if(evaluateBoard(board).won)boards++;else failedPulses++;
 }
 const remaining=Math.max(0,90-elapsed/1000-failedPulses*3),score=Math.max(0,boards*1000+(boards?Math.floor(remaining)*10:0)-moves*2);
 return {score,boards,moves,failedPulses};
}
export async function circuitRequest({request,env},services={}){try{
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
 const params=new URL(request.url).searchParams,period=params.get('period')||'today',venueId=params.get('venue')||null;if(!['today','all'].includes(period)||venueId&&venueId.length>100)throw fail('Invalid leaderboard filter.');
 if(!env.DB)throw fail('Circuit Rush scores are temporarily unavailable.',503);
 if(request.method==='POST'&&request.headers.get('Origin')!==new URL(request.url).origin)throw fail('Open Circuit Rush on LINKS to play.',403);
 const db=env.DB,now=services.now?.()??Date.now(),day=centralDay(now),seed='daily:'+day;await ensureCircuit(db);const venues=await activeDailyVenues(db),session=await (services.session||accountSession)(request,db),owner=session?.email?await digest('circuit:'+emailKey(session.email)):null;
 let run=null,result=null;
 if(request.method==='POST'){
  if(!owner)throw fail('Sign in to save your daily score. Guest play is still free.',401);
  const raw=await request.text();if(raw.length>180000)throw fail('Run is too large.',413);let b;try{b=JSON.parse(raw)}catch{throw fail('Invalid request.')}
  if(!b||!['start','finish'].includes(b.action))throw fail('Choose start or finish.');
  if(b.action==='start'){
   const venue=b.partnerId?venues.find(v=>v.id===b.partnerId):null;if(b.partnerId&&!venue)throw fail('Choose an active venue.');
   const id=crypto.randomUUID(),display=String(session.displayName||'').trim().replace(/[<>\u0000-\u001f]/g,'').slice(0,32),name=display&&!display.includes('@')?display:'Player '+owner.slice(0,4).toUpperCase();
   await db.prepare('INSERT INTO links_circuit_runs(owner,id,day,started,venue,name,result) VALUES(?,?,?,?,?,?,NULL) ON CONFLICT(owner) DO UPDATE SET id=excluded.id,day=excluded.day,started=excluded.started,venue=excluded.venue,name=excluded.name,result=NULL').bind(owner,id,day,now,venue?JSON.stringify(venue):null,name).run();
   run={id,seed,startedAt:new Date(now).toISOString(),deadline:new Date(now+90000).toISOString()};
  }else{
   if(typeof b.id!=='string'||b.id.length>100)throw fail('Invalid run identifier.');const saved=await db.prepare('SELECT * FROM links_circuit_runs WHERE owner=? AND id=?').bind(owner,b.id).first();if(!saved)throw fail('This run was replaced. Start another round.',409);if(saved.result)throw fail('This run is already saved.',409);
   const elapsed=now-saved.started;if(elapsed<0||elapsed>105000)throw fail('This run expired. Start another round.',409);
   result=validateCircuitRun('daily:'+saved.day,b.events,Math.min(elapsed,90000));const packed=JSON.stringify(result);
   const updates=await db.batch([
    db.prepare('UPDATE links_circuit_runs SET result=? WHERE owner=? AND id=? AND result IS NULL').bind(packed,owner,b.id),
    db.prepare('INSERT INTO links_circuit_scores(owner,day,public_id,name,venue,score,boards,moves) SELECT owner,day,?,name,venue,?,?,? FROM links_circuit_runs WHERE owner=? AND id=? AND result=? ON CONFLICT(owner,day) DO UPDATE SET name=excluded.name,venue=excluded.venue,score=excluded.score,boards=excluded.boards,moves=excluded.moves WHERE excluded.score>links_circuit_scores.score').bind(await digest('public:'+owner),result.score,result.boards,result.moves,owner,b.id,packed)
   ]);if(updates[0]?.meta?.changes!==1)throw fail('This run is already saved.',409);
  }
 }
 const where=period==='today'?' WHERE day=?':'',args=period==='today'?[day]:[],filter=venueId?(where?' AND':' WHERE')+" json_extract(venue,'$.id')=?":'';
 const leaderboard=(await db.prepare(`SELECT public_id AS profileId,name,json_extract(venue,'$.name') AS venueName,json_extract(venue,'$.id') AS venueId,SUM(score) AS score,SUM(boards) AS boards,SUM(moves) AS moves,COUNT(*) AS plays FROM links_circuit_scores${where}${filter} GROUP BY public_id,json_extract(venue,'$.id') ORDER BY score DESC,profileId LIMIT 100`).bind(...args,...(venueId?[venueId]:[])).all()).results;
 return json({signedIn:!!owner,day,seed,serverNow:new Date(now).toISOString(),period,venues,leaderboard,...(run?{run}:{}),...(result?{result}:{})});
 }catch(e){return json({error:e.status?e.message:'Circuit Rush could not save. You can still play locally.'},e.status||503)}}
export const onRequest=circuitRequest;
