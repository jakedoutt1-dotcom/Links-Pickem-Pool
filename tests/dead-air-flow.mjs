import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/dead-air.js';
import {advance,pause,puzzle,respond,start,view} from '../functions/lib/dead-air.js';

function room(version=2){const s={game:1,flowVersion:version,mode:'friends',owner:'a',players:{a:{name:'A'},b:{name:'B'}}};start(s,1000);return s}
function enterQuestion(s){assert.equal(advance(s,s.deadline),true);assert.equal(s.phase,'question')}
function answerCorrectly(s){for(const id of Object.keys(s.players))respond(s,id,s.question.correct,s.startsAt);advance(s,s.deadline)}
const clean=room();enterQuestion(clean);answerCorrectly(clean);
assert.equal(clean.cleanBroadcast,true);assert.ok(clean.results.every(r=>r.bonus===150&&r.points===300));assert.ok(Object.values(clean.players).every(p=>p.score===300));
assert.equal(view(clean,'a',clean.startsAt).broadcastBonus,150);assert.match(view(clean,'a',clean.startsAt).nextTask,/150-point/);
advance(clean,clean.deadline);assert.equal(clean.phase,'question');assert.equal(clean.cycle,1);assert.equal(clean.cleanBroadcast,false);
const legacy=room(1);enterQuestion(legacy);answerCorrectly(legacy);assert.equal(legacy.cleanBroadcast,false);assert.ok(Object.values(legacy.players).every(p=>p.score===150));
legacy.puzzleOrder=['frequency'];advance(legacy,legacy.deadline);assert.equal(legacy.phase,'brief');assert.equal(legacy.deadline-legacy.startsAt,10000);advance(legacy,legacy.deadline);assert.equal(legacy.phase,'observe');advance(legacy,legacy.deadline);
for(const id of Object.keys(legacy.players))respond(legacy,id,legacy.challenge.correct,legacy.startsAt);advance(legacy,legacy.deadline);
assert.ok(Object.values(legacy.players).every(p=>p.score===300)); // A skipped clean challenge preserves the same available points.

const echo=room();echo.puzzleOrder=['frequency','frequency','frequency','frequency'];echo.players.b.lives=0;echo.players.b.echoCharge=1;enterQuestion(echo);answerCorrectly(echo);
assert.equal(echo.cleanBroadcast,false);assert.equal(view(echo,'a',echo.startsAt).broadcastBonus,0);advance(echo,echo.deadline);assert.equal(echo.phase,'brief');assert.equal(echo.deadline-echo.startsAt,10000);
advance(echo,echo.deadline);assert.equal(echo.phase,'challenge');assert.equal(view(echo,'',echo.startsAt,true).challenge.correct,undefined);
for(const id of Object.keys(echo.players))respond(echo,id,echo.challenge.correct,echo.startsAt);advance(echo,echo.deadline);
assert.equal(echo.players.b.lives,1);assert.equal(echo.players.b.echoCharge,0);advance(echo,echo.deadline);
respond(echo,'a',echo.question.correct,echo.startsAt);respond(echo,'b',(echo.question.correct+1)%4,echo.startsAt);advance(echo,echo.deadline);advance(echo,echo.deadline);
assert.equal(echo.phase,'brief');assert.equal(echo.deadline-echo.startsAt,5000);
for(const type of ['signal','evidence','frequency','power','relay']){
 const s=room();enterQuestion(s);advance(s,s.deadline);s.puzzleOrder=[type];advance(s,s.deadline);assert.equal(s.phase,'brief');
 const before=view(s,'',s.startsAt,true);assert.equal(before.challenge.sequence,undefined);assert.equal(before.challenge.correct,undefined);assert.equal(before.challenge.board,undefined);
 advance(s,s.deadline);assert.equal(s.phase,['signal','evidence'].includes(type)?'observe':'challenge');
 if(type==='signal'){assert.ok(view(s,'',s.startsAt,true).challenge.sequence);advance(s,s.deadline);assert.equal(view(s,'',s.startsAt,true).challenge.sequence,undefined)}
 if(type==='evidence'){assert.ok(view(s,'',s.startsAt,true).challenge.board);advance(s,s.deadline);assert.equal(view(s,'',s.startsAt,true).challenge.changed,undefined)}
}

// Pausing does not buy extra speed points or unlock a timed clue.
const timed=room();enterQuestion(timed);const questionStart=timed.startsAt;
respond(timed,'a',timed.question.correct,questionStart+2000);assert.equal(pause(timed,questionStart+4000,true),true);
assert.equal(pause(timed,questionStart+50000,true),false);assert.equal(advance(timed,questionStart+64000),false);assert.throws(()=>respond(timed,'b',timed.question.correct,questionStart+64000),/paused/);
assert.equal(pause(timed,questionStart+64000,false),true);assert.equal(timed.startsAt,questionStart+60000);assert.equal(timed.responses.a.at,questionStart+62000);assert.equal(timed.deadline,questionStart+75000);
assert.equal(pause(timed,questionStart+65000,false),false);respond(timed,'b',timed.question.correct,questionStart+65000);advance(timed,timed.deadline);
assert.equal(timed.players.a.score,293);assert.equal(timed.players.b.score,283);
const staged=room();Object.assign(staged,{phase:'final',finalType:'frequency',startsAt:1000,deadline:21000,challenge:puzzle('frequency',2),responses:{}});
pause(staged,4900,true);for(const display of [false,true]){const v=view(staged,display?'':'a',90000,display);assert.equal(v.challenge.clues.length,1);assert.equal(v.challenge.nextClueAt,6000);assert.equal(v.challenge.correct,undefined);assert.equal(v.pausedAt,4900)}
pause(staged,104900,false);assert.equal(view(staged,'a',105000).challenge.clues.length,1);assert.equal(view(staged,'a',106000).challenge.clues.length,2);assert.equal(staged.deadline,121000);

const realNow=Date.now;let now=realNow();Date.now=()=>now;
try{
 const {db}=fixture();let code;
 async function call(body=null,token='',display=''){
  const r=await onRequest({env:{DB:db},request:new Request('https://dead.local/new-build/api/dead-air'+(body?'':'?code='+code),{method:body?'POST':'GET',headers:{Origin:'https://dead.local','x-dead-air-token':token,'x-dead-air-display':display},...(body?{body:JSON.stringify({code,game:1,...body})}:{})})});return {status:r.status,...await r.json()};
 }
 function stored(){return JSON.parse(db.raw.prepare('SELECT state FROM links_dead_air_rooms WHERE code=?').get(code).state)}
 const host=await call({action:'create',name:'Host',mode:'friends'});code=host.code;const guest=await call({action:'join',name:'Guest'}),people=[host,guest];
 assert.equal(host.flowVersion,2);assert.equal(host.roundCount,12);assert.equal(host.paused,false);
 for(const p of people)await call({action:'ready'},p.token);let s=await call({action:'start'},host.token);now=s.deadline;s=await call(null,host.token);
 assert.equal((await call({action:'pause',phaseId:s.phaseId,paused:true},guest.token)).status,403);assert.equal((await call({action:'pause',phaseId:s.phaseId,paused:true},'',host.displayKey)).status,403);assert.equal((await call({action:'pause',phaseId:s.phaseId-1,paused:true},host.token)).status,409);
 const phaseId=s.phaseId,deadline=s.deadline;now+=2000;const correct=stored().question.correct;await call({action:'answer',phaseId,answer:correct},host.token);
 now+=2000;s=await call({action:'pause',phaseId,paused:true},host.token);assert.equal(s.paused,true);const frozen=s.pausedAt;now+=60000;
 s=await call(null,host.token);assert.equal(s.phaseId,phaseId);assert.equal(s.pausedAt,frozen);assert.equal(s.deadline,deadline);assert.equal(s.selection,correct);assert.equal(s.question.correct,undefined);
 assert.equal((await call({action:'answer',phaseId,answer:correct},guest.token)).status,409);assert.equal((await call(null,'',host.displayKey)).selection,undefined);
 s=await call({action:'pause',phaseId,paused:true},host.token);assert.equal(s.pausedAt,frozen);s=await call({action:'pause',phaseId,paused:false},host.token);assert.equal(s.deadline,deadline+60000);assert.equal(s.paused,false);
 await call({action:'answer',phaseId,answer:correct},guest.token);now=s.deadline;s=await call(null,host.token);assert.equal(s.cleanBroadcast,true);assert.ok(s.results.every(r=>r.bonus===150));
 let questions=1,steps=0;
 while(s.phase!=='ended'&&steps++<100){
  if(['question','final'].includes(s.phase)){
   if(s.phase==='question')questions++;
   const raw=stored(),answer=s.question?raw.question.correct:raw.challenge.correct;
   assert.equal(s.question?.correct,undefined);assert.equal(s.challenge?.correct,undefined);
   for(const p of people)assert.equal((await call({action:'answer',phaseId:s.phaseId,answer},p.token)).status,200);
  }
  assert.notEqual(s.phase,'brief');assert.notEqual(s.phase,'observe');assert.notEqual(s.phase,'challenge');
  now=s.deadline;s=await call(null,host.token);assert.equal(s.status,200);
 }
 assert.equal(s.phase,'ended');assert.equal(questions,12);assert.equal(s.players[0].progress,13);assert.equal(s.players[0].score,4843);assert.equal(s.players[1].score,4836);
 const count=db.raw.prepare('SELECT COUNT(*) AS n FROM links_party_results WHERE game=? AND room=?').get('dead-air',code).n;assert.equal(count,2);
 await call(null,host.token);assert.equal(db.raw.prepare('SELECT COUNT(*) AS n FROM links_party_results WHERE game=? AND room=?').get('dead-air',code).n,count);
 assert.equal((await call({action:'pause',phaseId:s.phaseId,paused:true},host.token)).status,409);
 s=await call({action:'again'},host.token);assert.equal(s.phase,'lobby');assert.equal(s.paused,false);assert.equal(s.cleanBroadcast,false);assert.ok(s.players.every(p=>p.score===0));
 db.raw.close();
}finally{Date.now=realNow}
console.log('PASS v2 clean-broadcast bonus/skip, Echo comeback, useful observation phases, repeated briefing pace, pause privacy/timing/points, legacy flow, twelve-broadcast group finish and scoreboard idempotence.');
