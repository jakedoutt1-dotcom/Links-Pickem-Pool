import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {playoffFixture} from './helpers/cfp-bracket-fixture.mjs';
import {onRequest} from '../functions/new-build/api/cfp.js';
import {cfpSeason,normalizePlayoff} from '../public/new-build/cfp-core.mjs';
import {SLOTS,cleanBracket,validateBracket,bracketStandings,bracketResults} from '../public/new-build/cfp-bracket-core.mjs';
import {officialField} from '../functions/lib/cfp-auto-field.js';
test('Full CFP bracket: official seeds, atomic entry, privacy, stale saves, full lock and tiebreaker',async()=>{
 let ready=false;const {db}=fixture(),old=globalThis.fetch,year=cfpSeason()+1,f=playoffFixture(year);db.raw.exec("INSERT INTO pool_active_games VALUES(1,'cfp',0,1,'2026-01-01')");globalThis.fetch=async()=>Response.json({events:ready?f.events:[]});
 const call=async(body=null,token='alice')=>{const r=await onRequest({env:{DB:db},request:new Request('https://test/new-build/api/cfp?pool=1&season='+year,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,Origin:'https://test'},...(body?{body:JSON.stringify({pool:1,season:year,...body})}:{})})});return {status:r.status,...await r.json()}};
 const setup={action:'bracketSetup',official:true,teams:f.teams},save={action:'bracketSave',picks:f.picks,guess:50,submit:true,version:0,revision:1};
 try{
  for(const player of ['Alice','Bob'])assert.equal((await call({action:'playerAccess',player,unlocked:true},'admin')).status,200);
  assert.equal((await call()).bracket.config,null);ready=true;
  let automatic=await call();assert.equal(automatic.bracket.config.teams.length,12,'A player visit opens the official bracket automatically');assert.equal(automatic.bracket.config.deadline,f.events[0].date);
  assert.equal((await call(setup)).status,409);assert.equal((await call(setup,'admin')).status,409,'Commissioners cannot change official seeds');
  assert.equal((await call({action:'pick',eventId:'r8',team:'8',bonus:0,revision:0})).status,409,'Old per-game page cannot silently save a different contest');
  assert.equal((await call({...save,picks:{r8:f.picks.r8},submit:false})).status,200);
  assert.equal((await call()).bracket.entry.submitted,0);assert.equal((await call()).bracket.standings.rows.find(r=>r.player==='Alice').submitted,false);
  assert.equal((await call(setup,'admin')).status,409,'Setup cannot invalidate a saved draft');assert.equal((await call(save)).status,409,'Old tab cannot overwrite draft');
  const invalid=structuredClone(f.picks);invalid.q1.team='12';assert.equal((await call({...save,picks:invalid,version:1})).status,400,'Later rounds must follow selected winners');
  assert.equal((await call({...save,guess:null,version:1})).status,400);assert.equal((await call({...save,revision:0,version:1})).status,409);
  assert.equal((await call({...save,version:1})).status,200);assert.equal((await call({...save,guess:54},'bob')).status,200);
  let state=await call();assert.equal(state.bracket.entry.version,2);assert.equal(state.bracket.shared.length,0);assert.equal(state.bracket.standings.rows.find(r=>r.player==='Bob').guess,null);
  assert.equal((await call({...save,guess:55,version:1},'bob')).status,200);
  f.events[0].competitions[0].status.type.state='in';state=await call();assert.equal(state.bracket.locked,true);assert.equal(state.bracket.shared.length,2);assert.equal((await call({...save,version:2})).status,409,'All rounds and tiebreaker lock at first live game');
  f.events[0].competitions[0].status.type.state='pre';assert.equal((await call()).bracket.locked,true,'Provider regression never reopens entries');
  f.finish();state=await call();const a=state.bracket.standings.rows.find(r=>r.player==='Alice'),b=state.bracket.standings.rows.find(r=>r.player==='Bob');assert.equal(a.points,280);assert.equal(a.rank,1);assert.equal(a.difference,2);assert.equal(b.rank,2);assert.equal(state.bracket.standings.actualTotal,52);
  globalThis.fetch=async()=>new Response('',{status:503});assert.equal((await call()).bracket.standings.rows.find(r=>r.player==='Alice').points,280);assert.equal((await call({...save,version:2})).status,503);
 }finally{globalThis.fetch=old;db.raw.close()}
});
test('Bracket paths, eliminated teams, shared ties, private guesses and no premature tiebreaking',()=>{
 const f=playoffFixture(cfpSeason()+1);validateBracket(f.picks,f.teams,52);assert.deepEqual(SLOTS.find(s=>s.id==='q1').from,[1,'r8']);assert.deepEqual(SLOTS.find(s=>s.id==='s1').from,['q1','q4']);
 const changed=structuredClone(f.picks);changed.r8.team='9';const cleaned=cleanBracket(changed,f.teams);assert.ok(cleaned.q1,'A bye winner remains valid after changing its opponent');changed.q1.team='8';assert.equal(cleanBracket(changed,f.teams).q1,undefined);
 assert.throws(()=>validateBracket(changed,f.teams,52),/previous game/);assert.throws(()=>validateBracket(f.picks,f.teams,''),/combined score/);
 f.finish();const games=f.events.map(normalizePlayoff),entries=[{player:'A',picks:f.picks,submitted:1,guess:50},{player:'B',picks:f.picks,submitted:1,guess:54}];let state=bracketStandings(['A','B'],entries,f.teams,games,true);assert.equal(state.rows[0].rank,1);assert.equal(state.rows[1].rank,1);
 const before=bracketStandings(['A','B'],entries,f.teams,[],false);assert.equal(before.rows[0].guess,null);assert.equal(before.rows[1].rank,1);assert.equal(before.resolved,false);
 const losing=structuredClone(f.picks);losing.final.team='2';assert.equal(bracketStandings(['A'],[{...entries[0],picks:losing}],f.teams,games,true).rows[0].points,200);
 const rematch=structuredClone(games);rematch[0].title='Regular Bowl';assert.equal(bracketResults(f.teams,rematch).r8,undefined,'No guessing results from a different round');
});
test('Automatic field rejects weekly projections, missing teams, duplicate seeds, and mismatched first-round games',()=>{
 const f=playoffFixture(2026),now=Date.parse('2026-12-07T20:00Z'),games=f.events.map(normalizePlayoff);
 assert.equal(officialField(games,2026,null,now).teams.length,12,'Explicit schedule seeds open automatically');
 const missing=structuredClone(games);missing[0].home.id='0';missing[0].tbd=true;assert.equal(officialField(missing,2026,null,now),null);
 const conflicted=structuredClone(games);conflicted[4].home.seed=8;assert.equal(officialField(conflicted,2026,null,now),null);
 const unseeded=structuredClone(games);for(const g of unseeded)for(const t of [g.home,g.away])t.seed=null;
 const poll={type:'cfp',season:{year:2026},date:'2026-12-06T20:00Z',ranks:f.teams.map(t=>({current:t.seed===12?20:t.seed,team:{id:t.id,displayName:t.name},recordSummary:t.record}))};
 assert.equal(officialField(unseeded,2026,{...poll,date:'2026-11-24T08:00Z'},now),null,'Weekly top 12 never become the official field');
 assert.equal(officialField(unseeded,2026,{...poll,season:{year:2025}},now),null,'A stale season cannot open this bracket');
 assert.equal(officialField(unseeded,2026,poll,Date.parse('2026-12-01')),null,'Future-dated rankings cannot open early');
 const field=officialField(unseeded,2026,poll,now);assert.equal(field.teams.length,12);assert.equal(field.teams[11].id,'12');assert.equal(field.teams[11].rank,20,'A qualifying team outside the ranked top 12 retains its official seed');
 const mismatch=structuredClone(unseeded);[mismatch[0].home,mismatch[0].away]=[mismatch[0].away,mismatch[0].home];assert.equal(officialField(mismatch,2026,poll,now),null,'Published host/visitor pairings must corroborate seeds');
 const duplicate=structuredClone(poll);duplicate.ranks[1].current=1;assert.equal(officialField(unseeded,2026,duplicate,now),null);
});
test('A regular player opens an unseeded schedule from the final CFP poll with no admin action',async()=>{
 const {db}=fixture(),old=globalThis.fetch,oldNow=Date.now,f=playoffFixture(2026);for(const e of f.events)for(const t of e.competitions[0].competitors)delete t.seed;
 const poll={type:'cfp',season:{year:2026},date:'2026-12-06T20:00Z',ranks:f.teams.map(t=>({current:t.seed,team:{id:t.id,displayName:t.name},recordSummary:t.record}))};
 db.raw.exec("INSERT INTO pool_active_games VALUES(1,'cfp',0,1,'2026-01-01')");Date.now=()=>Date.parse('2026-12-07T20:00Z');let pollCalls=0;
 globalThis.fetch=async url=>{if(String(url).includes('/rankings')){pollCalls++;return Response.json({rankings:[poll]})}assert.equal(new URL(url).searchParams.get('week'),'999');return Response.json({events:f.events})};
 const get=async()=>{const r=await onRequest({env:{DB:db},request:new Request('https://test/new-build/api/cfp?pool=1&season=2026',{headers:{Authorization:'Bearer alice'}})});assert.equal(r.status,200);return r.json()};
 try{const state=await get();assert.equal(state.bracket.config.teams.length,12);assert.equal(state.bracket.locked,false);await get();assert.equal(pollCalls,1,'Published field persists without repeated ranking fetches');}finally{Date.now=oldNow;globalThis.fetch=old;db.raw.close()}
});

test('Commissioner unlock is isolated by pool and season and enforced on every bracket write',async()=>{
 const {db}=fixture(),old=globalThis.fetch,year=cfpSeason()+1,f=playoffFixture(year);
 db.raw.exec("INSERT INTO pool_active_games VALUES(1,'cfp',0,1,'2026-01-01')");
 globalThis.fetch=async()=>Response.json({events:f.events});
 const call=async(body=null,token='alice',season=year)=>{const r=await onRequest({env:{DB:db},request:new Request('https://test/new-build/api/cfp?pool=1&season='+season,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,Origin:'https://test'},...(body?{body:JSON.stringify({pool:1,season,...body})}:{})})});return {status:r.status,...await r.json()}};
 const access={action:'playerAccess',player:'Alice',unlocked:true},save={action:'bracketSave',picks:f.picks,guess:50,submit:true,version:0,revision:1};
 try{
  let state=await call();assert.equal(state.access.unlocked,false);assert.equal(state.access.players,undefined);
  assert.equal((await call(save)).status,403);assert.equal((await call({...save,submit:false})).status,403);
  assert.equal((await call({action:'pick',eventId:'r8',team:'8'})).status,403);
  assert.equal((await call(access)).status,403);assert.equal((await call(access,'outsider')).status,401);
  assert.equal((await call({...access,unlocked:'true'},'admin')).status,400);
  assert.equal((await call({...access,player:'Unknown'},'admin')).status,404);
  // Access controls stay usable even when the sports provider is unavailable.
  globalThis.fetch=async()=>{throw Error('offline')};assert.equal((await call({...access,player:'aLiCe'},'admin')).status,200);
  globalThis.fetch=async()=>Response.json({events:f.events});
  assert.equal((await call()).access.unlocked,true);assert.equal((await call(null,'bob')).access.unlocked,false);
  assert.equal((await call(null,'alice',year-1)).access.unlocked,false);
  state=await call(null,'admin');assert.equal(state.access.players.find(p=>p.name==='Alice').unlocked,true);
  assert.equal((await call(save)).status,200);
  assert.equal((await call({...access,unlocked:false},'admin')).status,200);
  assert.equal((await call({...save,version:1})).status,403);assert.equal((await call()).bracket.entry.submitted,1,'Locking preserves existing entries');
  // Revoke between the initial access read and the write: SQL must also guard it.
  await call(access,'admin');const originalPrepare=db.prepare.bind(db);let race=true;
  db.prepare=q=>{if(race&&q.startsWith('INSERT INTO links_cfp_brackets')){race=false;db.raw.prepare('UPDATE links_cfp_access SET unlocked=0 WHERE pool_id=1 AND season=? AND player=?').run(year,'Alice');}return originalPrepare(q)};
  assert.equal((await call({...save,version:1})).status,409);db.prepare=originalPrepare;
  assert.equal((await call()).bracket.entry.version,1);
  f.events[0].competitions[0].status.type.state='in';await call();await call(access,'admin');
  assert.equal((await call({...save,version:1})).status,409,'Unlocking never bypasses first-kickoff lock');
 }finally{globalThis.fetch=old;db.raw.close()}
});

test('Round scoring grows 40, 120, 200, 280 and ignores client-supplied point values',()=>{
 const f=playoffFixture(2026);f.finish();const games=f.events.map(normalizePlayoff);
 const hostile=structuredClone(f.picks);for(const p of Object.values(hostile))p.confidence=999999;
 const entry={player:'Alice',picks:hostile,guess:52,submitted:true};
 const rounds=['first round','quarterfinal','semifinal','national championship'];
 for(const [index,total] of [40,120,200,280].entries()){
  const finals=games.filter(g=>rounds.slice(0,index+1).some(r=>g.title.toLowerCase().includes(r)));
  assert.equal(bracketStandings(['Alice'],[entry],f.teams,finals,true).rows[0].points,total);
 }
 const normalized=validateBracket(hostile,f.teams,52,true);assert(Object.values(normalized).every(p=>Object.keys(p).join()==='team'));
});
