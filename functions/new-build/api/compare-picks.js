const json=(d,s=200)=>Response.json(d,{status:s,headers:{"Cache-Control":"no-store"}});
const TEAM_ALIAS={WAS:"WSH",WSH:"WSH",JAX:"JAX",LV:"LV",LAC:"LAC",LAR:"LAR"};
async function resolvePool(db,value){const raw=String(value||"").trim();if(!raw)return null;if(/^\d+$/.test(raw)){const p=await db.prepare("SELECT id,code,name FROM pools WHERE id=? LIMIT 1").bind(Number(raw)).first();if(p)return p}return await db.prepare("SELECT id,code,name FROM pools WHERE upper(code)=upper(?) OR lower(trim(name))=lower(trim(?)) LIMIT 1").bind(raw,raw).first()}
async function currentNFLWeek(){try{const r=await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=100",{cache:"no-store"}),j=await r.json();return Number(j?.week?.number||1)||1}catch{return 1}}
async function weekGames(week){try{const season=new Date().getUTCFullYear(),post=week>18,apiWeek=post?({19:1,20:2,21:3,22:5}[week]||1):week,seasonType=post?3:2,r=await fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates="+season+"&seasontype="+seasonType+"&week="+apiWeek+"&limit=100",{cache:"no-store"}),j=await r.json();return (j.events||[]).map((e,i)=>{const c=e.competitions?.[0]||{},cs=c.competitors||[],a=cs.find(x=>x.homeAway==="away"),h=cs.find(x=>x.homeAway==="home");return {gameIndex:i,eventId:String(e.id||""),away:String(a?.team?.abbreviation||"").toUpperCase(),home:String(h?.team?.abbreviation||"").toUpperCase(),awayName:a?.team?.shortDisplayName||a?.team?.displayName||"",homeName:h?.team?.shortDisplayName||h?.team?.displayName||"",kickoff:e.date||null,completed:!!e.status?.type?.completed}})}catch{return[]}}
function nameKey(v){const s=String(v||"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim(),a=s.split(" ").filter(Boolean);if(!a.length)return"";return (a[0][0]||"")+"|"+(a[a.length-1]||"")}
function exactKey(v){return String(v||"").toLowerCase().replace(/[^a-z0-9]/g,"")}
export async function onRequestGet({request,env}){
 const db=env.DB;if(!db)return json({success:false,error:"Legacy LINKS database unavailable",build:"674"},503);
 const q=new URL(request.url).searchParams,p=await resolvePool(db,q.get("pool")),week=Math.max(1,Math.min(22,Number(q.get("week")||0)||await currentNFLWeek()));
 if(!p)return json({success:false,error:"Pool not found"},404);
 const games=await weekGames(week),first=games.map(g=>Date.parse(g.kickoff)).filter(Number.isFinite).sort((a,b)=>a-b)[0],current=await currentNFLWeek();
 let locked=week<current||(first?Date.now()>=first:false);
 const role=String(q.get("role")||"").toLowerCase();if(role==="admin"||role==="commissioner")locked=true;
 if(!locked)return json({success:true,locked:false,week,players:[],games,results:{},build:"674"});
 const [pr,pk,tr,rr]=await Promise.all([
  db.prepare("SELECT name FROM pool_players WHERE pool_id=? ORDER BY rowid").bind(p.id).all(),
  db.prepare("SELECT player_name,game_index,team FROM pool_picks WHERE pool_id=? AND sport='nfl' AND week=? ORDER BY player_name,game_index").bind(p.id,week).all(),
  db.prepare("SELECT player_name,guess FROM pool_ties WHERE pool_id=? AND sport='nfl' AND week=?").bind(p.id,week).all(),
  db.prepare("SELECT game_index,winner FROM pool_results WHERE pool_id=? AND sport='nfl' AND week=? ORDER BY game_index").bind(p.id,week).all()
 ]);
 const roster=(pr.results||[]).map(x=>String(x.name||"")),canonical=(raw)=>{const e=exactKey(raw),n=nameKey(raw);return roster.find(x=>exactKey(x)===e)||roster.find(x=>nameKey(x)===n)||String(raw||"")};
 const pickMap={},tieMap={};for(const r of pk.results||[]){const who=canonical(r.player_name);(pickMap[who]??={})[Number(r.game_index)]=String(r.team||"").toUpperCase()}for(const r of tr.results||[]){const who=canonical(r.player_name);tieMap[who]=r.guess}
 const players=roster.map(name=>({player:name,picks:pickMap[name]||{},tie:tieMap[name]??null})).filter(x=>Object.keys(x.picks).length||x.tie!=null);
 const results=Object.fromEntries((rr.results||[]).map(r=>[Number(r.game_index),String(r.winner||"").toUpperCase()]));
 return json({success:true,locked:true,week,pool:{id:String(p.id),name:p.name,code:p.code},players,games,results,finalGames:Object.keys(results).length,build:"674"});
}