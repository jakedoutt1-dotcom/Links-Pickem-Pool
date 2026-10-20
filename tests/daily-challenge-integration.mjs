import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,existsSync,mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/daily-challenge.js';
import {ensureAccounts,digest} from '../functions/lib/commissioner-account.js';
const require=createRequire(import.meta.url),{chromium}=require('playwright'),origin='https://daily-integration.test',root=resolve('public');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const width of [390,1280]){
 const {db}=fixture(),accountToken=crypto.randomUUID()+crypto.randomUUID();await ensureAccounts(db);
 await db.prepare('INSERT INTO links_account_sessions(token_hash,email,expires_at) VALUES(?,?,?)').bind(await digest(accountToken),'integration@example.com','2099-01-01').run();
 const page=await browser.newPage({viewport:{width,height:920}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(token=>localStorage.setItem('links-account-token',token),accountToken);
 await page.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url());if(url.origin!==origin)return route.abort();
  if(url.pathname.endsWith('/api/daily-challenge')){
   const response=await onRequest({request:new Request(url,{method:request.method(),headers:request.headers(),...(request.method()==='POST'?{body:request.postData()}:{} )}),env:{DB:db}});
   return route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});
  }
  if(url.pathname.includes('/api/'))return route.fulfill({json:{events:[],signedIn:false,pools:[]}});
  const file=resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root)||!existsSync(file))return route.fulfill({status:404,body:'Not found'});
  return route.fulfill({body:readFileSync(file),contentType:({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.png':'image/png'}[extname(file)]||'application/octet-stream')});
 });
 try{
  await page.goto(origin+'/new-build/daily-challenge.html');await page.locator('#start:visible').waitFor();await page.locator('#start').click();await page.locator('#spin:visible').waitFor();assert.equal(await page.locator('#next').isVisible(),false);mkdirSync('output/daily-challenge',{recursive:true});await page.locator('#challenge').screenshot({path:`output/daily-challenge/wheel-${width}.png`});await page.locator('#spin').click();await page.locator('#next:visible').waitFor();const spun=JSON.parse(db.raw.prepare('SELECT state FROM links_daily_attempts').get().state),maxScore=5*(100+spun.bonusPerCorrect);await page.reload();await page.locator('#next:visible').waitFor();assert.equal(JSON.parse(db.raw.prepare('SELECT state FROM links_daily_attempts').get().state).wheelIndex,spun.wheelIndex);assert.equal(await page.locator('#spin').isVisible(),false);await page.locator('#next:visible').click();await page.locator('#choices button').first().waitFor();
  const deck=JSON.parse(db.raw.prepare('SELECT state FROM links_daily_attempts').get().state).deck;
  await page.locator('#challenge').screenshot({path:`output/daily-challenge/question-active-${width}.png`});const before=JSON.parse(db.raw.prepare('SELECT state FROM links_daily_attempts').get().state);
  await page.reload();await page.locator('#choices button').first().waitFor();assert.equal(JSON.parse(db.raw.prepare('SELECT state FROM links_daily_attempts').get().state).deadline,before.deadline,'Reload never resets server timer');
  for(let i=0;i<5;i++){
   await page.waitForFunction(index=>document.querySelector('#counter').textContent===`QUESTION ${index+1} / 5`&&!document.querySelector('#submit').hidden,i);
   assert.equal(await page.locator('#difficultyBadge').innerText(),['Medium','Hard','Hard','Expert','Expert Final'][i]);if(i===4)assert.equal(await page.locator('#finalBoss').isVisible(),true);
   assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('question-active')),true);await page.locator('#choices button').nth(deck[i].answer).click();await page.locator('#submit').click();await page.locator('#feedback:visible').waitFor();assert.match(await page.locator('#feedback').innerText(),/Correct/);assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('question-active')),false);await page.locator('#next').click();
   if(i<4)await page.locator('#choices button').first().waitFor();
  }
  await page.locator('#finish:visible').waitFor();assert((await page.locator('#result').innerText()).includes(`${maxScore} / ${maxScore}`));assert.match(await page.locator('#badges').innerText(),/Perfect Five/);assert.equal(await page.locator('#streak').innerText(),'1');assert((await page.locator('#leaders').innerText()).includes(`${maxScore} pts`));
  const saved=db.raw.prepare('SELECT completed,score FROM links_daily_attempts').get();assert.equal(saved.completed,1);assert.equal(saved.score,maxScore);
  await page.reload();await page.locator('#finish:visible').waitFor();assert.equal(await page.locator('#start:visible').count(),0,'Completed round uses the explicit replay button');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  mkdirSync('output/daily-challenge',{recursive:true});await page.screenshot({path:`output/daily-challenge/complete-${width}.png`,fullPage:true});
  await page.locator('#replay:visible').click();await page.locator('#spin:visible').waitFor();assert.equal(await page.locator('#next').isVisible(),false);assert((await page.locator('#leaders').innerText()).includes(`${maxScore} pts`));assert.equal(await page.locator('#streak').innerText(),'1');await page.reload();await page.locator('#spin:visible').waitFor();await page.locator('#spin').click();await page.locator('#next:visible').waitFor();assert.equal(db.raw.prepare('SELECT completed,score FROM links_daily_attempts').get().score,maxScore);
  await page.goto(origin+'/new-build/index.html');await page.locator('#dailyChallenge').waitFor();assert.equal(await page.locator('#dailyChallenge .daily-promo__action').getAttribute('href'),'./daily-challenge.html');assert.equal(await page.locator('#dailyChallenge .daily-promo__board').getAttribute('href'),'./venue-leaderboard.html');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('#dailyChallenge').screenshot({path:`output/daily-challenge/home-${width}.png`});
  await page.goto(origin+'/new-build/game-room.html');await page.locator('.daily-card').waitFor();assert.equal(await page.locator('.daily-card a').getAttribute('href'),'./daily-challenge.html');assert.equal(await page.locator('#dailyChallenge').count(),1);
  assert.deepEqual(errors,[]);console.log('PASS real Daily Challenge API + browser '+width+'px: authenticated save, timer resume, five answers, final score, streak/ranking, no replay, homepage/Game Room entry');
 }finally{await page.close();db.raw.close()}
}}finally{await browser.close()}
