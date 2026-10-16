import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fixture} from './pool-format-fixture.mjs';
import {onRequest} from '../../functions/new-build/api/last-alibi.js';
const {chromium} = createRequire(import.meta.url)('playwright');

export async function runMysteryFlow(mode) {
  const {db} = fixture(), errors = [], contexts = [], responses = new Map();
  const browser = await chromium.launch({headless:true,channel:'msedge'});
  const output = 'output/last-alibi-' + mode;
  fs.mkdirSync(output,{recursive:true});
  let queue = Promise.resolve(), code;
  const raw = () => JSON.parse(db.raw.prepare('SELECT state FROM links_mystery_rooms WHERE code=?').get(code).state);
  async function page(width,height = 844) {
    const context = await browser.newContext({viewport:{width,height},reducedMotion:'reduce'}); contexts.push(context);
    const p = await context.newPage(); p.on('pageerror',e => errors.push(e.message));
    await p.route('**/*',async route => {
      const u = new URL(route.request().url());
      if (u.hostname !== 'alibi.local') return route.abort();
      if (u.pathname === '/new-build/api/last-alibi') {
        const headers = new Headers(route.request().headers()); headers.set('Origin',u.origin);
        const request = new Request(u,{method:route.request().method(),headers,...(route.request().method() === 'POST' ? {body:route.request().postData()} : {})});
        const work = queue.then(() => onRequest({request,env:{DB:db}})); queue = work.catch(() => {});
        const r = await work, body = await r.text();
        if (r.ok) responses.set(p,JSON.parse(body));
        return route.fulfill({status:r.status,body,contentType:r.headers.get('Content-Type')});
      }
      const file = path.join('public',u.pathname);
      const type = {'.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.svg':'image/svg+xml'}[path.extname(file)] || 'application/octet-stream';
      return fs.existsSync(file) && fs.statSync(file).isFile() ? route.fulfill({path:file,contentType:type}) : route.fulfill({status:404,body:''});
    });
    return p;
  }
  async function noOverflow(p) { assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),false,'The page must fit its viewport.'); }
  async function selectFirst(p,id) { const value = await p.locator('#' + id + ' option:not([value=""])').first().getAttribute('value'); await p.locator('#' + id).selectOption(value); }
  try {
    const count = mode === 'solo' ? 1 : mode === 'secret' ? 4 : 2;
    const host = await page(mode === 'secret' ? 1360 : mode === 'solo' ? 360 : 390);
    await host.goto('https://alibi.local/new-build/last-alibi.html');
    assert.equal(await host.locator('#mode').inputValue(),'together');
    await noOverflow(host); await host.screenshot({path:output + '/entry.png',fullPage:true});
    await host.locator('#createName').fill('Host'); await host.locator('#mode').selectOption(mode);
    await host.locator('#difficulty').selectOption(mode === 'secret' ? 'expert' : 'standard');
    await host.getByRole('button',{name:'Create mystery',exact:true}).click(); await host.locator('#game:visible').waitFor();
    code = new URL(host.url()).searchParams.get('room');
    assert.equal(responses.get(host).mode,mode); assert.equal(responses.get(host).flowVersion,2);
    const players = [host];
    for (let i = 1; i < count; i++) {
      const guest = await page(i === 1 ? 360 : 390); players.push(guest);
      await guest.goto('https://alibi.local/new-build/last-alibi.html?room=' + code);
      assert.equal(await guest.locator('#createForm').isVisible(),false);
      await guest.locator('#joinName').fill('Guest ' + i); await guest.getByRole('button',{name:'Join mystery',exact:true}).click(); await guest.locator('#game:visible').waitFor(); await guest.locator('#ready').click();
    }
    await host.locator('#tvButton').click(); const tv = await page(mode === 'solo' ? 960 : 1280,mode === 'solo' ? 540 : 720);
    await tv.goto(await host.locator('#tvLink').getAttribute('href')); await tv.locator('#game:visible').waitFor(); await host.locator('[data-close=tv]').click();
    await host.locator('#ready').click(); await host.locator('#start:enabled').waitFor(); await host.locator('#start').click();
    const reader = players.at(-1);
    await reader.locator('#roleButton:visible').waitFor(); await reader.locator('#roleButton').click();
    assert.ok(await reader.locator('#roleSecret').textContent()); assert.equal(await tv.locator('#roleSecret').textContent(),'');
    await reader.locator('[data-close=privateRole]').click();
    await host.screenshot({path:output + '/opening-scene.png',fullPage:true});
    await reader.locator('#audioSettings summary').click(); await reader.locator('#narrationToggle').waitFor({state:'visible'}); await reader.locator('#audioSettings summary').click();
    for (let chapter = 0; chapter <= 4; chapter++) {
      await Promise.all(players.map(p => p.waitForFunction(c => document.getElementById('stepLabel').textContent.includes('SCENE ' + (c + 1) + ' OF 5'),chapter)));
      if (chapter === 1) {
        await host.locator('#pause').click(); await reader.waitForFunction(() => document.getElementById('clockLabel').textContent === 'ROOM PAUSED');
        assert.equal(await reader.locator('#chapterReady').isDisabled(),true);
        await host.locator('#pause').click(); await reader.waitForFunction(() => document.getElementById('clockLabel').textContent === 'SUGGESTED PACE');
        await reader.locator('[data-tab=search]').click();
        await reader.locator('#rooms').getByRole('button',{name:'The Dining Room',exact:true}).click();
        await reader.locator('#objectList').getByRole('button',{name:'Contact Sheet 04',exact:true}).click();
        await reader.locator('#inspect[open]').waitFor(); await reader.locator('#inspectionPoints button').first().click();
        assert.notEqual(await reader.locator('#inspectDetail').textContent(),'Select a detail to examine.');
        await reader.screenshot({path:output + '/phone-inspection.png',fullPage:true});
        await reader.locator('#shareClue').click(); await reader.getByText('Shared with the room.',{exact:true}).waitFor();
        await reader.locator('#pinClue').click(); await reader.locator('[data-close=inspect]').click(); await noOverflow(reader);
      }
      if (chapter === 2 || chapter === 4) {
        for (const p of players) {
          assert.equal(await p.locator('#chapterReady').isDisabled(),true,'The checkpoint should explain why ready is unavailable.');
          await p.locator('[data-tab=suspectPane]').first().click();
          const mine = responses.get(p).players.find(x => x.you).id;
          assert.equal(await p.locator('#theorySuspect option').evaluateAll((options,id) => options.some(o => o.value === id),mine),false,'A secret player cannot target themself.');
          await selectFirst(p,'theorySuspect'); await selectFirst(p,'theoryEvidence'); await p.locator('#theoryForm button').click();
          await p.locator('#chapterReady:enabled').waitFor(); assert.ok(responses.get(p).theory);
        }
        assert.equal(responses.get(tv).theory,null);
      }
      if (chapter === 2) {
        await reader.screenshot({path:output + '/phone-theory.png',fullPage:true});
        await reader.locator('[data-tab=search]').click(); await reader.locator('#rooms').getByRole('button',{name:'The Study',exact:true}).click();
        await reader.locator('#objectList').getByRole('button',{name:'Camera Service Slip',exact:true}).click(); await reader.locator('#pinClue').click(); await reader.locator('[data-close=inspect]').click();
        await reader.locator('[data-tab=evidence]').click(); await reader.locator('#compareButton').click(); assert.equal(await reader.locator('#compareDocs article').count(),2);
        await reader.screenshot({path:output + '/phone-comparison.png',fullPage:true}); await reader.locator('[data-close=compare]').click();
        await reader.locator('[data-tab=suspectPane]').first().click(); await reader.locator('#openNotebook').click(); await reader.locator('#notes').fill('My private working theory'); await reader.locator('#saveNotes').click();
        await reader.getByText('Private notes saved.',{exact:true}).waitFor(); await reader.reload(); await reader.locator('#tabs:visible').waitFor(); await reader.locator('[data-tab=suspectPane]').first().click(); await reader.locator('#openNotebook').click();
        assert.equal(await reader.locator('#notes').inputValue(),'My private working theory'); assert.equal(await tv.locator('#notes').inputValue(),'');
        await tv.locator('#tvBoard:visible').waitFor(); await tv.screenshot({path:output + '/tv-board.png',fullPage:true});
        assert.ok(await tv.locator('#tvBoard').evaluate(e => e.getBoundingClientRect().bottom <= innerHeight + 1)); await noOverflow(tv);
        assert.ok(await tv.locator('#tvClueText').evaluate(e => e.scrollHeight <= e.clientHeight + 1),'A TV record page must be completely readable.');
        await tv.locator('#tvAuto').click(); assert.equal(await tv.locator('#tvAuto').getAttribute('aria-pressed'),'false');
      }
      for (const p of players) await p.locator('#chapterReady').click();
      await host.locator('#continue:enabled').waitFor(); await host.locator('#continue').click();
    }
    await reader.locator('#accusation:visible').waitFor(); const truth = raw(), culprit = (truth.suspects || truth.players)[truth.case.killer];
    for (const p of players) {
      await p.locator('#accusation:visible').waitFor(); const mine = responses.get(p).players.find(x => x.you).id;
      assert.equal(await p.locator('#suspectChoice option').evaluateAll((options,id) => options.some(o => o.value === id),mine),false);
      if (mine !== culprit.id) await p.locator('#suspectChoice').selectOption(culprit.id); else await selectFirst(p,'suspectChoice');
      await p.locator('#sceneChoice').selectOption(truth.case.scene.id); await p.locator('#methodChoice').selectOption(truth.case.object); await p.locator('#supportChoice').selectOption('window');
      await p.locator('#accuseForm button').click(); await p.locator('#sealAccusation[open]').waitFor(); assert.ok(await p.locator('#accusationSummary').textContent());
      await p.locator('#confirmAccusation').click(); await p.locator('#accuseForm').waitFor({state:'hidden'});
    }
    await host.locator('#continue:enabled').waitFor(); await host.locator('#continue').click();
    for (let step = 0; step <= 4; step++) {
      await Promise.all([...players,tv].map(p => p.waitForFunction(s => document.getElementById('ending').dataset.step === String(s),step)));
      const data = responses.get(tv);
      if (step < 2) { assert.equal(data.ending.culprit,undefined); assert.equal(data.ending.story,undefined); assert.equal(data.ending.answer?.suspectId,undefined); assert.equal(await tv.locator('#results li').count(),0); }
      if (step === 0) assert.equal((await tv.locator('#ending').textContent()).includes(culprit.character.name),false);
      if (step === 1) { assert.equal(await tv.locator('.timeline-card').count(),3); assert.ok(await tv.locator('#ending').evaluate(e => e.scrollHeight <= e.clientHeight + 1),'The TV reconstruction must fit.'); }
      if (step === 2) assert.equal(await tv.locator('#endingTitle').textContent(),culprit.character.name);
      if (step === 4) { assert.equal(await tv.locator('#results li').count(),count); assert.equal(await host.locator('#again').isVisible(),true); assert.equal(data.ending.theoryFeedback.length,0); }
      await noOverflow(reader); await tv.screenshot({path:output + '/tv-reveal-' + step + '.png',fullPage:true});
      if (step < 4) await host.locator('#revealNext').click();
    }
    await host.locator('#again').click(); await host.locator('#lobby:visible').waitFor(); assert.equal(responses.get(host).game,2);
    assert.deepEqual(errors,[]); console.log('PASS Last Alibi ' + mode + ': complete v2 scenes, private theories, accusations, synchronized spoiler-safe reveal, reconnect, phone/TV layout and replay.');
  } finally { await browser.close(); db.raw.close(); }
}
