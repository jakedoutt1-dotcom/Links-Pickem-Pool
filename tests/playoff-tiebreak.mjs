import assert from 'node:assert/strict';
import {rankPlayoffScores} from '../functions/lib/playoff-tiebreak.js';
import {fixture} from './helpers/pool-format-fixture.mjs';
const names=['Alice','Bob','Carol'],scores=names.map(playerName=>({playerName,score:10})),games=new Map([[19,[{id:'a',away:'BUF',home:'KC',completed:true,winner:'BUF'},{id:'b',away:'MIA',home:'DEN',completed:true,winner:'MIA'}]]]);
const entries=names.map(player_name=>({player_name,period_key:'19',entry_json:JSON.stringify({picks:player_name==='Alice'?[{eventId:'a',team:'BUF'}]:[{eventId:'a',team:'BUF'},{eventId:'b',team:'MIA'}]})}));
const ties=names.map(player=>({player,guess:55,winning_guess:player==='Alice'?35:30}));
let rows=rankPlayoffScores(scores,entries,games,ties,true,{total:52,winner:28},true);assert.deepEqual(rows.map(r=>[r.playerName,r.rank]),[['Bob',1],['Carol',1],['Alice',3]]);
ties[0].winning_guess=30;rows=rankPlayoffScores(scores,entries,games,ties,true,{total:52,winner:28},true);assert.equal(rows.at(-1).playerName,'Alice','Correct-pick count is the third tiebreaker');
ties[0].guess=52;rows=rankPlayoffScores(scores,entries,games,ties,true,{total:52,winner:28},true);assert.equal(rows[0].playerName,'Alice','Total guess takes priority');
rows=rankPlayoffScores(scores,entries,games,ties,false,null,false);assert(rows.every(r=>r.rank===1&&r.totalGuess===null&&r.winningGuess===null&&r.totalDifference===null));
rows=rankPlayoffScores(scores,entries,games,[],true,{total:52,winner:28},true);assert(rows.every(r=>r.totalDifference===null&&r.winningDifference===null),'Historical missing guesses are not zero');
const fx=fixture(),slates=Object.fromEntries([19,20,21,22].map((week,r)=>[week,Array.from({length:[6,4,2,1][r]},(_,i)=>({id:week+'-'+i,eventId:week+'-'+i,away:'A'+i,home:'H'+i,kickoff:'2090-01-01T18:00:00Z',completed:false,winner:'',awayScore:null,homeScore:null}))]));fx.runtime.fetchNFLWeek=async w=>slates[w]||[];
try{
 await fx.call('playoff','settings',{version:'',wildCardPoints:1,divisionalPoints:2,conferencePoints:4,superBowlPoints:8},'admin');
 for(const token of ['alice','bob'])for(const week of [19,20,21,22]){const entry={week,picks:slates[week].map(g=>({eventId:g.id,team:g.away})),...(week===22?{championshipTotal:55,championshipWinner:token==='alice'?30:35}:{})};assert.equal((await fx.call('playoff','entry',{entry},token)).status,200);}
 let state=await fx.call('playoff','state',null,'alice',22);assert.equal(state.myEntry.championshipTotal,55);assert.equal(state.myEntry.championshipWinner,30);assert(state.scores.every(r=>r.rank===1&&r.winningGuess===null));
 const before=fx.db.raw.prepare("SELECT entry_json FROM special_game_period_entries WHERE player_name='Alice' AND period_key='22'").get().entry_json;
 for(const extra of [{},{championshipTotal:52,championshipWinner:60},{championshipTotal:-1,championshipWinner:1}])assert.equal((await fx.call('playoff','entry',{entry:{week:22,picks:[{eventId:'22-0',team:'A0'}],...extra}})).status,400);
 assert.equal(fx.db.raw.prepare("SELECT entry_json FROM special_game_period_entries WHERE player_name='Alice' AND period_key='22'").get().entry_json,before,'Invalid prediction preserves the whole saved card');
 for(const list of Object.values(slates))for(const g of list)Object.assign(g,{kickoff:'2020-01-01T18:00:00Z',completed:true,winner:g.away,awayScore:28,homeScore:24});
 state=await fx.call('playoff','state',null,'alice',22);assert(state.tiebreak.resolved);assert.equal(state.scores[0].playerName,'Alice');assert.equal(state.scores[0].rank,1);assert.equal(state.scores[1].rank,2);assert.equal(state.scores[0].correct,13);
 assert.equal((await fx.call('playoff','entry',{entry:{week:22,picks:[{eventId:'22-0',team:'H0'}],championshipTotal:52,championshipWinner:28}})).status,409);
 slates[19]=[];state=await fx.call('playoff','state',null,'alice',22);assert.equal(state.tiebreak.resolved,false);assert(state.scores.every(r=>r.rank===1),'No tiebreak on incomplete feeds');
 console.log('PASS NFL playoff ties: all three steps, exact shared rank, private forecasts, atomic card save, validation, historical entries, complete postseason and deadline enforcement');
}finally{fx.db.raw.close();}
