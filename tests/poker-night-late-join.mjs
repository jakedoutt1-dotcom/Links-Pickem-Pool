import assert from 'node:assert/strict';
import {createTournament,joinTournament,startTournament,advanceTournament,tournamentView,betTournament,pauseTournament,resumeTournament} from '../functions/lib/poker-tournament.js';
import {act} from '../functions/lib/poker-night.js';
const now=1802800000000;
function game(mode,count=2){
 const s=createTournament({code:'LATE123456',mode,ownerSeat:'s0',hostHash:'h',displayKey:'tv',player:{id:'p0',name:'Host'},settings:{tableSize:6,startingChips:1000,maxReentries:0}},now);
 for(let i=1;i<count;i++)joinTournament(s,'s'+i,{id:'p'+i,name:'Player '+i},now);
 startTournament(s,now);return s;
}
for(const mode of ['friends','tournament']){
 const s=game(mode,mode==='friends'?2:12),before=JSON.stringify(s.tables);
 joinTournament(s,'late',{id:'late',name:'Late'},now+1);
 assert.equal(s.players.late.status,'waiting');assert.equal(s.players.late.stack,1000);
 assert.equal(JSON.stringify(s.tables),before,'live hands remain unchanged');
 assert.equal(s.players.late.reentries,0);
 const view=tournamentView(s,'late',{},now+1);
 assert.ok(view.tables.every(t=>t.players.every(p=>p.holeCards.length===0)));
 assert.throws(()=>betTournament(s,'late',{},now+1),/not seated/);
 joinTournament(s,'late',{id:'late',name:'Late'},now+2);
 assert.equal(Object.values(s.players).filter(p=>p.id==='late').length,1);
 pauseTournament(s,now+2);joinTournament(s,'paused',{id:'paused',name:'Paused arrival'},now+3);
 assert.equal(s.players.paused.status,'waiting');assert.equal(JSON.stringify(s.tables),before);
 advanceTournament(s,now+100);assert.equal(s.players.late.status,'waiting');resumeTournament(s,now+100);
 // One finished table does not admit late arrivals while another still plays.
 while(s.tables[0].phase!=='showdown')act(s.tables[0],s.tables[0].actorId,{type:'fold'},{},now+100);
 advanceTournament(s,now+100);assert.equal(s.players.late.status,'waiting');
 for(const t of s.tables)while(t.phase!=='showdown')act(t,t.actorId,{type:'fold'},{},now+100);
 advanceTournament(s,now+100);advanceTournament(s,s.nextHandAt);
 for(const id of ['late','paused']){assert.equal(s.players[id].status,'active');const t=s.tables.find(t=>t.id===s.players[id].tableId);assert.equal(t.players.find(p=>p.id===id).holeCards.length,2);}
 assert.ok(s.tables.every(t=>t.players.length<=6));
 const total=s.tables.reduce((n,t)=>n+t.pot+t.players.reduce((n,p)=>n+p.stack,0),0);
 assert.equal(total,(mode==='friends'?4:14)*1000);
 for(const status of ['finished','closed']){s.status=status;assert.throws(()=>joinTournament(s,'rejected',{id:'rejected',name:'Rejected'}),/ended/);}
}
const full=game('friends',6);assert.throws(()=>joinTournament(full,'extra',{id:'extra',name:'Extra'}),/full/);
const practice=game('practice',1);assert.throws(()=>joinTournament(practice,'extra',{id:'extra',name:'Extra'}),/Practice/);
// Four completed four-player hands cost one whole blind rotation (25 + 50).
const charged=game('friends',4);
let clock=now;
for(let round=0;round<4;round++){
 for(const t of charged.tables)while(t.phase!=='showdown')act(t,t.actorId,{type:'fold'},{},clock);
 advanceTournament(charged,clock);
 if(round<3){clock=charged.nextHandAt;advanceTournament(charged,clock);}
}
const beforeCharge=JSON.stringify(charged.tables);
joinTournament(charged,'charged',{id:'charged',name:'Charged'},clock);
assert.equal(charged.players.charged.missedBlinds,75);
assert.equal(charged.players.charged.stack,925);
assert.equal(tournamentView(charged,'charged').missedBlinds,75);
assert.equal(JSON.stringify(charged.tables),beforeCharge,'deduction cannot change any pot');
joinTournament(charged,'charged',{id:'charged',name:'Charged'},clock);
assert.equal(charged.players.charged.stack,925,'reconnect cannot charge twice');
advanceTournament(charged,charged.nextHandAt);
assert.equal(charged.players.charged.status,'active');
const bankroll=charged.tables.reduce((n,t)=>n+t.pot+t.players.reduce((n,p)=>n+p.stack,0),0);
assert.equal(bankroll,4925,'only the net starting stack enters play');
// Keep the actual earlier rate when the tournament's blinds increase.
const levels=game('tournament',4);
for(const t of levels.tables)while(t.phase!=='showdown')act(t,t.actorId,{type:'fold'},{},now);
advanceTournament(levels,now);
const higher=now+levels.settings.blindMinutes*60000;
advanceTournament(levels,higher);
assert.equal(levels.tables[0].bigBlind,100);
for(const t of levels.tables)while(t.phase!=='showdown')act(t,t.actorId,{type:'fold'},{},higher);
joinTournament(levels,'levelLate',{id:'levelLate',name:'Level late'},higher);
assert.equal(levels.players.levelLate.missedBlinds,57,'ceil(75/4 + 150/4), not all at the new rate');
// Old running rooms without history use the current blind/seat rate.
const old=game('tournament',4);old.round=5;delete old.lateEntryBlindShare;delete old.lateEntryAccountedRound;
joinTournament(old,'oldLate',{id:'oldLate',name:'Old late'},now);
assert.equal(old.players.oldLate.missedBlinds,75);
const tooLate=game('friends',2);tooLate.lateEntryBlindShare=1000;tooLate.lateEntryAccountedRound=tooLate.round;
assert.throws(()=>joinTournament(tooLate,'out',{id:'out',name:'Out'}),/starting stack/);
assert.equal(tooLate.players.out,undefined);
console.log('PASS late joins: friends/tournament/paused, private cards, between-round seating, capacity, chips and ended-room protection.');
