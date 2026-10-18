import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { onRequest } from '../functions/new-build/api/poker-night.js';

// Exercise the real request handler and its SQLite statements without a live service.
class DB {
  constructor() { this.raw = new DatabaseSync(':memory:'); this.queue = Promise.resolve(); }
  prepare(sql) {
    let values = []; const raw = this.raw;
    return {
      bind(...args) { values = args; return this; },
      async first() { return raw.prepare(sql).get(...values) || null; },
      async all() { return { results: raw.prepare(sql).all(...values) }; },
      async run() { const r = raw.prepare(sql).run(...values); return { meta: { changes: Number(r.changes) } }; }
    };
  }
  batch(statements) {
    const job = this.queue.then(async () => {
      this.raw.exec('BEGIN');
      try { const out = []; for (const s of statements) out.push(await s.run()); this.raw.exec('COMMIT'); return out; }
      catch (error) { this.raw.exec('ROLLBACK'); throw error; }
    });
    this.queue = job.catch(() => {}); return job;
  }
}
const db = new DB(), origin = 'https://poker.example';
async function request(body, credentials = {}, query = {}, options = {}) {
  const url = origin + '/new-build/api/poker-night?' + new URLSearchParams(query);
  const response = await onRequest({ env: { DB: db }, request: new Request(url, {
    method: options.method || (body ? 'POST' : 'GET'),
    headers: { Origin: options.origin || origin, 'Content-Type': 'application/json',
      'x-poker-token': credentials.playerToken || '', 'x-poker-host': credentials.hostToken || '',
      'x-poker-display': credentials.displayKey || '' },
    ...(body ? { body: options.raw || JSON.stringify({ requestId: crypto.randomUUID(), ...body }) } : {})
  }) });
  return { status: response.status, headers: response.headers, data: await response.json() };
}
const stored = code => db.raw.prepare('SELECT state,version FROM links_poker_night_rooms WHERE code=?').get(code);
let result = await request({action:'create',name:'Alice'}, {}, {}, {origin:'https://elsewhere.example'});
assert.equal(result.status,403);
assert.equal((await request(null,{}, {}, {method:'DELETE'})).status,405);
assert.equal((await request({action:'create'}, {}, {}, {raw:'{"broken"'})).status,400);
assert.equal((await request({action:'create'}, {}, {}, {raw:' '.repeat(8001)})).status,413);
for(const settings of [{startingChips:-1},{startingChips:100.5},{tableSize:7},{turnSeconds:0},{maxReentries:1000},{bigBlind:75,smallBlind:25}]) {
  assert.equal((await request({action:'create',name:'Invalid',settings})).status,409);
}
const host = (await request({action:'create',name:'Alice',mode:'tournament',settings:{turnSeconds:60}})).data;
const code=host.room.code;
const guests=[];
for(const name of ['Bob','Chris']) guests.push((await request({action:'join',code,name})).data);
assert.equal((await request({action:'start',code},host.session)).status,200);
const tv={displayKey:host.room.displayKey}, observer=(await request({action:'create',name:'Outside'})).data;
for(const credentials of [{},observer.session,{playerToken:crypto.randomUUID()+crypto.randomUUID()}]) {
  assert.equal((await request(null,credentials,{code})).status,401);
}
for(const action of ['pause','resume','close','feature','start','next']) {
  const before=stored(code);
  const denied=await request({action,code,tableId:'table-1'},guests[0].session);
  assert.equal(denied.status,403);
  assert.deepEqual(stored(code),before,'unauthorized host action cannot change room');
}
for(const action of ['bet','pause','rebuy','sitout','join']) {
  const before=stored(code);
  assert.equal((await request({action,code,name:'TV',away:true},tv)).status,403);
  assert.deepEqual(stored(code),before,'TV cannot mutate room');
}
for(const credentials of [host.session,guests[0].session,guests[1].session,tv,{hostToken:host.session.hostToken}]) {
  const response=await request(null,credentials,{code});
  assert.equal(response.status,200);
  assert.equal(response.headers.get('Cache-Control'),'no-store');
  assert.equal(response.headers.get('Referrer-Policy'),'no-referrer');
  const room=response.data.room, encoded=JSON.stringify(room), own=credentials.playerToken&&[host,...guests].find(p=>p.session.playerToken===credentials.playerToken)?.session.playerId;
  for(const table of room.tables)for(const player of table.players)assert.equal(player.holeCards.length,player.id===own?2:0);
  for(const key of ['"deck"','"burns"','"hostHash"','"processed"','"joinReceipts"','"playerToken"','"hostToken"']) assert.equal(encoded.includes(key),false,key+' never crosses API');
  if(!credentials.hostToken)assert.equal(room.displayKey,undefined);
}
const room=(await request(null,host.session,{code})).data.room, table=room.table;
const actor=[host,...guests].find(p=>p.session.playerId===table.actorId);
const another=[host,...guests].find(p=>p.session.playerId!==table.actorId);
const before=stored(code);
assert.equal((await request({action:'bet',code,tableId:table.id,handNumber:table.handNumber,turnId:table.turnId,move:'fold'},another.session)).status,409);
assert.deepEqual(stored(code),before,'another seat cannot fold the actor');
for(const amount of [-1,0,1.5,Number.MAX_SAFE_INTEGER]) {
  assert.equal((await request({action:'bet',code,tableId:table.id,handNumber:table.handNumber,turnId:table.turnId,move:'raise',amount},actor.session)).status,409);
  assert.deepEqual(stored(code),before,'invalid chip amount leaves every stack intact');
}
const bet={action:'bet',code,tableId:table.id,handNumber:table.handNumber,turnId:table.turnId,move:'call',requestId:crypto.randomUUID()};
const repeated=await Promise.all([request(bet,actor.session),request(bet,actor.session)]);
assert.ok(repeated.every(r=>r.status===200),JSON.stringify(repeated.map(r=>r.data)));
const state=JSON.parse(stored(code).state);
assert.equal(state.tables[0].actionNumber,table.turnId+1,'simultaneous retry applies chips exactly once');
assert.equal(state.tables[0].pot+state.tables[0].players.reduce((sum,p)=>sum+p.stack,0),3*host.room.settings.startingChips);
assert.equal((await request({action:'close',code},host.session)).status,200);
assert.equal((await request({action:'join',code,name:'Late'})).status,409);
assert.equal(db.raw.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='links_party_results'").get(),undefined,'closed unfinished game creates no result');
console.log('PASS poker security: private cards, host-only authority, TV read-only, no-store, invalid inputs, seat isolation, concurrent duplicate chips and closed-room joins.');
