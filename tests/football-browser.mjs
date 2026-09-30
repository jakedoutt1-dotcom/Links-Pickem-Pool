import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require('playwright'),root=resolve('public'),origin='http://football.test';
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{for(const width of [1280,390]){
 const context=await browser.newContext({viewport:{width,height:900}});let saved=[],revision='',errors=[];
 await context.addInitScript(()=>{localStorage.setItem('links-current-pool',JSON.stringify({id:1,code:'POOL',name:'Test'}));localStorage.setItem('links-player-id','Alice');localStorage.setItem('links-legacy-token','alice');localStorage.setItem('links-remember','1')});
 const game={id:'a',date:'2090-10-01T00:00:00Z',state:'pre',completed:false,teams:[{id:'1',name:'Bills',score:0},{id:'2',name:'Dolphins',score:0}]};
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url()),path=url.pathname;
  if(url.origin!==origin)return route.fulfill({json:{events:[]}});
  if(path==='/api/session')return route.fulfill({json:{role:'player',name:'Alice',poolCode:'POOL',access:{adFree:true}}});
  if(path.endsWith('/api/football')){
   assert.equal(route.request().headers().authorization,'Bearer alice');
   if(route.request().method()==='POST'){const b=route.request().postDataJSON();saved=b.picks;revision='saved';return route.fulfill({json:{success:true,picks:saved,revision}})}
   return route.fulfill({json:{success:true,game:url.searchParams.get('game'),season:2026,week:1,period:'2026-2-1',games:[game],picks:saved,revision,active:true,used:[],rules:{lives:1,tieSurvives:false},state:{status:'ALIVE',losses:0,history:[{week:1,team:'Bills',result:'PENDING'}]},standings:[{rank:1,player:'Alice',score:0,max:1,seasonScore:0,status:'ALIVE',wins:0,losses:0}]}})
  }
  if(path.endsWith('/api/game33'))return route.fulfill({json:url.searchParams.get('action')==='default-week'?{week:1}:{week:1,viewerTeam:'BUF',drawLocked:true,assignments:[{player:'Alice',team:'BUF',score:33,completed:false,hit33:false,status:'4th quarter',paid:true}],history:[],players:['Alice'],paid:{Alice:true}}});
  if(path.includes('/api/'))return route.fulfill({json:{}});
  try{const body=readFileSync(resolve(root,'.'+path));return route.fulfill({body,contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png'}[extname(path)]||'application/octet-stream')})}catch{return route.fulfill({status:404,body:'Not found'})}
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/new-build/confidence.html?pool=1');
 await page.locator('[data-team="1"]').click();await page.getByText('Saved to your pool.',{exact:true}).waitFor();
 await page.locator('[data-rank]').selectOption('1');await page.getByText('Saved to your pool.',{exact:true}).waitFor();assert.equal(saved[0].points,1);
 await page.getByRole('button',{name:'STANDINGS',exact:true}).click();await page.getByText('Week 1 standings',{exact:true}).waitFor();
 await page.reload();await page.locator('[data-team="1"].primary').waitFor();assert.equal(await page.locator('[data-rank]').inputValue(),'1');
 saved=[];revision='';
 await page.goto(origin+'/new-build/survivor.html?pool=1');await page.locator('[data-team="1"]').click();await page.getByText('Saved to your pool.',{exact:true}).waitFor();
 await page.getByRole('button',{name:'HISTORY',exact:true}).click();assert.match(await page.locator('#survivor').textContent(),/Bills/);
 await page.goto(origin+'/new-build/game33.html?pool=1');await page.getByText('Your season team: BUF',{exact:true}).waitFor();assert.equal(await page.locator('[data-team]').count(),0);assert.equal(await page.getByText('HIT 33',{exact:true}).count(),0);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Game page fits phone width');
 assert.deepEqual(errors,[]);await context.close();console.log('PASS '+width+'px Confidence save/reload/standings, Survivor history, Game 33 assignments and live-score handling');
 }}finally{await browser.close()}
