import assert from 'node:assert/strict';
import {view,puzzle} from '../functions/lib/dead-air.js';
const s={code:'TEST',game:1,phaseId:7,phase:'challenge',startsAt:10000,deadline:35000,players:{a:{name:'A'}},responses:{},challenge:puzzle('frequency',2)};
for(const phase of ['brief','observe']){s.phase=phase;const v=view(s,'a',20000);assert.deepEqual(v.challenge.clues,[]);assert.deepEqual(v.challenge.options,[])}
for(const phase of ['challenge','final']){s.phase=phase;s.finalType='frequency';for(const [elapsed,count]of [[0,1],[4999,1],[5000,2],[9999,2],[10000,3]]){for(const display of [false,true]){const v=view(s,display?'':'a',10000+elapsed,display);assert.equal(v.challenge.clues.length,count);assert.equal(v.challenge.correct,undefined);assert.equal(v.challenge.nextClueAt,count<3?10000+count*5000:null);if(count<3)assert(!JSON.stringify(v).includes(s.challenge.clues[2]))}}}
s.phase='finalAnswer';assert.equal(view(s,'a',10000).challenge.clues.length,3);assert.equal(view(s,'a',10000).challenge.correct,s.challenge.correct);
console.log('PASS staged clues at 0/5/10 seconds, no early API leakage, matching TV/phone and final round reveals.');
