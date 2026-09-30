import {poolFor,sessionFor} from '../../lib/college.js';
import {onRequest as legacy} from '../../api/[[path]].js';
export async function onRequest(context){try{
 const {request,env}=context;if(!['GET','POST'].includes(request.method))return Response.json({error:'Method not allowed'},{status:405});
 const body=request.method==='POST'?await request.clone().json():{},q=new URL(request.url).searchParams,pool=await poolFor(env.DB,body.pool||q.get('pool')),session=pool&&await sessionFor(request,env.DB,pool.id);
 if(session?.role!=='admin')return Response.json({error:'Sign in as this pool’s commissioner.'},{status:403});
 if(request.method==='GET'){const rows=await env.DB.prepare("SELECT email,created_at FROM pool_invites WHERE pool_id=? AND status='PENDING' AND email<>'' ORDER BY created_at DESC").bind(pool.id).all();return Response.json({poolName:pool.name,invites:rows.results||[]},{headers:{'Cache-Control':'no-store'}})}
 const emails=[...new Set((Array.isArray(body.emails)?body.emails:[]).map(x=>String(x).trim().toLowerCase()))];
 if(!emails.length||emails.length>25||emails.some(x=>!/^\S+@\S+\.\S+$/.test(x)))return Response.json({error:'Enter 1–25 valid email addresses.'},{status:400});
 return legacy({...context,request:new Request(new URL('/api/admin/invite',request.url),{method:'POST',headers:request.headers,body:JSON.stringify({emails,resend:body.resend===true})})});
 }catch{return Response.json({error:'Invitations are unavailable. Please try again.'},{status:503})}}
