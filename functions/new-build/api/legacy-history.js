const json=(d,s=200)=>Response.json(d,{status:s,headers:{"Cache-Control":"no-store"}});
async function resolvePool(db,value){const raw=String(value||"").trim();if(/^\d+$/.test(raw)){const p=await db.prepare("SELECT id,code,name FROM pools WHERE id=? LIMIT 1").bind(Number(raw)).first();if(p)return p}return raw?await db.prepare("SELECT id,code,name FROM pools WHERE upper(code)=upper(?) OR lower(trim(name))=lower(trim(?)) LIMIT 1").bind(raw,raw).first():null}
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
export async function onRequestGet({request,env}){
 const db=env.DB;if(!db)return json({success:false,error:"Legacy LINKS database binding DB is unavailable",build:"674"},503);
 const q=new URL(request.url).searchParams,p=await resolvePool(db,q.get("pool")),week=Number(q.get("week")||0),player=String(q.get("player")||"").trim();
 if(!p)return json({success:false,error:"Pool not found"},404);
 if(week&&player){
  const all=await db.prepare("SELECT player_name,game_index AS gameIndex,team FROM pool_picks WHERE pool_id=? AND sport='nfl' AND week=? ORDER BY player_name,game_index").bind(p.id,week).all();
  const names=[...new Set((all.results||[]).map(x=>String(x.player_name||'')))];
  const target=norm(player),last=target.replace(/^(jessica|j)/,''),matched=names.find(n=>norm(n)===target)||names.find(n=>{const x=norm(n);return (target==='jbarnes'||target==='jessicabarnes')&&(x==='jbarnes'||x==='jessicabarnes')})||names.find(n=>last&&norm(n).endsWith(last));
  const rows=(all.results||[]).filter(x=>matched&&String(x.player_name)===matched).map(x=>({gameIndex:x.gameIndex,team:x.team}));
  const ties=await db.prepare("SELECT player_name,guess AS tieGuess FROM pool_ties WHERE pool_id=? AND sport='nfl' AND week=?").bind(p.id,week).all();
  const tie=(ties.results||[]).find(x=>norm(x.player_name)===norm(matched||player))||(ties.results||[]).find(x=>(target==='jbarnes'||target==='jessicabarnes')&&(norm(x.player_name)==='jbarnes'||norm(x.player_name)==='jessicabarnes'));
  return json({success:true,week,player,matchedPlayer:matched||null,rows,tieGuess:tie?.tieGuess??null,resolvedPoolId:String(p.id),availablePlayers:names,dataSource:"legacy-production-DB",build:"674"});
 }
 const picks=await db.prepare("SELECT week,COUNT(*) count FROM pool_picks WHERE pool_id=? AND sport='nfl' GROUP BY week ORDER BY week").bind(p.id).all(),ties=await db.prepare("SELECT week,COUNT(*) count FROM pool_ties WHERE pool_id=? AND sport='nfl' GROUP BY week ORDER BY week").bind(p.id).all();return json({success:true,picks:picks.results||[],tiebreakers:ties.results||[],resolvedPoolId:String(p.id),dataSource:"legacy-production-DB",build:"674"});
}
export async function onRequestPost(){return json({success:false,error:"Historical import is disabled because New Build now reads the existing LINKS database directly.",build:"674"},410)}