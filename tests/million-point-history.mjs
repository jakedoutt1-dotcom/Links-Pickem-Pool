import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/million-point.js';
import {loadBank,questionText} from '../functions/lib/million-point.js';
const {db}=fixture();let cookie='',code;const cookies=new Map();
async function call(body={},token=''){const r=await onRequest({env:{DB:db},request:new Request('https://test.local/new-build/api/million-point?code='+code,{method:body.action?'POST':'GET',headers:{Origin:'https://test.local',Cookie:cookie,'x-million-token':token},...(body.action?{body:JSON.stringify({code,...body})}:{})})});for(const set of r.headers.getSetCookie()){assert(set.includes('HttpOnly'));assert(set.includes('Secure'));const pair=set.split(';')[0];cookies.set(pair.split('=')[0],pair)}cookie=[...cookies.values()].join('; ');const j=await r.json();assert.equal(r.status,200,JSON.stringify(j));return j}
const raw=()=>JSON.parse(db.raw.prepare('SELECT state FROM links_million_rooms WHERE code=?').get(code).state);
const shown=[];
for(let game=0;game<4;game++){
 const host=await call({action:'create',mode:'duel',name:'Host'});code=host.code;const guest=await call({action:'join',name:'Guest'});await call({action:'ready'},host.token);await call({action:'ready'},guest.token);await call({action:'start'},host.token);
 let s=raw();assert(s.deck.every(q=>!shown.includes(q.id)));s.deadline=Date.now()-1;db.raw.prepare('UPDATE links_million_rooms SET state=? WHERE code=?').run(JSON.stringify(s),code);const v=await call({},guest.token);assert.equal(v.phase,'question');assert.equal(v.historyId,undefined);assert.equal(v.seen,undefined);shown.push(raw().deck[0].id);
}
assert.equal(new Set(shown).size,4);assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM links_million_history').get().n,1);
const bank=await loadBank({},shown);assert(bank.questions.every(q=>!shown.includes(q.id)));const texts=bank.questions.slice(0,3).map(questionText),next=await loadBank({},[],texts);assert(next.questions.every(q=>!texts.includes(questionText(q))));assert(next.notice.includes('backup'));
console.log('PASS four new rooms retain private host history, avoid recent IDs/text, and disclose backup questions.');
