import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {demoTournament,makeGames,entrants,selectTeam,cleanPicks,scoreBracket,rankEntries,validTie,PAIRINGS} from '../public/new-build/march-core.mjs';
import {parseEvent,mapResults,createTournament} from '../functions/lib/march.js';
import {onRequest} from '../functions/new-build/api/march.js';
const demo=demoTournament();
function filled(games,choose=ids=>ids[0]) {const picks={};for(const g of games)picks[g.id]=choose(entrants(g,picks));return picks;}
const full=filled(demo.games);
test('63 games, six rounds, every team follows a unique seeded path',()=>{
  assert.deepEqual([1,2,3,4,5,6].map(r=>demo.games.filter(g=>g.round===r).length),[32,16,8,4,2,1]);
  assert.equal(new Set(demo.games.flatMap(g=>g.teams||[]).map(t=>t.id)).size,64);
  assert.equal(Object.keys(cleanPicks(demo.games,full)).length,63);
  assert.throws(()=>makeGames(demo.field,['East','East','South','West']));
});
test('early upset clears only downstream picks that depended on the old winner',()=>{
  const next=selectTeam(demo.games,full,'East-1-0',demo.games.find(g=>g.id==='East-1-0').teams[1].id);
  assert.ok(next['East-1-0']);assert.equal(next['East-2-0'],undefined);
  assert.equal(next['East-3-0'],undefined);assert.equal(next['East-4-0'],undefined);
  assert.equal(next['national-5-0'],undefined);assert.equal(next['national-6-0'],undefined);
  assert.equal(next['East-2-1'],full['East-2-1']);assert.equal(next['West-4-0'],full['West-4-0']);
  assert.deepEqual(cleanPicks(demo.games,{'national-6-0':'forged'}),{});
});
test('perfect bracket is 1920 and eliminated champions lose remaining potential',()=>{
  const results={};
  for(const g of demo.games)results[g.id]={completed:true,winner:full[g.id],teams:entrants(g,full).map(id=>({id,score:id===full[g.id]?80:70}))};
  const score=scoreBracket(demo.games,full,results);
  assert.equal(score.points,1920);assert.equal(score.max,1920);assert.equal(score.correct,63);
  const g=demo.games.find(g=>g.id==='East-1-0'),result={completed:true,winner:g.teams[1].id,teams:g.teams};
  const eliminated=scoreBracket(demo.games,full,{[g.id]:result});
  assert.equal(eliminated.max,1920-630);assert.equal(eliminated.states['national-6-0'],'eliminated');
});
test('tiebreakers apply after the final; equal point totals share a rank beforehand',()=>{
  const entries=[{player:'A',picks:full,tie:140,submitted:true},{player:'B',picks:full,tie:150,submitted:true},{player:'C',picks:full,tie:152,submitted:true},{player:'Draft',picks:full,tie:151,submitted:false}];
  assert.deepEqual(rankEntries(entries,demo.games,{}).map(x=>x.rank),[1,1,1]);
  const final={'national-6-0':{completed:true,winner:full['national-6-0'],teams:entrants(demo.games.at(-1),full).map((id,i)=>({id,score:i?71:80}))}};
  const rows=rankEntries(entries,demo.games,final);assert.deepEqual(rows.map(x=>x.player),['B','C','A']);assert.deepEqual(rows.map(x=>x.rank),[1,1,3]);
  for(const value of ['',null,NaN,-1,401,1.5,'100'])assert.equal(validTie(value),false);
});
function event(g,round=1) {
  return {id:g.eventId,date:g.date,status:{type:{state:'pre',completed:false,shortDetail:'Scheduled'}},competitions:[{notes:[{headline:"NCAA Men's Basketball Championship - "+g.region+" Region - "+(round===1?'1st Round':'2nd Round')}],competitors:g.teams.map(t=>({team:{id:t.id,shortDisplayName:t.name,logo:''},curatedRank:{current:t.seed},score:'0'}))}]};
}
test('ESPN parser excludes First Four and non-tournament games',()=>{
  const g={...demo.field[0],eventId:'1',date:'2027-03-18T16:00:00Z'},e=event(g),parsed=parseEvent(e);
  assert.equal(parsed.region,'East');assert.equal(parsed.round,1);assert.equal(parsed.teams[0].seed,1);
  e.competitions[0].notes[0].headline="NCAA Men's Basketball Championship - First Four";assert.equal(parseEvent(e),null);
  e.competitions[0].notes[0].headline='NIT - 1st Round';assert.equal(parseEvent(e),null);
});
test('real results attach to bracket paths rather than feed array order',()=>{
  const games=demo.games,second=games.find(g=>g.id==='East-2-0');
  const event={round:2,eventId:'live',teams:entrants(second,full).map(id=>({id})),completed:true,winner:full[second.id]};
  assert.equal(mapResults(demo,[event])[second.id].winner,full[second.id]);
  assert.equal(Object.keys(mapResults(demo,[event])).length,1);
});
class D1 {
  constructor(){this.raw=new DatabaseSync(':memory:');}
  prepare(sql){const raw=this.raw;return {bind(...args){return {first:async()=>raw.prepare(sql).get(...args)||null,all:async()=>({results:raw.prepare(sql).all(...args)}),run:async()=>({meta:raw.prepare(sql).run(...args)})};},run:async()=>({meta:raw.prepare(sql).run()})};}
  async batch(stmts){this.raw.exec('BEGIN');try{const out=[];for(const s of stmts)out.push(await s.run());this.raw.exec('COMMIT');return out;}catch(e){this.raw.exec('ROLLBACK');throw e;}}
}
test('authenticated API: complete entry lifecycle, privacy, revisions, field freeze and global deadline',async()=>{
  const db=new D1(),season=new Date().getFullYear()+1;
  db.raw.exec("CREATE TABLE pools(id INTEGER PRIMARY KEY,code TEXT,name TEXT);CREATE TABLE pool_sessions(token TEXT,pool_id INTEGER,player_name TEXT,role TEXT,expires_at TEXT);CREATE TABLE pool_players(pool_id INTEGER,name TEXT);CREATE TABLE pool_settings(pool_id INTEGER,key TEXT,value TEXT);CREATE TABLE pool_active_games(pool_id INTEGER,game_type TEXT,active INTEGER,is_primary INTEGER);INSERT INTO pools VALUES(1,'LINKS','Links Test'),(2,'OTHER','Other');INSERT INTO pool_players VALUES(1,'Jake');INSERT INTO pool_sessions VALUES('player',1,'Jake','player','2099-01-01'),('admin',1,'Jake','admin','2099-01-01'),('other',2,'Other','player','2099-01-01');INSERT INTO pool_active_games VALUES(1,'march',1,1);");
  const field=demo.field.map((g,i)=>({...g,eventId:String(100+i),date:season+'-03-18T16:00:00Z',teams:g.teams.map((t,j)=>({...t,id:String(i*2+j+1)}))}));
  const events=field.map(g=>event(g)),originalFetch=globalThis.fetch;
  globalThis.fetch=async()=>Response.json({leagues:[{calendar:[season+'-03-18T00:00Z']}],events});
  const call=async(token,body=null,query='')=>{const response=await onRequest({env:{DB:db},request:new Request('https://links.test/new-build/api/march?pool=LINKS&season='+season+query,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},...(body?{body:JSON.stringify({pool:'LINKS',season,...body})}:{})})});return {status:response.status,data:await response.json()};};
  try {
    assert.equal((await call('bad')).status,401);assert.equal((await call('other')).status,401);
    assert.equal((await call('player',{action:'publish',pairing:PAIRINGS[0],revision:0})).status,403);
    const published=await call('admin',{action:'publish',pairing:PAIRINGS[0],revision:0});assert.equal(published.status,200,JSON.stringify(published.data));
    const start=await call('player'),games=start.data.tournament.games,picks=filled(games);
    assert.equal(start.data.revision,1);assert.deepEqual(start.data.rows,[]);
    const invalid=await call('player',{action:'save',picks:{'national-6-0':'1'},tie:140,submitted:false,version:0,revision:1});assert.equal(invalid.status,400);
    assert.equal((await call('player',{action:'save',picks:{},tie:140,submitted:true,version:0,revision:1})).status,400);
    const draft=await call('player',{action:'save',picks:{[games[0].id]:picks[games[0].id]},tie:null,submitted:false,version:0,revision:1});assert.equal(draft.status,200);
    assert.equal((await call('admin',{action:'publish',pairing:PAIRINGS[1],revision:1})).status,409);
    const saved=await call('player',{action:'save',player:'Someone else',picks,tie:145,submitted:true,version:1,revision:1});assert.equal(saved.status,200,JSON.stringify(saved.data));
    const stale=await call('player',{action:'save',picks,tie:146,submitted:true,version:1,revision:1});assert.equal(stale.status,409);
    const before=await call('player');assert.equal(before.data.entry.player,'Jake');assert.equal(before.data.submittedCount,1);assert.deepEqual(before.data.rows,[]);
    assert.equal(before.data.entry.version,2);assert.equal(Object.keys(before.data.entry.picks).length,63);
    db.raw.exec("UPDATE links_march_tournaments SET lock_at='2020-01-01T00:00:00.000Z'");
    const late=await call('player',{action:'save',picks,tie:180,submitted:true,version:2,revision:1,start:'2099-01-01'});assert.equal(late.status,403);
    const after=await call('player');assert.equal(after.data.closed,true);assert.equal(after.data.rows.length,1);assert.equal(after.data.entry.tie,145);
    assert.equal((await call('admin',{action:'publish',pairing:PAIRINGS[0],revision:1})).status,403);
  }finally{globalThis.fetch=originalFetch;db.raw.close();}
});
