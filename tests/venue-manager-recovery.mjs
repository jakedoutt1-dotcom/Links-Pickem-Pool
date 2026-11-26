import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const page=await browser.newPage({viewport:{width:390,height:844}});
 let failRead=true,failAfterSave=true,posts=0,venue=null;
 await page.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.pathname.endsWith('/api/venue-manager')){
   if(request.method()==='POST'){
    posts++;venue={...request.postDataJSON(),id:'saved-venue'};failRead=failAfterSave;
    return route.fulfill({json:{ok:true,id:venue.id}});
   }
   if(failRead)return route.fulfill({status:503,json:{error:'Venue service is temporarily unavailable.'}});
   return route.fulfill({json:{account:{displayName:'Manager',email:'test@example.invalid'},venue}});
  }
  if(url.pathname.includes('/api/'))return route.fulfill({json:{}});
  const filename=path.join('public',url.pathname);
  try{return route.fulfill({body:await readFile(filename),contentType:({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css'}[path.extname(filename)]||'application/octet-stream')})}catch{return route.fulfill({status:404,body:''})}
 });
 await page.goto('https://venue.test/new-build/venue-manager.html');
 await page.getByText('Venue service is temporarily unavailable.',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Try loading my venue again'}).waitFor({timeout:2000});
 failRead=false;await page.getByRole('button',{name:'Try loading my venue again'}).click();
 await page.locator('#venueForm').waitFor({state:'visible'});
 for(const [name,value] of Object.entries({name:'Test Venue',address:'123 Test Street',latitude:'36.1',longitude:'-86.7',offer:'Tonight at LINKS'}))await page.locator(`[name=${name}]`).fill(value);
 await page.locator('[name=logo]').evaluate(input=>input.value='https://venue.test/logo.png');
 await page.locator('[name=agree]').check();
 await page.locator('#saveVenue').click();
 await page.getByText(/Your venue was saved, but we could not reload the saved details/).waitFor();
 assert.equal(await page.locator('[name=name]').inputValue(),'Test Venue','Failed reload preserves the submitted form');
 assert.equal(posts,1);
 failRead=false;await page.getByRole('button',{name:'Try loading my venue again'}).click();
 await page.getByText('Your venue is ready to manage.',{exact:true}).waitFor();
 assert.equal(posts,1,'Retry only reloads; it never republishes');
 assert.equal(await page.locator('#saveVenue').innerText(),'Save venue updates');
 failAfterSave=false;
 await page.locator('[name=active]').uncheck();
 await page.locator('#saveVenue').click();
 await page.getByText(/Saved. Your venue display is off/).waitFor();
 assert.equal(venue.active,false,'A paused venue is saved without claiming its promotions are visible');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 console.log('PASS venue recovery: initial read retry, saved-but-unconfirmed message, retained inputs, read-only retry and paused display confirmation.');
} finally {await browser.close()}
