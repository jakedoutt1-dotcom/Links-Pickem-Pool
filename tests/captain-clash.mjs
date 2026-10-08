import assert from 'node:assert/strict';import {fixture} from './helpers/pool-format-fixture.mjs';import {onRequest} from '../functions/new-build/api/captain-clash.js';
const {db}=fixture();
async function call(body={},token='',query='',display=''){const get=!body.action,r=await onRequest({env:{DB:db},request:new Request('https://clash.local/new-build/api/captain-clash'+query,{method:get?'GET':'POST',headers:{Origin:'https://clash.local','x-captain-token':token,'x-captain-display':display},...(get?{}:{body:JSON.stringify(body)})})});return {status:r.status,...(r.headers.get('content-type')?.includes('json')?await r.json():{photo:await r.arrayBuffer()})}}
const host=await call({action:'create',name:'Jake',mode:'mixed'}),code=host.code;assert.equal(host.status,200);const a=await call({action:'join',code,name:'Amanda'}),b=await call({action:'join',code,name:'Bob'});
assert.equal((await call({},'', '?code='+code)).status,401);
assert.equal((await call({action:'start',code},a.token)).status,403);
const data='/9j/AA=='.replace('AA==','')+'/9k='; // Structural JPEG marker fixture; browsers use a real JPEG in their test.
const upload=await call({action:'upload',code,data},a.token);assert.equal(upload.status,200);const photo=upload.photos[0].id;
assert.equal((await call({},b.token,'?code='+code+'&photo='+photo)).status,404);
assert.equal((await call({},'', '?code='+code+'&photo='+photo,host.displayKey)).status,404);
assert.equal((await call({action:'approve',code,id:photo},a.token)).status,403);
assert.equal((await call({action:'approve',code,id:photo},host.token)).status,200);
assert.equal((await call({},b.token,'?code='+code+'&photo='+photo)).status,200);
for(const p of [host,a,b])await call({action:'ready',code},p.token);
let state=await call({action:'start',code},host.token);assert.equal(state.phase,'write');assert.equal(state.options.length,0);
assert.equal((await call({action:'caption',code,game:1,index:0,text:'Too soon'},a.token)).status,409);
function mutate(fn){const s=JSON.parse(db.raw.prepare('SELECT state FROM links_caption_rooms WHERE code=?').get(code).state);fn(s);db.raw.prepare('UPDATE links_caption_rooms SET state=? WHERE code=?').run(JSON.stringify(s),code)}
mutate(s=>s.startsAt=Date.now()-1000);
for(const [i,p] of [host,a,b].entries()){assert.equal((await call({action:'caption',code,game:1,index:0,text:'Caption '+i},p.token)).status,200)}
state=await call({},a.token,'?code='+code);assert.equal(state.options.length,0);assert.equal(JSON.stringify(state).includes('Caption 0'),false);
assert.equal((await call({action:'caption',code,game:1,index:0,text:'Again'},a.token)).status,409);
mutate(s=>s.deadline=Date.now()-1);state=await call({},a.token,'?code='+code);assert.equal(state.phase,'vote');assert.equal(state.options.length,3);assert.ok(state.options.every(o=>!o.author));
assert.equal((await call({action:'vote',code,game:1,index:0,option:state.options.find(o=>o.mine).id},a.token)).status,400);
const target=state.options.find(o=>o.text==='Caption 0').id;
for(const p of [a,b])assert.equal((await call({action:'vote',code,game:1,index:0,option:target},p.token)).status,200);
assert.equal((await call({action:'vote',code,game:1,index:0,option:target},a.token)).status,409);
mutate(s=>s.deadline=Date.now()-1);state=await call({},host.token,'?code='+code);assert.equal(state.phase,'reveal');assert.equal(state.players.find(p=>p.name==='Jake').score,200);assert.ok(state.options.every(o=>o.author));
state=await call({},host.token,'?code='+code);assert.equal(state.players[0].score,200);
const tv=await call({},'', '?code='+code,host.displayKey);assert.equal(tv.host,false);assert.equal(tv.displayKey,undefined);assert.equal((await call({action:'again',code},'', '',host.displayKey)).status,403);
mutate(s=>{s.index=4;s.phase='vote';s.deadline=Date.now()-1;for(const p of Object.values(s.players))p.roundPoints=0});state=await call({},host.token,'?code='+code);assert.equal(state.players[0].score,600);assert.equal(state.phase,'reveal');mutate(s=>s.deadline=Date.now()-1);state=await call({},host.token,'?code='+code);assert.equal(state.phase,'ended');
state=await call({action:'again',code},host.token);assert.equal(state.game,2);assert.equal(state.phase,'lobby');assert.ok(state.players.every(p=>p.score===0&&!p.ready));
assert.equal((await call({action:'reject',code,id:photo},host.token)).status,200);assert.equal(db.raw.prepare('SELECT count(*) n FROM links_caption_photos').get().n,0);
for(let i=0;i<5;i++)assert.equal((await call({action:'join',code,name:'Guest'+i})).status,200);assert.equal((await call({action:'join',code,name:'Ninth'})).status,409);
db.raw.prepare('UPDATE links_caption_rooms SET expires=0 WHERE code=?').run(code);assert.equal((await call({},host.token,'?code='+code)).status,404);
console.log('PASS room roles, upload privacy/approval/removal, 8-player cap, timed caption/vote locks, anonymous voting, no self-votes, exact/double scoring, final reveal, rematch and expiry.');db.raw.close();
