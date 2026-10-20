const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{for(const width of [390,1280]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];let active=false;
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname!=='pricing.test')return route.abort();if(u.pathname.includes('/api/')){
 if(u.pathname.endsWith('/party-pack')){const b=route.request().method()==='POST'?route.request().postDataJSON():null;if(b?.action==='activate'){active=true;return route.fulfill({json:{ok:true,expires_at:'2099-01-01'}})}return route.fulfill({json:{email:'buyer@example.com',freeTesting:false,checkoutReady:true,venueDayReady:true,venueReady:true,venueAccess:null,access:active?{expires_at:'2099-01-01'}:null,purchases:[{id:'day',plan:'day',status:'PAID',expires_at:active?'2099-01-01':null}]}})}
 if(u.pathname.endsWith('/game-room'))return route.fulfill({json:{signedIn:false}});return route.fulfill({status:401,json:{error:'No session'}});}
 const f=path.resolve('public','.'+decodeURIComponent(u.pathname));return fs.existsSync(f)?route.fulfill({path:f,contentType:/\.m?js$/.test(f)?'text/javascript':f.endsWith('.css')?'text/css':undefined}):route.fulfill({status:404,body:''});});
 const fit=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Fits '+width);
 await page.goto('https://pricing.test/new-build/index.html');await page.locator('#poolPackages').waitFor();assert.equal(await page.locator('#poolPackages .pricing-card').count(),4);await fit();
 await page.goto('https://pricing.test/new-build/game-room.html');await page.locator('#gamePasses').waitFor();assert.match(await page.locator('#gamePasses').innerText(),/One player pays/i);assert.match(await page.locator('#gamePasses').innerText(),/up to 90/i);await fit();
 fs.mkdirSync('output/pricing-review',{recursive:true});await page.locator('#gamePasses').screenshot({path:`output/pricing-review/game-passes-${width}.png`});
 await page.goto('https://pricing.test/new-build/party-pack.html');await page.getByRole('button',{name:'Activate my 24 hours'}).waitFor();assert.equal(await page.locator('#buyDay').isDisabled(),true);await page.getByRole('button',{name:'Activate my 24 hours'}).click();await page.waitForFunction(()=>document.querySelector('#accessText').textContent.includes('Active until'));await fit();
 await page.goto('https://pricing.test/new-build/trivia-host-pass.html?game=poker');await page.locator('#dayBuy:enabled').waitFor();assert.match(await page.locator('main').innerText(),/up to 90 players/);assert.match(await page.locator('main').innerText(),/29.99/);await fit();
 assert.deepEqual(errors,[]);await page.close();
 }console.log('PASS pricing pages: phone/desktop layouts, four pool packages, per-game limits, one-payer/free-guests explanations, activation and shared hosted-event pricing.');}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
