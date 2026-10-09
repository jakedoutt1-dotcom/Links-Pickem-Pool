const {chromium}=require('playwright'),fs=require('fs'),assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
for(const width of [390,1440]){
const page=await browser.newPage({viewport:{width,height:844}});
await page.route('https://links.test/**',r=>{const path=new URL(r.request().url()).pathname;return r.fulfill({contentType:path.endsWith('.js')?'text/javascript':'text/html',body:path.endsWith('site-navigation.js')?fs.readFileSync('public/new-build/site-navigation.js','utf8'):path.endsWith('.js')?'':`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><script src="/new-build/site-navigation.js" defer></script><main><a href="./control-center.html">← My Locker Room</a><a href="./game-room.html">My Game Room</a><a href="./control-center.html"><img alt="">MY POOLS →</a><a href="./links-login.html">Sign in</a></main>`})});
for(const name of ['nfl','football-trivia','trivia-night','trivia-night-preview','game-room','million-point','links-admin','control-center']){
await page.goto('https://links.test/new-build/'+name+'.html');
await page.locator('#linksSiteNavigation').waitFor();
const locker=name==='control-center';
assert.equal(await page.locator('#linksSiteNavigation a').count(),locker?2:1);
assert.equal(await page.locator('main a:visible').count(),locker?4:1);
await page.evaluate(()=>{const a=document.createElement('a');a.href='./control-center.html';a.textContent='Back to Locker Room';document.body.append(a)});
if(!locker)await page.waitForFunction(()=>document.querySelector('body > a').hidden);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
}
await page.close();console.log('PASS room shortcuts limited to locker room at '+width);
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
