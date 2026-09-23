export async function onRequestGet(context) {
  const key = context.env.SPORTS_GAME_ODDS_API_KEY;
  if (!key) return Response.json({success:false,error:"SPORTS_GAME_ODDS_API_KEY is not configured"},{status:503,headers:{"Cache-Control":"no-store"}});
  const q = new URL(context.request.url).searchParams;
  const leagueID = q.get("leagueID") || "NFL,NCAAF,NBA,WNBA,MLB,NHL,NCAAB";
  const limit = Math.min(Math.max(Number(q.get("limit")||20),1),50);
  const upstream = new URL("https://api.sportsgameodds.com/v2/events");
  upstream.searchParams.set("apiKey",key);
  upstream.searchParams.set("leagueID",leagueID);
  upstream.searchParams.set("oddsAvailable","true");
  upstream.searchParams.set("limit",String(limit));
  try {
    const r = await fetch(upstream.toString(),{headers:{"Accept":"application/json"}});
    const body = await r.text();
    return new Response(body,{status:r.status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"public, max-age=30"}});
  } catch (e) {
    return Response.json({success:false,error:"Odds provider unavailable"},{status:502,headers:{"Cache-Control":"no-store"}});
  }
}