import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/million-point.js';
import {prepareDuel,advance,act,view} from '../functions/lib/million-point.js';
import {STARTER} from '../functions/lib/trivia-night.js';
const realNow=Date.now;let now=realNow();Date.now=()=>now;
try{for(const mode of ['hotseat','duel']){
 const {db}=fixture();let code;
 const raw=async()=>JSON.parse((await db.prepare('SELECT state FROM links_million_rooms WHERE code=?').bind(code).first()).state);
 async function call(body={},token='',display=''){const r=await onRequest({env:{DB:db},request:new Request('https://test.local/api?code='+code,{method:body.action?'POST':'GET',headers:{Origin:'https://test.local','x-million-token':token,'x-million-display':display},...(body.action?{body:JSON.stringify({code,...body})}:{})})});return {status:r.status,...await r.json()}}
 const host=await call({action:'create',mode,name:'Jake'});assert.equal(host.status,200);code=host.code;const player=await call({action:'join',name:'Amanda'});assert.equal(player.status,200);const h=host.token,p=player.token;
 assert.equal((await call()).status,401);assert.equal((await call({action:'start'},p)).status,403);assert.equal((await call({action:'start'},h)).status,409);assert.equal((await call({action:'ready'},'',host.displayKey)).status,403);
 if(mode==='duel')assert.equal((await call({action:'join',name:'Extra'})).status,409);
 await call({action:'ready'},h);await call({action:'ready'},p);let s=await call({action:'start'},h);assert.equal(s.phase,'intro');assert.equal(s.bank,undefined);assert.equal(s.deck,undefined);assert.equal((await call({action:'join',name:'Late'})).status,409);
 async function step(){const r=await raw();now=r.deadline+1;return call({},h)}
 async function play(action,token=h,extra={}){const r=await raw();return call({action,game:r.game,phaseId:r.phaseId,...extra},token)}
 s=await step();assert.equal(s.phase,'question');assert.equal(s.question.correct,undefined);
 if(mode==='hotseat'){
  assert.equal((await play('answer',p,{choice:0})).status,409);
  const original=(await raw()).deck[0].id;assert.equal((await play('lifeline',h,{kind:'swap'})).status,200);assert.notEqual((await raw()).deck[0].id,original);assert.equal((await play('lifeline',h,{kind:'swap'})).status,409);
  await play('lifeline',h,{kind:'half'});const state=await raw();assert.equal(state.removed.length,2);assert(!state.removed.includes(state.deck[0].correct));assert.equal((await play('answer',h,{choice:state.removed[0]})).status,409);
  await play('lifeline',h,{kind:'room'});assert.equal((await call({},p)).phase,'poll');assert.equal((await play('vote',h,{choice:state.deck[0].correct})).status,409);assert.equal((await play('vote',p,{choice:state.deck[0].correct})).status,200);assert.equal((await play('vote',p,{choice:state.deck[0].correct})).status,409);s=await step();assert.equal(s.phase,'question');assert.equal(s.poll.reduce((a,b)=>a+b,0),1);
  for(let i=0;i<15;i++){const r=await raw();assert.equal(r.level,i);assert.equal(r.deck[i].difficulty,i<5?'easy':i<10?'medium':'hard');s=await play('answer',h,{choice:r.deck[i].correct});assert.equal(s.phase,'reveal');assert.equal(s.question.correct,r.deck[i].correct);assert.equal((await call({action:'answer',game:r.game,phaseId:r.phaseId,choice:r.deck[i].correct},h)).status,409);s=await step();if(i<14){assert.equal(s.phase,'decision');if(i===4)assert.equal(s.safe,1000);if(i===9)assert.equal(s.safe,32000);await play('continue')}else assert.equal(s.phase,'turnEnd');}
  assert.equal(s.earned,1000000);s=await play('next');assert.equal(s.activeName,'Amanda');await step();now=(await raw()).deadline+1;s=await call({},p);assert.equal(s.phase,'reveal');await step();s=await play('next');assert.equal(s.phase,'ended');assert.deepEqual(s.players.map(p=>p.score),[1000000,0]);s=await play('again');assert.equal(s.phase,'lobby');assert(s.players.every(p=>!p.ready));
 }else{
  await play('lifeline',h,{kind:'half'});assert.equal((await call({},p)).removed.length,0);assert.equal((await call({},'',host.displayKey)).removed.length,0);assert.equal((await play('lifeline',h,{kind:'room'})).status,409);
  for(let i=0;i<15;i++){const r=await raw();s=await play('answer',h,{choice:r.deck[i].correct});assert.equal(s.phase,'question');assert.equal(s.question.correct,undefined);if(i<5)await play('answer',p,{choice:r.deck[i].correct});const tv=await call({},'',host.displayKey);assert.equal(tv.question.correct,undefined);assert.equal(tv.deck,undefined);s=await step();assert.equal(s.phase,'reveal');assert.equal(s.question.correct,r.deck[i].correct);s=await step();}
  assert.equal(s.phase,'ended');assert.deepEqual(s.players.map(p=>p.score),[1000000,1000]);
 }
 now+=86400001;assert.equal((await call({},h)).status,404);console.log('PASS '+mode+': full ladder, guards, hidden answers, lifelines, guarantees, reveal, results and expiry.');
}
// Both players banking must keep their score. Ties remain visible as shared wins.
const s={mode:'duel',game:1,phaseId:0,bank:STARTER,players:{a:{name:'A'},b:{name:'B'}},order:['a','b'],turn:0};prepareDuel(s,now);advance(s,s.deadline);for(const seat of ['a','b'])act(s,seat,{action:'bank',game:1,phaseId:s.phaseId},s.deadline-1);advance(s,s.deadline);advance(s,s.deadline);assert.equal(s.phase,'ended');assert.deepEqual(view(s,'a',now).players.map(p=>p.score),[0,0]);
console.log('PASS shared tie and banking.');
}finally{Date.now=realNow}
