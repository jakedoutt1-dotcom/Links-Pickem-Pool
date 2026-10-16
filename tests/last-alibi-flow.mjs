import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/last-alibi.js';
import {begin,buildCase,finish,solve,view} from '../functions/lib/last-alibi.js';

// Both difficulties retain one evidence-supported culprit and a useful rematch.
for(const difficulty of ['standard','expert'])for(const [mode,count] of [['solo',1],['together',2],['secret',4],['secret',8]])for(let trial=0;trial<20;trial++){
 const s={game:1,flowVersion:2,guided:true,difficulty,mode,minutes:35,owner:'seat0',players:Object.fromEntries(Array.from({length:count},(_,i)=>['seat'+i,{id:'p'+i,name:'Player '+i}]))};
 buildCase(s);
 const cast=s.suspects||s.players,killer=cast[s.case.killer];
 assert.deepEqual(solve(s),[killer.id]);
 for(const row of s.case.timeline){assert.equal(row.deviceStart.slice(0,3),'21:');assert.equal(Number(row.deviceStart.slice(3))-row.offsetMinutes,Number(row.referenceStart.slice(3)));assert.equal(Number(row.referenceEnd.slice(3))-Number(row.referenceStart.slice(3)),6);assert.equal(row.offsetMinutes===0,difficulty==='standard')}
 assert.equal(Number(s.case.timeline[0].referenceStart.slice(3))-Number(s.case.decoy.referenceEnd.slice(3)),4);
 assert.deepEqual(new Set(s.case.timeline.flatMap(row=>row.cleared)),new Set(Object.values(cast).filter(p=>p!==killer).map(p=>p.character.name)));
 const previous={id:killer.id,character:killer.character.id,scene:s.case.scene.id,method:s.case.method.id};
 finish(s);assert.equal(s.revealStep,0);assert.deepEqual(view(s,'',0,true).ending,{});
 begin(s,1000);const nextCast=s.suspects||s.players,nextKiller=nextCast[s.case.killer];
 assert.notEqual(nextKiller.id,previous.id);assert.notEqual(nextKiller.character.id,previous.character);assert.notEqual(s.case.scene.id,previous.scene);assert.notEqual(s.case.method.id,previous.method);assert.equal(s.revealStep,undefined);
}

const {db}=fixture();let code;
async function call(body=null,token='',display=''){
 const r=await onRequest({env:{DB:db},request:new Request('https://alibi.local/new-build/api/last-alibi'+(body?'':'?code='+code),{method:body?'POST':'GET',headers:{Origin:'https://alibi.local','x-alibi-token':token,'x-alibi-display':display},...(body?{body:JSON.stringify({code,game:1,...body})}:{})})});
 return {status:r.status,...await r.json()};
}
function raw(){return JSON.parse(db.raw.prepare('SELECT state FROM links_mystery_rooms WHERE code=?').get(code).state)}
function mutate(fn){const s=raw();fn(s);db.raw.prepare('UPDATE links_mystery_rooms SET state=? WHERE code=?').run(JSON.stringify(s),code)}
const host=await call({action:'create',name:'Host',minutes:35});code=host.code;
assert.equal(host.flowVersion,2);assert.equal(host.difficulty,'standard');
assert.equal((await call({action:'create',name:'Invalid',minutes:35,difficulty:'impossible'})).status,400);
assert.equal((await call({action:'join',name:'TV'},'',host.displayKey)).status,403);assert.equal(Object.keys(raw().players).length,1);
const guest=await call({action:'join',name:'Guest'}),people=[host,guest];
for(const p of people)await call({action:'ready'},p.token);
let state=await call({action:'start'},host.token);
assert.equal(state.phase,'briefing');assert.equal(state.pace.canContinue,false);assert.equal(state.pace.canReady,true);
for(const p of people)await call({action:'chapter-ready',chapter:0},p.token);
state=await call({action:'continue'},host.token);assert.equal(state.status,200);assert.equal(state.chapter,1); // No forced 45-second wait.
state=await call({action:'inspect',chapter:1,id:'window'},host.token);assert.equal(state.progress.collected,1);
assert.equal((await call(null,guest.token)).progress.collected,0);
assert.equal((await call(null,'',host.displayKey)).discovered.length,0);
await call({action:'pause'},host.token);
assert.equal((await call({action:'inspect',chapter:1,id:'dinner'},host.token)).status,409);
assert.equal((await call({action:'share',id:'window'},host.token)).status,409);
assert.equal((await call({action:'chapter-ready',chapter:1},host.token)).status,409);
await call({action:'pause'},host.token);await call({action:'share',id:'window'},host.token);
for(const p of people)await call({action:'chapter-ready',chapter:1},p.token);
state=await call({action:'continue'},host.token);assert.equal(state.chapter,2);assert.equal(state.progress.theoryRequired,true);assert.equal(state.pace.canReady,false);
const first=raw(),culprit=first.suspects[first.case.killer].id,wrong=Object.values(first.suspects).find(p=>p.id!==culprit).id;
assert.equal((await call({action:'chapter-ready',chapter:2},host.token)).status,409);
assert.equal((await call({action:'theory',chapter:2,suspect:culprit,evidence:'envelope'},host.token)).status,400);
await call({action:'inspect',chapter:2,id:'clock-0'},host.token);
assert.equal((await call({action:'theory',chapter:2,suspect:culprit,evidence:'clock-0'},guest.token)).status,400);
await call({action:'pause'},host.token);assert.equal((await call({action:'theory',chapter:2,suspect:wrong,evidence:'clock-0'},host.token)).status,409);await call({action:'pause'},host.token);
state=await call({action:'theory',chapter:2,suspect:wrong,evidence:'clock-0'},host.token);
assert.deepEqual(state.theory,{chapter:2,suspect:wrong,evidence:'clock-0'});assert.equal(state.pace.canReady,true);assert.equal(state.progress.theoryCount,1);assert.equal(JSON.stringify(state).includes('correctSuspect'),false);
const other=await call(null,guest.token),tv=await call(null,'',host.displayKey);
assert.equal(other.theory,null);assert.equal(tv.theory,null);assert.equal(other.players.filter(p=>p.theorySubmitted).length,1);assert.equal(other.discovered.some(e=>e.id==='clock-0'),false);
await call({action:'chapter-ready',chapter:2},host.token);
state=await call({action:'theory',chapter:2,suspect:wrong,evidence:'window'},host.token);assert.equal(state.players.find(p=>p.you).chapterReady,false);
await call({action:'theory',chapter:2,suspect:culprit,evidence:'window'},guest.token);
for(const p of people)await call({action:'chapter-ready',chapter:2},p.token);
state=await call({action:'continue'},host.token);assert.equal(state.chapter,3);assert.equal(state.theory,null);assert.equal(state.progress.theoryRequired,false);
assert.equal((await call({action:'theory',chapter:2,suspect:wrong,evidence:'window'},host.token)).status,409);
for(const p of people)await call({action:'chapter-ready',chapter:3},p.token);
state=await call({action:'continue'},host.token);assert.equal(state.chapter,4);
for(const p of people){await call({action:'theory',chapter:4,suspect:culprit,evidence:'recording'},p.token);await call({action:'chapter-ready',chapter:4},p.token)}
state=await call({action:'continue'},host.token);assert.equal(state.phase,'accuse');
const finalCase=raw().case;
for(const p of people)await call({action:'accuse',suspect:culprit,scene:finalCase.scene.id,object:finalCase.object,evidence:'window'},p.token);
state=await call({action:'continue'},host.token);assert.equal(state.phase,'ended');assert.equal(state.revealStep,0);assert.deepEqual(state.ending,{});assert.ok(state.players.every(p=>p.score===undefined&&p.killer===undefined&&p.accusation===undefined));
const savedResults=db.raw.prepare('SELECT COUNT(*) AS n FROM links_party_results WHERE game=? AND room=?').get('last-alibi',code).n;assert.equal(savedResults,2);
assert.equal((await call({action:'accuse',suspect:culprit,scene:finalCase.scene.id,object:finalCase.object,evidence:'window'},host.token)).status,409);
assert.equal((await call({action:'reveal',step:0},guest.token)).status,403);assert.equal((await call({action:'reveal',step:0},'',host.displayKey)).status,403);assert.equal((await call({action:'reveal',step:1},host.token)).status,409);
for(let step=0;step<4;step++){
 state=await call({action:'reveal',step},host.token);assert.equal(state.status,200);assert.equal(state.revealStep,step+1);
 const screen=await call(null,'',host.displayKey);assert.equal(screen.revealStep,state.revealStep);
 if(step===0){assert.equal(state.ending.timeline.length,3);assert.equal(state.ending.answer.suspectId,undefined);assert.equal(state.ending.culprit,undefined);assert.equal(state.ending.caught,undefined);assert.equal(state.ending.story,undefined)}
 if(step===1){assert.equal(state.ending.answer.suspectId,culprit);assert.equal(state.ending.caught,true);assert.equal(state.ending.story,undefined)}
 if(step===2){assert.ok(state.ending.story);assert.equal(state.ending.evidence.length,12);assert.equal(state.ending.theoryFeedback,undefined)}
 if(step<3)assert.ok(state.players.every(p=>p.score===undefined&&p.killer===undefined&&p.accusation===undefined));
}
assert.ok(state.players.every(p=>p.score===700));assert.deepEqual(state.ending.theoryFeedback.map(t=>t.correctSuspect),[false,true]);assert.deepEqual((await call(null,'',host.displayKey)).ending.theoryFeedback,[]);
assert.equal((await call({action:'reveal',step:4},host.token)).status,409);assert.equal((await call({action:'reveal',step:0},host.token)).status,409);
assert.equal(db.raw.prepare('SELECT COUNT(*) AS n FROM links_party_results WHERE game=? AND room=?').get('last-alibi',code).n,savedResults);
state=await call({action:'again'},host.token);assert.equal(state.game,2);assert.equal(state.phase,'lobby');assert.equal(state.revealStep,null);assert.equal(state.theory,null);assert.equal(state.ending,undefined);
assert.ok(Object.values(raw().players).every(p=>Object.keys(p.theories).length===0&&!p.chapterReady&&p.score===0));

// An older active room retains its wait rule, expert clocks and direct ending.
const legacy=await call({action:'create',mode:'solo',name:'Legacy',minutes:35,difficulty:'expert'});code=legacy.code;
assert.equal(legacy.difficulty,'expert');mutate(s=>{delete s.flowVersion;delete s.difficulty});
await call({action:'ready'},legacy.token);await call({action:'start'},legacy.token);await call({action:'chapter-ready',chapter:0},legacy.token);
assert.equal((await call({action:'continue'},legacy.token)).status,409);
mutate(s=>s.phaseStarted=Date.now()-46000);state=await call({action:'continue'},legacy.token);assert.equal(state.status,200);assert.equal(state.flowVersion,1);assert.equal(state.difficulty,'expert');
mutate(s=>{s.chapter=2;s.phaseStarted=Date.now()-46000});state=await call(null,legacy.token);assert.equal(state.progress.theoryRequired,false);assert.equal((await call({action:'chapter-ready',chapter:2},legacy.token)).status,200);
mutate(s=>{s.guided=false;s.phase='accuse';s.deadline=Date.now()-1});state=await call(null,legacy.token);assert.equal(state.phase,'ended');assert.equal(state.revealStep,4);assert.ok(state.ending.culprit);assert.ok(state.players.every(p=>typeof p.score==='number'));
db.raw.close();
console.log('PASS v2 standard/expert unique solutions and rematches; private editable theories, pause/ready rules, immediate guided progression, synchronized gated reveal, scoreboard idempotence, legacy active-room compatibility.');
