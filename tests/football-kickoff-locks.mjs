import assert from 'node:assert/strict';
import {nflPickGuard} from '../functions/lib/nfl-pick-guard.js';
const now=Date.now(),events=[['one',now-1000,'BUF','MIA'],['two',now+3600000,'KC','DEN']].map(([id,time,home,away])=>({id,date:new Date(time).toISOString(),competitions:[{competitors:[{homeAway:'home',team:{abbreviation:home}},{homeAway:'away',team:{abbreviation:away}}]}]}));
const original=global.fetch;global.fetch=async()=>Response.json({events});
const db={prepare(){return{bind(){return this},async first(){return{pool_id:1,player_name:'Jake',role:'player',expires_at:'2099-01-01'}}}}};
const request=new Request('https://test',{headers:{Authorization:'Bearer test'}});
try{
const started=await nflPickGuard(request,db,1,'Jake',4,{eventId:'one',selection:'BUF',start:'2099-01-01'});assert.equal(started.response.status,403);
const future=await nflPickGuard(request,db,1,'Jake',4,{eventId:'two',selection:'KC'});assert.equal(future.response,undefined);assert.equal(future.team,'KC');
assert.equal((await nflPickGuard(request,db,1,'Jake',4,{eventId:'__TIEBREAKER__'})).response,undefined);
events[1].date=new Date(now-1000).toISOString();assert.equal((await nflPickGuard(request,db,1,'Jake',4,{eventId:'two',selection:'DEN'})).response.status,403);
assert.equal((await nflPickGuard(request,db,1,'Jake',4,{eventId:'__TIEBREAKER__'})).response.status,403);
console.log('PASS NFL per-game locks, later-game edits, server schedule enforcement and tiebreaker cutoff');
}finally{global.fetch=original}
