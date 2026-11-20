import assert from 'node:assert/strict';
import vm from 'node:vm';
import {fixture} from './helpers/pool-format-fixture.mjs';

const {db,runtime}=fixture();
const final={gameIndex:0,eventId:'finished',away:'BUF',home:'MIA',kickoff:'2020-01-01',status:'FINAL'};
const upcoming={gameIndex:1,eventId:'upcoming',away:'KC',home:'DEN',kickoff:'2099-01-01'};
runtime.base=[final,upcoming];
runtime.slate=[{...final,completed:false,winner:null,awayScore:0,homeScore:0},upcoming];
vm.runInContext(`
 finalizedWeekCache=async()=>null;
 getGameList=async()=>base;
 fetchCollegeWeek=async()=>slate;
 refreshNFLLiveGames=async games=>games;
 fetchNFLStandingsRecords=async()=>({});
 globalThis.sync=syncWeek;
`,runtime);
try {
 for(const sport of ['nfl','college']){
  db.raw.prepare("INSERT INTO pool_final_snapshots(pool_id,sport,week,game_index,winner,away_score,home_score,status) VALUES(1,?,3,0,'BUF',24,17,'FINAL')").run(sport);
  const result=await runtime.sync(db,1,sport,3);
  assert.equal(result.liveGames[0].completed,true);
  assert.equal(result.liveGames[0].winner,'BUF');
  assert.equal(result.liveGames[0].awayScore,24);
  assert.equal(result.liveGames[0].homeScore,17);
  assert.equal(result.liveGames[1].completed,undefined);
 }
 console.log('PASS NFL and College preserve confirmed finals when a later feed regresses or loses scores.');
}finally{db.raw.close()}
