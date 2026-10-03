import assert from 'node:assert/strict';
import {tournaments,golfers,onRequest} from '../functions/new-build/api/golf-schedule.js';
const events=tournaments({leagues:[{calendar:[{id:'123',label:'Masters',startDate:'2026-04-09',endDate:'2026-04-12'},{id:'bad',startDate:'invalid'}]}]});assert.equal(events.length,1);
const feed={events:[{id:'123',competitions:[{competitors:[{athlete:{displayName:'Golfer A'}},{athlete:{displayName:'Golfer A'}},{athlete:{fullName:'Golfer B'}}]}]},{id:'456',competitions:[{competitors:[{athlete:{displayName:'Wrong event'}}]}]}]};
assert.deepEqual(golfers(feed,'123'),['Golfer A','Golfer B']);assert.deepEqual(golfers(feed,'999'),[]);
assert.equal((await onRequest({request:new Request('https://test/?pool=1'),env:{}})).status,403);
console.log('PASS golf calendar, event isolation, duplicate golfers, unavailable field and authorization');

assert.equal(tournaments({leagues:[{calendar:['Presidents Cup','Ryder Cup','Zurich Classic','World Match Play'].map((label,i)=>({id:String(i+1),label,startDate:'2026-04-09',endDate:'2026-04-12'}))}]}).length,0);
