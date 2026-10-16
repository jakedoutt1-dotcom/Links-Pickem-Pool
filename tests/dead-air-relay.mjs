import assert from 'node:assert/strict';
import {advance,pause,puzzle,respond,start,view,RELAY_EXITS} from '../functions/lib/dead-air.js';

const seenExits=new Set(),boards=new Set();
for(let level=0;level<3;level++)for(let i=0;i<200;i++){
 const c=puzzle('relay',1,level),route=[];let cell=c.start,exit;
 assert.equal(c.size,4);assert.equal(c.cells.length,16);assert.equal(c.route.length>=7+level&&c.route.length<=9+level,true);
 while(cell>=0){
  assert.equal(route.includes(cell),false,'Live route must never loop');route.push(cell);
  const direction=c.cells[cell],row=Math.floor(cell/4),column=cell%4;
  assert.ok(Number.isInteger(direction)&&direction>=0&&direction<4);
  const outside=direction===0?row===0:direction===1?column===3:direction===2?row===3:column===0;
  if(outside){exit=direction;cell=-1}else cell+=[-4,1,4,-1][direction];
 }
 assert.deepEqual(route,c.route);assert.equal(exit,c.correct);seenExits.add(exit);boards.add(c.cells.join(',')+':'+c.start);
}
assert.equal(seenExits.size,4);assert.ok(boards.size>580,'Procedural boards should vary between broadcasts');

function room(mode='solo'){const s={game:1,flowVersion:2,mode,owner:'a',players:{a:{name:'A'}}};start(s,1000);return s}
const solo=room(),friends=room('friends');assert.deepEqual([...solo.puzzleOrder].sort(),['evidence','frequency','relay','signal']);assert.equal(new Set(friends.puzzleOrder).size,5);
const s=room();advance(s,s.deadline);advance(s,s.deadline);s.puzzleOrder=['relay'];advance(s,s.deadline);
assert.equal(s.phase,'brief');assert.equal(s.deadline-s.startsAt,10000);
for(const display of [false,true]){const v=view(s,display?'':'a',s.startsAt,display);assert.equal(v.challenge.cells,undefined);assert.equal(v.challenge.start,undefined);assert.equal(v.challenge.route,undefined);assert.equal(v.challenge.correct,undefined)}
advance(s,s.deadline);assert.equal(s.phase,'challenge');assert.equal(s.deadline-s.startsAt,30000);
for(const display of [false,true]){const v=view(s,display?'':'a',s.startsAt,display);assert.equal(v.challenge.cells.length,16);assert.equal(v.challenge.start,s.challenge.start);assert.deepEqual(v.challenge.exits,RELAY_EXITS);assert.equal(v.challenge.route,undefined);assert.equal(v.challenge.correct,undefined);assert.equal(v.outcome,undefined);assert.equal(v.results,undefined)}
for(const answer of [-1,4,1.5,'1',[1]])assert.throws(()=>respond(s,'a',answer,s.startsAt),/available answers/);
respond(s,'a',(s.challenge.correct+1)%4,s.startsAt);respond(s,'a',s.challenge.correct,s.startsAt+1000);
const deadline=s.deadline;pause(s,s.startsAt+2000,true);pause(s,s.startsAt+12000,false);assert.equal(s.deadline,deadline+10000);
advance(s,s.deadline);assert.equal(s.phase,'result');assert.equal(s.players.a.score,150);assert.equal(s.players.a.lives,3);assert.deepEqual(view(s,'a',s.startsAt).outcome.route,s.challenge.route);

// A single reveal covers protected misses, danger, a lost signal and both Echo outcomes.
const outcomes=room('friends'),c=puzzle('relay',7),correct=c.correct,wrong=(correct+1)%4;
outcomes.players={
 held:{name:'Held',score:0,lives:1,atRisk:true,echoCharge:0},safe:{name:'Safe',score:0,lives:3,atRisk:false,echoCharge:0},
 lost:{name:'Lost',score:0,lives:2,atRisk:true,echoCharge:0},faded:{name:'Faded',score:0,lives:1,atRisk:true,echoCharge:0},
 charged:{name:'Charged',score:0,lives:0,atRisk:false,echoCharge:0},returned:{name:'Returned',score:0,lives:0,atRisk:false,echoCharge:1},
 echo:{name:'Echo',score:0,lives:0,atRisk:false,echoCharge:1}
};
Object.assign(outcomes,{phase:'challenge',challenge:c,startsAt:1000,deadline:31000,responses:{}});
for(const id of ['held','charged','returned'])respond(outcomes,id,correct,1000);
for(const id of ['safe','lost','faded'])respond(outcomes,id,wrong,1000);
advance(outcomes,outcomes.deadline);
for(const id of Object.keys(outcomes.players)){
 const v=view(outcomes,id,outcomes.startsAt),own=v.results.find(r=>r.you);
 assert.equal(v.results.filter(r=>r.you).length,1);assert.equal(own.outcome,id);assert.equal(own.name,outcomes.players[id].name);assert.equal(own.playerId,undefined);
 assert.equal(own.solution,RELAY_EXITS[correct]+' exit');assert.equal(own.points,['held','charged','returned'].includes(id)?150:0);
}
assert.equal(outcomes.players.safe.lives,3);assert.equal(outcomes.players.lost.lives,1);assert.equal(outcomes.players.faded.lives,0);assert.equal(outcomes.players.charged.echoCharge,1);assert.equal(outcomes.players.returned.lives,1);assert.equal(outcomes.players.returned.echoCharge,0);assert.equal(outcomes.players.echo.echoCharge,1);
const missed=view(outcomes,'echo',outcomes.startsAt).results.find(r=>r.you);assert.equal(missed.answered,false);assert.equal(missed.choice,'No answer saved');
assert.ok(view(outcomes,'',outcomes.startsAt,true).results.every(r=>r.you===false&&!('playerId' in r)));

// Persisted four-type rotations keep their sequence; new fifth types never overwrite them.
const old=room('friends');old.puzzleOrder=['signal','evidence','frequency','power'];
for(let cycle=0;cycle<12;cycle++){old.phase='answer';old.cleanBroadcast=false;old.cycle=cycle;old.deadline=1000;advance(old,1000);assert.equal(old.challenge.type,old.puzzleOrder[cycle%4])}
console.log('PASS 600 unique Relay Trace boards, all exits, solo/five-type variety, legacy rotation, 30s timer/pause, sealed active solutions, answer edits, +150 scoring and every personal survival/Echo outcome.');
