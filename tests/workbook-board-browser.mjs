import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {DatabaseSync} from 'node:sqlite';
import path from 'node:path';
import {onRequest} from '../functions/new-build/api/workbook-board.js';
const realFetch=globalThis.fetch;globalThis.fetch=(url,options)=>String(url).includes('site.api.espn.com')?Promise.resolve(new Response('',{status:503})):realFetch(url,options);
const require=createRequire(import.meta.url),{chromium}=require('playwright'),raw=new DatabaseSync(':memory:');
const db={prepare(sql){let args=[];return {bind(...a){args=a;return this;},async run(){return raw.prepare(sql).run(...args);},async first(){return raw.prepare(sql).get(...args)||null;}};}};
const publicRoot=path.resolve('public'),mime={'.html':'text/html','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json'};
const env={DB:db,ASSETS:{async fetch(r){return new Response(await readFile(path.join(publicRoot,new URL(r.url).pathname)));}}};
const server=createServer(async(req,res)=>{try{const url=new URL(req.url,'http://'+req.headers.host);if(url.pathname==='/new-build/api/workbook-board'){const response=await onRequest({request:new Request(url),env});res.writeHead(response.status,Object.fromEntries(response.headers));return res.end(Buffer.from(await response.arrayBuffer()));}const filename=path.resolve(publicRoot,'.'+decodeURIComponent(url.pathname));if(!filename.startsWith(publicRoot+path.sep))throw Error('Not found');const bytes=await readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream'});res.end(bytes);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'msedge',headless:true}),errors=[];
try{await mkdir('output/workbook-web-sync/previews',{recursive:true});for(const width of [390,1280]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
 await page.goto(origin+'/new-build/barnes-pool-results.html?week=1');await page.locator('#content').waitFor({state:'visible'});
 assert.equal(await page.locator('#title').textContent(),'Barnes Pool Results');assert.equal(await page.locator('#week option').count(),22);
 assert.equal(await page.locator('#picks th img').count(),0,'Matchup column stays text-only');assert.ok(await page.locator('#picks td img').count()>0,'Team logos belong to player picks');if(width===390)assert.ok((await page.locator('#picks thead th').first().boundingBox()).width<=132,'Compact matchup column');
 assert.equal(await page.locator('.leader').count(),14);assert.ok(await page.locator('td.correct').count()>0);assert.ok(await page.locator('td.incorrect').count()>0);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Board fits '+width);
 await page.screenshot({path:'output/workbook-web-sync/previews/board-'+width+'.png',fullPage:true});
 await page.locator('#week').selectOption('6');assert.match(await page.locator('#summary').textContent(),/Standings in progress/);assert.equal(await page.locator('.leader.winner').count(),0);
 await page.locator('#player').selectOption({index:1});assert.equal(await page.locator('#picks thead th').count(),2);
 await page.locator('#refresh').click();await page.reload();await page.locator('#content').waitFor({state:'visible'});assert.equal(await page.locator('#week').inputValue(),'6');
 await page.goto(origin+'/new-build/index.html');assert.equal(await page.locator('#barnesPoolResults').getAttribute('href'),'./barnes-pool-results.html');
 await page.close();
 }
 const livePage=await browser.newPage({viewport:{width:390,height:900}});livePage.on('pageerror',e=>errors.push(e.message));
 const live={title:'Barnes Pool Results',season:2026,updatedAt:'2026-10-19T12:00:00Z',scores:{status:'live',checkedAt:'2026-10-19T13:00:00Z',week:1},weeks:[{number:1,label:'Week 1',finalTotal:null,games:[{away:'Patriots',home:'Seahawks',winner:'',awayScore:10,homeScore:7}],players:[{name:'Alex',picks:['Patriots'],tie:44},{name:'Sam',picks:['Seahawks'],tie:40}]}]};
 await livePage.route('**/api/workbook-board*',r=>r.fulfill({json:live}));
 await livePage.goto(origin+'/new-build/barnes-pool-results.html?week=1');await livePage.locator('#content').waitFor({state:'visible'});assert.equal(await livePage.locator('td.correct').count(),0);
 Object.assign(live.weeks[0].games[0],{winner:'Patriots',awayScore:24,homeScore:20});live.weeks[0].finalTotal=44;
 await livePage.locator('#refresh').click();await livePage.waitForFunction(()=>document.querySelector('td.correct'));
 assert.equal(await livePage.locator('td.correct').count(),1);assert.equal(await livePage.locator('td.incorrect').count(),1);assert.equal(await livePage.locator('tfoot .weekly-winner').textContent(),'WINNER');assert.match(await livePage.locator('.leader.winner').textContent(),/Alex/);
 // A stalled request must release Refresh without erasing already displayed results.
 await livePage.evaluate(()=>{
  window.savedBoardFetch=window.fetch;window.savedBoardTimeout=AbortSignal.timeout;
  window.fetch=(url,options)=>String(url).includes('/api/workbook-board')?new Promise((resolve,reject)=>{options?.signal?.addEventListener('abort',()=>reject(options.signal.reason),{once:true});}):window.savedBoardFetch(url,options);
  AbortSignal.timeout=()=>window.savedBoardTimeout(30);
 });
 await livePage.locator('#refresh').click();await livePage.getByText(/The weekly board is taking too long/).waitFor();
 assert.equal(await livePage.locator('#refresh').isEnabled(),true);
 assert.equal(await livePage.locator('td.correct').count(),1,'Last confirmed results survive a timeout');
 await livePage.evaluate(()=>{window.fetch=window.savedBoardFetch;AbortSignal.timeout=window.savedBoardTimeout;});
 await livePage.locator('#refresh').click();await livePage.waitForFunction(()=>document.querySelector('#notice').textContent==='');
 await livePage.close();
 assert.deepEqual(errors,[]);console.log('PASS Barnes public board: real 22-week/14-player data, results colors, pending standings, player filter, shareable week URL, homepage button and phone/desktop layouts.');
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));raw.close();}
