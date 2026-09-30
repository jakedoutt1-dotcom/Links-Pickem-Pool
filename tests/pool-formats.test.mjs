import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
test('Squares complete lifecycle: create, claim/release, duplicate, draw, final winner and pool ownership',async()=>{
 const {db,runtime,call}=fixture();try{
 assert.equal((await call('squares','state',null,'outsider')).status,401);
 assert.equal((await call('squares','boards',{week:1,eventId:'one'})).status,403);
 let result=await call('squares','boards',{week:1,eventId:'one',title:'Sunday',price:10,payoutQ1:100,payoutHalf:100,payoutQ3:100,payoutFinal:200},'admin');assert.equal(result.status,200,JSON.stringify(result));const id=result.id;
 assert.equal((await call('squares','claim',{boardId:id,squareIndex:12})).status,200);
 assert.equal((await call('squares','claim',{boardId:id,squareIndex:12},'bob')).status,409);
 assert.equal((await call('squares','unclaim',{boardId:id,squareIndex:12},'bob')).status,403);
 assert.equal((await call('squares','unclaim',{boardId:id,squareIndex:12})).status,200);
 assert.equal((await call('squares','claim',{boardId:id,squareIndex:12})).status,200);
 result=await call('squares','draw',{boardId:id},'admin');assert.equal(result.status,200);assert.equal(new Set(result.awayNums).size,10);
 assert.equal((await call('squares','draw',{boardId:id},'admin')).status,409);
 assert.equal((await call('squares','unclaim',{boardId:id,squareIndex:12})).status,409);
 assert.equal((await call('squares','paid',{boardId:id,squareIndex:12,paid:true},'admin')).status,200);
 const a=result.awayNums[2],h=result.homeNums[1];
 runtime.summary={header:{competitions:[{status:{period:5,type:{completed:true}},competitors:[{homeAway:'away',score:a,linescores:[a,0,0,0,0].map(value=>({value}))},{homeAway:'home',score:h,linescores:[h,0,0,0,0].map(value=>({value}))}]}]}};
 result=await call('squares');assert.equal(result.boards[0].winners.final.player,'Alice');assert.equal(result.boards[0].status,'FINAL');
 }finally{db.raw.close()}
});
test('Props setup, choice validation, freeze, deadline, grading, corrections and answer privacy',async()=>{
 const {db,call}=fixture(),originalNow=Date.now,deadline=new Date(Date.now()+3600000).toISOString();try{
 const setup={version:'',deadline,points:2,questions:[{text:'Will the first score be a touchdown?',options:['Yes','No']}]};
 assert.equal((await call('props','settings',setup)).status,403);
 assert.equal((await call('props','settings',setup,'admin')).status,200);
 let state=await call('props');assert.equal(state.settings.officialAnswers,undefined);
 assert.equal((await call('props','entry',{version:'stale',entry:{answers:['Yes']}})).status,409);
 assert.equal((await call('props','entry',{entry:{answers:['Maybe']}})).status,400);
 assert.equal((await call('props','entry',{entry:{answers:['Yes']}})).status,200);
 assert.equal((await call('props','settings',{...setup,version:state.version},'admin')).status,409);
 assert.equal((await call('props','grade',{version:state.version,answers:['Yes']},'admin')).status,409);
 Date.now=()=>Date.parse(deadline)+1;
 assert.equal((await call('props','entry',{entry:{answers:['No']}})).status,409);
 assert.equal((await call('props','grade',{version:state.version,answers:['Yes']},'admin')).status,200);
 state=await call('props');assert.equal(state.scores[0].score,2);assert.equal(state.settings.officialAnswers,'Yes');
 assert.equal((await call('props','grade',{version:state.version,answers:['No']},'admin')).status,200);
 assert.equal((await call('props')).scores[0].score,0);
 }finally{Date.now=originalNow;db.raw.close()}
});
test('Playoffs select correct round, freeze weights, enforce kickoff and grade weighted finals',async()=>{
 const {db,runtime,call}=fixture();try{
 assert.equal((await call('playoff','settings',{version:'',wildCardPoints:1,divisionalPoints:2,conferencePoints:4,superBowlPoints:8},'admin')).status,200);
 assert.equal((await call('playoff','entry',{entry:{week:1,picks:[]}})).status,400);
 assert.equal((await call('playoff','entry',{entry:{week:20,picks:[{eventId:'one',gameIndex:0,team:'BUF'}]}})).status,200);
 let state=await call('playoff','state',null,'alice',19);assert.deepEqual(state.myEntry,{});
 state=await call('playoff','state',null,'alice',20);assert.equal(state.myEntry.picks[0].team,'BUF');assert.equal(state.locked,false);
 assert.equal((await call('playoff','settings',{version:state.version,wildCardPoints:2,divisionalPoints:4,conferencePoints:8,superBowlPoints:16},'admin')).status,409);
 runtime.slate=[{...runtime.slate[0],kickoff:'2020-01-01',completed:true,winner:'BUF',awayScore:20,homeScore:10}];
 assert.equal((await call('playoff','entry',{entry:{week:20,picks:[{eventId:'one',gameIndex:0,team:'MIA'}]}})).status,409);
 state=await call('playoff','state',null,'alice',20);assert.equal(state.scores[0].score,2);assert.equal(state.locked,true);
 db.raw.exec("UPDATE pool_active_games SET active=0 WHERE game_type='playoff'");
 assert.equal((await call('playoff','entry',{entry:{week:20,picks:[]}})).status,403);
 }finally{db.raw.close()}
});
