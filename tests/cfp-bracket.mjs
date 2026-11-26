import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {playoffFixture} from './helpers/cfp-bracket-fixture.mjs';
import {onRequest} from '../functions/new-build/api/cfp.js';
import {cfpSeason,normalizePlayoff} from '../public/new-build/cfp-core.mjs';
import {SLOTS,cleanBracket,validateBracket,bracketStandings,bracketResults} from '../public/new-build/cfp-bracket-core.mjs';
test('Full CFP bracket: official seeds, atomic entry, privacy, stale saves, full lock and tiebreaker',async()=>{
 const {db}=fixture(),old=globalThis.fetch,year=cfpSeason()+1,f=playoffFixture(year);db.raw.exec("INSERT INTO pool_active_games VALUES(1,'cfp',0,1,'2026-01-01')");globalThis.fetch=async()=>Response.json({events:f.events});
 const call=async(body=null,token='alice')=>{const r=await onRequest({env:{DB:db},request:new Request('https://test/new-build/api/cfp?pool=1&season='+year,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,Origin:'https://test'},...(body?{body:JSON.stringify({pool:1,season:year,...body})}:{})})});return {status:r.status,...await r.json()}};
 const setup={action:'bracketSetup',official:true,teams:f.teams},save={action:'bracketSave',picks:f.picks,guess:50,submit:true,version:0,revision:1};
 try{
  assert.equal((await call()).bracket.config,null);assert.equal((await call(setup)).status,403);
  assert.equal((await call({...setup,official:false},'admin')).status,400);
  const wrong=structuredClone(f.teams);[wrong[4].id,wrong[5].id]=[wrong[5].id,wrong[4].id];assert.equal((await call({...setup,teams:wrong},'admin')).status,409);
  assert.equal((await call(setup,'admin')).status,200);assert.equal((await call()).bracket.config.deadline,f.events[0].date);assert.equal((await call({action:'pick',eventId:'r8',team:'8',bonus:0,revision:0})).status,409,'Old per-game page cannot silently save a different contest');
  assert.equal((await call({...save,picks:{r8:f.picks.r8},submit:false})).status,200);
  assert.equal((await call()).bracket.entry.submitted,0);assert.equal((await call()).bracket.standings.rows.find(r=>r.player==='Alice').submitted,false);
  assert.equal((await call(setup,'admin')).status,409,'Setup cannot invalidate a saved draft');assert.equal((await call(save)).status,409,'Old tab cannot overwrite draft');
  const duplicate=structuredClone(f.picks);duplicate.q1.confidence=1;assert.equal((await call({...save,picks:duplicate,version:1})).status,400);
  assert.equal((await call({...save,guess:null,version:1})).status,400);assert.equal((await call({...save,revision:0,version:1})).status,409);
  assert.equal((await call({...save,version:1})).status,200);assert.equal((await call({...save,guess:54},'bob')).status,200);
  let state=await call();assert.equal(state.bracket.entry.version,2);assert.equal(state.bracket.shared.length,0);assert.equal(state.bracket.standings.rows.find(r=>r.player==='Bob').guess,null);
  assert.equal((await call({...save,guess:55,version:1},'bob')).status,200);
  f.events[0].competitions[0].status.type.state='in';state=await call();assert.equal(state.bracket.locked,true);assert.equal(state.bracket.shared.length,2);assert.equal((await call({...save,version:2})).status,409,'All rounds and tiebreaker lock at first live game');
  f.events[0].competitions[0].status.type.state='pre';assert.equal((await call()).bracket.locked,true,'Provider regression never reopens entries');
  f.finish();state=await call();const a=state.bracket.standings.rows.find(r=>r.player==='Alice'),b=state.bracket.standings.rows.find(r=>r.player==='Bob');assert.equal(a.points,66);assert.equal(a.rank,1);assert.equal(a.difference,2);assert.equal(b.rank,2);assert.equal(state.bracket.standings.actualTotal,52);
  globalThis.fetch=async()=>new Response('',{status:503});assert.equal((await call()).bracket.standings.rows.find(r=>r.player==='Alice').points,66);assert.equal((await call({...save,version:2})).status,503);
 }finally{globalThis.fetch=old;db.raw.close()}
});
test('Bracket paths, eliminated teams, shared ties, private guesses and no premature tiebreaking',()=>{
 const f=playoffFixture(cfpSeason()+1);validateBracket(f.picks,f.teams,52);assert.deepEqual(SLOTS.find(s=>s.id==='q1').from,[1,'r8']);assert.deepEqual(SLOTS.find(s=>s.id==='s1').from,['q1','q4']);
 const changed=structuredClone(f.picks);changed.r8.team='9';const cleaned=cleanBracket(changed,f.teams);assert.ok(cleaned.q1,'A bye winner remains valid after changing its opponent');changed.q1.team='8';assert.equal(cleanBracket(changed,f.teams).q1,undefined);
 assert.throws(()=>validateBracket(changed,f.teams,52),/previous game/);assert.throws(()=>validateBracket(f.picks,f.teams,''),/combined score/);
 f.finish();const games=f.events.map(normalizePlayoff),entries=[{player:'A',picks:f.picks,submitted:1,guess:50},{player:'B',picks:f.picks,submitted:1,guess:54}];let state=bracketStandings(['A','B'],entries,f.teams,games,true);assert.equal(state.rows[0].rank,1);assert.equal(state.rows[1].rank,1);
 const before=bracketStandings(['A','B'],entries,f.teams,[],false);assert.equal(before.rows[0].guess,null);assert.equal(before.rows[1].rank,1);assert.equal(before.resolved,false);
 const losing=structuredClone(f.picks);losing.final.team='2';assert.equal(bracketStandings(['A'],[{...entries[0],picks:losing}],f.teams,games,true).rows[0].points,55);
 const rematch=structuredClone(games);rematch[0].title='Regular Bowl';assert.equal(bracketResults(f.teams,rematch).r8,undefined,'No guessing results from a different round');
});
