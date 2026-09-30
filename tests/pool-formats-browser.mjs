import {createRequire} from 'node:module';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
const require=createRequire(import.meta.url),{chromium}=require('playwright'),root=resolve('public'),origin='http://formats.test',output=process.env.FORMATS_SCREENSHOT_DIR;
if(output)mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{for(const width of [1280,390]){
 const fx=fixture(),context=await browser.newContext({viewport:{width,height:900}}),errors=[];
 await context.addInitScript(()=>{const role=localStorage.getItem('test-role')||'admin';localStorage.setItem('links-current-pool',JSON.stringify({id:1,code:'POOL',name:'Test pool'}));localStorage.setItem('links-player-id',role==='admin'?'Owner':'Alice');localStorage.setItem('links-legacy-token',role);localStorage.setItem('links-token',role);localStorage.setItem('links-remember','1')});
 await context.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.origin!==origin)return route.fulfill({json:{events:[]}});
  if(url.pathname.endsWith('/api/pool-format')){
   const token=(req.headers().authorization||'').replace('Bearer ',''),body=req.method()==='POST'?req.postDataJSON():null;
   try{const {status,...data}=await fx.call(url.searchParams.get('game'),url.searchParams.get('action'),body,token,Number(url.searchParams.get('week')));return route.fulfill({status,json:data})}catch(e){errors.push(e.stack);return route.fulfill({status:500,json:{error:e.message}})}
  }
  if(url.pathname.endsWith('/api/pool-games'))return route.fulfill({json:{games:[{key:'squares',name:'Squares'},{key:'props',name:'Props'},{key:'playoff',name:'Playoffs'}]}});
  if(url.pathname==='/api/session'){const admin=(req.headers().authorization||'').includes('admin');return route.fulfill({json:{role:admin?'admin':'player',poolCode:'POOL',name:admin?'Owner':'Alice',access:{adFree:true}}})}
  if(url.pathname.includes('/api/'))return route.fulfill({json:{}});
  try{return route.fulfill({body:readFileSync(resolve(root,'.'+url.pathname)),contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'}[extname(url.pathname)]||'application/octet-stream')})}catch{return route.fulfill({status:404,body:'Not found'})}
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 const go=async game=>{await page.goto(origin+'/new-build/'+game+'.html?pool=1');await page.getByText('Your pool is up to date.',{exact:true}).waitFor()};
 const saved=()=>page.getByText('Saved to your pool.',{exact:true}).waitFor();
 const role=async value=>page.evaluate(v=>localStorage.setItem('test-role',v),value);
 await go('squares');await page.getByRole('button',{name:'Commissioner',exact:true}).click();
 await page.getByRole('button',{name:'Load NFL games',exact:true}).click();await page.locator('#event option[value="one"]').waitFor({state:'attached'});
 await page.locator('#event').selectOption('one');await page.locator('#boardTitle').fill('Sunday Squares');await page.locator('#price').fill('10');
 await page.getByRole('button',{name:'Create board',exact:true}).click();await saved();
 await role('alice');await go('squares');assert.equal(await page.getByRole('button',{name:'Commissioner',exact:true}).count(),0);
 await page.locator('[data-square="12"]').click();await saved();await page.reload();await page.locator('[data-square="12"].mine').waitFor();
 if(output)await page.screenshot({path:resolve(output,'squares-'+width+'.png'),fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Grid scroll stays inside phone viewport');
 await role('admin');await go('squares');await page.getByRole('button',{name:'Commissioner',exact:true}).click();
 await page.locator('[data-paid="12"]').check();await saved();await page.getByRole('button',{name:'Draw and lock numbers',exact:true}).click();await saved();
 await page.getByRole('button',{name:'Board',exact:true}).click();assert.equal(await page.locator('[data-square]:enabled').count(),0);
 await page.getByRole('button',{name:'Winners',exact:true}).click();await page.getByRole('heading',{name:'Quarter winners',exact:true}).waitFor();
 await go('props');await page.getByRole('button',{name:'Commissioner',exact:true}).click();
 await page.locator('#propsDeadline').fill('2090-10-01T18:00');await page.locator('#questionsEditor input').fill('Will the first score be a touchdown?');await page.locator('#propsPoints').fill('3');
 await page.getByRole('button',{name:'Save setup',exact:true}).click();await saved();
 await role('alice');await go('props');await page.locator('[name="answer0"][value="Yes"]').check();await page.getByRole('button',{name:'Save answers',exact:true}).click();await saved();
 await page.reload();await page.locator('[name="answer0"]:checked').waitFor();assert.equal(await page.locator('[name="answer0"]:checked').inputValue(),'Yes');
 if(output)await page.screenshot({path:resolve(output,'props-'+width+'.png'),fullPage:true});
 const settings=JSON.parse(fx.db.raw.prepare("SELECT value FROM pool_settings WHERE key='game_settings_props'").get().value);settings.lockTime=settings.deadline='2020-01-01T00:00:00Z';fx.db.raw.prepare("UPDATE pool_settings SET value=? WHERE key='game_settings_props'").run(JSON.stringify(settings));
 await role('admin');await go('props');await page.getByRole('button',{name:'Commissioner',exact:true}).click();await page.locator('[name="official0"][value="Yes"]').check();await page.getByRole('button',{name:'Publish official answers',exact:true}).click();await saved();
 await page.getByRole('button',{name:'Standings',exact:true}).click();assert.match(await page.locator('tbody').textContent(),/Alice3FINAL/);
 await go('playoff');await page.getByRole('button',{name:'Commissioner',exact:true}).click();await page.locator('[name="divisionalPoints"]').fill('2');await page.getByRole('button',{name:'Save round scoring',exact:true}).click();await saved();
 await role('alice');await go('playoff');await page.locator('#playoffRound').selectOption('20');await page.getByRole('heading',{name:'Divisional',exact:true}).waitFor();await page.locator('[name="pick0"][value="BUF"]').check();await page.getByRole('button',{name:'Save round picks',exact:true}).click();await saved();
 if(output)await page.screenshot({path:resolve(output,'playoff-'+width+'.png'),fullPage:true});
 fx.runtime.slate=[{...fx.runtime.slate[0],kickoff:'2020-01-01',completed:true,winner:'BUF',awayScore:20,homeScore:10}];
 await page.getByRole('button',{name:'Refresh',exact:true}).click();await page.getByText('Your pool is up to date.',{exact:true}).waitFor();assert.equal(await page.locator('[name="pick0"]:enabled').count(),0);
 await page.getByRole('button',{name:'Standings',exact:true}).click();assert.match(await page.locator('tbody').textContent(),/Alice2FINAL/);
 await page.getByRole('link',{name:'Back to my pool',exact:true}).click();await page.locator('#topGameGrid a').first().waitFor();for(const g of ['squares','props','playoff'])assert.equal(await page.locator('#topGameGrid a[href*=\"'+g+'.html\"]').count(),1);
 assert.deepEqual(errors,[]);fx.db.raw.close();await context.close();console.log('PASS '+width+'px complete Squares, Props and Playoffs player/commissioner flows against database handlers');
 }}finally{await browser.close()}
