import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {identityRequest} from '../functions/lib/player-identity.js';
import {ensureTransition} from '../functions/lib/login-transition.js';
import {accountWelcome,sendAccountWelcome} from '../functions/lib/account-welcome.js';
test('Verified signup sends a useful welcome once; email failure never blocks the account',async()=>{
 const {db}=fixture(),old=fetch,mail=[],jobs=[],env={DB:db,RESEND_API_KEY:'mock-only'},origin='https://welcome.invalid';let rejectWelcome=false,cookie='';
 global.fetch=async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');const b=JSON.parse(options.body);assert(b.to[0].endsWith('@example.invalid'));mail.push(b);if(rejectWelcome&&b.subject.startsWith('Welcome'))return Response.json({message:'Simulated provider failure'},{status:503});return Response.json({id:'mock-'+mail.length})};
 await ensureTransition(db);db.raw.exec("UPDATE links_login_rollout SET phase='transition'");
 const call=async(body,authenticated=false)=>{const r=await identityRequest({env,waitUntil:p=>jobs.push(p),request:new Request(origin+'/new-build/api/player-account',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:authenticated?cookie:''},body:JSON.stringify(body)})});const set=r.headers.get('set-cookie');if(set)cookie=set.split(';')[0];return {status:r.status,...await r.json()}};
 try{
  const signup={action:'register',username:'welcome_user',email:'welcome@example.invalid',displayName:'Welcome <Player>',password:'never-email-this-password',connect:false};
  const pending=await call(signup);assert.equal(pending.status,200);assert.equal(mail.length,1);assert.equal(mail[0].subject,'Your LINKS verification code');
  const code=mail[0].text.match(/code is (\d{6})/)[1];
  const wrong=String((Number(code[0])+1)%10)+code.slice(1);assert.equal((await call({action:'confirm',challenge:pending.challenge,code:wrong})).status,400);assert.equal(mail.length,1);
  assert.equal((await call({action:'confirm',challenge:pending.challenge,code})).status,200);await Promise.all(jobs);assert.equal(mail.length,2);const welcome=mail[1];
  assert.match(welcome.subject,/Welcome to LINKS/);assert.match(welcome.text,/Connect My Pools/);assert.match(welcome.text,/does not combine the pools/);assert.match(welcome.text,/commissioner roles/);assert.match(welcome.text,/cfp.html\?event=links/);assert.match(welcome.html,/Welcome &lt;Player&gt;/);assert(!welcome.text.includes(signup.password));assert(!welcome.text.includes(code));
  assert.equal((await call({action:'welcome'})).status,401);assert.equal((await call({action:'welcome'},true)).delivery.alreadySent,true);assert.equal(mail.length,2);
  const racing={id:'race-account',email:'race@example.invalid',display_name:'Race',username:'race'};
  await Promise.all(Array.from({length:20},()=>sendAccountWelcome(env,racing)));assert.equal(mail.filter(m=>m.to[0]===racing.email).length,1,'Concurrent retries must not duplicate welcome emails');
  rejectWelcome=true;const second=await call({...signup,username:'welcome_second',email:'second@example.invalid'});const secondCode=mail.find(m=>m.to[0]==='second@example.invalid'&&m.subject==='Your LINKS verification code').text.match(/code is (\d{6})/)[1];
  const created=await call({action:'confirm',challenge:second.challenge,code:secondCode});assert.equal(created.status,200);await Promise.all(jobs);assert.equal(db.raw.prepare('SELECT status FROM links_account_welcome WHERE account_id=?').get(created.account.id).status,'PENDING');
  rejectWelcome=false;assert.equal((await call({action:'welcome'},true)).delivery.sent,true);
  assert.match(accountWelcome({display_name:'X',username:'x'}).html,/https:\/\/linkspickempools.com\/new-build\/control-center.html/);
 }finally{global.fetch=old;db.raw.close()}
});
