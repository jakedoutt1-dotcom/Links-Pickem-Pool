import assert from 'node:assert/strict';
import {initializeWeeklyAccess} from '../functions/lib/weekly-access-default.js';
let queries=0;
const DB={prepare(){queries++;throw Error('Account loading must not query NFL access or fetch a feed')}};
for(const route of ['player-account','login-transition','pool-switcher'])await initializeWeeklyAccess({request:new Request('https://linkspickempools.com/new-build/api/'+route,{headers:{Authorization:'Bearer existing'}}),env:{DB}});
assert.equal(queries,0);
console.log('PASS account and locker loading do not depend on NFL weekly access or sports feeds');
