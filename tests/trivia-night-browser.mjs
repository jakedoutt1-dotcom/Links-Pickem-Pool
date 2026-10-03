import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/trivia-night.js';
const {db}=fixture(),browser=await chromium.launch({headless:true,channel:'msedge'}),errors=[];
let queue=Promise.resolve();
async function page(width,admin=false){
 const context=await browser.newContext({viewport:{width,height:900}}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
 if(admin)await p.addInitScript(()=>{sessionStorage.setItem('links-temporary-session','1');sessionStorage.setItem('links-token','admin');});
 await p.route('https://trivia.local/**',async r=>{
  const u=new URL(r.request().url());
  if(u.pathname.includes('/api/')){
   const headers=new Headers(r.request().headers());headers.set('Origin',u.origin);
   const request=new Request(u,{method:r.request().method(),headers,...(r.request().method()==='POST'?{body:r.request().postData()}:{})});
   const result=queue.then(()=>onRequest({request,env:{DB:db}}));queue=result.then(()=>{});const response=await result;return r.fulfill({status:response.status,body:await response.text(),contentType:'application/json'});
  }
  const file=path.join('public',u.pathname);return fs.existsSync(file)?r.fulfill({path:file,contentType:(file.endsWith('.mjs')||file.endsWith('.js'))?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'image/png'}):r.fulfill({status:404,body:''});
 });return p;
}
try{
 const host=await page(1360,true),phone=await page(390);
 await host.goto('https://trivia.local/new-build/trivia-night.html');await host.getByRole('button',{name:'Set up a game'}).click();
 assert.equal(await host.locator('#entry').isVisible(),false);assert.equal(await host.locator('.intro').isVisible(),false);assert.equal(await host.locator('#setup').isVisible(),true);
 await host.locator('#setupBack').click();await host.locator('#entry:visible').waitFor();await host.getByRole('button',{name:'Set up a game'}).click();await host.locator('#setup:visible').waitFor();
 assert.equal(await host.getByRole('button',{name:'Manage questions'}).count(),0);
 if(process.env.TRIVIA_TEAMS==='1'){await host.locator('#playMode').selectOption('teams');assert.match(await host.locator('#modeHelp').textContent(),/One phone|one phone/);assert.match(await host.locator('#difficulty option[value=hard]').textContent(),/45 seconds/);}
 for(const checkbox of await host.locator('[name=category]').all())await checkbox.uncheck();await host.locator('[value=science]').check();await host.locator('#difficulty').selectOption('hard');
 await host.getByRole('button',{name:'Create room'}).click();await host.locator('#room:visible').waitFor();
 assert.equal(await host.locator('#soundToggle').getAttribute('aria-pressed'),'false');await host.locator('#soundToggle').click();assert.equal(await host.locator('#soundToggle').getAttribute('aria-pressed'),'true');await host.locator('#soundToggle').click();
 const code=new URL(host.url()).searchParams.get('room');assert.ok(code);assert.equal(await host.locator('body').getAttribute('data-screen'),'waiting');assert.equal(await host.locator('#setup').isVisible(),false);assert.equal(await host.locator('#entry').isVisible(),false);
 await host.getByRole('button',{name:'Connect a TV',exact:true}).click();await host.locator('#tvConnect[open]').waitFor();assert.equal(await host.locator('#tvCode').textContent(),code);await host.getByText('How to cast',{exact:true}).click();assert.ok(await host.getByText('iPhone / iPad · AirPlay',{exact:true}).isVisible());await host.locator('[data-close=tvConnect]').click();
 const tv=await page(1920);await tv.goto('https://trivia.local/new-build/trivia-tv.html');await tv.locator('#soundToggle').click();assert.equal(await tv.locator('#soundToggle').getAttribute('aria-pressed'),'true');await tv.locator('#soundToggle').click();await tv.locator('#roomCode').fill(code);await tv.getByRole('button',{name:'Connect display',exact:true}).click();await tv.locator('#display:visible').waitFor();assert.ok(await tv.locator('#qr svg').isVisible());assert.equal(await tv.locator('#hostControls').count(),0);await host.waitForFunction(()=>document.getElementById('tvStatus').textContent==='TV display connected');

 await host.getByRole('button',{name:'Invite / QR code'}).click();assert.ok(await host.locator('#qr svg').isVisible());await host.getByRole('button',{name:'Close invitation'}).click();
 await phone.goto('https://trivia.local/new-build/trivia-night.html?room='+code);await phone.locator('#quickJoin[open]').waitFor();assert.equal(await phone.locator('#entry').isVisible(),false);await phone.getByLabel(process.env.TRIVIA_TEAMS==='1'?'Team name':'Your name',{exact:true}).fill('Phone Team');await phone.getByRole('button',{name:'Join game',exact:true}).click();await phone.locator('#room:visible').waitFor();
 await host.getByRole('button',{name:'Show leaderboard',exact:true}).click();await host.locator('#triviaStandingsScreen[open]').waitFor();await host.getByRole('button',{name:'Back to game',exact:true}).click();assert.ok(await host.locator('#lobbyQR svg').isVisible());await host.getByRole('button',{name:'Start game',exact:true}).click();await host.locator('#roundCategories button[data-theme=science]').click();await host.getByRole('button',{name:'Start question',exact:true}).click();await phone.locator('[data-choice="0"]').waitFor();
 await tv.locator('.tv-answer').first().waitFor();assert.equal(await tv.locator('.correct').count(),0);assert.equal(await tv.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await tv.screenshot({path:'output/trivia-night/tv-question.png',fullPage:true});
 assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await host.setViewportSize({width:390,height:844});await host.locator('[data-choice="0"]').waitFor();for(const screen of [host,phone]){await screen.evaluate(()=>scrollTo(0,0));const q=await screen.locator('#question').boundingBox();assert.ok(q.y<400,'Question visible near top on phone');const answers=await screen.locator('#answers').boundingBox();assert.ok(answers.y+answers.height<844,'Answer buttons fit phone viewport');}await host.screenshot({path:'output/trivia-night/host-compact.png',fullPage:true});
 const s=JSON.parse(db.raw.prepare('SELECT state FROM links_trivia_night_rooms WHERE code=?').get(code).state);
 await phone.locator('[data-choice="'+s.deck[0].correct+'"]').click();await phone.getByText('Answer saved. Wait for the host to reveal.',{exact:true}).waitFor();
 fs.mkdirSync('output/trivia-night',{recursive:true});await phone.screenshot({path:'output/trivia-night/phone.png',fullPage:true});await host.screenshot({path:'output/trivia-night/host.png',fullPage:true});
 const updated=JSON.parse(db.raw.prepare('SELECT state FROM links_trivia_night_rooms WHERE code=?').get(code).state);updated.deadline=Date.now()-1;db.raw.prepare('UPDATE links_trivia_night_rooms SET state=? WHERE code=?').run(JSON.stringify(updated),code);
 await host.waitForFunction(()=>!document.getElementById('reveal').disabled);await host.getByRole('button',{name:'Reveal answer',exact:true}).click();await phone.locator('.answers .correct').waitFor();
 await tv.locator('.tv-answer.correct').waitFor();assert.ok(await tv.getByText('Phone Team',{exact:true}).isVisible());
 assert.ok(Number((await phone.locator('#leaders strong').innerText()).replace(/,/g,''))>=1500);
 await phone.reload();await phone.locator('.answers .correct').waitFor();await phone.getByRole('button',{name:'Show leaderboard',exact:true}).click();assert.ok(await phone.locator('#triviaStandingsScreen').getByText('Phone Team · You').isVisible());await phone.getByRole('button',{name:'Back to game',exact:true}).click();
 await host.getByRole('button',{name:'End game',exact:true}).click({trial:true});host.once('dialog',d=>d.accept());await host.getByRole('button',{name:'End game',exact:true}).click();await host.waitForFunction(()=>document.body.dataset.screen==='results');assert.equal(await host.locator('.stage').isVisible(),false);assert.ok(await host.locator('#room>.standings').isVisible());assert.equal(await host.locator('#entry').isVisible(),false);assert.equal(await host.locator('#showStandings').isVisible(),false);
 assert.deepEqual(errors,[]);console.log('PASS local desktop host + phone join, question manager, QR, answer/save/reveal, score, refresh resume, no overflow or browser errors.');
}finally{await browser.close();db.raw.close()}
