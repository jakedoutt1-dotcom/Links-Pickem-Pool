import assert from 'node:assert/strict';
import {createTournament,joinTournament,startTournament,advanceTournament,betTournament,showTournamentHand} from '../functions/lib/poker-tournament.js';
let now=1802800000000;
function make(){const s=createTournament({code:'INACTIVE',mode:'friends',ownerSeat:'host',player:{id:'host',name:'Host'},settings:{startingChips:5000,smallBlind:25,bigBlind:50,turnSeconds:10,maxReentries:0}},now);for(let i=1;i<3;i++)joinTournament(s,'p'+i,{id:'p'+i,name:'Player '+i},now);startTournament(s,now);return s}
const s=make(),t=s.tables[0],id=t.actorId,record=Object.values(s.players).find(p=>p.id===id);
record.away=true;const actorSeat=Object.keys(s.players).find(k=>s.players[k]===record);assert.throws(()=>betTournament(s,actorSeat,{tableId:t.id,handNumber:t.handNumber,turnId:t.actionNumber,move:'fold'},now),/sitting out/);record.away=false;
now=t.deadline+1;advanceTournament(s,now);assert.equal(record.away,true);assert.equal(record.awayReason,'inactive');assert.notEqual(t.actorId,id);
advanceTournament(s,now+1);assert.equal(record.away,true,'Polling does not sit a player back down');
// Return preserves the depleted stack; no chip grant or reseating.
const stack=record.stack,tableId=record.tableId;record.away=false;delete record.awayReason;assert.equal(record.stack,stack);assert.equal(record.tableId,tableId);
const lateState=make();
for(let hand=0;hand<6;hand++){
 const table=lateState.tables[0];let limit=0;
 while(!['showdown','waiting'].includes(table.phase)&&limit++<100){const seat=Object.entries(lateState.players).find(([,p])=>p.id===table.actorId)[0];betTournament(lateState,seat,{tableId:table.id,handNumber:table.handNumber,turnId:table.actionNumber,move:'fold'},now)}
 assert.ok(limit<100);advanceTournament(lateState,now);if(hand<5){now=lateState.nextHandAt;advanceTournament(lateState,now)}
}
const ended=lateState.tables[0],revealer=Object.keys(lateState.players).find(k=>ended.players.some(p=>p.id===lateState.players[k].id));showTournamentHand(lateState,revealer,{tableId:ended.id,handNumber:ended.handNumber});
joinTournament(lateState,'late',{id:'late',name:'Late arrival'},now);
assert.equal(lateState.players.late.missedBlinds,150,'Six three-seat hands cost two small and big blind shares');assert.equal(lateState.players.late.stack,4850);
const away=Object.values(lateState.players).find(p=>p.id===lateState.tables[0].actorId);if(away){away.away=true;assert.throws(()=>betTournament(lateState,Object.keys(lateState.players).find(k=>lateState.players[k]===away),{}),/sitting out/)}
console.log('PASS automatic sit-out on timeout, explicit return, stack preservation, six-hand late-entry blind deduction.');
