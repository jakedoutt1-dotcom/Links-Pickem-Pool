const json=(d,s=200)=>Response.json(d,{status:s,headers:{"Cache-Control":"no-store"}});
export async function onRequestGet({request,env}){
 if(!env.LINKS_DB)return json({success:false,error:"LINKS_DB is not configured"},503);
 const q=new URL(request.url).searchParams,pool=q.get("pool"),game=q.get("game"),period=q.get("period"),player=q.get("player");
 if(!pool||!game||!period||!player)return json({success:false,error:"pool, game, period and player are required"},400);
 try{const {results=[]}=await env.LINKS_DB.prepare("SELECT event_id AS eventId,selection,points,locked_at AS lockedAt,saved_at AS savedAt FROM picks WHERE pool_id=? AND player_id=? AND game_type=? AND period_key=?").bind(pool,player,game,period).all();return json({success:true,picks:results})}catch{return json({success:false,error:"Pick lookup unavailable"},500)}
}
const feeds={"NFL Pick’em":"https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard","College Pick’em":"https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard","Confidence":"https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard","Game 33":"https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard","Survivor":"https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard","March Madness":"https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard"};
async function trustedStart(game,eventId){const url=feeds[game];if(!url)return null;const r=await fetch(url,{headers:{"Accept":"application/json"}});if(!r.ok)throw new Error("schedule");const j=await r.json(),e=(j.events||[]).find(x=>String(x.id)===String(eventId));return e?.date?Date.parse(e.date):NaN}
export async function onRequestPost({request,env}){
 if(!env.LINKS_DB)return json({success:false,error:"LINKS_DB is not configured"},503);
 let b;try{b=await request.json()}catch{return json({success:false,error:"Invalid request"},400)}
 const pool=String(b.pool||""),player=String(b.player||""),game=String(b.game||""),period=String(b.period||""),eventId=String(b.eventId||""),selection=String(b.selection||"");
 if(!pool||!player||!game||!period||!eventId||!selection)return json({success:false,error:"Incomplete pick"},400);
 let start;if(feeds[game]){try{start=await trustedStart(game,eventId)}catch{return json({success:false,error:"Official schedule could not be verified"},503)}if(!Number.isFinite(start))return json({success:false,error:"Game was not found on the official schedule"},404)}else{start=Date.parse(b.start||"");if(!Number.isFinite(start))return json({success:false,error:"A configured lock time is required"},400)}
 const now=Date.now();if(now>=start)return json({success:false,error:"Game is locked"},423);
 try{const id=crypto.randomUUID(),savedAt=new Date(now).toISOString();await env.LINKS_DB.prepare("INSERT INTO picks(id,pool_id,player_id,game_type,period_key,event_id,selection,points,saved_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(pool_id,player_id,game_type,period_key,event_id) DO UPDATE SET selection=excluded.selection,points=excluded.points,saved_at=excluded.saved_at").bind(id,pool,player,game,period,eventId,selection,b.points==null?null:Number(b.points),savedAt).run();return json({success:true,eventId,selection,savedAt,lockVerified:Boolean(feeds[game])})}catch{return json({success:false,error:"Pick save unavailable"},500)}
}