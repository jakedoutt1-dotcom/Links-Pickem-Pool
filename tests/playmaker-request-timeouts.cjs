const assert=require('node:assert/strict');
const {readFileSync,existsSync}=require('node:fs');
const {resolve,extname}=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const root=resolve('public'),origin='https://links.test',browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 let stall='',postFailures=0,configCalls=0;
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{const timeout=AbortSignal.timeout.bind(AbortSignal);AbortSignal.timeout=ms=>timeout(ms===15000?700:ms)});
 await page.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.pathname.endsWith('/api/playmaker-public')){
   const action=url.searchParams.get('action');
   if(action==='ai'){postFailures++;stall='config';return route.fulfill({status:503,json:{success:false,error:'Fixture provider unavailable'}})}
   if(action==='config')configCalls++;
   if(action===stall){await new Promise(r=>setTimeout(r,2500));return route.fulfill({json:{}}).catch(()=>{})}
   return route.fulfill({json:action==='games'?{games:[{id:'tonight',name:'Away at Home',startTime:new Date(Date.now()+3600000).toISOString()}]}:{signedIn:true,aiConnected:true,testingPass:true,available:true,account:{id:'a'.repeat(64),email:'fixture@example.test'}}});
  }
  if(url.pathname.includes('/api/'))return route.fulfill({json:{events:[],logos:{},rooms:[],pools:[]}});
  if(url.origin!==origin)return route.abort();
  const file=resolve(root,'.'+url.pathname+(url.pathname.endsWith('/')?'index.html':''));
  if(!file.startsWith(root)||!existsSync(file))return route.fulfill({status:404});
  return route.fulfill({body:readFileSync(file),contentType:({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'})[extname(file)]||'application/octet-stream'});
 });
 try{
  await page.goto(origin+'/new-build/playmaker/');
  await page.waitForFunction(()=>document.querySelector('#build-game').value==='tonight'&&!document.querySelector('#analyze-button').disabled);
  stall='games';await page.locator('#reload-games').click();
  await page.waitForFunction(()=>document.querySelector('#build-game-status').textContent.includes('Could not load games'),{},{timeout:5000});
  assert.equal(await page.locator('#build-game').isDisabled(),false,'Custom game selector recovers after timeout');
  stall='';await page.locator('#reload-games').click();
  await page.waitForFunction(()=>document.querySelector('#build-game').value==='tonight'&&!document.querySelector('#analyze-button').disabled);
  stall='games';await page.locator('#auto-sport').selectOption('NFL');
  await page.waitForFunction(()=>document.querySelector('#auto-game-status').textContent.includes('Could not load games'),{},{timeout:5000});
  assert.equal(await page.locator('#auto-build-button').isDisabled(),false,'Automatic loading guard releases on timeout');
  stall='';await page.locator('#auto-reload-games').click();
  await page.waitForFunction(()=>document.querySelector('#auto-game').value==='tonight'&&!document.querySelector('#auto-build-button').disabled);
  await page.locator('#auto-build-button').click();
  await page.waitForFunction(()=>!document.querySelector('#auto-build-button').disabled,{},{timeout:5000});
  assert.match(await page.locator('#auto-results #analysis-status').innerText(),/Fixture provider unavailable/);
  assert.equal(postFailures,1,'Failed builds never automatically repeat paid AI requests');
  await page.reload();
  await page.waitForFunction(()=>document.querySelector('#analysis-status').textContent.includes('Unable to connect'),{},{timeout:5000});
  assert.equal(await page.locator('#card-loading').isVisible(),false,'Health timeout leaves no endless build spinner');
  await page.goto(origin+'/new-build/playmaker/account.html');
  await page.waitForFunction(()=>document.querySelector('#account-status').textContent.includes('took too long'),{},{timeout:5000});
  assert.match(await page.locator('#account-status').innerText(),/Reload to try again/);
  stall='';await page.reload();
  await page.waitForFunction(()=>document.querySelector('#account-status').textContent==='Your current balance.');
  assert.deepEqual(errors,[]);
  console.log('PASS Playmaker request deadlines: custom and automatic schedules, error allowance recheck, initial connection and account page recover; no duplicate AI request. Config calls: '+configCalls);
 }finally{await page.close();await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
