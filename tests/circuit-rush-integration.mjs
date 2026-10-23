import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {circuitRequest} from '../functions/new-build/api/circuit-rush.js';
import {ensureAccounts,digest} from '../functions/lib/commissioner-account.js';
import {createRun} from '../public/new-build/circuit-rush-engine.mjs';
import {createSolvedBoard} from './helpers/circuit-solution.mjs';
const require=createRequire(import.meta.url),{chromium}=require('playwright'),origin='https://circuit-integration.test',root=resolve('public');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const width of [390,1280]){
 const {db}=fixture(),token=crypto.randomUUID();await ensureAccounts(db);await db.prepare('INSERT INTO links_account_sessions(token_hash,email,expires_at) VALUES(?,?,?)').bind(await digest(token),'circuit-integration@example.com','2099-01-01').run();
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(t=>localStorage.setItem('links-account-token',t),token);
 await page.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!==origin)return route.abort();if(url.pathname.endsWith('/api/circuit-rush')){const req=route.request();const response=await circuitRequest({env:{DB:db},request:new Request(req.url(),{method:req.method(),headers:req.headers(),...(req.method()==='POST'?{body:req.postData()}:{})})});return route.fulfill({status:response.status,body:await response.text(),headers:Object.fromEntries(response.headers)})}const file=resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root)||!existsSync(file))return route.fulfill({status:404,body:''});return route.fulfill({body:readFileSync(file),contentType:({'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.svg':'image/svg+xml','.png':'image/png'})[extname(file)]||'application/octet-stream'})});
 try{
  await page.goto(origin+'/new-build/circuit-rush.html');await page.waitForFunction(()=>!document.querySelector('#start').disabled);await page.locator('#start').click();await page.locator('#board .tile').first().waitFor();assert.match(await page.locator('#runMode').innerText(),/VERIFIED DAILY/);const saved=db.raw.prepare('SELECT * FROM links_circuit_runs').get(),seed='daily:'+saved.day,run=createRun(seed);
  for(let level=0;level<6;level++){
   const solved=createSolvedBoard(seed,level+1);for(let i=0;i<solved.tiles.length;i++){if(run.boards[level].tiles[i].locked)continue;const turns=(solved.tiles[i].rotation-run.boards[level].tiles[i].rotation+4)%4;for(let t=0;t<turns;t++)await page.locator(`#board [data-index="${i}"]`).click()}
   await page.locator('#pulse').click();if(level<5)await page.locator('#nextBoard').click();
  }
  await page.waitForFunction(()=>document.querySelector('#saveStatus').textContent.includes('verified and saved'));assert.equal(db.raw.prepare('SELECT boards FROM links_circuit_scores').get().boards,6);assert.match(await page.locator('#leaderboard').innerText(),/Player/);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);const best=db.raw.prepare('SELECT score FROM links_circuit_scores').get().score;assert(best>6000&&best<9700);await page.locator('#again').click();await page.locator('#board .tile').first().waitFor();assert.notEqual(db.raw.prepare('SELECT id FROM links_circuit_runs').get().id,saved.id);assert.equal(db.raw.prepare('SELECT score FROM links_circuit_scores').get().score,best);assert.deepEqual(errors,[]);console.log('PASS Circuit Rush real API + browser '+width+'px: account auth, server run, six solved boards, event validation and verified save, replay, mobile fit.');
 }finally{await page.close();db.raw.close()}
}}finally{await browser.close()}
