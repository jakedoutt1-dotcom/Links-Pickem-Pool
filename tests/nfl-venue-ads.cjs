const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const root=path.resolve('public'),pages=['nfl','nfl-scores','nfl-standings','compare-picks','pick-tools','year-standings','results','my-picks'];
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 for(const width of [320,1280]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[],venueRequests=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('links-current-pool',JSON.stringify({id:'one',code:'POOL'}));localStorage.setItem('links-player-id','Pat');localStorage.setItem('links-token','private-session');localStorage.setItem('saved-picks','KEEP');window.geoCalls=0;Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition(ok){window.geoCalls++;ok({coords:{latitude:36.1,longitude:-86.7,accuracy:5}})}}});Object.defineProperty(navigator,'permissions',{value:{query:async()=>({state:'granted'})}})});
  await page.route('**/*',route=>{const req=route.request(),u=new URL(req.url());
   if(u.pathname.endsWith('/api/partners')){venueRequests.push({url:req.url(),headers:req.headers()});return route.fulfill({json:{partners:[{id:'bar',name:'LINKS Test Venue',offer:'Tonight: wings and trivia.',logo:'/links-small-logo.png',website:'https://example.com',latitude:36.1,longitude:-86.7,radius:75}]}})}
   if(u.pathname.includes('/api/'))return route.fulfill({json:{}});
   const file=path.resolve(root,'.'+decodeURIComponent(u.pathname));if(!file.startsWith(root)||!fs.existsSync(file))return route.fulfill({status:404});
   const ext=path.extname(file);let body=fs.readFileSync(file);
   // Keep actual page structure/styles, isolate the shared banner from scores/providers.
   if(ext==='.html')body=body.toString().replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')+`<script src="/new-build/shell.js"></script>${u.pathname.endsWith('/year-standings.html')?'<script type="module" src="/new-build/pool-venue-banner.mjs?v=nfl-pages1"></script>':''}`;
   return route.fulfill({body,contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'}[ext]||'application/octet-stream')});
  });
  for(const name of pages){
   await page.goto('https://venue.test/new-build/'+name+'.html?pool=one');
   await page.getByRole('heading',{name:'LINKS Test Venue',exact:true}).waitFor();
   assert.equal(await page.locator('#linksPartnerBanner').count(),1,name+' has exactly one venue ad');
   assert.equal(await page.locator('main > #linksPartnerBanner').count(),1,'Banner stays in page flow');
   assert.equal(await page.getByText('Tonight: wings and trivia.',{exact:true}).count(),1);
   assert.equal(await page.getByRole('link',{name:'Visit website'}).getAttribute('href'),'https://example.com');
   const bounds=await page.locator('#linksPartnerBanner').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=width+1,name+' ad fits '+width);
   assert.equal(await page.evaluate(()=>localStorage.getItem('saved-picks')),'KEEP');
   assert.equal(await page.evaluate(()=>localStorage.getItem('links-token')),'private-session');
   // A late legacy entry mount cannot create a second banner.
   await page.evaluate(async()=>{const m=await import('/new-build/partner-banner.mjs?v=venue-self-service2');m.mountPartners(document.querySelector('main'))});
   assert.equal(await page.locator('#linksPartnerBanner').count(),1);
  }
  assert(venueRequests.length>=pages.length);for(const r of venueRequests){assert(!r.headers.authorization);assert(!r.url.includes('latitude'));assert(!r.url.includes('longitude'));}
  await page.getByRole('button',{name:'Turn off location ads'}).click();
  await page.goto('https://venue.test/new-build/nfl-scores.html?pool=one');
  await page.getByRole('button',{name:'Show partners near me'}).waitFor();assert.equal(await page.evaluate(()=>geoCalls),0,'Opt-out persists across NFL pages');
  assert.equal(await page.getByRole('heading',{name:'LINKS Test Venue',exact:true}).count(),0);
  await page.goto('https://venue.test/new-build/nfl.html?demo=1');assert.equal(await page.locator('#linksPartnerBanner').count(),0,'No venue ad in practice demo');
  assert.deepEqual(errors,[]);await page.close();console.log('PASS NFL venue ads '+width+'px: all eight pages, one in-flow ad, logo/offer/link, unchanged picks/session, local-only GPS, opt-out and demo exclusion.');
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
