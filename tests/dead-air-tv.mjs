import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {start,advance,view,puzzle} from '../functions/lib/dead-air.js';
import {offlineDeadAir,origin} from './helpers/dead-air-browser-fixture.mjs';

const require=createRequire(import.meta.url),{chromium}=require('playwright'),browser=await chromium.launch({channel:'msedge',headless:true});
const errors=[],failures=[],s={code:'1234567890',flowVersion:2,game:1,mode:'friends',owner:'0',players:Object.fromEntries(Array.from({length:8},(_,i)=>[String(i),{name:'Player '+(i+1)+' Long Lastname',avatar:['Anchor','Camera','Stagehand','Producer','Engineer','Reporter','Editor','Runner'][i]}]))};
start(s,Date.now());advance(s,s.deadline);let data;
try{
 const context=await browser.newContext();await offlineDeadAir(context,r=>r.fulfill({json:data}));const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));fs.mkdirSync('output/dead-air',{recursive:true});
 for(const [width,height] of [[960,540],[1280,720]]){
  await page.setViewportSize({width,height});
  for(const scenario of ['signal','evidence','frequency','power','answer','final','ended']){
   s.phaseId++;s.startsAt=Date.now()-10000;s.deadline=Date.now()+15000;s.responses={};s.pausedAt=null;s.cleanBroadcast=false;
   if(['signal','evidence','frequency','power'].includes(scenario)){s.phase='challenge';s.challenge=puzzle(scenario,8,2)}
   else if(scenario==='answer'){s.phase='answer';s.results=Object.values(s.players).map((p,i)=>({name:p.name,ok:i!==1,points:i===1?0:145,note:i===1?'At risk in the next challenge':'Signal secure'}));}
   else if(scenario==='final'){s.phase='final';s.finalType='frequency';s.challenge=puzzle('frequency',8);Object.values(s.players).forEach((p,i)=>{p.progress=[10,10,8,7,6,4,2,0][i];p.score=2000-i*100})}
   else{s.phase='ended';s.deadline=0;Object.values(s.players).forEach((p,i)=>{p.progress=i<2?12:Math.max(0,10-i);p.score=i===1?3100:3000-i*100})}
   data=view(s,'',Date.now(),true);
   await page.goto(origin+'/new-build/dead-air.html?room=1234567890&layout='+width+'-'+scenario+'#display=test');await page.waitForFunction(phase=>document.body.dataset.phase===phase,s.phase);
   assert.equal(await page.locator('#cast .cast-member').count(),8);
   if(scenario==='answer'){assert.equal(await page.locator('#options .correct').count(),1);assert.equal(await page.locator('#options .correct').isVisible(),true)}
   if(['final','ended'].includes(scenario)){assert.equal(await page.locator('#cast .signal-meter').count(),8);assert.equal(await page.locator('#cast .signal-meter > i').count(),96)}
   if(scenario==='ended')assert.equal(await page.locator('#headline').textContent(),'Player 2 Long Lastname wins the broadcast.');
   const bounds=await page.evaluate(()=>({stage:document.querySelector('#stage').getBoundingClientRect().bottom,board:document.querySelector('#survival').getBoundingClientRect().bottom,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth}));
   const name=width+'x'+height+'-'+scenario;await page.screenshot({path:'output/dead-air/tv-eight-'+name+'.png',fullPage:true});
   if(bounds.overflow||bounds.stage>height+1||bounds.board>height+1)failures.push({scenario:name,...bounds});
  }
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[],'TV stages and all eight race positions must fit without scrolling');
 console.log('PASS offline eight-player TV at 960×540 and 1280×720: four challenges, visible correct trivia, finale tracks, score tie-break winner and viewport fit.');
}finally{await browser.close()}
