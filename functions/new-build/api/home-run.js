import {sessionFor} from '../../lib/college.js';
import {poolGameKeys} from '../../lib/pool-games.js';
import {weekOf,shiftDay,deadline,locked,validateLineup,scoresFromFeed,rankRows} from '../../../public/new-build/home-run-core.mjs';
import {mlbDay,validDay} from '../../../public/new-build/mlb-core.mjs';
const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const problem=(message,status=400)=>Object.assign(Error(message),{status});
async function feed(path){const r=await fetch('https://statsapi.mlb.com/api/v1/'+path,{signal:AbortSignal.timeout(12000)});if(!r.ok)throw problem('MLB data is unavailable. Saved lineups are unchanged.',503);return r.json()}
export async function onRequest({request,env}){try{
 if(!['GET','POST'].includes(request.method))throw problem('Method not allowed.',405);
 const db=env.DB,b=request.method==='POST'?await request.json():Object.fromEntries(new URL(request.url).searchParams),pool=Number(b.pool),week=b.week||weekOf();
 if(!pool||!validDay(week)||weekOf(week)!==week)throw problem('Choose a valid Monday.');
 const actor=await sessionFor(request,db,pool);if(!actor)throw problem('Sign in to this pool.',401);
 if(!(await poolGameKeys(db,pool)).includes('homerun'))throw problem('Home Run is not enabled in this pool.',403);
 const member=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?)').bind(pool,actor.player_name).first();if(!member)throw problem('Membership not found.',403);
 await db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS links_hr_lineups(pool_id INTEGER,player TEXT,week TEXT,roster TEXT,active TEXT,saved_at TEXT,PRIMARY KEY(pool_id,player,week))'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_hr_scores(week TEXT PRIMARY KEY,scores TEXT,updated_at TEXT)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_hr_hitters(season TEXT PRIMARY KEY,hitters TEXT,updated_at TEXT)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_hr_access(pool_id INTEGER,player TEXT,active INTEGER DEFAULT 1,PRIMARY KEY(pool_id,player))')]);
 const access=await db.prepare('SELECT active FROM links_hr_access WHERE pool_id=? AND player=?').bind(pool,member.name).first(),active=access?.active!==0;
 if(request.method==='POST'&&b.action==='access'){
 if(actor.role!=='admin')throw problem('Commissioner access required.',403);if(typeof b.active!=='boolean')throw problem('Choose active or paused.');const p=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND name=?').bind(pool,b.player).first();if(!p)throw problem('Player not found.',404);
 await db.prepare('INSERT INTO links_hr_access VALUES(?,?,?) ON CONFLICT(pool_id,player) DO UPDATE SET active=excluded.active').bind(pool,p.name,b.active?1:0).run();return reply({ok:true});}
 const season=week.slice(0,4);let cached=await db.prepare('SELECT * FROM links_hr_hitters WHERE season=?').bind(season).first(),hitters;
 try{if(!cached||Date.now()-Date.parse(cached.updated_at)>3600000){const j=await feed('sports/1/players?season='+season);if(!Array.isArray(j.people)||!j.people.length)throw Error('No hitters');hitters=j.people.filter(p=>p.active&&p.primaryPosition?.type!=='Pitcher').map(p=>({id:String(p.id),name:p.fullName,team:p.currentTeam?.name||'',teamId:p.currentTeam?.id||'',position:p.primaryPosition?.abbreviation||''}));if(!hitters.length)throw Error('No hitters');await db.prepare('INSERT INTO links_hr_hitters VALUES(?,?,?) ON CONFLICT(season) DO UPDATE SET hitters=excluded.hitters,updated_at=excluded.updated_at').bind(season,JSON.stringify(hitters),new Date().toISOString()).run();}else hitters=JSON.parse(cached.hitters);}catch(e){if(request.method==='POST'||!cached)throw problem('Hitter list is unavailable. Please retry.',503);hitters=JSON.parse(cached.hitters);}
 if(request.method==='POST'){
 if(b.action!=='lineup')throw problem('Unknown action.');if(!active)throw problem('Your commissioner has paused your access.',403);if(locked(week))throw problem('This week is locked. Prepare next week’s lineup.',403);if(week>shiftDay(weekOf(),14))throw problem('Prepare lineups up to two weeks ahead.');
 let selection;try{selection=validateLineup(b.roster,b.active,new Set(hitters.map(p=>p.id)))}catch(e){throw problem(e.message)};
 const result=await db.prepare("INSERT INTO links_hr_lineups SELECT ?,?,?,?,?,? WHERE julianday(?)>julianday('now') ON CONFLICT(pool_id,player,week) DO UPDATE SET roster=excluded.roster,active=excluded.active,saved_at=excluded.saved_at").bind(pool,member.name,week,JSON.stringify(selection.roster),JSON.stringify(selection.active),new Date().toISOString(),deadline(week)).run();if(!result.meta?.changes)throw problem('The weekly deadline passed. No changes were saved.',409);return reply({ok:true});}
 const roster=(await db.prepare('SELECT name FROM pool_players WHERE pool_id=? ORDER BY name').bind(pool).all()).results||[];
 const lineups=((await db.prepare('SELECT * FROM links_hr_lineups WHERE pool_id=? AND week LIKE ?').bind(pool,season+'%').all()).results||[]).map(l=>({...l,roster:JSON.parse(l.roster),active:JSON.parse(l.active)}));
 const saved=((await db.prepare('SELECT * FROM links_hr_scores WHERE week LIKE ?').bind(season+'%').all()).results||[]),scoreMap=Object.fromEntries(saved.map(s=>[s.week,JSON.parse(s.scores)]));
 const weeks=[...new Set([week,...lineups.map(l=>l.week)])].filter(w=>w<=weekOf());let warning='';
 const stale=weeks.filter(w=>{const r=saved.find(s=>s.week===w);return !r||Date.now()-Date.parse(r.updated_at)>(w===weekOf()?60000:86400000)});
 for(const w of stale.slice(0,8))try{const j=await feed('stats?'+new URLSearchParams({stats:'byDateRange',group:'hitting',startDate:w,endDate:shiftDay(w,6),sportIds:'1',gameType:'R',playerPool:'ALL',limit:'2000'}));const scores=scoresFromFeed(j);scoreMap[w]=scores;await db.prepare('INSERT INTO links_hr_scores VALUES(?,?,?) ON CONFLICT(week) DO UPDATE SET scores=excluded.scores,updated_at=excluded.updated_at').bind(w,JSON.stringify(scores),new Date().toISOString()).run();}catch{warning='Some results could not refresh. Saved totals may be incomplete; retry shortly.';}
 if(stale.length>8)warning='Older weeks are still syncing. Keep this page open or refresh for remaining results.';
 const accessRows=(await db.prepare('SELECT * FROM links_hr_access WHERE pool_id=?').bind(pool).all()).results||[];
 const mine=lineups.find(l=>l.week===week&&l.player===member.name);
 const selectedScores=scoreMap[week]||{};
 return reply({pool,week,end:shiftDay(week,6),deadline:deadline(week),locked:locked(week),player:member.name,admin:actor.role==='admin',active,hitters,lineup:mine||null,shared:locked(week)?lineups.filter(l=>l.week===week).map(l=>({player:l.player,active:l.active})):[],scores:selectedScores,standings:rankRows(roster.map(p=>p.name),lineups.filter(l=>l.week===week),scoreMap),season:rankRows(roster.map(p=>p.name),lineups,scoreMap),members:actor.role==='admin'?roster.map(p=>({name:p.name,active:accessRows.find(a=>a.player===p.name)?.active!==0})):[],warning,resultsAvailable:!!scoreMap[week],updatedAt:new Date().toISOString()});
 }catch(e){return reply({error:e.status?e.message:e.message?.startsWith('Choose')||e.message?.startsWith('Activate')?e.message:'Home Run pool unavailable. Your saved lineup is unchanged.'},e.status||503)}}
