// LINKS v308 — immutable pick-save history + persistent pool/player/week soft-lock state. Never changes live picks.
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}})}
function sportOf(x){const v=String(x||"nfl").toLowerCase();return v==="college"?"college":(v==="33"?"33":(v==="march"?"march":"nfl"))}
async function auth(request,DB){
  const h=request.headers.get("authorization")||"",token=h.startsWith("Bearer ")?h.slice(7):"";
  if(!token)return null;
  const s=await DB.prepare("SELECT * FROM pool_sessions WHERE token=?").bind(token).first();
  if(!s||Date.parse(s.expires_at)<Date.now())return null;
  return s;
}
async function ensureTables(DB){
  await DB.prepare(`CREATE TABLE IF NOT EXISTS pool_pick_save_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pool_id INTEGER NOT NULL,
    sport TEXT NOT NULL,
    player_name TEXT NOT NULL,
    week INTEGER NOT NULL,
    picks_json TEXT NOT NULL,
    tie_guess INTEGER,
    saved_at TEXT NOT NULL
  )`).run();
  await DB.prepare(`CREATE TABLE IF NOT EXISTS pool_player_soft_locks (
    pool_id INTEGER NOT NULL,
    sport TEXT NOT NULL,
    player_name TEXT NOT NULL COLLATE NOCASE,
    week INTEGER NOT NULL,
    locked_at TEXT NOT NULL,
    PRIMARY KEY(pool_id,sport,player_name,week)
  )`).run();
  await DB.prepare(`CREATE TABLE IF NOT EXISTS links_data_migrations (migration_key TEXT PRIMARY KEY, applied_at TEXT NOT NULL)`).run();
  const migrated=await DB.prepare("SELECT migration_key FROM links_data_migrations WHERE migration_key='v308_soft_locks'").first();
  if(!migrated){
    await DB.prepare(`INSERT OR IGNORE INTO pool_player_soft_locks(pool_id,sport,player_name,week,locked_at)
      SELECT pool_id,sport,player_name,week,MAX(saved_at) FROM pool_pick_save_history GROUP BY pool_id,sport,player_name,week`).run();
    await DB.prepare("INSERT OR IGNORE INTO links_data_migrations(migration_key,applied_at) VALUES('v308_soft_locks',?)").bind(new Date().toISOString()).run();
  }
}
export async function onRequestGet(context){
  const DB=context.env.DB;if(!DB)return json({error:"Database unavailable."},500);
  const s=await auth(context.request,DB);if(!s)return json({error:"Please sign in."},401);
  const url=new URL(context.request.url),sport=sportOf(url.searchParams.get("sport")),week=Math.max(1,Number(url.searchParams.get("week"))||1);
  await ensureTables(DB);
  const rows=(await DB.prepare("SELECT player_name,locked_at FROM pool_player_soft_locks WHERE pool_id=? AND sport=? AND week=?").bind(s.pool_id,sport,week).all()).results||[];
  const locked={};for(const r of rows)locked[String(r.player_name)]=true;
  const mine=rows.some(r=>String(r.player_name||"").trim().toLowerCase()===String(s.player_name||"").trim().toLowerCase());
  return json({ok:true,sport,week,locked,myLocked:mine,playerName:s.player_name});
}
export async function onRequestPost(context){
  const DB=context.env.DB;if(!DB)return json({error:"Database unavailable."},500);
  const s=await auth(context.request,DB);if(!s)return json({error:"Please sign in."},401);
  let body={};try{body=await context.request.json()}catch(e){return json({error:"Invalid request."},400)}
  const sport=sportOf(body.sport),week=Math.max(1,Number(body.week)||1),submitted=body.picks||{};
  const rows=(await DB.prepare("SELECT game_index,team FROM pool_picks WHERE pool_id=? AND sport=? AND player_name=? COLLATE NOCASE AND week=? ORDER BY game_index").bind(s.pool_id,sport,s.player_name,week).all()).results||[];
  const saved={};for(const r of rows)saved[String(r.game_index)]=String(r.team);
  const keys=Object.keys(submitted).filter(k=>submitted[k]!=null&&submitted[k]!=="").sort((a,b)=>Number(a)-Number(b));
  const savedKeys=Object.keys(saved).sort((a,b)=>Number(a)-Number(b));
  const same=keys.length===savedKeys.length&&keys.every(k=>String(submitted[k])===saved[k]);
  if(!same)return json({ok:false,verified:false,error:"Saved picks could not be verified. Your picks were not marked locked."},409);
  const tieRow=await DB.prepare("SELECT guess FROM pool_ties WHERE pool_id=? AND sport=? AND player_name=? COLLATE NOCASE AND week=?").bind(s.pool_id,sport,s.player_name,week).first();
  const submittedTie=body.tie===""||body.tie==null?null:Number(body.tie),savedTie=tieRow?.guess==null?null:Number(tieRow.guess);
  if(submittedTie!==savedTie)return json({ok:false,verified:false,error:"Tiebreaker could not be verified. Your picks were not marked locked."},409);
  await ensureTables(DB);
  const savedAt=new Date().toISOString();
  await DB.prepare("INSERT INTO pool_pick_save_history(pool_id,sport,player_name,week,picks_json,tie_guess,saved_at) VALUES(?,?,?,?,?,?,?)").bind(s.pool_id,sport,s.player_name,week,JSON.stringify(saved),savedTie,savedAt).run();
  await DB.prepare("INSERT INTO pool_player_soft_locks(pool_id,sport,player_name,week,locked_at) VALUES(?,?,?,?,?) ON CONFLICT(pool_id,sport,player_name,week) DO UPDATE SET locked_at=excluded.locked_at").bind(s.pool_id,sport,s.player_name,week,savedAt).run();
  return json({ok:true,verified:true,locked:true,myLocked:true,count:savedKeys.length,savedAt});
}
export async function onRequestDelete(context){
  const DB=context.env.DB;if(!DB)return json({error:"Database unavailable."},500);
  const s=await auth(context.request,DB);if(!s)return json({error:"Please sign in."},401);
  const url=new URL(context.request.url),sport=sportOf(url.searchParams.get("sport")),week=Math.max(1,Number(url.searchParams.get("week"))||1);
  await ensureTables(DB);
  // Unlock changes only current soft-lock state. History and live picks/tiebreaker remain untouched.
  await DB.prepare("DELETE FROM pool_player_soft_locks WHERE pool_id=? AND sport=? AND player_name=? COLLATE NOCASE AND week=?").bind(s.pool_id,sport,s.player_name,week).run();
  return json({ok:true,unlocked:true,myLocked:false,sport,week});
}
