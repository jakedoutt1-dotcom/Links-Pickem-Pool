import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {start,puzzle,view} from '../functions/lib/dead-air.js';
import {offlineDeadAir,origin} from './helpers/dead-air-browser-fixture.mjs';

const require=createRequire(import.meta.url),{chromium}=require('playwright'),browser=await chromium.launch({channel:'msedge',headless:true});
const room='A1B2C3D4E5',key='links-dead-air-'+room,errors=[];
try{
 const s={code:room,flowVersion:2,game:1,mode:'friends',owner:'seat',displayKey:'private-tv-key',players:{seat:{name:'Host',avatar:'Engineer'}}};start(s,Date.now());
 Object.assign(s,{phase:'challenge',phaseId:8,startsAt:Date.now(),deadline:Date.now()+60000,challenge:puzzle('relay',1),responses:{}});
 let data=view(s,'seat',Date.now()),mode='online',held=[],joins=0;
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await offlineDeadAir(context,async route=>{
  if(route.request().method()==='POST'){
   const body=route.request().postDataJSON();
   if(body.action==='pause'){data={...data,paused:true,pausedAt:Date.now()};return route.fulfill({json:data})}
   if(body.action==='join'){joins++;return route.fulfill({json:{...data,token:'new-seat-token'}})}
   return route.fulfill({status:409,json:{error:'Unexpected test action'}});
  }
  if(mode==='hold')return new Promise(resolve=>held.push({route,resolve}));
  return route.fulfill({json:data});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(({key})=>localStorage.setItem(key,'old-seat-token'),{key});
 await page.goto(origin+'/new-build/dead-air.html?room='+room);await page.waitForFunction(()=>document.body.dataset.phase==='challenge');
 mode='hold';
 async function nextHeld(){const until=Date.now()+8000;while(!held.length&&Date.now()<until)await new Promise(resolve=>setTimeout(resolve,25));assert.ok(held.length,'Expected next room poll');return held.shift()}
 async function deny(pending){await pending.route.fulfill({status:401,json:{error:'Join this room first.'}});pending.resolve()}

 // A slow old poll may fail after a newer action has already refreshed the room.
 const stale=await nextHeld();await page.locator('#pauseGame').click();await page.waitForFunction(()=>document.body.dataset.paused==='true');await page.locator('#tvButton').click();await deny(stale);
 const current=await nextHeld();assert.equal(await page.locator('#room').isVisible(),true);assert.equal(await page.locator('#tv').evaluate(dialog=>dialog.open),true);assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),'old-seat-token');assert.equal(await page.locator('#message').textContent(),'');

 // Only the current 401 revokes the local UI. Rejoining remains an explicit action.
 await deny(current);await page.waitForSelector('#joinForm:visible');assert.equal(await page.locator('#room').isVisible(),false);assert.equal(await page.locator('#tv').evaluate(dialog=>dialog.open),false);assert.equal(await page.locator('#tvLink').getAttribute('href'),null);
 assert.equal(await page.locator('#code').inputValue(),room);assert.equal(await page.locator('#joinName').inputValue(),'Host');assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),null);assert.equal(await page.locator('body').getAttribute('data-phase'),null);assert.equal(await page.locator('#narrationCaption').textContent(),'');assert.equal(joins,0);

 // Identical state still renders after recovery: render/phase caches must be fresh.
 mode='online';await page.locator('#joinForm button').click();await page.waitForSelector('#room:visible');assert.equal(await page.locator('#joinForm').isVisible(),false);assert.equal(await page.locator('#relay .relay-cell').count(),16);assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),'new-seat-token');assert.equal(joins,1);assert.deepEqual(errors,[]);
 console.log('PASS offline Dead Air revoked-seat recovery: stale401 ignored, current401 resets scene/audio/dialog/credentials, room/name retained, explicit rejoin and identical-state rerender.');
}finally{await browser.close()}
