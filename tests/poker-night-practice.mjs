import assert from 'node:assert/strict';
import {createTournament,startTournament,advanceTournament,joinTournament,tournamentView,betTournament} from '../functions/lib/poker-tournament.js';
import {partyOutcomes} from '../functions/lib/party-scoreboard.js';
import {onRequest} from '../functions/new-build/api/poker-night.js';
import {fixture} from './helpers/pool-format-fixture.mjs';

let now=1802800000000;
const practice=createTournament({code:'B0BAA01234',mode:'practice',ownerSeat:'human',hostHash:'hash',displayKey:'display',player:{id:'human-id',name:'Human'},settings:{startingChips:1000,tableSize:6,botCount:2}},now);
assert.equal(Object.keys(practice.players).length,3);assert.equal(Object.values(practice.players).filter(p=>p.bot).length,2);assert.equal(practice.settings.maxReentries,0);
assert.throws(()=>joinTournament(practice,'guest',{id:'guest',name:'Guest'},now),/Practice/);
startTournament(practice,now);let computerActions=0,lastAction=0;
for(let i=0;i<80&&practice.status==='playing';i++){
 now+=1500;advanceTournament(practice,now);
 const table=practice.tables[0];if(table.actionNumber!==lastAction){lastAction=table.actionNumber;if(Object.values(practice.players).some(p=>p.bot&&p.id===table.lastAction?.playerId))computerActions++;}
 assert.equal(table.players.reduce((sum,p)=>sum+p.stack,0)+table.pot,3000);
 const view=tournamentView(practice,'human',{},now);
 for(const p of view.table.players)if(view.table.phase!=='showdown')assert.equal(p.holeCards.length,p.id==='human-id'?2:0);
 if(table.actorId==='human-id'){
  const l=view.table.legalActions;betTournament(practice,'human',{tableId:table.id,handNumber:table.handNumber,turnId:table.actionNumber,move:l.canCheck?'check':'call'},now);
 }
}
assert.ok(computerActions>=4,'Computer opponents must act without host controls');
const ended={...practice,phase:'ended'};assert.deepEqual(partyOutcomes('poker-night',ended),[],'Practice never awards public competitive points');

const {db}=fixture();
async function call(body,session={}){
 const response=await onRequest({env:{DB:db},request:new Request('https://poker.test/new-build/api/poker-night',{method:'POST',headers:{Origin:'https://poker.test','x-poker-token':session.playerToken||'','x-poker-host':session.hostToken||''},body:JSON.stringify({requestId:crypto.randomUUID(),...body})})});
 return {http:response.status,...await response.json()};
}
const host=await call({action:'create',name:'Venue Host',mode:'tournament',hostOnly:true});assert.equal(host.http,200);assert.equal(host.room.players.length,0);assert.equal(host.room.playerId,null);assert.equal(host.room.isHost,true);
const code=host.room.code;
assert.equal((await call({action:'start',code},host.session)).http,409);
const one=await call({action:'join',code,name:'One'}),two=await call({action:'join',code,name:'Two'});
assert.equal(one.http,200);assert.equal(two.http,200);const started=await call({action:'start',code},host.session);assert.equal(started.http,200);assert.equal(started.room.players.length,2);assert.equal(started.room.playerId,null);assert.ok(started.room.table.players.every(p=>p.holeCards.length===0));
assert.equal((await call({action:'bet',code,tableId:started.room.table.id,handNumber:1,turnId:started.room.table.turnId,move:'call'},host.session)).http,409);
assert.equal((await call({action:'pause',code},host.session)).http,200);
const practiceApi=await call({action:'create',mode:'practice',name:'Learner',settings:{botCount:1}});assert.equal(practiceApi.http,200);assert.equal(practiceApi.room.players.length,2);assert.equal((await call({action:'start',code:practiceApi.room.code},practiceApi.session)).http,200);
db.raw.close();console.log('PASS server-only practice opponents, private cards and chips, no public practice results, host-only events and no host card access or betting.');
