const json=(error,status=428,code='REAUTH_REQUIRED')=>Response.json({error,code},{status,headers:{'Cache-Control':'no-store'}});
// Every protected mutation verifies a fresh password; no client-side flag grants access.
export async function sensitiveChangeGuard(request,env){
 if(!env.DB||['GET','HEAD','OPTIONS'].includes(request.method))return null;
 const path=new URL(request.url).pathname;let body;try{body=await request.clone().json()}catch{return null}
 const member=path==='/new-build/api/members';
 let sensitive=member&&['setPassword','resetPassword','bulkAddPlayers'].includes(body.action)||path==='/api/admin/transfer-commissioner'||path==='/api/admin/player'&&request.method==='PATCH'&&!!body.password;
 const emailChange=path==='/api/admin/settings'&&body.commissionerEmail!==undefined;
 if(!sensitive&&!emailChange)return null;
 const db=env.DB,token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');
 const s=await db.prepare('SELECT * FROM pool_sessions WHERE token=?').bind(token).first();
 if(!s||s.role!=='admin'||!Number.isFinite(Date.parse(s.expires_at))||Date.parse(s.expires_at)<=Date.now())return json('Commissioner sign-in required.',403,'FORBIDDEN');
 if(emailChange){const old=await db.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='commissioner_email'").bind(s.pool_id).first();sensitive=String(old?.value||'').trim().toLowerCase()!==String(body.commissionerEmail||'').trim().toLowerCase()}
 if(!sensitive)return null;
 const password=request.headers.get('x-links-confirm-password');if(!password)return json('Confirm your commissioner password before making this account change.');
 await db.prepare('CREATE TABLE IF NOT EXISTS links_reauth_limits(pool_id INTEGER,player_name TEXT,window_start INTEGER,attempts INTEGER,PRIMARY KEY(pool_id,player_name))').run();
 const windowStart=Math.floor(Date.now()/900000);
 const attempt=await db.prepare('INSERT INTO links_reauth_limits(pool_id,player_name,window_start,attempts) VALUES(?,?,?,1) ON CONFLICT(pool_id,player_name) DO UPDATE SET window_start=excluded.window_start,attempts=CASE WHEN window_start=excluded.window_start THEN attempts+1 ELSE 1 END WHERE window_start<>excluded.window_start OR attempts<5 RETURNING attempts').bind(s.pool_id,s.player_name,windowStart).first();
 if(!attempt)return json('Too many verification attempts. Try again in 15 minutes.',429,'REAUTH_LIMIT');
 const row=await db.prepare('SELECT salt,password_hash FROM pool_players WHERE pool_id=? AND lower(name)=lower(?)').bind(s.pool_id,s.player_name).first();
 const hash=row?btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(row.salt+':'+password))))):'';
 if(!row||hash!==row.password_hash)return json('The commissioner password did not match. Your change was not saved.',403,'REAUTH_FAILED');
 await db.prepare('DELETE FROM links_reauth_limits WHERE pool_id=? AND player_name=?').bind(s.pool_id,s.player_name).run();return null;
}
