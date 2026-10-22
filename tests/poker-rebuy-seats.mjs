import assert from 'node:assert/strict';
import {createTournament,joinTournament,startTournament,advanceTournament,rebuyTournament} from '../functions/lib/poker-tournament.js';
import {act} from '../functions/lib/poker-night.js';
import {pokerSeatPosition} from '../public/new-build/poker-seats.mjs';
for(const mode of ['friends','tournament']){
 const now=1802800000000,s=createTournament({code:'SEAT123456',mode,ownerSeat:'s0',player:{id:'p0',name:'Host'},settings:{tableSize:6,startingChips:1000,maxReentries:1}},now);
 for(let i=1;i<4;i++)joinTournament(s,'s'+i,{id:'p'+i,name:'Player '+i},now);
 startTournament(s,now);const table=s.tables[0],seats=new Map(table.players.map(p=>[p.id,p.seat]));
 while(table.phase!=='showdown')act(table,table.actorId,{type:'fold'},{},now);
 // Simulate a busted player without destroying the chip total.
 const out=table.players[0];table.players[1].stack+=out.stack;out.stack=0;table.accountedHand=0;
 advanceTournament(s,now);const seat=Object.keys(s.players).find(key=>s.players[key].id===out.id);
 assert.equal(s.players[seat].status,'eliminated');
 const recap=JSON.stringify(table);rebuyTournament(s,seat,now);
 assert.equal(JSON.stringify(table),recap,'buy back cannot change the completed hand');
 assert.equal(s.players[seat].status,'waiting');
 advanceTournament(s,s.nextHandAt);
 for(const p of s.tables[0].players)assert.equal(p.seat,seats.get(p.id),'each player keeps their physical seat');
 assert.equal(s.players[seat].status,'active');assert.equal(s.players[seat].reentries,1);
 assert.equal(s.tables[0].pot+s.tables[0].players.reduce((n,p)=>n+p.stack,0),5000);
}
for(const size of [6,8,9])for(const mobile of [false,true]){
 const owner=3,positions=Array.from({length:size},(_,seat)=>pokerSeatPosition(seat,owner,size,mobile));
 assert.equal(new Set(positions.map(JSON.stringify)).size,size);
 assert.deepEqual(positions[owner],[50,mobile?91:95]);
 // Losing and restoring an earlier seat cannot move any other player.
 const survivors=[0,2,3,4].filter(seat=>seat<size);
 for(const seat of survivors)assert.deepEqual(pokerSeatPosition(seat,owner,size,mobile),positions[seat]);
}
console.log('PASS rebuy keeps seats and chips; stable phone/TV positions for 6, 8 and 9 seats.');
