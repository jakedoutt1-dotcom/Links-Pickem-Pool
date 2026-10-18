import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {privateWorkbookDownload, parsePrivateWorkbookEnvelope, decryptPrivateWorkbook} from '../functions/lib/workbook-private-download.js';
import {onRequest} from '../functions/new-build/api/workbook-private-download.js';
import {workbookDownloadActivity,confirmWorkbookDownload} from '../functions/lib/workbook-download-activity.js';
import {onRequest as activityRequest} from '../functions/new-build/api/workbook-download-activity.js';

// Synthetic archives and a disposable password only. Customer files are never
// written by this regression test and no external services are contacted.
const password = 'fixture-' + crypto.randomUUID(), encoder = new TextEncoder();
const zip = new Uint8Array([0x50, 0x4b, 3, 4, ...encoder.encode('synthetic complete workbook package')]);
async function seal(bytes) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const base64 = value => btoa(String.fromCharCode(...value));
  const header = encoder.encode(JSON.stringify({v: 1, kdf: 'PBKDF2', hash: 'SHA-256', iterations: 100000, salt: base64(salt), iv: base64(iv)}));
  const prefix = new Uint8Array(8 + header.length); prefix.set(encoder.encode('LWX1'));
  new DataView(prefix.buffer).setUint32(4, header.length, false); prefix.set(header, 8);
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100000}, material,
    {name: 'AES-GCM', length: 256}, false, ['encrypt']);
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({name: 'AES-GCM', iv, additionalData: prefix, tagLength: 128}, key, bytes));
  const result = new Uint8Array(prefix.length + encrypted.length); result.set(prefix); result.set(encrypted, prefix.length); return result;
}
const sealed = await seal(zip), mac = await seal(zip);
assert.deepEqual(await decryptPrivateWorkbook(parsePrivateWorkbookEnvelope(sealed), password), zip);
await assert.rejects(decryptPrivateWorkbook(parsePrivateWorkbookEnvelope(sealed), 'wrong'));
const tampered = sealed.slice(); tampered[tampered.length - 1] ^= 1;
await assert.rejects(decryptPrivateWorkbook(parsePrivateWorkbookEnvelope(tampered), password));
assert.throws(() => parsePrivateWorkbookEnvelope(zip));
assert.notDeepEqual(sealed.subarray(0, 4), zip.subarray(0, 4));
assert.notDeepEqual(sealed, mac, 'each package has independent random encryption parameters');

const sql = new DatabaseSync(':memory:');
const db = {prepare(text) {let args = []; return {
  bind(...values) {args = values; return this;},
  async run() {return sql.prepare(text).run(...args);},
  async first() {return sql.prepare(text).get(...args) || null;},
  async all() {return {results:sql.prepare(text).all(...args)};},
};},async batch(statements){return Promise.all(statements.map(s=>s.run()));}};
let assetReads = 0, assetsAvailable = true, bodyOverride = null;
const env = {DB: db, ASSETS: {async fetch(request) {
  assetReads++;
  assert.equal(request.method, 'GET'); assert.equal(request.headers.get('Authorization'), null);
  assert.equal(request.headers.get('Cookie'), null); assert.equal(request.body, null);
  const path = new URL(request.url).pathname;
  assert.ok(['/downloads/private/destiny-windows.enc', '/downloads/private/destiny-mac.enc'].includes(path));
  return new Response(bodyOverride || (path.includes('windows') ? sealed : mac), {status: assetsAvailable ? 200 : 404});
}}};
const origin = 'https://workbook.test';
function request(input = {version: 'windows', password}, {method = 'POST', ip = 'first', headers = {}, body} = {}) {
  return new Request(origin + '/new-build/api/workbook-private-download', {method,
    headers: {Origin: origin, 'Content-Type': 'application/json', 'cf-connecting-ip': ip, ...headers},
    ...(method === 'POST' ? {body: body ?? JSON.stringify(input)} : {}),
  });
}
const call = (input, options) => onRequest({request: request(input, options), env});
try {
  assert.equal((await call(undefined, {method: 'GET'})).status, 405);
  assert.equal((await call(undefined, {headers: {Origin: 'https://other.test'}})).status, 403);
  assert.equal((await call({version: '../secret', password})).status, 400);
  assert.equal((await call(undefined, {body: 'x'.repeat(2049)})).status, 413);
  assert.equal((await call(undefined, {body: '{broken'})).status, 400);
  assert.equal(assetReads, 0);
  let response = await call({version: 'windows', password: ''}); assert.equal(response.status, 401);
  response = await call({version: 'windows', password: 'wrong'}); assert.equal(response.status, 401);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store, max-age=0');
  assert.equal((await response.json()).error.includes('password'), true);
  for (const version of ['windows', 'mac']) {
    response = await call({version, password});
    assert.equal(response.status, 200); assert.equal(response.headers.get('Content-Type'), 'application/zip');
    assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
    assert.match(response.headers.get('Content-Disposition'), /^attachment; filename="Destiny-NFL-Crew-(Windows|Mac)\.zip"$/);
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store, max-age=0');
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()), zip);
    const receipt=response.headers.get('X-Workbook-Download-Receipt');assert.ok(receipt);
    const before=await workbookDownloadActivity(db);assert.equal(before.summaries.find(r=>r.version===version).received,0);
    assert.equal((await call({action:'received',receipt})).status,200);
    const received=await workbookDownloadActivity(db),timestamp=received.summaries.find(r=>r.version===version).lastReceived;
    assert.equal(received.summaries.find(r=>r.version===version).received,1);
    assert.equal((await call({action:'received',receipt})).status,200,'Receipts are idempotent');
    assert.equal((await workbookDownloadActivity(db)).summaries.find(r=>r.version===version).lastReceived,timestamp);
  }
  assert.equal((await call({action:'received',receipt:crypto.randomUUID()})).status,404,'Cannot invent download history');
  assert.equal((await call({action:'received',receipt:'bad'})).status,404);
  assert.equal((await call({action:'received',receipt:crypto.randomUUID()},{headers:{Origin:'https://other.test'}})).status,403);
  response = await privateWorkbookDownload({request: request(), env}, {enabled: false}); assert.equal(response.status, 404);
  const readsBefore = assetReads;
  const attempts = await Promise.all(Array.from({length: 10}, () => call({version: 'windows', password: ''}, {ip: 'limited'})));
  assert.equal(attempts.filter(item => item.status === 401).length, 8);
  assert.equal(attempts.filter(item => item.status === 429).length, 2);
  assert.equal(assetReads, readsBefore, 'rate-limited requests do not read archives');
  response = await call(undefined, {ip: 'limited'}); assert.equal(response.status, 429); assert.equal(response.headers.get('Retry-After'), '900');
  sql.exec('UPDATE links_workbook_download_attempts SET window=window-1');
  response = await call(undefined, {ip: 'limited'}); assert.equal(response.status, 200);
  assetsAvailable = false; response = await call(undefined, {ip: 'asset-error'}); assert.equal(response.status, 503); assetsAvailable = true;
  bodyOverride = tampered; response = await call(undefined, {ip: 'tampered'}); assert.equal(response.status, 401);
  bodyOverride = zip; response = await call(undefined, {ip: 'plaintext'}); assert.equal(response.status, 503);
  response = await onRequest({request: request(), env: {ASSETS: env.ASSETS}}); assert.equal(response.status, 503, 'missing limiter fails closed');
  const tables = sql.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(row => row.name);
  assert.deepEqual(tables, ['links_workbook_download_attempts','links_workbook_download_activity'], 'download changes only its own tracking tables');
  const history=await workbookDownloadActivity(db);
  assert.equal(history.summaries.reduce((n,r)=>n+r.prepared,0),3,'Failed attempts and receipts do not count as new downloads');
  assert.equal(history.summaries.reduce((n,r)=>n+r.received,0),2);
  assert.ok(history.recent.every(r=>!('id' in r)&&!('password' in r)),'History contains no passwords or receipt tokens');
  const recentReceipt=sql.prepare('SELECT id FROM links_workbook_download_activity WHERE received_at IS NULL').get().id;
  sql.prepare('UPDATE links_workbook_download_activity SET prepared_at=? WHERE id=?').run(new Date(Date.now()-172800000).toISOString(),recentReceipt);
  assert.equal(await confirmWorkbookDownload(db,recentReceipt),false,'Expired receipt cannot change history');
  let activity=await activityRequest({env,request:new Request(origin+'/new-build/api/workbook-download-activity')});assert.equal(activity.status,401);
  sql.prepare('INSERT INTO links_admin_sessions(token,expires_at) VALUES(?,?)').run('owner-test-token',new Date(Date.now()+60000).toISOString());
  activity=await activityRequest({env,request:new Request(origin+'/new-build/api/workbook-download-activity',{headers:{Authorization:'Bearer owner-test-token'}})});
  assert.equal(activity.status,200);assert.match(activity.headers.get('Cache-Control'),/no-store/);assert.equal((await activity.json()).recent.length,3);
  assert.equal((await activityRequest({env,request:new Request(origin+'/new-build/api/workbook-download-activity',{headers:{Authorization:'Bearer wrong-token'}})})).status,401);
  console.log('PASS private workbook download: authenticated Windows/Mac bytes, wrong/empty password denied, tampering denied, no-store attachment, bounded input, origin/method checks, atomic rate limit, isolated DB table, disabled access and unavailable assets.');
} finally {sql.close();}
