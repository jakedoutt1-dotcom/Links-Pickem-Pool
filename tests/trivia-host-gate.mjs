import assert from 'node:assert/strict';import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/trivia-night.js';import {onRequest as rally} from '../functions/new-build/api/trivia-rally.js';
import {ensureAccounts} from '../functions/lib/commissioner-account.js';import {ensureParty,partyAccess} from '../functions/lib/party-access.js';import {grantTestHost} from './helpers/trivia-host-access.mjs';
const {db}=fixture(),env={DB:db},origin='https://test';let code='',state;
async function call(body,admin='admin',guest=''){const r=await onRequest({env,request:new Request(origin+'/new-build/api/trivia-night?code='+code,{method:body?'POST':'GET',headers:{Origin:origin,Authorization:'Bearer '+admin,'x-trivia-token':guest},...(body?{body:JSON.stringify({code,gameNumber:state?.game,index:state?.index,phase:state?.phase,...body})}:{})})});return {status:r.status,...await r.json()}}
const create={action:'create',categories:['football'],difficulty:'easy'};
try{
 await ensureAccounts(db);await ensureParty(db);db.raw.prepare("INSERT INTO pool_settings VALUES(1,'commissioner_email','host@example.com')").run();
 assert.equal((await call(create)).status,402,'No rollout flag may bypass hosted access');env.TRIVIA_HOST_BILLING_ENABLED='false';assert.equal((await call(create)).status,402,'Checkout disabled must not make hosting free');
 db.raw.exec("INSERT INTO links_account_plans VALUES('host@example.com','all_access','2099-01-01','pool-paid')");assert.equal((await call(create)).status,402,'Pool packages are separate');
 db.raw.exec("INSERT INTO links_party_purchases(id,email,plan,amount_cents,order_id,status,created_at,expires_at) VALUES('party','host@example.com','annual',3999,'party-order','PAID','2026-01-01','2099-01-01')");assert.equal((await call(create)).status,402,'Party Pack does not unlock hosted trivia');
 db.raw.exec("INSERT INTO links_party_purchases(id,email,plan,amount_cents,order_id,status,created_at,expires_at) VALUES('host','host@example.com','host_day',499,'host-order','CREATED','2026-01-01','2099-01-01')");assert.equal((await call(create)).status,402,'Unconfirmed day payment must not grant hosting');
 db.raw.exec("UPDATE links_party_purchases SET status='PAID' WHERE id='host'");state=await call(create);assert.equal(state.status,200);code=state.code;
 const joined=await call({action:'join',name:'Free guest'},'');assert.equal(joined.status,200);assert(joined.token);
 state=await call({action:'next',category:'football'});assert.equal(state.status,200);
 db.raw.exec("UPDATE links_party_purchases SET expires_at='2000-01-01' WHERE id='host'");assert.equal((await call({action:'start-question'})).status,402,'Expired day pass cannot start questions');
 await grantTestHost(db);state=await call({action:'start-question'});assert.equal(state.status,200,'Admin host grant restores access');
 db.raw.exec("UPDATE links_party_grants SET revoked_at='2026-01-01'");const raw=JSON.parse(db.raw.prepare('SELECT state FROM links_trivia_night_rooms WHERE code=?').get(code).state);raw.deadline=Date.now()-1;db.raw.prepare('UPDATE links_trivia_night_rooms SET state=? WHERE code=?').run(JSON.stringify(raw),code);
 state=await call({action:'reveal'});assert.equal(state.status,200,'Allow final answer reveal after expiry');state=await call({action:'end'});assert.equal(state.status,200);assert.equal((await call({action:'restart',categories:['football'],difficulty:'easy'})).status,402,'Existing room cannot bypass payment with restart');
 db.raw.exec("UPDATE links_party_purchases SET expires_at='2000-01-01' WHERE id='party'; UPDATE links_party_purchases SET expires_at='2099-01-01' WHERE id='host'");assert.equal(await partyAccess(db,'host@example.com'),null,'Hosted day pass never grants Party Pack');
 const free=await rally({env,request:new Request(origin+'/new-build/api/trivia-rally',{method:'POST',headers:{Origin:origin},body:JSON.stringify({action:'create',name:'Tester',category:'mixed',difficulty:'easy'})})});assert.equal(free.status,200,'Party Room group testing stays free');
 console.log('PASS hosted gate: direct creation, disabled checkout, pool/party separation, pending/day/expired/granted/revoked access, restart protection, free guests and unchanged party testing.');
}finally{db.raw.close()}
