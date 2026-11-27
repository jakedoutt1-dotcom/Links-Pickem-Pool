import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequestGet,onRequestPost} from '../functions/new-build/api/picks.js';
import {gradeWeek} from '../functions/new-build/api/standings-v649.js';
import {standings} from '../functions/lib/college.js';
import {winningScores} from '../functions/lib/weekly-tiebreak.js';
import {revealState} from '../public/new-build/march-reveal.mjs';
const {db}=fixture(),oldFetch=globalThis.fetch,oldNow=Date.now;
let now=Date.parse('2026-11-01T00:00:00Z');Date.now=()=>now;
globalThis.fetch=async()=>Response.json({events:[{id:'last',date:'2026-11-02T01:00:00Z',status:{type:{completed:false}},competitions:[{competitors:[{team:{id:'1',abbreviation:'BUF'}},{team:{id:'2',abbreviation:'MIA'}}]}]}]});
const call=async(winningGuess,selection='44',token='alice')=>{
 const r=await onRequestPost({env:{DB:db},request:new Request('https://test/new-build/api/picks',{method:'POST',headers:{Authorization:'Bearer '+token},body:JSON.stringify({pool:1,player:'Alice',game:'NFL Pick’em',week:8,eventId:'__TIEBREAKER__',selection,winningGuess})})});return r.status;
};
try{
 db.raw.prepare("INSERT INTO pool_payments(pool_id,sport,player_name,week,paid) VALUES(1,'nfl','Alice',8,1)").run();
 for(const value of [null,'',-1,45,1.5,'bad'])assert.equal(await call(value),400);
 assert.equal(await call(27,'44','bob'),403);
 assert.equal(await call(27),200);assert.equal((await winningScores(db,1,'nfl',8)).get('alice'),27);
 const own=await onRequestGet({env:{DB:db},request:new Request('https://test/new-build/api/picks?pool=1&player=Alice&week=8',{headers:{Authorization:'Bearer alice'}})});assert.equal((await own.json()).winningGuess,27);
 assert.equal(await call(30,'20'),400);assert.equal((await winningScores(db,1,'nfl',8)).get('alice'),27,'Invalid pair preserves both saved values');
 now=Date.parse('2026-11-02T01:00:00Z');assert.equal(await call(28),403);assert.equal((await winningScores(db,1,'nfl',8)).get('alice'),27);
 const people=['Alice','Bob','Carol'],games=[{id:'last',i:0,teams:['BUF','MIA'],winner:'BUF',completed:true,total:44,winningScore:27,kickoff:'2026-11-02T01:00:00Z'}];
 const input=()=>({players:{results:people.map(name=>({name}))},picks:{results:people.map(player_name=>({player_name,team:'BUF',game_index:0}))},ties:{results:people.map(player_name=>({player_name,guess:44}))},manual:{results:[]},access:{results:people.map(player_name=>({player_name}))},winning:new Map([['alice',25],['bob',27],['carol',27]])});
 let rows=gradeWeek({id:1},8,games,input());assert.deepEqual(rows.finalizedWinners,['Bob','Carol']);assert.deepEqual(rows.rows.map(r=>r.rank),[1,1,3]);
 const legacy=input();legacy.winning=new Map();assert.equal(gradeWeek({id:1},8,games,legacy).finalizedWinners.length,3,'Historical ties remain shared');
 now=Date.parse('2026-11-01T00:00:00Z');rows=gradeWeek({id:1},8,[{...games[0],completed:false,total:null}],input());assert(rows.rows.every(r=>r.winningGuess===null&&r.winningDiff===null&&r.rank===1),'Private and no premature tie ranking');
 const college=standings(people.map(player=>({player,active:true,picks:{last:'BUF'},tie:44,winningGuess:player==='Alice'?25:27})),[{eventId:'last',gameIndex:0,winner:'BUF',completed:true,total:44,awayScore:27,homeScore:17,kickoff:games[0].kickoff}]);assert.deepEqual(college.finalizedWinners,['Bob','Carol']);
 assert.equal(revealState(2027,false,new Date('2027-03-13T18:00Z')).days,1);assert.equal(revealState(2027,false,new Date('2027-03-14T18:00Z')).text,'Selection Sunday is today');assert.equal(revealState(2027,false,new Date('2027-03-15T18:00Z')).text,'Waiting for the official field');assert.equal(revealState(2027,true),null);assert.equal(revealState(2026,false),null);
 console.log('PASS weekly tiebreakers: paired save, validation, identity, kickoff lock, private predictions, final-only rankings, exact ties, historical compatibility, college winners and reveal date states');
}finally{globalThis.fetch=oldFetch;Date.now=oldNow;db.raw.close();}
