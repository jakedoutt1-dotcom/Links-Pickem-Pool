import {ensureDaily,centralDay} from '../../lib/daily-challenge.js';
import {venueBoard} from '../../lib/daily-venues.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function venueLeaderboardRequest({request,env},services={}){try{
 if(request.method!=='GET')return json({error:'Method not allowed.'},405);if(!env.DB)return json({error:'Venue leaderboards are temporarily unavailable.'},503);
 const q=new URL(request.url).searchParams,period=q.get('period')||'today',venue=q.get('venue')||null;if(!['today','all'].includes(period)||venue&&venue.length>100)return json({error:'Choose today or all time and a valid venue.'},400);
 const now=services.now?.()??Date.now();await ensureDaily(env.DB);const board=await venueBoard(env.DB,centralDay(now),period,venue);if(venue&&!board.selectedVenue)return json({error:'Venue not found.'},404);
 return json({...board,serverNow:new Date(now).toISOString()});
 }catch{return json({error:'Venue leaderboards could not load. Please try again.'},503)}}
export const onRequest=context=>venueLeaderboardRequest(context);
