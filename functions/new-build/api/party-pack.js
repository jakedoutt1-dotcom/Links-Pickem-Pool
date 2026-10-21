import {FREE_GAME_TESTING,FREE_HOST_GAME_TESTING} from '../../lib/testing-access.js';
import {PARTY_PLANS,partyEnabled,partySession,ensureParty,partyAccess} from '../../lib/party-access.js';
import {hostBillingEnabled,ensureHostBilling,validateHostPlan,refreshHostSubscription,hostAccess} from '../../lib/trivia-host-billing.js';
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function paypal(env,path,options={}){
 if(!env.PAYPAL_CLIENT_ID||!env.PAYPAL_CLIENT_SECRET)throw fail('Checkout is not available yet. Please try again later.',503);
 const base=env.PAYPAL_ENV==='sandbox'?'https://api-m.sandbox.paypal.com':'https://api-m.paypal.com';
 const auth=await fetch(base+'/v1/oauth2/token',{method:'POST',headers:{Authorization:'Basic '+btoa(env.PAYPAL_CLIENT_ID+':'+env.PAYPAL_CLIENT_SECRET),'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials',signal:AbortSignal.timeout(15000)});
 const token=await auth.json();if(!auth.ok||!token.access_token)throw fail('Could not connect to checkout.',502);
 const response=await fetch(base+path,{...options,headers:{Authorization:'Bearer '+token.access_token,'Content-Type':'application/json',Prefer:'return=representation',...options.headers},signal:AbortSignal.timeout(15000)});
 const result=await response.json();if(!response.ok)throw fail('Payment could not be verified. Retry Check payment before buying again.',502);return result;
}
export function validPayment(order,p){const units=order.purchase_units||[],unit=units[0],captures=unit?.payments?.captures||[],capture=captures[0];return units.length===1&&captures.length===1&&order.id===p.order_id&&order.status==='COMPLETED'&&unit.reference_id===p.id&&capture.status==='COMPLETED'&&capture.amount?.currency_code==='USD'&&Number(capture.amount.value).toFixed(2)===(p.amount_cents/100).toFixed(2);}
export async function onRequest({request,env}){try{
 const url=new URL(request.url);if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
 if(request.method==='POST'&&request.headers.get('Origin')!==url.origin)return json({error:'Open Party Pack on LINKS first.'},403);
 if(!env.DB)return json({error:'Party access is temporarily unavailable.'},503);
 const db=env.DB,enabled=partyEnabled(env),session=await partySession(request,db);
 if(request.method==='GET'){
  const access=session?await partyAccess(db,session.email):null;
  const purchases=session?(await db.prepare("SELECT id,plan,status,created_at,expires_at FROM links_party_purchases WHERE email=? ORDER BY CASE WHEN plan='day' AND status='PAID' AND expires_at IS NULL THEN 0 ELSE 1 END,created_at DESC LIMIT 30").bind(session.email).all()).results:[];
  const venueEnabled=hostBillingEnabled(env),venueReady=!FREE_HOST_GAME_TESTING&&venueEnabled&&!!env.PAYPAL_TRIVIA_MONTHLY_PLAN_ID&&!!env.PAYPAL_CLIENT_ID&&!!env.PAYPAL_CLIENT_SECRET;
  const venueAccess=session?await hostAccess(env,session.email,paypal):null;
  const response=json({freeTesting:FREE_GAME_TESTING,hostFreeTesting:FREE_HOST_GAME_TESTING,enabled,checkoutReady:!FREE_GAME_TESTING&&enabled&&!!env.PAYPAL_CLIENT_ID&&!!env.PAYPAL_CLIENT_SECRET,plans:PARTY_PLANS,email:session?.email||null,access,purchases,venueEnabled,venueReady,venueDayReady:!FREE_HOST_GAME_TESTING&&venueEnabled&&!!env.PAYPAL_CLIENT_ID&&!!env.PAYPAL_CLIENT_SECRET,venueAccess});
  const token=request.headers.get('x-links-account');if(session&&/^[a-f0-9-]{72}$/.test(token||''))response.headers.set('Set-Cookie','links_party_session='+token+'; Path=/new-build/; HttpOnly; SameSite=Lax; Max-Age='+Math.max(0,Math.floor((Date.parse(session.expires_at)-Date.now())/1000))+(url.protocol==='https:'?'; Secure':''));
  return response;
 }
 const raw=await request.text();if(raw.length>1500)return json({error:'Request too large.'},413);let b;try{b=JSON.parse(raw)}catch{return json({error:'Invalid request.'},400)}
 if(b.action==='logout'){const response=json({ok:true});response.headers.set('Set-Cookie','links_party_session=; Path=/new-build/; HttpOnly; SameSite=Lax; Max-Age=0'+(url.protocol==='https:'?'; Secure':''));return response;}
 if(!session)throw fail('Verify your email to purchase or restore your Party Pack.',401);
 await ensureParty(db);
 if(b.action==='venue-checkout'){
  if(FREE_HOST_GAME_TESTING)throw fail('Hosted events are free during the promotion. No purchase is needed.',409);
  if(!hostBillingEnabled(env)||!env.PAYPAL_TRIVIA_MONTHLY_PLAN_ID)throw fail('Trivia Night subscriptions open soon.',503);
  await ensureHostBilling(db);
  if(await hostAccess(env,session.email,paypal))throw fail('Your Trivia Night subscription is already active.',409);
  const plan=await paypal(env,'/v1/billing/plans/'+encodeURIComponent(env.PAYPAL_TRIVIA_MONTHLY_PLAN_ID));if(!validateHostPlan(plan))throw fail('The monthly plan must be $29.99 USD with no trial or setup fee. Please contact LINKS.',503);
  const recent=await db.prepare('SELECT COUNT(*) AS n FROM links_trivia_subscriptions WHERE email=? AND created_at>?').bind(session.email,new Date(Date.now()-3600000).toISOString()).first();if(recent.n>=3)throw fail('Check your existing subscription before trying again.',429);
  const id=crypto.randomUUID(),sub=await paypal(env,'/v1/billing/subscriptions',{method:'POST',headers:{'PayPal-Request-Id':id},body:JSON.stringify({plan_id:env.PAYPAL_TRIVIA_MONTHLY_PLAN_ID,custom_id:id,application_context:{brand_name:'LINKS Hosted Events',user_action:'SUBSCRIBE_NOW',return_url:url.origin+'/new-build/trivia-host-pass.html?subscription='+id,cancel_url:url.origin+'/new-build/trivia-host-pass.html?checkout=canceled'}})});
  const approval=sub.links?.find(x=>x.rel==='approve')?.href;if(!sub.id||!approval||!/^https:\/\/(?:www\.)?(?:sandbox\.)?paypal\.com\//.test(approval))throw fail('Subscription approval could not be opened.',502);
  await db.prepare('INSERT INTO links_trivia_subscriptions(id,email,subscription_id,status,created_at) VALUES(?,?,?,?,?)').bind(id,session.email,sub.id,sub.status||'APPROVAL_PENDING',new Date().toISOString()).run();return json({url:approval});
 }
 if(b.action==='venue-verify'){
  await ensureHostBilling(db);const row=await db.prepare('SELECT * FROM links_trivia_subscriptions WHERE id=? AND email=?').bind(String(b.subscription||''),session.email).first();if(!row)throw fail('Subscription not found in this account.',404);
  const access=await refreshHostSubscription(env,row,paypal);if(!access.active)throw fail('Payment is still pending. Check again after PayPal confirms it.',409);return json({ok:true});
 }
 if(b.action==='checkout'){
 if(b.plan==='host_day'?FREE_HOST_GAME_TESTING:FREE_GAME_TESTING)throw fail('Games and hosted events are free during the promotion. No purchase is needed.',409);
  if(b.plan==='host_day'?!hostBillingEnabled(env):!enabled)throw fail('Checkout is not available yet. Please try again later.',503);
  const plan=Object.hasOwn(PARTY_PLANS,b.plan)?PARTY_PLANS[b.plan]:null;if(!plan)throw fail('Choose a Party Pass.');
  if(b.plan==='host_day'){if(await hostAccess(env,session.email,paypal))throw fail('Your hosted event access is already active.',409)}else if(await partyAccess(db,session.email))throw fail('You already have active game access. Enjoy your games!',409);
  if(b.plan==='day'&&await db.prepare("SELECT id FROM links_party_purchases WHERE email=? AND plan='day' AND status='PAID' AND expires_at IS NULL LIMIT 1").bind(session.email).first())throw fail('You already have a pass ready to activate.',409);
  const recent=await db.prepare("SELECT COUNT(*) AS n FROM links_party_purchases WHERE email=? AND created_at>?").bind(session.email,new Date(Date.now()-3600000).toISOString()).first();if(recent.n>=5)throw fail('Check your existing payment or try again in an hour.',429);
  const id=crypto.randomUUID(),order=await paypal(env,'/v2/checkout/orders',{method:'POST',headers:{'PayPal-Request-Id':id},body:JSON.stringify({intent:'CAPTURE',purchase_units:[{reference_id:id,description:'LINKS '+plan.label+' — '+(plan.hours===24?'24 hours':'365 days')+', one-time payment',amount:{currency_code:'USD',value:(plan.amount/100).toFixed(2)}}],application_context:{brand_name:'LINKS',user_action:'PAY_NOW',return_url:url.origin+'/new-build/'+(b.plan==='host_day'?'trivia-host-pass.html':'party-pack.html')+'?purchase='+id,cancel_url:url.origin+'/new-build/'+(b.plan==='host_day'?'trivia-host-pass.html':'party-pack.html')+'?checkout=canceled'}})});
  const approval=order.links?.find(x=>x.rel==='approve')?.href;if(!order.id||!approval||!/^https:\/\/(?:www\.)?(?:sandbox\.)?paypal\.com\//.test(approval))throw fail('Checkout did not return a valid payment link.',502);
  await db.prepare("INSERT INTO links_party_purchases(id,email,plan,amount_cents,order_id,status,created_at) VALUES(?,?,?,?,?,'CREATED',?)").bind(id,session.email,b.plan,plan.amount,order.id,new Date().toISOString()).run();return json({url:approval});
 }
 if(b.action==='capture'){
  const p=await db.prepare('SELECT * FROM links_party_purchases WHERE id=? AND email=?').bind(String(b.purchase||''),session.email).first();if(!p)throw fail('Payment not found in this account.',404);if(p.status==='PAID')return json({ok:true});
  let order=await paypal(env,'/v2/checkout/orders/'+encodeURIComponent(p.order_id));if(order.status!=='COMPLETED')order=await paypal(env,'/v2/checkout/orders/'+encodeURIComponent(p.order_id)+'/capture',{method:'POST',headers:{'PayPal-Request-Id':p.id.slice(0,28)+'-capture'},body:'{}'});
  if(!validPayment(order,p))throw fail('Payment is not complete or the amount does not match.',409);
  const now=Date.now(),expires=p.plan==='day'?null:new Date(now+PARTY_PLANS[p.plan].hours*3600000).toISOString();
  await db.prepare("UPDATE links_party_purchases SET status='PAID',paid_at=?,expires_at=? WHERE id=? AND status='CREATED'").bind(new Date(now).toISOString(),expires,p.id).run();return json({ok:true});
 }
 if(b.action==='activate'){
  if(await partyAccess(db,session.email))throw fail('Your game access is already active.',409);
  const now=Date.now(),expires=new Date(now+86400000).toISOString();
  const result=await db.prepare("UPDATE links_party_purchases SET expires_at=? WHERE id=? AND email=? AND plan='day' AND status='PAID' AND expires_at IS NULL").bind(expires,String(b.purchase||''),session.email).run();
  if(!result.meta?.changes)throw fail('This pass is not available to activate. Refresh your access.',409);
  return json({ok:true,expires_at:expires});
 }
 throw fail('Unsupported action.');
 }catch(e){return json({error:e.status?e.message:'Party Pack could not complete the request. Please try again.'},e.status||500)}
}
