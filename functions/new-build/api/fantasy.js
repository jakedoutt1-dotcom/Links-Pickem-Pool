import {poolFor,sessionFor} from '../../lib/college.js';
import {poolGameKeys} from '../../lib/pool-games.js';
import {footballFeed} from '../../lib/football.js';
import {newLeague,applyAction,publicLeague,weekState,fail,number,POSITIONS} from '../../../public/new-build/fantasy-core.mjs';
const json=(d,status=200)=>Response.json(d,{status,headers:{'Cache-Control':'no-store'}});
const key=g=>'links_fantasy_v1:'+g;
const aliases={JAC:'JAX',WSH:'WAS',LA:'LAR'};
const abbreviation=t=>aliases[t]||t;
export async function catalog(db,fetcher=fetch,now=Date.now()){
 await db.prepare('CREATE TABLE IF NOT EXISTS links_fantasy_cache(key TEXT PRIMARY KEY,value TEXT,updated_at INTEGER)').run();
 const old=await db.prepare("SELECT * FROM links_fantasy_cache WHERE key='players'").first();
 if(old&&now-Number(old.updated_at)<86400000)return JSON.parse(old.value);
 const r=await fetcher('https://api.sleeper.app/v1/players/nfl',{signal:AbortSignal.timeout(20000)});if(!r.ok)fail('NFL player directory is unavailable. Try again later.',503);
 const raw=await r.json(),out={};for(const [id,p]of Object.entries(raw)){
  const pos=p.position==='DEF'?'DEF':p.position;if(!POSITIONS.includes(pos)||p.active===false)continue;
  const name=p.full_name||[p.first_name,p.last_name].filter(Boolean).join(' ')||p.team;
  if(!name)continue;out[id]={id,name,pos,team:abbreviation(p.team||''),years:Number(p.years_exp||0),injury:p.injury_status||'',espnId:String(p.espn_id||'')};
 }
 if(Object.keys(out).length<100)fail('Player directory was incomplete. Saved data is unchanged.',503);
 await db.prepare("INSERT INTO links_fantasy_cache(key,value,updated_at) VALUES('players',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at").bind(JSON.stringify(out),now).run();return out;
}
export async function nflSchedule(season,week){const data=await footballFeed(season,week);return data.events.map(e=>({id:String(e.id),kickoff:e.date,completed:!!e.status?.type?.completed,teams:(e.competitions?.[0]?.competitors||[]).map(c=>abbreviation(c.team.abbreviation))}))}
function mergeWeek(s,week,games,now){
 const previous=weekState(s,week),byId=new Map(previous.schedule.map(g=>[g.id,g]));
 for(const g of games){const prior=byId.get(g.id);byId.set(g.id,prior&&(prior.completed||Date.parse(prior.kickoff)<=now)?{...g,kickoff:prior.kickoff,completed:prior.completed||g.completed}:g)}
 return {...previous,playerTeams:previous.playerTeams||Object.fromEntries(Object.values(s.players).map(p=>[p.id,p.team])),schedule:[...byId.values()]};
}
export async function fantasyRequest({request,env},services={}){
 try{
  const db=env.DB,post=request.method==='POST';if(!post&&request.method!=='GET')return json({error:'Method not allowed.'},405);
  const b=post?await request.json():Object.fromEntries(new URL(request.url).searchParams),game=String(b.game),action=String(b.action||'state');
  if(!['fantasy','dynasty'].includes(game))fail('Choose Fantasy or Dynasty.');
  const pool=await poolFor(db,b.pool),session=pool&&await sessionFor(request,db,pool.id);if(!session?.player_name)fail('Sign in to this pool.',401);
  const actor={name:session.player_name,role:session.role},active=(await poolGameKeys(db,pool.id)).includes(game);
  if(post&&!active)fail('This game is archived. Ask your commissioner to activate it.',403);
  const row=await db.prepare('SELECT value FROM pool_settings WHERE pool_id=? AND key=?').bind(pool.id,key(game)).first(),old=row?.value;
  const currentYear=new Date().getUTCFullYear(),now=services.now?.()??Date.now();
  let s=old?JSON.parse(old):newLeague(game,currentYear);
  const members=(await db.prepare('SELECT name FROM pool_players WHERE pool_id=? ORDER BY name').bind(pool.id).all()).results.map(p=>p.name);
  if(!members.includes(actor.name))members.push(actor.name);
  if(!post){
   if(action==='history'){
    const year=number(b.season,2020,2100,'season',true),archive=await db.prepare('SELECT value FROM pool_settings WHERE pool_id=? AND key=?').bind(pool.id,key(game)+':archive:'+year).first();
    if(!archive)fail('Season archive not found.',404);return json({league:publicLeague(JSON.parse(archive.value),actor),role:actor.role,viewer:actor.name,active:false,members:[]});
   }
   if(action!=='state')fail('Unknown request.');
   let legacyCount=0;try{legacyCount=(await db.prepare('SELECT COUNT(*) AS n FROM '+game+'_teams WHERE pool_id=?').bind(pool.id).first()).n}catch(e){if(!/no such table/.test(e.message))throw e}
   return json({league:publicLeague(s,actor),role:actor.role,viewer:actor.name,active,members:actor.role==='admin'?members:[],legacyCount,scoringMode:'Commissioner-verified player scores'});
  }
  if(String(b.revision||'')!==s.revision)fail('The league changed on another device. Refresh before trying again.',409);
  const admin=()=>{if(actor.role!=='admin')fail('Commissioner only.',403)};
  const week=number(b.week??s.currentWeek??1,1,18,'week',true);
  if(action==='catalog'){
   admin();const players=await (services.catalog||catalog)(db);s.players={...s.players,...players};
  }else if(action==='schedule'){
   admin();if(s.phase!=='SEASON'||week!==s.currentWeek)fail('Choose the active season week.');
   const games=await (services.schedule||nflSchedule)(s.season,week);if(!games.length||games.some(g=>!Number.isFinite(Date.parse(g.kickoff))||g.teams.length!==2))fail('The NFL schedule is incomplete.',503);
   s.weeks[week]=mergeWeek(s,week,games,now);
  }else if(action==='import-legacy'){
   admin();if(s.teams.length||s.phase!=='SETUP')fail('Legacy import is available only before creating new teams.');
   if(!Object.keys(s.players).length)fail('Load the NFL player directory first.');
   const teams=(await db.prepare('SELECT * FROM '+game+'_teams WHERE pool_id=? ORDER BY draft_slot,id').bind(pool.id).all()).results;
   const players=(await db.prepare('SELECT * FROM '+game+'_rosters WHERE pool_id=?').bind(pool.id).all()).results;
   if(!teams.length)fail('No legacy teams to import.');
   const seen=new Set(),owners=new Set();
   for(const t of teams){if(!t.owner_name||!members.some(n=>n.toLowerCase()===t.owner_name.toLowerCase())||owners.has(t.owner_name.toLowerCase()))fail('Each legacy franchise must have a different registered pool owner before import.');owners.add(t.owner_name.toLowerCase());s.teams.push({id:String(t.id),name:t.name,owner:t.owner_name,faab:s.settings.faab});s.rosters[String(t.id)]=[];s.waiverOrder.push(String(t.id))}
   for(const p of players){
    const matches=Object.values(s.players).filter(x=>x.name.toLowerCase()===p.player_name.toLowerCase()&&x.pos===p.position);
    if(matches.length!==1||seen.has(matches[0].id))fail('Resolve missing, ambiguous or duplicate legacy player: '+p.player_name);
    if(!s.rosters[String(p.team_id)])fail('Legacy roster has an unknown franchise.');
    seen.add(matches[0].id);s.rosters[String(p.team_id)].push({id:matches[0].id,salary:Number(p.salary||0),years:Math.max(1,Number(p.contract_years||1)-Number(p.contract_year||1)+1),reserve:''});
   }
   // Keep the original legacy tables intact as historical records.
   s.phase='READY';s.importedLegacy=true;
  }else{
   // Recheck official kickoffs on every active-season roster write, including direct API calls.
   if(s.phase==='SEASON'&&!['settings','team','rollover'].includes(action)){
    const games=await (services.schedule||nflSchedule)(s.season,s.currentWeek);
    if(!games.length||games.some(g=>!Number.isFinite(Date.parse(g.kickoff))||g.teams.length!==2))fail('NFL schedule is unavailable. Saved rosters are unchanged.',503);
    s.weeks[s.currentWeek]=mergeWeek(s,s.currentWeek,games,now);
   }
   s=applyAction(s,{...b,week},actor,{now,members});
  }
  s.revision=crypto.randomUUID();
  if(['catalog','schedule','import-legacy'].includes(action))s.log.unshift({id:crypto.randomUUID(),action,by:actor.name,at:new Date(now).toISOString(),season:s.season,week});
  const serialized=JSON.stringify(s);if(serialized.length>1800000)fail('League history has reached its storage limit. Contact support before making further changes.');
  const stmts=[];
  if(action==='rollover')stmts.push(db.prepare('INSERT OR IGNORE INTO pool_settings(pool_id,key,value) SELECT pool_id,?,value FROM pool_settings WHERE pool_id=? AND key=? AND value=?').bind(key(game)+':archive:'+JSON.parse(old).season,pool.id,key(game),old));
  stmts.push(old?db.prepare('UPDATE pool_settings SET value=? WHERE pool_id=? AND key=? AND value=?').bind(serialized,pool.id,key(game),old):db.prepare('INSERT OR IGNORE INTO pool_settings(pool_id,key,value) VALUES(?,?,?)').bind(pool.id,key(game),serialized));
  const results=await db.batch(stmts);if(Number(results.at(-1).meta?.changes)!==1)fail('Another league update won the race. Refresh and retry.',409);
  return json({ok:true,revision:s.revision});
 }catch(e){return json({error:e.status?e.message:'League service unavailable. Your last saved state is preserved.'},e.status||503)}
}
export const onRequest=context=>fantasyRequest(context);
