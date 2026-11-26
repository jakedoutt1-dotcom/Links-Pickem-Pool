import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {onRequest,fetchPlayoffs} from '../functions/new-build/api/cfp.js';
import {cfpSeason,normalizePlayoff,gradePlayoff} from '../public/new-build/cfp-core.mjs';
test('CFP full lifecycle: only playoff games, rules, bonus budget, frozen totals, privacy, scoring and sticky locks',async()=>{
 const {db}=fixture(),oldFetch=globalThis.fetch,year=cfpSeason()+1;
 db.raw.exec("INSERT INTO pool_active_games VALUES(1,'cfp',0,1,'2026-01-01')");
 const event=(id,title)=>({id,date:year+'-12-20T20:00:00Z',season:{type:3},competitions:[{date:year+'-12-20T20:00:00Z',notes:[{headline:title}],odds:[{overUnder:51.5}],status:{type:{state:'pre',completed:false}},competitors:[{homeAway:'away',team:{id:'333',displayName:'Alabama',abbreviation:'ALA'},records:[{type:'total',summary:'11-1'}],curatedRank:{current:5}},{homeAway:'home',team:{id:'61',displayName:'Georgia',abbreviation:'UGA'},records:[{type:'total',summary:'12-0'}],curatedRank:{current:4}}]}]});
 const events=[event('one','CFP First Round'),event('two','CFP Quarterfinal'),event('bowl','Regular Bowl'),event('later','CFP National Championship')];events[3].competitions[0].timeValid=false;
 globalThis.fetch=async url=>{assert.match(String(url),/seasontype=3/);return Response.json({events})};
 const call=async(body=null,token='alice')=>{const request=new Request('https://test/new-build/api/cfp?pool=1&season='+year,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,Origin:'https://test'},...(body?{body:JSON.stringify({pool:1,season:year,...body})}:{})});const r=await onRequest({request,env:{DB:db}});return {status:r.status,...await r.json()}};
 try{
  assert.equal((await call(null,'outsider')).status,401);let state=await call();assert.equal(state.status,200);assert.equal(state.games.length,3);assert.equal(state.games[0].away.record,'11-1');assert.equal(state.games[0].away.rank,5);assert.match(state.games[0].away.logo,/ncaa\/500\/333/);
  assert.equal((await call({action:'settings',bonus:false,totals:false,revision:0})).status,403);
  assert.equal((await call({action:'settings',bonus:false,totals:false,revision:0},'admin')).status,200);
  const pick={action:'pick',eventId:'one',team:'333',bonus:2,totalSide:'over',expectedTotal:51.5,revision:1};assert.equal((await call(pick)).status,400,'Disabled bonuses are enforced server-side');
  assert.equal((await call({action:'settings',bonus:true,totals:true,revision:1},'admin')).status,200);pick.revision=2;
  assert.equal((await call({...pick,eventId:'later'})).status,409,'TBD games cannot be picked');assert.equal((await call({...pick,totalSide:'over',expectedTotal:50})).status,409);
  assert.equal((await call({...pick,revision:1})).status,409,'Stale rules cannot accept a pick');assert.equal((await call(pick)).status,200);
  assert.equal((await call({action:'settings',bonus:false,totals:false,revision:2},'admin')).status,409,'Rules freeze with the first saved pick');
  assert.equal((await call({...pick,eventId:'two',bonus:2})).status,409,'Bonus budget cannot exceed three');assert.equal((await call({...pick,eventId:'two',bonus:1,totalSide:''})).status,200);
  state=await call();assert.equal(state.shared.length,0);assert.equal(state.bonusUsed,3);assert.equal(state.picks.one.total_line,51.5);assert.equal(state.settings.locked,true);
  events[0].competitions[0].odds[0].overUnder=60;state=await call();assert.equal(state.games.find(g=>g.id==='one').totalLine,51.5,'Pool line never silently changes');
  const c=events[0].competitions[0];c.status={type:{state:'post',completed:true}};c.competitors[0].score=28;c.competitors[0].winner=true;c.competitors[1].score=24;
  state=await call();assert.equal(state.standings.find(p=>p.player==='Alice').points,4);assert.equal(state.shared.length,1);assert.equal((await call({...pick,bonus:0})).status,409);
  c.status={type:{state:'pre',completed:false}};delete c.competitors[0].winner;state=await call();assert.equal(state.standings.find(p=>p.player==='Alice').points,4,'Provider regressions do not erase a saved final');
  globalThis.fetch=async()=>new Response('',{status:503});state=await call();assert.equal(state.available,false);assert.equal(state.standings.find(p=>p.player==='Alice').points,4);assert.equal((await call({...pick,eventId:'two',bonus:1})).status,503);
 }finally{globalThis.fetch=oldFetch;db.raw.close()}
});
test('CFP grading handles Over/Under pushes and missing metadata honestly',()=>{
 const g=normalizePlayoff({id:'a',date:'2027-01-01',competitions:[{status:{type:{state:'post',completed:true}},competitors:[{homeAway:'away',team:{id:'1'},score:20,winner:true},{homeAway:'home',team:{id:'2'},score:17}]}]});assert.equal(normalizePlayoff({id:'tbd',date:'2027-01-01',competitions:[{competitors:[{homeAway:'away',team:{id:'0'}},{homeAway:'home',team:{id:'2'}}]}]}).tbd,true,'Placeholder team IDs cannot be picked');assert.equal(g.away.rank,null);assert.equal(g.totalLine,null);
 const row=gradePlayoff(['A'],[{player:'A',event_id:'a',team:'1',bonus:3,total_side:'over',total_line:37}],[g])[0];assert.equal(row.points,4);assert.equal(row.pushes,1);
});
