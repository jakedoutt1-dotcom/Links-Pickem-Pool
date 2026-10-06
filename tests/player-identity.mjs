import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {identityRequest,identitySwitcher} from '../functions/lib/player-identity.js';
const {db}=fixture(),origin='https://links-pickem-test.pages.dev';let cookie='';
const digest=btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('salt:pool-pass')))));
db.raw.prepare('UPDATE pool_players SET password_hash=?').run(digest);
db.raw.exec("INSERT INTO pool_players VALUES(2,'Alice','"+digest+"','salt');INSERT INTO pool_sessions VALUES('alice2',2,'Alice','player','2099-01-01');INSERT INTO pool_picks VALUES(1,'nfl','Alice',1,0,'BUF');");
async function call(body,token='alice',options={}){const request=new Request((options.origin||origin)+'/new-build/api/player-account',{method:body?'POST':'GET',headers:{Origin:options.badOrigin?'https://other.invalid':origin,'Content-Type':'application/json',Authorization:'Bearer '+token,Cookie:options.cookie??cookie},...(body?{body:JSON.stringify(body)}:{})});const r=await identityRequest({request,env:{DB:db}}),j=await r.json();const set=r.headers.get('set-cookie');if(set&&!options.noCookie)cookie=set.split(';')[0];return {status:r.status,...j}}
try{
 assert.equal((await call(null)).status,401);
 assert.equal((await call(null,'alice',{origin:'https://linkspickempools.com'})).status,404);
 assert.equal((await call({action:'register'},'alice',{badOrigin:true})).status,403);
 const input={action:'register',username:'tester',email:'test@example.invalid',displayName:'Test Player',password:'strong-pass-123',connect:true,poolPassword:'pool-pass'};
 assert.equal((await call({...input,poolPassword:'wrong'})).status,403);
 const pending=await call(input);assert.equal(pending.status,200);assert.match(pending.testCode,/^\d{6}$/);
 assert.equal((await call({action:'confirm',challenge:pending.challenge,code:'bad'})).status,400);
 const created=await call({action:'confirm',challenge:pending.challenge,code:pending.testCode});assert.equal(created.status,200);const accountId=created.account.id;
 assert.equal((await call({action:'confirm',challenge:pending.challenge,code:pending.testCode})).status,400);
 let me=await call(null);assert.equal(me.pools.length,1);assert.equal(me.pools[0].id,'1');const memberId=me.pools[0].membershipId;
 assert.equal((await call({action:'open',pool:2})).status,403);
 const opened=await call({action:'open',pool:1});assert.equal(opened.pool.role,'player');assert.ok(db.raw.prepare('SELECT * FROM pool_sessions WHERE token=?').get(opened.token));
 assert.equal((await call({action:'connect',poolPassword:'pool-pass'},'alice2')).status,200);assert.equal((await call(null)).pools.length,2);
 const updated=await call({action:'profile',username:'changed-name',displayName:'Updated Player',currentPassword:'strong-pass-123'});assert.equal(updated.account.id,accountId);assert.equal(db.raw.prepare("SELECT count(*) n FROM pool_display_names WHERE player_name='Alice' AND display_name='Updated Player'").get().n,2);assert.equal((await call(null)).pools.length,2);assert.equal(db.raw.prepare('SELECT count(*) n FROM pool_picks').get().n,1);
 db.raw.exec("UPDATE pool_players SET name='Renamed' WHERE pool_id=1 AND name='Alice'");me=await call(null);assert.equal(me.pools.find(p=>p.id==='1').membershipId,memberId);assert.equal(me.pools.find(p=>p.id==='1').playerName,'Renamed');
 const other=await call({...input,username:'other-player',email:'other@example.invalid',connect:false});await call({action:'confirm',challenge:other.challenge,code:other.testCode});assert.equal((await call({action:'connect',poolPassword:'pool-pass'},'alice2')).status,409);
 await call({action:'logout'});assert.equal((await call(null)).status,401);
 assert.equal((await call({action:'login',login:'changed-name',password:'wrong'})).status,401);
 assert.equal((await call({action:'login',login:'test@example.invalid',password:'strong-pass-123'})).status,200);
 const bridge=await call({action:'open',pool:2});const beforeReset=cookie;
 const reset=await call({action:'recover',email:'test@example.invalid'});assert.equal((await call({action:'reset',challenge:reset.challenge,code:reset.testCode,password:'new-strong-pass-456'})).status,200);
 assert.equal((await call(null,'alice',{cookie:beforeReset})).status,401);assert.equal(db.raw.prepare('SELECT token FROM pool_sessions WHERE token=?').get(bridge.token),undefined);
 assert.equal((await call({action:'login',login:'changed-name',password:'new-strong-pass-456'})).status,200);
 db.raw.exec("UPDATE newbuild_player_access SET status='pending' WHERE pool_id=2; INSERT OR REPLACE INTO newbuild_player_access VALUES(2,'Alice','pending');");assert.equal((await call({action:'open',pool:2})).status,403);
 db.raw.exec("DELETE FROM pool_players WHERE pool_id=1 AND name='Renamed'");assert.equal((await call(null)).pools.length,0);
 console.log('PASS identity setup, code expiry/consumption, credentials, tenant separation, stable membership rename, profile, recovery, session revocation, removed access, live gate and CSRF');
}finally{db.raw.close()}
