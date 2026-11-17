const {chromium}=require('playwright'),fs=require('fs'),assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
for(const width of [390,1440]){
const page=await browser.newPage({viewport:{width,height:844}});
await page.route('https://links.test/**',r=>{const path=new URL(r.request().url()).pathname;return r.fulfill({contentType:path.endsWith('.js')?'text/javascript':'text/html',body:path.endsWith('site-navigation.js')?fs.readFileSync('public/new-build/site-navigation.js','utf8'):path.endsWith('.js')?'':`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><script src="/new-build/site-navigation.js" defer></script><main><a href="./control-center.html">← My Locker Room</a><a href="./game-room.html">My Game Room</a><a href="./control-center.html"><img alt="">MY POOLS →</a><a href="./links-login.html">Sign in</a></main>`})});
for(const name of ['confidence','nfl','football-trivia','trivia-night','trivia-night-preview','game-room','million-point','links-admin','control-center']){
await page.goto('https://links.test/new-build/'+name+'.html');
await page.locator('#linksSiteNavigation').waitFor();
const locker=name==='control-center';
assert.equal(await page.locator('#linksSiteNavigation a').count(),2);
assert.equal(await page.getByRole('link',{name:'Back to Locker Room'}).count(),locker?0:1);
if(!locker)assert.equal(await page.getByRole('link',{name:'Back to Locker Room'}).getAttribute('href'),'/new-build/control-center.html');
assert.equal(await page.locator('main a:visible').count(),locker?4:1);
await page.evaluate(()=>{const a=document.createElement('a');a.href='./control-center.html';a.textContent='Back to Locker Room';document.body.append(a)});
if(!locker)await page.waitForFunction(()=>document.querySelector('body > a').hidden);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
}
await page.close();console.log('PASS Back to Locker Room is visible off the Locker Room page at '+width);
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
