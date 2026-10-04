import {DatabaseSync} from 'node:sqlite';
import assert from 'node:assert/strict';
import {saveNFLPick} from '../functions/lib/nfl-pick-save.js';
const sql=new DatabaseSync(':memory:');sql.exec(`CREATE TABLE pool_picks(pool_id INTEGER,sport TEXT,player_name TEXT,week INTEGER,game_index INTEGER,team TEXT,UNIQUE(pool_id,sport,player_name,week,game_index));INSERT INTO pool_picks VALUES(26,'nfl','Jake',4,5,'GB'),(26,'nfl','Jake',4,6,'BAL');`);
const db={prepare(q){return {bind(...args){return {async all(){return {results:sql.prepare(q).all(...args)}},async first(){return sql.prepare(q).get(...args)},async run(){return {meta:sql.prepare(q).run(...args)}}}}}}};
const save=(eventId,teams,team,gameIndex=5,player='Jake',pool=26)=>saveNFLPick(db,{pool,player,week:4,event:{eventId,teams,gameIndex},team});
await save('ravens',['BAL','TEN'],'TEN');assert.equal(sql.prepare('SELECT team FROM pool_picks WHERE game_index=5').get().team,'GB');assert.equal(sql.prepare('SELECT team FROM pool_picks WHERE game_index=6').get().team,'TEN');
await save('packers',['GB','TB'],'TB',0);assert.equal(sql.prepare('SELECT team FROM pool_picks WHERE game_index=5').get().team,'TB');
await Promise.all([save('bills',['BUF','NE'],'BUF'),save('jets',['NYJ','CHI'],'CHI')]);assert.equal(sql.prepare('SELECT count(*) n FROM pool_picks').get().n,4);assert.deepEqual(new Set(sql.prepare('SELECT team FROM pool_picks').all().map(r=>r.team)),new Set(['TB','TEN','BUF','CHI']));
await save('bills',['BUF','NE'],'NE',15);assert.equal(sql.prepare('SELECT count(*) n FROM pool_picks').get().n,4);
await save('packers',['GB','TB'],'GB',0,'Other');await save('packers',['GB','TB'],'GB',0,'Jake',99);assert.equal(sql.prepare('SELECT team FROM pool_picks WHERE pool_id=26 AND player_name=\'Jake\' AND game_index=5').get().team,'TB');
await assert.rejects(save('packers',['GB','TB'],'DAL'));
console.log('PASS reordered matchup edits, collision preservation, simultaneous different-game saves, separate pools and players, invalid teams, verified receipt.');
// Exercise the real authenticated endpoint, including kickoff and paid-week checks.
const {onRequestPost}=await import('../functions/new-build/api/picks.js');
sql.exec(`CREATE TABLE pools(id INTEGER,code TEXT,name TEXT);INSERT INTO pools VALUES(26,'TEST','Test');CREATE TABLE pool_players(pool_id INTEGER,name TEXT);INSERT INTO pool_players VALUES(26,'Jake');CREATE TABLE pool_sessions(token TEXT,pool_id INTEGER,player_name TEXT,role TEXT,expires_at TEXT);INSERT INTO pool_sessions VALUES('test',26,'Jake','player','2099-01-01');CREATE TABLE pool_payments(pool_id INTEGER,sport TEXT,player_name TEXT,week INTEGER,paid INTEGER);INSERT INTO pool_payments VALUES(26,'nfl','Jake',4,1);`);
const originalFetch=globalThis.fetch;let locked=false;
globalThis.fetch=async()=>Response.json({events:[{id:'packers',date:locked?'2000-01-01':'2090-01-01',competitions:[{competitors:[{homeAway:'away',team:{abbreviation:'GB'}},{homeAway:'home',team:{abbreviation:'TB'}}]}]}]});
const submit=(token='test')=>onRequestPost({request:new Request('https://test/new-build/api/picks',{method:'POST',headers:{Authorization:'Bearer '+token},body:JSON.stringify({pool:26,player:'Jake',week:4,eventId:'packers',gameIndex:6,selection:'GB'})}),env:{DB:db}});
try{const response=await submit();assert.equal(response.status,200);const receipt=await response.json();assert.equal(receipt.eventId,'packers');assert.equal(receipt.selection,'GB');assert.equal(sql.prepare("SELECT team FROM pool_picks WHERE pool_id=26 AND player_name='Jake' AND game_index=6").get().team,'TEN');locked=true;assert.equal((await submit()).status,403);assert.equal((await submit('invalid')).status,403);locked=false;sql.exec('UPDATE pool_payments SET paid=0');assert.equal((await submit()).status,402);console.log('PASS real endpoint confirms event/team and preserves kickoff, sign-in, paid-week protections.');}finally{globalThis.fetch=originalFetch;sql.close()}
