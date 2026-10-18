import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {createTournament,joinTournament,startTournament,advanceTournament,betTournament,tournamentView,rebuyTournament} from '../functions/lib/poker-tournament.js';
import {publicTable} from '../functions/lib/poker-night.js';

// Use the real cryptographic generator, recording requests rather than replacing
// randomness with a seeded deck. A hand must never rely on Math.random.
const cryptoDescriptor=Object.getOwnPropertyDescriptor(globalThis,'crypto');
const originalRandom=Math.random;
let cryptoCalls=0;
Object.defineProperty(globalThis,'crypto',{configurable:true,value:{
 getRandomValues(values){cryptoCalls++;return webcrypto.getRandomValues(values);},
 randomUUID:()=>webcrypto.randomUUID(),subtle:webcrypto.subtle
}});
Math.random=()=>{throw new Error('Poker dealing must not use Math.random');};

let now=1802800000000;
function game(mode,count,settings={}){
 const state=createTournament({code:'ABCD012345',mode,ownerSeat:'seat-0',hostHash:'host',displayKey:'tv',player:{id:'player-0',name:'Player 0'},settings:{startingChips:1000,tableSize:9,maxReentries:0,botCount:Math.min(8,Math.max(1,count-1)),turnSeconds:30,...settings}},now);
 if(mode!=='practice')for(let i=1;i<count;i++)joinTournament(state,'seat-'+i,{id:'player-'+i,name:'Player '+i},now);
 return state;
}
function chips(state){return state.tables.reduce((sum,table)=>sum+table.pot+table.players.reduce((total,p)=>total+p.stack,0),0)+Object.values(state.players).filter(p=>p.status==='waiting').reduce((sum,p)=>sum+p.stack,0);}
const idle=table=>['waiting','showdown'].includes(table.phase);

function playToWinner(mode,count){
 const state=game(mode,count),bankroll=Object.keys(state.players).length*1000;
 const deals=new Set(),signatures=new Set();let iterations=0,observedHands=0,humanOut=false;
 function inspect(){
  assert.equal(chips(state),bankroll,'chips must remain conserved across whole matches');
  for(const table of state.tables){
   const allCards=[...table.deck,...table.burns,...table.board,...table.players.flatMap(p=>p.holeCards)];
   assert.equal(allCards.length,52);assert.equal(new Set(allCards).size,52,'no duplicated card in any deal');
   const key=table.id+':'+table.handNumber;
   if(!deals.has(key)){
    deals.add(key);observedHands++;
    const signature=allCards.join(',');assert.ok(!signatures.has(signature),'every new hand receives a fresh shuffled deck');signatures.add(signature);
   }
   if(!idle(table)){
    const tv=publicTable(table,null,{tv:true});assert.ok(tv.players.every(p=>p.holeCards.length===0));
    assert.equal(Object.hasOwn(tv,'deck'),false);
   }
  }
  const human=state.players['seat-0'];
  if(human.status==='eliminated'){
   humanOut=true;const view=tournamentView(state,'seat-0',{},now);
   if(state.status==='playing')assert.equal(view.table.legalActions.canFold,false,'an eliminated player cannot act for the featured table');
  }
 }
 function advance(){
  const before=new Set(state.tables.map(table=>table.id+':'+table.handNumber)),calls=cryptoCalls;
  advanceTournament(state,now);
  const newHands=state.tables.filter(table=>!before.has(table.id+':'+table.handNumber)).length;
  if(newHands)assert.ok(cryptoCalls-calls>=51*newHands,'every automatic deal, including after table consolidation, uses a fresh crypto shuffle');
  inspect();
 }
 const initialCalls=cryptoCalls;startTournament(state,now);assert.ok(cryptoCalls-initialCalls>=51*state.tables.length);inspect();
 while(state.status==='playing'){
  assert.ok(++iterations<100000,`${mode} game cannot become stuck between hands`);
  for(const table of state.tables){
   if(idle(table))continue;
   const entry=Object.entries(state.players).find(([,p])=>p.id===table.actorId),[seat,actor]=entry;
   if(actor.bot)continue;
   const legal=publicTable(table,actor.id).legalActions;
   // Begin with three actual hands of small pots, then real all-in play; no
   // direct stack/card/status mutations create or end any hand in this test.
   const move=state.round<=3?(legal.canCheck?'check':mode==='practice'?'fold':'call'):(legal.canRaise?'allin':legal.canCheck?'check':'call');
   betTournament(state,seat,{tableId:table.id,handNumber:table.handNumber,turnId:table.actionNumber,move},now);
   inspect();
  }
  advance();
  if(state.status!=='playing')break;
  if(state.tables.every(idle)){
   assert.ok(state.nextHandAt>now,'a completed hand has an automatic recap countdown');
   const survivors=Object.values(state.players).filter(p=>p.status!=='eliminated').length;
   assert.equal(state.status,'playing','winning one hand does not end the match');
   now=state.nextHandAt;advance();
   if(survivors>1)assert.equal(state.status,'playing','multiple funded players must continue into another hand');
  }else now+=mode==='practice'?1500:10;
 }
 assert.equal(state.status,'finished');assert.equal(state.phase,'ended');
 const survivors=Object.values(state.players).filter(p=>p.status!=='eliminated');
 assert.equal(survivors.length,1);assert.equal(survivors[0].id,state.winnerId);assert.equal(survivors[0].stack,bankroll);assert.equal(survivors[0].place,1);
 assert.ok(observedHands>=4,`${mode} must span multiple hands`);
 const finalSnapshot=JSON.stringify(state);now+=60000;advanceTournament(state,now);assert.equal(JSON.stringify(state),finalSnapshot,'a finished match cannot accidentally deal again');
 console.log(`PASS ${mode}: ${count} players, ${state.round} rounds, ${observedHands} fresh deals, one champion${mode==='practice'&&humanOut?', human elimination handled':''}`);
 return state;
}

try{
 playToWinner('friends',2);playToWinner('friends',9);playToWinner('tournament',20);playToWinner('tournament',90);
 playToWinner('practice',2);playToWinner('practice',3);playToWinner('practice',9);

 // A real heads-up elimination leaves a buy-back opportunity before ending.
 // Refunding a new virtual stack resumes the same match, not a new room.
 const rebuy=game('friends',2,{maxReentries:1}),initial=2000;startTournament(rebuy,now);
 let eliminated=null;
 while(!eliminated){
  assert.ok(rebuy.round<30,'all-in heads-up play eventually produces an elimination');
  while(!rebuy.tables.every(idle)){
   const table=rebuy.tables[0],seat=Object.keys(rebuy.players).find(key=>rebuy.players[key].id===table.actorId),legal=publicTable(table,table.actorId).legalActions;
   betTournament(rebuy,seat,{tableId:table.id,handNumber:table.handNumber,turnId:table.actionNumber,move:legal.canRaise?'allin':legal.canCheck?'check':'call'},now);
  }
  advanceTournament(rebuy,now);eliminated=Object.entries(rebuy.players).find(([,p])=>p.status==='eliminated');
  if(!eliminated){now=rebuy.nextHandAt;advanceTournament(rebuy,now);}
 }
 assert.equal(rebuy.nextHandAt,now+30000);const [seat]=eliminated;rebuyTournament(rebuy,seat,now);
 assert.equal(chips(rebuy),initial+1000);const hand=rebuy.tables[0].handNumber;
 now=rebuy.nextHandAt;advanceTournament(rebuy,now);assert.equal(rebuy.status,'playing');assert.equal(rebuy.tables[0].handNumber,hand+1);assert.equal(rebuy.players[seat].status,'active');assert.equal(chips(rebuy),initial+1000);
 console.log('PASS automatic recap/redeal, actual eliminations, buy-back continuation, no premature winner, crypto randomness and card privacy.');
}finally{
 Math.random=originalRandom;
 if(cryptoDescriptor)Object.defineProperty(globalThis,'crypto',cryptoDescriptor);else delete globalThis.crypto;
}
