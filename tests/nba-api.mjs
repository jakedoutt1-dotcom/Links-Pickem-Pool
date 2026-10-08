import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {onRequest} from '../functions/new-build/api/nba.js';
import {nbaDay,pickClosed,validDay,seasonRange} from '../public/new-build/nba-core.mjs';
const sql=new DatabaseSync(':memory:');sql.exec(`CREATE TABLE pool_sessions(token TEXT,pool_id INTEGER,player_name TEXT,role TEXT,expires_at TEXT);CREATE TABLE pool_players(pool_id INTEGER,name TEXT);CREATE TABLE links_pool_slots(pool_id INTEGER,game_type TEXT,active INTEGER);INSERT INTO pool_sessions VALUES('alice',1,'Alice','player','2099-01-01'),('admin',1,'Owner','admin','2099-01-01'),('other',2,'Other','player','2099-01-01');INSERT INTO pool_players VALUES(1,'Alice'),(1,'Owner'),(1,'Bob');INSERT INTO links_pool_slots VALUES(1,'nba',1);`);
const db={prepare(q){let args=[];return{bind(...v){args=v;return this},async first(){return sql.prepare(q).get(...args)||null},async all(){return{results:sql.prepare(q).all(...args)}},async run(){return{meta:{changes:Number(sql.prepare(q).run(...args).changes)}}}}},async batch(stmts){const results=[];for(const s of stmts)results.push(await s.run());return results}};
const date=nbaDay(),later=new Date(Date.now()+3600000).toISOString();
const game=id=>({id:String(id),date:later,season:{year:2027,type:2},competitions:[{date:later,timeValid:true,status:{type:{state:'pre',completed:false,description:'Scheduled'}},competitors:[{homeAway:'away',team:{id:147,displayName:'Lakers'},records:[{type:'total',summary:'1-0'}]},{homeAway:'home',team:{id:111,displayName:'Celtics'},records:[{type:'total',summary:'0-1'}]}]}]});
const games=[game(1),game(2)];const original=fetch;global.fetch=async()=>Response.json({events:games});
async function call(body,token='alice',day=date){const r=await onRequest({env:{DB:db},request:new Request('https://test/api/nba?pool=1&date='+day,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token},...(body?{body:JSON.stringify({pool:1,date:day,...body})}:{})})});return{status:r.status,data:await r.json()}}
try{
 assert.equal((await call(null,'other')).status,401);assert.equal((await call(null,'bad')).status,401);assert.equal((await call(null,'alice','2026-02-31')).status,400);
 let r=await call();assert.equal(r.status,200);assert.equal(r.data.games.length,2);assert.equal(r.data.standings.length,3);assert.equal(r.data.active,true);
 assert.equal((await call({action:'pick',eventId:'1',team:'147',player:'Bob'})).status,200);assert.equal((await call({action:'pick',eventId:'2',team:'111'})).status,200);assert.equal(sql.prepare("SELECT COUNT(*) n FROM links_nba_picks WHERE player='Alice'").get().n,2);assert.deepEqual((await call()).data.shared,[]);
 assert.equal((await call({action:'pick',eventId:'1',team:'111'})).status,200);assert.equal((await call({action:'pick',eventId:'1',team:'147'})).status,200);assert.equal((await call()).data.picks['1'],'147');
 games[0].date=new Date(Date.now()-1000).toISOString();assert.equal((await call({action:'pick',eventId:'1',team:'111',start:'2099-01-01'})).status,403);
 games[0].date=later;assert.equal((await call({action:'pick',eventId:'1',team:'111'})).status,403,'Delay must not reopen');
 assert.equal((await call({action:'pick',eventId:'2',team:'147'})).status,200,'Other doubleheader game remains open');
 assert.equal((await call({action:'access',player:'Alice',active:false})).status,403);assert.equal((await call({action:'access',player:'Alice',active:false},'admin')).status,200);assert.equal((await call({action:'pick',eventId:'2',team:'111'})).status,403);
 await call({action:'access',player:'Alice',active:true},'admin');games[0].competitions[0].status={type:{state:'post',completed:true,description:'Final/OT'}};games[0].competitions[0].competitors[0].winner=true;games[1].competitions[0].status={type:{state:'pre',description:'Postponed'}};
 r=await call();assert.equal(r.data.standings.find(x=>x.player==='Alice').wins,1);assert.equal(r.data.standings.find(x=>x.player==='Alice').voids,1);assert.equal(r.data.season.find(x=>x.player==='Alice').points,1);assert.equal(r.data.shared.length,1);
 const oldFinal={...r.data.games[0],id:'season-test',day:'2026-10-20',final:true,winner:'147',voided:false};
 sql.prepare('INSERT INTO links_nba_games VALUES(?,?,?,?,?)').run('2026-10-20','season-test',JSON.stringify(oldFinal),1,new Date().toISOString());
 sql.prepare('INSERT INTO links_nba_picks VALUES(?,?,?,?,?,?)').run(1,'Alice','2026-10-20','season-test','147',new Date().toISOString());
 const excluded={...oldFinal,id:'old-season',day:'2026-06-01'};sql.prepare('INSERT INTO links_nba_games VALUES(?,?,?,?,?)').run(excluded.day,excluded.id,JSON.stringify(excluded),1,new Date().toISOString());sql.prepare('INSERT INTO links_nba_picks VALUES(?,?,?,?,?,?)').run(1,'Alice',excluded.day,excluded.id,'147',new Date().toISOString());
 global.fetch=async()=>Response.json({events:[]});const jan=await call(null,'alice','2027-01-15');assert.equal(jan.status,200);assert.ok(jan.data.season.find(p=>p.player==='Alice').points>=1);assert.equal(jan.data.standings.find(p=>p.player==='Alice').points,0);
 const withinSeason=sql.prepare("SELECT COUNT(*) n FROM links_nba_picks WHERE player='Alice' AND day>='2026-07-01' AND day<='2027-06-30' AND team='147'").get().n;assert.equal(jan.data.season.find(p=>p.player==='Alice').points,2,'Only final wins in current July–June season count');
 sql.prepare("DELETE FROM links_nba_picks WHERE event_id IN ('season-test','old-season')").run();
 global.fetch=async()=>new Response('',{status:503});assert.equal((await call({action:'pick',eventId:'2',team:'111'})).status,503);assert.equal(sql.prepare('SELECT COUNT(*) n FROM links_nba_picks').get().n,2);
 assert.equal(pickClosed({...r.data.games[0],start:'2099-01-01',final:false,live:true}),true);assert.equal(validDay('2026-02-31'),false);
 assert.deepEqual(seasonRange('2027-01-15'),['2026-07-01','2027-06-30']);assert.deepEqual(seasonRange('2026-10-15'),['2026-07-01','2027-06-30']);
 console.log('PASS NBA auth, pool isolation, independent games, tip-off and sticky locks, privacy, activation, scoring, voids, feed failure and roster standings');
}finally{global.fetch=original;sql.close()}
