import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {cleanConfig,validateCard,scoreCard} from '../public/new-build/event-pool-core.mjs';
import {onRequest} from '../functions/new-build/api/event-pool.js';
const base={title:'Test',year:2026,lockAt:'2099-01-01T00:00:00Z',pickCount:2,countBest:1,penalty:10,format:'best',field:['A','B','C','D','E','F'].map((name,i)=>({name,tier:i%2+1}))};
test('golf counted scores, cuts, tiers and one-and-done',()=>{
 const c=cleanConfig('golf',base);assert.equal(scoreCard('golf',c,{picks:['A','B']},{A:{status:'final',score:-5},B:{status:'cut'}}).score,-5);
 assert.equal(scoreCard('golf',c,{picks:['A','B']},{}).score,null);
 assert.throws(()=>validateCard({...c,format:'tiers'},{picks:['A','C']}),/tier/);
 assert.throws(()=>validateCard({...c,format:'one',pickCount:1},{picks:['A']},['A']),/already/);
 assert.equal(scoreCard('golf',{...c,format:'one'},{picks:['B']},{B:{status:'cut'}}).score,0);
});
test('NASCAR finishing positions and garage excluded from points',()=>{
 const c=cleanConfig('nascar',{...base,format:'fantasy'});const card=validateCard(c,{picks:['A','B','C','D','E'],garage:'F'});
 assert.throws(()=>validateCard(c,{...card,garage:'A'}),/garage/);
 assert.throws(()=>validateCard(c,card,Array(10).fill('A')),/limit/);
 const result=Object.fromEntries(base.field.map((f,i)=>[f.name,{status:'final',finish:i+1,points:10}]));
 assert.equal(scoreCard('nascar',c,card,result).score,50);
 assert.equal(scoreCard('nascar',{...c,format:'simple'},card,result).score,15);
});
test('API permissions, entry isolation, frozen setup, privacy and verified results',async()=>{
 const sql=new DatabaseSync(':memory:');sql.exec("CREATE TABLE pool_sessions(token TEXT,pool_id INTEGER,player_name TEXT,role TEXT,expires_at TEXT);CREATE TABLE pool_active_games(pool_id INTEGER,game_type TEXT,active INTEGER);INSERT INTO pool_sessions VALUES('owner',1,'Owner','admin','2099-01-01'),('alice',1,'Alice','player','2099-01-01'),('outsider',2,'Other','admin','2099-01-01');INSERT INTO pool_active_games VALUES(1,'masters',1),(1,'nascar',1);");
 const db={prepare(query){let args=[];return{bind(...v){args=v;return this},async run(){return{meta:{changes:Number(sql.prepare(query).run(...args).changes)}}},async first(){return sql.prepare(query).get(...args)},async all(){return{results:sql.prepare(query).all(...args)}}}}};
 async function call(token,body){const r=await onRequest({request:new Request('https://fixture/api?pool=1&game=golf&event=test',{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token},...(body?{body:JSON.stringify({pool:1,game:'golf',event:'test',version:1,...body})}:{})}),env:{DB:db}});return{status:r.status,data:await r.json()};}
 assert.equal((await call('outsider')).status,401);
 assert.equal((await call('alice',{action:'configure',config:base})).status,403);
 assert.equal((await call('owner',{action:'configure',config:base})).status,200);
 assert.equal((await call('alice',{action:'save',card:{picks:['A','B']}})).status,200);
 assert.equal((await call('owner',{action:'configure',config:base})).status,409);
 assert.deepEqual((await call('owner')).data.rows,[]);
 assert.deepEqual((await call('alice')).data.card.picks,['A','B']);
 const closed={...base,lockAt:'2000-01-01T00:00:00Z'};sql.prepare('UPDATE links_event_pools SET config=?').run(JSON.stringify(closed));
 assert.equal((await call('alice',{action:'save',card:{picks:['C','D']}})).status,403);
 assert.equal((await call('alice',{action:'results',results:[]})).status,403);
 assert.equal((await call('owner',{action:'results',results:[{name:'A',status:'final',score:-5},{name:'B',status:'final',score:-3}]})).status,200);
 assert.equal((await call('alice')).data.rows[0].score,-5);
 assert.equal((await call('owner',{action:'results',results:[]})).status,409);
 sql.close();
});
