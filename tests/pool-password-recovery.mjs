import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequestPost} from '../functions/new-build/api/pool-password-recovery.js';
const {db}=fixture(),origin='https://links-pickem-test.pages.dev';
async function call(body,otherOrigin=false){const r=await onRequestPost({request:new Request(origin+'/new-build/api/pool-password-recovery',{method:'POST',headers:{Origin:otherOrigin?'https://other.invalid':origin,'Content-Type':'application/json'},body:JSON.stringify(body)}),env:{DB:db}});return {status:r.status,...await r.json()}}
try{
 await call({action:'request',pool:1,player:'Alice',email:'alice@example.invalid'});
 db.raw.exec("INSERT OR REPLACE INTO pool_player_contacts(pool_id,player_name,email,phone) VALUES(1,'Alice','alice@example.invalid','');INSERT INTO pool_picks VALUES(1,'nfl','Alice',1,0,'BUF');");
 const request={action:'request',pool:1,player:'Alice',email:'alice@example.invalid'};
 assert.equal((await call(request,true)).status,403);
 const wrong=await call({...request,email:'wrong@example.invalid'});assert.ok(wrong.challenge);assert.equal(wrong.testCode,undefined);
 const pending=await call(request);assert.match(pending.testCode,/^\d{6}$/);
 assert.equal((await call({action:'reset',challenge:pending.challenge,code:'wrong',password:'new-pool-password'})).status,400);
 assert.equal((await call({action:'reset',challenge:pending.challenge,code:pending.testCode,password:'new-pool-password'})).status,200);
 const player=db.raw.prepare("SELECT * FROM pool_players WHERE pool_id=1 AND name='Alice'").get();
 const digest=btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(player.salt+':new-pool-password')))));
 assert.equal(player.password_hash,digest);assert.equal(db.raw.prepare("SELECT count(*) n FROM pool_sessions WHERE player_name='Alice'").get().n,0);assert.equal(db.raw.prepare('SELECT count(*) n FROM pool_picks').get().n,1);
 assert.equal((await call({action:'reset',challenge:pending.challenge,code:pending.testCode,password:'another-password'})).status,400);
 const stale=await call(request);db.raw.exec("UPDATE pool_players SET password_hash='commissioner-change' WHERE name='Alice'");assert.equal((await call({action:'reset',challenge:stale.challenge,code:stale.testCode,password:'another-password'})).status,409);
 const linked=await call(request);db.raw.exec("INSERT INTO links_id_members VALUES('member',1,'Alice','account','player')");assert.equal((await call({action:'reset',challenge:linked.challenge,code:linked.testCode,password:'another-password'})).status,409);assert.equal((await call(request)).useNewLogin,true);
 assert.equal((await call({...request,pool:2})).testCode,undefined);
 console.log('PASS old pool recovery, saved-email matching, code proof, session revocation, picks preservation, one-use codes, stale credential protection, linked-account protection, tenant scope and CSRF');
}finally{db.raw.close()}
