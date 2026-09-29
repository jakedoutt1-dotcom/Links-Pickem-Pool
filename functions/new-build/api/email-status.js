import {emailConfig,poolEmail,sendPoolEmail} from '../../lib/pool-email.js';
import {commissionerSession} from '../../lib/commissioner-auth.js';
const json=(d,s=200)=>Response.json(d,{status:s,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}){
 if(!env.DB)return json({error:'Pool database unavailable'},503);const s=await commissionerSession(request,env.DB);if(!s)return json({error:'Sign in as this pool’s commissioner.'},403);
 const cfg=emailConfig(env),p=await env.DB.prepare('SELECT code,name FROM pools WHERE id=?').bind(s.pool_id).first();
 const row=await env.DB.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='commissioner_email'").bind(s.pool_id).first();
 if(request.method==='GET')return json({configured:!!cfg.key,from:cfg.from,commissionerEmail:row?.value||'',note:'Configuration detected is not a delivery test. Send your welcome guide to verify provider acceptance.'});
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 if(!row?.value)return json({error:'Save a commissioner email first.'},400);
 const delivery=await sendPoolEmail(env,row.value,poolEmail({base:env.LINKS_BASE_URL||new URL(request.url).origin,poolName:p.name,poolCode:p.code,commissioner:true}),undefined);
 return json({delivery},delivery.sent?200:502);
}
