import assert from 'node:assert/strict';
import {fixture as baseFixture} from './pool-format-fixture.mjs';
import {fantasyRequest} from '../../functions/new-build/api/fantasy.js';
export function fantasyFixture(){
 const {db}=baseFixture();const transact=db.batch.bind(db);let tail=Promise.resolve();db.batch=stmts=>{const result=tail.then(()=>transact(stmts));tail=result.catch(()=>{});return result};db.raw.exec("INSERT INTO pool_active_games VALUES(1,'fantasy',0,1,'2026'),(1,'dynasty',0,1,'2026')");
 const runtime={now:Date.parse('2026-09-01T00:00:00Z'),final:false,kickoff:'2026-09-06T17:00:00Z'};
 const players=Object.fromEntries(Array.from({length:60},(_,i)=>['p'+(i+1),{id:'p'+(i+1),name:'Test Player '+(i+1),pos:i<2?'QB':i<6?'RB':i<10?'WR':'TE',team:'BUF',years:i<10?2:0,injury:i===5?'Out':'',espnId:String(i+1)}]));
 const services={now:()=>runtime.now,catalog:async()=>players,schedule:async()=>[{id:'game',kickoff:runtime.kickoff,completed:runtime.final,teams:['BUF','MIA']}]};
 async function call(game,action='state',body=null,token='admin'){
  if(body&&body.revision===undefined){const row=db.raw.prepare('SELECT value FROM pool_settings WHERE pool_id=1 AND key=?').get('links_fantasy_v1:'+game);body={revision:row?JSON.parse(row.value).revision:'',...body}}
  const request=new Request('https://fantasy.test/new-build/api/fantasy?'+new URLSearchParams({pool:1,game,action}),{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token},...(body?{body:JSON.stringify({pool:1,game,action,...body})}:{})});
  const response=await fantasyRequest({request,env:{DB:db}},services);return {status:response.status,...await response.json()};
 }
 async function ok(game,action,body={},token='admin'){const r=await call(game,action,body,token);assert.equal(r.status,200,action+': '+r.error);return r}
 async function setup(game='fantasy'){
  await ok(game,'settings',{settings:{scoring:'half_ppr',slots:{QB:1,RB:1,WR:0,TE:0,FLEX:0,SUPERFLEX:0,K:0,DEF:0},bench:1,playoffTeams:2,regularWeeks:1,rookieRounds:1}});
  await ok(game,'catalog');await ok(game,'team',{name:'Alice team'},'alice');await ok(game,'team',{name:'Bob team'},'bob');
  return (await call(game)).league;
 }
 async function drafted(game='fantasy'){
  let s=await setup(game);await ok(game,'draft-start');for(const id of ['p1','p2','p3','p4','p5','p6'])await ok(game,'draft-pick',{player:id});
  await ok(game,'season-start');await ok(game,'schedule');return (await call(game)).league;
 }
 return {db,runtime,players,services,call,ok,setup,drafted};
}