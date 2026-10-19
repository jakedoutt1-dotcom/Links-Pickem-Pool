import assert from 'node:assert/strict';
import {createTable,publicTable} from '../functions/lib/poker-night.js';
const table=createTable('table-1',[{id:'me',name:'Player'},{id:'other',name:'Opponent'}]);
const cases=[
 [['As','Kh'],[],'High card'],[['Ac','Ad'],[],'One pair'],
 [['Ac','Ad'],['2s','7h','Kd'],'One pair'],
 [['Ac','Kh'],['Ad','Ks','2c'],'Two pair'],
 [['Ac','Ad'],['Ah','Ks','2c'],'Three of a kind'],
 [['9c','8d'],['7h','6s','5c'],'Straight'],
 [['Ac','Jc'],['8c','6c','2c'],'Flush'],
 [['Ac','Ad'],['Ah','Ks','Kc'],'Full house'],
 [['Ac','Ad'],['Ah','As','2c'],'Four of a kind'],
 [['9c','8c'],['7c','6c','5c'],'Straight flush'],
 [['Ac','Kc'],['Qc','Jc','Tc'],'Royal flush'],
 [['2c','3d'],['Ah','As','Kh','Ks','Qd'],'Two pair'],
];
for(const [cards,board,name] of cases){
 table.players[0].holeCards=cards;table.players[1].holeCards=['4h','4s'];table.board=board;table.phase=board.length?'flop':'preflop';
 const own=publicTable(table,'me');assert.equal(own.yourHandName,name);
 const otherName=publicTable(table,'other').yourHandName;
 table.players[0].holeCards=[];
 assert.equal(publicTable(table,'other').yourHandName,otherName,'Opponent label is independent of private player cards');
 table.players[0].holeCards=cards;
 assert.equal(publicTable(table,'me',{tv:true}).yourHandName,null,'TV never gets private hand strength');
 assert.equal(publicTable(table,null).yourHandName,null,'Spectators get no private label');
}
table.players[0].holeCards=[];assert.equal(publicTable(table,'me').yourHandName,null);
console.log('PASS private hand labels: preflop, all hand categories, board-only combinations, live board updates, empty seats and TV/spectator privacy.');
