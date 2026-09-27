// LINKS Playmaker odds gateway — v764
// Fresh provider odds first; persistent edge cache is retained for rate-limit fallback.
let memoryCache={};
let inFlight={};
const FRESH_MS=15*60*1000,STALE_MS=24*60*60*1000;
const outHeaders=(extra={})=>({"Content-Type":"application/json; charset=utf-8",...extra});
const clean=(v,n=300)=>String(v||"").replace(/[^a-zA-Z0-9_,.+-]/g,"").slice(0,n);
function normalizeList(v){return [...new Set(clean(v,1600).split(',').map(x=>x.trim()).filter(Boolean))].sort().join(',')}
function response(body,cache,warning){return new Response(body,{status:200,headers:outHeaders({"Cache-Control":"public, max-age=600, stale-while-revalidate=86400","X-LINKS-Odds-Cache":cache,...(warning?{"X-LINKS-Odds-Warning":warning}:{})})})}
export async function onRequestGet(context){
 const key=String(context.env.SPORTS_GAME_ODDS_API_KEY||context.env.SPORTSGAMEODDS_API_KEY||context.env.SGO_API_KEY||"").trim();
 if(!key)return Response.json({success:false,code:"SECRET_MISSING",error:"Playmaker odds secret is not available to this deployment",diagnostic:{function:"playmaker-odds",secretDetected:false,build:"764"}},{status:503,headers:{"Cache-Control":"no-store"}});
 const q=new URL(context.request.url).searchParams;
 const leagueID=normalizeList(q.get("leagueID")||"NFL,NCAAF,NBA,WNBA,MLB,NHL,NCAAB");
 const limit=Math.min(Math.max(Number(q.get("limit")||20),1),100);
 const bookmakerID=normalizeList(q.get("bookmakerID"));
 const oddIDs=normalizeList(q.get("oddIDs")||q.get("oddID"));
 const includeAltLines=q.get("includeAltLines")==="true",includeOpenCloseOdds=q.get("includeOpenCloseOdds")==="true";
 const cacheKey=[leagueID,limit,bookmakerID,oddIDs,includeAltLines?1:0,includeOpenCloseOdds?1:0].join("|");
 const now=Date.now(),mem=memoryCache[cacheKey];
 if(mem&&now-mem.at<FRESH_MS)return response(mem.body,"memory");
 const edge=typeof caches!=="undefined"?caches.default:null;
 const edgeURL=new URL(context.request.url);edgeURL.pathname="/new-build/api/__playmaker_odds_cache_v764";edgeURL.search="?k="+encodeURIComponent(cacheKey);
 const edgeReq=new Request(edgeURL.toString(),{method:"GET"});
 let edgeBody="";
 if(edge){const hit=await edge.match(edgeReq);if(hit){edgeBody=await hit.text();memoryCache[cacheKey]={at:now,body:edgeBody};return response(edgeBody,"edge")}}
 if(inFlight[cacheKey]){try{return response(await inFlight[cacheKey],"coalesced")}catch{}}
 const stale=mem&&now-mem.at<STALE_MS?mem:null;
 const job=(async()=>{
  const upstream=new URL("https://api.sportsgameodds.com/v2/events");
  upstream.searchParams.set("leagueID",leagueID);upstream.searchParams.set("oddsAvailable","true");upstream.searchParams.set("limit",String(limit));upstream.searchParams.set("started","false");upstream.searchParams.set("ended","false");
  if(bookmakerID)upstream.searchParams.set("bookmakerID",bookmakerID);if(oddIDs)upstream.searchParams.set("oddIDs",oddIDs);if(includeAltLines)upstream.searchParams.set("includeAltLines","true");if(includeOpenCloseOdds)upstream.searchParams.set("includeOpenCloseOdds","true");
  const r=await fetch(upstream.toString(),{headers:{"Accept":"application/json","x-api-key":key}});let body=await r.text();
  if(!r.ok){const err=new Error("UPSTREAM_"+r.status);err.status=r.status;err.body=body;throw err}
  try{const parsed=JSON.parse(body),rows=Array.isArray(parsed?.data)?parsed.data:[];parsed.linksDiagnostic={build:"764",leagueID,eventCount:rows.length,sharedCache:true};body=JSON.stringify(parsed)}catch{}
  memoryCache[cacheKey]={at:Date.now(),body};
  if(edge)context.waitUntil(edge.put(edgeReq,new Response(body,{status:200,headers:outHeaders({"Cache-Control":"public, max-age=86400, stale-while-revalidate=86400"})})));
  return body;
 })();
 inFlight[cacheKey]=job;
 try{return response(await job,"provider")}
 catch(e){
  if(stale)return response(stale.body,"stale-memory",e.status===429?"provider-rate-limited":"provider-error");
  if(edgeBody)return response(edgeBody,"stale-edge",e.status===429?"provider-rate-limited":"provider-error");
  if(e.status===429)return Response.json({success:false,code:"RATE_LIMITED",error:"Live odds provider rate limit reached and no cached odds are available yet. Try again after the provider window resets.",build:"764"},{status:429,headers:{"Cache-Control":"no-store","Retry-After":"900"}});
  return Response.json({success:false,code:"UPSTREAM_ERROR",error:"Odds provider unavailable and no cached odds are available yet.",build:"764"},{status:502,headers:{"Cache-Control":"no-store"}})
 }
 finally{delete inFlight[cacheKey]}
}
