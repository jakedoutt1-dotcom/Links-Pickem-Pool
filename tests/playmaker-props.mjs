import assert from 'node:assert/strict';
import {categories,categoryOddIds,categoryMatches} from '../public/new-build/playmaker/markets.mjs';
import {parseEvents,validateCard,calculateReturn} from '../public/new-build/playmaker/domain.mjs';
import {playmakerPublic,compatibleBuildPicks} from '../functions/new-build/api/playmaker-public.js';
import {fixture} from './helpers/playmaker-fixture.mjs';
const now=Date.now(),origin='https://links.test';
function eventFor(league,category){const odds={};for(const oddID of categoryOddIds(league,category).split(',')){const id=oddID.replace('PLAYER_ID','ALEX_EXAMPLE_1_'+league),[statID,statEntityID,periodID,betTypeID,sideID]=id.split('-');odds[id]={oddID:id,statID,statEntityID,periodID,betTypeID,sideID,byBookmaker:{draftkings:{available:true,odds:'+130',overUnder:'25.5',spread:sideID==='home'?'-3.5':'3.5',lastUpdatedAt:new Date(now-60000).toISOString()}}}}return {eventID:'props-event',leagueID:league,sportID:league,status:{startsAt:new Date(now+86400000).toISOString(),started:false,ended:false},teams:{home:{name:'Home'},away:{name:'Away'}},players:{['ALEX_EXAMPLE_1_'+league]:{name:'Alex Example'}},odds}}
function harness(event){const {db}=fixture(),calls=[],queries=[];let malicious=false;
 const services={now:()=>now,session:async()=>({email:'jakedoutt@yahoo.com'}),odds:async c=>{queries.push(new URL(c.request.url));return Response.json({success:true,data:[event]})},fetch:async(url,init)=>{const input=JSON.parse(JSON.parse(init.body).input);calls.push(input);return Response.json({status:'completed',output_text:JSON.stringify({analysis:'Quoted prices, uncertain outcome. Risk note: no guarantee.',picks:[...new Map(input.candidates.map(p=>[p.eventId,p])).values()].slice(0,input.legs).map(p=>({id:malicious?'forged-id':p.id,reason:'Verified price; uncertain outcome.'}))})})}};
 async function call(category,extra={}){const request=new Request(origin+'/new-build/api/playmaker-public?action=ai',{method:'POST',headers:{Origin:origin,'CF-Connecting-IP':'192.0.2.1','Content-Type':'application/json'},body:JSON.stringify({sport:event.leagueID,category,mode:'build',kind:'single',legs:1,risk:'balanced',question:'Build a matching pick.',card:[],requestId:crypto.randomUUID(),...extra})});const r=await playmakerPublic({request,env:{DB:db,OPENAI_API_KEY:'fake',SPORTS_GAME_ODDS_API_KEY:'fake'}},services);return {status:r.status,...await r.json()}}
 return {db,calls,queries,call,services,forge:()=>malicious=true};
}
let checked=0;
for(const league of ['NFL','NCAAF','NBA','NCAAB','NHL','MLB'])for(const category of categories(league)){
 const event=eventFor(league,category.id),rows=parseEvents({data:[event]},'all',now).filter(p=>categoryMatches(p,category.id));assert(rows.length,league+' '+category.id);assert.equal(validateCard(rows.slice(0,12),now).length,Math.min(12,rows.length));assert(rows.every(p=>p.market!=='prop'||p.label.includes('Alex Example')));
 const test=harness(event);try{const result=await test.call(category.id,{oddIDs:'FORGED',odds:[{price:9999}]});assert.equal(result.status,200,league+' '+category.id);assert(categoryMatches(result.picks[0],category.id));assert.equal(result.picks[0].americanOdds,130);assert.equal(test.calls[0].category,category.id);assert.equal(test.queries[0].searchParams.get('oddIDs'),categoryOddIds(league,category.id));assert.equal(validateCard(result.picks,now).length,1);assert.equal(calculateReturn(result.picks,10).payout,23);checked++}finally{test.db.raw.close()}
}
{
 const event=eventFor('NBA','assists'),test=harness(event);try{
  assert.equal((await test.call('touchdowns')).status,400);assert.equal(test.calls.length,0);assert.equal(test.queries.length,0);
  test.forge();assert.equal((await test.call('assists')).status,502);assert.equal(test.calls.length,1);
 }finally{test.db.raw.close()}
}
{
 const event=eventFor('NFL','game'),test=harness(event);try{const result=await test.call('touchdowns');assert.equal(result.status,409);assert.match(result.error,/No AI request was used/);assert.equal(test.calls.length,0);assert.equal(test.db.raw.prepare('SELECT COUNT(*) n FROM links_playmaker_requests').get().n,0)}finally{test.db.raw.close()}
}
{
 const event=eventFor('NFL','receptions'),good=parseEvents({data:[event]},'all',now)[0];assert.match(good.label,/Receptions (over|under) 25.5/);
 assert.equal(validateCard([{...good,playerId:'FORGED'}],now).length,0);assert.equal(validateCard([{...good,statId:'passing_yards'}],now).length,0);assert.equal(validateCard([{...good,category:'touchdowns'}],now).length,0);
 delete event.players;assert.equal(parseEvents({data:[event]},'all',now).length,0,'Missing player identity never invented from ID');
}
assert.equal(categories('NHL').find(c=>c.id==='player_points').label,'Points (goals + assists)');assert(categoryOddIds('NHL','shots').includes('shots_onGoal-PLAYER_ID'));assert(categoryOddIds('NFL','receptions').includes('receiving_receptions-PLAYER_ID'));
console.log(`PASS ${checked} sport/category combinations: canonical player names/lines, saved prop validation, stat identity, unavailable categories before AI, and NHL goals versus points.`);

{
 const event=eventFor('NBA','assists'),test=harness(event);try{
  const events=Array.from({length:10},(_,i)=>({...structuredClone(event),eventID:'event-'+i}));
  test.services.odds=async()=>Response.json({data:events,success:true});const result=await test.call('assists',{kind:'parlay',legs:8});assert.equal(result.status,200);assert.equal(result.picks.length,8);assert.equal(new Set(test.calls[0].candidates.map(p=>p.eventId)).size,10,'Bounded candidate selection keeps every game represented');assert.equal(new Set(result.picks.map(p=>p.eventId)).size,8);
 }finally{test.db.raw.close()}
}

{
 const event=eventFor('NFL','receiving_yards'),original='ALEX_EXAMPLE_1_NFL';
 for(let i=2;i<=4;i++){const id='PLAYER_'+i;event.players[id]={name:'Player '+i};for(const [key,value] of Object.entries({...event.odds})){if(!key.includes(original))continue;const next=key.replace(original,id);event.odds[next]={...structuredClone(value),oddID:next,statEntityID:id}}}
 const test=harness(event);try{test.services.fetch=async(url,init)=>{const input=JSON.parse(JSON.parse(init.body).input);const picks=[];for(const c of input.candidates){const p=parseEvents({data:[event]},'all',now).find(p=>p.id===c.id);if(compatibleBuildPicks([...picks,p]))picks.push(p);if(picks.length===4)break}return Response.json({status:'completed',output_text:JSON.stringify({analysis:'Same-game correlation. Confirm sportsbook combined odds.',picks:picks.map(p=>({id:p.id,reason:'Real line, uncertain result.'}))})})};const result=await test.call('receiving_yards',{kind:'same_game',legs:4});assert.equal(result.status,200);assert.equal(result.picks.length,4);assert.equal(new Set(result.picks.map(p=>p.eventId)).size,1);assert.equal(calculateReturn(result.picks,10).valid,false,'Never multiply same-game odds');assert(!compatibleBuildPicks([result.picks[0],result.picks[0]]));assert(!compatibleBuildPicks(result.picks.slice(0,2).map(p=>({...p,category:'first_td'}))));console.log('PASS four different players in one game, duplicate/first-TD conflicts, no synthetic same-game return');}finally{test.db.raw.close()}
}

{
 const test=harness(eventFor('NFL','receptions'));try{const result=await test.call('receptions',{kind:'same_game',legs:2});assert.equal(result.status,409);assert.equal(test.calls.length,0,'Not enough compatible players uses no AI request')}finally{test.db.raw.close()}
}

{
 const base=eventFor('NFL','receiving_yards'),original='ALEX_EXAMPLE_1_NFL';
 for(let i=2;i<=100;i++){const id='PLAYER_'+i;base.players[id]={name:'Player '+i};for(const [key,value] of Object.entries({...base.odds})){if(!key.includes(original))continue;const next=key.replace(original,id);base.odds[next]={...structuredClone(value),oddID:next,statEntityID:id}}}
 const test=harness(base);try{const events=Array.from({length:10},(_,i)=>({...structuredClone(base),eventID:'large-'+i}));test.services.odds=async()=>Response.json({data:events});const result=await test.call('receiving_yards',{kind:'parlay',legs:8});assert.equal(result.status,200);assert(test.calls[0].candidates.length<=240);console.log('PASS large board: 2,000 player lines, bounded 240 candidates');}finally{test.db.raw.close()}
}
