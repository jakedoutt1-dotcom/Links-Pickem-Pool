import assert from 'node:assert/strict';
import {createHandRecap,recapLines} from '../public/new-build/poker-recap.mjs';
const recap = createHandRecap();
const table = {id:'table-1',handNumber:1,phase:'showdown',buttonSeat:8,board:['As','Kd','7h','4s','2c'],
  players:[{id:'a',name:'Alex',seat:0,holeCards:['Ah','Ad']},{id:'b',name:'Blair',seat:3,holeCards:['Kh','Ks']}],
  winners:[{playerId:'a',name:'Alex',amount:151,handName:'Three of a kind',cards:['Ah','Ad','As','Kd','7h']},{playerId:'b',name:'Blair',amount:150,handName:'Three of a kind'}],
  pots:[{amount:101,winnerIds:['b','a']},{amount:200,winnerIds:['a','b']}]};
let result=recap.update('ROOM',table);
assert.deepEqual(result.pots[0].winners,[{name:'Alex',amount:51},{name:'Blair',amount:50}],'Odd chip follows the button clockwise');
assert.equal(result.pots[1].label,'Side pot 1');
assert.ok(recapLines(result).some(line=>line.includes('Main pot · 101')));
assert.ok(recapLines(result).some(line=>line.includes('Side pot 1 · 200')));
assert.deepEqual(result.winners[0].cards,['Ah','Ad','As','Kd','7h'],'Public winning five retained');
assert.equal(JSON.stringify(result).includes('Kh'),false,'Other private hole cards are never retained');
assert.equal(JSON.stringify(result).includes('holeCards'),false);
table.board[0]='Qs';table.winners[0].name='Changed';
assert.equal(result.board[0],'As','Recap is independent of the live table');
assert.equal(result.winners[0].name,'Alex');
assert.equal(recap.update('ROOM',{id:'table-1',handNumber:2,phase:'preflop'}),result,'Recap survives the next deal');
assert.equal(recap.update('OTHER',{phase:'preflop'}),null,'Room change clears previous results');
const folded={...table,handNumber:3,winners:[{playerId:'a',name:'Alex',amount:75,handName:'Uncontested',cards:['Ah','Ad','As','Kd','7h']}],pots:[{amount:75,winnerIds:['a']}]};
result=recap.update('OTHER',folded);
assert.deepEqual(result.winners[0].cards,[],'Uncontested wins keep cards private');
assert.match(recapLines(result)[0],/everyone else folded/);
assert.equal(recapLines(result).length,1,'Single pot does not repeat the award');
console.log('PASS public hand recap: main/side pots, split odd chips, private-card exclusion, next-hand persistence and room reset.');
