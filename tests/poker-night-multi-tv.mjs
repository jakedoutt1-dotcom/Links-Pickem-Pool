import assert from 'node:assert/strict';
import {createTournament,joinTournament,startTournament,tournamentView} from '../functions/lib/poker-tournament.js';
const state=createTournament({code:'ABC1234567',mode:'tournament',ownerSeat:'host',hostHash:'host-secret',displayKey:'display-secret',player:{id:'host-id',name:'Host'},settings:{}},Date.now());
for(let i=1;i<18;i++)joinTournament(state,'seat-'+i,{id:'player-'+i,name:'Player '+i});
startTournament(state);assert.equal(state.tables.length,2);
const [one,two]=state.tables,original=state.featuredTableId;
for(const tableId of [one.id,two.id]){
 const view=tournamentView(state,'',{tv:true,tableId});assert.equal(view.table.id,tableId);
 assert.ok(view.tables.every(t=>t.players.every(p=>p.holeCards.length===0)),'Both TVs get only public cards');
 assert.equal(view.displayKey,undefined);assert.equal(view.isHost,false);assert.equal(view.table.canShowHand,false);
}
assert.equal(state.featuredTableId,original,'TV selection never mutates shared selection');
state.featuredTableId=two.id;
assert.equal(tournamentView(state,'',{tv:true}).table.id,two.id,'Unpinned TVs follow the host');
assert.equal(tournamentView(state,'',{tv:true,tableId:one.id}).table.id,one.id,'Pinned TVs ignore host changes');
const otherTable=state.tables.find(t=>t.id!==state.players.host.tableId);
assert.equal(tournamentView(state,'host',{tableId:otherTable.id}).table.id,state.players.host.tableId,'Player views stay on their own table');
state.tables=[two];
assert.equal(tournamentView(state,'',{tv:true,tableId:one.id}).table.id,two.id,'Closed-table TV switches to the remaining final table');
assert.equal(tournamentView(state,'',{tv:true,tableId:'<invalid>'}).table.id,two.id,'Invalid selections safely fall back');
console.log('PASS multiple independent TVs: separate selections, featured fallback, table closure/final table, player isolation and private-card protection.');
