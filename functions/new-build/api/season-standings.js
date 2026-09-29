import {resolvePool,nflWeek,gradeWeek} from './standings-v649.js';
const schedules=new Map();
// Cache only public score feeds, never player eligibility, picks or commissioner corrections.
async function schedule(week){
 const old=schedules.get(week);if(old&&old.expires>Date.now())return old.promise;
 const entry={expires:Date.now()+60000,promise:nflWeek(week)};schedules.set(week,entry);
 try{return await entry.promise}catch(e){if(schedules.get(week)===entry)schedules.delete(week);throw e}
}
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequestGet({request,env}){
 const db=env.DB;if(!db)return json({error:'Pool data is unavailable.'},503);
 try{
 const pool=await resolvePool(db,new URL(request.url).searchParams.get('pool'));if(!pool)return json({error:'Pool not found.'},404);
 const token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');
 const session=await db.prepare('SELECT pool_id,expires_at FROM pool_sessions WHERE token=?').bind(token).first();
 if(!session||String(session.pool_id)!==String(pool.id)||!Number.isFinite(Date.parse(session.expires_at))||Date.parse(session.expires_at)<=Date.now())return json({error:'Sign in to this pool to view standings.'},401);
 const [players,picks,ties,manual,access]=await Promise.all([
 db.prepare('SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid').bind(pool.id).all(),
 db.prepare("SELECT week,player_name,game_index,team FROM pool_picks WHERE pool_id=? AND sport='nfl' ORDER BY week,player_name,game_index").bind(pool.id).all(),
 db.prepare("SELECT week,player_name,guess FROM pool_ties WHERE pool_id=? AND sport='nfl'").bind(pool.id).all(),
 db.prepare("SELECT week,game_index,winner FROM pool_results WHERE pool_id=? AND sport='nfl'").bind(pool.id).all(),
 db.prepare("SELECT week,player_name FROM pool_payments WHERE pool_id=? AND sport='nfl' AND paid=1").bind(pool.id).all()
 ]);
 const activeWeeks=new Set((access.results||[]).map(r=>Number(r.week)));
 const weeks=[...new Set([...(picks.results||[]),...(ties.results||[])].map(r=>Number(r.week)))].filter(w=>Number.isInteger(w)&&w>=1&&w<=22&&activeWeeks.has(w)).sort((a,b)=>a-b);
 const totals=new Map(),gradedWeeks=[],failedWeeks=[];let cursor=0,finalGames=0;
 const slice=(rows,w)=>({results:(rows.results||[]).filter(r=>Number(r.week)===w)});
 async function worker(){while(cursor<weeks.length){const week=weeks[cursor++];try{
 const games=(await schedule(week)).map(g=>({...g})),first=Math.min(...games.map(g=>Date.parse(g.kickoff)).filter(Number.isFinite));
 if(!Number.isFinite(first)||Date.now()<first)continue;
 const result=gradeWeek(pool,week,games,{players,picks:slice(picks,week),ties:slice(ties,week),manual:slice(manual,week),access:slice(access,week)});
 if(!result.rows.length||!result.finalGames)continue;
 gradedWeeks.push(week);finalGames+=result.finalGames;const winners=new Set(result.allFinal?result.finalizedWinners:[]);
 for(const row of result.rows){const name=row.player,v=totals.get(name)||{name,wins:0,losses:0,weekWins:0};v.wins+=row.wins;v.losses+=row.losses;if(winners.has(name))v.weekWins++;totals.set(name,v)}
 }catch{failedWeeks.push(week)}}}
 await Promise.all(Array.from({length:Math.min(4,weeks.length)},worker));
 return json({rows:[...totals.values()].sort((a,b)=>b.wins-a.wins||a.losses-b.losses||b.weekWins-a.weekWins||a.name.localeCompare(b.name)),gradedWeeks:gradedWeeks.sort((a,b)=>a-b),failedWeeks:failedWeeks.sort((a,b)=>a-b),finalGames,checkedWeeks:weeks,updatedAt:new Date().toISOString()});
 }catch{return json({error:'Season standings could not be loaded. Please try again.'},503)}
}
