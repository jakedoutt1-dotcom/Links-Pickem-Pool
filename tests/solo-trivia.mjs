import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest as friend} from '../functions/new-build/api/friend-challenge.js';
import {onRequest as rally} from '../functions/new-build/api/trivia-rally.js';
const real=Date.now;let now=real();Date.now=()=>now;
try{for(const [handler,table,rounds] of [[friend,'links_friend_rooms',10],[rally,'links_rally_rooms',12]]){const {db}=fixture();let code='',token='';async function call(body,credential=token){const r=await handler({env:{DB:db},request:new Request('https://test/api/game?code='+code,{method:body?'POST':'GET',headers:{Origin:'https://test','x-challenge-token':credential,'x-rally-token':credential},...(body?{body:JSON.stringify({code,...body})}:{})})});return {status:r.status,...await r.json()}}
let s=await call({action:'create',mode:'solo',name:'Solo',category:'mixed',difficulty:'mixed'});assert.equal(s.status,200);code=s.code;token=s.token;assert.equal(s.mode,'solo');assert.equal(s.phase,'question');assert.equal(s.question,null);assert.equal((await call({action:'join',name:'Intruder'},'')).status,403);
for(let i=0;i<rounds;i++){now=s.startsAt+1;s=await call();assert.equal(s.question.correct,undefined);const raw=JSON.parse(db.raw.prepare('SELECT state FROM '+table+' WHERE code=?').get(code).state);s=await call({action:'answer',game:1,index:i,choice:raw.deck[i].correct});assert.equal(s.status,200);assert.equal((await call({action:'answer',game:1,index:i,choice:0})).status,409);now=s.deadline;s=await call();assert.equal(s.phase,'reveal');assert.equal(s.question.correct,raw.deck[i].correct);now=s.nextAt;s=await call()}
assert.equal(s.phase,'ended');assert(s.players[0].score>0);assert.equal(db.raw.prepare("SELECT name FROM sqlite_master WHERE name='links_party_results'").get(),undefined);
s=await call({action:'ready',game:1});assert.equal(s.phase,'question');assert.equal(s.game,2);assert.equal(s.players[0].score,0);assert.equal(s.mode,'solo');db.raw.close();console.log('PASS '+rounds+' solo rounds, private seat, hidden answers, scoring, auto advance and replay');}}finally{Date.now=real}

