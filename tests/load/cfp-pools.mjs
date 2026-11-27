// Multiple regular pools through real handlers, with a queued local SQLite DB.
// No live accounts, emails, scores or network traffic are changed.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {fixture} from '../helpers/pool-format-fixture.mjs';
import {playoffFixture} from '../helpers/cfp-bracket-fixture.mjs';
import {onRequest} from '../../functions/new-build/api/cfp.js';
import {cfpSeason} from '../../public/new-build/cfp-core.mjs';
const {db:base}=fixture(),season=cfpSeason()+1,f=playoffFixture(season),original=fetch;
const pools=10,perPool=25,concurrency=100,clients=[],phases={};let tail=Promise.resolve();
const enqueue=fn=>{const next=tail.then(fn);tail=next.catch(()=>{});return next};
const db={prepare(sql){const inner=base.prepare(sql),out={inner,bind(...args){inner.bind(...args);return out},first:()=>enqueue(()=>inner.first()),all:()=>enqueue(()=>inner.all()),run:()=>enqueue(()=>inner.run())};return out},batch:statements=>enqueue(()=>base.batch(statements.map(s=>s.inner)))};
for(let p=0;p<pools;p++){
 const pool=100+p;
 base.raw.prepare('INSERT INTO pools(id,code,name,admin_salt,admin_hash,created_at) VALUES(?,?,?,?,?,?)').run(pool,'LOAD'+p,'Pool '+p,'test','test','2026-01-01');
 base.raw.prepare('INSERT INTO pool_active_games VALUES(?,?,?,?,?)').run(pool,'cfp',1,1,'2026-01-01');
 for(let u=0;u<perPool;u++){
  const player='Player '+u,token='pool-'+p+'-user-'+u;
  base.raw.prepare('INSERT INTO pool_players(pool_id,name,password_hash,salt) VALUES(?,?,?,?)').run(pool,player,'test','test');
  base.raw.prepare('INSERT INTO pool_sessions VALUES(?,?,?,?,?)').run(token,pool,player,u===0?'admin':'player','2099-01-01');
  clients.push({pool,player,token,guess:40+p,winningGuess:28});
 }
}
globalThis.fetch=async url=>{assert.match(String(url),/^https:\/\/(site\.api|cdn)\.espn\.com\//);return Response.json({events:f.events})};
async function call(c,body=null,pool=c.pool){const started=performance.now(),r=await onRequest({env:{DB:db},request:new Request('https://load.invalid/new-build/api/cfp?pool='+pool+'&season='+season,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+c.token,Origin:'https://load.invalid','Content-Type':'application/json'},...(body?{body:JSON.stringify({pool,season,...body})}:{})})});return {status:r.status,data:await r.json(),ms:performance.now()-started};}
async function phase(name,items,fn){let index=0;const times=[],statuses={};await Promise.all(Array.from({length:Math.min(concurrency,items.length)},async()=>{while(index<items.length){const result=await fn(items[index++]);times.push(result.ms);statuses[result.status]=(statuses[result.status]||0)+1}}));times.sort((a,b)=>a-b);phases[name]={requests:times.length,statuses,p95Ms:Math.round(times[Math.floor(times.length*.95)])};console.log(name,JSON.stringify(phases[name]));}
const save=(c,version)=>({action:'bracketSave',picks:f.picks,guess:c.guess,winningGuess:c.winningGuess,submit:true,version,revision:1});
try{
 await phase('pending_blocked',clients,async c=>{const r=await call(c,save(c,0));assert.equal(r.status,403);return r});
 // Each commissioner can unlock their own pool only; keep identical player names.
 await phase('commissioner_unlocks',clients,async c=>{const admin=clients.find(a=>a.pool===c.pool);const r=await call(admin,{action:'playerAccess',player:c.player,unlocked:true});assert.equal(r.status,200);return r});
 await phase('cross_pool_denied',clients,async c=>{const r=await call(c,null,c.pool===109?100:c.pool+1);assert.equal(r.status,401);return r});
 await phase('simultaneous_submissions',clients,async c=>{const r=await call(c,save(c,0));assert.equal(r.status,200,JSON.stringify(r.data));return r});
 await phase('private_reads',clients,async c=>{const r=await call(c);assert.equal(r.status,200);assert.equal(r.data.playerCount,perPool);assert.equal(r.data.entryCount,perPool);assert.equal(r.data.bracket.entry.guess,c.guess);assert.equal(r.data.bracket.entry.player,c.player);assert.equal(r.data.bracket.shared.length,0);assert(r.data.bracket.standings.rows.every(e=>e.guess===null&&e.winningGuess===null));return r});
 await phase('competing_tab_saves',clients.slice(0,50),async c=>{const rs=await Promise.all([call(c,save(c,1)),call(c,{...save(c,1),guess:c.guess+1})]);assert.deepEqual(rs.map(r=>r.status).sort(),[200,409],'One save wins; stale tab cannot overwrite it');return rs[0].status===200?rs[0]:rs[1]});
 for(const c of clients){const row=base.raw.prepare('SELECT version,submitted FROM links_cfp_brackets WHERE pool_id=? AND season=? AND player=?').get(c.pool,season,c.player);assert.equal(row.submitted,1);assert.equal(row.version,clients.indexOf(c)<50?2:1);}
 f.finish();
 await phase('final_standings',clients,async c=>{const r=await call(c);assert.equal(r.status,200);assert.equal(r.data.bracket.locked,true);assert.equal(r.data.bracket.shared.length,perPool);assert.equal(r.data.bracket.standings.resolved,true);assert(r.data.bracket.standings.rows.every(e=>e.points===280&&e.wins===11));assert(r.data.bracket.shared.every(e=>e.pool_id===c.pool));return r});
 await phase('late_saves_blocked',clients,async c=>{const r=await call(c,save(c,1));assert.equal(r.status,409);return r});
 const report={type:'LOCAL_SIMULATED_MULTI_POOL_NOT_PRODUCTION_CAPACITY',pools,players:clients.length,concurrency,phases,requests:Object.values(phases).reduce((n,p)=>n+p.requests,0)+50,savedBrackets:base.raw.prepare('SELECT COUNT(*) n FROM links_cfp_brackets').get().n,limitations:['Production handlers against queued local in-memory SQLite, not Cloudflare D1','ESPN feeds simulated; no real accounts, entries or emails changed','Does not establish production throughput']};
 mkdirSync('output/scale-readiness',{recursive:true});writeFileSync('output/scale-readiness/cfp-pools.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{globalThis.fetch=original;base.raw.close();}
