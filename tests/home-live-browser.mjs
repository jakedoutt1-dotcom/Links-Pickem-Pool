import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url), {chromium} = require('playwright');
const source = await readFile(new URL('../public/new-build/home-live.mjs', import.meta.url), 'utf8');
const baseCss = await readFile(new URL('../public/new-build/home-stadium.css', import.meta.url), 'utf8');
const css = await readFile(new URL('../public/new-build/home-live.css', import.meta.url), 'utf8');
const browser = await chromium.launch({channel: 'msedge', headless: true});
const page = await browser.newPage({viewport: {width: 360, height: 800}}), errors = [];
await page.clock.install();
page.on('pageerror', error => errors.push(error.message));
let mode = 'healthy', hits = 0;
const snapshot = () => ({asOf: Date.now(), unavailable: [], events: [{id: 'one', league: 'NFL', state: 'in',
  away: {name: '<img src=x onerror=alert(1)>', score: '17'}, home: {name: 'DAL', score: '10'}, detail: '2nd quarter'}]});
await page.route('**/*', async route => {
  const path = new URL(route.request().url()).pathname;
  if (path === '/new-build/api/live-scores') {
    hits++;
    return route.fulfill({status: mode === 'offline' ? 503 : 200, contentType: 'application/json',
      body: JSON.stringify(mode === 'offline' ? {error: 'offline'} : mode === 'empty' ? {...snapshot(), events: []} : snapshot())});
  }
  if (path === '/home-live.mjs') return route.fulfill({contentType: 'text/javascript', body: source});
  return route.fulfill({contentType: 'text/html', body: `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseCss}${css}</style><div class="livebar-home"><div class="livebrand-home"><i></i>LINKS LIVE</div><div class="live-window"><div id="liveTrackHome" class="live-track-home"><span>Loading live scores…</span></div></div></div><script type="module" src="/home-live.mjs"></script>`});
});
try {
  await page.goto('https://links.test/');
  await page.getByRole('status').filter({hasText: 'Updated'}).waitFor();
  assert.equal(await page.locator('#liveTrackHome img').count(), 0, 'score text cannot inject HTML');
  assert.equal(await page.locator('#liveTrackHome [aria-hidden="true"]').count(), 1, 'duplicate ticker row hidden from screen readers');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  mode = 'offline'; await page.getByRole('button', {name: 'Refresh live scores'}).click();
  await page.getByRole('status').filter({hasText: 'Scores may have changed'}).waitFor();
  assert.equal(await page.locator('.livebar-home').getAttribute('data-live-state'), 'cached');
  assert.ok(!(await page.locator('#liveTrackHome').innerText()).includes('● LIVE'));
  assert.equal(await page.getByRole('button').innerText(), 'Try again');
  mode = 'healthy'; await page.clock.fastForward(15000);
  await page.getByRole('status').filter({hasText: 'Updated'}).waitFor();
  assert.equal(await page.locator('.livebar-home').getAttribute('data-live-state'), 'ready');
  mode = 'empty'; await page.getByRole('button').click();
  await page.getByText('No games are scheduled in the current score feeds.').waitFor();
  assert.equal(await page.locator('#liveTrackHome').evaluate(element => getComputedStyle(element).animationName), 'none');
  mode = 'offline';
  await page.evaluate(() => localStorage.setItem('links-home-live-v2', JSON.stringify({events: [{state: 'in', league: 'NFL', away: {name: 'OLD'}, home: {name: 'OLD'}, detail: ''}], asOf: Date.now() - 600001})));
  await page.reload(); await page.getByRole('status').filter({hasText: 'could not refresh'}).waitFor();
  assert.ok(!(await page.locator('#liveTrackHome').innerText()).includes('OLD'));
  assert.equal(await page.evaluate(() => localStorage.getItem('links-home-live-v2')), null);
  mode = 'healthy'; await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await page.getByRole('status').filter({hasText: 'Updated'}).waitFor();
  assert.ok(hits >= 6); assert.deepEqual(errors, []);
  console.log('PASS 360px LINKS Live browser: same-origin scores, safe rendering, cached outage label, retry, empty state, expired cache removal, online recovery, no overflow.');
} finally {await browser.close();}
