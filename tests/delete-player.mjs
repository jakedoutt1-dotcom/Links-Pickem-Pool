import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/delete-player.js';
const {db}=fixture();
const call=(b,token='admin')=>onRequest({env:{DB:db},request:new Request('https://test/new-build/api/delete-player',{method:'POST',headers:{Authorization:'Bearer '+token},body:JSON.stringify({pool:1,player:'Alice',confirmName:'Alice',acknowledge:true,...b})})});
try{
 db.raw.exec("CREATE TABLE IF NOT EXISTS links_player_memberships(pool_id INTEGER,player_name TEXT,email TEXT);INSERT INTO links_player_memberships VALUES(1,'Alice','alice@example.com'),(2,'Alice','other@example.com');CREATE TABLE IF NOT EXISTS pool_login_names(pool_id INTEGER,player_name TEXT,login_name TEXT);INSERT INTO pool_login_names VALUES(1,'Alice','New Login');INSERT INTO pool_players(pool_id,name,password_hash,salt) VALUES(2,'Alice','hash','salt')");
 assert.equal((await call({},'alice')).status,403);
 assert.equal((await call({pool:2})).status,403);
 assert.equal((await call({confirmName:'wrong'})).status,400);
 const admin=db.raw.prepare("SELECT player_name FROM pool_sessions WHERE token='admin'").get().player_name;
 assert.equal((await call({player:admin,confirmName:admin})).status,409);
 const batch=db.batch.bind(db);db.batch=async()=>{throw Error('simulated failure')};assert.equal((await call({})).status,503);assert.ok(db.raw.prepare("SELECT name FROM pool_players WHERE pool_id=1 AND name='Alice'").get());db.batch=batch;
 assert.equal((await call({})).status,200);
 for(const table of ['pool_sessions','pool_login_names','links_player_memberships'])assert.equal(db.raw.prepare(`SELECT COUNT(*) n FROM ${table} WHERE pool_id=1 AND player_name='Alice'`).get().n,0);
 assert.ok(db.raw.prepare("SELECT name FROM pool_players WHERE pool_id=2 AND name='Alice'").get());assert.equal((await call({})).status,404);
 console.log('PASS player deletion authorization, commissioner protection, confirmation, failure handling, alias/session/link cleanup and other-pool isolation');
}finally{db.raw.close()}
