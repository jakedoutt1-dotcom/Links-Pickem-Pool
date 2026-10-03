import {feedbackCredits,creditPicks,creditNotice} from '../../lib/nfl-feedback-credit.js';
const json=(d,s=200)=>Response.json(d,{status:s,headers:{"Cache-Control":"no-store"}});
const TEAM_ALIAS={WAS:"WSH",WSH:"WSH",JAX:"JAX",LV:"LV",LAC:"LAC",LAR:"LAR"};
async function resolvePool(db,value){const raw=String(value||"").trim();if(!raw)return null;if(/^\d+$/.test(raw)){const p=await db.prepare("SELECT id,code,name FROM pools WHERE id=? LIMIT 1").bind(Number(raw)).first();if(p)return p}return await db.prepare("SELECT id,code,name FROM pools WHERE upper(code)=upper(?) OR lower(trim(name))=lower(trim(?)) LIMIT 1").bind(raw,raw).first()}
async function currentNFLWeek(){try{const r=await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=100",{cache:"no-store"}),j=await r.json();return Number(j?.week?.number||1)||1}catch{return 1}}
const norm=v=>({WAS:'WSH',JAC:'JAX',LA:'LAR'}[String(v||'').toUpperCase()]||String(v||'').toUpperCase());
export async function weekGames(week){
 const apiWeek=week<=18?week:({19:1,20:2,21:3,22:5}[week]);
 const now=new Date(),season=now.getUTCFullYear()-(now.getUTCMonth()<6?1:0);
 const query='dates='+season+'&seasontype='+(week<=18?2:3)+'&week='+apiWeek+'&limit=100&_='+Date.now();
 // Match the established legacy ESPN transport, including its CDN fallback.
 const urls=['https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?'+query,'https://cdn.espn.com/core/nfl/scoreboard?xhr=1&'+query];
 let j;
 for(const url of urls){try{
  const r=await fetch(url,{headers:{accept:'application/json,text/plain,*/*','cache-control':'no-cache,no-store,max-age=0',pragma:'no-cache','user-agent':'Mozilla/5.0'},cf:{cacheTtl:0,cacheEverything:false},signal:AbortSignal.timeout(8000)});
  if(!r.ok)continue;const data=await r.json();
  const events=data.events||data.content?.sbData?.events||data.sbData?.events;
  if(Array.isArray(events)){j={events};if(events.length)break;}
 }catch{}}
 if(!j?.events?.length)throw Error('NFL schedule unavailable');
 return [...new Map((j.events||[]).map(e=>[e.id,e])).values()].map((e,i)=>{
  const c=e.competitions?.[0]||{},teams=c.competitors||[];
  const completed=!!(e.status?.type?.completed||c.status?.type?.completed);
  const scores=teams.map(t=>Number(t.score));
  let winner=teams.find(t=>t.winner)?.team?.abbreviation||'';
  if(completed&&!winner&&teams.length===2&&scores.every(Number.isFinite)&&scores[0]!==scores[1])winner=teams[scores[0]>scores[1]?0:1].team?.abbreviation||'';
  return {gameIndex:i,eventId:String(e.id),home:norm(teams.find(t=>t.homeAway==='home')?.team?.abbreviation),away:norm(teams.find(t=>t.homeAway==='away')?.team?.abbreviation),teams:teams.map(t=>norm(t.team?.abbreviation)),completed,winner:completed?norm(winner):'',total:completed&&scores.length===2&&scores.every(Number.isFinite)?scores[0]+scores[1]:null,kickoff:e.date||c.date||null};
 });
}
function nameKey(v){const s=String(v||"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim(),a=s.split(" ").filter(Boolean);if(!a.length)return"";return (a[0][0]||"")+"|"+(a[a.length-1]||"")}
function exactKey(v){return String(v||"").toLowerCase().replace(/[^a-z0-9]/g,"")}
export async function onRequestGet({request,env}){
 const db=env.DB;if(!db)return json({success:false,error:"Legacy LINKS database unavailable",build:"732"},503);
 const q=new URL(request.url).searchParams,p=await resolvePool(db,q.get("pool")),week=Math.max(1,Math.min(22,Number(q.get("week")||0)||await currentNFLWeek()));
 if(!p)return json({success:false,error:"Pool not found"},404);
 let games;try{games=await weekGames(week)}catch(e){return json({success:false,error:'NFL schedule unavailable. Please try again.'},502)}
 const first=games.map(g=>Date.parse(g.kickoff)).filter(Number.isFinite).sort((a,b)=>a-b)[0];
 if(!Number.isFinite(first))return json({success:false,error:'NFL kickoff unavailable. Please try again.'},502);
 // Shared picks open only at first kickoff, including for commissioners.
 const locked=Number.isFinite(first)&&Date.now()>=first;
 if(!locked)return json({success:true,locked:false,week,players:[],games,results:{},build:"732"});
 const [pr,pk,tr,rr,access]=await Promise.all([
  db.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid").bind(p.id).all(),
  db.prepare("SELECT player_name,game_index,team FROM pool_picks WHERE pool_id=? AND sport='nfl' AND week=? ORDER BY player_name,game_index").bind(p.id,week).all(),
  db.prepare("SELECT player_name,guess FROM pool_ties WHERE pool_id=? AND sport='nfl' AND week=?").bind(p.id,week).all(),
  db.prepare("SELECT game_index,winner FROM pool_results WHERE pool_id=? AND sport='nfl' AND week=? ORDER BY game_index").bind(p.id,week).all(),
  db.prepare("SELECT player_name FROM pool_payments WHERE pool_id=? AND sport='nfl' AND week=? AND paid=1").bind(p.id,week).all()
 ]);
 const roster=(pr.results||[]).map(x=>String(x.name||"")),canonical=(raw)=>{const e=exactKey(raw),n=nameKey(raw);return roster.find(x=>exactKey(x)===e)||roster.find(x=>nameKey(x)===n)||String(raw||"")};
 for(const r of rr.results||[]){const winner=norm(r.winner),g=games.find(g=>g.home===winner||g.away===winner);if(g?.completed&&winner)g.winner=winner;}
 const credits=week===4?await feedbackCredits(db,p):[];pk.results=creditPicks(pk.results||[],credits,games,week);
 const credited=new Set(pk.results.filter(r=>r.courtesy_credit).map(r=>exactKey(r.player_name)));
 const pickMap={},tieMap={};for(const r of pk.results||[]){if(!r.courtesy_credit&&credited.has(exactKey(r.player_name))&&!(access.results||[]).some(a=>exactKey(a.player_name)===exactKey(r.player_name)))continue;const game=games.find(g=>g.home===norm(r.team)||g.away===norm(r.team));if(!game||!Number.isFinite(Date.parse(game.kickoff))||Date.now()<Date.parse(game.kickoff))continue;const who=canonical(r.player_name);(pickMap[who]??={})[games.find(g=>g.home===norm(r.team)||g.away===norm(r.team))?.gameIndex??Number(r.game_index)]=norm(r.team)}for(const r of tr.results||[]){const who=canonical(r.player_name);tieMap[who]=r.guess}
 const eligible=new Set((access.results||[]).map(x=>exactKey(canonical(x.player_name))));
 const players=roster.filter(name=>eligible.has(exactKey(name))||credited.has(exactKey(name))).map(name=>({player:name,picks:pickMap[name]||{},tie:games.every(g=>Date.now()>=Date.parse(g.kickoff))?(tieMap[name]??null):null})).filter(x=>Object.keys(x.picks).length||x.tie!=null);
 const results=Object.fromEntries(games.filter(g=>g.winner).map(g=>[g.gameIndex,g.winner]));
 for(const r of rr.results||[]){const winner=norm(r.winner),g=games.find(g=>g.home===winner||g.away===winner);if(g){results[g.gameIndex]=winner;g.winner=winner;g.completed=true}}
 return json({success:true,locked:true,week,courtesy:creditNotice(credits,week),pool:{id:String(p.id),name:p.name,code:p.code},players,games,results,finalGames:Object.keys(results).length,build:"732"});
}