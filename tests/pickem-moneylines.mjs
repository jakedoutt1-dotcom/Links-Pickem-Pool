import assert from 'node:assert/strict';
import {american,applyMoneylines,paidMoneylines} from '../public/new-build/pickem-moneylines.mjs';
const game={start:'2026-10-20T23:00:00Z',home:{name:'Los Angeles Lakers',abbr:'LAL'},away:{name:'Golden State Warriors',abbr:'GS'}};
const event={leagueID:'NBA',status:{startsAt:game.start},teams:{home:{names:{long:'LA Lakers',short:'LAL'}},away:{names:{short:'GSW'}}},odds:{'points-home-game-ml-home':{bookOdds:'-150'},'points-away-game-ml-away':{bookOdds:'130'}}};
assert.equal(american(130),'+130');for(const value of [null,'',0,99,'NaN','<script>'])assert.equal(american(value),'');
assert.equal(applyMoneylines([game],[event],'NBA')[0].home.moneyline,'-150');assert.equal(applyMoneylines([game],[event],'NBA')[0].away.moneyline,'+130');
for(const events of [[event,event],[{...event,leagueID:'MLB'}],[{...event,status:{startsAt:'2026-10-21T02:00:00Z'}}],[{...event,teams:{home:event.teams.away,away:event.teams.home}}]])assert.equal(applyMoneylines([game],events,'NBA')[0].home.moneyline,undefined);
assert.equal(applyMoneylines([{...game,final:true}],[event],'NBA')[0].home.moneyline,undefined);
const old=fetch;let calls=0;global.fetch=async()=>{calls++;return Response.json({data:[event]})};try{await paidMoneylines([game],'NBA');await paidMoneylines([game],'NBA');assert.equal(calls,1);global.fetch=async()=>{throw Error('offline')};const failed=await paidMoneylines([game],'MLB');assert.match(failed.note,/unavailable/);assert.equal(failed.games[0],game)}finally{global.fetch=old}
console.log('PASS paid moneyline formatting, exact matchup/time/league matching, doubleheader ambiguity protection, cache reuse and failure without blocking picks');
