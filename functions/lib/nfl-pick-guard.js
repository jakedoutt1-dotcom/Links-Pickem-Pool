import {sessionFor} from './college.js';
import {weekGames,onRequestGet as compare} from '../new-build/api/compare-picks.js';
const json=(d,s=200)=>Response.json(d,{status:s,headers:{'Cache-Control':'no-store'}});
export async function nflPickGuard(request,db,pool,player,week,body){
 const s=await sessionFor(request,db,pool);if(!s||s.role!=='admin'&&String(s.player_name).toLowerCase()!==String(player).toLowerCase())return {response:json({error:'Sign in as this player to access picks.'},403)};
 if(!Number.isInteger(week)||week<1||week>22)return {response:json({error:'Choose a valid NFL week.'},400)};
 if(!body)return {};if(body.commissionerCorrection===true)return {response:json({error:'Submit corrections from Admin for LINKS approval.'},409)};const correction=false;if(!correction&&String(s.player_name).toLowerCase()!==String(player).toLowerCase())return {response:json({error:'You can only save your own picks.'},403)};
 let games;try{games=await weekGames(week)}catch{return {response:json({error:'NFL schedule unavailable. Picks were not changed.'},503)}}
 if(body.eventId==='__TIEBREAKER__'){
 const last=[...games].sort((a,b)=>Date.parse(a.kickoff)-Date.parse(b.kickoff)).at(-1);
 if(!last||!Number.isFinite(Date.parse(last.kickoff))||Date.now()>=Date.parse(last.kickoff)||last.completed)return {response:json({error:'The tiebreaker game has kicked off.'},403)};
 return {games,correction};
 }
 const g=body.eventId?games.find(g=>g.eventId===String(body.eventId)):games.find(g=>g.gameIndex===Number(body.gameIndex)),team=String(body.teamCode||body.selection||'').toUpperCase(),norm=({WAS:'WSH',JAC:'JAX',LA:'LAR'}[team]||team);
 if(!g||!g.teams.includes(norm))return {response:json({error:'Choose a valid team in this matchup.'},400)};
 if(!Number.isFinite(Date.parse(g.kickoff))||Date.now()>=Date.parse(g.kickoff)||g.completed)return {response:json({error:'This game has kicked off. Its pick is locked.'},403)};
 return {games,event:g,team:norm,correction};
}
export async function publicNFLPicks(request,env,pool,week){
 const url=new URL(request.url);url.searchParams.set('pool',pool);url.searchParams.set('week',week);
 const r=await compare({request:new Request(url,request),env});const j=await r.json();if(!r.ok)return json(j,r.status);
 return json({success:true,locked:j.locked,picks:(j.players||[]).flatMap(p=>Object.entries(p.picks||{}).map(([i,selection])=>({playerName:p.player,gameIndex:Number(i),selection}))),week});
}
