import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {ensureOwner} from '../functions/lib/owner-auth.js';
import {ensureAccounts,digest} from '../functions/lib/commissioner-account.js';
import {onRequest} from '../functions/new-build/api/party-grants.js';
import {partyAccess,requirePartyPass} from '../functions/lib/party-access.js';
import {hostAccess} from '../functions/lib/trivia-host-billing.js';
const {db}=fixture(),env={DB:db,PARTY_PACK_ENABLED:'true'},email='jane@example.com',token=crypto.randomUUID()+crypto.randomUUID();await ensureOwner(db);await ensureAccounts(db);await db.prepare('INSERT INTO links_admin_sessions VALUES(?,?)').bind('owner','2099-01-01').run();await db.prepare('INSERT INTO links_account_sessions VALUES(?,?,?)').bind(await digest(token),email,'2099-01-01').run();
async function call(body,owner='owner',origin='https://test'){const r=await onRequest({env,request:new Request('https://test/new-build/api/party-grants',{method:body?'POST':'GET',headers:{Origin:origin,Authorization:'Bearer '+owner},...(body?{body:JSON.stringify(body)}:{})})});return {status:r.status,...await r.json()}}
const grant=(product,days)=>({action:'grant',id:crypto.randomUUID(),email:'Jane@Example.com',product,days,note:'Partner trial',confirm:true});
try{
 assert.equal((await call(null,'admin')).status,401);assert.equal((await call(grant('party_day',1),'owner','https://evil')).status,403);
 assert.equal((await call({...grant('party_day',1),confirm:false})).status,400);assert.equal((await call(grant('party_day',0))).status,400);assert.equal((await call(grant('party_day',366))).status,400);
 const b=grant('party_day',1),first=await call(b);assert.equal(first.status,200);assert.equal(first.grant.email,email);assert.equal(Date.parse(first.grant.expires_at)-Date.parse(first.grant.created_at),86400000);
 assert.equal((await call(b)).grant.expires_at,first.grant.expires_at);assert.equal((await call({...b,days:2})).status,409);
 assert((await partyAccess(db,email)).complimentary);assert.equal(await hostAccess(env,email,()=>{throw Error('Must not call PayPal')}),null);
 assert.equal(await requirePartyPass(new Request('https://test',{headers:{Cookie:'links_party_session='+token}}),env),null);
 const h=await call(grant('trivia_host',30));assert((await hostAccess(env,email,()=>{throw Error('Complimentary access must not call PayPal')})).active);
 assert.equal((await call({action:'revoke',id:b.id,confirm:true})).status,200);assert.equal(await partyAccess(db,email),null);assert.equal((await requirePartyPass(new Request('https://test',{headers:{Cookie:'links_party_session='+token}}),env)).status,402);
 assert((await hostAccess(env,email,()=>{throw Error('No PayPal calls')})).active);
 db.raw.prepare("UPDATE links_party_grants SET expires_at='2000-01-01' WHERE id=?").run(h.grant.id);assert.equal(await hostAccess(env,email,()=>{throw Error('No PayPal calls')}),null);
 const history=await call(null);assert.equal(history.grants.length,2);assert(!('actor' in history.grants[0]));assert.equal(db.raw.prepare('SELECT COUNT(*) AS n FROM links_account_purchases').get().n,0);
 console.log('PASS owner-only grants, CSRF, confirmation, normalized email, 1–365 day bounds, replay safety, independent host/party access, revocation, expiry and history.');
}finally{db.raw.close()}
