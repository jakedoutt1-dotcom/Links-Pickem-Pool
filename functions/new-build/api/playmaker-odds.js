export async function onRequestGet(context) {
  const key = String(context.env.SPORTS_GAME_ODDS_API_KEY || "").trim();
  if (!key) return Response.json({success:false,code:"SECRET_MISSING",error:"Playmaker odds secret is not available to this deployment",diagnostic:{function:"playmaker-odds",secretDetected:false}},{status:503,headers:{"Cache-Control":"no-store"}});
  const q = new URL(context.request.url).searchParams;
  const leagueID = q.get("leagueID") || "NFL,NCAAF,NBA,WNBA,MLB,NHL,NCAAB";
  const limit = Math.min(Math.max(Number(q.get("limit")||20),1),50);
  const upstream = new URL("https://api.sportsgameodds.com/v2/events");
  
  upstream.searchParams.set("leagueID",leagueID);
  upstream.searchParams.set("oddsAvailable","true");
  upstream.searchParams.set("limit",String(limit));
  try {
    const r = await fetch(upstream.toString(),{headers:{"Accept":"application/json","x-api-key":key}});
    const body = await r.text();
    return new Response(body,{status:r.status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-LINKS-Odds-Secret":"present"}});
  } catch (e) {
    return Response.json({success:false,error:"Odds provider unavailable"},{status:502,headers:{"Cache-Control":"no-store"}});
  }
}