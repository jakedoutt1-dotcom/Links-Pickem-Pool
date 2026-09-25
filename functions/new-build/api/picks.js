const json=(d,s=200)=>Response.json(d,{status:s,headers:{"Cache-Control":"no-store"}});
async function resolvePool(db,value){
 const raw=String(value||"").trim();if(!raw)return null;
 if(/^\d+$/.test(raw)){const p=await db.prepare("SELECT id,code,name FROM pools WHERE id=? LIMIT 1").bind(Number(raw)).first();if(p)return p}
 return await db.prepare("SELECT id,code,name FROM pools WHERE upper(code)=upper(?) OR lower(trim(name))=lower(trim(?)) LIMIT 1").bind(raw,raw).first();
}
function sportOf(game){return /college/i.test(game)?"college":"nfl"}
function weekOf(period){const m=String(period||"").match(/(?:week-)?(\d+)/i);return m?Number(m[1]):null}
async function gameIndexFor(db,pool,sport,week,eventId,clientIndex){
 if(Number.isInteger(Number(clientIndex)))return Number(clientIndex);
 if(eventId){const r=await db.prepare("SELECT game_index FROM pool_games WHERE pool_id=? AND sport=? AND week=? AND event_id=? LIMIT 1").bind(pool,sport,week,String(eventId)).first();if(r)return Number(r.game_index)}
 return null;
}
export async function onRequestGet({request,env}){
 const db=env.DB;if(!db)return json({success:false,error:"Legacy LINKS database binding DB is unavailable",build:"634"},503);
 const q=new URL(request.url).searchParams,p=await resolvePool(db,q.get("pool")),game=q.get("game")||"NFL Pick’em",period=q.get("period")||"",player=String(q.get("player")||""),all=q.get("all")==="1";
 if(!p||(!player&&!all))return json({success:false,error:"Pool and player are required"},400);
 const sport=sportOf(game),week=weekOf(period)||Number(q.get("week")||0)||1;
 try{
  if(all){const {results=[]}=await db.prepare("SELECT player_name AS playerName,game_index AS gameIndex,team AS selection FROM pool_picks WHERE pool_id=? AND sport=? AND week=? ORDER BY player_name,game_index").bind(p.id,sport,week).all();return json({success:true,picks:results,resolvedPoolId:String(p.id),build:"634"})}
  const {results=[]}=await db.prepare("SELECT game_index AS gameIndex,team AS selection FROM pool_picks WHERE pool_id=? AND sport=? AND player_name=? AND week=? ORDER BY game_index").bind(p.id,sport,player,week).all();
  const tie=await db.prepare("SELECT guess FROM pool_ties WHERE pool_id=? AND sport=? AND player_name=? AND week=? LIMIT 1").bind(p.id,sport,player,week).first();
  const picks=results.map(x=>({gameIndex:Number(x.gameIndex),selection:x.selection}));if(tie?.guess!=null)picks.push({eventId:"__TIEBREAKER__",selection:String(tie.guess)});
  return json({success:true,picks,resolvedPoolId:String(p.id),week,build:"634"});
 }catch(e){return json({success:false,error:"Pick lookup unavailable",detail:String(e?.message||e),build:"634"},500)}
}
export async function onRequestPost({request,env}){
 const db=env.DB;if(!db)return json({success:false,error:"Legacy LINKS database binding DB is unavailable",build:"634"},503);
 let b;try{b=await request.json()}catch{return json({success:false,error:"Invalid request"},400)}
 const p=await resolvePool(db,b.pool),player=String(b.player||"").trim(),game=String(b.game||"NFL Pick’em"),period=String(b.period||""),eventId=String(b.eventId||""),selection=String(b.selection||"").trim();
 if(!p||!player||!selection)return json({success:false,error:"Incomplete pick"},400);
 const sport=sportOf(game),week=Number(b.week||weekOf(period)||1);
 const exists=await db.prepare("SELECT name FROM pool_players WHERE pool_id=? AND lower(name)=lower(?) LIMIT 1").bind(p.id,player).first();if(!exists)return json({success:false,error:"Player is not in this pool"},403);
 if(eventId==="__TIEBREAKER__"){
  const n=Number(selection);if(!Number.isInteger(n)||n<0||n>200)return json({success:false,error:"Tiebreaker must be a whole number from 0 to 200"},400);
  await db.prepare("INSERT INTO pool_ties(pool_id,sport,player_name,week,guess) VALUES(?,?,?,?,?) ON CONFLICT(pool_id,sport,player_name,week) DO UPDATE SET guess=excluded.guess").bind(p.id,sport,exists.name,week,n).run();
  return json({success:true,eventId,selection:String(n),resolvedPoolId:String(p.id),build:"634"});
 }
 const idx=await gameIndexFor(db,p.id,sport,week,eventId,b.gameIndex);if(idx==null)return json({success:false,error:"Game could not be matched to the legacy weekly slate. Refresh and try again."},409);
 const team=String(b.teamCode||selection).toUpperCase();
 await db.prepare("INSERT INTO pool_picks(pool_id,sport,player_name,week,game_index,team) VALUES(?,?,?,?,?,?) ON CONFLICT(pool_id,sport,player_name,week,game_index) DO UPDATE SET team=excluded.team").bind(p.id,sport,exists.name,week,idx,team).run();
 return json({success:true,gameIndex:idx,selection:team,resolvedPoolId:String(p.id),build:"634"});
}