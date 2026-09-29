import {commissionerSession} from '../../lib/commissioner-auth.js';
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequestGet({request,env}){
 const s=await commissionerSession(request,env.DB);if(!s)return json({error:'Commissioner sign-in required.'},403);
 const week=Number(new URL(request.url).searchParams.get('week'));if(!Number.isInteger(week)||week<1||week>22)return json({error:'Choose a valid week.'},400);
 const {results:access=[]}=await env.DB.prepare("SELECT player_name,paid FROM pool_payments WHERE pool_id=? AND sport='nfl' AND week=?").bind(s.pool_id,week).all();
 const {results:invites=[]}=await env.DB.prepare("SELECT email,MAX(created_at) AS created_at FROM pool_invites WHERE pool_id=? AND status='PENDING' AND email<>'' GROUP BY email ORDER BY created_at DESC").bind(s.pool_id).all();
 return json({week,access,invites});
}
