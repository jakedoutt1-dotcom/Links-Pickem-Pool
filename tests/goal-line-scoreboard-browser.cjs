const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
(async()=>{
 const {fixture}=await import('./helpers/pool-format-fixture.mjs'),{onRequest:save}=await import('../functions/new-build/api/goal-line-score.js'),{onRequest:board}=await import('../functions/new-build/api/party-scoreboard.js');const {db}=fixture();
 const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async r=>{const url=r.request().url(),u=new URL(url);if(u.pathname.includes('/api/')){
 const req=new Request(url,{method:r.request().method(),headers:{Origin:u.origin},...(r.request().method()==='POST'?{body:r.request().postData()}:{})});
 const response=await (u.pathname.endsWith('goal-line-score')?save:board)({request:req,env:{DB:db}});return r.fulfill({status:response.status,body:await response.text(),contentType:'application/json'});
 }const file=path.join(process.cwd(),'public',u.pathname);return fs.existsSync(file)?r.fulfill({path:file}):r.fulfill({status:404,body:''})});
 await page.goto('https://test/new-build/goal-line.html');
 for(let i=0;i<4;i++){await page.locator('#start').tap();await page.waitForFunction(()=>!document.getElementById('overlay').hidden)}
 assert.equal(await page.locator('#headline').textContent(),'Final whistle');await page.locator('#scoreName').fill('Cowboy');await page.locator('#saveScore').tap();await page.waitForFunction(()=>document.getElementById('saveStatus').textContent.startsWith('Saved!'));
 await page.goto('https://test/new-build/party-scoreboard.html?game=goal-line');await page.waitForFunction(()=>document.getElementById('game').value==='goal-line');
 assert.match(await page.locator('#rows').textContent(),/Cowboy/);assert.equal(await page.locator('#winsHead').isHidden(),true);
 const options=await page.locator('#game option').allTextContents();assert(options.includes('Goal Line'));assert(!options.some(x=>/Captain Clash|Say What/.test(x)));
 await page.locator('#game').selectOption('all');await page.waitForFunction(()=>document.getElementById('boardTitle').textContent==='Overall standings');assert.equal(await page.locator('#rows tr').count(),0);assert.equal(await page.locator('#winsHead').isVisible(),true);
 assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 console.log('PASS phone finished run, actual replay upload, public score display, game filter, no solo wins, layout and no JS errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
