import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/login-transition.js';
import {identityRequest} from '../functions/lib/player-identity.js';
const {db}=fixture(),origin='https://linkspickempools.com';let email='',cookie='';
const oldFetch=globalThis.fetch;globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');email=JSON.parse(options.body).text;return Response.json({id:'mock-email'})};
async function call(handler,body,token='',query=''){const r=await handler({request:new Request(origin+'/new-build/api/test'+query,{method:body?'POST':'GET',headers:{Origin:origin,Authorization:'Bearer '+token,Cookie:cookie},...(body?{body:JSON.stringify(body)}:{})}),env:{DB:db,RESEND_API_KEY:'mock'}});if(r.headers.has('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,...await r.json()}}
try{
 assert.equal((await call(onRequest)).phase,'off');assert.equal((await call(identityRequest)).status,404);
 assert.equal((await call(onRequest,{action:'start'})).status,401);
 db.raw.prepare('INSERT INTO links_admin_sessions VALUES(?,?)').run('owner','2099-01-01');
 let state=await call(onRequest,{action:'start'},'owner');assert.equal(state.total,3);assert.equal(state.completed,0);assert.equal(state.phase,'transition');
 assert.equal((await call(onRequest,{action:'complete'},'owner')).status,409);
 const hash=btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('salt:pool-pass')))));db.raw.prepare('UPDATE pool_players SET password_hash=?').run(hash);
 db.raw.exec("INSERT INTO pool_picks VALUES(1,'nfl','Alice',4,5,'GB')");
 const pending=await call(identityRequest,{action:'register',username:'CowboyJake',email:'test@example.invalid',displayName:'Jake',password:'long-password-123',connect:true,poolPassword:'pool-pass'},'alice');assert.equal(pending.status,200);assert.equal(pending.testCode,undefined);const code=email.match(/\b\d{6}\b/)[0];
 const confirmed=await call(identityRequest,{action:'confirm',challenge:pending.challenge,code});assert.equal(confirmed.status,200);assert.equal(confirmed.account.username,'cowboyjake');
 assert.equal((await call(identityRequest,{action:'register',username:'COWBOYJAKE',email:'other@example.invalid',displayName:'Other',password:'long-password-123'})).status,409);
 assert.equal((await call(identityRequest,{action:'membership-status'},'alice')).connected,true);
 state=await call(onRequest,null,'owner','?admin=1');assert.equal(state.completed,1);
 assert.equal((await call(identityRequest,{action:'connect',poolPassword:'pool-pass'},'bob')).status,409,'Cannot claim two players in the same pool');
 assert.equal(db.raw.prepare('SELECT team FROM pool_picks WHERE player_name=?').get('Alice').team,'GB');
 const recovery=await call(identityRequest,{action:'recover',email:'missing@example.invalid'});assert.ok(recovery.challenge);assert.equal(recovery.testCode,undefined);
 for(const name of ['Bob','Owner'])db.raw.prepare('INSERT INTO links_id_accounts VALUES(?,?,?,?,?,?,?)').run(name,name,name+'@example.invalid',name,'salt','hash','now');
 for(const name of ['Bob','Owner'])db.raw.prepare('INSERT INTO links_id_members VALUES(?,?,?,?,?)').run(name,1,name,name,'player');
 state=await call(onRequest,{action:'complete'},'owner');assert.equal(state.phase,'new');assert.equal(state.completed,3);
 assert.equal((await call(onRequest)).phase,'new');
 console.log('PASS rollout off by default, owner-only start, incomplete cutover blocked, real email without exposed codes, case-insensitive username uniqueness, membership proof, saved picks, manual completion');
}finally{globalThis.fetch=oldFetch;db.raw.close()}
