import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/trivia-rally.js';
import {challengeView,advance} from '../functions/lib/trivia-rally.js';
const {db}=fixture(),realNow=Date.now;let now=realNow(),code='',tokens=[],s;Date.now=()=>now;
async function call(body,token='',badOrigin=false){const r=await onRequest({request:new Request('https://local.invalid/api/trivia-rally?code='+code,{method:body?'POST':'GET',headers:{Origin:badOrigin?'https://elsewhere.invalid':'https://local.invalid','x-rally-token':token,'Content-Type':'application/json'},...(body?{body:JSON.stringify({code,...body})}:{})}),env:{DB:db}});return {status:r.status,...await r.json()}}
function raw(){return JSON.parse(db.raw.prepare('SELECT state FROM links_rally_rooms WHERE code=?').get(code).state)}
try{
 assert.equal((await call({action:'create',name:'Alice',category:'mixed',difficulty:'mixed'},'',true)).status,403);
 s=await call({action:'create',name:'Player 1',category:'mixed',difficulty:'mixed'});assert.equal(s.status,200);code=s.code;tokens.push(s.token);assert.equal(s.question,null);assert.equal(s.deck,undefined);const tvKey=s.displayKey;const tv=await onRequest({env:{DB:db},request:new Request('https://local.invalid/api/trivia-rally?code='+code,{headers:{'x-rally-display':tvKey}})});assert.equal(tv.status,200);const tvState=await tv.json();assert.equal(tvState.displayKey,undefined);assert.equal(tvState.eligible,false);assert.equal((await call({action:'ready',game:1},tvKey)).status,401);assert.equal((await call(null)).status,401);
 assert.equal((await call({action:'join',name:'player 1'})).status,409);
 for(let i=2;i<=8;i++){const j=await call({action:'join',name:'Player '+i});assert.equal(j.status,200);tokens.push(j.token)}
 assert.equal((await call({action:'join',name:'Ninth'})).status,409);
 for(let i=0;i<8;i++){s=await call({action:'ready',game:1},tokens[i]);assert.equal(s.phase,i===7?'question':'lobby')}
 assert.equal(s.countdown,true);assert.equal((await call({action:'answer',game:1,index:0,choice:0},tokens[0])).status,409);
 for(let i=0;i<12;i++){
  now=s.startsAt+1;s=await call(null,tokens[0]);assert.equal(s.index,i);assert.equal(s.question.correct,undefined);assert.equal(s.question.source,undefined);
  if(i===0){const wrong=(raw().deck[0].correct+1)%4;assert.equal((await call({action:'answer',game:1,index:0,choice:wrong},tokens[0])).status,200);assert.equal((await call({action:'answer',game:1,index:0,choice:wrong},tokens[0])).status,200);assert.equal((await call({action:'join',name:'Late'})).status,409)}
  now=s.deadline;s=await call(null,tokens[0]);assert.equal(s.phase,'reveal');assert(Number.isInteger(s.question.correct));assert(s.players.every(p=>p.score===0));now=s.nextAt;s=await call(null,tokens[0]);
 }
 assert.equal(s.phase,'ended');assert.equal(s.sharedWin,true);
 for(const t of tokens)s=await call({action:'ready',game:1},t);assert.equal(s.game,2);assert.equal(s.phase,'question');assert(s.players.every(p=>p.score===0));assert.equal((await call({action:'answer',game:1,index:0,choice:0},tokens[0])).status,409);
 const tied=raw();tied.index=tied.deck.length-1;tied.phase='reveal';tied.nextAt=now;for(const p of Object.values(tied.players))p.score=0;advance(tied,now);assert.equal(tied.phase,'ended');assert.equal(challengeView(tied,'',now).sharedWin,true);
 now+=7200001;assert.equal((await call(null,tokens[0])).status,404);
 console.log('PASS Rally 8 seats, TV read-only access, private answers, 12 laps, rematch, shared ties and expiry.');
}finally{Date.now=realNow;db.raw.close()}

const scoring={phase:'question',index:3,deadline:100,deck:Array.from({length:12},(_,i)=>({id:String(i),difficulty:'easy',correct:0})),players:{a:{score:0,answer:{index:3,choice:0,elapsed:0}}}};advance(scoring,100);const boost=scoring.players.a.score;scoring.index=2;scoring.phase='question';scoring.players.a.score=0;scoring.players.a.answer.index=2;advance(scoring,100);assert.equal(boost,2*scoring.players.a.score);assert.ok(boost>0);console.log('PASS double-point boost lap scoring');
