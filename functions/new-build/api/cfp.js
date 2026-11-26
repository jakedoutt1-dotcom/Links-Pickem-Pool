import {bracketState} from '../../lib/cfp-bracket.js';
import {sessionFor} from '../../lib/college.js';
import {poolGameKeys} from '../../lib/pool-games.js';
import {cfpSeason,isPlayoff,normalizePlayoff,gradePlayoff,pickClosed} from '../../../public/new-build/cfp-core.mjs';
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}}),fail=(message,status=400)=>Object.assign(Error(message),{status});
export async function fetchPlayoffs(season){
 const url='https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?'+new URLSearchParams({groups:80,seasontype:3,dates:season+'1201-'+(season+1)+'0131',limit:1000});
 const r=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)});if(!r.ok)throw fail('College playoff schedule is unavailable. Saved picks are unchanged.',503);
 const data=await r.json();if(!Array.isArray(data.events))throw fail('College playoff schedule is unavailable.',503);
 return data.events.filter(e=>Number(e.season?.type)===3&&isPlayoff(e)).map(normalizePlayoff).filter(g=>Number.isFinite(Date.parse(g.start))&&g.start.slice(0,10)>=season+'-12-01'&&g.start.slice(0,10)<=(season+1)+'-01-31');
}
export async function onRequest({request,env}){try{
 if(!['GET','POST'].includes(request.method))throw fail('Method not allowed.',405);
 if(request.method==='POST'&&request.headers.get('Origin')&&request.headers.get('Origin')!==new URL(request.url).origin)throw fail('Open your pool on LINKS before saving.',403);
 const db=env.DB;if(!db)throw fail('Pool service unavailable.',503);
 const post=request.method==='POST',b=post?await request.json():Object.fromEntries(new URL(request.url).searchParams),pool=Number(b.pool),season=Number(b.season||cfpSeason());
 if(!Number.isInteger(pool)||pool<1||!Number.isInteger(season)||season<2024||season>cfpSeason()+1)throw fail('Choose a valid pool and college season.');
 const actor=await sessionFor(request,db,pool);if(!actor)throw fail('Sign in to this pool.',401);
 if(!(await poolGameKeys(db,pool)).includes('cfp'))throw fail('College Playoff Pick\'em is not enabled in this pool.',403);
 const member=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?)').bind(pool,actor.player_name).first();if(!member)throw fail('Player membership not found.',403);
 if(post&&b.action==='bracketTeams'){
  if(actor.role!=='admin')throw fail('Commissioner access required.',403);
  const r=await fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams?limit=1000',{signal:AbortSignal.timeout(12000)});if(!r.ok)throw fail('Team list unavailable. Try again.',503);
  const j=await r.json(),teams=(j.sports||[]).flatMap(s=>(s.leagues||[]).flatMap(l=>(l.teams||[]).map(x=>x.team))).filter(t=>t&&/^[1-9]\d*$/.test(String(t.id))).map(t=>({id:String(t.id),name:t.displayName,record:t.record?.items?.find(r=>r.type==='total')?.summary||'',logo:'https://a.espncdn.com/i/teamlogos/ncaa/500/'+t.id+'.png'}));
  if(!teams.length)throw fail('Team list unavailable. Try again.',503);return json({teams});
 }
 await db.batch([
  db.prepare('CREATE TABLE IF NOT EXISTS links_cfp_games(season INTEGER,event_id TEXT,data TEXT NOT NULL,locked INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(season,event_id))'),
  db.prepare('CREATE TABLE IF NOT EXISTS links_cfp_picks(pool_id INTEGER,player TEXT,season INTEGER,event_id TEXT,team TEXT,bonus INTEGER NOT NULL DEFAULT 0,total_side TEXT,total_line REAL,saved_at TEXT,PRIMARY KEY(pool_id,player,season,event_id))'),
  db.prepare('CREATE TABLE IF NOT EXISTS links_cfp_settings(pool_id INTEGER,season INTEGER,bonus INTEGER NOT NULL DEFAULT 1,totals INTEGER NOT NULL DEFAULT 1,revision INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(pool_id,season))'),
  db.prepare('CREATE TABLE IF NOT EXISTS links_cfp_lines(pool_id INTEGER,season INTEGER,event_id TEXT,total_line REAL NOT NULL,PRIMARY KEY(pool_id,season,event_id))'),
  db.prepare('INSERT OR IGNORE INTO links_cfp_settings(pool_id,season) VALUES(?,?)').bind(pool,season)
 ]);
 let settings=await db.prepare('SELECT * FROM links_cfp_settings WHERE pool_id=? AND season=?').bind(pool,season).first();
 if(post&&b.action==='settings'){
  if(actor.role!=='admin')throw fail('Commissioner access required.',403);
  if(typeof b.bonus!=='boolean'||typeof b.totals!=='boolean')throw fail('Choose on or off for each scoring option.');
  const r=await db.prepare('UPDATE links_cfp_settings SET bonus=?,totals=?,revision=revision+1 WHERE pool_id=? AND season=? AND revision=? AND NOT EXISTS(SELECT 1 FROM links_cfp_picks WHERE pool_id=? AND season=?)').bind(b.bonus?1:0,b.totals?1:0,pool,season,Number(b.revision),pool,season).run();
  if(!r.meta?.changes)throw fail('Scoring rules changed or picks have already been saved. Refresh before continuing.',409);return json({ok:true});
 }
 const previous=(await db.prepare('SELECT * FROM links_cfp_games WHERE season=?').bind(season).all()).results||[];let fresh=[],warning='';
 try{fresh=await fetchPlayoffs(season)}catch(error){if(post)throw error;warning='The schedule could not refresh. Showing saved results; picking is paused until it reconnects.'}
 for(let g of fresh){const prior=previous.find(r=>r.event_id===g.id),old=prior?JSON.parse(prior.data):null;if(old?.final&&old.winner&&(!g.final||!g.winner))g=old;
  // TBD and void games are unavailable, but can become eligible after an official update before kickoff.
  const sticky=!!prior?.locked||!!(old&&!old.tbd&&Date.now()>=Date.parse(old.start))||g.live||g.final||(!g.tbd&&Date.now()>=Date.parse(g.start));
  await db.prepare('INSERT INTO links_cfp_games VALUES(?,?,?,?) ON CONFLICT(season,event_id) DO UPDATE SET data=excluded.data,locked=MAX(links_cfp_games.locked,excluded.locked)').bind(season,g.id,JSON.stringify(g),sticky?1:0).run();
 }
 const stored=(await db.prepare('SELECT * FROM links_cfp_games WHERE season=?').bind(season).all()).results||[],lines=(await db.prepare('SELECT * FROM links_cfp_lines WHERE pool_id=? AND season=?').bind(pool,season).all()).results||[];
 const games=stored.map(row=>{const g=JSON.parse(row.data),line=lines.find(l=>l.event_id===g.id);return {...g,locked:!!row.locked,totalLine:line?.total_line??g.totalLine,lineFixed:!!line}}).sort((a,b)=>Date.parse(a.start)-Date.parse(b.start));
 const bracket=await bracketState({db,pool,season,member,actor,games,b,post:post&&['bracketSetup','bracketSave'].includes(b.action),available:!warning});
 if(post&&['bracketSetup','bracketSave'].includes(b.action))return json(bracket);
 if(post){
  if(b.action!=='pick')throw fail('Unknown action.');
  if(bracket.config)throw fail('This pool uses the full playoff bracket. Refresh and submit every round together before the first kickoff.',409);
  const g=games.find(g=>g.id===String(b.eventId));if(!g||!fresh.some(x=>x.id===g.id)||pickClosed(g))throw fail('This game is locked or its teams are not yet confirmed.',409);
  if(![g.home.id,g.away.id].includes(String(b.team)))throw fail('Choose a team in this matchup.');
  const bonus=Number(b.bonus??0),total=String(b.totalSide||'');if(!Number.isInteger(bonus)||bonus<0||bonus>3||(!settings.bonus&&bonus))throw fail('Use 0 to 3 confidence points when that option is enabled.');
  if(!['','over','under'].includes(total)||(!settings.totals&&total))throw fail('Choose a valid Over/Under option.');
  if(total&&(g.totalLine==null||Number(b.expectedTotal)!==Number(g.totalLine)))throw fail('The total changed or is unavailable. Refresh and review it before saving.',409);
  const budget=await db.prepare('SELECT COALESCE(SUM(bonus),0) used FROM links_cfp_picks WHERE pool_id=? AND player=? AND season=? AND event_id<>?').bind(pool,member.name,season,g.id).first();if(Number(budget.used)+bonus>3)throw fail('You have only 3 confidence points for this playoff contest. Reduce another open pick first.',409);
  const guard="EXISTS(SELECT 1 FROM links_cfp_games WHERE season=? AND event_id=? AND locked=0) AND julianday(?)>julianday('now') AND EXISTS(SELECT 1 FROM links_cfp_settings WHERE pool_id=? AND season=? AND revision=?) AND (SELECT COALESCE(SUM(bonus),0) FROM links_cfp_picks WHERE pool_id=? AND player=? AND season=? AND event_id<>?)+?<=3";
  const args=[season,g.id,g.start,pool,season,Number(b.revision),pool,member.name,season,g.id,bonus],statements=[];
  if(g.totalLine!=null)statements.push(db.prepare('INSERT OR IGNORE INTO links_cfp_lines SELECT ?,?,?,? WHERE '+guard).bind(pool,season,g.id,g.totalLine,...args));
  statements.push(db.prepare('INSERT INTO links_cfp_picks SELECT ?,?,?,?,?,?,?,(SELECT total_line FROM links_cfp_lines WHERE pool_id=? AND season=? AND event_id=?),? WHERE '+guard+' ON CONFLICT(pool_id,player,season,event_id) DO UPDATE SET team=excluded.team,bonus=excluded.bonus,total_side=excluded.total_side,total_line=excluded.total_line,saved_at=excluded.saved_at').bind(pool,member.name,season,g.id,String(b.team),bonus,total,pool,season,g.id,new Date().toISOString(),...args));
  const results=await db.batch(statements);if(!results.at(-1)?.meta?.changes)throw fail('This game locked, the rules changed, or your confidence points were used. Refresh and review your picks.',409);return json({ok:true});
 }
 const roster=((await db.prepare('SELECT name FROM pool_players WHERE pool_id=? ORDER BY name').bind(pool).all()).results||[]).map(r=>r.name),picks=(await db.prepare('SELECT * FROM links_cfp_picks WHERE pool_id=? AND season=?').bind(pool,season).all()).results||[];
 return json({bracket,pool,season,player:member.name,admin:actor.role==='admin',settings:{bonus:!!settings.bonus,totals:!!settings.totals,revision:settings.revision,locked:picks.length>0},games,picks:Object.fromEntries(picks.filter(p=>p.player===member.name).map(p=>[p.event_id,p])),shared:picks.filter(p=>games.some(g=>g.id===p.event_id&&pickClosed(g)&&!g.tbd)),standings:gradePlayoff(roster,picks,games),bonusUsed:picks.filter(p=>p.player===member.name).reduce((n,p)=>n+p.bonus,0),warning,available:!warning});
 }catch(error){return json({error:error.status?error.message:'College playoff service is unavailable. Saved picks are unchanged.'},error.status||503)}}
