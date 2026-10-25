// Public team artwork only. No AI or sportsbook keys are used.
const LEAGUES={NFL:'football/nfl',NCAAF:'football/college-football',NBA:'basketball/nba',NCAAB:'basketball/mens-college-basketball',MLB:'baseball/mlb',NHL:'hockey/nhl'};
export const teamKey=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function logoMap(data){
 const aliases=new Map(),owners=new Map();
 for(const sport of data?.sports||[])for(const league of sport.leagues||[])for(const entry of league.teams||[]){
  const team=entry.team||{},logo=team.logos?.find(l=>{try{const u=new URL(l.href);return u.protocol==='https:'&&u.hostname==='a.espncdn.com'&&u.pathname.startsWith('/i/teamlogos/')}catch{return false}})?.href;
  if(!logo||!team.id)continue;
  for(const name of [team.displayName,team.shortDisplayName,team.nickname,team.abbreviation,team.name]){const key=teamKey(name);if(!key)continue;if(owners.has(key)&&owners.get(key)!==team.id){aliases.delete(key);owners.set(key,null)}else if(!owners.has(key)){owners.set(key,team.id);aliases.set(key,logo)}}
 }
 return Object.fromEntries(aliases);
}
export async function teamLogos(context,services={}){
 const league=new URL(context.request.url).searchParams.get('league')||'NFL';
 const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':status===200?'public, max-age=86400':'no-store','X-Content-Type-Options':'nosniff'}});
 if(context.request.method!=='GET')return reply({logos:{}},405);
 if(!LEAGUES[league])return reply({logos:{}},league==='MMA'?200:400);
 const cache=services.cache??globalThis.caches?.default,key=new Request('https://linkspickempools.com/new-build/api/playmaker-logos?league='+league);
 try{
  if(cache){const hit=await cache.match(key);if(hit)return hit}
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6000);let response;
  try{response=await (services.fetch||fetch)('https://site.api.espn.com/apis/site/v2/sports/'+LEAGUES[league]+'/teams?limit=1000',{redirect:'manual',signal:controller.signal})}finally{clearTimeout(timer)}
  if(!response.ok)return reply({logos:{}},503);
  const logos=logoMap(await response.json()),result=reply({logos});
  if(cache&&Object.keys(logos).length){const save=cache.put(key,result.clone());if(context.waitUntil)context.waitUntil(save);else await save}
  return result;
 }catch{return reply({logos:{}},503)}
}
export const onRequestGet=teamLogos;
