// LINKS Playmaker odds gateway — v767
let memoryCache={};
let inFlight={};
const FRESH_MS=15*60*1000,STALE_MS=24*60*60*1000;
const headers=(extra={})=>({"Content-Type":"application/json; charset=utf-8",...extra});
const clean=(v,n=300)=>String(v||"").replace(/[^a-zA-Z0-9_,.+-]/g,"").slice(0,n);
function list(v){return [...new Set(clean(v,1600).split(',').map(x=>x.trim()).filter(Boolean))].sort().join(',')}
function ok(body,cache,warning){return new Response(body,{status:200,headers:headers({"Cache-Control":"public, max-age=600, stale-while-revalidate=86400","X-LINKS-Odds-Cache":cache,...(warning?{"X-LINKS-Odds-Warning":warning}:{})})})}
async function usage(key){
 try{const r=await fetch("https://api.sportsgameodds.com/v2/account/usage",{headers:{Accept:"application/json","x-api-key":key}});const j=await r.json().catch(()=>null);return {status:r.status,data:j}}catch{return null}
}
export async function onRequestGet(context){
 const key=String(context.env.SPORTS_GAME_ODDS_API_KEY||context.env.SPORTSGAMEODDS_API_KEY||context.env.SGO_API_KEY||"").trim();
 if(!key)return Response.json({success:false,code:"SECRET_MISSING",error:"Playmaker odds connection is not configured on this deployment.",build:"767"},{status:503,headers:{"Cache-Control":"no-store"}});
 const q=new URL(context.request.url).searchParams;
 const leagueID=list(q.get("leagueID")||"NFL,NCAAF,NBA,WNBA,MLB,NHL,NCAAB"),limit=Math.min(Math.max(Number(q.get("limit")||20),1),100),bookmakerID=list(q.get("bookmakerID")),oddIDs=list(q.get("oddIDs")||q.get("oddID"));
 const includeAltLines=q.get("includeAltLines")==="true",includeOpenCloseOdds=q.get("includeOpenCloseOdds")==="true",cacheKey=[leagueID,limit,bookmakerID,oddIDs,includeAltLines?1:0,includeOpenCloseOdds?1:0].join("|");
 const now=Date.now(),mem=memoryCache[cacheKey];if(mem&&now-mem.at<FRESH_MS)return ok(mem.body,"memory");
 const edge=typeof caches!=="undefined"?caches.default:null,edgeURL=new URL(context.request.url);edgeURL.pathname="/new-build/api/__playmaker_odds_cache_v767";edgeURL.search="?k="+encodeURIComponent(cacheKey);const edgeReq=new Request(edgeURL.toString());
 let edgeBody="";if(edge){const hit=await edge.match(edgeReq);if(hit){edgeBody=await hit.text();memoryCache[cacheKey]={at:now,body:edgeBody};return ok(edgeBody,"edge")}}
 if(inFlight[cacheKey]){try{return ok(await inFlight[cacheKey],"coalesced")}catch{}}
 const stale=mem&&now-mem.at<STALE_MS?mem:null;
 const job=(async()=>{const u=new URL("https://api.sportsgameodds.com/v2/events");u.searchParams.set("leagueID",leagueID);u.searchParams.set("oddsAvailable","true");u.searchParams.set("limit",String(limit));u.searchParams.set("started","false");u.searchParams.set("ended","false");if(bookmakerID)u.searchParams.set("bookmakerID",bookmakerID);if(oddIDs)u.searchParams.set("oddIDs",oddIDs);if(includeAltLines)u.searchParams.set("includeAltLines","true");if(includeOpenCloseOdds)u.searchParams.set("includeOpenCloseOdds","true");const r=await fetch(u.toString(),{headers:{Accept:"application/json","x-api-key":key}});let body=await r.text();if(!r.ok){const e=new Error("UPSTREAM_"+r.status);e.status=r.status;e.body=body;throw e}try{const j=JSON.parse(body);j.linksDiagnostic={build:"767",leagueID,eventCount:Array.isArray(j.data)?j.data.length:0,sharedCache:true};body=JSON.stringify(j)}catch{}memoryCache[cacheKey]={at:Date.now(),body};if(edge)context.waitUntil(edge.put(edgeReq,new Response(body,{headers:headers({"Cache-Control":"public, max-age=86400, stale-while-revalidate=86400"})})));return body})();
 inFlight[cacheKey]=job;
 try{return ok(await job,"provider")}catch(e){
  if(stale)return ok(stale.body,"stale-memory",e.status===429?"provider-rate-limited":"provider-error");if(edgeBody)return ok(edgeBody,"stale-edge",e.status===429?"provider-rate-limited":"provider-error");
  if(e.status===429){const u=await usage(key);return Response.json({success:false,code:"RATE_LIMITED",error:"Live odds provider limit reached. Playmaker is connected, but the provider is not returning odds right now.",providerUsage:u?.data||null,providerUsageStatus:u?.status||null,build:"767"},{status:429,headers:{"Cache-Control":"no-store","Retry-After":"900"}})}
  return Response.json({success:false,code:"UPSTREAM_ERROR",error:"Odds provider is temporarily unavailable and no cached odds are available yet.",providerStatus:e.status||null,build:"767"},{status:502,headers:{"Cache-Control":"no-store"}})
 }finally{delete inFlight[cacheKey]}
}
