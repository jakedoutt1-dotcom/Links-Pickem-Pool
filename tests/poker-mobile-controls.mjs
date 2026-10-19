import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createRequire} from 'node:module';
import {DatabaseSync} from 'node:sqlite';
import {onRequest} from '../functions/new-build/api/poker-night.js';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
class DB {
 constructor(){this.raw=new DatabaseSync(':memory:');this.queue=Promise.resolve();}
 prepare(sql){let args=[];const db=this.raw;return {bind(...values){args=values;return this;},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){const result=db.prepare(sql).run(...args);return {meta:{changes:Number(result.changes)}};}};}
 batch(stmts){const job=this.queue.then(async()=>{this.raw.exec('BEGIN');try{const results=[];for(const stmt of stmts)results.push(await stmt.run());this.raw.exec('COMMIT');return results;}catch(error){this.raw.exec('ROLLBACK');throw error;}});this.queue=job.catch(()=>{});return job;}
}
const db=new DB(),root=path.resolve(fileURLToPath(new URL('../public/',import.meta.url))),out='output/poker-mobile-review',errors=[],missing=[];
const mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://'+req.headers.host);
  if(url.pathname==='/new-build/api/poker-night'){
   const chunks=[];for await(const chunk of req)chunks.push(chunk);
   const response=await onRequest({request:new Request(url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})}),env:{DB:db}});
   res.writeHead(response.status,Object.fromEntries(response.headers));return res.end(Buffer.from(await response.arrayBuffer()));
  }
  if(url.pathname.includes('/api/')){res.writeHead(401,{'Content-Type':'application/json'});return res.end('{"error":"Local browser check has no account or venue."}');}
  const filename=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!filename.startsWith(root+path.sep))throw Error('Not found');
  const body=await readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream'});res.end(body);
 }catch(error){missing.push(req.url);res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'msedge',headless:true});
async function context(width,height=900){const c=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});await c.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());const page=await c.newPage();page.on('pageerror',e=>errors.push(e.message));return page;}
async function api(body,session={},query={}){
 const response=await fetch(origin+'/new-build/api/poker-night'+(!body?'?'+new URLSearchParams(query):''),{method:body?'POST':'GET',headers:{Origin:origin,'Content-Type':'application/json','x-poker-token':session.playerToken||'','x-poker-host':session.hostToken||''},...(body?{body:JSON.stringify({requestId:crypto.randomUUID(),...body})}:{})});
 const value=await response.json();assert.equal(response.status,200,JSON.stringify(value));return value;
}
async function fits(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No horizontal scrolling at '+(await page.viewportSize()).width);}
try{
 await mkdir(out,{recursive:true});
 for(const [width,height] of [[390,844],[375,667],[320,568],[844,390],[1280,800]]){
  const host=await api({action:'create',name:'Alex',mode:'friends',settings:{tableSize:9,startingChips:5000,turnSeconds:60}}),code=host.room.code,sessions=[host.session];
  for(let i=1;i<9;i++)sessions.push((await api({action:'join',code,name:'Player '+i})).session);
  const started=await api({action:'start',code},host.session),actor=sessions.find(s=>s.playerId===started.room.table.actorId);
  const page=await context(width,height),posts=[];
  page.on('request',request=>{if(request.method()==='POST'&&request.url().includes('/api/poker-night'))posts.push(request.postDataJSON());});
  await page.addInitScript(({code,actor})=>localStorage.setItem('links-poker-session-'+code,JSON.stringify(actor)),{code,actor});
  await page.goto(origin+'/new-build/poker-night.html?room='+code);
  await page.locator('#bettingControls').waitFor({state:'visible'});await fits(page);
  assert.equal(await page.locator('#turnProgress').isVisible(),true,'Active turn has a visible countdown bar');
  assert.match(await page.locator('#turnClock').getAttribute('aria-label'),/seconds to act/,'Clock announces whose turn it is');
  const inViewport=async selector=>page.locator(selector).evaluate(el=>{const r=el.getBoundingClientRect();return r.x>=0&&r.right<=innerWidth+1&&r.y>=0&&r.bottom<=innerHeight+1;});
  if(width<=600)assert.equal(await inViewport('#bettingControls'),true,'Phone turn dock fits '+width);
  assert.ok((await page.locator('#callButton').boundingBox()).height>=44,'Thumb-sized action');
  await page.locator('#raiseOpen').click();await page.locator('#raiseExact').waitFor({state:'visible'});
  const own=(await api(null,actor,{code})).room.table,min=own.legalActions.minRaiseTo;
  await page.locator('#raiseExact').fill('');assert.equal(await page.locator('#raiseButton').isDisabled(),true);
  await page.locator('#raiseExact').fill('1');assert.equal(await page.locator('#raiseButton').isDisabled(),true);
  const amount=min+17;await page.locator('#raiseExact').fill(String(amount));await page.waitForResponse(r=>r.url().includes('/api/poker-night?')&&r.request().method()==='GET');
  assert.equal(await page.locator('#raiseExact').inputValue(),String(amount),'Exact edit survives polling');
  assert.equal(await page.locator('#raiseButton').isEnabled(),true);
  assert.match(await page.locator('#raiseSummary').textContent(),new RegExp(`Adds ${amount.toLocaleString()} chips`),'Raise explains the additional commitment');
  if(width===390){await page.locator('#raiseOpen').click();await page.locator('#raiseOpen').click();assert.equal(await page.locator('#raiseExact').inputValue(),await page.locator('#raiseAmount').inputValue(),'Reopening raise cannot display a different submitted amount');assert.equal(Number(await page.locator('#raiseExact').inputValue()),min);await page.locator('#raiseExact').fill(String(amount));}
  assert.equal(posts.filter(p=>p.action==='bet').length,0,'Editing/presets do not place a bet');
  await page.locator('[data-bet=all]').click();await page.locator('#raiseButton').click();await page.locator('#confirmDialog').waitFor({state:'visible'});
  assert.equal(posts.filter(p=>p.action==='bet').length,0,'All-in waits for confirmation');await page.locator('#confirmNo').click();
  await page.locator('#raiseExact').fill(String(amount));await page.locator('#raiseExact').blur();
  if(width<=600)assert.equal(await inViewport('#raiseButton'),true,'Raise submit stays reachable');
  await page.screenshot({path:out+`/controls-${width}.png`});
  const response=page.waitForResponse(r=>r.url().includes('/api/poker-night')&&r.request().method()==='POST');await page.locator('#raiseButton').click();assert.equal((await response).status(),200);
  assert.equal(posts.filter(p=>p.action==='bet').length,1);assert.equal(posts.find(p=>p.action==='bet').amount,amount);
  await page.locator('#recentActionPanel summary').click();
  await page.waitForFunction(()=>document.querySelector('#recentActions').textContent.includes('raises to'));
  assert.match(await page.locator('#recentActions').textContent(),new RegExp(`raises to ${amount.toLocaleString()}`),'Action list shows the submitted total, not just added chips');
  await page.context().close();
  const next=(await api(null,actor,{code})).room.table;const waiting=sessions.find(s=>s.playerId!==next.actorId);
  const waitPage=await context(width,height);await waitPage.addInitScript(({code,waiting})=>localStorage.setItem('links-poker-session-'+code,JSON.stringify(waiting)),{code,waiting});
  await waitPage.goto(origin+'/new-build/poker-night.html?room='+code);
  // Choose a stable non-actor seat after the raise.
  const latest=(await api(null,waiting,{code})).room;
  if(latest.table.actorId!==waiting.playerId){await waitPage.locator('#preselectControls').waitFor({state:'visible'});if(width<=600){const r=await waitPage.locator('#preselectControls').boundingBox();assert.ok(r.y>=0&&r.y+r.height<=height+1,'Waiting dock fits phone');const bottom=await waitPage.locator('#seats .seat').evaluateAll(nodes=>Math.max(...nodes.map(n=>n.getBoundingClientRect().bottom)));assert.ok(bottom<=r.y+2,'All seats clear the waiting dock at '+width+'px: '+bottom+' / '+r.y);}await fits(waitPage);if(width<=600){assert.equal(await waitPage.locator('#preselectHand .card:not(.back)').count(),2);await waitPage.locator('#preHideCards').click();assert.equal(await waitPage.locator('#preselectHand .back').count(),2);await waitPage.locator('#preHideCards').click();}await waitPage.screenshot({path:out+`/waiting-${width}.png`});}
  await waitPage.context().close();
 }

 // A failed bet must refresh the table, not repeat a chip action automatically.
 const recoveryHost=await api({action:'create',name:'Recovery',mode:'friends',settings:{tableSize:6,startingChips:5000,turnSeconds:60}}),recoveryCode=recoveryHost.room.code;
 const recoveryGuest=await api({action:'join',code:recoveryCode,name:'Guest'}),recoveryStart=await api({action:'start',code:recoveryCode},recoveryHost.session);
 const recoverySession=[recoveryHost.session,recoveryGuest.session].find(s=>s.playerId===recoveryStart.room.table.actorId),recoveryPage=await context(390,844);
 await recoveryPage.addInitScript(({code,seat})=>localStorage.setItem('links-poker-session-'+code,JSON.stringify(seat)),{code:recoveryCode,seat:recoverySession});
 await recoveryPage.goto(origin+'/new-build/poker-night.html?room='+recoveryCode);await recoveryPage.locator('#callButton').waitFor({state:'visible'});
 let intercepted=0,releaseFailure,requestArrived;const arrived=new Promise(resolve=>requestArrived=resolve);
 await recoveryPage.route('**/api/poker-night',async route=>{const body=route.request().method()==='POST'?route.request().postDataJSON():null;if(body?.action==='bet'&&intercepted++===0){await new Promise(resolve=>{releaseFailure=resolve;requestArrived();});return route.fulfill({status:503,json:{error:'Temporary connection problem.'}});}return route.continue();});
 const beforeRecovery=(await api(null,recoverySession,{code:recoveryCode})).room.table.turnId;
 await recoveryPage.locator('#callButton').click();await arrived;
 await recoveryPage.locator('#exitButton').click();assert.equal(await recoveryPage.locator('#confirmDialog').evaluate(el=>el.open),false);assert.equal(await recoveryPage.locator('#room').isVisible(),true);assert.match(await recoveryPage.locator('#notice').textContent(),/wait/i,'Pending move explains why leaving waits');
 releaseFailure();await recoveryPage.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Back at the table'));
 assert.equal(intercepted,1,'Rejected move is not automatically resent');
 assert.equal((await api(null,recoverySession,{code:recoveryCode})).room.table.turnId,beforeRecovery);
 assert.equal(await recoveryPage.locator('#callButton').isEnabled(),true,'Fresh state enables another deliberate move');
 let failReads=true;
 await recoveryPage.route('**/api/poker-night?*',route=>failReads?route.fulfill({status:503,json:{error:'Connection lost.'}}):route.continue());
 await recoveryPage.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Betting is paused'));
 assert.equal(await recoveryPage.locator('#bettingControls').isVisible(),false,'A failed poll hides stale chip actions');
 assert.equal(await recoveryPage.locator('#preselectControls').isVisible(),false,'A failed poll hides queued-action controls');
 failReads=false;
 await recoveryPage.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Back at the table'));
 assert.equal(await recoveryPage.locator('#callButton').isEnabled(),true,'Fresh poll restores intentional actions');
 assert.equal(intercepted,1,'Reconnect never sends a bet');
 await recoveryPage.context().close();
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log('PASS mobile controls: 320/375/390 portrait,844 landscape,1280 desktop; exact entry,invalid amounts,polling,explicit all-in and one submitted raise.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));db.raw.close();}
