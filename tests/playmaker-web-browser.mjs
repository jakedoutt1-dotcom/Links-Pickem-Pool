import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,existsSync,mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {playmakerPublic} from '../functions/new-build/api/playmaker-public.js';
const require=createRequire(import.meta.url),{chromium}=require('playwright'),root=resolve('public'),origin='https://links.test',out='output/playmaker-web';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const width of [320,390,1440]){
 const {db}=fixture(),now=Date.now(),errors=[],missing=[];let aiCalls=0,liveCalls=0,providerInput;
 const payload={success:true,data:[{eventID:'fixture-game',leagueID:'NFL',sportID:'FOOTBALL',status:{startsAt:new Date(now+86400000).toISOString(),started:false,ended:false},teams:{home:{name:'Test Home'},away:{name:'Test Away'}},odds:{'points-home-game-ml-home':{byBookmaker:{draftkings:{odds:'-110',lastUpdatedAt:new Date(now-60000).toISOString()}}}}}]};
 const env={DB:db,OPENAI_API_KEY:'fixture-only',SPORTS_GAME_ODDS_API_KEY:'fixture-only'},services={session:async()=>null,odds:async()=>Response.json(payload),fetch:async(url,options)=>{aiCalls++;providerInput=JSON.parse(options.body);return Response.json({status:'completed',output_text:'Fixture analysis <script>window.compromised=true</script>. Risk note: uncertain outcomes.'})}};
 const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());
  if(u.pathname.endsWith('/api/playmaker-public')){const r=await playmakerPublic({env,request:new Request(req.url(),{method:req.method(),headers:{...req.headers(),'CF-Connecting-IP':'192.0.2.1'},...(req.method()==='POST'?{body:req.postData()}:{})})},services);return route.fulfill({status:r.status,body:await r.text(),headers:Object.fromEntries(r.headers)})}
  if(u.pathname.endsWith('/api/live-scores')){liveCalls++;return route.fulfill({json:{asOf:Date.now(),events:[{league:'NFL',state:'in',away:{name:'AWAY',score:7},home:{name:'HOME',score:liveCalls*10},detail:'Q2'}]}})}
  if(u.pathname.includes('/api/'))return route.fulfill({json:{signedIn:false,events:[],pools:[],rooms:[]}});
  if(u.origin!==origin)return route.abort();
  const file=resolve(root,'.'+decodeURIComponent(u.pathname)+(u.pathname.endsWith('/')?'index.html':''));if(!file.startsWith(root)||!existsSync(file)){missing.push(u.pathname);return route.fulfill({status:404,body:''})}
  return route.fulfill({body:readFileSync(file),contentType:({'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[extname(file)]||'application/octet-stream')});
 });
 try{
  await page.goto(origin+'/new-build/index.html');await page.locator('#playmaker .playmaker-banner-art img').evaluate(el=>el.decode());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Homepage fits '+width);await page.locator('#playmaker').screenshot({path:`${out}/banner-${width}.png`});
  await page.locator('#playmaker a[href="./playmaker/"]').click();await page.waitForURL('**/playmaker/');await page.locator('.pick-button').first().waitFor();await page.waitForFunction(()=>document.querySelector('#liveTrackHome').textContent.includes('HOME'));
  assert.equal(aiCalls,0,'Loading does not generate AI');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Playmaker fits '+width+' '+JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&!e.closest('.live-window')).map(e=>[e.tagName,e.className,e.getBoundingClientRect().right]).slice(0,12))));await page.locator('.command-art').evaluate(el=>el.decode());await page.screenshot({path:`${out}/page-${width}.png`});
  const beforeLive=liveCalls;await page.getByRole('button',{name:'Refresh live scores'}).click();await page.waitForFunction(score=>document.querySelector('#liveTrackHome').textContent.includes('HOME '+score),(beforeLive+1)*10);
  await page.locator('#how-it-works').click();assert(await page.locator('#guide-dialog').isVisible());await page.locator('#close-guide').click();
  await page.locator('#lab-odds').fill('+150');await page.locator('#lab-stake').fill('10');await page.locator('#odds-lab-form button[type=submit]').click();assert.equal(await page.locator('#lab-return').innerText(),'$25.00');
  await page.locator('.pick-button').first().click();assert.equal(await page.locator('#card-count').innerText(),'1');await page.locator('#question-input').fill('Explain this selection and its uncertainty.');await page.locator('#analyze-button').click();await page.locator('.analysis-text').waitFor();assert.equal(aiCalls,1);assert.equal(JSON.parse(providerInput.input).card[0].americanOdds,-110);assert.equal(await page.evaluate(()=>window.compromised),undefined);assert.match(await page.locator('#ai-remaining').innerText(),/4 analyses/);
  await page.locator('#analyst').screenshot({path:`${out}/analyst-${width}.png`});await page.reload();await page.locator('.pick-button').first().waitFor();assert.equal(aiCalls,1);assert.equal(await page.locator('#card-count').innerText(),'1');assert.match(await page.locator('#ai-remaining').innerText(),/4 analyses/);assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  console.log(`PASS Playmaker ${width}px: homepage banner, live feed/refresh, market board, card persistence, Odds Lab, guide, canonical AI request, plain-text response and durable allowance.`);
 }finally{await page.close();db.raw.close()}
}}finally{await browser.close()}
