import {createRequire} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=createRequire(import.meta.url)('playwright'),root=resolve('public'),origin='https://trends.test';
const browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const width of [320,390,1280]){
 let offline=false;const errors=[],page=await browser.newPage({viewport:{width,height:900}});page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('links-current-pool',JSON.stringify({id:1,code:'POOL'}));localStorage.setItem('links-legacy-token','alice')});
 await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin!==origin)return route.abort();
  if(u.pathname.endsWith('/api/season-standings'))return route.fulfill(offline?{status:503,json:{error:'Results could not refresh.'}}:{json:{player:'Alice',failedWeeks:[],history:[{period:'01',label:'Week 1',complete:true,winners:['Bob'],rows:[{player:'Alice',wins:1,losses:1},{player:'Bob',wins:2,losses:0}]},{period:'02',label:'Week 2',complete:true,winners:['Alice'],rows:[{player:'Alice',wins:2,losses:0},{player:'Bob',wins:0,losses:2}]}]}});
  if(u.pathname.includes('/api/'))return route.fulfill({json:{poolCode:'POOL',role:'player'}});const f=resolve(root,'.'+decodeURIComponent(u.pathname));if(existsSync(f))return route.fulfill({body:readFileSync(f),contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png'}[extname(f)]||'application/octet-stream')});return route.fulfill({status:404,body:''});
 });
 await page.goto(origin+'/new-build/trends.html?pool=1');await page.getByText("Alice's Trends",{exact:true}).waitFor();assert.equal(await page.locator('.trend-charts svg').count(),2);assert.match(await page.locator('.trend-stats').innerText(),/75.0%/);assert.match(await page.locator('.trend-stats').innerText(),/Week 2/);assert.equal(await page.locator('.trend-table tbody tr').count(),2);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 offline=true;await page.locator('#refreshTrends').click();await page.getByText(/Results could not refresh/).waitFor();assert.equal(await page.locator('.trend-table tbody tr').count(),2,'A failed refresh retains prior results');assert.deepEqual(errors,[]);await page.close();console.log('PASS My Trends '+width+'px charts, exact table, mobile fit, shared navigation and outage retention');
}}finally{await browser.close()}
