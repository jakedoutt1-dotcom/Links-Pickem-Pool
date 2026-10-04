import {createRequire} from 'node:module';
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
const {chromium}=createRequire(import.meta.url)('playwright'),browser=await chromium.launch({channel:'msedge',headless:true}),errors=[];
fs.mkdirSync('output/party-pack',{recursive:true});
try{for(const width of [390,1440]){
 const p=await browser.newPage({viewport:{width,height:900}});p.on('pageerror',e=>errors.push(e.message));let signed=false,paid=false,enabled=true;const requests=[];
 await p.route('https://party.local/**',async route=>{const r=route.request(),u=new URL(r.url());if(u.pathname.includes('/api/')){
  const b=r.postDataJSON();requests.push(b);let data={};if(u.pathname.endsWith('/account')){if(b.action==='send-code')data={email:b.email};else{signed=true;data={token:'mock'}}}
  else if(b?.action==='checkout')data={url:'https://party.local/new-build/party-room.html?purchase=paid'};
  else if(b?.action==='capture'){paid=true;data={ok:true}}
  else if(b?.action==='logout'){signed=false;data={ok:true}}
  else data={enabled,checkoutReady:enabled,email:signed?'host@example.com':null,access:paid?{plan:'day',expires_at:'2099-01-01'}:null,purchases:[],venueReady:false};
  return route.fulfill({json:data});
 }const f=path.join('public',u.pathname);return fs.existsSync(f)?route.fulfill({path:f,contentType:/\.(mjs|js)$/.test(f)?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.html')?'text/html':'image/png'}):route.fulfill({status:404,body:''});});
 await p.goto('https://party.local/new-build/party-room.html#passes');await p.locator('[data-plan="day"]:enabled').waitFor();
 assert.equal(await p.locator('.party-game-grid a[href="./trivia-night.html"]').count(),0);assert.equal(await p.locator('#hosted .price').innerText(),'$29.99 / month');
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await p.locator('#passes').screenshot({path:'output/party-pack/pricing-'+width+'.png'});
 await p.locator('[data-plan="day"]').click();await p.locator('#email').fill('host@example.com');await p.locator('#emailForm button').click();await p.locator('#code').fill('12345678');await p.locator('#codeForm button').click();await p.getByText('Email verified. Choose your pass again to continue to PayPal.').waitFor();
 await p.locator('[data-plan="day"]').click();await p.waitForFunction(()=>document.getElementById('accessText').textContent.includes('Party Pack active'));assert(requests.some(x=>x?.action==='capture'));assert(await p.locator('[data-plan="annual"]').isDisabled());
 await p.locator('#demoNext').click();await p.locator('#demoAnswers button').nth(1).click();await p.locator('#demoNext').click();await p.locator('#demoAnswers button').nth(1).click();await p.locator('#demoNext').click();await p.locator('#demoAnswers button').nth(0).click();assert((await p.locator('#demoResult').innerText()).includes('3 of 3'));
 await p.locator('#hosted').screenshot({path:'output/party-pack/hosted-'+width+'.png'});
 enabled=false;await p.reload();await p.getByText('Free preview is open. Paid Party Pack checkout is not live yet.').waitFor();assert(await p.locator('[data-plan="day"]').isDisabled());
 await p.close();
 }assert.deepEqual(errors,[]);console.log('PASS phone/desktop layout, separate venue pricing, email checkout return, active access, free demo and launch-off state.');
}finally{await browser.close()}
