const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');

const source = readFileSync(new URL('../public/new-build/game-setup.js', require('node:url').pathToFileURL(__filename)), 'utf8');

async function openSetup(game, role, savedPoolId = 7) {
  const requests = [];
  const destinations = [];
  const elements = {
    setup: {elements: {title: {}, limit: {}, deadline: {}}},
    message: {},
    title: {},
    backToGame: {}
  };

  await runInNewContext(source, {
    URLSearchParams,
    location: {
      search: '?' + new URLSearchParams({pool: '7', game}),
      replace: destination => destinations.push(destination)
    },
    document: {getElementById: id => elements[id]},
    localStorage: {getItem: () => JSON.stringify({id: savedPoolId, code: 'POOL'})},
    window: {
      LINKS_API_FETCH: async url => {
        requests.push(url);
        const data = url === '/api/session' ? {role, poolCode: 'POOL'} : {};
        return {ok: true, json: async () => data};
      }
    }
  });

  return {requests, destinations, elements};
}

(async () => {
  const commissioner = await openSetup('NASCAR', 'admin');
  assert.deepEqual(commissioner.requests, ['/api/session']);
  assert.deepEqual(commissioner.destinations, ['./nascar.html?pool=7&view=admin']);

  for (const [role, poolId] of [['player', 7], ['admin', 8]]) {
    const unauthorized = await openSetup('NASCAR', role, poolId);
    assert.deepEqual(unauthorized.destinations, []);
    assert.match(unauthorized.elements.message.textContent, /Sign in as this pool’s commissioner/);
  }

  const golf = await openSetup('Golf', 'admin');
  assert.deepEqual(golf.destinations, []);
  assert.equal(golf.elements.setup.hidden, false);
  assert.equal(golf.elements.backToGame.href, './golf.html?pool=7');

  console.log('PASS NASCAR commissioner setup opens the modern race admin, unauthorized access is rejected, and Golf setup still opens.');
})().catch(error => {console.error(error);process.exitCode = 1;});
