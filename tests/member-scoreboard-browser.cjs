const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const {fixture}=await import('./helpers/pool-format-fixture.mjs');
 const {ensureIdentity}=await import('../functions/lib/player-identity.js');
 const {digest}=await import('../functions/lib/commissioner-account.js');
 const {ensureScoreboard}=await import('../functions/lib/party-scoreboard.js');
 const {onRequest}=await import('../functions/new-build/api/party-scoreboard.js');
 const {db}=fixture();await ensureIdentity(db);await ensureScoreboard(db);
 const cookie='browser-member-secret';
 await db.prepare('INSERT INTO links_id_accounts(id,username,email,display_name,salt,password_hash,created_at) VALUES(?,?,?,?,?,?,?)').bind('member','testmember','private@example.com','Test Member','salt','hash','2026').run();
 await db.prepare('INSERT INTO links_id_sessions VALUES(?,?,?)').bind(await digest(cookie),'member',Date.now()+600000).run();
 const seats=[{room:'ABCDEF1234',token:'a'.repeat(72)},{room:'ABCDEF5678',token:'b'.repeat(72)}];
 for(const seat of seats){const key=await digest(seat.token);await db.prepare('INSERT INTO links_party_results(game,room,round,seat,score,win,finished) VALUES(?,?,?,?,?,?,?)').bind('trivia-rally',seat.room,1,key,1200,1,Date.now()).run();await db.prepare('INSERT INTO links_party_guest_names(game,room,round,seat,name) VALUES(?,?,?,?,?)').bind('trivia-rally',seat.room,1,key,'Guest Player').run();}
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844}});await context.addCookies([{name:'__Host-links_identity',value:cookie,url:'https://test',secure:true,httpOnly:true,sameSite:'Lax'}]);
  await context.addInitScript(seats=>{for(const s of seats)localStorage.setItem('links-rally-seat-'+s.room,s.token)},seats);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{const req=route.request(),url=new URL(req.url());if(url.pathname.endsWith('/api/party-scoreboard')){const response=await onRequest({request:new Request(url,{method:req.method(),headers:await req.allHeaders(),...(req.method()==='POST'?{body:req.postData()}:{})}),env:{DB:db}});return route.fulfill({status:response.status,contentType:'application/json',body:await response.text()});}const file=path.join('public',url.pathname);return fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404,body:''});});
  await page.goto('https://test/new-build/party-scoreboard.html');
  await page.getByLabel('Your public leaderboard name').fill('Cowboy');
  await page.getByRole('button',{name:'Save name and connect my scores'}).click();
  await page.waitForFunction(()=>document.querySelector('#rows').textContent.includes('Cowboy · You'));
  assert.equal(await page.locator('#rows tr').count(),1);assert.match(await page.locator('#rows').textContent(),/Cowboy/);
  await page.reload();await page.waitForFunction(()=>document.querySelector('#rows').textContent.includes('Cowboy · You'));
  assert.equal(await page.locator('#rows tr').count(),1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert(!await page.locator('body').textContent().then(t=>t.includes('private@example.com')));assert.deepEqual(errors,[]);
  console.log('PASS cookie-only first profile setup, two-room ownership aggregation, reload, no email disclosure and mobile fit');
 }finally{await browser.close();db.raw.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
