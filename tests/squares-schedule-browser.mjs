import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {resolve,extname} from 'node:path';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright'),root=resolve('public');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const width of [390,1280]){
 const page=await browser.newPage({viewport:{width,height:850}}),errors=[],posts=[];let mode='error',late,reads=0;
 const game=(id,week)=>({id,away:'BUF',home:'NYJ',awayName:'Bills',homeName:'Jets',kickoff:'2090-10-01T18:00:00Z',completed:false});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());
  if(u.hostname==='site.web.api.espn.com')return route.fulfill({json:{week:{number:12},season:{type:2}}});
  if(u.pathname.endsWith('/api/pool-format')){
   if(req.method()==='POST'){posts.push(req.postDataJSON());return route.fulfill({json:{success:true}})}
   if(u.searchParams.get('action')==='schedule'){
    reads++;const week=u.searchParams.get('week');if(mode==='error')return route.fulfill({status:503,json:{error:'Schedule temporarily unavailable.'}});
    if(week==='2')return new Promise(resolve=>{late=async()=>{await route.fulfill({json:{games:[game('old')]}});resolve()}});
    if(week==='4')return route.fulfill({json:{games:[{...game('past'),kickoff:'2020-01-01T00:00:00Z',completed:true}]}});
    return route.fulfill({json:{games:[game(week==='3'?'latest':'one')]}});
   }
   return route.fulfill({json:{active:true,role:'admin',boards:[],players:[],viewer:'Owner'}});
  }
  if(u.pathname==='/new-build/squares.html')return route.fulfill({contentType:'text/html',body:`<meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./pool-formats.css"><body data-game="squares"><main style="max-width:1000px;margin:auto"><button id="formatRefresh">Refresh</button><p id="formatMessage"></p><nav id="formatNav"></nav><div id="formatContent"></div></main><script>window.LINKS_API_FETCH=fetch</script><script type="module" src="./pool-formats.mjs"></script>`});
  const file=resolve(root,'.'+u.pathname);try{return route.fulfill({body:readFileSync(file),contentType:({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css'}[extname(file)]||'application/octet-stream')})}catch{return route.fulfill({status:404})}
 });
 await page.goto('https://squares.test/new-build/squares.html?pool=1');await page.getByRole('button',{name:'ADMIN',exact:true}).click();
 await page.locator('#scheduleStatus').filter({hasText:'Tap Try again'}).waitFor();assert.equal(reads,1,'Opening setup automatically requests games');assert.equal(await page.locator('#scheduleWeek').inputValue(),'12','New board starts on the active NFL week');assert(await page.locator('#event').isDisabled());assert(await page.getByRole('button',{name:'Create board',exact:true}).isDisabled());
 await page.locator('#boardTitle').fill('My board');await page.locator('#price').fill('12.50');mode='healthy';await page.getByRole('button',{name:'Try again',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#event').value==='one');
 assert.equal(await page.locator('#boardTitle').inputValue(),'My board');assert.equal(await page.locator('#price').inputValue(),'12.50');
 await page.locator('#scheduleWeek').selectOption('2');await page.waitForFunction(()=>document.querySelector('#event').disabled);await page.locator('#scheduleWeek').selectOption('3');await page.waitForFunction(()=>document.querySelector('#event').value==='latest');await late();
 assert.equal(await page.locator('#event').inputValue(),'latest','Late response cannot replace selected week');assert.equal(await page.locator('#price').inputValue(),'12.50');
 await page.getByRole('button',{name:'Create board',exact:true}).click();await page.getByText('Saved to your pool.',{exact:true}).waitFor();assert.equal(posts[0].eventId,'latest');assert.equal(posts[0].week,3);assert.equal(posts[0].title,'My board');assert.equal(posts[0].price,12.5);
 await page.locator('#scheduleWeek').selectOption('4');await page.locator('#scheduleStatus').filter({hasText:'No upcoming games'}).waitFor();assert(await page.getByRole('button',{name:'Create board',exact:true}).isDisabled());
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);await page.close();console.log('PASS Squares schedule '+width+'px: automatic load, inline retry, single-game selection, preserved form, latest week wins, matching create request, empty-week guard.');
}}finally{await browser.close()}
