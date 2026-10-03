// Only public provider data belongs here. Never pass sessions, picks, or pool data.
// Cloudflare Cache API storage is shared within a data center, not globally.
const inflight=new WeakMap();
export async function sharedScoreFeed(key,load,{cache=globalThis.caches?.default,now=Date.now,ttl=15}={}){
 if(!cache)return load();
 const request=new Request('https://linkspickempools.com/__score-cache/v1/'+encodeURIComponent(key));
 let pending=inflight.get(cache);if(!pending){pending=new Map();inflight.set(cache,pending)}
 if(!pending.has(key)){
 const work=(async()=>{
  try{const hit=await cache.match(request);if(hit){const value=await hit.json();if(value.expires>now()&&Array.isArray(value.data?.events)&&value.data.events.length)return value.data}}catch{}
  const data=await load();
  // Empty/unavailable feeds must not replace valid data or be reused for scoring.
  if(Array.isArray(data?.events)&&data.events.length){try{await cache.put(request,Response.json({expires:now()+ttl*1000,data},{headers:{'Cache-Control':'public, max-age='+ttl}}))}catch{}}
  return data;
 })();pending.set(key,work);work.then(()=>pending.delete(key),()=>pending.delete(key));
 }
 // Callers may apply pool-specific overrides; never share their mutable objects.
 return structuredClone(await pending.get(key));
}
