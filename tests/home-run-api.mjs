import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {onRequest} from '../functions/new-build/api/home-run.js';
import {weekOf,shiftDay,deadline,scoresFromFeed,rankRows} from '../public/new-build/home-run-core.mjs';
const sql=new DatabaseSync(':memory:');sql.exec(`CREATE TABLE pool_sessions(token TEXT,pool_id INTEGER,player_name TEXT,role TEXT,expires_at TEXT);CREATE TABLE pool_players(pool_id INTEGER,name TEXT);CREATE TABLE links_pool_slots(pool_id INTEGER,game_type TEXT,active INTEGER);INSERT INTO pool_sessions VALUES('alice',1,'Alice','player','2099-01-01'),('admin',1,'Owner','admin','2099-01-01'),('other',2,'Other','player','2099-01-01');INSERT INTO pool_players VALUES(1,'Alice'),(1,'Owner'),(1,'Bob');INSERT INTO links_pool_slots VALUES(1,'homerun',1);`);
const db={prepare(q){let args=[];return{bind(...v){args=v;return this},async first(){return sql.prepare(q).get(...args)||null},async all(){return{results:sql.prepare(q).all(...args)}},async run(){return{meta:{changes:Number(sql.prepare(q).run(...args).changes)}}}}},async batch(stmts){return Promise.all(stmts.map(s=>s.run()))}};
const week=shiftDay(weekOf(),7),past=shiftDay(weekOf(),-7),roster=['1','2','3','4','5','6'],active=['1','2','3','4'];
let outage=false;const original=fetch;global.fetch=async url=>{if(outage)return new Response('',{status:503});if(String(url).includes('/players'))return Response.json({people:roster.map(id=>({id:Number(id),fullName:'Hitter '+id,active:true,primaryPosition:{type:'Infielder',abbreviation:'1B'},currentTeam:{id:147,name:'Yankees'}}))});return Response.json({stats:[{group:{displayName:'hitting'},totalSplits:6,splits:roster.map((id,i)=>({player:{id:Number(id)},stat:{homeRuns:[1,2,0,3,10,20][i]}}))}]})};
async function call(body,token='alice',w=week){const r=await onRequest({env:{DB:db},request:new Request('https://test/api/home-run?pool=1&week='+w,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token},...(body?{body:JSON.stringify({pool:1,week:w,...body})}:{})})});return{status:r.status,data:await r.json()}}
try{
 assert.equal(deadline('2026-07-06'),'2026-07-06T04:00:00.000Z');assert.equal(deadline('2026-12-07'),'2026-12-07T05:00:00.000Z');
 assert.equal((await call(null,'other')).status,401);assert.equal((await call(null,'bad')).status,401);assert.equal((await call(null,'alice','2026-02-31')).status,400);
 const start=await call();assert.equal(start.status,200);assert.equal(start.data.hitters.length,6);assert.equal(start.data.standings.length,3);assert.equal(start.data.locked,false);
 for(const bad of [{roster,active:roster.slice(0,5)},{roster,active:roster},{roster:roster.slice(0,5),active},{roster:['1','1','3','4','5','6'],active},{roster,active:['1','2','3','99']},{roster,active:['1','1','3','4']}])assert.equal((await call({action:'lineup',...bad})).status,400);
 assert.equal((await call({action:'lineup',roster,active,player:'Bob'})).status,200);assert.equal(sql.prepare('SELECT player FROM links_hr_lineups').get().player,'Alice');
 let j=(await call()).data;assert.deepEqual(j.lineup.active,active);assert.equal(j.shared.length,0);
 assert.equal((await call({action:'lineup',roster,active},'alice',past)).status,403);
 assert.equal((await call({action:'access',player:'Alice',active:false})).status,403);
 assert.equal((await call({action:'access',player:'Alice',active:false},'admin')).status,200);assert.equal((await call({action:'lineup',roster,active})).status,403);await call({action:'access',player:'Alice',active:true},'admin');
 sql.prepare('INSERT INTO links_hr_lineups VALUES(?,?,?,?,?,?)').run(1,'Alice',past,JSON.stringify(roster),JSON.stringify(active),new Date().toISOString());
 j=(await call(null,'alice',past)).data;assert.equal(j.locked,true);assert.equal(j.standings[0].points,6);assert.equal(j.season[0].points,6);assert.equal(j.shared[0].active.length,4);assert.equal(j.resultsAvailable,true);
 sql.prepare("UPDATE links_hr_scores SET updated_at='2000-01-01'").run();outage=true;j=(await call(null,'alice',past)).data;assert.equal(j.standings[0].points,6);assert.match(j.warning,/could not refresh/);
 assert.throws(()=>scoresFromFeed({stats:[{group:{displayName:'hitting'},totalSplits:2,splits:[]}]}));
 sql.prepare("UPDATE links_pool_slots SET active=0").run();assert.equal((await call()).status,403);
 console.log('PASS Home Run deadline/DST, membership, lineup validation, privacy, paused access, bench exclusion, scoring, cache preservation and archive access');
}finally{global.fetch=original;sql.close()}
