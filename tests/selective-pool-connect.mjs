import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {identityRequest} from '../functions/lib/player-identity.js';
const {db}=fixture(),origin='https://links-pickem-test.pages.dev';let cookie='';
async function call(body,token='alice',bad=false){const r=await identityRequest({env:{DB:db},request:new Request(origin+'/new-build/api/player-account',{method:'POST',headers:{Origin:bad?'https://evil':origin,Cookie:cookie,Authorization:'Bearer '+token},body:JSON.stringify(body)})});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,...await r.json()}}
const input={action:'register',username:'tester',email:'test@example.invalid',displayName:'Test',password:'strong-pass-123'};
const pending=await call(input);await call({action:'confirm',challenge:pending.challenge,code:pending.testCode});
await call({action:'connection-choices'});
db.raw.exec("INSERT INTO links_player_memberships VALUES(1,'Alice','test@example.invalid');INSERT INTO pool_players VALUES(2,'Host','hash','salt');INSERT INTO links_pool_owners VALUES(2,'test@example.invalid');INSERT INTO pool_settings VALUES(2,'commissioner_player_name','Host');INSERT INTO links_account_plans VALUES('test@example.invalid','all_access','2099-01-01','grant');");
let choices=await call({action:'connection-choices'});assert.equal(choices.pools.length,2);assert.equal(choices.pools.find(p=>p.id==='2').role,'admin');assert(choices.pools.every(p=>!p.connected));
assert.equal((await call({action:'connect-selected',pools:['999']})).status,403);assert.equal((await call({action:'connect-selected',pools:['1']},'alice',true)).status,403);
assert.equal((await call({action:'connect-selected',pools:['2']})).status,200);choices=await call({action:'connection-choices'});assert.equal(choices.pools.find(p=>p.id==='1').connected,false);assert.equal(choices.pools.find(p=>p.id==='2').connected,true);
const opened=await call({action:'open',pool:'2'});assert.equal(opened.pool.role,'commissioner');assert.equal((await call({action:'open',pool:'1'})).status,403);
await call({action:'connect-selected',pools:[]});assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM links_id_members').get().n,1);assert.equal(db.raw.prepare('SELECT plan FROM links_account_plans').get().plan,'all_access');
await call({action:'connect-selected',pools:['1','2']});assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM links_id_members').get().n,2);
const duplicate=await call(input);assert.equal(duplicate.status,409);assert.match(duplicate.error,/choose which pools/);
console.log('PASS selective pool linking, retained admin role, unchecked pools excluded, idempotence, CSRF, forged IDs and unchanged package.');db.raw.close();
