import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {ensureAccounts,digest} from '../functions/lib/commissioner-account.js';
import {ensureParty} from '../functions/lib/party-access.js';
import {hostAccess} from '../functions/lib/trivia-host-billing.js';
import {pokerCreateAccess} from '../functions/lib/poker-access.js';
import {onRequest as party} from '../functions/new-build/api/party-pack.js';
import {onRequest as trivia} from '../functions/new-build/api/trivia-night.js';
import {onRequestGet as testing} from '../functions/new-build/api/testing-access.js';
const {db}=fixture(),email='promo@example.com',token=crypto.randomUUID()+crypto.randomUUID(),origin='https://test';
const env={DB:db,PARTY_PACK_ENABLED:'true',TRIVIA_HOST_BILLING_ENABLED:'true',PAYPAL_CLIENT_ID:'mock',PAYPAL_CLIENT_SECRET:'mock',PAYPAL_TRIVIA_MONTHLY_PLAN_ID:'PLAN',PAYPAL_ENV:'sandbox'};
const req=(path,body,signed=true,site=origin)=>new Request(origin+'/new-build/api/'+path,{method:body?'POST':'GET',headers:{Origin:site,...(signed?{'x-links-account':token}:{})},...(body?{body:JSON.stringify(body)}:{})});
async function call(handler,path,body,signed=true){const r=await handler({env,request:req(path,body,signed)});return {status:r.status,...await r.json()}}
const realFetch=globalThis.fetch;let calls=0,capturePrice='0.99';globalThis.fetch=async(url)=>{calls++;assert(String(url).startsWith('https://api-m.sandbox.paypal.com/'));if(String(url).endsWith('/token'))return Response.json({access_token:'test'});return Response.json({id:'OLDORDER',status:'COMPLETED',purchase_units:[{reference_id:'old-purchase',payments:{captures:[{status:'COMPLETED',amount:{currency_code:'USD',value:capturePrice}}]}}]})};
try{
 await ensureAccounts(db);await ensureParty(db);await db.prepare('INSERT INTO links_account_sessions VALUES(?,?,?)').bind(await digest(token),email,'2099-01-01').run();
 const flags=await testing().json();assert.equal(flags.freeGameTesting,true);assert.equal(flags.hostFreeTesting,true);
 const access=await hostAccess(env,email,()=>{throw Error('Free hosting must not call PayPal')});assert.equal(access.active,true);assert.equal(access.promotional,true);assert.equal(access.paid_until,null);assert.equal(await hostAccess(env,'',()=>{}),null);
 let state=await call(party,'party-pack');assert.equal(state.hostFreeTesting,true);assert.equal(state.checkoutReady,false);assert.equal(state.venueReady,false);assert.equal(state.venueDayReady,false);assert.equal(state.venueAccess.promotional,true);assert.equal(calls,0);
 for(const body of [{action:'checkout',plan:'day'},{action:'checkout',plan:'annual'},{action:'checkout',plan:'host_day'},{action:'venue-checkout'}])assert.equal((await call(party,'party-pack',body)).status,409);assert.equal(calls,0);assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM links_party_purchases').get().n,0);
 assert.equal((await call(party,'party-pack',{action:'checkout',plan:'host_day'},false)).status,401);assert.equal((await party({env,request:req('party-pack',{action:'venue-checkout'},true,'https://evil')})).status,403);
 assert.equal(await pokerCreateAccess(req('poker-night'),env,'tournament',()=>{throw Error('No billing')}),null);assert.equal((await pokerCreateAccess(req('poker-night',null,false),env,'tournament')).status,401);assert.equal(await pokerCreateAccess(req('poker-night',null,false),{...env,TRIVIA_HOST_BILLING_ENABLED:'false'},'tournament'),null,'Existing free rollout keeps its original guest host behavior');
 assert.equal((await call(trivia,'trivia-night?action=library',null,false)).status,403);state=await call(trivia,'trivia-night?action=library');assert.equal(state.status,200);assert.equal(state.hostFreeTesting,true);assert.equal(state.roomLimit,1);
 const room=await call(trivia,'trivia-night',{action:'create',categories:['football'],difficulty:'easy'});assert.equal(room.status,200);assert.equal(room.host,true);assert.equal((await call(trivia,'trivia-night',{action:'create',categories:['football'],difficulty:'easy'})).status,402,'Free does not remove active room limits');assert.equal(calls,0);
 // Previously approved orders can still be verified; amounts and ownership stay enforced.
 await db.prepare("INSERT INTO links_party_purchases(id,email,plan,amount_cents,order_id,status,created_at) VALUES('old-purchase',?,'day',99,'OLDORDER','CREATED','2026-01-01')").bind(email).run();capturePrice='0.01';assert.equal((await call(party,'party-pack',{action:'capture',purchase:'old-purchase'})).status,409);capturePrice='0.99';assert.equal((await call(party,'party-pack',{action:'capture',purchase:'old-purchase'})).status,200);const paid=db.raw.prepare('SELECT * FROM links_party_purchases WHERE id=?').get('old-purchase');assert.equal(paid.status,'PAID');assert.equal(paid.expires_at,null);const capturedCalls=calls;assert.equal((await call(party,'party-pack',{action:'capture',purchase:'old-purchase'})).status,200);assert.equal(calls,capturedCalls);assert.equal((await call(party,'party-pack',{action:'venue-verify',subscription:'not-owned'})).status,404);
 console.log('PASS all-games promotion: free regular/hosted flags, no new orders/subscriptions or PayPal access checks, verified host identity, CSRF, existing room limits, poker rollout compatibility, and unchanged capture amount/ownership/idempotency safety.');
}finally{globalThis.fetch=realFetch;db.raw.close()}
