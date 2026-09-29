import {collegeContext,schedule,apCandidates,poolFor,sessionFor,storedSlate,deadline,rowsFor,playerCard,standings,settingKey,lockKey,sameName,code} from '../../lib/college.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const fail=(message,status=400)=>Object.assign(Error(message),{status});
export async function onRequest({request,env}){
 const db=env.DB;if(!db)return json({error:'Pool data is unavailable.'},503);
 try{
  const q=new URL(request.url).searchParams;let b={};if(request.method==='POST')try{b=await request.json()}catch{throw fail('Invalid request.')}
  if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
  const pool=await poolFor(db,b.pool||q.get('pool'));if(!pool)throw fail('Pool not found.',404);
  const session=await sessionFor(request,db,pool.id);if(!session)throw fail('Sign in to this pool to continue.',401);
  const context=await collegeContext(),week=Number(b.week||q.get('week')||context.week);if(!Number.isInteger(week)||week<1||week>17)throw fail('Choose a valid college week.');
  const live=await schedule(week,context),games=await storedSlate(db,pool.id,week,live),first=deadline(games),closed=first===null||Date.now()>=first;
  const rows=await rowsFor(db,pool.id,week),me=playerCard(rows,games,session.player_name);
  const playerLock=await db.prepare('SELECT value FROM pool_settings WHERE pool_id=? AND key=?').bind(pool.id,lockKey(week,session.player_name)).first(),cardLocked=playerLock?.value==='1';
  if(request.method==='GET'){
   const view=q.get('view')||'picks',response={pool,week,currentWeek:context.week,season:context.season,seasonType:context.seasonType,role:session.role,player:session.player_name,games,deadline:first,closed,active:me.active,cardLocked};
   if(view==='admin'){
    if(session.role!=='admin')throw fail('Commissioner access required.',403);
    const roster=(await db.prepare('SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid').bind(pool.id).all()).results||[];
    let candidates=[],rankingError='';try{candidates=await apCandidates(live,week,context)}catch(e){rankingError=e.message}
    return json({...response,candidates,rankingError,slateFrozen:rows.picks.length>0||rows.ties.length>0||(games.length>0&&closed),members:roster.map(r=>({name:r.name,active:rows.access.some(a=>sameName(a.player_name,r.name)&&Number(a.paid)===1)}))});
   }
   if(view==='picks')return json({...response,picks:me.picks,tie:me.tie});
   if(view==='scores')return json(response);
   if(!games.length||!closed)return json({...response,players:[],rows:[],finalizedWinners:[],allFinal:false});
   // No shared pick data is read out before the selected slate's first kickoff.
   const players=rows.access.filter(a=>Number(a.paid)===1).map(a=>playerCard(rows,games,a.player_name));
   // Result corrections are matched by team, never by a reordered feed index.
   for(const r of rows.results){const g=games.find(g=>[g.away,g.home].includes(code(r.winner)));if(g&&g.completed)g.winner=code(r.winner)}
   return json({...response,players:players.filter(p=>Object.keys(p.picks).length||p.tie!=null),...standings(players,games)});
  }
  if(b.action==='access'){
   if(session.role!=='admin')throw fail('Commissioner access required.',403);
   if(typeof b.active!=='boolean')throw fail('Choose Active or Pending.');
   const player=await db.prepare('SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?)').bind(pool.id,String(b.player||'')).first();if(!player)throw fail('Player not found.',404);
   await db.prepare("INSERT INTO pool_payments(pool_id,sport,player_name,week,paid) VALUES(?,'college',?,?,?) ON CONFLICT(pool_id,sport,player_name,week) DO UPDATE SET paid=excluded.paid").bind(pool.id,player.name,week,b.active?1:0).run();return json({success:true});
  }
  if(b.action==='slate'){
   if(session.role!=='admin')throw fail('Commissioner access required.',403);
   if(rows.picks.length||rows.ties.length||games.length&&closed)throw fail('This slate is protected because picks exist or kickoff has passed. Existing picks have not been changed.',409);
   const ids=Array.isArray(b.eventIds)?b.eventIds.map(String):[];if(!ids.length||ids.length>25||new Set(ids).size!==ids.length)throw fail('Choose 1–25 different games.');
   const eligible=await apCandidates(live,week,context),chosen=ids.map(id=>eligible.find(g=>g.eventId===id));if(chosen.some(g=>!g||!Number.isFinite(Date.parse(g.kickoff))||Date.parse(g.kickoff)<=Date.now()))throw fail('Choose upcoming games involving an AP Top 25 team.');
   const data=JSON.stringify({settings:{eventIds:ids,games:chosen,gameCount:ids.length,source:'AP Top 25',week},updatedAt:new Date().toISOString()});
   // A conditional write also prevents a concurrent pick from being overwritten.
   const result=await db.prepare("INSERT INTO pool_settings(pool_id,key,value) SELECT ?,?,? WHERE NOT EXISTS(SELECT 1 FROM pool_picks WHERE pool_id=? AND sport='college' AND week=?) AND NOT EXISTS(SELECT 1 FROM pool_ties WHERE pool_id=? AND sport='college' AND week=?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value").bind(pool.id,settingKey(week),data,pool.id,week,pool.id,week).run();
   if(result.meta?.changes===0)throw fail('A player has started picking. The slate was not changed.',409);
   return json({success:true});
  }
  if(!me.active)throw fail('Contact your commissioner to make picks. Your access is Pending for Week '+week+'.',403);
  if(closed)throw fail('Picks are closed at the first kickoff of this week’s selected games.',403);
  if(b.action==='lock'){
   if(typeof b.locked!=='boolean')throw fail('Choose lock or unlock.');
   if(b.locked&&(games.some(g=>!me.picks[g.eventId])||me.tie==null))throw fail('Complete every pick and your tiebreaker first.');
   await db.prepare('INSERT INTO pool_settings(pool_id,key,value) VALUES(?,?,?) ON CONFLICT(pool_id,key) DO UPDATE SET value=excluded.value').bind(pool.id,lockKey(week,session.player_name),b.locked?'1':'0').run();return json({success:true,cardLocked:b.locked});
  }
  if(cardLocked)throw fail('Unlock your picks before making changes.',403);
  if(b.action==='tie'){
   const guess=Number(b.guess);if(b.guess==null||b.guess===''||!Number.isInteger(guess)||guess<0||guess>200)throw fail('Enter a whole-number combined score from 0 to 200.');
   await db.prepare("INSERT INTO pool_ties(pool_id,sport,player_name,week,guess) VALUES(?,'college',?,?,?) ON CONFLICT(pool_id,sport,player_name,week) DO UPDATE SET guess=excluded.guess").bind(pool.id,session.player_name,week,guess).run();return json({success:true});
  }
  if(b.action==='pick'){
   const g=games.find(g=>g.eventId===String(b.eventId)),team=code(b.team);if(!g||![g.away,g.home].includes(team))throw fail('Choose a team from this week’s selected slate.');
   const own=rows.picks.filter(p=>sameName(p.player_name,session.player_name));const existing=own.find(p=>[g.away,g.home].includes(code(p.team)));let index=existing?.game_index??g.gameIndex;
   // Preserve existing positions and allocate an unused slot if legacy ordering differs.
   if(!existing){const used=new Set(own.map(p=>Number(p.game_index)));while(used.has(index))index++}
   await db.prepare("INSERT INTO pool_picks(pool_id,sport,player_name,week,game_index,team) VALUES(?,'college',?,?,?,?) ON CONFLICT(pool_id,sport,player_name,week,game_index) DO UPDATE SET team=excluded.team").bind(pool.id,session.player_name,week,index,team).run();return json({success:true});
  }
  throw fail('Unknown college action.');
 }catch(e){return json({error:e.status?e.message:'College data is unavailable. '+(String(e.message).startsWith('College ')||String(e.message).startsWith('AP ')?e.message:'Please try again. Saved picks are unchanged.')},e.status||502)}
}
