// Focused local UI regression. All requests are mocked; no live service is used.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {begin,view} from '../functions/lib/last-alibi.js';
const {chromium} = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({channel:'msedge',headless:true});
const code = 'ABCDEF1234', errors = [];
let room = {code,game:1,owner:'host',mode:'together',flowVersion:2,guided:true,difficulty:'standard',minutes:35,players:{host:{id:'host-id',name:'Host'},guest:{id:'old-guest-id',name:'Guest'}}};
begin(room,Date.now()); room.phase = 'investigate'; room.chapter = 1; room.players.guest.notes = 'Previously saved notes';
let poll401 = false, action401 = false, heldPoll = null, joins = 0, currentToken = 'old-seat';
function holdNextPoll() {
  let release, start;
  const started = new Promise(resolve => { start = resolve; });
  heldPoll = {start,release:new Promise(resolve => { release = resolve; })};
  return {started,release};
}
try {
  const page = await browser.newPage({viewport:{width:360,height:844},reducedMotion:'reduce'});
  page.on('pageerror',error => errors.push(error.message));
  await page.addInitScript(({code}) => {
    localStorage.setItem('links-alibi-' + code,'old-seat');
    localStorage.setItem('links-alibi-OTHERROOM','keep-other-room');
    localStorage.setItem('links-account-token','keep-account');
    window.audioResets = 0;
  },{code});
  await page.route('**/*',async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.hostname !== 'alibi.local') return route.abort();
    if (url.pathname === '/new-build/last-alibi-audio.mjs') return route.fulfill({contentType:'text/javascript',body:'export function mountMysteryAudio(){return {update(){},cue(){},reset(){window.audioResets++;}}}'});
    if (url.pathname === '/new-build/api/last-alibi') {
      const body = request.method() === 'POST' ? JSON.parse(request.postData()) : null;
      if (!body && heldPoll) { const held = heldPoll; heldPoll = null; held.start(); await held.release; return route.fulfill({status:401,json:{error:'Join this room first.'}}); }
      if ((!body && poll401) || (body && action401)) { poll401 = false; action401 = false; return route.fulfill({status:401,json:{error:'Join this room first.'}}); }
      if (body?.action === 'join') {
        assert.equal(request.headers()['x-alibi-token'],'','Joining must not send the revoked credential.'); joins++; currentToken = 'new-seat-' + joins;
        room = {code,game:1,owner:'host',mode:'together',flowVersion:2,guided:true,difficulty:'standard',minutes:35,phase:'lobby',players:{host:{id:'host-id',name:'Host',ready:false},guest:{id:'new-guest-' + joins,name:body.name,ready:false}}};
        return route.fulfill({json:{...view(room,'guest',Date.now()),token:currentToken}});
      }
      if (body?.action === 'ready') room.players.guest.ready = !room.players.guest.ready;
      return route.fulfill({json:view(room,'guest',Date.now())});
    }
    if (url.pathname.startsWith('/new-build/api/')) return route.fulfill({status:404,json:{error:'Mocked offline service.'}});
    const file = path.join('public',url.pathname), contentType = {'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'}[path.extname(file)] || 'application/octet-stream';
    return fs.existsSync(file) && fs.statSync(file).isFile() ? route.fulfill({path:file,contentType}) : route.fulfill({status:404,body:''});
  });
  await page.goto('https://alibi.local/new-build/last-alibi.html?room=' + code);
  await page.locator('#tabs:visible').waitFor(); await page.locator('[data-tab=suspectPane]').first().click(); await page.locator('#openNotebook').click();
  await page.locator('#notes').fill('Keep this old seat draft private'); await page.locator('#notebookRole').click();
  await page.locator('#privateRole[open]').waitFor(); poll401 = true;
  await page.locator('#joinForm:visible').waitFor();
  assert.equal(await page.locator('#game').isVisible(),false); assert.equal(await page.locator('dialog[open]').count(),0);
  assert.equal(await page.locator('#roleSecret').textContent(),''); assert.equal(await page.locator('#notes').inputValue(),'');
  assert.equal(await page.locator('#code').inputValue(),code); assert.equal(await page.locator('#roomCodeLabel').isVisible(),true);
  assert.ok((await page.locator('#message').textContent()).includes('removed')); assert.equal(joins,0,'Revocation must not silently rejoin.');
  const storage = await page.evaluate(code => ({seat:localStorage.getItem('links-alibi-' + code),other:localStorage.getItem('links-alibi-OTHERROOM'),account:localStorage.getItem('links-account-token'),draft:sessionStorage.getItem('links-alibi-draft-' + code + '-1-old-guest-id'),resets:window.audioResets}),code);
  assert.deepEqual(storage,{seat:null,other:'keep-other-room',account:'keep-account',draft:'Keep this old seat draft private',resets:1});
  await page.locator('#joinName').fill('Returning guest'); await page.getByRole('button',{name:'Join mystery',exact:true}).click(); await page.locator('#lobby:visible').waitFor();
  assert.equal(await page.locator('#notes').inputValue(),'','A new seat must not inherit the old seat’s notes.'); assert.equal(joins,1);
  const staleAction = holdNextPoll(); await staleAction.started;
  await page.locator('#ready').click(); const staleActionResponse = page.waitForResponse(r => r.url().includes('/api/last-alibi?') && r.status() === 401); staleAction.release(); await staleActionResponse;
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await page.locator('#game').isVisible(),true,'An old poll error must not undo a successful action.');
  assert.equal(await page.evaluate(code => localStorage.getItem('links-alibi-' + code),code),currentToken);
  const staleJoin = holdNextPoll(); await staleJoin.started; action401 = true;
  await page.locator('#ready').click(); await page.locator('#joinForm:visible').waitFor(); assert.equal(joins,1);
  await page.getByRole('button',{name:'Join mystery',exact:true}).click(); await page.locator('#lobby:visible').waitFor();
  const staleJoinResponse = page.waitForResponse(r => r.url().includes('/api/last-alibi?') && r.status() === 401); staleJoin.release(); await staleJoinResponse;
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await page.locator('#game').isVisible(),true,'An old poll error must not revoke the replacement seat.');
  assert.equal(await page.evaluate(code => localStorage.getItem('links-alibi-' + code),code),currentToken); assert.equal(await page.evaluate(() => window.audioResets),2);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),false); assert.deepEqual(errors,[]);
  console.log('PASS Last Alibi seat recovery: poll/action401 returns to explicit join, only revoked credential cleared, private draft retained without migration, dialogs/state/audio reset, stale poll errors ignored after action or replacement join.');
} finally { await browser.close(); }
