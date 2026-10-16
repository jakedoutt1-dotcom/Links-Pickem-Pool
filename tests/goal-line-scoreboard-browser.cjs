const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
(async()=>{
 const {fixture}=await import('./helpers/pool-format-fixture.mjs'),{onRequest:board}=await import('../functions/new-build/api/party-scoreboard.js'),{onRequest:middleware}=await import('../functions/_middleware.js'),{ensureGoalScores}=await import('../functions/lib/goal-line-scoreboard.js');const {db}=fixture();
 await ensureGoalScores(db);await db.prepare('INSERT INTO links_goal_line_scores VALUES(?,?,?,?,?)').bind('saved-run','saved-player','Cowboy',28,Date.now()).run();
 const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async r=>{const url=r.request().url(),u=new URL(url);
 if(u.pathname.endsWith('/api/party-scoreboard')){const response=await board({request:new Request(url),env:{DB:db}});return r.fulfill({status:response.status,body:await response.text(),contentType:'application/json'})}
 if(/^\/new-build\/goal-line(?:\.html)?\/?$/.test(u.pathname)){const response=await middleware({request:new Request(url)});return r.fulfill({status:response.status,body:await response.text(),contentType:'text/html'})}
 const file=path.join(process.cwd(),'public',u.pathname);return fs.existsSync(file)&&fs.statSync(file).isFile()?r.fulfill({path:file}):r.fulfill({status:404,body:''})});
 await page.goto('https://test/new-build/goal-line.html');assert.equal(await page.locator('h1').textContent(),'Coming Soon');assert.equal(await page.locator('#field, #start').count(),0);
 await page.goto('https://test/new-build/party-scoreboard.html?game=goal-line');await page.waitForFunction(()=>document.getElementById('boardTitle').textContent==='Overall standings');
 await page.waitForFunction(()=>document.getElementById('game').options.length>1);assert.equal(new URL(page.url()).searchParams.has('game'),false);
 const options=await page.locator('#game option').allTextContents();assert(!options.some(x=>/Goal Line|Captain Clash|Say What/.test(x)));assert(options.includes('Two-Minute Drill'));assert(options.includes('Putt Club'));
 await page.locator('#game').selectOption('two-minute-drill');await page.waitForFunction(()=>document.getElementById('boardTitle').textContent==='Two-Minute Drill standings');assert.equal(await page.locator('#winsHead').isHidden(),true);
 await page.locator('#game').selectOption('all');await page.waitForFunction(()=>document.getElementById('boardTitle').textContent==='Overall standings');assert.equal(await page.locator('#rows tr').count(),0);assert.equal(await page.locator('#winsHead').isVisible(),true);
 assert.equal((await db.prepare('SELECT score FROM links_goal_line_scores WHERE run=?').bind('saved-run').first()).score,28,'Pausing does not delete saved scores');
 assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 console.log('PASS paused direct game link, old scoreboard bookmark recovery, active game filters, preserved scores and phone layout');
 }finally{await browser.close();db.raw.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
