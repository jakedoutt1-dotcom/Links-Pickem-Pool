import test from 'node:test';
import assert from 'node:assert/strict';
import {fantasyFixture} from './helpers/fantasy-fixture.mjs';
import {fantasyRequest} from '../functions/new-build/api/fantasy.js';
import {applyAction,newLeague,scoreStats,publicLeague} from '../public/new-build/fantasy-core.mjs';

test('Draft ownership, snake order, rule freeze, roster capacity and stale writes',async()=>{
 const f=fantasyFixture(),s=await f.setup(),[a,b]=s.teams;
 await f.ok('fantasy','draft-start');
 assert.equal((await f.call('fantasy','draft-pick',{player:'p1'},'bob')).status,403);
 await f.ok('fantasy','draft-pick',{player:'p1'},'alice');
 assert.equal((await f.call('fantasy','draft-pick',{player:'p1'},'bob')).status,400);
 await f.ok('fantasy','draft-pick',{player:'p2'},'bob');
 let d=(await f.call('fantasy')).league;assert.deepEqual(d.draft.queue.map(p=>p.team),[a.id,b.id,b.id,a.id,a.id,b.id]);
 assert.equal((await f.call('fantasy','settings',{settings:{scoring:'ppr'}})).status,400);
 assert.equal((await f.call('fantasy','draft-pick',{player:'p3',revision:'stale'})).status,409);
 assert.equal((await f.call('fantasy','draft-pick',{player:'constructor'})).status,400);
});
test('Player ownership, eligibility, duplicate starters and kickoff locks persist',async()=>{
 const f=fantasyFixture(),s=await f.drafted(),[a,b]=s.teams;
 assert.equal((await f.call('fantasy','lineup',{team:a.id,lineup:{'QB-1':'p1'}},'bob')).status,403);
 assert.equal((await f.call('fantasy','lineup',{team:a.id,lineup:{'QB-1':'p4'}},'alice')).status,400);
 await f.ok('fantasy','lineup',{team:a.id,lineup:{'QB-1':'p1','RB-1':'p4'}},'alice');
 f.runtime.now=Date.parse(f.runtime.kickoff);
 assert.equal((await f.call('fantasy','lineup',{team:a.id,lineup:{'RB-1':'p4'}},'alice')).status,400);
 assert.equal((await f.call('fantasy','drop',{team:a.id,player:'p1'},'alice')).status,400);
 assert.deepEqual((await f.call('fantasy')).league.weeks[1].lineups[a.id],{'QB-1':'p1','RB-1':'p4'});
});
test('Waivers hide bids, resolve collisions, fail conditional drops safely and charge once',async()=>{
 const f=fantasyFixture(),s=await f.drafted(),[a,b]=s.teams;
 await f.ok('fantasy','waiver-window',{runAt:new Date(f.runtime.now+60000).toISOString()});
 await f.ok('fantasy','claim',{team:a.id,player:'p11',drop:'p5',bid:10},'alice');
 await f.ok('fantasy','claim',{team:b.id,player:'p11',drop:'p6',bid:20},'bob');
 await f.ok('fantasy','claim',{team:a.id,player:'p12',drop:'p5',bid:5},'alice');
 const privateState=(await f.call('fantasy','state',null,'bob')).league;assert.equal(privateState.claims.length,1);assert(!privateState.log.some(l=>l.action==='claim'&&l.by==='Alice'));
 assert.equal((await f.call('fantasy','waiver-process',{})).status,400);
 f.runtime.now+=61000;await f.ok('fantasy','waiver-process');
 const out=(await f.call('fantasy')).league;assert.equal(out.teams.find(t=>t.id===b.id).faab,80);assert.equal(out.teams.find(t=>t.id===a.id).faab,95);
 assert(out.rosters[b.id].some(p=>p.id==='p11'));assert(out.rosters[a.id].some(p=>p.id==='p12'));assert.equal(out.claims.filter(c=>c.status==='WON').length,2);
 assert.equal((await f.call('fantasy','waiver-process',{})).status,400);
});
test('Trades require recipient acceptance, commissioner approval and revalidate assets',async()=>{
 const f=fantasyFixture(),s=await f.drafted('dynasty'),[a,b]=s.teams;
 const pick=s.picks.find(p=>p.owner===a.id&&p.season===s.season+1);
 await f.ok('dynasty','trade',{team:a.id,to:b.id,give:['p5','pick:'+pick.id],receive:['p6']},'alice');
 let t=(await f.call('dynasty','state',null,'alice')).league.trades[0];
 assert.equal((await f.call('dynasty','trade-response',{id:t.id,response:'approve'})).status,400);
 assert.equal((await f.call('dynasty','trade-response',{id:t.id,response:'accept'},'alice')).status,403);
 await f.ok('dynasty','trade-response',{id:t.id,response:'accept'},'bob');await f.ok('dynasty','trade-response',{id:t.id,response:'approve'});
 const out=(await f.call('dynasty')).league;assert(out.rosters[b.id].some(p=>p.id==='p5'));assert.equal(out.picks.find(p=>p.id===pick.id).owner,b.id);
 assert.equal((await f.call('dynasty','trade-response',{id:t.id,response:'approve'})).status,400);
});
test('Verified scores, weekly carryover, playoffs and archives; dynasty retains players',async()=>{
 const f=fantasyFixture(),s=await f.drafted('dynasty'),[a,b]=s.teams;
 await f.ok('dynasty','lineup',{team:a.id,lineup:{'QB-1':'p1'}},'alice');await f.ok('dynasty','lineup',{team:b.id,lineup:{'QB-1':'p2'}},'bob');
 f.runtime.now=Date.parse(f.runtime.kickoff)+1000;f.runtime.final=true;
 assert.equal((await f.call('dynasty','finalize',{})).status,400);
 await f.ok('dynasty','stats',{player:'p1',points:20,reason:'Official box score'});await f.ok('dynasty','stats',{player:'p2',points:10,reason:'Official box score'});
 await f.ok('dynasty','finalize');assert.equal((await f.call('dynasty','stats',{player:'p1',points:99,reason:'Late'})).status,400);
 await f.ok('dynasty','advance');let out=(await f.call('dynasty')).league;assert.equal(out.weeks[2].lineups[a.id]['QB-1'],'p1');
 await f.ok('dynasty','stats',{week:2,player:'p1',points:15,reason:'Official final'});await f.ok('dynasty','stats',{week:2,player:'p2',points:15,reason:'Official final'});
 await f.ok('dynasty','finalize',{week:2});out=(await f.call('dynasty')).league;assert.equal(out.champion,a.id);
 await f.ok('dynasty','rollover',{confirmSeason:out.season});
 out=(await f.call('dynasty')).league;assert.equal(out.phase,'OFFSEASON');assert.equal(out.rosters[a.id].length,3);assert.equal(out.season,s.season+1);
 assert(f.db.raw.prepare('SELECT value FROM pool_settings WHERE key=?').get('links_fantasy_v1:dynasty:archive:'+s.season));
 assert.equal((await f.call('dynasty','rollover',{confirmSeason:out.season})).status,400);
});
test('Concurrent writers cannot overwrite a winning save; cross-pool and archived writes rejected',async()=>{
 const f=fantasyFixture();await f.setup();const revision=(await f.call('fantasy')).league.revision;
 const result=await Promise.all([f.call('fantasy','catalog',{revision}),f.call('fantasy','catalog',{revision})]);assert.deepEqual(result.map(r=>r.status).sort(),[200,409]);
 assert.equal((await f.call('fantasy','state',null,'outsider')).status,401);
 f.db.raw.exec("UPDATE pool_active_games SET active=0 WHERE game_type='fantasy'");
 assert.equal((await f.call('fantasy','catalog',{})).status,403);assert.equal((await f.call('fantasy')).active,false);
});
test('Scoring presets preserve negative stats and reject unknown fields',()=>{
 assert.equal(scoreStats({passYards:250,passTD:2,interceptions:1,rushYards:-10,receptions:4},'half_ppr'),17);
 assert.equal(scoreStats({fg0_39:1,fg40_49:1,fg50:2,xp:3}),20);
 assert.equal(scoreStats({pointsAllowed:0,sacks:3,defINT:2}),17);
 assert.throws(()=>scoreStats({constructor:1}),/Unknown stat/);
});

test('Dynasty renewal keeps pick ownership and allows roster cuts for the rookie draft',async()=>{
 const f=fantasyFixture(),s=await f.drafted('dynasty'),[a,b]=s.teams;
 // Start from a completed season to focus this test on retained assets and next-year draft behavior.
 const row=f.db.raw.prepare('SELECT value FROM pool_settings WHERE key=?').get('links_fantasy_v1:dynasty');const state=JSON.parse(row.value);state.phase='COMPLETE';state.champion=a.id;
 const nextPick=state.picks.find(p=>p.season===state.season+1&&p.original===a.id);nextPick.owner=b.id;
 f.db.raw.prepare('UPDATE pool_settings SET value=? WHERE key=?').run(JSON.stringify(state),'links_fantasy_v1:dynasty');
 await f.ok('dynasty','rollover',{confirmSeason:state.season});
 await f.ok('dynasty','drop',{team:b.id,player:'p6'},'bob');
 await f.ok('dynasty','draft-start',{order:[a.id,b.id]});
 let out=(await f.call('dynasty')).league;assert.equal(out.draft.queue[0].team,b.id);assert.equal(out.draft.type,'ROOKIE');
 assert.equal((await f.call('dynasty','draft-pick',{player:'p5'},'bob')).status,400);
 // The directory receives the new rookie class before the annual draft.
 f.players.p11.years=0;await f.ok('dynasty','catalog');await f.ok('dynasty','draft-pick',{player:'p11'},'bob');
 await f.ok('dynasty','reserve',{team:b.id,player:'p11',reserve:'TAXI'},'bob');
 f.players.p12.years=0;await f.ok('dynasty','catalog');await f.ok('dynasty','draft-pick',{player:'p12'},'bob');
 out=(await f.call('dynasty')).league;assert.equal(out.phase,'READY');assert(out.rosters[b.id].some(p=>p.id==='p11'&&p.reserve==='TAXI'));assert.equal(out.picks.find(p=>p.id===nextPick.id).player,'p11');
});
test('Directory changes and missing schedule events never unlock a player after kickoff',async()=>{
 const f=fantasyFixture(),s=await f.drafted(),a=s.teams[0];
 await f.ok('fantasy','lineup',{team:a.id,lineup:{'QB-1':'p1'}},'alice');
 f.runtime.now=Date.parse(f.runtime.kickoff)+1;f.players.p1.team='NYJ';await f.ok('fantasy','catalog');
 f.services.schedule=async()=>[{id:'other',kickoff:'2026-09-07T20:00:00Z',teams:['NYJ','NYG'],completed:false}];
 await f.ok('fantasy','schedule');
 assert.equal((await f.call('fantasy','lineup',{team:a.id,lineup:{}},'alice')).status,400);
});
test('IR eligibility, taxi deadline and direct add capacity are enforced',async()=>{
 const f=fantasyFixture(),s=await f.drafted('dynasty'),[a,b]=s.teams;
 assert.equal((await f.call('dynasty','reserve',{team:a.id,player:'p1',reserve:'IR'},'alice')).status,400);
 await f.ok('dynasty','reserve',{team:b.id,player:'p6',reserve:'IR'},'bob');
 assert.equal((await f.call('dynasty','add',{team:a.id,player:'p11'},'alice')).status,400);
 await f.ok('dynasty','add',{team:b.id,player:'p11'},'bob');
 await f.ok('dynasty','reserve',{team:b.id,player:'p11',reserve:'TAXI'},'bob');
 f.runtime.now=Date.parse(f.runtime.kickoff)+1;
 assert.equal((await f.call('dynasty','reserve',{team:b.id,player:'p11',reserve:''},'bob')).status,400);
});
