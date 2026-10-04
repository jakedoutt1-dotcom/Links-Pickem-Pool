import {feedbackCredits,creditPicks,creditNotice} from '../../lib/nfl-feedback-credit.js';
const json=(d,s=200)=>Response.json(d,{status:s,headers:{'Cache-Control':'no-store'}});
export async function resolvePool(db,value){const raw=String(value||'').trim();if(/^\d+$/.test(raw)){const p=await db.prepare('SELECT id,code,name FROM pools WHERE id=? LIMIT 1').bind(Number(raw)).first();if(p)return p}return raw?await db.prepare('SELECT id,code,name FROM pools WHERE upper(code)=upper(?) OR lower(trim(name))=lower(trim(?)) LIMIT 1').bind(raw,raw).first():null}
const ALIAS={WSH:'WAS',JAC:'JAX',LA:'LAR'};const norm=x=>ALIAS[String(x||'').toUpperCase()]||String(x||'').toUpperCase();
const exactKey=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'');const nameKey=v=>{const a=String(v||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim().split(' ').filter(Boolean);return a.length?(a[0][0]||'')+'|'+(a[a.length-1]||''):''};
export async function nflWeek(week){
 const apiWeek=week<=18?week:({19:1,20:2,21:3,22:5}[week]);
 const query='dates=2026&seasontype='+(week<=18?2:3)+'&week='+apiWeek+'&limit=100&_='+Date.now();
 // Match the established legacy ESPN transport, including its CDN fallback.
 const urls=['https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?'+query,'https://cdn.espn.com/core/nfl/scoreboard?xhr=1&'+query];
 let j;
 for(const url of urls){try{
  const r=await fetch(url,{headers:{accept:'application/json,text/plain,*/*','cache-control':'no-cache,no-store,max-age=0',pragma:'no-cache','user-agent':'Mozilla/5.0'},cf:{cacheTtl:0,cacheEverything:false},signal:AbortSignal.timeout(8000)});
  if(!r.ok)continue;const data=await r.json();
  const events=data.events||data.content?.sbData?.events||data.sbData?.events;
  if(Array.isArray(events)){j={events};if(events.length)break;}
 }catch{}}
 if(!j)throw Error('NFL schedule unavailable');
 return [...new Map((j.events||[]).map(e=>[e.id,e])).values()].map((e,i)=>{
  const c=e.competitions?.[0]||{},teams=c.competitors||[];
  const completed=!!(e.status?.type?.completed||c.status?.type?.completed);
  const scores=teams.map(t=>t.score==null||t.score===''?NaN:Number(t.score));
  let winner=teams.find(t=>t.winner)?.team?.abbreviation||'';
  if(completed&&!winner&&teams.length===2&&scores.every(Number.isFinite)&&scores[0]!==scores[1])winner=teams[scores[0]>scores[1]?0:1].team?.abbreviation||'';
  return {i,id:e.id,teams:teams.map(t=>norm(t.team?.abbreviation)),completed,winner:completed?(norm(winner)||(scores.length===2&&scores.every(Number.isFinite)&&scores[0]===scores[1]?'TIE':'')):'',total:completed&&scores.length===2&&scores.every(Number.isFinite)?scores[0]+scores[1]:null,kickoff:e.date||c.date||null};
 });
}
export async function onRequestGet({request,env}){
 const db=env.DB;if(!db)return json({success:false,error:'Legacy LINKS database unavailable'},503);
 const q=new URL(request.url).searchParams,p=await resolvePool(db,q.get('pool'));
 const week=Math.max(1,Math.min(22,Number(q.get('week')||1)));
 if(!p)return json({success:false,error:'Pool not found'},404);
 let games;try{games=await nflWeek(week)}catch{return json({success:false,error:'NFL schedule unavailable. Standings have not been recalculated.'},502)}
 const first=Math.min(...games.map(g=>Date.parse(g.kickoff)).filter(Number.isFinite));
 if(!Number.isFinite(first)||Date.now()<first)return json({success:true,week,locked:false,rows:[],finalGames:0,expectedGames:games.length,allFinal:false,finalizedWinners:[]});
 const [players,picks,ties,manual,access]=await Promise.all([
  db.prepare('SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid').bind(p.id).all(),
  db.prepare("SELECT player_name,game_index,team FROM pool_picks WHERE pool_id=? AND sport='nfl' AND week=? ORDER BY player_name,game_index").bind(p.id,week).all(),
  db.prepare("SELECT player_name,guess FROM pool_ties WHERE pool_id=? AND sport='nfl' AND week=?").bind(p.id,week).all(),
  db.prepare("SELECT game_index,winner FROM pool_results WHERE pool_id=? AND sport='nfl' AND week=?").bind(p.id,week).all(),
  db.prepare("SELECT player_name FROM pool_payments WHERE pool_id=? AND sport='nfl' AND week=? AND paid=1").bind(p.id,week).all()
 ]);
 const credits=Number(week)===4?await feedbackCredits(db,p):[];
 return json({...gradeWeek(p,week,games,{players,picks,ties,manual,access,credits}),courtesy:creditNotice(credits,week)});
}
export function gradeWeek(p,week,games,{players,picks,ties,manual,access,credits=[]}){
 const roster=(players.results||[]).map(x=>String(x.name||''));
 const canonical=raw=>roster.find(x=>exactKey(x)===exactKey(raw))||roster.find(x=>nameKey(x)===nameKey(raw))||String(raw||'');
 const eligible=new Set((access.results||[]).map(x=>exactKey(canonical(x.player_name))));
 const byTeam=new Map();for(const g of games)for(const team of g.teams)byTeam.set(team,g);
 // Saved indexes and ESPN ordering can differ. A team's matchup is stable within a week.
 // Resolve commissioner winners by their team too; blank result placeholders never erase finals.
 for(const r of manual.results||[]){const team=norm(r.winner),g=byTeam.get(team);if(g?.completed&&team)g.winner=team;}
 picks.results=creditPicks(picks.results||[],credits,games,week);
 const credited=new Set(picks.results.filter(r=>r.courtesy_credit).map(r=>exactKey(canonical(r.player_name))));
 picks.results=(picks.results||[]).filter(x=>x.courtesy_credit||eligible.has(exactKey(canonical(x.player_name))));
 ties.results=(ties.results||[]).filter(x=>eligible.has(exactKey(canonical(x.player_name))));
 const slots=new Set((picks.results||[]).map(x=>Number(x.game_index)).filter(Number.isInteger));
 const expectedGames=Math.max(games.length,slots.size);
 const finalGames=games.filter(g=>g.completed&&g.winner&&g.total!=null).length;
 const allFinal=expectedGames>0&&finalGames===expectedGames;
 const last=[...games].sort((a,b)=>Date.parse(b.kickoff)-Date.parse(a.kickoff)||b.i-a.i)[0];
 const tieLocked=games.length>0&&games.every(g=>Number.isFinite(Date.parse(g.kickoff))&&Date.now()>=Date.parse(g.kickoff));
 const actualTie=allFinal&&tieLocked?(last?.total??null):null;
 const tieMap={},by=new Map();
 for(const x of ties.results||[])tieMap[canonical(x.player_name)]=x.guess;
 for(const x of picks.results||[]){const name=canonical(x.player_name);if(!by.has(name))by.set(name,[]);by.get(name).push(x);}
 const rows=[...new Set([...roster,...by.keys()])].filter(name=>eligible.has(exactKey(name))||credited.has(exactKey(name))).map(player=>{
  let wins=0,losses=0;const seen=new Set();
  for(const pick of by.get(player)||[]){const team=norm(pick.team),g=byTeam.get(team);if(!g?.completed||!g.winner||g.winner==='TIE'||seen.has(g.id))continue;seen.add(g.id);if(team===g.winner)wins++;else losses++;}
  const tiePick=tieLocked?(tieMap[player]??null):null,tieDiff=actualTie!=null&&tiePick!=null?Math.abs(Number(tiePick)-actualTie):null;
  return {player,wins,losses,correct:wins,tiePick,tieDiff,...(credited.has(exactKey(player))?{courtesyCredit:true}:{})};
 }).filter(x=>by.get(x.player)?.length||tieMap[x.player]!=null).sort((a,b)=>b.wins-a.wins||(a.tieDiff??Infinity)-(b.tieDiff??Infinity)||a.player.localeCompare(b.player));
 const top=rows[0],finalizedWinners=allFinal&&top?rows.filter(x=>x.wins===top.wins&&(actualTie==null||(x.tieDiff??Infinity)===(top.tieDiff??Infinity))).map(x=>x.player):[];
 return {success:true,week,locked:true,tieLocked,rows,actualTie,finalizedWinner:finalizedWinners[0]||null,finalizedWinners,allFinal,finalGames,expectedGames,pool:{id:String(p.id),name:p.name,code:p.code}};
}
