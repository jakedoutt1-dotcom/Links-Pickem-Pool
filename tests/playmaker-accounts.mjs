import assert from 'node:assert/strict';
import {fixture} from './helpers/playmaker-fixture.mjs';
import {playmakerPublic,grantPlaymakerCredits} from '../functions/new-build/api/playmaker-public.js';
import {onRequestPost as oldAI} from '../functions/new-build/api/playmaker-ai.js';
import {ensureIdentity} from '../functions/lib/player-identity.js';
import {ensureAccounts,digest} from '../functions/lib/commissioner-account.js';
const {db}=fixture(),origin='https://links.test',env={DB:db,OPENAI_API_KEY:'fixture-key'};let now=Date.now(),calls=0;
const services={now:()=>now,fetch:async()=>{calls++;return Response.json({status:'completed',output_text:'Fixture explanation. Risk note: uncertain.'})}};
async function token(email){const value=crypto.randomUUID();await db.prepare('INSERT INTO links_account_sessions(token_hash,email,expires_at) VALUES(?,?,?)').bind(await digest(value),email,'2099-01-01').run();return value}
async function call(auth,body=null,ip='192.0.2.1'){const request=new Request(origin+'/new-build/api/playmaker-public?action='+(body?'ai':'config'),{method:body?'POST':'GET',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':ip,...(auth?{'x-links-account':auth}:{})},...(body?{body:JSON.stringify({sport:'NFL',question:'Explain -110 odds.',card:[],requestId:crypto.randomUUID(),...body})}:{})});const response=await playmakerPublic({request,env},services);return {status:response.status,...await response.json()}}
try{
 await ensureAccounts(db);const alice=await token('alice@example.test'),bob=await token('bob@example.test');
 assert.equal((await call(null)).signedIn,false);assert.equal((await call(null,{email:'alice@example.test',paid:true,credits:999})).status,401);assert.equal(calls,0);
 const old=await oldAI({request:new Request(origin+'/new-build/api/playmaker-ai',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({question:'bypass'})}),env});assert.equal(old.status,401,'Old endpoint cannot bypass sign-in');
 for(let i=0;i<3;i++)assert.equal((await call(alice,{})).status,200);assert.equal((await call(alice)).freeRemaining,2);
 for(let i=0;i<5;i++)assert.equal((await call(bob,{})).status,200,'Separate account on same venue Wi-Fi');assert.equal((await call(bob)).freeRemaining,0);assert.equal((await call(alice)).freeRemaining,2);
 for(let i=0;i<2;i++)assert.equal((await call(alice,{})).status,200);assert.equal((await call(alice,{})).status,429);assert.equal(calls,10);
 const owner=await digest('playmaker-account:alice@example.test');assert(await grantPlaymakerCredits(db,owner,2,'fixture-payment-1'));assert.equal(await grantPlaymakerCredits(db,owner,2,'fixture-payment-1'),false);await assert.rejects(()=>grantPlaymakerCredits(db,owner,3,'fixture-payment-1'));
 let state=await call(alice);assert.equal(state.freeRemaining,0);assert.equal(state.creditsRemaining,2);assert.equal(state.remaining,2);
 const duplicate=crypto.randomUUID();assert.equal((await call(alice,{requestId:duplicate})).status,200);assert.equal((await call(alice,{requestId:duplicate})).status,409);assert.equal((await call(alice)).creditsRemaining,1);
 const before=calls,results=await Promise.all([call(alice,{}),call(alice,{},'192.0.2.2')]);assert.equal(results.filter(r=>r.status===200).length,1);assert.equal(calls-before,1);assert.equal((await call(alice)).creditsRemaining,0);assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM links_playmaker_credit_uses').get().n,2);
 await grantPlaymakerCredits(db,owner,3,'fixture-payment-2');now+=86400000;state=await call(alice);assert.equal(state.freeRemaining,5);assert.equal(state.creditsRemaining,3);assert.equal(state.remaining,8);await call(alice,{});assert.equal((await call(alice)).creditsRemaining,3,'Daily free builds are spent first');
 const last=await call(alice,{},'192.0.2.33');assert.equal(last.freeRemaining,3,'Changing IP does not reset the same account');assert.equal(last.account.email,'alice@example.test');
 env.PLAYMAKER_PUBLIC_DAILY_LIMIT='1';state=await call(alice);assert.equal(state.available,false);assert.equal(state.creditsRemaining,3,'Service cap does not zero the credit balance');
 await ensureIdentity(db);const cookie='verified-native-cookie';await db.prepare('INSERT INTO links_id_accounts VALUES(?,?,?,?,?,?,?)').bind('native-alice','alice-fixture','alice@example.test','Alice','fixture-salt','fixture-hash',new Date().toISOString()).run();await db.prepare('INSERT INTO links_id_sessions VALUES(?,?,?)').bind(await digest(cookie),'native-alice',Date.now()+3600000).run();
 const nativeRequest=new Request(origin+'/new-build/api/playmaker-public?action=config',{headers:{cookie:'__Host-links_identity='+cookie,'CF-Connecting-IP':'192.0.2.55'}});const nativeResponse=await playmakerPublic({request:nativeRequest,env},services),nativeState=await nativeResponse.json();assert.equal(nativeState.signedIn,true);assert.equal(nativeState.account.email,'alice@example.test');assert.equal(nativeState.creditsRemaining,3,'Native login cookie and legacy verified session use the same account wallet');
 const expired=await token('expired@example.test');db.raw.prepare("UPDATE links_account_sessions SET expires_at='2000-01-01' WHERE token_hash=?").run(await digest(expired));assert.equal((await call(expired,{})).status,401);
 console.log('PASS Playmaker accounts: verified sign-in, no legacy bypass, per-person venue allowances, persistent/idempotent credits, free-first spending, last-credit race, daily reset and expired sessions.');
}finally{db.raw.close()}
