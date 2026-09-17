// LINKS v305 — verified pick-save history + pool-scoped lock status. Never changes live picks.
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}})}
function sportOf(x){const v=String(x||"nfl").toLowerCase();return v==="college"?"college":(v==="33"?"33":(v==="march"?"march":"nfl"))}
async function auth(request,DB){
  const h=request.headers.get("authorization")||"",token=h.startsWith("Bearer ")?h.slice(7):"";
  if(!token)return null;
  const s=await DB.prepare("SELECT * FROM pool_sessions WHERE token=?").bind(token).first();
  if(!s||Date.parse(s.expires_at)<Date.now())return null;
  return s;
}
async function ensureHistory(DB){await DB.prepare(`CREATE TABLE IF NOT EXISTS pool_pick_save_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pool_id INTEGER NOT NULL,
  sport TEXT NOT NULL,
  player_name TEXT NOT NULL,
  week INTEGER NOT NULL,
  picks_json TEXT NOT NULL,
  tie_guess INTEGER,
  saved_at TEXT NOT NULL
)`).run()}
export async function onRequestGet(context){
  const DB=context.env.DB;if(!DB)return json({error:"Database unavailable."},500);
  const s=await auth(context.request,DB);if(!s)return json({error:"Please sign in."},401);
  const url=new URL(context.request.url),sport=sportOf(url.searchParams.get("sport")),week=Math.max(1,Number(url.searchParams.get("week"))||1);
  await ensureHistory(DB);
  const rows=(await DB.prepare("SELECT player_name,MAX(saved_at) AS saved_at FROM pool_pick_save_history WHERE pool_id=? AND sport=? AND week=? GROUP BY player_name").bind(s.pool_id,sport,week).all()).results||[];
  const locked={};for(const r of rows)locked[String(r.player_name)]=true;
  return json({ok:true,sport,week,locked});
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
  if(!same)return json({ok:false,verified:false,error:"Saved picks could not be verified. Your screen has NOT been marked locked."},409);
  const tieRow=await DB.prepare("SELECT guess FROM pool_ties WHERE pool_id=? AND sport=? AND player_name=? COLLATE NOCASE AND week=?").bind(s.pool_id,sport,s.player_name,week).first();
  const submittedTie=body.tie===""||body.tie==null?null:Number(body.tie),savedTie=tieRow?.guess==null?null:Number(tieRow.guess);
  if(submittedTie!==savedTie)return json({ok:false,verified:false,error:"Tiebreaker could not be verified. Your screen has NOT been marked locked."},409);
  await ensureHistory(DB);
  const savedAt=new Date().toISOString();
  await DB.prepare("INSERT INTO pool_pick_save_history(pool_id,sport,player_name,week,picks_json,tie_guess,saved_at) VALUES(?,?,?,?,?,?,?)").bind(s.pool_id,sport,s.player_name,week,JSON.stringify(saved),savedTie,savedAt).run();
  return json({ok:true,verified:true,count:savedKeys.length,savedAt});
}
