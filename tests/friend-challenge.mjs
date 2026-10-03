import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/friend-challenge.js';
import {challengeView,advance} from '../functions/lib/friend-challenge.js';
const {db}=fixture(),realNow=Date.now;let now=realNow(),code='',tokens=[],s;Date.now=()=>now;
async function call(body,token='',badOrigin=false){const r=await onRequest({request:new Request('https://local.invalid/api/friend-challenge?code='+code,{method:body?'POST':'GET',headers:{Origin:badOrigin?'https://elsewhere.invalid':'https://local.invalid','x-challenge-token':token,'Content-Type':'application/json'},...(body?{body:JSON.stringify({code,...body})}:{})}),env:{DB:db}});return {status:r.status,...await r.json()}}
function raw(){return JSON.parse(db.raw.prepare('SELECT state FROM links_friend_rooms WHERE code=?').get(code).state)}
try{
 assert.equal((await call({action:'create',name:'Alice',category:'mixed',difficulty:'mixed'},'',true)).status,403);
 s=await call({action:'create',name:'Player 1',category:'mixed',difficulty:'mixed'});assert.equal(s.status,200);code=s.code;tokens.push(s.token);assert.equal(s.question,null);assert.equal(s.deck,undefined);assert.equal((await call(null)).status,401);
 assert.equal((await call({action:'join',name:'player 1'})).status,409);
 for(let i=2;i<=8;i++){const j=await call({action:'join',name:'Player '+i});assert.equal(j.status,200);tokens.push(j.token)}
 assert.equal((await call({action:'join',name:'Ninth'})).status,409);
 for(let i=0;i<8;i++){s=await call({action:'ready',game:1},tokens[i]);assert.equal(s.phase,i===7?'question':'lobby')}
 assert.equal(s.countdown,true);assert.equal((await call({action:'answer',game:1,index:0,choice:0},tokens[0])).status,409);
 for(let i=0;i<10;i++){
  now=s.startsAt+1;s=await call(null,tokens[0]);assert.equal(s.index,i);assert.equal(s.question.correct,undefined);assert.equal(s.question.source,undefined);
  if(i===0){const wrong=(raw().deck[0].correct+1)%4;assert.equal((await call({action:'answer',game:1,index:0,choice:wrong},tokens[0])).status,200);assert.equal((await call({action:'answer',game:1,index:0,choice:wrong},tokens[0])).status,409);assert.equal((await call({action:'join',name:'Late'})).status,409)}
  now=s.deadline;s=await call(null,tokens[0]);assert.equal(s.phase,'reveal');assert(Number.isInteger(s.question.correct));assert(s.players.every(p=>p.score===0));now=s.nextAt;s=await call(null,tokens[0]);
 }
 assert.equal(s.suddenDeath,true);now=s.startsAt+100;s=await call(null,tokens[0]);const correct=raw().deck[s.index].correct;await call({action:'answer',game:1,index:s.index,choice:correct},tokens[0]);now=s.deadline;s=await call(null,tokens[0]);now=s.nextAt;s=await call(null,tokens[0]);assert.equal(s.phase,'ended');assert.equal(s.players.filter(p=>p.winner).length,1);assert.equal(s.players[0].name,'Player 1');
 for(const t of tokens)s=await call({action:'ready',game:1},t);assert.equal(s.game,2);assert.equal(s.phase,'question');assert(s.players.every(p=>p.score===0));assert.equal((await call({action:'answer',game:1,index:0,choice:0},tokens[0])).status,409);
 const tied=raw();tied.index=tied.deck.length-1;tied.phase='reveal';tied.nextAt=now;for(const p of Object.values(tied.players))p.score=0;advance(tied,now);assert.equal(tied.phase,'ended');assert.equal(challengeView(tied,'',now).sharedWin,true);
 now+=7200001;assert.equal((await call(null,tokens[0])).status,404);
 console.log('PASS eight-player limit, readiness, auth/origin, automatic 10 rounds, reveal privacy, speed scoring, sudden death, rematch, shared ties and expiry.');
}finally{Date.now=realNow;db.raw.close()}
