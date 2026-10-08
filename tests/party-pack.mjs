import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {ensureAccounts,digest} from '../functions/lib/commissioner-account.js';
import {onRequest} from '../functions/new-build/api/party-pack.js';
import {requirePartyPass,PARTY_GAMES} from '../functions/lib/party-access.js';
import {hostAccess,validateHostPlan} from '../functions/lib/trivia-host-billing.js';
const {db}=fixture(),token=crypto.randomUUID()+crypto.randomUUID(),other=crypto.randomUUID()+crypto.randomUUID();
await ensureAccounts(db);for(const [t,email] of [[token,'host@example.com'],[other,'other@example.com']])await db.prepare('INSERT INTO links_account_sessions VALUES(?,?,?)').bind(await digest(t),email,'2099-01-01').run();
await db.prepare('INSERT INTO links_pool_owners VALUES(?,?)').bind(1,'host@example.com').run();
const env={DB:db,PARTY_PACK_ENABLED:'true',PAYPAL_CLIENT_ID:'mock',PAYPAL_CLIENT_SECRET:'mock',PAYPAL_ENV:'sandbox',TRIVIA_HOST_BILLING_ENABLED:'true',PAYPAL_TRIVIA_MONTHLY_PLAN_ID:'PLAN'};
const realFetch=globalThis.fetch;let order,sub,price='4.99',confirmed=true,calls=0;
const plan={status:'ACTIVE',billing_cycles:[{tenure_type:'REGULAR',frequency:{interval_unit:'MONTH',interval_count:1},total_cycles:0,pricing_scheme:{fixed_price:{currency_code:'USD',value:'29.99'}}}]};
globalThis.fetch=async(url,options={})=>{calls++;assert(String(url).startsWith('https://api-m.sandbox.paypal.com/'));if(String(url).endsWith('/token'))return Response.json({access_token:'mock'});
 if(String(url).endsWith('/plans/PLAN'))return Response.json(plan);
 if(String(url).endsWith('/subscriptions')&&options.method==='POST'){sub=JSON.parse(options.body);return Response.json({id:'SUB',status:'APPROVAL_PENDING',links:[{rel:'approve',href:'https://www.sandbox.paypal.com/approve'}]})}
 if(String(url).endsWith('/subscriptions/SUB'))return Response.json({id:'SUB',plan_id:'PLAN',custom_id:sub.custom_id,status:sub.status||'ACTIVE',billing_info:{last_payment:{amount:{currency_code:'USD',value:'29.99'},time:new Date(Date.now()-1000).toISOString()},next_billing_time:new Date(Date.now()+30*86400000).toISOString()}});
 if(String(url).endsWith('/orders')&&options.method==='POST'){order=JSON.parse(options.body);return Response.json({id:'ORDER-'+calls,links:[{rel:'approve',href:'https://www.sandbox.paypal.com/checkoutnow?token=test'}]})}
 const p=db.raw.prepare('SELECT * FROM links_party_purchases ORDER BY created_at DESC').get();return Response.json({id:p.order_id,status:'COMPLETED',purchase_units:[{reference_id:p.id,payments:{captures:[{status:confirmed?'COMPLETED':'PENDING',amount:{currency_code:'USD',value:price}}]}}]});
};
const request=(body,t=token,origin='https://test')=>new Request('https://test/new-build/api/party-pack',{method:body?'POST':'GET',headers:{Origin:origin,'x-links-account':t,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
async function call(body,t=token,customEnv=env){const r=await onRequest({request:request(body,t),env:customEnv});return {status:r.status,data:await r.json(),headers:r.headers};}
try{
 let r=await call(null);assert.equal(r.data.email,'host@example.com');assert(r.headers.get('Set-Cookie').includes('HttpOnly'));assert.equal(r.data.access,null);
 assert.equal((await call({action:'checkout',plan:'day'},'')).status,401);
 assert.equal((await onRequest({request:request({action:'checkout',plan:'day'},token,'https://evil'),env})).status,403);
 assert.equal((await call({action:'checkout',plan:'free'})).status,400);
 assert.equal((await call({action:'checkout',plan:'day'},token,{...env,PARTY_PACK_ENABLED:'false'})).status,503);
 assert.equal((await requirePartyPass(new Request('https://test'),env)).status,402);
 r=await call({action:'checkout',plan:'day',amount:1});assert.equal(r.status,200);assert.equal(order.purchase_units[0].amount.value,'4.99');
 const purchase=db.raw.prepare('SELECT id FROM links_party_purchases').get().id;
 assert.equal((await call({action:'capture',purchase},other)).status,404);
 price='0.01';assert.equal((await call({action:'capture',purchase})).status,409);price='4.99';confirmed=false;assert.equal((await call({action:'capture',purchase})).status,409);confirmed=true;
 assert.equal((await call({action:'capture',purchase})).status,200);
 const paid=db.raw.prepare('SELECT * FROM links_party_purchases WHERE id=?').get(purchase);assert.equal(Date.parse(paid.expires_at)-Date.parse(paid.paid_at),86400000);
 const count=calls;assert.equal((await call({action:'capture',purchase})).status,200);assert.equal(calls,count);assert.equal(db.raw.prepare('SELECT expires_at FROM links_party_purchases WHERE id=?').get(purchase).expires_at,paid.expires_at);
 assert.equal(await requirePartyPass(new Request('https://test',{headers:{Cookie:'links_party_session='+token}}),env),null);
 assert.equal((await call({action:'checkout',plan:'annual'})).status,409);
 db.raw.prepare("UPDATE links_party_purchases SET expires_at='2000-01-01'").run();assert.equal((await requirePartyPass(request(null),env)).status,402);
 assert.equal((await call({action:'checkout',plan:'annual'})).status,200);assert.equal(order.purchase_units[0].amount.value,'39.99');price='39.99';const annual=db.raw.prepare("SELECT id FROM links_party_purchases WHERE plan='annual'").get().id;assert.equal((await call({action:'capture',purchase:annual})).status,200);const a=db.raw.prepare('SELECT * FROM links_party_purchases WHERE id=?').get(annual);assert.equal(Date.parse(a.expires_at)-Date.parse(a.paid_at),365*86400000);
 assert(validateHostPlan(plan));assert(!validateHostPlan({...plan,billing_cycles:[...plan.billing_cycles,{tenure_type:'TRIAL'}]}));
 assert.equal(await hostAccess(env,'host@example.com',()=>{throw Error('No subscription should be fetched')}),null);
 assert.equal((await call({action:'venue-checkout'})).status,200);assert.equal(sub.plan_id,'PLAN');const subscription=sub.custom_id;assert.equal((await call({action:'venue-verify',subscription},other)).status,404);assert.equal((await call({action:'venue-verify',subscription})).status,200);
 assert((await call(null)).data.venueAccess);sub.status='SUSPENDED';assert.equal((await call(null)).data.venueAccess,null);
 assert.equal(db.raw.prepare('SELECT COUNT(*) AS n FROM links_account_purchases').get().n,0);assert.equal(db.raw.prepare('SELECT COUNT(*) AS n FROM links_account_plans').get().n,0);
 // All covered APIs block unauthenticated creation before requesting paid questions.
 for(const game of PARTY_GAMES){const {onRequest:handler}=await import('../functions/new-build/api/'+game+'.js');const r=await handler({request:new Request('https://test/new-build/api/'+game,{method:'POST',headers:{Origin:'https://test'},body:JSON.stringify({action:'create',name:'Tester',category:'mixed',difficulty:'mixed',mode:'duel',minutes:35})}),env});assert.equal(r.status,402,game);assert.equal((await r.json()).code,'PARTY_PASS_REQUIRED',game);}
 const {onRequest:rally}=await import('../functions/new-build/api/trivia-rally.js');
 const room=await rally({request:new Request('https://test/new-build/api/trivia-rally',{method:'POST',headers:{Origin:'https://test',Cookie:'links_party_session='+token},body:JSON.stringify({action:'create',name:'Host',category:'mixed',difficulty:'mixed'})}),env});assert.equal(room.status,200);const roomState=await room.json();
 const guest=await rally({request:new Request('https://test/new-build/api/trivia-rally',{method:'POST',headers:{Origin:'https://test'},body:JSON.stringify({action:'join',code:roomState.code,name:'Free guest'})}),env});assert.equal(guest.status,200);assert((await guest.json()).token);
 price='4.99';assert.equal((await call({action:'checkout',plan:'host_day'})).status,200);assert.equal(order.purchase_units[0].amount.value,'4.99');assert(order.application_context.return_url.includes('/trivia-host-pass.html?purchase='));const hd=db.raw.prepare("SELECT id FROM links_party_purchases WHERE plan='host_day'").get().id;assert.equal((await call({action:'capture',purchase:hd})).status,200);const hp=db.raw.prepare('SELECT * FROM links_party_purchases WHERE id=?').get(hd);assert.equal(Date.parse(hp.expires_at)-Date.parse(hp.paid_at),86400000);assert((await call(null)).data.venueAccess.dayPass);
 console.log('PASS pricing, identity, CSRF, payment verification, idempotency, expiry, cookie access, all 7 create gates, annual duration, subscription isolation/suspension and unchanged pool entitlements.');
}finally{globalThis.fetch=realFetch;db.raw.close()}
