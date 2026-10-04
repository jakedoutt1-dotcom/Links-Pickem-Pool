import {referralPartner} from '../../lib/partners.js';
import {poolGameKeys} from '../../lib/pool-games.js';
import {recordAccountLogin} from '../../lib/login-activity.js';
import {PLANS,GAMES,CREATABLE_GAMES,emailKey,digest,ensureAccounts,accountSession,importOwnedPools,allowance,reserveSlots,releaseSlots,ownedPool} from '../../lib/commissioner-account.js';
import {sendPoolEmail,poolEmail} from '../../lib/pool-email.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
const now=()=>new Date().toISOString();
async function paypal(env,path,options={}){
 if(!env.PAYPAL_CLIENT_ID||!env.PAYPAL_CLIENT_SECRET)throw fail('Package checkout is not configured yet. Your existing pools are safe.',503);
 const base=env.PAYPAL_ENV==='sandbox'?'https://api-m.sandbox.paypal.com':'https://api-m.paypal.com';
 const auth=await fetch(base+'/v1/oauth2/token',{method:'POST',headers:{Authorization:'Basic '+btoa(env.PAYPAL_CLIENT_ID+':'+env.PAYPAL_CLIENT_SECRET),'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials',signal:AbortSignal.timeout(15000)});
 const token=await auth.json();if(!auth.ok||!token.access_token)throw fail('Package checkout could not connect. Please try again.',502);
 const r=await fetch(base+path,{...options,headers:{Authorization:'Bearer '+token.access_token,'Content-Type':'application/json',Prefer:'return=representation',...options.headers},signal:AbortSignal.timeout(15000)}),j=await r.json();
 if(!r.ok)throw fail('Payment could not be verified. No package has been changed.',502);return j;
}
async function snapshot(db,email){
 await importOwnedPools(db,email);const plan=await allowance(db,email);
 const expired=plan.slots===0,freeSlot=null;
 const pools=(await db.prepare('SELECT p.id,p.code,p.name,s.id AS slot_id,s.game_type,s.active FROM links_pool_owners o JOIN pools p ON p.id=o.pool_id LEFT JOIN links_pool_slots s ON s.pool_id=p.id WHERE o.email=? ORDER BY p.id,s.game_type').bind(email).all()).results||[];
 const grouped=new Map();for(const r of pools){if(!grouped.has(r.id))grouped.set(r.id,{id:String(r.id),code:r.code,name:r.name,games:[]});if(r.game_type)grouped.get(r.id).games.push({key:r.game_type,name:GAMES[r.game_type]||r.game_type,active:!!r.active,readOnly:expired&&r.slot_id!==freeSlot,freeSlot:expired&&r.slot_id===freeSlot})}
 const used=pools.filter(p=>p.active&&p.game_type).length;
 const purchases=(await db.prepare('SELECT id,plan,amount_cents,status,created_at,paid_at,expires_at FROM links_account_purchases WHERE email=? ORDER BY created_at DESC LIMIT 30').bind(email).all()).results||[];
 // Show historical receipts without treating test-mode pool_service flags as purchases.
 try{const old=(await db.prepare('SELECT purchase_token AS id,email,plan,amount_cents,status,created_at,paid_at FROM commissioner_service_purchases').all()).results||[];purchases.push(...old.filter(p=>emailKey(p.email)===email).map(p=>({...p,legacy:true})))}catch(e){if(!/no such table/i.test(String(e)))throw e}
 try{const old=(await db.prepare('SELECT p.purchase_token AS id,p.plan,p.amount_cents,p.status,p.created_at,p.paid_at FROM service_purchases p JOIN links_pool_owners o ON o.pool_id=p.pool_id WHERE o.email=?').bind(email).all()).results||[];purchases.push(...old.map(p=>({...p,legacy:true})))}catch(e){if(!/no such table/i.test(String(e)))throw e}
 purchases.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
 return {email,plan,expired,used,remaining:Math.max(0,plan.slots-used),overLimit:used>plan.slots,pools:[...grouped.values()],purchases,plans:PLANS,games:GAMES,availableGames:[...CREATABLE_GAMES]};
}
async function verifyStart(request,env,db,b){
 const email=emailKey(b.email);if(email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email))throw fail('Enter a valid email address.');
 const stamp=Date.now(),ip=await digest(request.headers.get('cf-connecting-ip')||'local'),windowStart=Math.floor(stamp/3600000);
 const limiter=await db.prepare('INSERT INTO links_account_mail_limits(ip_hash,window_start,sends) VALUES(?,?,1) ON CONFLICT(ip_hash) DO UPDATE SET window_start=excluded.window_start,sends=CASE WHEN window_start=excluded.window_start THEN sends+1 ELSE 1 END WHERE window_start<>excluded.window_start OR sends<10 RETURNING sends').bind(ip,windowStart).first();
 if(!limiter)throw fail('Too many verification requests. Please try again later.',429);
 const code=String(crypto.getRandomValues(new Uint32Array(1))[0]%100000000).padStart(8,'0'),codeHash=await digest(email+':'+code);
 const changed=await db.prepare('INSERT INTO links_account_codes(email,code_hash,expires_at,attempts,sent_at) VALUES(?,?,?,0,?) ON CONFLICT(email) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,attempts=0,sent_at=excluded.sent_at WHERE sent_at<? RETURNING email').bind(email,codeHash,new Date(stamp+600000).toISOString(),now(),new Date(stamp-60000).toISOString()).first();
 if(!changed)throw fail('Please wait one minute before requesting another code.',429);
 const delivery=await sendPoolEmail(env,email,{subject:'Your LINKS sign-in code',text:'Your LINKS verification code is '+code+'. It expires in 10 minutes. Do not share this code. If you did not request it, ignore this email.',html:'<div style="font-family:Arial;padding:28px;background:#0d1b26;color:#fff"><h2 style="color:#edc466">LINKS sign-in</h2><p>Your verification code:</p><p style="font-size:32px;letter-spacing:5px">'+code+'</p><p>Expires in 10 minutes. Do not share this code. If you did not request it, ignore this email.</p></div>'});
 if(!delivery.sent)throw fail('The verification email could not be sent. Please try again shortly.',503);return {sent:true,email};
}
async function verifyFinish(db,b){
 const email=emailKey(b.email),code=String(b.code||'');if(!/^\d{8}$/.test(code))throw fail('Enter the eight-digit code from your email.');
 const row=await db.prepare('UPDATE links_account_codes SET attempts=attempts+1 WHERE email=? AND attempts<5 AND expires_at>? RETURNING code_hash').bind(email,now()).first();
 if(!row||row.code_hash!==await digest(email+':'+code))throw fail('That code is incorrect, expired, or used. Request a new code.',401);
 const token=crypto.randomUUID()+crypto.randomUUID(),hash=await digest(token),expiry=new Date(Date.now()+(b.remember===false?12*36e5:30*864e5)).toISOString();
 // Consume the code and create its session atomically; concurrent/replayed verification cannot mint sessions.
 const results=await db.batch([
 db.prepare('INSERT INTO links_account_sessions(token_hash,email,expires_at) SELECT ?,email,? FROM links_account_codes WHERE email=? AND code_hash=? AND expires_at>?').bind(hash,expiry,email,row.code_hash,now()),
 db.prepare('DELETE FROM links_account_codes WHERE email=? AND code_hash=?').bind(email,row.code_hash),
 db.prepare('INSERT OR IGNORE INTO links_accounts(email,verified_at) SELECT ?,? WHERE EXISTS(SELECT 1 FROM links_account_sessions WHERE token_hash=?)').bind(email,now(),hash)
 ]);if(!results[0].meta?.changes)throw fail('That code was already used. Request a new code.',401);
 await importOwnedPools(db,email);try{await recordAccountLogin(db,email)}catch{console.warn('Account login activity could not be recorded')}return {token,email};
}
async function createPool(db,env,email,b,origin,sessionExpiry){
 const name=String(b.name||'').trim(),displayName=String(b.displayName||'').trim(),password=String(b.password||''),games=Array.isArray(b.games)?[...new Set(b.games)]:[];
 if(name.length<3||name.length>60||!displayName||displayName.length>50||password.length<8||password.length>200||!games.length||games.some(g=>!CREATABLE_GAMES.has(g)))throw fail('Enter a pool name, your name, a password of at least eight characters, and supported games.');
 const referredBy=b.partnerRef?await referralPartner(db,b.partnerRef):null;
 await importOwnedPools(db,email);const ids=await reserveSlots(db,email,games),code='LINK-'+crypto.randomUUID().slice(0,8).toUpperCase();
 const salt=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16)))),hash=btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+password)))));
 const pid='(SELECT id FROM pools WHERE code=?)',token=crypto.randomUUID()+crypto.randomUUID();
 try{await db.batch([
 db.prepare('INSERT INTO pools(code,name,admin_salt,admin_hash,created_at) VALUES(?,?,?,?,?)').bind(code,name,salt,hash,now()),
 db.prepare(`INSERT INTO links_pool_owners(pool_id,email) VALUES(${pid},?)`).bind(code,email),
 ...(referredBy?[db.prepare(`INSERT INTO links_partner_referrals(pool_id,partner_id,created_at) VALUES(${pid},?,?)`).bind(code,referredBy.id,now())]:[]),
 ...games.flatMap((g,i)=>[
 db.prepare(`INSERT INTO pool_active_games(pool_id,game_type,is_primary,active,added_at) VALUES(${pid},?,?,1,?)`).bind(code,g,i===0?1:0,now()),
 db.prepare(`UPDATE links_pool_slots SET pool_id=${pid},expires_at=NULL WHERE id=?`).bind(code,ids[i])]),
 db.prepare(`INSERT INTO pool_players(pool_id,name,password_hash,salt) VALUES(${pid},?,?,?)`).bind(code,displayName,hash,salt),
 ...[['commissioner_email',email],['commissioner_phone',String(b.phone||'').slice(0,40)],['commissioner_player_name',displayName]].map(([k,v])=>db.prepare(`INSERT INTO pool_settings(pool_id,key,value) VALUES(${pid},?,?)`).bind(code,k,v)),
 db.prepare(`INSERT INTO pool_sessions(token,pool_id,player_name,role,expires_at) VALUES(?,${pid},?,'admin',?)`).bind(token,code,displayName,sessionExpiry)
 ])}catch(e){await releaseSlots(db,ids);throw e}
 const pool=await db.prepare('SELECT id,code,name FROM pools WHERE code=?').bind(code).first();
 const emailDelivery=await sendPoolEmail(env,email,poolEmail({base:origin,poolName:name,poolCode:code,name:displayName,commissioner:true,games}),'welcome-pool-'+pool.id);
 return {token,playerId:displayName,emailDelivery,pool:{...pool,id:String(pool.id),role:'commissioner',games:games.map(g=>GAMES[g])}};
}
async function changeGame(db,email,b){
 const pool=await ownedPool(db,email,b.pool);if(!pool)throw fail('This pool is not in your verified commissioner account.',403);
 const game=String(b.game||'');if(!GAMES[game])throw fail('Choose a supported game.');
 const existing=await db.prepare('SELECT * FROM links_pool_slots WHERE pool_id=? AND game_type=?').bind(pool.id,game).first();
 if(b.action!=='archive'&&!CREATABLE_GAMES.has(game))throw fail('This game is not available for new pools yet.');
 if(b.action==='archive'){
  if(!existing)throw fail('Game not found.',404);
  await db.batch([db.prepare('UPDATE links_pool_slots SET active=0 WHERE pool_id=? AND game_type=?').bind(pool.id,game),db.prepare('UPDATE pool_active_games SET active=0 WHERE pool_id=? AND game_type=?').bind(pool.id,game)]);return {ok:true};
 }
 if(existing?.active)return {ok:true};const ids=await reserveSlots(db,email,[game]);
 try{const mutations=existing?[
 db.prepare('UPDATE links_pool_slots SET active=1 WHERE id=?').bind(existing.id),db.prepare('DELETE FROM links_pool_slots WHERE id=? AND pool_id IS NULL').bind(ids[0])
 ]:[db.prepare('UPDATE links_pool_slots SET pool_id=?,expires_at=NULL WHERE id=?').bind(pool.id,ids[0])];
 await db.batch([...mutations,db.prepare('INSERT INTO pool_active_games(pool_id,game_type,is_primary,active,added_at) VALUES(?,?,0,1,?) ON CONFLICT(pool_id,game_type) DO UPDATE SET active=1').bind(pool.id,game,now())]);
 }catch(e){await releaseSlots(db,ids);throw e}return {ok:true};
}
export async function onRequest({request,env}){
 const db=env.DB;if(!db)return json({error:'Commissioner account service is unavailable.'},503);
 try{
 await ensureAccounts(db);const q=new URL(request.url).searchParams;
 if(request.method==='GET'){
  const session=await accountSession(request,db);if(!session)return json({error:'Verify your commissioner email to continue.'},401);return json(await snapshot(db,session.email));
 }
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 const b=await request.json();
 if(b.action==='send-code')return json(await verifyStart(request,env,db,b));
 if(b.action==='verify'){const response=json(await verifyFinish(db,b));if(b.remember===false)for(const part of (request.headers.get('cookie')||'').split(';')){const name=part.trim().split('=')[0];if(/^links_home_[a-zA-Z0-9_]+$/.test(name))response.headers.append('Set-Cookie',name+'=; Max-Age=0; Path=/new-build/; HttpOnly; Secure; SameSite=Lax')}return response;}
 const account=await accountSession(request,db);if(!account)throw fail('Verify your commissioner email to continue.',401);
 const email=account.email;
 if(b.action==='choose-free')throw fail('Free host pools are no longer available. Choose a package to activate your games.',402);
 if(b.action==='logout'){await db.prepare('DELETE FROM links_account_sessions WHERE token_hash=?').bind(await digest(request.headers.get('x-links-account'))).run();return json({ok:true})}
 if(b.action==='create')return json(await createPool(db,env,email,b,new URL(request.url).origin,account.expires_at));
 if(['archive','add-game'].includes(b.action))return json(await changeGame(db,email,b));
 if(b.action==='open'){
  const p=await ownedPool(db,email,b.pool);if(!p)throw fail('This pool is not in your verified commissioner account.',403);
  const r=await db.prepare("SELECT value FROM pool_settings WHERE pool_id=? AND key='commissioner_player_name'").bind(p.id).first();if(!r?.value)throw fail('This pool needs its commissioner player name restored before switching.',409);
  const games=(await poolGameKeys(db,p.id)).map(game_type=>({game_type}));
  const token=crypto.randomUUID()+crypto.randomUUID();await db.prepare("INSERT INTO pool_sessions(token,pool_id,player_name,role,expires_at) VALUES(?,?,?,'admin',?)").bind(token,p.id,r.value,account.expires_at).run();return json({token,playerId:r.value,pool:{...p,id:String(p.id),role:'commissioner',games:games.map(g=>GAMES[g.game_type]||g.game_type)}});
 }
 if(b.action==='checkout'){
  const plan=PLANS[b.plan];if(!plan?.amount)throw fail('Choose a paid package.');
  const current=await allowance(db,email);if(current.amount>plan.amount)throw fail('Your current package has more slots. Choose a different package after it expires.');
  const id=crypto.randomUUID(),origin=new URL(request.url).origin;
  const order=await paypal(env,'/v2/checkout/orders',{method:'POST',headers:{'PayPal-Request-Id':id},body:JSON.stringify({intent:'CAPTURE',purchase_units:[{reference_id:id,description:plan.label+' — '+plan.slots+' active game pools, one year',amount:{currency_code:'USD',value:(plan.amount/100).toFixed(2)}}],application_context:{brand_name:'LINKS',user_action:'PAY_NOW',return_url:origin+'/new-build/my-pools.html?purchase='+id,cancel_url:origin+'/new-build/my-pools.html?checkout=canceled'}})});
  const approval=order.links?.find(l=>l.rel==='approve')?.href;if(!order.id||!approval)throw fail('Checkout did not return a payment link.',502);
  await db.prepare("INSERT INTO links_account_purchases(id,email,plan,amount_cents,order_id,status,created_at) VALUES(?,?,?,?,?,'CREATED',?)").bind(id,email,b.plan,plan.amount,order.id,now()).run();return json({url:approval});
 }
 if(b.action==='capture'){
  const p=await db.prepare('SELECT * FROM links_account_purchases WHERE id=? AND email=?').bind(String(b.purchase||''),email).first();if(!p)throw fail('Purchase not found in this account.',404);if(p.status==='PAID')return json({ok:true});
  let order=await paypal(env,'/v2/checkout/orders/'+encodeURIComponent(p.order_id));
  if(order.status!=='COMPLETED')order=await paypal(env,'/v2/checkout/orders/'+encodeURIComponent(p.order_id)+'/capture',{method:'POST',headers:{'PayPal-Request-Id':p.id.slice(0,28)+'-capture'},body:'{}'});
  const unit=order.purchase_units?.[0],capture=unit?.payments?.captures?.[0];if(order.id!==p.order_id||order.status!=='COMPLETED'||unit?.reference_id!==p.id||capture?.status!=='COMPLETED'||capture.amount?.currency_code!=='USD'||Math.round(Number(capture.amount?.value)*100)!==p.amount_cents)throw fail('Payment is not completed or the amount could not be verified.',409);
  const previous=await db.prepare('SELECT * FROM links_account_plans WHERE email=?').bind(email).first();
  const start=previous?.plan===p.plan?Math.max(Date.now(),Date.parse(previous.expires_at)||0):Date.now(),expires=new Date(start+365*864e5).toISOString();
  // A purchase can extend access only once, even if the return button is retried.
  await db.batch([
   db.prepare("INSERT INTO links_account_plans(email,plan,expires_at,purchase_id) SELECT email,plan,?,id FROM links_account_purchases WHERE id=? AND status='CREATED' ON CONFLICT(email) DO UPDATE SET plan=excluded.plan,expires_at=excluded.expires_at,purchase_id=excluded.purchase_id").bind(expires,p.id),
   db.prepare("UPDATE links_account_purchases SET status='PAID',paid_at=?,expires_at=? WHERE id=? AND status='CREATED'").bind(now(),expires,p.id)
  ]);return json({ok:true});
 }
 throw fail('Unsupported account action.');
 }catch(e){return json({error:e.status?e.message:'Commissioner service could not complete the request. Please try again.'},e.status||500)}
}
