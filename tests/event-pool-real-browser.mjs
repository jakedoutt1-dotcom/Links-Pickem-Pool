import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest} from '../functions/new-build/api/event-pool.js';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const openAdminTool = require('./helpers/open-admin-tool.cjs');
const {db} = fixture();
db.raw.exec("INSERT INTO pool_active_games VALUES(1,'masters',0,1,'2026-01-01'),(1,'nascar',0,1,'2026-01-01')");

const drivers = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'];
const upcoming = {id: '123', name: 'Upcoming Cup Race', date: '2090-10-01T12:00:00Z', drivers};
const past = {id: '124', name: 'Past Cup Race', date: '2020-10-01T12:00:00Z', drivers};
const originalFetch = globalThis.fetch;
const browser = await chromium.launch({channel: 'msedge', headless: true});

try {
  globalThis.fetch = async (input, options) => {
    if (String(input).includes('nascar.com/cacher/live/')) return Response.json({});
    return originalFetch(input, options);
  };

  for (const game of ['golf', 'nascar']) {
    const context = await browser.newContext({viewport: {width: 390, height: 844}});
    let queue = Promise.resolve();
    await context.route('**/*', async route => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.hostname !== 'event.test') return route.fulfill({status: 204, body: ''});
      if (url.pathname.endsWith('/api/nascar-schedule')) {
        if (url.searchParams.has('raceId')) {
          assert.equal(url.searchParams.get('raceId'), upcoming.id);
          return route.fulfill({json: {race: upcoming, message: 'Review the driver field.'}});
        }
        return route.fulfill({json: {source: 'Fixture', races: [past, upcoming]}});
      }
      if (url.pathname.endsWith('/api/event-pool')) {
        queue = queue.then(() => onRequest({
          env: {DB: db},
          request: new Request(req.url(), {
            method: req.method(),
            headers: req.headers(),
            ...(req.method() === 'POST' ? {body: req.postData()} : {})
          })
        }));
        const response = await queue;
        return route.fulfill({status: response.status, body: await response.text(), contentType: 'application/json'});
      }
      if (url.pathname.includes('/api/')) {
        return route.fulfill({json: {options: [], picks: [], settings: {}}});
      }
      if (/\/(shell|build|session-security)\.js$/.test(url.pathname)) {
        return route.fulfill({
          contentType: 'text/javascript',
          body: "window.LINKS_GAME_KEY=x=>x;window.LINKS_API_FETCH=(u,o={})=>fetch(u,{...o,headers:{...o.headers,Authorization:'Bearer '+localStorage.getItem('test-token')}});"
        });
      }
      const file = path.join('public', decodeURIComponent(url.pathname));
      const contentType = /\.(js|mjs)$/.test(file) ? 'text/javascript' :
        file.endsWith('.html') ? 'text/html' : file.endsWith('.css') ? 'text/css' : 'image/png';
      return fs.existsSync(file) ? route.fulfill({path: file, contentType}) : route.fulfill({status: 404, body: ''});
    });

    const url = 'https://event.test/new-build/' + game + '.html?pool=1';
    const host = await context.newPage();
    await host.addInitScript(() => localStorage.setItem('test-token', 'admin'));
    await host.goto(url);
    const tab = host.locator('[data-view=admin]');
    await tab.waitFor();
    assert.equal(await host.locator('#eventSelect').isVisible(), false);

    const form = host.locator('#eventSetup');
    let eventId;
    let eventTitle;
    if (game === 'nascar') {
      await host.getByRole('button', {name: 'Set up a race', exact: true}).click();
      await form.waitFor({state: 'visible'});
      const schedule = form.locator('select:not([name])');
      await schedule.locator('option[value="123"]').waitFor({state: 'attached'});
      assert.equal(await schedule.isVisible(), true, 'commissioner can choose a race immediately after setup opens');
      assert.equal(await schedule.locator('option[value="124"]').count(), 0, 'completed races stay out of new race setup');
      await schedule.selectOption(upcoming.id);
      eventId = 'race-' + upcoming.id;
      eventTitle = upcoming.name;
      await host.waitForFunction(() => document.querySelector('[name=field]')?.value.split('\n').length === 6);
      assert.equal(await form.locator('[name=title]').inputValue(), eventTitle);
      assert.equal(await form.locator('[name=field]').inputValue(), drivers.join('\n'));
      const importedDeadline = await form.locator('[name=lockAt]').inputValue();
      assert.match(importedDeadline, /^2090-10-01T/);
      const publish = form.getByRole('button', {name: 'Publish race for picks', exact: true});
      await form.locator('[name=lockAt]').fill('2020-01-01T12:00');
      await publish.click();
      await host.locator('#setupStatus').filter({hasText: 'Choose a future deadline.'}).waitFor();
      assert.equal(await form.locator('[name=title]').inputValue(), eventTitle);
      assert.equal(await form.locator('[name=field]').inputValue(), drivers.join('\n'));
      assert.equal(await publish.isEnabled(), true);
      await form.locator('[name=lockAt]').fill(importedDeadline);
      await publish.click();
      await host.getByText('Race published. Players can make their picks.', {exact: true}).waitFor();
      await host.locator('.event-choice').first().waitFor();
    } else {
      await tab.click();
      await openAdminTool(host, form);
      eventId = 'check-golf';
      eventTitle = 'Stroke Play Test';
      await form.locator('[name=id]').fill(eventId);
      await form.locator('[name=title]').fill(eventTitle);
      await form.locator('[name=lockAt]').fill('2090-01-01T12:00');
      await form.locator('[name=field]').fill(drivers.join('\n'));
      await form.getByRole('button', {name: 'Save setup', exact: true}).click();
      await host.getByText('Saved to your pool.', {exact: true}).waitFor();
    }
    assert.equal(await host.locator('#eventSelect').inputValue(), eventId);

    if (game === 'nascar') await tab.click();
    await openAdminTool(host, host.locator('#newEvent'));
    await host.locator('#newEvent').click();
    assert.equal(await host.locator('#eventSelect').inputValue(), '');
    await host.locator('#eventSelect').selectOption(eventId);
    await host.waitForFunction(title => document.querySelector('[name=title]')?.value === title, eventTitle);
    await host.close();

    const player = await context.newPage();
    await player.addInitScript(() => localStorage.setItem('test-token', 'alice'));
    await player.goto(url);
    await player.locator('.event-choice').first().waitFor();
    assert.equal(await player.locator('#eventSelect').inputValue(), eventId);
    assert.equal(await player.locator('.event-heading h2').innerText(), eventTitle);
    assert.equal(await player.locator('[data-view=admin]').count(), 0);
    assert.equal(await player.getByRole('button', {name: 'Set up a race', exact: true}).count(), 0);
    for (let i = 0; i < (game === 'golf' ? 6 : 1); i++) await player.locator('.event-choice').nth(i).click();
    await player.locator('#saveEvent').click();
    await player.getByText('Saved to your pool.', {exact: true}).waitFor();
    await player.reload();
    await player.locator('#entryReview').waitFor();
    assert.match(await player.locator('#entryReview').innerText(), /One/);
    assert.equal(await player.locator('.event-legacy').isVisible(), false);
    assert.equal(await player.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await context.close();
  }
  console.log('PASS real Golf and NASCAR pages, upcoming-only NASCAR import, one-step publishing, player entry and reload, and phone-width layout.');
} finally {
  globalThis.fetch = originalFetch;
  await browser.close();
  db.raw.close();
}
