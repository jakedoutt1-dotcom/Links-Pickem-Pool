import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {grantTestHost} from './helpers/trivia-host-access.mjs';
import {onRequest} from '../functions/new-build/api/trivia-night.js';
import {reveal,BASE,answerSeconds} from '../functions/lib/trivia-night.js';
const {db}=fixture();await grantTestHost(db);const realNow=Date.now;let now=realNow();Date.now=()=>now;
try{
async function call(b,token=''){const r=await onRequest({env:{DB:db},request:new Request('https://test/new-build/api/trivia-night',{method:'POST',headers:{Origin:'https://test',Authorization:'Bearer admin','x-trivia-token':token},body:JSON.stringify(b)})});return {status:r.status,...await r.json()}}
const room=await call({action:'create',categories:['science'],difficulty:'easy'}),code=room.code,a=await call({action:'join',code,name:'Submitted'}),b=await call({action:'join',code,name:'Draft'});
const raw=()=>JSON.parse(db.raw.prepare('SELECT state FROM links_trivia_night_rooms WHERE code=?').get(code).state);let s=raw();s.phase='question';s.index=0;s.startsAt=now;s.deadline=now+answerSeconds(s.deck[0].difficulty)*1000;db.raw.prepare('UPDATE links_trivia_night_rooms SET state=? WHERE code=?').run(JSON.stringify(s),code);const correct=s.deck[0].correct,body={code,gameNumber:1,index:0};
now+=1000;assert.equal((await call({...body,action:'submit-answer',choice:correct},a.token)).status,409);
await call({...body,action:'answer',choice:(correct+1)%4},a.token);await call({...body,action:'answer',choice:correct},a.token);now+=1000;
const submitted=await call({...body,action:'submit-answer',choice:correct},a.token);assert.equal(submitted.submitted,true);assert.equal(submitted.phase,'question');assert.equal(submitted.question.correct,undefined);
assert.equal((await call({...body,action:'answer',choice:(correct+1)%4},a.token)).status,409);assert.equal((await call({...body,action:'submit-answer',choice:correct},a.token)).status,409);
await call({...body,action:'answer',choice:correct},b.token);s=raw();now=s.deadline;
assert.equal((await call({...body,action:'submit-answer',choice:correct},b.token)).status,409);
reveal(s);const players=Object.values(s.players);assert(players.find(p=>p.name==='Submitted').score>BASE[s.deck[0].difficulty]);assert.equal(players.find(p=>p.name==='Draft').score,BASE[s.deck[0].difficulty]);
console.log('PASS draft changes, explicit submit lock, private reveal, speed bonus at submission, unsubmitted base points, exact deadline rejection');
}finally{Date.now=realNow}
