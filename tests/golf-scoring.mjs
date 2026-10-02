import assert from 'node:assert/strict';
import {parseGolf} from '../functions/lib/golf-results.js';
const golfer=(name,status,score,extra={})=>({athlete:{displayName:name},status:{type:{name:status},position:{displayName:'1'}},score:{value:276,displayValue:score},...extra});
const event={id:'123',league:{slug:'pga'},name:'Test',status:{type:{completed:true,state:'post'}},competitions:[{status:{period:4},competitors:[golfer('A','STATUS_FINISH','-12',{earnings:100,statistics:[{name:'officialAmount',displayValue:'$100'}]}),golfer('B','STATUS_CUT','+6'),golfer('C','STATUS_WITHDRAWN','-2'),golfer('D','STATUS_FINISH','E')]}]};
const final=parseGolf({events:[event]},'123');assert.equal(final.results.A.score,-12);assert.equal(final.results.A.earnings,100);assert.equal(final.results.B.status,'cut');assert.equal(final.results.C.status,'withdrawn');assert.equal(final.results.D.score,0);assert.equal(final.results.D.earnings,undefined);
assert.deepEqual(parseGolf({events:[{...event,status:{type:{state:'in',completed:false}}}]},'123').results,{});
assert.throws(()=>parseGolf({events:[event]},'999'),/not found/);
console.log('PASS golf final gating, correct event, to-par versus strokes, cut/withdrawal, even par, unavailable earnings');
