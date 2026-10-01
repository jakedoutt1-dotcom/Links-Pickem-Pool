import {partnerInvite} from '../../lib/partners.js';
import {poolFor,sessionFor} from '../../lib/college.js';
import {onRequest as legacy} from '../../api/[[path]].js';
const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest(context){
 const {request,env}=context,db=env.DB;
 if(!['GET','POST'].includes(request.method))return reply({error:'Method not allowed.'},405);
 try{
 await db.prepare('CREATE TABLE IF NOT EXISTS pool_qr_invites(pool_id INTEGER PRIMARY KEY,token TEXT UNIQUE NOT NULL,expires_at TEXT NOT NULL)').run();
 const url=new URL(request.url),body=request.method==='POST'?await request.json():{},token=body.qr||url.searchParams.get('qr');
 if(token){
  const invite=await db.prepare('SELECT q.*,p.code,p.name FROM pool_qr_invites q JOIN pools p ON p.id=q.pool_id WHERE q.token=? AND q.expires_at>?').bind(String(token),new Date().toISOString()).first() || await partnerInvite(db,String(token));
  if(!invite)return reply({error:'This QR invitation has expired or been turned off. Ask your commissioner for a new code.'},404);
  if(request.method==='GET')return reply({poolName:invite.name,poolCode:invite.code,email:'anyone invited by the commissioner',partner:invite.partner_id?{name:invite.partner_name,logo:invite.logo}:null});
  if(body.action!=='join')return reply({error:'Invalid invitation action.'},400);
  if(!String(body.name||'').trim()||String(body.password||'').length<4)return reply({error:'Enter your name and a password of at least 4 characters.'},400);
  // Each scan joins through a separate normal invitation, so one player cannot consume the group QR.
  const single=crypto.randomUUID()+crypto.randomUUID();
  await db.prepare("INSERT INTO pool_invites(token,pool_id,email,status,created_at) VALUES(?,?,?,'PENDING',?)").bind(single,invite.pool_id,'',new Date().toISOString()).run();
  try{return await legacy({...context,request:new Request(new URL('/api/invite/join',request.url),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:single,name:body.name,password:body.password})})})}
  finally{await db.prepare('DELETE FROM pool_invites WHERE token=?').bind(single).run()}
 }
 const pool=await poolFor(db,body.pool||url.searchParams.get('pool')),session=pool&&await sessionFor(request,db,pool.id);
 if(session?.role!=='admin')return reply({error:'Sign in as this pool’s commissioner.'},403);
 if(request.method!=='POST')return reply({error:'Choose Show Invite QR Code in Admin.'},400);
 if(body.action==='disable'){await db.prepare('DELETE FROM pool_qr_invites WHERE pool_id=?').bind(pool.id).run();return reply({disabled:true})}
 if(body.action!=='show')return reply({error:'Invalid invitation action.'},400);
 let row=await db.prepare('SELECT token,expires_at FROM pool_qr_invites WHERE pool_id=? AND expires_at>?').bind(pool.id,new Date().toISOString()).first();
 if(!row){row={token:crypto.randomUUID()+crypto.randomUUID(),expires_at:new Date(Date.now()+7*864e5).toISOString()};await db.prepare('INSERT INTO pool_qr_invites(pool_id,token,expires_at) VALUES(?,?,?) ON CONFLICT(pool_id) DO UPDATE SET token=excluded.token,expires_at=excluded.expires_at').bind(pool.id,row.token,row.expires_at).run()}
 return reply({poolName:pool.name,poolCode:pool.code,expiresAt:row.expires_at,url:url.origin+'/new-build/join.html?qr='+encodeURIComponent(row.token)});
 }catch(error){console.error('QR invitation failed',error);return reply({error:'QR invitation is unavailable. Please try again.'},503)}
}
