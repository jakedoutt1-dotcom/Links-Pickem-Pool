import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,existsSync,statSync,mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
const require=createRequire(import.meta.url),{chromium}=require('playwright'),root=resolve('public'),out='output/venue-promotion-refresh';
mkdirSync(out,{recursive:true});
const admin=readFileSync(resolve(root,'new-build/links-admin.html'),'utf8');
for(const slug of ['01-Pools-and-Games','02-Season-Pools','03-Game-Room']){
 for(const suffix of ['-4x6.pdf','-300dpi.png']){assert(admin.includes(`/partner-kit/table-flyers/${slug}${suffix}`));assert(statSync(resolve(root,`partner-kit/table-flyers/${slug}${suffix}`)).size>1000)}
}
assert(admin.includes('venue-partners.html'));assert(!admin.includes('Sample print materials include earlier pricing'));
const browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const width of [320,390,1440]){
 const page=await browser.newPage({viewport:{width,height:950},reducedMotion:'reduce'}),errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.pathname.includes('/api/'))return route.fulfill({status:401,json:{error:'Sign in'}});const file=resolve(root,'.'+decodeURIComponent(u.pathname)+(u.pathname.endsWith('/')?'index.html':''));if(!file.startsWith(root)||!existsSync(file)){missing.push(u.pathname);return route.fulfill({status:404,body:''})}return route.fulfill({body:readFileSync(file),contentType:({'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf'}[extname(file)]||'application/octet-stream')})});
 await page.goto('https://venue.test/new-build/venue-partners.html');
 await page.locator('[data-venue-signup-qr] svg').waitFor();
 assert.equal(await page.locator('.flyer-card').count(),3);assert.equal(await page.locator('#flyers a[download]').count(),7);
 assert.match(await page.locator('#venue-setup').innerText(),/You upload your own logo and control what your venue ad displays/);
 for(const img of await page.locator('img').all())await img.evaluate(el=>{el.loading='eager';return el.decode()});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Promotion fits '+width);
 await page.screenshot({path:`${out}/hero-${width}.png`});
 if(width===390||width===1440)await page.locator('#flyers').screenshot({path:`${out}/flyers-${width}.png`});
 for(const link of await page.locator('a[href]').all()){
  const href=await link.getAttribute('href');if(!href||href.startsWith('#')||/^(mailto|sms|tel|blob):/.test(href))continue;
  const url=new URL(href,page.url());if(url.hostname!=='venue.test')continue;
  assert(existsSync(resolve(root,'.'+decodeURIComponent(url.pathname)+(url.pathname.endsWith('/')?'index.html':''))),href);
 }
 await page.getByRole('link',{name:'Venue signup / Sign in'}).first().click();await page.waitForURL('**/venue-manager.html');
 await page.getByRole('link',{name:'Create venue account'}).waitFor();assert(await page.getByRole('link',{name:'Sign in',exact:true}).isVisible());
 await page.goto('https://venue.test/partner-kit/table-flyers/');assert.equal(await page.locator('a[download]').count(),7);
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);await page.close();
 console.log(`PASS venue promotion ${width}px: images decoded, no overflow, current lineup, seven print/image downloads, valid links, signup route and QR, admin flyer links.`);
}}finally{await browser.close()}
