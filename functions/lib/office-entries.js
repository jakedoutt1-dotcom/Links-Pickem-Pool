import {footballEntries} from './football.js';
// Other game entries have their own storage. They must never fall through to NFL picks.
const TYPES={'Survivor':'survivor','Confidence':'confidence','Game 33':'33','March Madness':'march','Golf':'masters','NASCAR':'nascar','Custom':'custom'};
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export const isOfficeGame=game=>Object.hasOwn(TYPES,String(game));
export async function officeEntries({request,env}){
 const incoming=request.method==='GET'?new URL(request.url).searchParams.get('game'):(await request.clone().json()).game;if(['Survivor','Confidence'].includes(incoming))return footballEntries({request,env});if(incoming==='Game 33')return json({error:'Game 33 uses season assignments. Open the Game 33 page.',url:'/new-build/game33.html'},409);
 const db=env.DB;if(!db)return json({error:'Pool service unavailable.'},503);
 try{
 const q=new URL(request.url).searchParams,b=request.method==='POST'?await request.json():Object.fromEntries(q),game=TYPES[b.game];if(!game)return json({error:'Unsupported game.'},400);
 const token=(request.headers.get('authorization')||'').replace(/^Bearer /,''),s=await db.prepare('SELECT * FROM pool_sessions WHERE token=? AND expires_at>?').bind(token,new Date().toISOString()).first();
 if(!s||String(s.pool_id)!==String(b.pool)||!s.player_name)return json({error:'Sign in to this pool to view or save your picks.'},401);
 if(b.player&&String(b.player).toLowerCase()!==String(s.player_name).toLowerCase())return json({error:'You can only access your own picks.'},403);
 await db.prepare('CREATE TABLE IF NOT EXISTS links_game_entries(pool_id INTEGER NOT NULL,game TEXT NOT NULL,period TEXT NOT NULL,player_name TEXT NOT NULL,event_id TEXT NOT NULL,selection TEXT NOT NULL,points INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL,PRIMARY KEY(pool_id,game,period,player_name,event_id))').run();
 await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS links_confidence_rank ON links_game_entries(pool_id,game,period,player_name,points) WHERE game='confidence' AND points>0").run();
 let events=[],period=String(b.period||'current'),setting=null,pickLimit=0;
 if(['survivor','confidence','33','march'].includes(game)){
  const sport=game==='march'?'basketball/mens-college-basketball':'football/nfl',r=await fetch('https://site.api.espn.com/apis/site/v2/sports/'+sport+'/scoreboard?limit=100',{headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});
  if(!r.ok)return json({error:'Schedule unavailable. Picks were not changed.'},503);const feed=await r.json();events=feed.events||[];
  if(!feed.season?.year||!events.length)return json({error:'No current schedule is available.'},503);
  period=game==='march'?String(feed.season.year):feed.season.year+'-'+(feed.season.type||2)+'-'+(feed.week?.number||'current');
 }else{
  const key='game_settings:'+String(b.game).toLowerCase().replace(/[^a-z0-9]+/g,'-')+':'+period;
  const row=await db.prepare('SELECT value FROM pool_settings WHERE pool_id=? AND key=?').bind(s.pool_id,key).first();setting=row?JSON.parse(row.value):null;
 }
 const mine=(await db.prepare('SELECT event_id AS eventId,selection,points,updated_at AS savedAt FROM links_game_entries WHERE pool_id=? AND game=? AND period=? AND player_name=?').bind(s.pool_id,game,period,s.player_name).all()).results||[];
 if(request.method==='GET')return json({success:true,picks:mine,period});
 const enabled=await db.prepare('SELECT active FROM pool_active_games WHERE pool_id=? AND game_type=?').bind(s.pool_id,game).first();if(!enabled?.active)return json({error:'This game is not active in your pool.'},403);
 let eventId=String(b.eventId||''),selection=String(b.selection||'').trim(),points=Number(b.points||0);if(!eventId||!selection||selection.length>150)return json({error:'Choose a valid selection.'},400);
 if(events.length){
  const event=events.find(e=>String(e.id)===eventId),teams=event?.competitions?.[0]?.competitors||[];
  if(!event||!teams.some(t=>String(t.team?.id)===selection))return json({error:'Selection is not on the current schedule.'},400);
  if(!Number.isFinite(Date.parse(event.date))||Date.now()>=Date.parse(event.date)||event.status?.type?.state!=='pre')return json({error:'This game has already started. Your pick is locked.'},403);
  if(game==='confidence'&&(!Number.isInteger(points)||points<0||points>events.length||points&&mine.some(p=>p.eventId!==eventId&&p.points===points)))return json({error:'Use each confidence value once, within the current slate.'},400);
  if(['survivor','33'].includes(game)){
   const previous=mine[0],old=events.find(e=>String(e.id)===previous?.eventId);if(previous&&(!old||Date.now()>=Date.parse(old.date)))return json({error:'Your weekly selection is already locked.'},403);
   if(game==='survivor'){
    const used=await db.prepare('SELECT 1 FROM links_game_entries WHERE pool_id=? AND game=? AND player_name=? AND selection=? AND period<>? AND period LIKE ? LIMIT 1').bind(s.pool_id,game,s.player_name,selection,period,period.split('-')[0]+'-%').first();if(used)return json({error:'You already used this team earlier this season.'},400);
   }
  }
 }else{
  const deadline=Date.parse(setting?.lockAt||'');if(!Number.isFinite(deadline))return json({error:'The commissioner must set a deadline before picks open.'},409);if(Date.now()>=deadline)return json({error:'This pool’s deadline has passed.'},403);
  const option=await db.prepare('SELECT 1 FROM links_game_options WHERE pool_id=? AND game=? AND period=? AND value=?').bind(s.pool_id,game,period,selection).first();if(!option)return json({error:'Choose an option set by your commissioner.'},400);
  eventId='option:'+encodeURIComponent(selection);
  const limit=Math.max(1,Math.min(50,Number(setting?.settings?.pickLimit)||1));pickLimit=game==='custom'?0:limit;if(game!=='custom'&&b.action!=='remove'&&!mine.some(p=>p.eventId===eventId)&&mine.length>=limit)return json({error:'This event allows '+limit+' selection(s). Remove a selection before choosing another.'},400);
 }
 const mutations=[];
 if(['survivor','33','custom'].includes(game))mutations.push(db.prepare('DELETE FROM links_game_entries WHERE pool_id=? AND game=? AND period=? AND player_name=?').bind(s.pool_id,game,period,s.player_name));
 if(b.action==='remove')mutations.push(db.prepare('DELETE FROM links_game_entries WHERE pool_id=? AND game=? AND period=? AND player_name=? AND event_id=?').bind(s.pool_id,game,period,s.player_name,eventId));
 else mutations.push(db.prepare('INSERT INTO links_game_entries(pool_id,game,period,player_name,event_id,selection,points,updated_at) SELECT ?,?,?,?,?,?,?,? WHERE ?=0 OR EXISTS(SELECT 1 FROM links_game_entries WHERE pool_id=? AND game=? AND period=? AND player_name=? AND event_id=?) OR (SELECT COUNT(*) FROM links_game_entries WHERE pool_id=? AND game=? AND period=? AND player_name=?)<? ON CONFLICT(pool_id,game,period,player_name,event_id) DO UPDATE SET selection=excluded.selection,points=excluded.points,updated_at=excluded.updated_at').bind(s.pool_id,game,period,s.player_name,eventId,selection,points,new Date().toISOString(),pickLimit,s.pool_id,game,period,s.player_name,eventId,s.pool_id,game,period,s.player_name,pickLimit));
 const saved=await db.batch(mutations);if(b.action!=='remove'&&!saved.at(-1).meta?.changes)return json({error:'Your selection limit has been reached. Refresh your picks.'},409);return json({success:true,eventId,selection,points,period});
 }catch{return json({error:'Game entries are unavailable. Your NFL picks were not changed.'},503)}
}
