import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/poker-night.js';
import {createTable,startHand,act,showHand,publicTable} from '../functions/lib/poker-night.js';

const {db}=fixture(),originalNow=Date.now;
let now=1802800000000;Date.now=()=>now;
async function call(body,credentials={},query={}){
 const response=await onRequest({env:{DB:db},request:new Request('https://poker.test/new-build/api/poker-night?'+new URLSearchParams(query),{
  method:body?'POST':'GET',headers:{Origin:'https://poker.test','x-poker-token':credentials.playerToken||'','x-poker-host':credentials.hostToken||'','x-poker-display':credentials.displayKey||''},
  ...(body?{body:JSON.stringify({requestId:crypto.randomUUID(),...body})}:{})
 })});
 return {http:response.status,...await response.json()};
}
const stored=code=>JSON.parse(db.raw.prepare('SELECT state FROM links_poker_night_rooms WHERE code=?').get(code).state);
const chipState=table=>JSON.stringify({pot:table.pot,lastPot:table.lastPot,winners:table.winners,stacks:table.players.map(p=>[p.id,p.stack]),turn:table.actionNumber,deadline:table.deadline,handEndsAt:table.handEndsAt});

try{
 const host=await call({action:'create',name:'Host',mode:'friends',settings:{startingChips:1000,maxReentries:0}});assert.equal(host.http,200);
 const code=host.room.code,players=[host];
 for(const name of ['Guest One','Guest Two'])players.push(await call({action:'join',code,name}));
 const sessions=new Map(players.map(p=>[p.session.playerId,p.session]));
 const started=await call({action:'start',code},host.session);let table=started.room.table;
 const foldedId=table.actorId,folded=sessions.get(foldedId),winnerBefore=new Set(table.players.map(p=>p.id));
 const privateCards=(await call(null,folded,{code})).room.table.players.find(p=>p.id===foldedId).holeCards;
 const show={action:'show',code,tableId:table.id,handNumber:table.handNumber};
 assert.equal(table.canShowHand,false);
 assert.equal((await call(show,folded)).code,'CANNOT_SHOW_HAND','show cannot reveal a live hand');
 await call({action:'bet',code,tableId:table.id,handNumber:table.handNumber,turnId:table.turnId,move:'fold'},folded);
 assert.equal((await call(show,folded)).code,'CANNOT_SHOW_HAND','folding does not allow revealing while opponents still play');
 table=(await call(null,host.session,{code})).room.table;
 assert.equal(table.phase,'preflop');assert.ok(table.players.filter(p=>p.id!==host.session.playerId).every(p=>p.holeCards.length===0));
 await call({action:'bet',code,tableId:table.id,handNumber:table.handNumber,turnId:table.turnId,move:'fold'},sessions.get(table.actorId));
 const tv={displayKey:host.room.displayKey};
 table=(await call(null,tv,{code,tv:1})).room.table;
 assert.equal(table.phase,'showdown');assert.equal(table.showCards,false);assert.equal(table.canShowHand,false);
 assert.ok(table.players.every(p=>p.holeCards.length===0&&!p.cardsShown&&!p.voluntaryShown),'uncontested winner stays hidden too');
 const winnerId=table.winners[0].playerId;assert.ok(winnerBefore.has(winnerId));
 assert.equal((await call(null,folded,{code})).room.table.canShowHand,true);
 assert.equal((await call(null,sessions.get(winnerId),{code})).room.table.canShowHand,true);
 assert.equal((await call(show,{})).http,401);assert.equal((await call(show,tv)).http,403);
 assert.equal((await call(show,{hostToken:host.session.hostToken})).code,'CANNOT_SHOW_HAND','host authority alone cannot expose player cards');
 assert.equal((await call({...show,handNumber:999},folded)).code,'STALE_HAND');
 const immutable=chipState(stored(code).tables[0]);
 const request={...show,requestId:crypto.randomUUID(),playerId:winnerId,cards:['As','Ah']};
 const revealed=await call(request,folded);assert.equal(revealed.http,200);assert.equal(revealed.room.table.canShowHand,false);
 assert.equal(chipState(stored(code).tables[0]),immutable,'show does not change chips, payouts, turn or timer');
 table=(await call(null,tv,{code,tv:1})).room.table;
 assert.deepEqual(table.players.find(p=>p.id===foldedId).holeCards,privateCards);
 assert.equal(table.players.find(p=>p.id===foldedId).voluntaryShown,true);assert.equal(table.players.find(p=>p.id===foldedId).cardsShown,true);
 assert.equal(table.players.find(p=>p.id===winnerId).holeCards.length,0,'forged playerId cannot reveal a different person');
 assert.equal((await call(request,folded)).http,200);assert.equal((await call(show,folded)).http,200);
 assert.equal(chipState(stored(code).tables[0]),immutable,'same-hand retries are idempotent');
 assert.equal((await call(show,sessions.get(winnerId))).http,200);
 table=(await call(null,tv,{code,tv:1})).room.table;assert.equal(table.players.find(p=>p.id===winnerId).holeCards.length,2);
 assert.equal(table.players.filter(p=>p.voluntaryShown).length,2);
 assert.equal(table.players.filter(p=>!p.voluntaryShown)[0].holeCards.length,0);
 now=stored(code).nextHandAt;
 table=(await call(null,tv,{code,tv:1})).room.table;assert.equal(table.handNumber,show.handNumber+1);
 assert.ok(table.players.every(p=>p.holeCards.length===0&&!p.voluntaryShown&&!p.cardsShown),'next deal restores privacy for all players');
 assert.equal((await call(show,folded)).code,'STALE_HAND');
 assert.equal((await call(request,folded)).http,200,'an old identical retry cannot reveal the new hand');
 assert.ok((await call(null,tv,{code,tv:1})).room.table.players.every(p=>!p.voluntaryShown&&p.holeCards.length===0));

 // A host-only tournament spectator and a player at another table have no
 // authority over this table, even after its hand is complete.
 const event=await call({action:'create',name:'Venue Host',mode:'tournament',hostOnly:true,settings:{tableSize:6,maxReentries:0}}),eventPlayers=[];
 for(let i=0;i<8;i++)eventPlayers.push(await call({action:'join',code:event.room.code,name:'Player '+i}));
 const eventStarted=await call({action:'start',code:event.room.code},event.session),eventTable=eventStarted.room.tables[0];
 const eventSessions=new Map(eventPlayers.map(p=>[p.session.playerId,p.session]));
 let eventView=eventTable;
 while(eventView.phase!=='showdown'){
  const result=await call({action:'bet',code:event.room.code,tableId:eventView.id,handNumber:eventView.handNumber,turnId:eventView.turnId,move:'fold'},eventSessions.get(eventView.actorId));
  assert.equal(result.http,200);eventView=result.room.tables.find(t=>t.id===eventTable.id);
 }
 const eventShow={action:'show',code:event.room.code,tableId:eventView.id,handNumber:eventView.handNumber};
 assert.equal((await call(eventShow,event.session)).code,'CANNOT_SHOW_HAND');
 const otherTablePlayer=eventStarted.room.tables[1].players[0];
 assert.equal((await call(eventShow,eventSessions.get(otherTablePlayer.id))).code,'CANNOT_SHOW_HAND');
 assert.equal((await call(eventShow,eventSessions.get(eventView.players[0].id))).http,200);

 // The normal showdown still shows competing hands automatically. A player
 // who folded earlier can opt in, but their cards never affect the result.
 const contested=createTable('test',[{id:'A',stack:1000,seat:0},{id:'B',stack:1000,seat:1},{id:'C',stack:1000,seat:2}]);
 startHand(contested,{},now);act(contested,'A',{type:'fold'},{},now);
 while(contested.phase!=='showdown'){
  const legal=publicTable(contested,contested.actorId).legalActions;act(contested,contested.actorId,{type:legal.canCheck?'check':'call'},{},now);
 }
 assert.equal(contested.showCards,true);let publicContested=publicTable(contested,null,{tv:true});
 assert.equal(publicContested.players.find(p=>p.id==='A').holeCards.length,0);
 assert.ok(publicContested.players.filter(p=>p.id!=='A').every(p=>p.cardsShown&&p.holeCards.length===2&&!p.voluntaryShown));
 assert.equal(publicTable(contested,'B').canShowHand,false);
 const contestResult=chipState(contested);showHand(contested,'A');assert.equal(chipState(contested),contestResult);
 assert.equal(publicTable(contested,null,{tv:true}).players.find(p=>p.id==='A').holeCards.length,2);

 // Practice has no Show hand control or API operation, including completed
 // hands where a multiplayer player would otherwise have the option.
 const practice=await call({action:'create',mode:'practice',name:'Learner',settings:{botCount:1}});await call({action:'start',code:practice.room.code},practice.session);
 const state=stored(practice.room.code),practiceTable=state.tables[0];
 while(practiceTable.phase!=='showdown')act(practiceTable,practiceTable.actorId,{type:'fold'},{},now);
 db.raw.prepare('UPDATE links_poker_night_rooms SET state=? WHERE code=?').run(JSON.stringify(state),practice.room.code);
 const practiceView=(await call(null,practice.session,{code:practice.room.code})).room;
 assert.equal(practiceView.table.canShowHand,false);
 assert.equal((await call({action:'show',code:practice.room.code,tableId:practiceTable.id,handNumber:practiceTable.handNumber},practice.session)).code,'CANNOT_SHOW_HAND');
 await call({action:'close',code},host.session);assert.equal((await call({...show,handNumber:table.handNumber},folded)).http,409);
 console.log('PASS multiplayer-only voluntary Show hand: own cards, after-hand lock, default hidden fold wins, TV/player visibility, normal showdown, retries, stale/new-hand privacy, host/other-table denial and practice exclusion.');
}finally{Date.now=originalNow;db.raw.close();}
