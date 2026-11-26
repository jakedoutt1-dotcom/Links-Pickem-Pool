import {createRequire} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/cfp.js';
import {cfpSeason} from '../public/new-build/cfp-core.mjs';
import {playoffFixture} from './helpers/cfp-bracket-fixture.mjs';
import {SLOTS} from '../public/new-build/cfp-bracket-core.mjs';
const {chromium}=createRequire(import.meta.url)('playwright'),root=resolve('public'),origin='https://cfp.test',oldFetch=globalThis.fetch;
const browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const width of [390,1280]){
 const {db}=fixture(),errors=[],year=cfpSeason(),f=playoffFixture(year);db.raw.exec("INSERT INTO pool_active_games VALUES(1,'cfp',0,1,'2026-01-01')");
 globalThis.fetch=async url=>String(url).includes('/teams?')?Response.json({sports:[{leagues:[{teams:f.teams.map(t=>({team:{...t,displayName:t.name}}))}]}]}):Response.json({events:f.events});
 const context=await browser.newContext({viewport:{width,height:900}});await context.addInitScript(()=>{if(!localStorage.getItem('links-legacy-token'))localStorage.setItem('links-legacy-token','admin');localStorage.setItem('links-current-pool',JSON.stringify({id:1,name:'Playoff crew',code:'POOL'}))});
 await context.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.origin!==origin)return route.abort();
  if(u.pathname.endsWith('/api/cfp')){const r=await onRequest({request:new Request(u,{method:req.method(),headers:req.headers(),...(req.method()==='POST'?{body:req.postData()}:{})}),env:{DB:db}});return route.fulfill({status:r.status,body:await r.text(),contentType:'application/json'})}
  if(u.pathname.includes('/api/'))return route.fulfill({json:{}});const f=resolve(root,'.'+decodeURIComponent(u.pathname));if(existsSync(f))return route.fulfill({body:readFileSync(f),contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'}[extname(f)]||'application/octet-stream')});return route.fulfill({status:404,body:''});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/new-build/cfp.html?pool=1');await page.getByText('Pick your full playoff bracket',{exact:true}).waitFor();
 await page.locator('.cfp-team-standings li').first().waitFor();assert.equal(await page.locator('.cfp-team-standings li').count(),12);assert.equal(await page.locator('.cfp-team-standings li').evaluateAll(nodes=>new Set(nodes.map(n=>Math.round(n.getBoundingClientRect().top))).size),2);
 await page.getByRole('button',{name:'Admin',exact:true}).click();await page.getByRole('button',{name:'Load all college teams',exact:true}).click();await page.getByText('Team list loaded. Assign the official seeds.',{exact:true}).waitFor();
 for(const t of f.teams)await page.locator('[name=seed'+t.seed+']').selectOption(t.id);await page.locator('[name=official]').check();await page.getByRole('button',{name:'Publish official bracket',exact:true}).click();await page.getByText(/Full bracket deadline:/).waitFor();
 await page.evaluate(()=>localStorage.setItem('links-legacy-token','alice'));await page.reload();await page.locator('[data-slot=r8]').waitFor();assert.equal(await page.locator('[data-slot]').count(),11);
 await page.locator('[data-slot=r8] [data-pick="8"]').click();await page.locator('[data-slot=r8] .confidence').selectOption('1');await page.locator('[data-slot=q1] [data-pick="8"]').click();await page.locator('[data-slot=r8] [data-pick="9"]').click();assert.equal(await page.locator('[data-slot=q1] [aria-pressed=true]').count(),0,'Changing an earlier winner clears invalid advancement');
 await page.getByRole('button',{name:'Save draft',exact:true}).click();await page.getByText('Draft saved — submit the complete bracket before the deadline.',{exact:true}).waitFor();await page.reload();await page.locator('[data-slot=r8] [data-pick="9"][aria-pressed=true]').waitFor();
 for(const slot of SLOTS){const p=f.picks[slot.id];await page.locator('[data-slot='+slot.id+'] [data-pick="'+p.team+'"]').click();await page.locator('[data-slot='+slot.id+'] .confidence').selectOption(String(p.confidence));}
 await page.locator('#championshipGuess').fill('50');await page.getByRole('button',{name:'Submit full bracket',exact:true}).click();await page.getByText('Your complete bracket is submitted.',{exact:true}).waitFor();assert.equal(db.raw.prepare("SELECT submitted FROM links_cfp_brackets WHERE player='Alice'").get().submitted,1);
 await page.reload();await page.getByText('Your complete bracket is submitted.',{exact:true}).waitFor();assert.equal(await page.locator('#championshipGuess').inputValue(),'50');assert.equal(await page.locator('[data-slot=final] .confidence').inputValue(),'11');
 f.events[0].competitions[0].status.type.state='in';await page.locator('#refresh').click();await page.getByText('Entire bracket locked',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Submit full bracket',exact:true}).isDisabled(),true);
 f.finish();await page.locator('#refresh').click();await page.getByText('Entire bracket locked',{exact:true}).waitFor();await page.getByRole('button',{name:'Standings',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#content tbody')?.innerText.includes('66'));assert.match(await page.locator('#content tbody').innerText(),/Alice\s+66\s+11\/11\s+50\s+2/);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 await context.close();db.raw.close();console.log('PASS CFP '+width+'px official seeds, all rounds, cascading picks, draft/reload/submit, full lock, 66 points and tiebreaker');
}}finally{globalThis.fetch=oldFetch;await browser.close()}
