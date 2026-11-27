// Local concurrent production-handler exercise. No external network or real email.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {fixture} from '../helpers/pool-format-fixture.mjs';
import {playoffFixture} from '../helpers/cfp-bracket-fixture.mjs';
import {identityRequest} from '../../functions/lib/player-identity.js';
import {ensureTransition} from '../../functions/lib/login-transition.js';
import {onRequest as eventRequest} from '../../functions/new-build/api/hosted-cfp.js';
import {onRequest as cfpRequest} from '../../functions/new-build/api/cfp.js';
import {cfpSeason} from '../../public/new-build/cfp-core.mjs';
const users=Number(process.env.LINKS_LOAD_USERS||500),concurrency=Number(process.env.LINKS_LOAD_CONCURRENCY||250);
assert(Number.isInteger(users)&&users>=1&&users<=1000);assert(Number.isInteger(concurrency)&&concurrency>=1&&concurrency<=500);
const {db:base}=fixture();let tail=Promise.resolve(),queries=0;
const enqueue=fn=>{const p=tail.then(fn);tail=p.catch(()=>{});return p};
const db={prepare(sql){const inner=base.prepare(sql),out={inner,bind(...args){inner.bind(...args);return out},first(){queries++;return enqueue(()=>inner.first())},all(){queries++;return enqueue(()=>inner.all())},run(){queries++;return enqueue(()=>inner.run())}};return out},batch(stmts){queries+=stmts.length;return enqueue(()=>base.batch(stmts.map(s=>s.inner)))}};
const original=fetch,origin='https://load.invalid',mail=new Map(),f=playoffFixture(cfpSeason()),env={DB:db,RESEND_API_KEY:'LOCAL-MOCK-NOT-A-REAL-KEY'},stats={};let messages=0,verificationMessages=0,welcomeMessages=0,feeds=0;
global.fetch=async(url,options)=>{
 if(String(url)==='https://api.resend.com/emails'){const b=JSON.parse(options.body);assert(b.to.every(to=>to.endsWith('@load.invalid')));if(b.subject==='Your LINKS verification code'){const code=b.text.match(/code is (\d{6})/)[1];mail.set(b.to[0],code);verificationMessages++;}else{assert.match(b.subject,/Welcome to LINKS/);welcomeMessages++;}messages++;await new Promise(r=>setTimeout(r,5));return Response.json({id:'simulated-'+messages})}
 if(/^https:\/\/(site\.api|cdn)\.espn\.com\//.test(String(url))){feeds++;return Response.json({events:f.events})}
 throw Error('External network is forbidden: '+url);
};
const clients=Array.from({length:users},(_,i)=>({i,username:'volume_'+i,email:'player'+i+'@load.invalid',cookie:'',challenge:''}));
async function request(c,handler,path,body){const started=performance.now(),r=await handler({env,request:new Request(origin+'/new-build/api/'+path,{method:body?'POST':'GET',headers:{Origin:origin,'Content-Type':'application/json',Cookie:c.cookie,'CF-Connecting-IP':'198.51.'+Math.floor(c.i/250)+'.'+(c.i%250)},...(body?{body:JSON.stringify(body)}:{})})}),j=await r.json();const cookie=r.headers.get('set-cookie');if(cookie)c.cookie=cookie.split(';')[0];return {status:r.status,j,ms:performance.now()-started};}
async function phase(name,list,fn){let index=0;const times=[],statuses={};await Promise.all(Array.from({length:Math.min(concurrency,list.length)},async()=>{while(index<list.length){const c=list[index++],r=await fn(c);times.push(r.ms);statuses[r.status]=(statuses[r.status]||0)+1;assert.equal(r.status,200,name+': '+JSON.stringify(r.j));}}));times.sort((a,b)=>a-b);const at=q=>Math.round(times[Math.min(times.length-1,Math.floor(times.length*q))]*100)/100;stats[name]={requests:times.length,statuses,p50Ms:at(.5),p95Ms:at(.95),p99Ms:at(.99)};console.log(name,JSON.stringify(stats[name]));}
try{
 await ensureTransition(db);base.raw.exec("UPDATE links_login_rollout SET phase='transition'");
 const started=performance.now(),opened=await eventRequest({env,request:new Request(origin+'/new-build/api/hosted-cfp')}),event=(await opened.json()).event,pool=event.id,season=cfpSeason(),query='cfp?pool='+pool+'&season='+season;
 await phase('signup',clients,async c=>{const r=await request(c,identityRequest,'player-account',{action:'register',username:c.username,email:c.email,displayName:'Load Player '+c.i,password:'Synthetic-password-123!',connect:false});assert(!r.j.testCode,'Use the real email-send branch, not test-host code exposure');c.challenge=r.j.challenge;return r});
 assert.equal(messages,users);assert.equal(base.raw.prepare('SELECT COUNT(*) n FROM links_id_accounts').get().n,0,'Email codes must be verified before accounts exist');
 await phase('verify_email',clients,async c=>request(c,identityRequest,'player-account',{action:'confirm',challenge:c.challenge,code:mail.get(c.email)}));
 assert.equal(welcomeMessages,users,'Each verified account receives exactly one simulated welcome');
 await phase('password_signin',clients,async c=>request(c,identityRequest,'player-account',{action:'login',login:c.username,password:'Synthetic-password-123!',remember:false}));
 await phase('join',clients,async c=>request(c,eventRequest,'hosted-cfp',{action:'join'}));
 await phase('repeat_join',clients,async c=>request(c,eventRequest,'hosted-cfp',{action:'join'}));
 assert.equal(base.raw.prepare('SELECT COUNT(*) n FROM links_hosted_cfp_members').get().n,users,'One entry per account despite repeated joins');
 await phase('counter_polling',[...clients,...clients],async c=>{const r=await request(c,cfpRequest,query+'&counts=1');assert.equal(r.j.playerCount,users);return r});
 await phase('draft_saves',clients,async c=>request(c,cfpRequest,query,{action:'bracketSave',pool,season,picks:{r8:{team:f.picks.r8.team}},guess:null,submit:false,version:0,revision:1}));
 await phase('submit_brackets',clients,async c=>request(c,cfpRequest,query,{action:'bracketSave',pool,season,picks:f.picks,guess:40+c.i%80,winningGuess:28,submit:true,version:1,revision:1}));
 await phase('private_entry_reads',clients.slice(0,Math.min(100,users)),async c=>{const r=await request(c,cfpRequest,query);assert(r.j.player.startsWith('Load Player '+c.i+' · '));assert.equal(r.j.bracket.entry.player,r.j.player);assert.equal(r.j.bracket.entry.guess,40+c.i%80);assert.equal(r.j.bracket.shared.length,0);assert.equal(r.j.entryCount,users);return r});
 const rows=base.raw.prepare('SELECT COUNT(*) n FROM links_cfp_brackets WHERE pool_id=? AND submitted=1').get(pool);assert.equal(rows.n,users);assert.equal(base.raw.prepare('SELECT COUNT(*) n FROM pool_players WHERE pool_id=1').get().n,3);
 const report={type:'LOCAL_CONCURRENT_SIGNUP_AND_HOSTED_EVENT_NOT_PRODUCTION_CAPACITY',users,concurrency,requests:Object.values(stats).reduce((n,s)=>n+s.requests,0),simulatedVerificationEmails:verificationMessages,simulatedWelcomeEmails:welcomeMessages,realEmailsSent:0,savedBrackets:rows.n,queries,mockedSportsRequests:feeds,durationMs:Math.round(performance.now()-started),phases:stats,limitations:['In-memory SQLite with serialized DB operations, not Cloudflare D1','Email provider responses and sports feeds are simulated; no external network','Does not measure actual production throughput or real email delivery limits','No real accounts, production entries, prizes or payments are created']};
 mkdirSync('output/scale-readiness',{recursive:true});writeFileSync('output/scale-readiness/signup-hosted-cfp.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{global.fetch=original;base.raw.close()}
