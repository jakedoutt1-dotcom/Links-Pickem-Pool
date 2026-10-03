import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {onRequest} from '../functions/new-build/api/mlb.js';
import {mlbDay,pickClosed,validDay} from '../public/new-build/mlb-core.mjs';
const sql=new DatabaseSync(':memory:');sql.exec(`CREATE TABLE pool_sessions(token TEXT,pool_id INTEGER,player_name TEXT,role TEXT,expires_at TEXT);CREATE TABLE pool_players(pool_id INTEGER,name TEXT);CREATE TABLE links_pool_slots(pool_id INTEGER,game_type TEXT,active INTEGER);INSERT INTO pool_sessions VALUES('alice',1,'Alice','player','2099-01-01'),('admin',1,'Owner','admin','2099-01-01'),('other',2,'Other','player','2099-01-01');INSERT INTO pool_players VALUES(1,'Alice'),(1,'Owner'),(1,'Bob');INSERT INTO links_pool_slots VALUES(1,'mlb',1);`);
const db={prepare(q){let args=[];return{bind(...v){args=v;return this},async first(){return sql.prepare(q).get(...args)||null},async all(){return{results:sql.prepare(q).all(...args)}},async run(){return{meta:{changes:Number(sql.prepare(q).run(...args).changes)}}}}},async batch(stmts){const results=[];for(const s of stmts)results.push(await s.run());return results}};
const date=mlbDay(),later=new Date(Date.now()+3600000).toISOString();
const game=id=>({gamePk:id,gameType:'R',officialDate:date,gameDate:later,doubleHeader:'Y',gameNumber:id,status:{abstractGameState:'Preview',detailedState:'Scheduled'},teams:{away:{team:{id:147,name:'Yankees'},leagueRecord:{wins:1,losses:0}},home:{team:{id:111,name:'Red Sox'},leagueRecord:{wins:0,losses:1}}}});
const games=[game(1),game(2)];const original=fetch;global.fetch=async()=>Response.json({dates:[{games}]});
async function call(body,token='alice',day=date){const r=await onRequest({env:{DB:db},request:new Request('https://test/api/mlb?pool=1&date='+day,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token},...(body?{body:JSON.stringify({pool:1,date:day,...body})}:{})})});return{status:r.status,data:await r.json()}}
try{
 assert.equal((await call(null,'other')).status,401);assert.equal((await call(null,'bad')).status,401);assert.equal((await call(null,'alice','2026-02-31')).status,400);
 let r=await call();assert.equal(r.status,200);assert.equal(r.data.games.length,2);assert.equal(r.data.standings.length,3);assert.equal(r.data.active,true);
 assert.equal((await call({action:'pick',eventId:'1',team:'147',player:'Bob'})).status,200);assert.equal((await call({action:'pick',eventId:'2',team:'111'})).status,200);assert.equal(sql.prepare("SELECT COUNT(*) n FROM links_mlb_picks WHERE player='Alice'").get().n,2);assert.deepEqual((await call()).data.shared,[]);
 games[0].gameDate=new Date(Date.now()-1000).toISOString();assert.equal((await call({action:'pick',eventId:'1',team:'111',start:'2099-01-01'})).status,403);
 games[0].gameDate=later;assert.equal((await call({action:'pick',eventId:'1',team:'111'})).status,403,'Delay must not reopen');
 assert.equal((await call({action:'pick',eventId:'2',team:'147'})).status,200,'Other doubleheader game remains open');
 assert.equal((await call({action:'access',player:'Alice',active:false})).status,403);assert.equal((await call({action:'access',player:'Alice',active:false},'admin')).status,200);assert.equal((await call({action:'pick',eventId:'2',team:'111'})).status,403);
 await call({action:'access',player:'Alice',active:true},'admin');games[0].status={abstractGameState:'Final',detailedState:'Final'};games[0].teams.away.isWinner=true;games[1].status={abstractGameState:'Preview',detailedState:'Postponed'};
 r=await call();assert.equal(r.data.standings.find(x=>x.player==='Alice').wins,1);assert.equal(r.data.standings.find(x=>x.player==='Alice').voids,1);assert.equal(r.data.season.find(x=>x.player==='Alice').points,1);assert.equal(r.data.shared.length,1);
 global.fetch=async()=>new Response('',{status:503});assert.equal((await call({action:'pick',eventId:'2',team:'111'})).status,503);assert.equal(sql.prepare('SELECT COUNT(*) n FROM links_mlb_picks').get().n,2);
 assert.equal(pickClosed({...r.data.games[0],start:'2099-01-01',final:false,live:true}),true);assert.equal(validDay('2026-02-31'),false);
 console.log('PASS MLB auth, pool isolation, doubleheaders, first-pitch and sticky locks, privacy, activation, scoring, voids, feed failure and roster standings');
}finally{global.fetch=original;sql.close()}
