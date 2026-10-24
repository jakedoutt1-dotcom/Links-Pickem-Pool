import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {playmakerPublic,providerText} from '../functions/new-build/api/playmaker-public.js';
import {ensureAccounts,digest} from '../functions/lib/commissioner-account.js';
import {parseEvents} from '../public/new-build/playmaker/domain.mjs';
const now=Date.parse('2026-10-24T18:00:00Z'),origin='https://links.test';
const board=()=>({success:true,data:[{eventID:'test-event',leagueID:'NFL',sportID:'FOOTBALL',status:{startsAt:'2026-10-25T18:00:00Z',started:false,ended:false},teams:{home:{name:'Test Home'},away:{name:'Test Away'}},odds:{'points-home-game-ml-home':{byBookmaker:{draftkings:{odds:'-110',lastUpdatedAt:'2026-10-24T17:59:00Z'}}}}}]});
const valid=()=>({sport:'NFL',question:'Explain the uncertainty in this price.',card:[],requestId:crypto.randomUUID()});
function setup(extra={}){
 const {db}=fixture(),calls=[],oddsCalls=[];let output={status:'completed',model:'gpt-5-mini',output:[{content:[{type:'output_text',text:'Test analysis. Risk note: uncertain outcomes.'}]}],usage:{input_tokens:40,output_tokens:30}};
 const env={DB:db,OPENAI_API_KEY:'fixture-private-key',SPORTS_GAME_ODDS_API_KEY:'fixture-odds-key',...extra};
 const services={now:()=>now,session:async()=>null,odds:async c=>{oddsCalls.push(new URL(c.request.url));return Response.json(board())},fetch:async(url,options)=>{calls.push({url,...options});return Response.json(output)}};
 async function call(body,options={}){const action=options.action||'ai',request=new Request(origin+'/new-build/api/playmaker-public?action='+action+(options.query||''),{method:body?'POST':'GET',headers:{Origin:options.origin||origin,'CF-Connecting-IP':options.ip||'192.0.2.1','Content-Type':'application/json',...(options.headers||{})},...(body?{body:JSON.stringify(body)}:{})});const r=await playmakerPublic({request,env},services);return {status:r.status,...await r.json()}}
 return {db,env,services,calls,oddsCalls,call,setOutput:v=>output=v};
}
{
 const s=setup();try{
  const r=await s.call(null,{action:'config'});assert(r.aiConnected&&r.oddsConnected);assert.equal(r.remaining,5);assert.equal(s.calls.length,0);
  assert.equal((await s.call(null,{action:'odds',query:'&leagueID=NFL&limit=100&oddIDs=bad'})).status,200);const u=s.oddsCalls[0];assert.equal(u.searchParams.get('limit'),'20');assert.equal(u.searchParams.get('oddIDs').split(',').length,6);
  const response=await s.call(valid());assert.equal(response.status,200);assert.equal(response.remaining,4);assert.match(response.analysis,/Risk note/);
  const sent=JSON.parse(s.calls[0].body);assert.equal(sent.max_output_tokens,2000);assert.equal(sent.reasoning.effort,'minimal');assert.equal(sent.store,false);assert.equal(s.calls[0].url,'https://api.openai.com/v1/responses');
  const records=s.db.raw.prepare('SELECT * FROM links_playmaker_requests').all();assert.equal(records.length,1);assert.equal(records[0].status,'succeeded');assert.equal(records[0].input_tokens,40);assert(!JSON.stringify(records).includes('Explain the uncertainty'));assert(!JSON.stringify(response).includes('private-key'));
 }finally{s.db.raw.close()}
}
{
 const s=setup();try{
  const rows=parseEvents(board(),'all',now);assert.equal(rows.length,1);
  const b={...valid(),card:[{id:rows[0].id,americanOdds:9999,eventName:'FORGED',bookmakerName:'FORGED'}],clientId:'rotate-to-bypass',odds:[{odds:9999}]};
  assert.equal((await s.call(b)).status,200);const input=JSON.parse(JSON.parse(s.calls[0].body).input);assert.equal(input.card[0].americanOdds,-110);assert.equal(input.card[0].event,'Test Away at Test Home');assert(!JSON.stringify(input).includes('FORGED'));
  assert.equal((await s.call(b)).status,409);assert.equal(s.calls.length,1);
  assert.equal((await s.call({...valid(),card:[{id:'unknown'}]})).status,409);assert.equal(s.calls.length,1);
  assert.equal((await s.call({...valid(),card:[{id:rows[0].id}],sport:'NBA'})).status,409);
 }finally{s.db.raw.close()}
}
{
 const s=setup();try{
  s.setOutput({status:'incomplete',incomplete_details:{reason:'max_output_tokens'},output_text:'Partial must not be shown'});
  for(let i=0;i<5;i++){const r=await s.call({...valid(),clientId:'new-'+i});assert.equal(r.status,502);assert(!r.analysis)}
  assert.equal((await s.call(valid())).status,429);assert.equal(s.calls.length,5);assert.equal((await s.call(null)).remaining,0);assert.equal(s.db.raw.prepare("SELECT COUNT(*) n FROM links_playmaker_requests WHERE status='failed'").get().n,5);
 }finally{s.db.raw.close()}
}
{
 const s=setup({PLAYMAKER_PUBLIC_DAILY_LIMIT:'1'});try{
  const all=await Promise.all([s.call(valid()),s.call(valid(),{ip:'192.0.2.2'})]);assert.equal(all.filter(r=>r.status===200).length,1);assert.equal(all.filter(r=>r.status===429).length,1);assert.equal(s.calls.length,1);
 }finally{s.db.raw.close()}
}
{
 const s=setup();try{
  assert.equal((await s.call(valid(),{origin:'https://evil.test'})).status,403);assert.equal((await s.call({...valid(),question:'x'.repeat(1801)})).status,400);assert.equal((await s.call({...valid(),sport:'BOGUS'})).status,400);assert.equal(s.calls.length,0);
  s.env.OPENAI_API_KEY='';assert.equal((await s.call(valid())).status,503);assert.equal(s.db.raw.prepare('SELECT COUNT(*) n FROM links_playmaker_requests').get().n,0);
 }finally{s.db.raw.close()}
}
{
 const s=setup();try{
  await ensureAccounts(s.db);const token='verified-owner-testing-token';
  s.db.raw.prepare('INSERT INTO links_account_sessions(token_hash,email,expires_at) VALUES(?,?,?)').run(await digest(token),'jakedoutt@yahoo.com','2099-01-01');
  delete s.services.session;
  const headers={'x-links-account':token};
  const health=await s.call(null,{headers});assert.equal(health.testingPass,true);assert.equal(health.remaining,null);assert.equal(health.dailyLimit,null);assert.equal(health.expiresAt,null);
  for(let i=0;i<7;i++){const response=await s.call(valid(),{headers});assert.equal(response.status,200);assert.equal(response.testingPass,true)}
  assert.equal(s.calls.length,7);assert.equal((await s.call(null)).remaining,5,'Owner tests do not consume guest network allowance');
  const fake=await s.call({...valid(),email:'jakedoutt@yahoo.com',testingPass:true,paid:true});assert.equal(fake.testingPass,false);assert.equal(fake.remaining,4);
  s.db.raw.prepare("UPDATE links_account_sessions SET expires_at='2000-01-01' WHERE token_hash=?").run(await digest(token));
  assert.equal((await s.call(null,{headers})).testingPass,false,'Expired sessions cannot use the pass');
 }finally{s.db.raw.close()}
}
{
 const s=setup({PLAYMAKER_PUBLIC_DAILY_LIMIT:'1'});try{
  s.services.session=async()=>({email:'jakedoutt@yahoo.com'});assert.equal((await s.call(valid())).status,200);assert.equal((await s.call(valid())).status,429,'Provider capacity still applies to testing pass');
 }finally{s.db.raw.close()}
}
assert.equal(providerText({status:'completed',output_text:'',output:[{content:[{type:'output_text',text:'Nested text'}]}]}),'Nested text');
assert.equal(providerText({status:'incomplete',output_text:'Partial'}),'');
console.log('PASS public Playmaker: canonical server prices, source freshness, fixed market requests, no automatic AI calls, atomic owner/IP/global quotas, consumed failed attempts, duplicate suppression, origin/input validation, provider output recovery and private metadata.');

{
 const s=setup();try{
  const pick=parseEvents(board(),'all',now)[0];
  const build=()=>({...valid(),mode:'build',risk:'aggressive',kind:'single',legs:4});
  s.setOutput({status:'completed',output_text:JSON.stringify({analysis:'Quoted price only. Risk note: no proven edge.',picks:[{id:pick.id,reason:'Price is available; outcome remains uncertain.'}]})});
  const result=await s.call(build());assert.equal(result.status,200);assert.equal(result.picks[0].americanOdds,-110);assert.equal(JSON.parse(JSON.parse(s.calls[0].body).input).legs,1);
  s.setOutput({status:'completed',output_text:JSON.stringify({analysis:'Unavailable prop.',picks:[]})});assert.equal((await s.call(build())).picks.length,0);
  s.setOutput({status:'completed',output_text:JSON.stringify({analysis:'Bad pick',picks:[{id:'invented',reason:'fake'}]})});assert.equal((await s.call(build())).status,502);
  s.setOutput({status:'completed',output_text:JSON.stringify({analysis:'Duplicate event',picks:[{id:pick.id,reason:'one'},{id:pick.id,reason:'two'}]})});assert.equal((await s.call({...build(),kind:'parlay',legs:2})).status,502);
  const calls=s.calls.length;assert.equal((await s.call({...build(),risk:'guaranteed'})).status,400);assert.equal(s.calls.length,calls);
 }finally{s.db.raw.close()}
}
console.log('PASS Build My Bet: canonical picks, single-leg override, unsupported markets, invented selections and duplicate events.');
