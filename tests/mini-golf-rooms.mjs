import assert from 'node:assert/strict';import {fixture} from './helpers/pool-format-fixture.mjs';import {onRequest} from '../functions/new-build/api/mini-golf.js';
const {db:DB}=fixture();const sql=DB.raw;
const tokens=Array.from({length:9},()=>crypto.randomUUID());let room;
async function call(action,i=0,extra={}){const r=await onRequest({request:new Request('https://test/api',{method:'POST',headers:{Origin:'https://test'},body:JSON.stringify({action,token:tokens[i],room,name:'Player '+i,...extra})}),env:{DB}});return {status:r.status,...await r.json()}}
room=(await call('create')).room;assert(room);for(let i=1;i<8;i++)assert.equal((await call('join',i)).status,200);assert.equal((await call('join',8)).status,409);assert.equal((await call('start',1,{round:0})).status,403);assert.equal((await call('start',0,{round:0})).status,200);
assert.equal((await call('finish',1,{round:1,shots:[]})).status,400);
const shots=Array.from({length:10},()=>[Math.PI,.05]);for(let i=0;i<7;i++)assert.equal((await call('finish',i,{round:1,shots})).status,200);
let state=await call('state');assert.equal(state.rulesVersion,4);assert.equal(state.hole,0);assert.equal(state.phase,'playing');assert.equal(state.remaining,1);assert(!('score' in state.players[0]));assert.equal((await call('finish',7,{round:1,shots})).status,200);state=await call('state');assert.equal(state.phase,'results');assert(state.players.every(p=>p.score===10));assert.equal((await call('start',0,{round:1})).status,200);assert.equal((await call('finish',1,{round:1,shots})).status,409);assert.equal((await call('end',1,{round:2})).status,403);assert.equal((await call('end',0,{round:2})).status,200);assert((await call('state')).players.every(p=>p.dnf));console.log('PASS eight-player barrier, hidden scores, replay verification, round reset, host authority and DNF');

assert.equal(state.holeCount,18);
state=await call('state');assert(state.players.every(p=>p.total===20&&p.holesPlayed===2));
for(let round=3;round<=18;round++){
 assert.equal((await call('start',0,{round:round-1})).status,200);
 state=await call('state');assert.equal(state.hole,round-1);assert.equal(state.complete,false);
 // Everyone receives a bounded score even when the host closes an unfinished hole.
 assert.equal((await call('end',0,{round})).status,200);
 state=await call('state');assert(state.players.every(p=>p.total===round*10&&p.holesPlayed===round));
}
assert.equal(state.complete,true);assert.equal((await call('start',0,{round:18})).status,409);
// An old room keeps its original three-hole cycle.
const legacy=JSON.parse(sql.prepare('SELECT state FROM links_mini_golf_rooms WHERE id=?').get(room).state);
legacy.rulesVersion=3;legacy.round=3;legacy.phase='results';sql.prepare('UPDATE links_mini_golf_rooms SET state=? WHERE id=?').run(JSON.stringify(legacy),room);
assert.equal((await call('start',0,{round:3})).status,200);state=await call('state');assert.equal(state.hole,0);assert.equal(state.holeCount,3);assert.equal(state.complete,false);
const soloRoom='ABCDEF1234';assert.equal((await call('solo',0,{room:soloRoom,hole:17,rulesVersion:4,shots})).status,200);
assert.equal((await call('solo',0,{room:'ABCDEF1235',hole:17,rulesVersion:3,shots})).status,400);
assert.equal((await call('solo',0,{room:'ABCDEF1236',hole:18,rulesVersion:4,shots})).status,400);
console.log('PASS 18-hole totals, finite course completion, bounded DNF, legacy cycle and new solo hole validation');
