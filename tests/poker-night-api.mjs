import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {onRequest} from '../functions/new-build/api/poker-night.js';
import {createTournament,joinTournament,startTournament,advanceTournament,betTournament,rebuyTournament,blindState,tournamentView,pauseTournament,resumeTournament,pokerSettings} from '../functions/lib/poker-tournament.js';
import {act,publicTable} from '../functions/lib/poker-night.js';

class D1{
 constructor(){this.raw=new DatabaseSync(':memory:');this.collide=false;}
 prepare(sql){let args=[];const owner=this;return {bind(...values){args=values;return this;},async first(){return owner.raw.prepare(sql).get(...args)||null;},async all(){return {results:owner.raw.prepare(sql).all(...args)};},async run(){if(owner.collide&&sql.startsWith('UPDATE links_poker_night_rooms SET state=')){owner.collide=false;return {meta:{changes:0}};}const r=owner.raw.prepare(sql).run(...args);return {meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}};}};}
 async batch(statements){this.raw.exec('BEGIN');try{const results=[];for(const stmt of statements)results.push(await stmt.run());this.raw.exec('COMMIT');return results;}catch(e){this.raw.exec('ROLLBACK');throw e;}}
}
let time=1802800000000;const realNow=Date.now;Date.now=()=>time;
const db=new D1();
async function call(body,session={},query={}){
 const method=body?'POST':'GET',url='https://poker.local/new-build/api/poker-night'+(!body?'?'+new URLSearchParams(query):'');
 const req=new Request(url,{method,headers:{Origin:'https://poker.local','x-poker-token':session.playerToken||'','x-poker-host':session.hostToken||'','x-poker-display':session.displayKey||''},...(body?{body:JSON.stringify({requestId:crypto.randomUUID(),...body})}:{})});
 const response=await onRequest({request:req,env:{DB:db}});return {http:response.status,...await response.json()};
}
const snapshot=code=>JSON.parse(db.raw.prepare('SELECT state FROM links_poker_night_rooms WHERE code=?').get(code).state);
function alter(code,fn){const s=snapshot(code);fn(s);db.raw.prepare('UPDATE links_poker_night_rooms SET state=? WHERE code=?').run(JSON.stringify(s),code);}
const createId=crypto.randomUUID();
const host=await call({action:'create',name:'Host',mode:'tournament',settings:{tableSize:6,startingChips:1000,maxReentries:1,blindMinutes:2,turnSeconds:10},requestId:createId});
assert.equal(host.http,200,JSON.stringify(host));const code=host.room.code;
assert.equal(host.session.playerToken.length,72);assert.equal(host.session.hostToken.length,72);
const repeatedCreate=await call({action:'create',name:'Host',requestId:createId});assert.deepEqual(repeatedCreate.session,host.session);assert.equal(repeatedCreate.room.code,code);
const joinId=crypto.randomUUID(),other=await call({action:'join',code,name:'Other',requestId:joinId});assert.equal(other.http,200);
assert.deepEqual((await call({action:'join',code,name:'Other',requestId:joinId})).session,other.session);
assert.equal((await call(null,{}, {code})).http,401);
assert.equal((await call({action:'start',code},other.session)).http,403);
assert.equal((await call({action:'join',code,name:'Other'})).http,409);
const players=[host,other];for(let i=2;i<14;i++){const p=await call({action:'join',code,name:'Player '+i});assert.equal(p.http,200);players.push(p);}
db.collide=true;let response=await call({action:'start',code},host.session);assert.equal(response.http,200,JSON.stringify(response));assert.equal(response.room.tables.length,3);assert.deepEqual(response.room.tables.map(t=>t.players.length),[5,5,4]);
assert.equal((await call({action:'join',code,name:'Late'})).http,409);
for(const p of players){const r=await call(null,p.session,{code});assert.equal(r.http,200);for(const t of r.room.tables)for(const seat of t.players)assert.equal(seat.holeCards.length,seat.id===p.session.playerId?2:0);assert.equal(JSON.stringify(r.room).includes('"deck"'),false);assert.equal(JSON.stringify(r.room).includes('hostHash'),false);assert.equal(JSON.stringify(r.room).includes('playerToken'),false);}
const tvSession={displayKey:host.room.displayKey};const tv=await call(null,tvSession,{code,tv:1});assert.equal(tv.http,200);assert.equal(tv.room.tables.flatMap(t=>t.players).some(p=>p.holeCards.length),false);assert.equal(tv.room.displayKey,undefined);
assert.equal((await call({action:'pause',code},tvSession)).http,403);
assert.equal((await call(null,other.session,{code,tv:1})).http,403);
assert.equal((await call({action:'feature',code,tableId:'table-2'},other.session)).http,403);
assert.equal((await call({action:'feature',code,tableId:'table-2'},host.session)).room.featuredTableId,'table-2');
let room=(await call(null,host.session,{code})).room,table=room.tables[0],actor=players.find(p=>p.session.playerId===table.actorId);
const firstBet={action:'bet',code,tableId:table.id,handNumber:table.handNumber,turnId:table.turnId,move:'call',requestId:crypto.randomUUID()};
const bet=await call(firstBet,actor.session);assert.equal(bet.http,200,JSON.stringify(bet));const changed=JSON.stringify(snapshot(code).tables[0]);
assert.equal((await call(firstBet,actor.session)).http,200);assert.equal(JSON.stringify(snapshot(code).tables[0]),changed,'idempotent action cannot charge twice');
assert.equal((await call({...firstBet,requestId:crypto.randomUUID()},actor.session)).http,409);
const deadlines=snapshot(code).tables.map(t=>t.deadline);assert.equal((await call({action:'pause',code},host.session)).http,200);time+=30000;const paused=await call(null,host.session,{code});assert.equal(paused.room.status,'paused');assert.deepEqual(snapshot(code).tables.map(t=>t.deadline),deadlines);
assert.equal((await call({action:'resume',code},host.session)).http,200);assert.deepEqual(snapshot(code).tables.map(t=>t.deadline),deadlines.map(x=>x+30000));
time+=11000;await call(null,host.session,{code});assert.ok(snapshot(code).tables.every(t=>t.lastAction?.timeout));
// Reentry is denied while alive and cannot be forged with host authority.
assert.equal((await call({action:'rebuy',code},other.session)).http,409);
assert.equal((await call({action:'bet',code,tableId:'table-99',handNumber:1,turnId:1,move:'raise',amount:999999},other.session)).http,409);
assert.equal((await call({action:'close',code},other.session)).http,403);
assert.equal((await call({action:'close',code},host.session)).room.status,'closed');
assert.equal((await call({action:'start',code},host.session)).http,409);
db.raw.prepare('UPDATE links_poker_night_rooms SET expires=0 WHERE code=?').run(code);assert.equal((await call(null,host.session,{code})).http,404);

// Tournament state: 90 seats, no movement during hands, balanced final table,
// exact buyback accounting, blind boundaries, pauses and scheduled breaks.
function tour(n,options={}){
 const s=createTournament({code:'ABCDEF1234',mode:'tournament',ownerSeat:'s0',hostHash:'hash',displayKey:'key',player:{id:'p0',name:'Player 0'},settings:{startingChips:1000,tableSize:9,blindMinutes:2,turnSeconds:10,...options}},time);
 for(let i=1;i<n;i++)joinTournament(s,'s'+i,{id:'p'+i,name:'Player '+i},time);startTournament(s,time);return s;
}
let s=tour(90);assert.equal(s.tables.length,10);assert.ok(s.tables.every(t=>t.players.length===9));assert.throws(()=>joinTournament(s,'s90',{id:'p90',name:'Late'}));
const totals=s=>s.tables.reduce((sum,t)=>sum+t.pot+t.players.reduce((v,p)=>v+p.stack,0),0)+Object.values(s.players).filter(p=>p.status==='waiting').reduce((v,p)=>v+p.stack,0);
assert.equal(totals(s),90000);
const initialSeats=s.tables.map(t=>t.players.map(p=>p.id));
// Finish just one table: others keep the same seats and its hand does not restart.
while(s.tables[0].phase!=='showdown')act(s.tables[0],s.tables[0].actorId,{type:'fold'},{},time);
advanceTournament(s,time);assert.deepEqual(s.tables.map(t=>t.players.map(p=>p.id)),initialSeats);assert.equal(s.tables[0].handNumber,1);assert.equal(tournamentView(s,'s0').tables[0].waitingForTables,true);
for(const t of s.tables.slice(1))while(t.phase!=='showdown')act(t,t.actorId,{type:'fold'},{},time);
advanceTournament(s,time);time=s.nextHandAt;advanceTournament(s,time);assert.ok(s.tables.every(t=>t.handNumber===2));assert.equal(totals(s),90000);
// Finish a short stack tournament hand by shoving/calling everyone.
s=tour(3,{startingChips:1000,maxReentries:1,reentryLevels:1});const t=s.tables[0];
while(t.phase!=='showdown'){const l=publicTable(t,t.actorId).legalActions;act(t,t.actorId,{type:l.canRaise?'raise':l.canCall?'call':'check',amount:l.maxRaiseTo},{},time);}
advanceTournament(s,time);assert.equal(totals(s),3000);
const busted=Object.entries(s.players).find(([,p])=>p.status==='eliminated');
if(busted){const seat=busted[0];rebuyTournament(s,seat,time);assert.equal(s.players[seat].stack,1000);assert.equal(s.players[seat].status,'waiting');assert.equal(totals(s),4000);assert.throws(()=>rebuyTournament(s,seat,time));time=s.nextHandAt;advanceTournament(s,time);assert.equal(s.players[seat].status,'active');assert.equal(totals(s),4000);}
assert.equal(blindState(s,s.startedAt+119999).level,1);assert.equal(blindState(s,s.startedAt+120000).level,2);
pauseTournament(s,time);const blind=blindState(s,time);time+=30000;assert.deepEqual(blindState(s,time),blind);resumeTournament(s,time);assert.equal(blindState(s,time).level,blind.level);
assert.throws(()=>pokerSettings({tableSize:7}));assert.throws(()=>pokerSettings({smallBlind:25,bigBlind:75}));assert.throws(()=>pokerSettings({startingChips:101.5}));assert.throws(()=>pokerSettings({maxReentries:99}));

// Controlled, chip-conserving settled-hand snapshots let the tournament tests
// exercise many elimination rounds without depending on shuffled card winners.
function finishTables(state,select){
 for(const [index,table] of state.tables.entries()){
  table.deadline=time+table.turnSeconds*1000;
  while(table.phase!=='showdown')act(table,table.actorId,{type:'fold'},{},time);
  const keep=select?select(table,index):table.players.map(p=>p.id),bankroll=table.players.reduce((sum,p)=>sum+p.stack,0);
  assert.ok(keep.length>0,'every table has at least one surviving winner');
  let extra=bankroll%keep.length;
  for(const seat of table.players)seat.stack=keep.includes(seat.id)?Math.floor(bankroll/keep.length)+(extra-->0?1:0):0;
  table.accountedHand=0;
 }
 advanceTournament(state,time);
}
function nextRound(state){time=state.nextHandAt;advanceTournament(state,time);}
function assertSeating(state,expected){
 const seated=state.tables.flatMap(t=>t.players);
 assert.equal(seated.length,expected);assert.equal(new Set(seated.map(p=>p.id)).size,expected);
 for(const table of state.tables){assert.ok(table.players.length<=state.settings.tableSize);assert.equal(new Set(table.players.map(p=>p.seat)).size,table.players.length);for(const seat of table.players)assert.equal(Object.values(state.players).find(p=>p.id===seat.id).tableId,table.id);}
}

// Ninety entrants consolidate through 20 -> 9 -> heads up -> champion.
// A featured broken table switches to the final table, and no chips disappear.
let large=tour(90,{maxReentries:0});large.featuredTableId=large.tables.at(-1).id;
finishTables(large,table=>table.players.slice(0,2).map(p=>p.id));assert.equal(Object.values(large.players).filter(p=>p.status==='eliminated').length,70);
assert.ok(Object.values(large.players).filter(p=>p.status==='eliminated').every(p=>p.place===21));
nextRound(large);assertSeating(large,20);assert.equal(large.tables.length,3);assert.equal(totals(large),90000);
finishTables(large,table=>table.players.slice(0,3).map(p=>p.id));nextRound(large);
assertSeating(large,9);assert.equal(large.tables.length,1);assert.equal(large.featuredTableId,large.tables[0].id);assert.equal(totals(large),90000);
finishTables(large,table=>table.players.slice(0,2).map(p=>p.id));nextRound(large);assertSeating(large,2);assert.equal(totals(large),90000);
const finalIds=large.tables[0].players.map(p=>p.id);finishTables(large,()=>[finalIds[0]]);nextRound(large);
assert.equal(large.status,'finished');assert.equal(large.winnerId,finalIds[0]);assert.equal(totals(large),90000);
assert.equal(Object.values(large.players).find(p=>p.id===finalIds[0]).place,1);assert.equal(Object.values(large.players).find(p=>p.id===finalIds[1]).place,2);
const tiedScores=Object.values(large.players).filter(p=>p.place===21).map(p=>p.score);assert.equal(new Set(tiedScores).size,1,'equal finishes get equal leaderboard points');

// Reentries can require another table after a table was closed. Its identity is
// fresh, even though the old and new tables both begin at hand/turn one.
// Same-round eliminations tie across tables even when their hands finish apart.
const delayed=tour(12,{tableSize:6,maxReentries:0}),eliminated=[];
for(const table of delayed.tables){
 table.deadline=time+10000;
 while(table.phase!=='showdown')act(table,table.actorId,{type:'fold'},{},time);
 const out=table.players[0],winner=table.players[1];winner.stack+=out.stack;out.stack=0;table.accountedHand=0;eliminated.push(out.id);
 advanceTournament(delayed,time);time+=500;
}
assert.deepEqual(eliminated.map(id=>Object.values(delayed.players).find(p=>p.id===id).place),[11,11],'clock differences between tables must not break equal-stack eliminations');

let expanding=tour(10,{maxReentries:1,reentryLevels:12});
const oldIds=expanding.tables.map(t=>t.id),outId=expanding.tables[0].players[0].id;
finishTables(expanding,(table,index)=>table.players.filter(p=>index!==0||p.id!==outId).map(p=>p.id));nextRound(expanding);
assert.equal(expanding.tables.length,1);assertSeating(expanding,9);
const outSeat=Object.keys(expanding.players).find(key=>expanding.players[key].id===outId);
rebuyTournament(expanding,outSeat,time);assert.throws(()=>rebuyTournament(expanding,outSeat,time));
finishTables(expanding);nextRound(expanding);assertSeating(expanding,10);
assert.equal(expanding.tables.length,2);assert.equal(expanding.tables[0].id,oldIds[0]);assert.ok(!oldIds.includes(expanding.tables[1].id));assert.equal(totals(expanding),11000);
assert.throws(()=>betTournament(expanding,outSeat,{tableId:oldIds[1],handNumber:1,turnId:1,move:'fold'},time),error=>error.code==='STALE_HAND');

// Balance the next-BB player, choosing the worst open seat at the short table.
let balanced=tour(16,{maxReentries:0});
const donor=balanced.tables[0],receiver=balanced.tables[1];
const donorNext=[...donor.players].sort((a,b)=>a.seat-b.seat).find(p=>p.seat>donor.bigBlindSeat)||[...donor.players].sort((a,b)=>a.seat-b.seat)[0];
const receiverKeep=receiver.players.slice(0,6).map(p=>p.id),previousBB=receiver.bigBlindSeat;
const free=Array.from({length:9},(_,n)=>n).filter(n=>!receiver.players.some(p=>receiverKeep.includes(p.id)&&p.seat===n)&&n!==previousBB).sort((a,b)=>((a-previousBB+9)%9||9)-((b-previousBB+9)%9||9));
finishTables(balanced,(table,index)=>index===0?table.players.map(p=>p.id):receiverKeep);nextRound(balanced);
assert.deepEqual(balanced.tables.map(table=>table.players.length),[7,7]);
assert.equal(balanced.tables[1].players.find(p=>p.id===donorNext.id).seat,free[0]);assert.equal(totals(balanced),16000);

// A buy-back window closes at the first instant of the next blind level.
let cutoff=tour(3,{maxReentries:1,reentryLevels:1});const cutoffOut=cutoff.tables[0].players[0].id;
finishTables(cutoff,table=>table.players.filter(p=>p.id!==cutoffOut).map(p=>p.id));
const cutoffSeat=Object.keys(cutoff.players).find(key=>cutoff.players[key].id===cutoffOut);
assert.equal(tournamentView(cutoff,cutoffSeat,{},cutoff.startedAt+119999).canRebuy,true);
assert.equal(tournamentView(cutoff,cutoffSeat,{},cutoff.startedAt+120000).canRebuy,false);
assert.throws(()=>rebuyTournament(cutoff,cutoffSeat,cutoff.startedAt+120000));

// A scheduled break waits for every hand, freezes the blind clock, and resumes
// exactly once without immediately scheduling the same break again.
let breaking=tour(4,{maxReentries:0,breakEvery:1,breakMinutes:1});
time=breaking.startedAt+120001;finishTables(breaking);nextRound(breaking);
assert.equal(breaking.status,'paused');assert.equal(breaking.autoResumeAt,time+60000);
const breakLevel=blindState(breaking,time).level,breakHand=breaking.tables[0].handNumber;
time+=59999;advanceTournament(breaking,time);assert.equal(breaking.status,'paused');assert.equal(blindState(breaking,time).level,breakLevel);
time++;advanceTournament(breaking,time);assert.equal(breaking.status,'playing');assert.equal(breaking.tables[0].handNumber,breakHand+1);assert.equal(blindState(breaking,time).level,breakLevel);
advanceTournament(breaking,time);assert.equal(breaking.status,'playing');assert.equal(breaking.tables[0].handNumber,breakHand+1);

// Separate player and host capabilities: a host cannot manufacture a second
// stack for someone else, and retrying one real buy back never credits twice.
const buyHost=await call({action:'create',name:'Buy Host',mode:'friends',settings:{startingChips:1000,maxReentries:1}}),buyCode=buyHost.room.code;
const buyPlayer=await call({action:'join',code:buyCode,name:'Buy Player'});await call({action:'start',code:buyCode},buyHost.session);
alter(buyCode,st=>{const table=st.tables[0];while(table.phase!=='showdown')act(table,table.actorId,{type:'fold'},{},time);for(const p of table.players)p.stack=p.id===buyHost.session.playerId?2000:0;table.accountedHand=0;});
await call(null,buyHost.session,{code:buyCode});
assert.equal((await call({action:'rebuy',code:buyCode},{hostToken:buyHost.session.hostToken})).http,409);
const buyRequest={action:'rebuy',code:buyCode,requestId:crypto.randomUUID()};const bought=await call(buyRequest,buyPlayer.session);assert.equal(bought.http,200);
assert.equal((await call(buyRequest,buyPlayer.session)).http,200);assert.equal((await call({...buyRequest,requestId:crypto.randomUUID()},buyPlayer.session)).http,409);
const boughtRecord=Object.values(snapshot(buyCode).players).find(p=>p.id===buyPlayer.session.playerId);assert.equal(boughtRecord.stack,1000);assert.equal(boughtRecord.reentries,1);assert.equal(boughtRecord.status,'waiting');

// Completed event writes exactly one placement result per player in the same CAS.
const endHost=await call({action:'create',name:'End Host',mode:'friends',settings:{startingChips:1000,maxReentries:0}}),endCode=endHost.room.code;
const endPlayer=await call({action:'join',code:endCode,name:'End Player'});await call({action:'start',code:endCode},endHost.session);
alter(endCode,st=>{const table=st.tables[0];while(table.phase!=='showdown'){const l=publicTable(table,table.actorId).legalActions;act(table,table.actorId,{type:l.canRaise?'raise':l.canCall?'call':'check',amount:l.maxRaiseTo},{},time);}for(const p of table.players){p.stack=p.id===endHost.session.playerId?2000:0;}table.accountedHand=0;});
await call(null,endHost.session,{code:endCode});time=snapshot(endCode).nextHandAt;await call(null,endHost.session,{code:endCode});
assert.equal(snapshot(endCode).status,'finished');assert.equal(snapshot(endCode).phase,'ended');
assert.equal(db.raw.prepare("SELECT COUNT(*) n FROM links_party_results WHERE game='poker-night' AND room=?").get(endCode).n,2);
await call(null,endHost.session,{code:endCode});assert.equal(db.raw.prepare("SELECT COUNT(*) n FROM links_party_results WHERE game='poker-night' AND room=?").get(endCode).n,2);
assert.deepEqual(db.raw.prepare("SELECT score,win FROM links_party_results WHERE game='poker-night' AND room=? ORDER BY score DESC").all(endCode).map(r=>({...r})),[{score:1000,win:1},{score:0,win:0}]);
Date.now=realNow;db.raw.close();
console.log('PASS private/host/TV API, create/join/action idempotence, CAS retry, stale-turn rejection, 90-player balancing, no mid-hand moves, virtual rebuy conservation, blinds/pauses/expiry, and atomic placement leaderboard results.');
