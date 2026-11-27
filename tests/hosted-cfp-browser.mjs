import {createRequire} from 'node:module';
import {readFileSync,existsSync,mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {playoffFixture} from './helpers/cfp-bracket-fixture.mjs';
import {onRequest as eventRequest} from '../functions/new-build/api/hosted-cfp.js';
import {onRequest as cfpRequest} from '../functions/new-build/api/cfp.js';
import {ensureOwner} from '../functions/lib/owner-auth.js';
import {ensureAccounts,digest} from '../functions/lib/commissioner-account.js';
import {cfpSeason} from '../public/new-build/cfp-core.mjs';
import {SLOTS} from '../public/new-build/cfp-bracket-core.mjs';
const {chromium}=createRequire(import.meta.url)('playwright'),root=resolve('public'),origin='https://hosted.test',old=fetch;
const browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const width of [390,1280]){
 const {db}=fixture(),f=playoffFixture(cfpSeason()),errors=[];global.fetch=async()=>Response.json({events:f.events});
 await ensureOwner(db);await ensureAccounts(db);db.raw.prepare('INSERT INTO links_admin_sessions VALUES(?,?)').run('owner','2099-01-01');db.raw.prepare('INSERT INTO links_account_sessions VALUES(?,?,?)').run(await digest('account'),'player@example.com','2099-01-01');
 async function context(admin=false){
  const c=await browser.newContext({viewport:{width,height:900}});await c.addInitScript(admin=>{if(admin)sessionStorage.setItem('links-owner-admin-token','owner');localStorage.setItem('links-legacy-token','alice');Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copied=text}}})},admin);
  await c.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.origin!==origin)return route.abort();
   const handler=u.pathname.endsWith('/api/hosted-cfp')?eventRequest:u.pathname.endsWith('/api/cfp')?cfpRequest:null;
   if(handler){const r=await handler({env:{DB:db},request:new Request(u,{method:req.method(),headers:req.headers(),...(req.method()==='POST'?{body:req.postData()}:{})})});return route.fulfill({status:r.status,body:await r.text(),contentType:'application/json'})}
   if(u.pathname.includes('/api/'))return route.fulfill({json:{}});const file=resolve(root,'.'+u.pathname);if(existsSync(file))return route.fulfill({body:readFileSync(file),contentType:({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'}[extname(file)]||'application/octet-stream')});return route.fulfill({status:404,body:''});
  });return c;
 }
 const adminContext=await context(true),admin=await adminContext.newPage();admin.on('pageerror',e=>errors.push(e.message));
 await admin.goto(origin+'/new-build/cfp.html?event=links&admin=1');await admin.getByText('LINKS host view — players join with automatic access.',{exact:true}).waitFor();
 const playerContext=await context(),player=await playerContext.newPage();player.on('pageerror',e=>errors.push(e.message));await player.goto(origin+'/new-build/cfp.html?event=links');await player.getByRole('link',{name:'Create account',exact:true}).waitFor();assert.equal(await player.locator('.workspace').isHidden(),true,'Pool-only sign-in cannot enter');assert.equal(await player.getByRole('button',{name:'Join free event',exact:true}).count(),0);
 await player.evaluate(()=>localStorage.setItem('links-account-token','account'));await player.reload();await player.getByRole('button',{name:'Join free event',exact:true}).click();await player.locator('[data-slot=r8] [data-pick="8"]:enabled').waitFor();assert.equal(await player.locator('#playerAccess').isHidden(),true);assert.match(await player.locator('#cfpCounts').innerText(),/1\s+Players joined/);
 for(const slot of SLOTS)await player.locator('[data-slot='+slot.id+'] [data-pick="'+f.picks[slot.id].team+'"]').click();
 await player.locator('#championshipGuess').fill('52');await player.getByRole('button',{name:'Lock in my picks',exact:true}).click();await player.getByText('Your picks are saved and entered.',{exact:true}).waitFor();assert.match(await player.locator('#cfpCounts').innerText(),/1\s+Brackets entered/);
 await player.getByRole('button',{name:'Share event & QR',exact:true}).click();await player.locator('dialog svg').waitFor();await player.getByRole('button',{name:'Copy link',exact:true}).click();assert.equal(await player.evaluate(()=>window.__copied),origin+'/new-build/cfp.html?event=links');await player.getByRole('button',{name:'Close',exact:true}).click();
 assert.equal(db.raw.prepare('SELECT COUNT(*) n FROM links_hosted_cfp_members').get().n,1);assert.equal(await player.locator('#hostedEventRecognition .cfp-prize-grid li').count(),3);assert.match(await player.locator('#hostedEventRecognition').innerText(),/Sponsors will be announced soon/);assert.equal(await player.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);mkdirSync('output/hosted-cfp',{recursive:true});await player.locator('#hostedEvent').screenshot({path:'output/hosted-cfp/event-'+width+'.png'});
 await playerContext.close();await adminContext.close();db.raw.close();console.log('PASS hosted CFP '+width+'px owner launch, account required, automatic access, own bracket save and QR share');
}}finally{global.fetch=old;await browser.close()}
