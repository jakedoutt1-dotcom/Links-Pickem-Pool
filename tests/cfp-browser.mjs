import {createRequire} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/cfp.js';
import {cfpSeason} from '../public/new-build/cfp-core.mjs';
const {chromium}=createRequire(import.meta.url)('playwright'),root=resolve('public'),origin='https://cfp.test',oldFetch=globalThis.fetch;
const browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const width of [390,1280]){
 const {db}=fixture(),errors=[],year=cfpSeason(),future=(year+1)+'-01-15T20:00:00Z';db.raw.exec("INSERT INTO pool_active_games VALUES(1,'cfp',0,1,'2026-01-01')");
 const event={id:'one',date:future,season:{type:3},competitions:[{date:future,notes:[{headline:'CFP Semifinal'}],odds:[{overUnder:51.5}],status:{type:{state:'pre',completed:false}},competitors:[{homeAway:'away',team:{id:'333',displayName:'Alabama'},records:[{type:'total',summary:'11-1'}],curatedRank:{current:5}},{homeAway:'home',team:{id:'61',displayName:'Georgia'},records:[{type:'total',summary:'12-0'}],curatedRank:{current:4}}]}]};
 globalThis.fetch=async()=>Response.json({events:[event]});
 const context=await browser.newContext({viewport:{width,height:900}});await context.addInitScript(()=>{if(!localStorage.getItem('links-legacy-token'))localStorage.setItem('links-legacy-token','admin');localStorage.setItem('links-current-pool',JSON.stringify({id:1,name:'Playoff crew',code:'POOL'}))});
 await context.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.origin!==origin)return route.abort();
  if(u.pathname.endsWith('/api/cfp')){const r=await onRequest({request:new Request(u,{method:req.method(),headers:req.headers(),...(req.method()==='POST'?{body:req.postData()}:{})}),env:{DB:db}});return route.fulfill({status:r.status,body:await r.text(),contentType:'application/json'})}
  if(u.pathname.includes('/api/'))return route.fulfill({json:{}});const f=resolve(root,'.'+decodeURIComponent(u.pathname));if(existsSync(f))return route.fulfill({body:readFileSync(f),contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'}[extname(f)]||'application/octet-stream')});return route.fulfill({status:404,body:''});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/new-build/cfp.html?pool=1');await page.locator('[data-event=one]').waitFor();
 assert.equal(await page.locator('[data-team="333"] img').getAttribute('src'),'https://a.espncdn.com/i/teamlogos/ncaa/500/333.png');assert.match(await page.locator('[data-team="333"]').innerText(),/11-1/);assert.match(await page.locator('[data-team="333"]').innerText(),/Rank #5/);
 await page.getByRole('button',{name:'Admin',exact:true}).click();await page.locator('[name=bonus]').uncheck();await page.getByRole('button',{name:'Save scoring options',exact:true}).click();await page.getByText('Scoring options saved.',{exact:true}).waitFor();assert.equal(await page.locator('[name=bonus]').isChecked(),false);await page.locator('[name=bonus]').check();await page.getByRole('button',{name:'Save scoring options',exact:true}).click();await page.getByText('Scoring options saved.',{exact:true}).waitFor();
 await page.evaluate(()=>localStorage.setItem('links-legacy-token','alice'));await page.reload();await page.locator('[data-event=one]').waitFor();await page.locator('[data-team="333"]').click();await page.locator('.bonus').selectOption('2');await page.locator('.total').selectOption('over');await page.getByRole('button',{name:'Save game picks',exact:true}).click();await page.getByText('Game picks saved.',{exact:true}).waitFor();assert.equal(db.raw.prepare("SELECT bonus FROM links_cfp_picks WHERE player='Alice'").get().bonus,2);await page.reload();await page.locator('[data-team="333"][aria-pressed=true]').waitFor();assert.equal(await page.locator('.total').inputValue(),'over');
 event.competitions[0].status={type:{state:'post',completed:true}};event.competitions[0].competitors[0].score=28;event.competitions[0].competitors[0].winner=true;event.competitions[0].competitors[1].score=24;await page.locator('#refresh').click();await page.locator('.save-game:disabled').waitFor();await page.getByRole('button',{name:'Standings',exact:true}).click();assert.match(await page.locator('tbody').innerText(),/Alice\s+4/);
 await page.evaluate(()=>localStorage.setItem('links-legacy-token','admin'));await page.reload();await page.getByRole('button',{name:'Admin',exact:true}).click();assert.equal(await page.locator('[name=bonus]').isDisabled(),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 await context.close();db.raw.close();console.log('PASS CFP '+width+'px real handler setup, records/rank/logos, winner+bonus+total saves, reload, finals and locked admin rules');
}}finally{globalThis.fetch=oldFetch;await browser.close()}
