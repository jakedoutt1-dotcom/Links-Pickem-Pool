import assert from 'node:assert/strict';
import {onRequest, normalizeLiveEvents} from '../functions/new-build/api/live-scores.js';
import {validLiveSnapshot} from '../public/new-build/home-live.mjs';

const event = (state = 'in') => ({id: '123', date: '2026-10-17T18:00:00Z',
  status: {type: {state, shortDetail: '2nd quarter'}}, competitions: [{competitors: [
    {homeAway: 'away', team: {abbreviation: 'AWY'}, score: '17'},
    {homeAway: 'home', team: {abbreviation: 'HME'}, score: '10'},
  ]}]});
assert.equal(normalizeLiveEvents([{}, event()], 'NFL').length, 1);
assert.equal(normalizeLiveEvents([event('pre')], 'NFL')[0].away.score, '');
assert.equal(normalizeLiveEvents([event('post'), event('pre'), event()], 'NFL')[0].state, 'in');
assert.equal(normalizeLiveEvents(Array.from({length: 20}, () => event()), 'NFL').length, 8);
const current = {events: normalizeLiveEvents([event()], 'NFL'), asOf: Date.now(), unavailable: []};
assert.equal(validLiveSnapshot(current), true);
assert.equal(validLiveSnapshot({...current, asOf: Date.now() - 600001}), false);
assert.equal(validLiveSnapshot({...current, asOf: Date.now() + 60001}), false);
assert.equal(validLiveSnapshot({...current, events: [{state: 'in'}]}), false);

const originalFetch = globalThis.fetch, originalCaches = globalThis.caches, originalTimeout = globalThis.setTimeout;
let calls = [], mode = 'healthy';
const entries = new Map();
globalThis.caches = {default: {
  async match(request) {return entries.get(request.url)?.clone();},
  async put(request, response) {entries.set(request.url, response.clone());},
}};
globalThis.fetch = async (url, options) => {
  calls.push(String(url));
  assert.equal(new URL(url).hostname, 'site.api.espn.com');
  assert.equal(options.headers.Authorization, undefined);
  assert.ok(options.signal);
  if (mode === 'down' || mode === 'partial' && String(url).includes('/nfl/')) throw Error('offline');
  if (mode === 'timeout' && String(url).includes('/nfl/')) return new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(Error('timed out')), {once: true}));
  if (mode === 'bad') return Response.json({error: 'not a scoreboard'});
  return Response.json({events: mode === 'empty' ? [] : [event()]});
};
const request = method => new Request('https://links.test/new-build/api/live-scores?url=https://untrusted.invalid', {method});
try {
  let response = await onRequest({request: request('GET')}), payload = await response.json();
  assert.equal(response.status, 200); assert.equal(payload.events.length, 7);
  assert.equal(calls.length, 7); assert.deepEqual(payload.unavailable, []);
  assert.ok(payload.asOf > Date.now() - 1000);
  await onRequest({request: request('GET')}); assert.equal(calls.length, 7, 'repeat request reuses server cache');
  assert.equal((await onRequest({request: request('POST')})).status, 405);
  entries.clear(); mode = 'partial';
  response = await onRequest({request: request('GET')}); payload = await response.json();
  assert.equal(response.status, 200); assert.equal(payload.events.length, 6); assert.deepEqual(payload.unavailable, ['NFL']);
  entries.clear(); mode = 'timeout'; globalThis.setTimeout = (callback, ms) => originalTimeout(callback, ms === 5000 ? 5 : ms);
  response = await onRequest({request: request('GET')}); payload = await response.json();
  assert.equal(response.status, 200); assert.equal(payload.events.length, 6); assert.deepEqual(payload.unavailable, ['NFL']);
  globalThis.setTimeout = originalTimeout;
  entries.clear(); mode = 'down';
  response = await onRequest({request: request('GET')}); payload = await response.json();
  assert.equal(response.status, 503); assert.deepEqual(payload.events, []); assert.ok(payload.error);
  entries.clear(); mode = 'empty';
  response = await onRequest({request: request('GET')}); payload = await response.json();
  assert.equal(response.status, 200); assert.deepEqual(payload.events, []); assert.deepEqual(payload.unavailable, []);
  mode = 'bad'; assert.equal((await onRequest({request: request('GET')})).status, 503);
  mode = 'healthy'; response = await onRequest({request: request('HEAD')});
  assert.equal(response.status, 200); assert.equal(await response.text(), '');
} finally {globalThis.fetch = originalFetch; globalThis.caches = originalCaches; globalThis.setTimeout = originalTimeout;}
console.log('PASS public live feed: seven allowlisted leagues, cache reuse, partial/outage/empty handling, normalized scores, expiry and safe methods.');
