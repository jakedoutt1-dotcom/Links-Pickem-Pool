import {ensureParty} from './party-access.js';
// Venue access is deliberately independent from Party Pack and pool entitlements.
import {complimentaryAccess} from './party-grants.js';
export const hostBillingEnabled=env=>env.TRIVIA_HOST_BILLING_ENABLED==='true';
export async function ensureHostBilling(db){await db.batch([
 db.prepare('CREATE TABLE IF NOT EXISTS links_trivia_subscriptions(id TEXT PRIMARY KEY,email TEXT NOT NULL,subscription_id TEXT UNIQUE NOT NULL,status TEXT NOT NULL,created_at TEXT NOT NULL,paid_until TEXT,checked_at TEXT)'),
 db.prepare('CREATE INDEX IF NOT EXISTS links_trivia_sub_email ON links_trivia_subscriptions(email,created_at)')
]);}
export function validateHostPlan(plan){
 const cycles=plan.billing_cycles||[],cycle=cycles[0],price=cycle?.pricing_scheme?.fixed_price;
 return plan.status==='ACTIVE'&&cycles.length===1&&cycle.tenure_type==='REGULAR'&&cycle.frequency?.interval_unit==='MONTH'&&cycle.frequency.interval_count===1&&cycle.total_cycles===0&&price?.currency_code==='USD'&&Number(price.value)===29.99&&Number(plan.payment_preferences?.setup_fee?.value||0)===0&&Number(plan.taxes?.percentage||0)===0;
}
export async function refreshHostSubscription(env,row,paypal){
 const sub=await paypal(env,'/v1/billing/subscriptions/'+encodeURIComponent(row.subscription_id));
 if(sub.id!==row.subscription_id||sub.plan_id!==env.PAYPAL_TRIVIA_MONTHLY_PLAN_ID||sub.custom_id!==row.id)throw Error('Subscription identity does not match.');
 const last=sub.billing_info?.last_payment,next=sub.billing_info?.next_billing_time;
 const confirmed=last?.amount?.currency_code==='USD'&&Number(last.amount.value)===29.99&&Date.parse(last.time)<=Date.now()&&Date.parse(next)>Date.parse(last.time)&&Date.parse(next)-Date.parse(last.time)<=32*86400000;
 let until=row.paid_until||null;
 if(sub.status==='ACTIVE'&&confirmed)until=next;
 // Cancellation keeps the already-paid period; failed/suspended payments never grant time.
 if(!['ACTIVE','CANCELLED'].includes(sub.status))until=null;
 await env.DB.prepare('UPDATE links_trivia_subscriptions SET status=?,paid_until=?,checked_at=? WHERE id=?').bind(sub.status,until,new Date().toISOString(),row.id).run();
 return {status:sub.status,paid_until:until,active:!!until&&Date.parse(until)>Date.now()&&['ACTIVE','CANCELLED'].includes(sub.status)};
}
export async function hostAccess(env,email,paypal){const grant=await complimentaryAccess(env.DB,email,'host');if(grant)return grant;await ensureParty(env.DB);const day=await env.DB.prepare("SELECT expires_at FROM links_party_purchases WHERE email=? AND plan='host_day' AND status='PAID' AND expires_at>? ORDER BY expires_at DESC LIMIT 1").bind(email,new Date().toISOString()).first();if(day)return {active:true,dayPass:true,paid_until:day.expires_at};await ensureHostBilling(env.DB);const rows=(await env.DB.prepare('SELECT * FROM links_trivia_subscriptions WHERE email=? ORDER BY created_at DESC LIMIT 10').bind(email).all()).results||[];for(const row of rows){if(!['ACTIVE','APPROVAL_PENDING','APPROVED','CANCELLED'].includes(row.status))continue;const access=await refreshHostSubscription(env,row,paypal);if(access.active)return access;}return null;}
