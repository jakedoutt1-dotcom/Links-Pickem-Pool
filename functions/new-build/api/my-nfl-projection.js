import {poolFor,sessionFor} from '../../lib/college.js';
import {weekGames} from './compare-picks.js';
import {feedbackCredits,creditPicks} from '../../lib/nfl-feedback-credit.js';
import '../../../public/new-build/nfl-projection.js';
const model=globalThis.LINKS_NFL_PROJECTION;
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','Vary':'Authorization'}});
const norm=t=>({WAS:'WSH',JAC:'JAX',LA:'LAR'}[String(t||'').toUpperCase()]||String(t||'').toUpperCase()),key=n=>String(n||'').trim().toLowerCase();
const oddsCache=new Map();
async function odds(game){const id=game.eventId,old=oddsCache.get(id);if(old&&Date.now()-old.at<60000)return old.value;
 let value=null;try{const r=await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event='+encodeURIComponent(id),{signal:AbortSignal.timeout(6000)});if(r.ok)value=model.probability(await r.json())}catch{}
 if(oddsCache.size>100)oddsCache.clear();oddsCache.set(id,{at:Date.now(),value});return value;
}
// Return only the authenticated player's aggregate, never opponents or their picks.
export async function onRequestGet({request,env}){try{
 const db=env.DB;if(!db)return json({error:'Projection unavailable.'},503);
 const q=new URL(request.url).searchParams,week=Number(q.get('week'));
 if(!Number.isInteger(week)||week<1||week>22)return json({error:'Choose a valid week.'},400);
 const pool=await poolFor(db,q.get('pool'));if(!pool)return json({error:'Pool not found.'},404);
 const session=await sessionFor(request,db,pool.id);if(!session)return json({error:'Sign in to this pool.'},401);
 const roster=(await db.prepare('SELECT name FROM pool_players WHERE pool_id=?').bind(pool.id).all()).results;
 const me=roster.find(p=>key(p.name)===key(session.player_name));if(!me)return json({error:'Player access required.'},403);
 const games=await weekGames(week);
 const [saved,access,manual]=await Promise.all([
 db.prepare("SELECT player_name,game_index,team FROM pool_picks WHERE pool_id=? AND sport='nfl' AND week=?").bind(pool.id,week).all(),
 db.prepare("SELECT player_name FROM pool_payments WHERE pool_id=? AND sport='nfl' AND week=? AND paid=1").bind(pool.id,week).all(),
 db.prepare("SELECT game_index,winner FROM pool_results WHERE pool_id=? AND sport='nfl' AND week=?").bind(pool.id,week).all()]);
 for(const r of manual.results){const g=games.find(g=>g.completed&&g.teams.includes(norm(r.winner)));if(g)g.winner=norm(r.winner)}
 const picks=creditPicks(saved.results,week===4?await feedbackCredits(db,pool):[],games,week),eligible=new Set(access.results.map(r=>key(r.player_name))),credited=new Set(picks.filter(p=>p.courtesy_credit).map(p=>key(p.player_name)));
 if(!eligible.has(key(me.name))&&!credited.has(key(me.name)))return json({week,available:false,message:'Your weekly access must be active to enter the projection.'});
 const players=roster.filter(p=>eligible.has(key(p.name))||credited.has(key(p.name))).map(p=>({player:p.name,picks:Object.fromEntries(picks.filter(x=>key(x.player_name)===key(p.name)&&(eligible.has(key(p.name))||x.courtesy_credit)).map(x=>{const g=games.find(g=>g.teams.includes(norm(x.team)));return g?[g.gameIndex,norm(x.team)]:null}).filter(Boolean))})).filter(p=>Object.keys(p.picks).length);
 if(!players.some(p=>p.player===me.name))return json({week,available:false,message:'Save your picks to see your private estimate.'});
 const probs={},pending=games.filter(g=>!g.completed);await Promise.all(pending.map(async g=>{const home=await odds(g);if(home!==null)probs[g.gameIndex]={home}}));
 const mine=model.project(players,games,{},probs).find(p=>p.player===me.name);
 return json({week,available:true,winChance:mine.winChance,projected:mine.projected,correct:mine.correct,remaining:mine.pending,missingPicks:games.length-mine.picked,fallbackGames:pending.filter(g=>!probs[g.gameIndex]).length,updatedAt:new Date().toISOString()});
}catch{return json({error:'Your estimate is temporarily unavailable. Your picks are unchanged.'},503)}}
