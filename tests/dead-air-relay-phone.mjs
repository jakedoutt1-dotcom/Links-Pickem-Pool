import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {start,advance,respond,puzzle,view} from '../functions/lib/dead-air.js';
import {offlineDeadAir,origin} from './helpers/dead-air-browser-fixture.mjs';

const require=createRequire(import.meta.url),{chromium}=require('playwright'),browser=await chromium.launch({channel:'msedge',headless:true}),errors=[];
try{
 fs.mkdirSync('output/dead-air',{recursive:true});
 for(const width of [360,390]){
  const s={code:'1234567890',flowVersion:2,game:1,mode:'friends',owner:'0',players:Object.fromEntries(Array.from({length:8},(_,i)=>[String(i),{name:'Player '+(i+1),avatar:'Engineer'}]))};start(s,Date.now());
  Object.assign(s,{phase:'challenge',phaseId:8,startsAt:Date.now(),deadline:Date.now()+30000,challenge:puzzle('relay',8),responses:{}});s.players['0'].atRisk=true;s.players['0'].lives=1;
  let data=view(s,'0',Date.now());const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});await offlineDeadAir(context,r=>r.fulfill({json:data}));
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));await page.addInitScript(()=>localStorage.setItem('links-dead-air-1234567890','test'));
  await page.goto(origin+'/new-build/dead-air.html?room=1234567890');await page.waitForFunction(()=>document.body.dataset.phase==='challenge');
  await page.waitForFunction(()=>document.querySelector('#stage').getBoundingClientRect().top<2);
  assert.equal(await page.locator('.relay-cell').count(),16);assert.equal(await page.locator('.relay-cell.live').count(),0);assert.equal(await page.locator('#options button').count(),4);
  const fit=await page.evaluate(()=>({options:document.querySelector('#options').getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth>innerWidth,height:innerHeight}));
  assert.equal(fit.overflow,false);assert.ok(fit.options<=fit.height,'Relay board and all four exit buttons must fit the phone at '+width+'px: '+JSON.stringify(fit));
  await page.screenshot({path:'output/dead-air/phone-'+width+'-relay-focused.png'});
  respond(s,'0',(s.challenge.correct+1)%4,s.startsAt);advance(s,s.deadline);data=view(s,'0',Date.now());await page.reload();await page.waitForFunction(()=>document.body.dataset.phase==='result');
  assert.equal(await page.locator('#statusTitle').textContent(),'YOU ARE NOW AN ECHO');assert.match(await page.locator('#personalReport').textContent(),/You sent:.*Correct:.*SIGNAL LOST/);assert.equal(await page.locator('#stage .feedback-button').count(),0);assert.equal(await page.locator('.relay-cell.live').count(),s.challenge.route.length);
  await page.locator('#stage').scrollIntoViewIfNeeded();await page.screenshot({path:'output/dead-air/phone-'+width+'-relay-echo-result.png',fullPage:true});await context.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS offline Relay Trace phone focus at360/390: visible board and all four exits, sealed live route, solved reveal, exact Echo transition and no in-round feedback CTA.');
}finally{await browser.close()}
