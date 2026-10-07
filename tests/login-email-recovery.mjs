import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {identityRequest} from '../functions/lib/player-identity.js';
const {db}=fixture(),origin='https://links-pickem-test.pages.dev';
const digest=btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('salt:pool-pass')))));
db.raw.prepare('UPDATE pool_players SET password_hash=?').run(digest);
async function call(body){const r=await identityRequest({request:new Request(origin+'/new-build/api/player-account',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Authorization:'Bearer alice'},body:JSON.stringify(body)}),env:{DB:db}});return {status:r.status,...await r.json()}}
const input={action:'register',username:'pending-player',email:'pending@example.invalid',displayName:'Pending Player',password:'original-password',connect:true,poolPassword:'pool-pass'};
try{
 const initial=await call(input);assert.equal(initial.status,200);
 assert.equal((await call({action:'resend',challenge:initial.challenge})).status,429);
 db.raw.prepare('UPDATE links_id_challenges SET expires_at=? WHERE id=?').run(Date.now()-1000,initial.challenge);
 const resent=await call({action:'resend',challenge:initial.challenge});assert.equal(resent.status,200);
 assert.equal((await call({action:'confirm',challenge:initial.challenge,code:initial.testCode})).status,400);
 const recovery=await call({action:'recover',email:' PENDING@example.invalid '});assert.equal(recovery.status,200);assert.ok(recovery.testCode);
 assert.equal((await call({action:'reset',challenge:recovery.challenge,code:'wrong',password:'replacement-password'})).status,400);
 assert.equal(db.raw.prepare('SELECT count(*) n FROM links_id_accounts').get().n,0);
 assert.equal((await call({action:'reset',challenge:recovery.challenge,code:recovery.testCode,password:'replacement-password'})).status,200);
 assert.equal(db.raw.prepare('SELECT count(*) n FROM links_id_members').get().n,1);
 assert.equal((await call({action:'confirm',challenge:resent.challenge,code:resent.testCode})).status,400);
 assert.equal((await call({action:'login',login:input.username,password:input.password})).status,401);
 assert.equal((await call({action:'login',login:input.email,password:'replacement-password'})).status,200);
 const missing=await call({action:'recover',email:'missing@example.invalid'});assert.equal(missing.status,200);assert.ok(missing.challenge);assert.equal(missing.testCode,undefined);
 const changed=await call({...input,username:'changed-proof',email:'changed@example.invalid',connect:false});
 const p=JSON.parse(db.raw.prepare('SELECT payload FROM links_id_challenges WHERE id=?').get(changed.challenge).payload);p.member={poolId:2,playerName:'Alice',credential:'obsolete',role:'player'};
 db.raw.prepare('UPDATE links_id_challenges SET payload=? WHERE id=?').run(JSON.stringify(p),changed.challenge);
 const denied=await call({action:'recover',email:'changed@example.invalid'});
 assert.equal((await call({action:'reset',challenge:denied.challenge,code:denied.testCode,password:'replacement-password'})).status,400);
 assert.equal(db.raw.prepare('SELECT count(*) n FROM links_id_accounts').get().n,1);
 console.log('PASS pending setup recovery, resend cooldown, expired-code replacement, single-use codes, password replacement, membership preservation, stale membership rejection and unknown-email privacy');
}finally{db.raw.close()}
