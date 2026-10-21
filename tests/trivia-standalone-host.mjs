import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
// Paid-policy regression; free hosted promotion is tested separately.
registerHooks({load(url,context,next){const r=next(url,context);return url.endsWith('/functions/lib/testing-access.js')?{...r,source:String(r.source).replace('FREE_HOST_GAME_TESTING=true','FREE_HOST_GAME_TESTING=false')}:r}});
const {fixture}=await import('./helpers/pool-format-fixture.mjs');
const {onRequest}=await import('../functions/new-build/api/trivia-night.js');
const {ensureAccounts,digest}=await import('../functions/lib/commissioner-account.js');
const {grantTestHost}=await import('./helpers/trivia-host-access.mjs');
const {db}=fixture();await ensureAccounts(db);await grantTestHost(db);
for(const [token,email]of [['standalone','newhost@example.com'],['other','other@example.com']])await db.prepare('INSERT INTO links_account_sessions(token_hash,email,expires_at) VALUES(?,?,?)').bind(await digest(token),email,'2099-01-01').run();
const call=async(token,body,code='')=>{const r=await onRequest({env:{DB:db},request:new Request('https://test/new-build/api/trivia-night?'+(code?'code='+code:'action=library'),{method:body?'POST':'GET',headers:{Origin:'https://test','x-links-account':token},...(body?{body:JSON.stringify(body)}:{})})});return {status:r.status,...await r.json()}};
try{
assert.equal((await call('standalone')).status,402);assert.equal((await call('invalid')).status,403);
await db.prepare("INSERT INTO links_party_grants(id,email,product,days,created_at,expires_at,note,actor) VALUES('new','newhost@example.com','trivia_host',365,'2026-01-01','2099-01-01','Test','test')").run();
const poolsBefore=db.raw.prepare('SELECT COUNT(*) n FROM pools').get().n;
assert.equal((await call('standalone')).status,200);
const room=await call('standalone',{action:'create',categories:['football'],difficulty:'easy'});assert.equal(room.status,200);assert.equal(room.host,true);
assert.equal((await call('standalone',null,room.code)).host,true);assert.notEqual((await call('other',null,room.code)).host,true);
assert.equal((await call('standalone',{action:'create',categories:['football'],difficulty:'easy'})).status,402);
assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM pools').get().n,poolsBefore,'No sports pool created');
console.log('PASS pool-free verified host, entitlement checks, room ownership isolation, reopen, room limits, no sports pool creation');
}finally{db.raw.close()}
