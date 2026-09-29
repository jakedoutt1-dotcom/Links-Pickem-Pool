const feedCache=new Map();
const BASE='https://site.api.espn.com/apis/site/v2/sports/football/college-football/';
export const settingKey=week=>'game_settings:college-pick-em:week-'+week;
export const lockKey=(week,player)=>'college_player_lock_'+week+'_'+player.trim().toLowerCase();
export const code=value=>String(value||'').toUpperCase();
export async function feed(kind,query=''){
 const cacheKey=kind+'?'+query,cached=feedCache.get(cacheKey);if(cached&&Date.now()-cached.at<60000)return cached.data;
 const urls=[BASE+kind+'?'+query,'https://cdn.espn.com/core/college-football/'+kind+'?xhr=1&'+query];
 for(const url of urls)try{const r=await fetch(url,{headers:{accept:'application/json','user-agent':'Mozilla/5.0'},signal:AbortSignal.timeout(8000)});if(r.ok){const j=await r.json();const d=[j,j.content?.sbData,j.sbData,j.content?.config?.json,j.content?.data,j.content].find(v=>v&&(kind==='scoreboard'?Array.isArray(v.events):Array.isArray(v.rankings)))||{};if(kind==='scoreboard'&&Array.isArray(d.events)||kind==='rankings'&&Array.isArray(d.rankings)){feedCache.set(cacheKey,{at:Date.now(),data:d});return d}}}catch{}
 throw Error('College '+kind+' is unavailable. Please try again.');
}
export function parseGames(data){return [...new Map((data.events||[]).map(e=>[e.id,e])).values()].map(e=>{
 const c=e.competitions?.[0],ts=c?.competitors||[],a=ts.find(t=>t.homeAway==='away'),h=ts.find(t=>t.homeAway==='home');if(!a||!h)return null;
 const completed=!!(e.status?.type?.completed||c.status?.type?.completed),awayScore=Number(a.score),homeScore=Number(h.score),scored=a.score!=null&&h.score!=null&&Number.isFinite(awayScore)&&Number.isFinite(homeScore);
 return {eventId:String(e.id),away:code(a.team.abbreviation||a.team.id),home:code(h.team.abbreviation||h.team.id),awayId:String(a.team.id),homeId:String(h.team.id),awayName:a.team.shortDisplayName||a.team.displayName,homeName:h.team.shortDisplayName||h.team.displayName,awayLogo:a.team.logo||'',homeLogo:h.team.logo||'',kickoff:e.date||c.date,completed,winner:completed&&scored?(awayScore===homeScore?'TIE':awayScore>homeScore?code(a.team.abbreviation||a.team.id):code(h.team.abbreviation||h.team.id)):'',total:completed&&scored?awayScore+homeScore:null,awayScore:a.score??'',homeScore:h.score??'',detail:e.status?.type?.shortDetail||''};
 }).filter(Boolean)}
export async function collegeContext(){const d=await feed('scoreboard','groups=80&limit=300');let week=Number(d.season?.type)===3?17:Number(d.week?.number||1);const games=parseGames(d);if(games.length&&games.every(g=>g.completed))week++;return {week:Math.min(17,week),season:Number(d.season?.year||new Date().getFullYear()),seasonType:Number(d.season?.type||2)}}
export async function schedule(week,context){return parseGames(await feed('scoreboard',new URLSearchParams({dates:context.season,seasontype:week===17?3:2,week:week===17?1:week,groups:80,limit:300})))}
export async function apCandidates(games,week,context){
 const d=await feed('rankings',new URLSearchParams({season:context.season,seasontype:week===17?3:2,week:week===17?1:week}));
 const poll=d.rankings.find(p=>/AP Top 25|Associated Press/i.test(p.name||p.shortName||''));if(poll&&((poll.season?.year&&Number(poll.season.year)!==Number(context.season))||(poll.occurrence?.number&&Number(poll.occurrence.number)!==Number(week===17?1:week))))throw Error('AP Top 25 rankings for this week are not published yet. Please try again later.');if(!poll)throw Error('AP Top 25 rankings are unavailable. No other poll was substituted.');
 const ranks=new Map();for(const row of poll.ranks||[]){const rank=Number(row.current??row.rank),team=row.team||{};if(rank>=1&&rank<=25){if(team.id)ranks.set(String(team.id),rank);if(team.abbreviation)ranks.set(code(team.abbreviation),rank)}}
 if(!ranks.size)throw Error('AP Top 25 rankings are unavailable.');
 return games.map(g=>({...g,awayRank:ranks.get(g.awayId)||ranks.get(g.away)||null,homeRank:ranks.get(g.homeId)||ranks.get(g.home)||null})).filter(g=>g.awayRank||g.homeRank);
}
export async function poolFor(db,raw){raw=String(raw||'').trim();if(/^\d+$/.test(raw)){const p=await db.prepare('SELECT id,code,name FROM pools WHERE id=?').bind(Number(raw)).first();if(p)return p}return db.prepare('SELECT id,code,name FROM pools WHERE upper(code)=upper(?)').bind(raw).first()}
export async function sessionFor(request,db,pool){const token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');if(!token)return null;const s=await db.prepare('SELECT * FROM pool_sessions WHERE token=?').bind(token).first();return s&&String(s.pool_id)===String(pool)&&Date.parse(s.expires_at)>Date.now()?s:null}
export async function storedSlate(db,pool,week,live){
 const row=await db.prepare('SELECT value FROM pool_settings WHERE pool_id=? AND key=?').bind(pool,settingKey(week)).first();let data=null;try{data=JSON.parse(row?.value||'null')}catch{throw Error('The saved college slate could not be read. Contact your commissioner.')}
 const settings=data?.settings||data;
 if(settings?.eventIds?.length){const snapshots=settings.games||[];return settings.eventIds.map((id,i)=>{const g=live.find(g=>g.eventId===String(id))||snapshots.find(g=>g.eventId===String(id));if(!g)throw Error('A selected game is missing from the feed. Saved picks are unchanged.');return {...g,gameIndex:i}})}
 const rows=(await db.prepare("SELECT * FROM pool_games WHERE pool_id=? AND sport='college' AND week=? ORDER BY game_index").bind(pool,week).all()).results||[];
 return rows.map(r=>{const current=live.find(g=>g.eventId===String(r.event_id)||g.away===r.away&&g.home===r.home);return {...(current||{eventId:String(r.event_id),away:r.away,home:r.home,awayName:r.away_name,homeName:r.home_name,kickoff:r.kickoff,completed:false,winner:''}),gameIndex:Number(r.game_index)}});
}
export const deadline=games=>{const times=games.map(g=>Date.parse(g.kickoff));return games.length&&times.every(Number.isFinite)?Math.min(...times):null};
export async function rowsFor(db,pool,week){const [picks,ties,access,results]=await Promise.all([
 db.prepare("SELECT player_name,game_index,team FROM pool_picks WHERE pool_id=? AND sport='college' AND week=?").bind(pool,week).all(),
 db.prepare("SELECT player_name,guess FROM pool_ties WHERE pool_id=? AND sport='college' AND week=?").bind(pool,week).all(),
 db.prepare("SELECT player_name,paid FROM pool_payments WHERE pool_id=? AND sport='college' AND week=?").bind(pool,week).all(),
 db.prepare("SELECT game_index,winner FROM pool_results WHERE pool_id=? AND sport='college' AND week=?").bind(pool,week).all()
 ]);return {picks:picks.results||[],ties:ties.results||[],access:access.results||[],results:results.results||[]}}
export const sameName=(a,b)=>String(a||'').trim().toLowerCase()===String(b||'').trim().toLowerCase();
export function playerCard(rows,games,player){const picks={};for(const p of rows.picks.filter(p=>sameName(p.player_name,player))){const match=games.filter(g=>[g.away,g.home].includes(code(p.team)));if(match.length===1)picks[match[0].eventId]=code(p.team)}return {player,picks,tie:rows.ties.find(t=>sameName(t.player_name,player))?.guess??null,active:rows.access.some(a=>sameName(a.player_name,player)&&Number(a.paid)===1)}}
export function standings(players,games){const allFinal=games.length>0&&games.every(g=>g.completed&&g.winner),last=[...games].sort((a,b)=>Date.parse(b.kickoff)-Date.parse(a.kickoff)||b.gameIndex-a.gameIndex)[0],actualTie=allFinal?last.total:null;
 const rows=players.filter(p=>p.active&&(Object.keys(p.picks).length||p.tie!=null)).map(p=>{let wins=0,losses=0;for(const g of games){const pick=p.picks[g.eventId];if(pick&&g.completed&&g.winner&&g.winner!=='TIE'){if(pick===g.winner)wins++;else losses++}}return {player:p.player,wins,losses,tie:p.tie,tieDiff:actualTie!=null&&p.tie!=null?Math.abs(p.tie-actualTie):null}}).sort((a,b)=>b.wins-a.wins||(a.tieDiff??Infinity)-(b.tieDiff??Infinity)||a.player.localeCompare(b.player));
 const top=rows[0];return {rows,allFinal,actualTie,finalizedWinners:allFinal&&top?rows.filter(r=>r.wins===top.wins&&(r.tieDiff??Infinity)===(top.tieDiff??Infinity)).map(r=>r.player):[]};
}
