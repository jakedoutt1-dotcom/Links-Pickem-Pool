import {createRequire} from 'node:module';
import {readFileSync,mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {fantasyFixture} from './helpers/fantasy-fixture.mjs';
const require=createRequire(import.meta.url),{chromium}=require('playwright'),root=resolve('public'),origin='http://fantasy.test',output=process.env.FANTASY_SCREENSHOT_DIR;
if(output)mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{for(const width of [1280,390]){
 const fx=fantasyFixture();await fx.setup('fantasy');await fx.setup('dynasty');
 const context=await browser.newContext({viewport:{width,height:950}}),errors=[];
 await context.addInitScript(()=>{const role=localStorage.getItem('test-role')||'admin';localStorage.setItem('links-current-pool',JSON.stringify({id:1,code:'POOL',name:'Test pool'}));localStorage.setItem('links-player-id',role==='admin'?'Owner':'Alice');localStorage.setItem('links-legacy-token',role);localStorage.setItem('links-token',role);localStorage.setItem('links-remember','1')});
 await context.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.origin!==origin)return route.fulfill({json:{events:[]}});
  if(url.pathname.endsWith('/api/fantasy')){
   const token=(req.headers().authorization||'').replace('Bearer ',''),body=req.method()==='POST'?req.postDataJSON():null;
   try{const {status,...data}=await fx.call(url.searchParams.get('game'),url.searchParams.get('action'),body,token);return route.fulfill({status,json:data})}catch(e){errors.push(e.stack);return route.fulfill({status:500,json:{error:e.message}})}
  }
  if(url.pathname.endsWith('/api/pool-games'))return route.fulfill({json:{games:[{key:'fantasy',name:'Fantasy'},{key:'dynasty',name:'Dynasty'}]}});
  if(url.pathname==='/api/session'){const admin=(req.headers().authorization||'').includes('admin');return route.fulfill({json:{role:admin?'admin':'player',poolCode:'POOL',name:admin?'Owner':'Alice',access:{adFree:true}}})}
  if(url.pathname.includes('/api/'))return route.fulfill({json:{}});
  try{return route.fulfill({body:readFileSync(resolve(root,'.'+url.pathname)),contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'}[extname(url.pathname)]||'application/octet-stream')})}catch{return route.fulfill({status:404,body:'Not found'})}
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.addLocatorHandler(page.locator('dialog.links-guide[open]'),async()=>{await page.getByRole('button',{name:'Got it',exact:true}).click()});
 const go=async game=>{await page.goto(origin+'/new-build/'+game+'.html?pool=1');await page.getByText('League saved across your devices.',{exact:true}).waitFor()};
 const saved=async()=>{await page.getByText('Saved to your league.',{exact:true}).waitFor();while(await page.locator('details.admin-task:not([open]) > summary').count())await page.locator('details.admin-task:not([open]) > summary').first().click()};
 const role=async v=>page.evaluate(v=>localStorage.setItem('test-role',v),v);
 await go('fantasy');
 for(const game of ['fantasy','dynasty']){
  fx.runtime.now=Date.parse('2026-09-01T00:00:00Z');fx.runtime.final=false;
  await role('admin');await go(game);await page.getByRole('button',{name:'ADMIN',exact:true}).click();while(await page.locator('details.admin-task:not([open]) > summary').count())await page.locator('details.admin-task:not([open]) > summary').first().click();
  await page.getByRole('button',{name:'Open draft',exact:true}).click();await saved();await page.getByRole('button',{name:'Draft',exact:true}).click();
  for(const id of ['p1','p2','p3','p4','p5','p6']){await page.locator('[data-pick="'+id+'"]').click();await saved()}
  await page.getByText('Draft complete',{exact:true}).waitFor();
  await page.getByRole('button',{name:'ADMIN',exact:true}).click();while(await page.locator('details.admin-task:not([open]) > summary').count())await page.locator('details.admin-task:not([open]) > summary').first().click();await page.getByRole('button',{name:'Start season',exact:true}).click();await saved();
  await page.getByRole('button',{name:'Refresh NFL schedule',exact:true}).click();await saved();
  await role('alice');await go(game);assert.equal(await page.getByRole('button',{name:'ADMIN',exact:true}).count(),0);
  await page.locator('[id="QB-1"]').selectOption('p1');await page.locator('[id="RB-1"]').selectOption('p4');await page.getByRole('button',{name:'Save lineup',exact:true}).click();await saved();
  await page.reload();await page.getByText('League saved across your devices.',{exact:true}).waitFor();assert.equal(await page.locator('[id="QB-1"]').inputValue(),'p1');
  if(output)await page.screenshot({path:resolve(output,game+'-roster-'+width+'.png'),fullPage:true});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No phone page overflow');
  await page.getByRole('button',{name:'Players',exact:true}).click();await page.locator('#search').fill('Test Player 11');
  await page.getByRole('button',{name:'Add',exact:true}).click();await page.locator('#drop').selectOption('p5');await page.getByRole('button',{name:'Add player',exact:true}).click();await saved();
  await page.getByRole('button',{name:'Trades',exact:true}).click();await page.locator('#give').selectOption('p11');await page.locator('#receive').selectOption('p6');await page.getByRole('button',{name:'Send offer',exact:true}).click();await saved();
  await role('bob');await go(game);await page.getByRole('button',{name:'Trades',exact:true}).click();await page.getByRole('button',{name:'Accept',exact:true}).click();await saved();
  await role('admin');await go(game);await page.getByRole('button',{name:'Trades',exact:true}).click();await page.getByRole('button',{name:'Approve',exact:true}).click();await saved();
  fx.runtime.now=Date.parse(fx.runtime.kickoff)+1000;fx.runtime.final=true;
  await page.getByRole('button',{name:'ADMIN',exact:true}).click();while(await page.locator('details.admin-task:not([open]) > summary').count())await page.locator('details.admin-task:not([open]) > summary').first().click();
  for(const id of ['p1','p4']){await page.locator('#stats #player').selectOption(id);await page.locator('#points').fill('15.5');await page.locator('#reason').fill('Verified official box score');await page.getByRole('button',{name:'Save verified score',exact:true}).click();await saved();}
  await page.getByRole('button',{name:'Finalize scores',exact:true}).click();await saved();
  await page.getByRole('button',{name:'Advance week',exact:true}).click();await saved();
  await page.getByRole('button',{name:'League',exact:true}).click();await page.getByRole('heading',{name:'Standings',exact:true}).waitFor();
  if(output)await page.screenshot({path:resolve(output,game+'-standings-'+width+'.png'),fullPage:true});
 }
 assert.deepEqual(errors,[]);console.log('Fantasy and Dynasty browser flows passed at '+width+'px');await context.close();
}}finally{await browser.close()}
