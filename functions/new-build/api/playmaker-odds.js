// LINKS Playmaker odds gateway — v742
// One upstream request per normalized market. All patched Playmaker UI reads share this cache.
let memoryCache={};
let inFlight={};
const MAX_BODY=8*1024*1024,MAX_MEMORY_CHARS=8*1024*1024;
function remember(key,body){delete memoryCache[key];memoryCache[key]={at:Date.now(),body};let size=Object.values(memoryCache).reduce((n,v)=>n+v.body.length,0);for(const id of Object.keys(memoryCache)){if(size<=MAX_MEMORY_CHARS)break;size-=memoryCache[id].body.length;delete memoryCache[id]}}
async function readBounded(response){const reader=response.body.getReader(),decoder=new TextDecoder(),parts=[];let size=0;try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BODY){await reader.cancel();throw Error('ODDS_RESPONSE_TOO_LARGE')}parts.push(decoder.decode(value,{stream:true}))}parts.push(decoder.decode());return parts.join('')}finally{reader.releaseLock()}}
const FRESH_MS=15*60*1000,STALE_MS=6*60*60*1000;
const outHeaders=(extra={})=>({"Content-Type":"application/json; charset=utf-8",...extra});
const clean=(v,n=300)=>String(v||"").replace(/[^a-zA-Z0-9_,.+-]/g,"").slice(0,n);
function normalizeList(v){return [...new Set(clean(v,1600).split(',').map(x=>x.trim()).filter(Boolean))].sort().join(',')}
function response(body,cache,warning){return new Response(body,{status:200,headers:outHeaders({"Cache-Control":"public, max-age=600, stale-while-revalidate=1800","X-LINKS-Odds-Cache":cache,...(warning?{"X-LINKS-Odds-Warning":warning}:{})})})}
export async function onRequestGet(context){
 const key=String(context.env.SPORTS_GAME_ODDS_API_KEY||context.env.SPORTSGAMEODDS_API_KEY||context.env.SGO_API_KEY||"").trim();
 if(!key)return Response.json({success:false,code:"SECRET_MISSING",error:"Playmaker odds secret is not available to this deployment",diagnostic:{function:"playmaker-odds",secretDetected:false,build:"742"}},{status:503,headers:{"Cache-Control":"no-store"}});
 const q=new URL(context.request.url).searchParams;
 const leagueID=normalizeList(q.get("leagueID")||"NFL,NCAAF,NBA,WNBA,MLB,NHL,NCAAB");
 const eventID=String(q.get('eventID')||'');if(eventID&&!/^[a-zA-Z0-9_-]{1,160}$/.test(eventID))return Response.json({success:false,error:'Invalid game.'},{status:400});
 const limit=Math.min(Math.max(Number(q.get("limit")||20),1),100);
 const bookmakerID=normalizeList(q.get("bookmakerID"));
 const oddIDs=normalizeList(q.get("oddIDs")||q.get("oddID"));
 const includeAltLines=q.get("includeAltLines")==="true",includeOpenCloseOdds=q.get("includeOpenCloseOdds")==="true";
 // Deliberately ignore cache-busters and UI-only query params so old patched callers collapse to one provider request.
 const cacheKey=[leagueID,eventID,limit,bookmakerID,oddIDs,includeAltLines?1:0,includeOpenCloseOdds?1:0].join("|");
 const now=Date.now(),mem=memoryCache[cacheKey];
 if(mem&&now-mem.at<FRESH_MS)return response(mem.body,"memory");
 const edge=typeof caches!=="undefined"?caches.default:null;
 const edgeURL=new URL(context.request.url);edgeURL.pathname="/new-build/api/__playmaker_odds_cache_v742";edgeURL.search="?k="+encodeURIComponent(cacheKey);
 const edgeReq=new Request(edgeURL.toString(),{method:"GET"});
 if(edge){const hit=await edge.match(edgeReq);if(hit){const body=await hit.text();remember(cacheKey,body);return response(body,"edge")}}
 // If several old page patches fire together, only the first is allowed to reach SportsGameOdds.
 if(inFlight[cacheKey]){try{return response(await inFlight[cacheKey],"coalesced")}catch{}}
 const stale=mem&&now-mem.at<STALE_MS?mem:null;
 const job=(async()=>{
  const upstream=new URL("https://api.sportsgameodds.com/v2/events");
  upstream.searchParams.set("leagueID",leagueID);upstream.searchParams.set("oddsAvailable","true");upstream.searchParams.set("limit",String(limit));upstream.searchParams.set("started","false");upstream.searchParams.set("ended","false");
  if(eventID)upstream.searchParams.set('eventID',eventID);
  if(bookmakerID)upstream.searchParams.set("bookmakerID",bookmakerID);if(oddIDs)upstream.searchParams.set("oddIDs",oddIDs);if(includeAltLines)upstream.searchParams.set("includeAltLines","true");if(includeOpenCloseOdds)upstream.searchParams.set("includeOpenCloseOdds","true");
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);let r,body;
  try{r=await fetch(upstream.toString(),{signal:controller.signal,headers:{"Accept":"application/json","x-api-key":key}});body=await readBounded(r)}finally{clearTimeout(timeout)}
  if(!r.ok){const err=new Error("UPSTREAM_"+r.status);err.status=r.status;err.body=body;throw err}
  try{const parsed=JSON.parse(body),rows=Array.isArray(parsed?.data)?parsed.data:[];parsed.linksDiagnostic={build:"742",leagueID,eventCount:rows.length,sharedCache:true};body=JSON.stringify(parsed)}catch{}
  remember(cacheKey,body);
  if(edge)context.waitUntil(edge.put(edgeReq,new Response(body,{status:200,headers:outHeaders({"Cache-Control":"public, max-age=900, stale-while-revalidate=1800"})})));
  return body;
 })();
 inFlight[cacheKey]=job;
 try{return response(await job,"provider")}
 catch(e){if(stale)return response(stale.body,"stale-memory",e.status===429?"provider-rate-limited":"provider-error");if(e.status===429)return Response.json({success:false,code:"RATE_LIMITED",error:"Live odds provider rate limit reached. Playmaker will reuse cached odds as soon as available.",build:"742"},{status:429,headers:{"Cache-Control":"no-store","Retry-After":"900"}});return Response.json({success:false,code:"UPSTREAM_ERROR",error:"Odds provider unavailable",build:"742"},{status:502,headers:{"Cache-Control":"no-store"}})}
 finally{delete inFlight[cacheKey]}
}