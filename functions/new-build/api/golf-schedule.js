import {commissionerSession} from '../../lib/commissioner-auth.js';
import {poolGameKeys} from '../../lib/pool-games.js';
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
export function tournaments(feed){return (feed.leagues?.[0]?.calendar||[]).filter(e=>/^\d+$/.test(String(e.id))&&Number.isFinite(Date.parse(e.startDate))&&Number.isFinite(Date.parse(e.endDate))).map(e=>({id:String(e.id),name:e.label,date:e.startDate,end:e.endDate}));}
export function golfers(feed,id){const event=feed.events?.find(e=>String(e.id)===String(id));if(!event)return [];return [...new Set((event.competitions||[]).flatMap(c=>(c.competitors||[]).map(p=>p.athlete?.displayName||p.athlete?.fullName).filter(Boolean)))].sort((a,b)=>a.localeCompare(b));}
export async function onRequest({request,env}){try{
 if(request.method!=='GET')return json({error:'Method not allowed.'},405);
 const q=new URL(request.url).searchParams,pool=Number(q.get('pool')),year=Number(q.get('year')||new Date().getUTCFullYear());
 if(!env.DB||!pool||!await commissionerSession(request,env.DB,pool))return json({error:'Commissioner sign-in required.'},403);
 if(!(await poolGameKeys(env.DB,pool)).includes('masters'))return json({error:'Golf is not enabled in this pool.'},403);
 if(!Number.isInteger(year)||year<2024||year>2100)return json({error:'Choose a valid season.'},400);
 async function feed(dates){const r=await fetch('https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?dates='+dates,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('Tournament service unavailable. Try again.');return r.json()}
 const season=await feed(year),events=tournaments(season),id=q.get('event');
 if(!id)return json({events,source:'ESPN'});
 const event=events.find(e=>e.id===id);if(!event)return json({error:'Tournament not found in this season.'},404);
 const dates=[event.date,event.end].map(d=>d.slice(0,10).replaceAll('-','')).join('-');
 const field=golfers(await feed(dates),id);
 return json({event,golfers:field,source:'ESPN',message:field.length?'Review the field and set the entry deadline before saving.':'The golfer field is not available yet. Try again closer to the tournament, or enter confirmed golfers manually.'});
 }catch{return json({error:'Golf schedule unavailable. Try again or enter the tournament manually.'},503)}}
