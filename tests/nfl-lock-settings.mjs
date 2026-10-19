import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {nflWeekCutoff} from '../functions/lib/nfl-lock-settings.js';
import {nflPickGuard} from '../functions/lib/nfl-pick-guard.js';
const {db}=fixture();
assert.equal(await nflWeekCutoff(db,1,7),null);
const cutoff=new Date(Date.now()-60000).toISOString();
db.raw.prepare('INSERT INTO pool_settings(pool_id,key,value) VALUES(?,?,?)').run(1,'game_settings:nfl-pick-em:7',JSON.stringify({lockAt:cutoff}));
assert.equal(await nflWeekCutoff(db,1,7),Date.parse(cutoff));
assert.equal(await nflWeekCutoff(db,2,7),null);
assert.equal(await nflWeekCutoff(db,1,8),null);
for(const body of [{eventId:'future',selection:'BUF'},{eventId:'__TIEBREAKER__',selection:'40'}]){
 const r=await nflPickGuard(new Request('https://test/',{headers:{Authorization:'Bearer alice'}}),db,1,'Alice',7,body);
 assert.equal(r.response.status,403);assert.match((await r.response.json()).error,/deadline/);
}
db.raw.prepare('UPDATE pool_settings SET value=? WHERE pool_id=1').run(JSON.stringify({lockAt:''}));
assert.equal(await nflWeekCutoff(db,1,7),null);
console.log('NFL per-pool/week cutoff and pick/tiebreaker enforcement PASS');
