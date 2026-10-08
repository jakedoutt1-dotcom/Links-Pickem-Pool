import {normalizeGame,pickClosed,validDay,nbaDay,gradeRows,seasonRange} from '../../../public/new-build/nba-core.mjs';
import {sessionFor} from '../../lib/college.js';
import {poolGameKeys} from '../../lib/pool-games.js';
const json=(d,status=200)=>Response.json(d,{status,headers:{'Cache-Control':'no-store'}}),fail=(message,status=400)=>Object.assign(Error(message),{status});
async function provider(url){const r=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)});if(!r.ok)throw fail('NBA schedule is unavailable. Saved picks are unchanged.',503);return r.json();}
export async function fetchNBA(query){
 const params=new URLSearchParams(query),ids=params.get('gamePks');
 if(ids){const result=[];for(const id of ids.split(',')){if(!/^\d+$/.test(id))continue;const j=await provider('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event='+id);if(j.header?.competitions?.length)result.push(normalizeGame({...j.header,date:j.header.competitions[0].date}));}return result;}
 const day=params.get('date'),j=await provider('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates='+day.replaceAll('-','')+'&limit=100');if(!Array.isArray(j.events))throw fail('NBA schedule is unavailable.',503);
 return j.events.filter(e=>[2,3].includes(Number(e.season?.type))).map(normalizeGame);
}
export async function onRequest({request,env}){try{
 if(request.method==='POST'&&request.headers.get('Origin')&&request.headers.get('Origin')!==new URL(request.url).origin)throw fail('Open this pool on LINKS before saving.',403);
 if(!['GET','POST'].includes(request.method))throw fail('Method not allowed.',405);
 const db=env.DB;if(!db)throw fail('Pool service unavailable.',503);
 const b=request.method==='POST'?await request.json():Object.fromEntries(new URL(request.url).searchParams),pool=Number(b.pool),day=b.date||nbaDay();if(!pool||!validDay(day))throw fail('Choose a pool and valid date.');
 const [seasonStart,seasonEnd]=seasonRange(day);
 const actor=await sessionFor(request,db,pool);if(!actor)throw fail('Sign in to this pool.',401);
 if(!(await poolGameKeys(db,pool)).includes('nba'))throw fail('NBA Pick’em is not enabled in this pool.',403);
 const member=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?)').bind(pool,actor.player_name).first();if(!member)throw fail('Player membership not found.',403);
 await db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS links_nba_games(day TEXT,event_id TEXT,data TEXT NOT NULL,locked INTEGER NOT NULL DEFAULT 0,updated_at TEXT,PRIMARY KEY(day,event_id))'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_nba_picks(pool_id INTEGER,player TEXT,day TEXT,event_id TEXT,team TEXT,saved_at TEXT,PRIMARY KEY(pool_id,player,day,event_id))'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_nba_access(pool_id INTEGER,player TEXT,active INTEGER NOT NULL DEFAULT 1,PRIMARY KEY(pool_id,player))')]);
 const access=await db.prepare('SELECT active FROM links_nba_access WHERE pool_id=? AND player=?').bind(pool,member.name).first(),active=access?.active!==0;
 if(request.method==='POST'&&b.action==='access'){
 if(actor.role!=='admin')throw fail('Commissioner access required.',403);if(typeof b.active!=='boolean')throw fail('Choose active or inactive.');const p=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND name=?').bind(pool,b.player).first();if(!p)throw fail('Player not found.',404);
 await db.prepare('INSERT INTO links_nba_access VALUES(?,?,?) ON CONFLICT(pool_id,player) DO UPDATE SET active=excluded.active').bind(pool,p.name,b.active?1:0).run();return json({ok:true});}
 const fresh=(await fetchNBA('date='+day)).filter(g=>g.day===day),prior=(await db.prepare('SELECT * FROM links_nba_games WHERE day=?').bind(day).all()).results||[];
 async function persist(g,date){const old=prior.find(x=>x.event_id===g.id&&x.day===date);const oldGame=old?JSON.parse(old.data):null;const locked=!!old?.locked||!!(oldGame&&!oldGame.tbd&&Date.now()>=Date.parse(oldGame.start))||g.live||g.final||(!g.tbd&&Number.isFinite(Date.parse(g.start))&&Date.now()>=Date.parse(g.start));await db.prepare('INSERT INTO links_nba_games VALUES(?,?,?,?,?) ON CONFLICT(day,event_id) DO UPDATE SET data=excluded.data,locked=MAX(links_nba_games.locked,excluded.locked),updated_at=excluded.updated_at').bind(date,g.id,JSON.stringify({...g,day:date}),locked?1:0,new Date().toISOString()).run();}
 for(const g of fresh)await persist(g,day);
 // Refresh unresolved saved games by stable NBA game ID, including suspended games.
 const unresolved=(await db.prepare('SELECT DISTINCT g.* FROM links_nba_games g JOIN links_nba_picks p ON p.day=g.day AND p.event_id=g.event_id WHERE p.pool_id=? AND g.day>=? AND g.day<=? AND g.day<=?').bind(pool,seasonStart,seasonEnd,nbaDay()).all()).results||[];
 const pending=unresolved.filter(r=>{const g=JSON.parse(r.data);return !g.final&&!g.voided&&(!fresh.some(x=>x.id===r.event_id)||r.day!==day)});let warning='';
 if(pending.length){try{for(let i=0;i<pending.length;i+=50){const batch=pending.slice(i,i+50),updates=await fetchNBA('gamePks='+batch.map(r=>r.event_id).join(','));for(const r of batch){const g=updates.find(g=>g.id===r.event_id);if(!g)continue;const old=JSON.parse(r.data);if(g.day!==r.day&&!/suspend/i.test(old.status)){g.voided=true;g.final=false;g.winner=null;g.status='Postponed · rescheduled';}await persist(g,r.day);}}}catch{warning='Some older results could not refresh. Season totals may be incomplete.'}}
 const stored=(await db.prepare('SELECT * FROM links_nba_games WHERE day=?').bind(day).all()).results||[],games=stored.map(r=>({...JSON.parse(r.data),locked:!!r.locked})).sort((a,b)=>Date.parse(a.start)-Date.parse(b.start)||a.id.localeCompare(b.id));
 if(request.method==='POST'){
 if(b.action!=='pick')throw fail('Unknown action.');if(!active)throw fail('Your commissioner has paused your NBA access.',403);
 const g=games.find(g=>g.id===String(b.eventId));if(!g||!fresh.some(x=>x.id===g.id))throw fail('Game is unavailable. Refresh before picking.',409);if(pickClosed(g))throw fail('This game is locked or unavailable. Other upcoming games stay open.',403);
 if(![g.home.id,g.away.id].includes(String(b.team)))throw fail('Choose a team in this matchup.');
 const result=await db.prepare("INSERT INTO links_nba_picks(pool_id,player,day,event_id,team,saved_at) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM links_nba_games WHERE day=? AND event_id=? AND locked=0) AND julianday(?)>julianday('now') ON CONFLICT(pool_id,player,day,event_id) DO UPDATE SET team=excluded.team,saved_at=excluded.saved_at").bind(pool,member.name,day,g.id,String(b.team),new Date().toISOString(),day,g.id,g.start).run();if(!result.meta?.changes)throw fail('Tip-off has passed. Your pick was not changed.',409);return json({ok:true});}
 const roster=(await db.prepare('SELECT name FROM pool_players WHERE pool_id=? ORDER BY name').bind(pool).all()).results||[],accessRows=(await db.prepare('SELECT * FROM links_nba_access WHERE pool_id=?').bind(pool).all()).results||[];
 const picks=(await db.prepare('SELECT * FROM links_nba_picks WHERE pool_id=? AND day>=? AND day<=?').bind(pool,seasonStart,seasonEnd).all()).results||[];
 const seasonGames=(await db.prepare('SELECT * FROM links_nba_games WHERE day>=? AND day<=?').bind(seasonStart,seasonEnd).all()).results.map(r=>({...JSON.parse(r.data),locked:!!r.locked}));
 const mine=Object.fromEntries(picks.filter(p=>p.player===member.name&&p.day===day).map(p=>[p.event_id,p.team]));
 const revealed=picks.filter(p=>p.day===day&&games.some(g=>g.id===p.event_id&&pickClosed(g)&&!g.voided&&!g.tbd));
 return json({pool,date:day,player:member.name,admin:actor.role==='admin',active,games,picks:mine,shared:revealed.map(p=>({player:p.player,eventId:p.event_id,team:p.team})),standings:gradeRows(roster.map(r=>r.name),picks.filter(p=>p.day===day),games),season:gradeRows(roster.map(r=>r.name),picks,seasonGames),members:actor.role==='admin'?roster.map(r=>({name:r.name,active:accessRows.find(a=>a.player===r.name)?.active!==0})):[],warning,updatedAt:new Date().toISOString()});
 }catch(e){return json({error:e.status?e.message:'NBA pool unavailable. Saved picks are unchanged. Please retry.'},e.status||503)}}
