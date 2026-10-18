import assert from 'node:assert/strict';
import {choosePreselection,resolvePreselection,preselectOptions} from '../public/new-build/poker-preselect.mjs';
const initial = () => ({code:'TESTROOM',status:'playing',table:{id:'table-1',phase:'preflop',handNumber:1,actorId:'other',currentBet:50,minRaise:50,bigBlind:50,players:[{id:'me',inHand:true,stack:500,streetBet:0},{id:'other',inHand:true,stack:500,streetBet:50}]}});
const turn = room => {room.table.actorId='me';room.table.legalActions={canFold:true,canCheck:false,canCall:true,callAmount:50,canRaise:true,minRaiseTo:100,maxRaiseTo:500};return room;};
let room=initial(),choice=choosePreselection(room,'me','call');
assert.equal(resolvePreselection(choice,room,'me').state,'waiting');
assert.deepEqual(resolvePreselection(choice,turn(room),'me'),{state:'ready',move:'call'});
for(const mutate of [r=>r.table.currentBet=100,r=>r.table.phase='flop',r=>r.table.handNumber++,r=>r.table.id='table-2',r=>r.status='paused',r=>r.code='ANOTHER',r=>r.table.players[0].stack--,r=>r.table.players[0].streetBet++,r=>r.table.players[0].folded=true,r=>r.table.players[0].sittingOut=true]){
 room=initial();choice=choosePreselection(room,'me','call');mutate(room);assert.equal(resolvePreselection(choice,turn(room),'me').state,'cancel');
}
room=initial();room.table.currentBet=0;choice=choosePreselection(room,'me','call');turn(room).table.legalActions.canCheck=true;
assert.deepEqual(resolvePreselection(choice,room,'me'),{state:'ready',move:'check'});
room=initial();choice=choosePreselection(room,'me','call');turn(room).table.legalActions.callAmount=51;
assert.equal(resolvePreselection(choice,room,'me').state,'cancel','A call never exceeds the approved amount');
room=initial();choice=choosePreselection(room,'me','fold');turn(room).table.currentBet=200;
assert.deepEqual(resolvePreselection(choice,room,'me'),{state:'ready',move:'fold'});
room=initial();choice=choosePreselection(room,'me','raise',150);turn(room);
assert.deepEqual(resolvePreselection(choice,room,'me'),{state:'ready',move:'raise',amount:150});
room.table.legalActions.canRaise=false;assert.equal(resolvePreselection(choice,room,'me').state,'cancel','Short raises may not reopen action');
room=initial();choice=choosePreselection(room,'me','raise',150);turn(room).table.minRaise=100;assert.equal(resolvePreselection(choice,room,'me').state,'cancel');
room=initial();assert.equal(choosePreselection(room,'me','raise',99),null);assert.equal(choosePreselection(room,'me','raise',501),null);assert.equal(choosePreselection(room,'me','raise',100.5),null);
room.table.players[0].stack=80;choice=choosePreselection(room,'me','raise',80);turn(room).table.legalActions.maxRaiseTo=80;
assert.deepEqual(resolvePreselection(choice,room,'me'),{state:'ready',move:'raise',amount:80},'A valid short all-in raise keeps its exact total');
room=initial();room.table.players[0].stack=30;choice=choosePreselection(room,'me','call');turn(room).table.legalActions.callAmount=30;
assert.deepEqual(resolvePreselection(choice,room,'me'),{state:'ready',move:'call'});
for(const phase of ['showdown','waiting','complete']){room=initial();room.table.phase=phase;assert.equal(preselectOptions(room,'me').waiting,false);}
assert.equal(preselectOptions(initial(),'spectator').waiting,false);assert.equal(choosePreselection(turn(initial()),'me','fold'),null);
console.log('PASS preselection: fixed call cap, check, fold, exact raise, short all-ins, changed bets/streets/hands/tables/seat state, paused games, non-reopened action and spectators.');
