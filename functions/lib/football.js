import {poolFor,sessionFor} from './college.js';
import {poolGameKeys} from './pool-games.js';
import {parseFootball,locked,confidenceScore,survivorStatus} from '../../public/new-build/football-core.mjs';
const json=(d,s=200)=>Response.json(d,{status:s,headers:{'Cache-Control':'no-store'}});
export async function footballFeed(season,week){
 const q=new URLSearchParams({limit:100,...(season?{dates:season,seasontype:2,week}: {})});
 for(const base of ['https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?','https://cdn.espn.com/core/nfl/scoreboard?xhr=1&']){
  try{const r=await fetch(base+q,{signal:AbortSignal.timeout(8000)});if(!r.ok)continue;const raw=await r.json(),d=raw.content?.sbData||raw;
   if(d.events?.length&&(!season||(!d.season?.year||Number(d.season.year)===Number(season))&&(!d.week?.number||Number(d.week.number)===Number(week))))return d;
  }catch{}
 }throw Error('NFL schedule or results unavailable. Saved picks have not changed.');
}
export async function footballEntries({request,env}){
 try{
 const db=env.DB,b=request.method==='GET'?Object.fromEntries(new URL(request.url).searchParams):await request.json(),game=String(b.game).toLowerCase();
 if(!['survivor','confidence'].includes(game))return json({error:'Unsupported football game.'},400);
 const pool=await poolFor(db,b.pool),s=pool&&await sessionFor(request,db,pool.id);if(!s?.player_name)return json({error:'Sign in to this pool.'},401);
 if(b.player&&String(b.player).toLowerCase()!==s.player_name.toLowerCase())return json({error:'You can only save your own picks.'},403);
 await db.prepare('CREATE TABLE IF NOT EXISTS links_game_entries(pool_id INTEGER NOT NULL,game TEXT NOT NULL,period TEXT NOT NULL,player_name TEXT NOT NULL,event_id TEXT NOT NULL,selection TEXT NOT NULL,points INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL,PRIMARY KEY(pool_id,game,period,player_name,event_id))').run();
 await db.prepare('CREATE TABLE IF NOT EXISTS links_football_versions(pool_id INTEGER,game TEXT,period TEXT,player_name TEXT,revision TEXT,PRIMARY KEY(pool_id,game,period,player_name))').run();
 const current=await footballFeed(),season=Number(b.season||current.season?.year),currentWeek=Math.min(18,Number(current.week?.number||1)+(current.events.every(e=>e.status?.type?.completed)?1:0)),week=Number(b.week||currentWeek);
 if(!Number.isInteger(season)||season<2000||season>2100||!Number.isInteger(week)||week<1||week>18)return json({error:'Choose a valid NFL regular-season week.'},400);
 const period=season+'-2-'+week,raw=await footballFeed(season,week),games=parseFootball(raw.events);
 const rows=(await db.prepare('SELECT period,player_name AS player,event_id AS eventId,selection,points,updated_at AS savedAt FROM links_game_entries WHERE pool_id=? AND game=? AND period LIKE ?').bind(pool.id,game,season+'-2-%').all()).results||[];
 const mine=rows.filter(p=>p.player===s.player_name&&p.period===period),own=rows.filter(p=>p.player===s.player_name);
 const settingsRow=await db.prepare('SELECT value FROM pool_settings WHERE pool_id=? AND key=?').bind(pool.id,'game_settings_'+game).first(),settings=JSON.parse(settingsRow?.value||'{}');
 const startWeek=Math.max(1,Math.min(week,Number(settings.startWeek)||Math.min(week,...rows.map(p=>Number(p.period.split('-')[2])))));
 const rules={lives:Math.max(1,Math.min(10,Number(settings.lives)||1)),tieSurvives:settings.tieSurvives===true||settings.tieSurvives==='true'};
 const slates={[week]:games},weeks=game==='survivor'?Array.from({length:week-startWeek},(_,i)=>startWeek+i):[...new Set(rows.map(p=>Number(p.period.split('-')[2])))].filter(w=>w!==week);
 // Bound feed concurrency to avoid exhausting a worker's simultaneous connections.
 for(let i=0;i<weeks.length;i+=4)await Promise.all(weeks.slice(i,i+4).map(async w=>{slates[w]=parseFootball((await footballFeed(season,w)).events)}));
 const state=survivorStatus(own,slates,startWeek,week,rules),version=await db.prepare('SELECT revision FROM links_football_versions WHERE pool_id=? AND game=? AND period=? AND player_name=?').bind(pool.id,game,period,s.player_name).first(),revision=version?.revision||'';
 const players=[...new Set(rows.map(p=>p.player))],standings=players.map(player=>{
  const entries=rows.filter(p=>p.player===player);
  if(game==='survivor'){const x=survivorStatus(entries,slates,startWeek,week,rules);return {player,status:x.status,wins:x.wins,losses:x.losses}}
  const weekly=confidenceScore(entries.filter(p=>p.period===period),games),seasonScore=Object.entries(slates).reduce((sum,[w,gs])=>sum+confidenceScore(entries.filter(p=>Number(p.period.split('-')[2])===Number(w)),gs).score,0);return {player,...weekly,seasonScore};
 }).sort((a,b)=>game==='survivor'?a.losses-b.losses||b.wins-a.wins:b.score-a.score||a.player.localeCompare(b.player));
 let rank=0,last;standings.forEach((r,i)=>{const key=game==='survivor'?r.losses+':'+r.wins:r.score;if(key!==last)rank=i+1;r.rank=rank;last=key});
 if(request.method==='GET')return json({success:true,game,season,week,period,games,picks:mine,revision,standings,state:game==='survivor'?state:null,rules,startWeek,used:own.filter(p=>p.period!==period).map(p=>p.selection),player:s.player_name,active:(await poolGameKeys(db,pool.id)).includes(game)});
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 if(!(await poolGameKeys(db,pool.id)).includes(game))return json({error:'This game is read-only in your pool.'},403);
 if(season!==Number(current.season?.year)||week>currentWeek||Number(current.season?.type)!==2)return json({error:'Picks are open only for the current NFL regular season and available week.'},403);
 if(mine.some(p=>!games.some(g=>g.id===p.eventId)))return json({error:'A saved matchup is missing from the schedule. Picks remain unchanged.'},503);
 let next;
 if(Array.isArray(b.picks)){if(b.revision!==revision)return json({error:'Picks changed on another device. Refresh before saving.'},409);next=b.picks}
 else{next=mine.filter(p=>p.eventId!==String(b.eventId));if(game==='survivor')next=[];if(b.action!=='remove')next.push({eventId:String(b.eventId),selection:String(b.selection),points:Number(b.points)||0})}
 if(next.length>games.length||game==='survivor'&&next.length>1||new Set(next.map(p=>p.eventId)).size!==next.length)return json({error:'Choose one selection per game.'},400);
 for(const p of next){const g=games.find(g=>g.id===p.eventId);if(!g?.teams.some(t=>t.id===p.selection))return json({error:'Choose a team from this week’s schedule.'},400);if(game==='confidence'&&(!Number.isInteger(p.points)||p.points<0||p.points>games.length))return json({error:'Confidence points must be from 1 through the number of games, or unassigned.'},400)}
 if(game==='confidence'){const ranks=next.filter(p=>p.points>0).map(p=>p.points);if(new Set(ranks).size!==ranks.length)return json({error:'Use each confidence value only once.'},400)}
 for(const g of games){const a=mine.find(p=>p.eventId===g.id),n=next.find(p=>p.eventId===g.id);if(locked(g)&&(a?.selection!==n?.selection||Number(a?.points||0)!==Number(n?.points||0)))return json({error:'A started game’s pick and points are locked.'},403)}
 if(game==='survivor'){
  if(state.status==='ELIMINATED')return json({error:'Your Survivor entry is eliminated.'},403);
  if(mine[0]&&locked(games.find(g=>g.id===mine[0].eventId))&&next[0]?.eventId!==mine[0].eventId)return json({error:'Your Survivor selection is locked.'},403);
  if(next[0]&&own.some(p=>p.period!==period&&p.selection===next[0].selection))return json({error:'This team was already used this season.'},400);
  if(state.history.some(h=>h.week<week&&h.result==='PENDING'))return json({error:'A previous Survivor result is pending. Try again after it is final.'},409);
 }
 const nonce=crypto.randomUUID(),bind=[pool.id,game,period,s.player_name],guard='EXISTS(SELECT 1 FROM links_football_versions WHERE pool_id=? AND game=? AND period=? AND player_name=? AND revision=?)';
 const statements=[db.prepare('INSERT INTO links_football_versions VALUES(?,?,?,?,?) ON CONFLICT(pool_id,game,period,player_name) DO UPDATE SET revision=excluded.revision WHERE revision=?').bind(...bind,nonce,revision),
 db.prepare('DELETE FROM links_game_entries WHERE pool_id=? AND game=? AND period=? AND player_name=? AND '+guard).bind(...bind,...bind,nonce)];
 for(const p of next)statements.push(db.prepare('INSERT INTO links_game_entries(pool_id,game,period,player_name,event_id,selection,points,updated_at) SELECT ?,?,?,?,?,?,?,? WHERE '+guard).bind(...bind,p.eventId,p.selection,game==='confidence'?p.points:0,new Date().toISOString(),...bind,nonce));
 const result=await db.batch(statements);if(!result[0].meta?.changes)return json({error:'Picks changed on another device. Refresh before saving.'},409);
 return json({success:true,revision:nonce,period,picks:next});
 }catch(e){return json({error:e.message?.includes('NFL schedule')?e.message:'Football pool unavailable. Refresh and try again; do not assume your changes saved.'},503)}
}
