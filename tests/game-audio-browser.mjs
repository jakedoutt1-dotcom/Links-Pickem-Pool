import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const {chromium} = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch({channel: 'msedge', headless: true});
const errors = [];
try {
  for (const game of ['last-alibi', 'dead-air']) {
    const page = await browser.newPage({viewport: {width: 390, height: 844}});
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      const Audio = window.AudioContext;
      window.AudioContext = class extends Audio {
        constructor() { super(); window.testContext = this; }
        createDynamicsCompressor() {
          const node = super.createDynamicsCompressor();
          window.testAnalyser = this.createAnalyser(); node.connect(window.testAnalyser);
          return node;
        }
      };
      // Speech hardware varies on CI. The synthesis graph is real; speech events are
      // deterministic here. Device-voice quality still needs an audible device check.
      const speech = new EventTarget();
      speech.current = null; speech.getVoices = () => [];
      speech.speak = utterance => { if (speech.current) throw Error('Overlapping speech'); speech.current = utterance; };
      speech.cancel = () => { speech.current = null; };
      Object.defineProperty(window, 'speechSynthesis', {value: speech});
    });
    await page.route('https://audio.local/**', async route => {
      const pathname = new URL(route.request().url()).pathname;
      if (pathname === '/test') return route.fulfill({contentType: 'text/html', body: `<!doctype html><meta name="viewport" content="width=device-width"><button id="sound"></button><button id="voice"></button><select id="voices"></select><button id="replay">Replay</button><p id="status"></p><p id="caption"></p><script type="module">
        import {${game === 'last-alibi' ? 'mountMysteryAudio' : 'mountDeadAirAudio'} as mount} from '/new-build/${game}-audio.mjs';
        const $=id=>document.getElementById(id);
        window.player=mount($('sound'),{narrationButton:$('voice'),voiceSelect:$('voices'),replayButton:$('replay'),status:$('status'),caption:$('caption')});
        player.update({code:'AUDIO',game:1,phase:'${game === 'last-alibi' ? 'briefing' : 'intro'}',phaseId:1,chapter:0,mode:'solo',guided:true,deadline:Date.now()+20000,players:[],chapterInfo:{title:'A quiet room',story:'The bell rings once.'}},Date.now());
      </script>`});
      const file = path.resolve('public', '.' + pathname);
      return fs.existsSync(file) ? route.fulfill({path: file, contentType: 'text/javascript'}) : route.fulfill({status: 404});
    });
    await page.goto('https://audio.local/test');
    await page.waitForFunction(() => !!window.player);
    assert.equal(await page.evaluate(() => !!window.testContext), false, 'No Web Audio before a gesture');
    await page.locator('#sound').click();
    await page.waitForFunction(() => window.testContext?.state === 'running');
    assert.ok(await page.evaluate(() => !!speechSynthesis.current));
    await page.evaluate(cues => cues.forEach(kind => player.cue(kind)), game === 'last-alibi'
      ? ['paper', 'discovery', 'share', 'ready', 'transition', 'accusation', 'reveal']
      : ['ident', 'tune', 'question', 'lock', 'risk', 'lifeLost', 'echoReturn', 'correct', 'wrong', 'final', 'ending']);
    await page.waitForFunction(() => {
      const samples = new Float32Array(testAnalyser.fftSize); testAnalyser.getFloatTimeDomainData(samples);
      return samples.some(sample => Math.abs(sample) > .00001);
    });
    const peak = await page.evaluate(() => { const samples = new Float32Array(testAnalyser.fftSize); testAnalyser.getFloatTimeDomainData(samples); return Math.max(...samples.map(Math.abs)); });
    assert.ok(Number.isFinite(peak) && peak < 1, game + ' produces finite, unclipped audio');
    await page.locator('#sound').click();
    assert.equal(await page.evaluate(() => speechSynthesis.current), null);
    assert.equal(await page.locator('#sound').getAttribute('aria-pressed'), 'true');
    await page.locator('#replay').click();
    assert.ok(await page.evaluate(() => !!speechSynthesis.current));
    await page.evaluate(() => player.dispose());
    assert.equal(await page.evaluate(() => testContext.state), 'closed');
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log('PASS Last Alibi + Dead Air real browser audio graphs: gesture activation, live finite signal, cue graph creation, narrator controls, mute/replay and context cleanup. Speech voice quality is device-dependent.');
} finally { await browser.close(); }
