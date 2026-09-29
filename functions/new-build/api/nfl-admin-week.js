import {commissionerSession} from '../../lib/commissioner-auth.js';
import {weekGames} from './compare-picks.js';
const json=(d,s=200)=>Response.json(d,{status:s,headers:{'Cache-Control':'no-store'}});
const norm=v=>({WAS:'WSH',JAC:'JAX',LA:'LAR'}[String(v||'').toUpperCase()]||String(v||'').toUpperCase());
export async function onRequest({request,env}){
 const db=env.DB;if(!db)return json({error:'Database unavailable'},503);const s=await commissionerSession(request,db);if(!s)return json({error:'Commissioner sign-in required'},403);
 let b={};if(request.method==='POST')try{b=await request.json()}catch{return json({error:'Invalid request'},400)}
 const week=Number(new URL(request.url).searchParams.get('week')||b.week);if(!Number.isInteger(week)||week<1||week>22)return json({error:'Choose a valid NFL week'},400);
 let games;try{games=await weekGames(week)}catch{return json({error:'NFL schedule unavailable. Please try again.'},502)}
 if(request.method==='GET'){const player=new URL(request.url).searchParams.get('player');let picks=[],tie=null;if(player){picks=(await db.prepare("SELECT game_index,team FROM pool_picks WHERE pool_id=? AND sport='nfl' AND week=? AND lower(player_name)=lower(?)").bind(s.pool_id,week,player).all()).results||[];tie=(await db.prepare("SELECT guess FROM pool_ties WHERE pool_id=? AND sport='nfl' AND week=? AND lower(player_name)=lower(?)").bind(s.pool_id,week,player).first())?.guess??null}const settings=(await db.prepare('SELECT key,value FROM pool_settings WHERE pool_id=?').bind(s.pool_id).all()).results||[];const values=Object.fromEntries(settings.map(x=>[x.key,x.value]));return json({games,picks,tie,commissionerEmail:values.commissioner_email||'',rules:values.rules||''})}
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(b.action==='tie'){
  const player=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?)').bind(s.pool_id,String(b.player||'')).first(),guess=Number(b.guess);
  if(!player||b.guess==null||b.guess===''||!Number.isInteger(guess)||guess<0||guess>200)return json({error:'Choose a player and whole-number tiebreaker from 0 to 200'},400);
  await db.prepare("INSERT INTO pool_ties(pool_id,sport,player_name,week,guess) VALUES(?,'nfl',?,?,?) ON CONFLICT(pool_id,sport,player_name,week) DO UPDATE SET guess=excluded.guess").bind(s.pool_id,player.name,week,guess).run();return json({ok:true});
 }
 const game=games.find(g=>g.eventId===String(b.eventId)),team=norm(b.team);if(!game||![game.home,game.away].includes(team))return json({error:'Choose a team from the selected matchup'},400);
 if(b.action==='result'){
  if(!game.completed)return json({error:'Wait until this game is final before correcting its result.'},409);
  const rows=(await db.prepare("SELECT game_index,winner FROM pool_results WHERE pool_id=? AND sport='nfl' AND week=?").bind(s.pool_id,week).all()).results||[];
  const saved=rows.find(r=>[game.home,game.away].includes(norm(r.winner))),index=saved?.game_index??game.gameIndex;
  if(!saved&&rows.some(r=>Number(r.game_index)===Number(index)&&r.winner))return json({error:'This result slot belongs to another matchup. No results were changed.'},409);
  await db.prepare("INSERT INTO pool_results(pool_id,sport,week,game_index,winner) VALUES(?,'nfl',?,?,?) ON CONFLICT(pool_id,sport,week,game_index) DO UPDATE SET winner=excluded.winner").bind(s.pool_id,week,index,team).run();return json({ok:true});
 }
 if(b.action==='pick'){
  const player=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?)').bind(s.pool_id,String(b.player||'')).first();if(!player)return json({error:'Player not found in this pool'},404);
  const rows=(await db.prepare("SELECT game_index,team FROM pool_picks WHERE pool_id=? AND sport='nfl' AND week=? AND player_name=?").bind(s.pool_id,week,player.name).all()).results||[];
  const saved=rows.find(r=>[game.home,game.away].includes(norm(r.team))),index=saved?.game_index??game.gameIndex;
  if(!saved&&rows.some(r=>Number(r.game_index)===Number(index)))return json({error:'This slot belongs to another matchup. No picks were changed.'},409);
  await db.prepare("INSERT INTO pool_picks(pool_id,sport,player_name,week,game_index,team) VALUES(?,'nfl',?,?,?,?) ON CONFLICT(pool_id,sport,player_name,week,game_index) DO UPDATE SET team=excluded.team").bind(s.pool_id,player.name,week,index,team).run();return json({ok:true});
 }
 return json({error:'Unsupported correction'},400);
}
