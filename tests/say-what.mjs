import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/say-what.js';
import {BANK,blocked,advance} from '../functions/lib/say-what.js';
const {db}=fixture();
async function call(body={},token='',display=''){const r=await onRequest({env:{DB:db},request:new Request('https://word.local/new-build/api/say-what'+(!body.action?'?code='+code:''),{method:body.action?'POST':'GET',headers:{Origin:'https://word.local','x-say-token':token,'x-say-display':display},...(body.action?{body:JSON.stringify(body)}:{})})});return {status:r.status,...await r.json()}}
let code;const h=await call({action:'create',name:'Jake'});assert.equal(h.status,200);code=h.code;const a=await call({action:'join',code,name:'Amanda'}),b=await call({action:'join',code,name:'Bob'}),tokens=[h.token,a.token,b.token];
assert.equal((await call()).status,401);assert.equal((await call({action:'start',code},a.token)).status,403);
for(const t of tokens)await call({action:'ready',code},t);
let s=await call({action:'start',code},h.token);assert.equal(s.phase,'question');
const row=await db.prepare('SELECT * FROM links_word_rooms WHERE code=?').bind(code).first(),raw=JSON.parse(row.state);raw.startsAt=Date.now()-1000;raw.deadline=Date.now()+50000;await db.prepare('UPDATE links_word_rooms SET state=? WHERE code=?').bind(JSON.stringify(raw),code).run();
const views=[];for(const t of tokens)views.push(await call({},t));const gi=views.findIndex(v=>v.isGiver),giver=tokens[gi],others=tokens.filter(t=>t!==giver),prompt=views[gi].prompt;
assert.ok(prompt);assert.equal(views.filter(v=>v.prompt).length,1);const tv=await call({},'',h.displayKey);assert.equal(tv.prompt,undefined);assert.equal(tv.displayKey,undefined);assert.equal(tv.answer,undefined);
assert.equal((await call({action:'clue',code,game:1,index:0,text:'hello'},'',h.displayKey)).status,403);
assert.equal((await call({action:'clue',code,game:1,index:0,text:prompt.answer},giver)).status,400);
assert.equal((await call({action:'clue',code,game:1,index:0,text:'Think of a surprising thing'},others[0])).status,403);
assert.equal((await call({action:'clue',code,game:1,index:0,text:'Think of a surprising thing'},giver)).status,200);
assert.equal((await call({action:'guess',code,game:1,index:0,text:prompt.answer},giver)).status,409);
for(const t of others){s=await call({action:'guess',code,game:1,index:0,text:prompt.answer},t);assert.equal(s.status,200)}
assert.equal(s.phase,'reveal');assert.equal(s.answer,prompt.answer);assert.equal(s.players.find(p=>p.name===views[gi].players.find(p=>p.you).name).score,200);
assert.equal((await call({action:'guess',code,game:1,index:0,text:prompt.answer},others[0])).status,409);
assert.ok(blocked(prompt.forbidden[0].split('').join('.'),prompt));
let sim={...raw,index:raw.order.length,phase:'reveal',deadline:0};advance(sim,Date.now());assert.equal(sim.deadline-sim.startsAt,40000);sim.index=sim.order.length*2-1;sim.phase='reveal';sim.deadline=0;advance(sim,Date.now());assert.equal(sim.phase,'ended');assert.equal(new Set(raw.deck).size,6);
console.log('PASS: room permissions, secret answers, TV isolation, forbidden words, scoring, duplicate locks, unique prompts and lightning/final transitions.');
