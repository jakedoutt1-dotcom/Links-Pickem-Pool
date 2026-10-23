import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,existsSync,mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createRun,rotateBoard,evaluateBoard} from '../public/new-build/circuit-rush-engine.mjs';
import {createSolvedBoard} from './helpers/circuit-solution.mjs';
const require=createRequire(import.meta.url),{chromium}=require('playwright'),origin='https://circuit.test',root=resolve('public');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const width of [320,390,1280]){
 const page=await browser.newPage({viewport:{width,height:920},reducedMotion:width===320?'reduce':'no-preference'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!==origin)return route.abort();
  if(u.pathname.endsWith('/api/circuit-rush'))return route.fulfill({json:{signedIn:false,day:'2026-10-20',seed:'daily:2026-10-20',serverNow:'2026-10-20T17:00:00Z',period:'today',venues:[],leaderboard:[]}});
  if(u.pathname.includes('/api/'))return route.fulfill({json:{signedIn:false,pools:[],rooms:[],events:[]}});
  const f=resolve(root,'.'+decodeURIComponent(u.pathname));if(!f.startsWith(root)||!existsSync(f))return route.fulfill({status:404,body:''});
  return route.fulfill({body:readFileSync(f),contentType:({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'}[extname(f)]||'application/octet-stream')});
 });
 try{
  await page.goto(origin+'/new-build/index.html');await page.locator('.home-destinations').waitFor();assert.equal(await page.locator('.home-destinations a[href="./game-room.html"]').count(),1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Homepage fits '+width);
  await page.goto(origin+'/new-build/game-room.html');await page.locator('.circuit-rush-card').waitFor();assert.equal(await page.locator('.circuit-rush-card a').getAttribute('href'),'./circuit-rush.html');await page.locator('.circuit-rush-card').scrollIntoViewIfNeeded();await page.locator('.circuit-rush-card img').evaluate(img=>img.decode());assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Game Room fits '+width);
  mkdirSync('output/circuit-rush',{recursive:true});await page.locator('.circuit-rush-card').screenshot({path:`output/circuit-rush/card-${width}.png`});
  const seed='qa-circuit-'+width;await page.goto(origin+'/new-build/circuit-rush.html?seed='+seed);await page.locator('#start:visible').waitFor();assert.equal(await page.locator('#board .tile').count(),0,'No timed board before explicit start');await page.locator('#start').click();await page.locator('#board .tile').first().waitFor();
  assert((await page.locator('#seedLabel').innerText()).includes(seed));let boards=createRun(seed).boards;const timerBefore=Number(await page.locator('#timer').innerText());assert(timerBefore>170&&timerBefore<=210);assert.equal(await page.locator('#board .tile').count(),25);
  await page.locator('#pulse').click();assert(Number(await page.locator('#timer').innerText())<=timerBefore-3,'Broken pulse deducts at least three seconds');assert.equal(await page.locator('#nextBoard').isVisible(),false);
  await page.evaluate(()=>{window.nodeBonusCount=0;new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1&&n.matches('.node-time-bonus')){window.nodeBonusCount++;if(n.textContent!=='+10 sec')throw Error('Wrong bonus label')}}).observe(document.querySelector('.board-frame'),{childList:true})});
  let board=boards[0],first=board.tiles.findIndex(t=>!t.locked);await page.waitForFunction(i=>!document.querySelector(`.tile[data-index="${i}"]`).disabled,first);await page.locator(`.tile[data-index="${first}"]`).focus();await page.locator(`.tile[data-index="${first}"]`).press('Enter');await page.waitForFunction(()=>document.querySelector('#moves').textContent==='1 turns');board=rotateBoard(board,first);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Playing board fits '+width);
  if(width===320)assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
  await page.locator('#game').screenshot({path:`output/circuit-rush/game-${width}.png`});
  for(let level=1;level<=3;level++){
   if(level>1)board=boards[level-1];const solved=createSolvedBoard(seed,level);assert.equal(await page.locator('#board .tile').count(),board.size**2);
   for(let i=0;i<board.tiles.length;i++){if(board.tiles[i].locked)continue;const turns=(solved.tiles[i].rotation-board.tiles[i].rotation+4)%4;for(let n=0;n<turns;n++)await page.locator(`.tile[data-index="${i}"]`).click();board=rotateBoard(board,i,turns)}
   assert.equal(evaluateBoard(board).won,true,'Fixture solution valid');await page.locator('#pulse').click();if(level<3){await page.locator('#nextBoard:visible').waitFor();await page.locator('#nextBoard').click()}else await page.locator('#finish:visible').waitFor();
  }
  assert.equal(await page.evaluate(()=>window.nodeBonusCount),9,'Each of nine nodes floats its bonus exactly once');assert.match(await page.locator('#result').innerText(),/3/);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Results fit '+width);
  await page.evaluate(()=>navigator.share=()=>Promise.reject(Object.assign(new Error(),{name:'AbortError'})));await page.locator('#share').click();assert.equal(await page.locator('#shareStatus').innerText(),'');
  await page.evaluate(()=>navigator.share=()=>Promise.resolve());await page.locator('#share').click();assert.match(await page.locator('#shareStatus').innerText(),/shared/i);
  await page.locator('#finish').screenshot({path:`output/circuit-rush/result-${width}.png`});if(width===390){await page.locator('#newRun').click();await page.locator('#game:visible').waitFor();assert.match(await page.locator('#runMode').innerText(),/QUICK PLAY/);assert(!(await page.locator('#seedLabel').innerText()).endsWith(seed));await page.evaluate(()=>{const future=Date.now()+331000;Date.now=()=>future});await page.locator('#finish:visible').waitFor();assert.match(await page.locator('#result').innerText(),/0\/3/);assert.match(await page.locator('#resultScore').innerText(),/^0 POINTS$/)}assert.deepEqual(errors,[]);console.log('PASS Circuit Rush '+width+'px: home/Game Room entry, decoded card, explicit timer, keyboard rotate, failed-pulse penalty, three real solved boards, results, share cancel/retry, fit and reduced motion.');
 }finally{await page.close()}
}}finally{await browser.close()}
