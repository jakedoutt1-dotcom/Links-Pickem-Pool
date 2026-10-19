import assert from 'node:assert/strict';
import {computerMove} from '../functions/lib/poker-computer.js';
const table = (cards,board=[],extra={}) => ({phase:board.length ? 'flop' : 'preflop',board,currentBet:50,bigBlind:50,pot:150,buttonSeat:0,
 players:[{id:'bot',seat:0,holeCards:cards,stack:1000,streetBet:0,inHand:true},{id:'human',seat:1,holeCards:[],stack:1000,inHand:true}],
 legalActions:{canFold:true,canCheck:false,canCall:true,callAmount:50,canRaise:true,minRaiseTo:100,maxRaiseTo:1000},...extra});
let view=table(['As','Ah']);assert.equal(computerMove(view,'bot',()=>.4).type,'raise','Premium pairs raise for value');
view=table(['7c','2d']);view.pot=1000;view.currentBet=1000;view.legalActions={...view.legalActions,callAmount:1000,canRaise:false};
for(const roll of [0,.03,.5,.99])assert.equal(computerMove(view,'bot',()=>roll).type,'fold','Weak offsuit cards never randomly call a whole stack');
view=table(['7c','2d']);view.legalActions.canCheck=true;view.legalActions.callAmount=0;
assert.equal(computerMove(view,'bot',()=>.8).type,'check','Never fold a free check');
view=table(['Ah','Qh'],['Jh','8h','2c']);view.legalActions.callAmount=25;
assert.equal(computerMove(view,'bot',()=>.8).type,'call','Continue a flush draw for an inexpensive price');
view=table(['9c','8d'],['As','Ah','Ad']);view.currentBet=500;view.pot=600;view.legalActions.callAmount=500;
assert.equal(computerMove(view,'bot',()=>.5).type,'fold','Board trips are not private trips');
view=table(['Ac','Kh'],['As','7d','2c']);assert.equal(computerMove(view,'bot',()=>.8).type,'call','Top pair can call without automatically raising');
view=table(['9c','8d'],['As','Ks','Qs','Js','Ts']);view.legalActions.canCheck=true;view.legalActions.callAmount=0;
for(const roll of [0,.2,.8])assert.equal(computerMove(view,'bot',()=>roll).type,'check','A shared board royal is not a private value raise');
view=table(['7c','2d']);view.legalActions.canCheck=true;view.legalActions.callAmount=0;
assert.equal(computerMove(view,'bot',()=>.02).type,'check','Do not steal with unplayable offsuit trash');
view=table(['9c','8c']);view.legalActions.canCheck=true;view.legalActions.callAmount=0;
assert.equal(computerMove(view,'bot',()=>.02).type,'raise','Occasional positional steal with playable suited connectors');
view.players.push(...Array.from({length:4},(_,i)=>({id:'other'+i,seat:i+2,inHand:true,stack:1000})));
assert.equal(computerMove(view,'bot',()=>.02).type,'check','Avoid bluffing into a full table');
view=table(['As','Ah']);view.legalActions.canRaise=false;assert.equal(computerMove(view,'bot',()=>.4).type,'call','Respect closed raising action');
const before=structuredClone(view),baseline=computerMove(view,'bot',()=>.4);
Object.defineProperty(view,'deck',{get(){throw Error('Hidden deck accessed');}});
Object.defineProperty(view.players[1],'holeCards',{get(){throw Error('Opponent cards accessed');}});
assert.deepEqual(computerMove(view,'bot',()=>.4),baseline,'Private opponent cards and deck are never read');
assert.equal(before.players[0].stack,view.players[0].stack,'Decision never moves chips itself');
view=table(['Ah','Qh'],['Jh','8h','2c']);view.legalActions.canCheck=true;view.legalActions.callAmount=0;
assert.equal(computerMove(view,'bot',()=>.1).type,'raise','A genuine flush draw can semi-bluff in position');
view.players[1].stack=0;
assert.equal(computerMove(view,'bot',()=>.1).type,'check','Never bluff an all-in opponent');
view=table(['Ah','Qh'],['Jh','8h','2c','4d']);view.phase='turn';view.pot=150;view.legalActions.callAmount=500;view.legalActions.canRaise=false;
assert.equal(computerMove(view,'bot',()=>0).type,'fold','Do not chase a turn draw against an oversized bet');
view=table(['7c','2d']);view.legalActions.callAmount=50;view.legalActions.canRaise=false;
assert.equal(computerMove(view,'bot',()=>0).type,'fold','No random weak-hand calls just because the random roll is low');
view=table(['Ac','Kd'],['As','7h','2c']);view.currentBet=500;view.pot=600;view.lastAction={type:'raise'};view.legalActions.callAmount=500;
assert.equal(computerMove(view,'bot',()=>0).type,'fold','Top pair can fold against large raise pressure');
view=table(['2s','3d'],['As','Js','8s','4s','Kh']);view.phase='river';view.currentBet=500;view.pot=500;view.lastAction={type:'raise'};view.legalActions.callAmount=500;view.legalActions.canRaise=false;
assert.equal(computerMove(view,'bot',()=>0).type,'fold','A tiny flush on a four-suited board is not the nuts');
view=table(['As','7d'],['Ks','Qs','8s','4c','2h']);view.phase='river';view.legalActions.canCheck=true;view.legalActions.callAmount=0;
assert.equal(computerMove(view,'bot',()=>.05).type,'raise','Occasional river bluff can use the nut-flush blocker');
view.players.push({id:'third',seat:2,inHand:true,stack:1000});
assert.equal(computerMove(view,'bot',()=>.05).type,'check','Blocker bluff is avoided in multiway pots');
view=table(['As','Kd'],['Qh','Jc','Ts','4d','2c']);view.phase='river';view.currentBet=1000;view.pot=1000;
view.legalActions={...view.legalActions,callAmount:1000,canRaise:false};view.lastAction={type:'raise'};
assert.equal(computerMove(view,'bot',()=>.5).type,'call','Never fold the unbeatable ace-high straight to stack pressure');
Object.defineProperty(view.players[1],'holeCards',{get(){throw Error('Opponent cards accessed during nuts check');}});
assert.equal(computerMove(view,'bot',()=>.5).type,'call','Nuts check uses possible unseen cards, never private opponent cards');
view=table(['2c','3d'],['As','Kd','Qh','Jc','Ts']);view.phase='river';view.currentBet=1000;view.pot=1000;
view.legalActions={...view.legalActions,callAmount:1000,canRaise:false};
assert.equal(computerMove(view,'bot',()=>.5).type,'call','Call an unbeatable shared board straight rather than forfeit a guaranteed split');
view=table(['9s','8d'],['Qh','Jc','Ts','4d','2c']);view.phase='river';view.currentBet=1000;view.pot=1000;
view.legalActions={...view.legalActions,callAmount:1000,canRaise:false};view.lastAction={type:'raise'};
assert.equal(computerMove(view,'bot',()=>.5).type,'fold','A lower straight remains vulnerable to higher possible straights');
for(const [cards,board,reason] of [
  [['Ac','Kd'],['Qs','Js','Ts','4d','2c'],'Possible flush or straight flush beats a straight'],
  [['As','Kd'],['Qh','Qc','Js','Td','2c'],'A paired board permits a higher full house or quads'],
  [['Jh','Th'],['Ah','9h','3h','2c','7d'],'Other unseen hearts can make a higher flush'],
  [['Ac','Ad'],['Ah','Kc','Kd','2c','7d'],'A full house is vulnerable to possible quads']
]){
  view=table(cards,board);view.phase='river';view.currentBet=1000;view.pot=100;
  view.legalActions={...view.legalActions,callAmount:1000,canRaise:false};
  assert.equal(computerMove(view,'bot',()=>.5).type,'fold',reason);
}
view=table(['Ac','Kd'],['As','7h','2c']);view.currentBet=500;view.pot=600;view.lastAction={type:'call'};view.legalActions.callAmount=500;
assert.equal(computerMove(view,'bot',()=>0).type,'fold','A previous caller does not erase large-raise pressure');
console.log('PASS computer strategy: premium hands, weak all-in folds, free checks, draw pricing, board-only hands, position, multiway bluffs, legal raises, unbeatable river calls and private-card isolation.');
