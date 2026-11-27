import assert from 'node:assert/strict';
import {playoffNavigation} from '../public/new-build/cfp-navigation.mjs';
for(const pool of ['1','42','987']){
 const entry=playoffNavigation(new URLSearchParams({pool}),{season:2026});
 const practice=playoffNavigation(new URL(entry.practiceHref,'https://test/new-build/').searchParams,{pool:'OTHER',season:2027});
 assert.equal(practice.returnHref,`./cfp.html?pool=${pool}&season=2026`);
 assert.equal(practice.returnLabel,'Back to your pool bracket');
 assert(!practice.returnHref.includes('event=links'));
}
const hosted=playoffNavigation(new URLSearchParams('event=links'),{pool:'42',season:2026});
assert.equal(playoffNavigation(new URL(hosted.practiceHref,'https://test/').searchParams,{pool:'42'}).returnHref,'./cfp.html?event=links');
assert.equal(playoffNavigation(new URLSearchParams('demo=1'),{pool:'42'}).returnHref,'./cfp.html?event=links','Direct practice must not inherit an unrelated cached pool');
assert.equal(playoffNavigation(new URLSearchParams('demo=1&pool=42'),{season:2026}).returnHref,'./cfp.html?pool=42&season=2026','Keep older pool-scoped practice links working');
assert.match(playoffNavigation(new URLSearchParams(),{pool:'42',season:2026}).practiceHref,/returnPool=42/);
console.log('PASS CFP navigation: correct pool and season round-trip, hosted return, direct practice and unrelated cached membership');
