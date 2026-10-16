import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {offlineDeadAir,origin} from './helpers/dead-air-browser-fixture.mjs';
import {onRequest} from '../functions/new-build/api/dead-air.js';

const require=createRequire(import.meta.url),{chromium}=require('playwright'),{db}=fixture();
const realNow=Date.now,realFetch=globalThis.fetch,browser=await chromium.launch({channel:'msedge',headless:true}),phones=[],errors=[],bots=[];
let now=Date.now(),queue=Promise.resolve(),code;
globalThis.fetch=async()=>{throw Error('Live network is disabled in this test')};
async function invoke(request){
 const work=queue.then(async()=>{Date.now=()=>now;try{return await onRequest({env:{DB:db},request})}finally{Date.now=realNow}});queue=work.catch(()=>{});return work;
}
async function route(r){const req=r.request(),res=await invoke(new Request(req.url(),{method:req.method(),headers:{...req.headers(),origin},...(req.method()==='POST'?{body:req.postData()}:{})}));const body=await res.text();assert.equal(res.status,200,body);await r.fulfill({status:res.status,headers:Object.fromEntries(res.headers),body})}
async function api(body,token=''){const r=await invoke(new Request(origin+'/new-build/api/dead-air',{method:'POST',headers:{origin,'x-dead-air-token':token},body:JSON.stringify({code,game:1,...body})}));const json=await r.json();assert.equal(r.status,200,JSON.stringify(json));return json}
async function raw(){await queue;return JSON.parse(db.raw.prepare('SELECT state FROM links_dead_air_rooms WHERE code=?').get(code).state)}
async function waitPhase(page,phase){await page.waitForFunction(value=>document.body.dataset.phase===value,phase,{timeout:8000})}
async function next(phase){const s=await raw();now=s.deadline+1;await Promise.all([...phones,tv].map(page=>waitPhase(page,phase)));return raw()}
async function saved(page){await page.waitForFunction(()=>document.querySelector('#feedback').textContent.includes('Answer saved'))}
let tv;
try{
 for(const width of [360,390]){const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});await offlineDeadAir(context,route);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));phones.push(page)}
 await phones[0].goto(origin+'/new-build/dead-air.html');await phones[0].fill('#createName','Host');await phones[0].selectOption('#createAvatar','Engineer');await phones[0].click('#createForm button');await phones[0].waitForSelector('#lobby:visible');code=new URL(phones[0].url()).searchParams.get('room');
 await phones[1].goto(phones[0].url());await phones[1].fill('#joinName','Guest');await phones[1].click('#joinForm button');await phones[1].waitForSelector('#lobby:visible');
 for(let i=2;i<8;i++){const player=await api({action:'join',name:'Player '+(i+1),avatar:'Editor'});bots.push(player);await api({action:'ready'},player.token)}
 await phones[0].click('#tvButton');const tvUrl=await phones[0].locator('#tvLink').getAttribute('href');await phones[0].click('#closeTv');const tvContext=await browser.newContext({viewport:{width:960,height:540}});await offlineDeadAir(tvContext,route);tv=await tvContext.newPage();tv.on('pageerror',e=>errors.push(e.message));await tv.goto(tvUrl);await tv.waitForSelector('#lobby:visible');assert.equal(await tv.locator('#ready').isVisible(),false);
 for(const page of phones)await page.click('#ready');await phones[0].waitForFunction(()=>!document.querySelector('#start').disabled);await phones[0].click('#start');await waitPhase(phones[0],'intro');
 await queue;const seeded=await raw();seeded.puzzleOrder=['signal','evidence','frequency','power'];db.raw.prepare('UPDATE links_dead_air_rooms SET state=? WHERE code=?').run(JSON.stringify(seeded),code);
 fs.mkdirSync('output/dead-air',{recursive:true});const seen=new Set();
 for(let cycle=0;cycle<4;cycle++){
  let s=await next('question');const wrong=(s.question.correct+1)%4;
  await phones[0].locator('#options button').nth(wrong).click();await saved(phones[0]);assert.equal(await phones[0].locator('#options button').nth(s.question.correct).isEnabled(),true);
  await phones[0].locator('#options button').nth(s.question.correct).click();await phones[0].waitForFunction(index=>document.querySelectorAll('#options button')[index].classList.contains('selected'),s.question.correct);
  await phones[1].locator('#options button').nth(wrong).click();await saved(phones[1]);
  for(const bot of bots)await api({action:'answer',phaseId:s.phaseId,answer:s.question.correct},bot.token);
  if(cycle===0){
   await phones[0].click('#pauseGame');await Promise.all([...phones,tv].map(page=>page.waitForFunction(()=>document.body.dataset.paused==='true')));const frozen=await raw();now+=60000;
   assert.equal(await phones[0].locator('#clock').textContent(),'Ⅱ');assert.equal(await phones[1].locator('#pauseGame').isVisible(),false);assert.equal(await tv.locator('#pauseGame').isVisible(),false);
   assert.equal(await phones[0].locator('#options button:enabled').count(),0);assert.equal(await phones[1].locator('#options button:enabled').count(),0);
   await phones[0].screenshot({path:'output/dead-air/phone-360-paused.png',fullPage:true});await phones[0].click('#pauseGame');await Promise.all([...phones,tv].map(page=>page.waitForFunction(()=>document.body.dataset.paused==='false')));
   const resumed=await raw();assert.equal(resumed.phaseId,frozen.phaseId);assert.equal(resumed.deadline-frozen.deadline,60000);assert.equal(await phones[0].locator('#options button:enabled').count(),4);
  }
  for(const [i,page] of phones.entries()){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'output/dead-air/phone-'+(i?390:360)+'-question.png',fullPage:true})}
  await next('answer');assert.equal(await tv.locator('#options .correct').count(),1);assert.equal(await tv.locator('#options .correct').textContent(),s.question.options[s.question.correct]);if(cycle===0)await tv.screenshot({path:'output/dead-air/tv-trivia-answer-960x540.png'});
  s=await next('brief');seen.add(s.challenge.type);if(['signal','evidence'].includes(s.challenge.type)){await next('observe');await tv.screenshot({path:'output/dead-air/tv-'+s.challenge.type+'-observe.png'})}
  await next('challenge');
  for(let i=0;i<2;i++){
   const page=phones[i],c=s.challenge;if(c.type==='signal'){assert.equal(await tv.locator('#sequence').isVisible(),false);for(const n of c.sequence)await page.locator('#options button').nth(n).click();await page.click('#submitSequence');await saved(page);assert.equal(await page.locator('#undoSymbol').isEnabled(),true)}
   else{await page.locator('#options button').nth(c.type==='frequency'?c.correct:c.type==='evidence'?c.changed:i).click();await saved(page)}
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  for(const [i,bot] of bots.entries()){const c=s.challenge,answer=c.type==='signal'?c.sequence:c.type==='evidence'?c.changed:c.type==='frequency'?c.correct:i%3;await api({action:'answer',phaseId:(await raw()).phaseId,answer},bot.token)}
  await next('result');await tv.screenshot({path:'output/dead-air/tv-'+s.challenge.type+'-result.png'});await phones[0].reload();await waitPhase(phones[0],'result');
 }
 assert.equal(seen.size,4);assert.equal((await raw()).flowVersion,2);assert.equal(await tv.locator('#cast .cast-member').count(),8);assert.deepEqual(errors,[]);
 console.log('PASS offline Dead Air browser integration: 360/390px phones, eight-player room, all challenge controls, editable answers, host pause/resume, TV correct-answer reveal, memory secrecy and reconnect.');
}finally{Date.now=realNow;globalThis.fetch=realFetch;await browser.close();db.raw.close()}
