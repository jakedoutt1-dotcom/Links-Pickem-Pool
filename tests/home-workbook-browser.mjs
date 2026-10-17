import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';

const require = createRequire(import.meta.url), {chromium} = require('playwright');
const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));
const mime = {'.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.zip':'application/zip', '.json':'application/json'};
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const errors = [], missing = [];
const fixturePassword = 'test-' + crypto.randomUUID();
const fixtureZip = Buffer.from([0x50,0x4b,3,4, ...Buffer.from('synthetic private download')]);
const privateRequests = [];
let privateEnabled = true;
const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/new-build/api/workbook-private-download') {
    const chunks = []; for await (const chunk of request) chunks.push(chunk);
    const data = JSON.parse(Buffer.concat(chunks).toString());
    privateRequests.push({method:request.method, data});
    const status = !privateEnabled ? 404 : data.password === fixturePassword ? 200 : 401;
    response.writeHead(status, {'Content-Type':status === 200 ? 'application/zip' : 'application/json', 'Cache-Control':'no-store'});
    return response.end(status === 200 ? fixtureZip : JSON.stringify({error:'Download denied.'}));
  }
  if (url.pathname === '/new-build/api/live-scores') {
    response.writeHead(200, {'Content-Type':'application/json'});
    return response.end(JSON.stringify({asOf:Date.now(), unavailable:[], events:[{id:'example', league:'NFL', state:'in', away:{name:'DAL',score:'17'}, home:{name:'SEA',score:'14'}, detail:'3rd quarter'}]}));
  }
  if (url.pathname.includes('/api/')) {response.writeHead(401, {'Content-Type':'application/json'}); return response.end(JSON.stringify({error:'Sign in to use account tools.'}));}
  const requested = url.pathname === '/' ? '/new-build/index.html' : url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname;
  const file = path.resolve(publicRoot, '.' + decodeURIComponent(requested));
  if (!file.startsWith(path.resolve(publicRoot) + path.sep)) {response.writeHead(404); return response.end();}
  try {
    let body = await readFile(file);
    if (url.pathname === '/') body = Buffer.from(body.toString().replace('<head>', '<head><base href="/new-build/">'));
    const headers = {'Content-Type':mime[path.extname(file)] || 'application/octet-stream', 'Content-Length':body.length};
    if (path.extname(file) === '.zip') headers['Content-Disposition'] = 'attachment; filename="' + path.basename(file) + '"';
    response.writeHead(200, headers); response.end(body);
  } catch {missing.push(url.pathname); response.writeHead(404); response.end('Not found');}
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({channel:'msedge', headless:true});
try {
  await mkdir('output/home-workbook', {recursive:true});
  for (const width of [360, 1280]) {
    const context = await browser.newContext({viewport:{width, height:900}, acceptDownloads:true, reducedMotion:'reduce'});
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) return route.abort('blockedbyclient');
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/');
    await page.locator('.live-status-home').filter({hasText:'Updated'}).waitFor();
    assert.equal(await page.locator('#liveTrackHome').getAttribute('class'), 'live-track-home');
    assert.equal(await page.locator('.live-refresh-home').count(), 1);
    assert.equal(await page.evaluate(() => {
      const children = [...document.querySelector('main').children];
      return children.indexOf(document.querySelector('#games')) < children.indexOf(document.querySelector('#excelWorkbook')) &&
        children.indexOf(document.querySelector('#excelWorkbook')) < children.indexOf(document.querySelector('#trivia-night'));
    }), true, 'Workbook banner is below Pools and above the Game Room');
    await page.locator('#excelWorkbook').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('#excelWorkbook img')].every(image => image.complete && image.naturalWidth > 0));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Homepage fits at ' + width);
    await page.locator('#excelWorkbook').screenshot({path:'output/home-workbook/banner-' + width + '.png'});
    await page.getByRole('link', {name:'See the workbook'}).click();
    await page.getByRole('heading', {level:1}).waitFor();
    assert.match(page.url(), /excel-workbook\.html$/);
    assert.equal(await page.getByRole('link', {name:'Download for Windows', exact:false}).first().isVisible(), true, 'Public workbook downloads need no password');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Workbook page fits at ' + width);
    await page.waitForFunction(() => [...document.images].filter(image => image.loading !== 'lazy').every(image => image.complete && image.naturalWidth > 0));
    await page.screenshot({path:'output/home-workbook/page-' + width + '.png'});
    await page.locator('.hero').screenshot({path:'output/home-workbook/page-hero-' + width + '.png'});
    if (width === 360) {
      for (const version of ['Windows', 'Mac']) {
        const link = page.getByRole('link', {name:'Download for ' + version, exact:false}).first();
        const downloadPath = await link.getAttribute('href');
        assert.equal(downloadPath, '/downloads/nfl-crew-' + version.toLowerCase() + '.zip');
        const event = page.waitForEvent('download');
        await link.click();
        const download = await event, local = await download.path();
        assert.equal(await download.failure(), null);
        const actual = await readFile(local), expected = await readFile(path.join(publicRoot, downloadPath));
        assert.equal(actual.subarray(0, 2).toString(), 'PK', 'Download must be a real ZIP');
        assert.equal(digest(actual), digest(expected), version + ' download is complete');
        assert.ok(actual.length > 100000, 'Workbook ZIP is not an empty placeholder');
      }
      await page.locator('#destinyDownload').click();
      assert.equal(await page.locator('#destinyDownloadDialog').evaluate(dialog => dialog.open), true);
      await page.locator('#destinyPassword').fill('wrong');
      await page.locator('#destinyConfirmDownload').click();
      await page.locator('#destinyDialogMessage').filter({hasText:'not accepted'}).waitFor();
      assert.equal(await page.locator('#destinyPassword').getAttribute('aria-invalid'), 'true');
      for (const version of ['Windows', 'Mac']) {
        if (version === 'Mac') await page.locator('#destinyDownload').click();
        await page.locator('#destinyVersion').selectOption(version.toLowerCase());
        await page.locator('#destinyPassword').fill(fixturePassword);
        const event = page.waitForEvent('download');
        await page.locator('#destinyConfirmDownload').click();
        const download = await event;
        assert.equal(download.suggestedFilename(), 'Destiny-NFL-Crew-' + version + '.zip');
        assert.equal(digest(await readFile(await download.path())), digest(fixtureZip));
        await page.locator('#destinyDownloadDialog').waitFor({state:'hidden'});
        assert.equal(await page.locator('#destinyPassword').inputValue(), '');
      }
      await page.locator('#destinyDownload').click();
      await page.locator('#destinyPassword').fill(fixturePassword);
      await page.locator('#destinyDialogClose').click();
      await page.waitForFunction(() => document.getElementById('destinyPassword').value === '');
      assert.equal(await page.locator('#destinyPassword').inputValue(), '');
      privateEnabled = false;
      await page.locator('#destinyDownload').click();
      await page.locator('#destinyPassword').fill(fixturePassword);
      await page.locator('#destinyConfirmDownload').click();
      await page.locator('#destinyDialogMessage').filter({hasText:'no longer available'}).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Private dialog fits on mobile');
      await page.locator('#destinyDialogClose').click();
      assert.equal(await page.evaluate(value => JSON.stringify([location.href, Object.entries(localStorage), Object.entries(sessionStorage)]).includes(value), fixturePassword), false, 'Private password never goes in URLs or browser storage');
      assert.equal(privateRequests.length, 4);
      assert.ok(privateRequests.every(item => item.method === 'POST'));
      assert.deepEqual(privateRequests.map(item => item.data.version), ['windows','windows','mac','windows']);
    }
    await context.close();
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(missing, []);
  console.log('PASS homepage placement, public page, live score integration, 360/1280 layouts, complete Windows/Mac ZIPs, private password errors/success/removal, password clearing and no browser storage.');
} finally {await browser.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve));}
