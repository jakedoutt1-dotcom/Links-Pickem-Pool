import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeTrends,renderTrends} from '../public/new-build/personal-trends.mjs';
test('Personal trends count final outcomes, share ranks, separate partial periods and use a completed-period streak',()=>{
 const history=[{period:'02',label:'Week 2',complete:true,winners:['Alice'],rows:[{player:'Alice',wins:2,losses:0},{player:'Bob',wins:1,losses:1}]},{period:'01',label:'Week 1',complete:true,winners:['Bob'],rows:[{player:'Alice',wins:1,losses:1},{player:'Bob',wins:2,losses:0}]},{period:'03',label:'Week 3',complete:false,winners:[],rows:[{player:'Alice',wins:0,losses:1},{player:'Bob',wins:0,losses:1}]}];
 const s=summarizeTrends(history,'ALICE');assert.equal(s.wins,3);assert.equal(s.losses,2);assert.equal(s.accuracy,60);assert.equal(s.rank,1);assert.equal(s.best.label,'Week 2');assert.equal(s.streak,1);assert.deepEqual(s.periods.map(p=>p.rank),[2,1,1]);assert.equal(history[0].period,'02','Input order is unchanged');
 assert.match(renderTrends(history,'Alice'),/In progress/);assert.match(renderTrends([], 'Alice'),/No sample results/);
});
test('Trends escape names and labels and never invent an accuracy with no final results',()=>{
 const data=[{period:'01',label:'<img src=x>',complete:true,winners:[],rows:[{player:'<script>bad</script>',wins:1,losses:0}]}];const html=renderTrends(data,'<script>bad</script>');assert(!html.includes('<script>'));assert(!html.includes('<img src=x>'));assert.equal(summarizeTrends([], 'Nobody').accuracy,null);
});
