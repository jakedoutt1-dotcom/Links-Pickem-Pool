const json=(d,s=200,headers={})=>Response.json(d,{status:s,headers:{'Cache-Control':'no-store',...headers}});
const cookies=request=>Object.fromEntries((request.headers.get('cookie')||'').split(';').map(x=>x.trim().split('=')));
export async function onRequest({request,env}){
 const db=env.DB;if(!db)return json({error:'Pool service unavailable'},503);
 const url=new URL(request.url),origin=request.headers.get('origin');if(origin&&origin!==url.origin)return json({error:'Invalid origin'},403);
 const code=url.searchParams.get('pool')||'',p=await db.prepare('SELECT id,code,name FROM pools WHERE id=? OR upper(code)=upper(?) LIMIT 1').bind(code,code).first();if(!p)return json({error:'Pool not found'},404);
 const prefix='links_home_'+p.id+'_';let profile=url.searchParams.get('profile')||'';if(profile&&!/^[a-f0-9]{24}$/.test(profile))return json({error:'Invalid shortcut'},400);const bearer=(request.headers.get('authorization')||'').replace(/^Bearer /,'');let cookie=prefix+profile;const token=request.method==='POST'?bearer:cookies(request)[cookie];
 const options='; Path=/new-build/; HttpOnly; Secure; SameSite=Lax';
 if(request.method==='DELETE'){const response=json({ok:true});for(const key of Object.keys(cookies(request)))if(key.startsWith(prefix))response.headers.append('Set-Cookie',key+'=; Max-Age=0'+options);return response}
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed'},405);
 if(!token)return json({error:'Sign in once to remember this pool on this device.'},401);
 const s=await db.prepare('SELECT * FROM pool_sessions WHERE token=?').bind(token).first(),expires=Date.parse(s?.expires_at);
 if(!s||String(s.pool_id)!==String(p.id)||!Number.isFinite(expires)||expires<=Date.now())return json({error:'Please sign in again.'},401,{'Set-Cookie':cookie+'=; Max-Age=0'+options});
 const ownProfile=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(p.id)+':'+String(s.player_name).toLowerCase())))).map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,24);if(request.method==='POST'){profile=ownProfile;cookie=prefix+profile}else if(profile!==ownProfile)return json({error:'Sign in to the account that owns this shortcut.'},401);
 const access=await db.prepare('SELECT status FROM newbuild_player_access WHERE pool_id=? AND lower(player_name)=lower(?)').bind(p.id,s.player_name).first().catch(()=>null);if(access?.status==='pending')return json({error:'Your pool access is pending.'},403);
 const role=s.role==='admin'?'commissioner':'player';
 return json({profile,pool:{id:String(p.id),code:p.code,name:p.name,role},player:s.player_name,role,token,expiresAt:s.expires_at},200,request.method==='POST'?{'Set-Cookie':cookie+'='+token+'; Max-Age='+Math.floor((expires-Date.now())/1000)+options}:{});
}
