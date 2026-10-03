// Synthetic local SQLite benchmark: no network, real accounts, email, or payments.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {fixture} from '../helpers/pool-format-fixture.mjs';
import {ensureAccounts} from '../../functions/lib/commissioner-account.js';
import {onRequestGet as weekly} from '../../functions/new-build/api/standings-v649.js';
import {onRequestGet as compare} from '../../functions/new-build/api/compare-picks.js';
const pools=Number(process.env.LOAD_POOLS||20000),players=Number(process.env.LOAD_PLAYERS||20),samples=Number(process.env.LOAD_SAMPLES||200);
for(const n of [pools,players,samples])assert.ok(Number.isInteger(n)&&n>0);
assert.ok(pools<=20000&&players<=50&&samples<=10000,'Bound local memory and work');
const {db}=fixture(),start=performance.now();
try{
 await ensureAccounts(db);
 const pool=db.raw.prepare("INSERT INTO pools(id,code,name,admin_salt,admin_hash,created_at) VALUES(?,?,?,'s','h','2026-01-01')"),member=db.raw.prepare("INSERT INTO pool_players(pool_id,name,password_hash,salt) VALUES(?,?,'h','s')"),pick=db.raw.prepare("INSERT INTO pool_picks VALUES(?,'nfl',?,4,?,?)"),access=db.raw.prepare("INSERT INTO pool_payments VALUES(?,'nfl',?,4,1)"),owner=db.raw.prepare('INSERT INTO links_pool_owners VALUES(?,?)');
 console.log(`Seeding ${pools} synthetic pools, ${pools*players} memberships and ${pools*players*16} picks locally...`);
 db.raw.exec('BEGIN');
 for(let n=0;n<pools;n++){const id=1000+n;pool.run(id,'TEST-'+id,'Synthetic '+id);owner.run(id,'owner'+id+'@example.invalid');for(let p=0;p<players;p++){const name='Player '+p;member.run(id,name);access.run(id,name);for(let g=0;g<16;g++)pick.run(id,name,g,'T'+(g*2+(p%2)))}}
 db.raw.exec('COMMIT');
 const seedMs=performance.now()-start;
 const events=Array.from({length:16},(_,g)=>({id:'synthetic-'+g,date:'2026-01-01',status:{type:{completed:true}},competitions:[{competitors:[{homeAway:'home',team:{abbreviation:'T'+g*2},score:'24',winner:true},{homeAway:'away',team:{abbreviation:'T'+(g*2+1)},score:'10'}]}]}));
 const previousFetch=globalThis.fetch;let feeds=0;
 globalThis.fetch=async url=>{assert.match(String(url),/^https:\/\/(site\.api|cdn)\.espn\.com\//);feeds++;return Response.json({events})};
 const times={weekly:[],compare:[]};
 try{for(let i=0;i<samples;i++){const id=1000+(i*97)%pools,request=new Request('https://synthetic.invalid/?pool='+id+'&week=4');for(const [name,handler] of [['weekly',weekly],['compare',compare]]){const before=performance.now(),r=await handler({request,env:{DB:db}}),body=await r.json();times[name].push(performance.now()-before);assert.equal(r.status,200);assert.equal(Number(body.pool.id),id);assert.equal((body.rows||body.players).length,players);if(name==='weekly')assert.equal(body.rows.find(r=>r.player==='Player 0').wins,16)}}}finally{globalThis.fetch=previousFetch}
 const plan=db.raw.prepare('EXPLAIN QUERY PLAN SELECT pool_id FROM links_pool_owners WHERE email=?').all('owner1000@example.invalid');assert.ok(plan.some(r=>r.detail.includes('links_owners_email')));
 const percentile=(v,p)=>[...v].sort((a,b)=>a-b)[Math.min(v.length-1,Math.floor(v.length*p))];
 const report={type:'LOCAL_SYNTHETIC_NOT_PRODUCTION_CAPACITY',pools,memberships:pools*players,picks:pools*players*16,seedMs,requests:samples*2,providerResponsesMocked:feeds,results:Object.fromEntries(Object.entries(times).map(([k,v])=>[k,{p50Ms:percentile(v,.5),p95Ms:percentile(v,.95),p99Ms:percentile(v,.99)}])),ownerLookupPlan:plan.map(r=>r.detail),limitations:['In-memory SQLite, not Cloudflare D1','Serial requests, not simultaneous users','Synthetic sports feeds; excludes network, logins, email and billing','Does not establish production capacity']};
 mkdirSync('output/scale-readiness',{recursive:true});writeFileSync('output/scale-readiness/local-benchmark.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{db.raw.close()}
