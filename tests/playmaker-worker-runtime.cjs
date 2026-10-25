const assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const {resolve}=require('node:path');
const dependencies=createRequire(resolve(process.env.PLAYMAKER_RUNTIME_DEPS||'tmp/playmaker-runtime-check/package.json'));
const {Miniflare}=dependencies('miniflare'),{build}=dependencies('esbuild');
(async()=>{
 const bundle=await build({stdin:{contents:`import {playmakerPublic} from './functions/new-build/api/playmaker-public.js';export default {fetch(request,env,ctx){return playmakerPublic({request,env,waitUntil:ctx.waitUntil.bind(ctx)})}}`,resolveDir:process.cwd()},bundle:true,format:'esm',write:false,platform:'browser'});
 let scenario='success',calls=0,leaked=0;
 const now=Date.now();const board={success:true,data:[{eventID:'runtime-event',leagueID:'NFL',sportID:'FOOTBALL',status:{startsAt:new Date(now+86400000).toISOString(),started:false,ended:false},teams:{home:{name:'Home'},away:{name:'Away'}},odds:{'points-home-game-ml-home':{byBookmaker:{draftkings:{odds:'-110',lastUpdatedAt:new Date(now).toISOString()}}}}}]};
 const player='TEST_PLAYER_1_NFL';board.data[0].players={[player]:{name:'Test Player'}};board.data[0].odds[`touchdowns-${player}-game-yn-yes`]={statID:'touchdowns',statEntityID:player,periodID:'game',betTypeID:'yn',sideID:'yes',byBookmaker:{draftkings:{odds:'+150',lastUpdatedAt:new Date(now).toISOString()}}};
 const {parseEvents}=await import('../public/new-build/playmaker/domain.mjs');const rows=parseEvents(board,'all',now),pick=rows.find(p=>p.market==='moneyline'),prop=rows.find(p=>p.market==='prop');
 const outboundService=async request=>{
  const url=new URL(request.url);
  if(url.origin==='https://api.sportsgameodds.com')return Response.json(board);
  if(url.origin==='https://unexpected.test'){leaked++;return new Response('Should never be contacted');}
  assert.equal(url.href,'https://api.openai.com/v1/responses');assert.equal(request.method,'POST');
  calls++;if(scenario==='redirect')return new Response('redirect',{status:307,headers:{Location:'https://unexpected.test/steal'}});
  if(scenario==='auth'||scenario==='rate')return Response.json({error:{message:'private-provider-detail'}},{status:scenario==='auth'?401:429});
  const output=['build','props'].includes(scenario)?JSON.stringify({analysis:'Risk note: uncertain outcome.',picks:[{id:scenario==='props'?prop.id:pick.id,reason:'Current quoted price; no proven edge.'}]}):'Fixture answer. Risk note: uncertain.';
  return Response.json({status:scenario==='incomplete'?'incomplete':'completed',output:[{type:'message',content:[{type:'output_text',text:output}]}],usage:{input_tokens:10,output_tokens:10}});
 };
 const mf=new Miniflare({modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-07-01',d1Databases:['DB'],bindings:{OPENAI_API_KEY:'fake-private-key',SPORTS_GAME_ODDS_API_KEY:'fake-odds-key'},outboundService,cf:false});
 try{
  let n=0;async function call(body={}){const response=await mf.dispatchFetch('https://links.test/new-build/api/playmaker-public?action=ai',{method:'POST',headers:{Origin:'https://links.test','Content-Type':'application/json','CF-Connecting-IP':`192.0.2.${++n}`},body:JSON.stringify({sport:'NFL',question:'Explain -110.',card:[],requestId:crypto.randomUUID(),...body})});const data=await response.json();assert(!JSON.stringify(data).includes('fake-private-key'));assert(!JSON.stringify(data).includes('private-provider-detail'));return {status:response.status,...data}}
  let r=await call();assert.equal(r.status,200);assert.match(r.analysis,/Fixture answer/);assert.equal(calls,1);
  scenario='redirect';r=await call();assert.equal(r.status,502);assert.match(r.error,/redirect/);assert.equal(leaked,0);assert.equal(calls,2,'No retry after redirect');
  scenario='auth';r=await call();assert.equal(r.status,502);assert.match(r.error,/API access/);
  scenario='rate';r=await call();assert.equal(r.status,503);assert.match(r.error,/usage or billing limit/);
  scenario='incomplete';r=await call();assert.equal(r.status,502);assert.equal(r.analysis,undefined);
  scenario='build';r=await call({mode:'build',risk:'aggressive',kind:'single',legs:4});assert.equal(r.status,200);assert.equal(r.picks.length,1);assert.equal(r.picks[0].americanOdds,-110);
  scenario='props';r=await call({mode:'build',category:'touchdowns',kind:'single',legs:1});assert.equal(r.status,200);assert.equal(r.picks[0].playerName,'Test Player');assert.equal(r.picks[0].line,null);
  const db=await mf.getD1Database('DB'),rows=(await db.prepare('SELECT status FROM links_playmaker_requests').all()).results;assert.equal(rows.filter(r=>r.status==='succeeded').length,3);assert.equal(rows.filter(r=>r.status==='failed').length,4);assert.equal(calls,7);
  console.log('PASS Cloudflare workerd: real fetch/D1, normal and Build My Bet responses, redirects never followed, sanitized access/rate errors, incomplete output rejected, no retries, no real providers.');
 }finally{await mf.dispose()}
})().catch(error=>{console.error(error);process.exitCode=1});
