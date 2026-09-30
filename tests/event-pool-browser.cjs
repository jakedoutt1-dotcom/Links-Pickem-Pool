const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 for(const width of [390,1280]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://event.test/**',r=>{const u=new URL(r.request().url()),f=path.join('public',decodeURIComponent(u.pathname)+(u.pathname.endsWith('/event-pool-demo')?'.html':''));requests.push(u.pathname);return fs.existsSync(f)?r.fulfill({path:f,contentType:/\.(mjs|js)$/.test(f)?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.html')?'text/html':'image/png'}):r.fulfill({status:404,body:''})});
 for(const game of ['golf','nascar']){
 await page.goto('https://event.test/new-build/event-pool-demo?game='+game);
 await page.locator('.event-choice').first().waitFor();const baseline=await page.evaluate(()=>JSON.stringify([Object.entries(localStorage),Object.entries(sessionStorage)]));
 for(const mode of game==='golf'?['best','tiers','one']:['simple','fantasy']){
 await page.locator('#practiceFormat').selectOption(mode);
 const count=mode==='fantasy'?5:mode==='one'?1:game==='golf'?6:2;
 for(let i=0;i<count;i++)await page.locator('.event-choice').nth(i).click();
 if(mode==='fantasy')await page.locator('#garage').selectOption('Christopher Bell');
 await page.locator('#saveEvent').click();await page.getByText('Saved in this practice demo.',{exact:true}).waitFor();
 assert.match(await page.locator('#entryReview').innerText(),new RegExp(count+' / '+count));
 await page.locator('#practiceResults').click();await page.locator('#saveEvent:disabled').waitFor();
 await page.locator('[data-view=standings]').click();assert.ok(await page.getByText('Demo Player',{exact:true}).count());
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,game+' '+mode+' overflow');
 await page.locator('[data-view=rules]').click();assert.ok((await page.locator('#eventBody').innerText()).length>100);
 await page.locator('[data-view=picks]').click();await page.screenshot({path:require('os').tmpdir()+'/links-event-'+game+'-'+mode+'-'+width+'.png',fullPage:true});
 await page.locator('#practiceReset').click();
 assert.equal(await page.evaluate(()=>JSON.stringify([Object.entries(localStorage),Object.entries(sessionStorage)])),baseline);
 }
 }
 assert.deepEqual(errors,[]);assert.ok(!requests.some(p=>p.includes('/api/')));await page.close();
 }
 console.log('PASS five event formats at mobile/desktop, save/results/rules/reset, no pool API or storage writes');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
