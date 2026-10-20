import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({load(url,context,next){const r=next(url,context);return url.endsWith('/functions/lib/testing-access.js')?{...r,source:String(r.source).replace('FREE_GAME_TESTING=true','FREE_GAME_TESTING=false')}:r}});
const {fixture}=await import('./helpers/pool-format-fixture.mjs');
const {ensureAccounts,digest,PLANS}=await import('../functions/lib/commissioner-account.js');
const {requirePartyPass,partyAccess,PARTY_PLANS}=await import('../functions/lib/party-access.js');
const {pokerCreateAccess}=await import('../functions/lib/poker-access.js');
const {onRequest}=await import('../functions/new-build/api/party-pack.js');
const {db}=fixture(),token=crypto.randomUUID()+crypto.randomUUID();
await ensureAccounts(db);await db.prepare('INSERT INTO links_account_sessions VALUES(?,?,?)').bind(await digest(token),'buyer@example.com','2099-01-01').run();
const env={DB:db,PARTY_PACK_ENABLED:'true',TRIVIA_HOST_BILLING_ENABLED:'true',PAYPAL_CLIENT_ID:'mock',PAYPAL_CLIENT_SECRET:'mock',PAYPAL_ENV:'sandbox'};
const request=(body,signed=true)=>new Request('https://pricing.test/new-build/api/party-pack',{method:body?'POST':'GET',headers:{Origin:'https://pricing.test','Content-Type':'application/json',...(signed?{'x-links-account':token}:{})},...(body?{body:JSON.stringify(body)}:{})});
async function call(body,signed=true){const r=await onRequest({request:request(body,signed),env});return {status:r.status,data:await r.json()}}
const original=globalThis.fetch;let orderBody,price='0.99';
globalThis.fetch=async(url,options={})=>{
 assert.ok(String(url).startsWith('https://api-m.sandbox.paypal.com/'));
 if(String(url).endsWith('/token'))return Response.json({access_token:'mock'});
 if(options.method==='POST'&&String(url).endsWith('/orders')){orderBody=JSON.parse(options.body);return Response.json({id:'ORDER',links:[{rel:'approve',href:'https://www.sandbox.paypal.com/checkout'}]})}
 const p=db.raw.prepare('SELECT * FROM links_party_purchases WHERE order_id=?').get('ORDER');
 return Response.json({id:p.order_id,status:'COMPLETED',purchase_units:[{reference_id:p.id,payments:{captures:[{status:'COMPLETED',amount:{currency_code:'USD',value:price}}]}}]});
};
try{
 assert.equal(PARTY_PLANS.day.amount,99);assert.equal(PARTY_PLANS.host_day.amount,499);
 assert.deepEqual(Object.values(PLANS).map(p=>p.slots),[1,3,6,10]);
 assert.equal((await call({action:'checkout',plan:'day'},false)).status,401);
 assert.equal((await call({action:'checkout',plan:'day'})).status,200);
 assert.equal(orderBody.purchase_units[0].amount.value,'0.99');assert.match(orderBody.application_context.return_url,/party-pack.html/);
 const purchase=db.raw.prepare('SELECT id FROM links_party_purchases').get().id;
 price='.01';assert.equal((await call({action:'capture',purchase})).status,409);price='0.99';
 assert.equal((await call({action:'capture',purchase})).status,200);
 assert.equal(db.raw.prepare('SELECT expires_at FROM links_party_purchases').get().expires_at,null,'Payment does not start the Game Pass clock');
 assert.equal(await partyAccess(db,'buyer@example.com'),null);
 assert.equal((await call({action:'checkout',plan:'day'})).status,409,'Do not sell another day pass while one is ready');
 assert.equal((await call({action:'activate',purchase:'not-owned'})).status,409);
 assert.equal((await call({action:'activate',purchase},false)).status,401);
 const before=Date.now(),activated=await call({action:'activate',purchase});assert.equal(activated.status,200);
 assert.ok(Math.abs(Date.parse(activated.data.expires_at)-before-86400000)<1000);
 assert.equal((await call({action:'activate',purchase})).status,409,'Activation cannot restart the clock');
 assert.equal(await requirePartyPass(request(null),env),null);
 assert.equal(await pokerCreateAccess(request(null,false),env,'practice'),null);
 assert.equal(await pokerCreateAccess(request(null),env,'friends'),null);
 assert.equal((await pokerCreateAccess(request(null),env,'tournament')).status,402,'Regular Game Pass does not grant hosted tournaments');
 const stamp=new Date().toISOString(),until=new Date(Date.now()+86400000).toISOString();
 await db.prepare("INSERT INTO links_party_purchases(id,email,plan,amount_cents,order_id,status,created_at,paid_at,expires_at) VALUES('host','buyer@example.com','host_day',499,'HOST','PAID',?,?,?)").bind(stamp,stamp,until).run();
 assert.equal(await pokerCreateAccess(request(null),env,'tournament'),null,'Hosted event access covers poker');
 db.raw.prepare("UPDATE links_party_purchases SET expires_at='2000-01-01' WHERE id='host'").run();
 assert.equal((await pokerCreateAccess(request(null),env,'tournament')).status,402,'Expired hosted access cannot create another tournament');
 console.log('PASS pricing: free/Bronze/Silver/Gold capacities, exact charge, payment verification, delayed one-time activation, private ownership, practice, separate hosted poker and expiration.');
}finally{globalThis.fetch=original;db.raw.close()}
