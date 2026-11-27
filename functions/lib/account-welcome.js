import {sendPoolEmail,escapeEmail,emailConfig} from './pool-email.js';
export function accountWelcome(account){
 const base='https://linkspickempools.com/new-build/',name=String(account.display_name||account.displayName||'there'),username=String(account.username||'');
 const sections=[
  ['Your Locker Room','Find your pools, make picks, follow scores and standings, and get back to your games from one place.',base+'control-center.html','Open my Locker Room'],
  ['Connect pools you already belong to','In your Locker Room, choose Connect My Pools. Select the pools you want to connect and confirm your existing pool login when asked. One LINKS account gives you access to all the pools you connect. Each pool keeps its own players, picks, history and commissioner roles—connecting does not combine the pools.',base+'links-login.html?find=1','Connect my pools'],
  ['Join the free LINKS Playoff Challenge','Enter your own college playoff bracket and compete with everyone in one LINKS-hosted pool. A LINKS account is required; joining unlocks picks automatically. Official teams appear when the field is set. Pick every round and your championship total, then choose Lock in my picks. You can edit until the first playoff kickoff.',base+'cfp.html?event=links','Join the LINKS Challenge'],
  ['Run a pool for your own crew','Create a separate pool, choose your games, and invite friends with a link or QR code. NFL Pick’em, College Playoff Pick’em, March Madness, hockey, squares and other pool games are available. Commissioners manage their own pool and player access.',base+'create-pool.html','Create a pool'],
  ['Visit the Game Room','Play free daily challenges, basketball, trivia and other games. Come back for fresh challenges and see how your scores compare.',base+'game-room.html','Explore the Game Room']
 ];
 const intro='Your account is verified and ready. Sign in with your LINKS username'+(username?' ('+username+')':'')+' or email. Your password stays private.';
 const text='Welcome to LINKS, '+name+'!\n\n'+intro+'\n\n'+sections.map(([title,body,url,label])=>title+'\n'+body+'\n'+label+': '+url).join('\n\n')+'\n\nNeed help? Open Login help & feedback in your Locker Room.\nLINKS — Picks. Pools. People.';
 const html='<!doctype html><html><body style="margin:0;background:#e9eef2;font-family:Arial,Helvetica,sans-serif;color:#233847"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff"><tr><td style="padding:28px;background:#0b1b29;text-align:center"><img src="https://linkspickempools.com/links-small-logo.png" alt="LINKS" width="140" style="display:block;margin:0 auto;width:140px;height:auto"><h1 style="margin:24px 0 10px;color:#f3d58b;font-size:28px;line-height:1.2">Welcome to LINKS, '+escapeEmail(name)+'!</h1><p style="color:#edf3f7;font-size:16px;line-height:1.6;margin:0">Your pools. Your games. Your people.</p></td></tr><tr><td style="padding:24px 28px"><p style="font-size:16px;line-height:1.7;margin:0 0 24px">'+escapeEmail(intro)+'</p>'+sections.map(([title,body,url,label])=>'<h2 style="font-size:20px;color:#102b40;margin:26px 0 10px">'+escapeEmail(title)+'</h2><p style="font-size:15px;line-height:1.7;margin:0 0 14px">'+escapeEmail(body)+'</p><p style="margin:0 0 24px"><a href="'+url+'" style="display:inline-block;padding:12px 18px;background:#e9c574;color:#102333;border-radius:7px;font-weight:bold;text-decoration:none">'+label+' →</a></p>').join('')+'</td></tr><tr><td style="padding:22px 28px;background:#e9eef2;font-size:13px;line-height:1.7">Need help? Open <strong>Login help &amp; feedback</strong> in your Locker Room.<br>LINKS · PICKS. POOLS. PEOPLE.</td></tr></table></td></tr></table></body></html>';
 return {subject:'Welcome to LINKS — your pools, games and people',text,html};
}
export async function sendAccountWelcome(env,account){try{
 const db=env.DB;await db.prepare("CREATE TABLE IF NOT EXISTS links_account_welcome(account_id TEXT PRIMARY KEY,status TEXT NOT NULL,updated_at INTEGER NOT NULL,message_id TEXT)").run();
 await db.prepare("INSERT OR IGNORE INTO links_account_welcome VALUES(?,'PENDING',?,NULL)").bind(account.id,Date.now()).run();
 const row=await db.prepare('SELECT status FROM links_account_welcome WHERE account_id=?').bind(account.id).first();if(row?.status==='SENT')return {sent:true,alreadySent:true};
 const claimed=await db.prepare("UPDATE links_account_welcome SET status='SENDING',updated_at=? WHERE account_id=? AND status<>'SENT' AND (status<>'SENDING' OR updated_at<?)").bind(Date.now(),account.id,Date.now()-600000).run();if(!claimed.meta?.changes)return {sent:false,pending:true};
 const delivery=await sendPoolEmail(env,account.email,accountWelcome(account),'links-account-welcome-'+account.id);
 await db.prepare('UPDATE links_account_welcome SET status=?,updated_at=?,message_id=? WHERE account_id=?').bind(delivery.sent?'SENT':'PENDING',Date.now(),delivery.id||null,account.id).run();
 return {sent:delivery.sent};
 }catch{return {sent:false,pending:true}}}
export async function queueAccountWelcome(context,account){const job=sendAccountWelcome(context.env,account);if(context.waitUntil)context.waitUntil(job);else await job;}
export async function welcomeDeliveryStatus(env,account){
 const row=await env.DB.prepare('SELECT status,message_id,updated_at FROM links_account_welcome WHERE account_id=?').bind(account.id).first();
 if(!row)return {state:'not_sent',providerStatusAvailable:false};
 const accepted={state:row.status==='SENT'?'accepted':row.status.toLowerCase(),providerStatusAvailable:false};
 if(!row.message_id)return accepted;
 const cfg=emailConfig(env);if(!cfg.key)return accepted;
 try{
  const r=await fetch('https://api.resend.com/emails/'+encodeURIComponent(row.message_id),{headers:{Authorization:'Bearer '+cfg.key},signal:AbortSignal.timeout(10000)});
  if(!r.ok)return {...accepted,reason:r.status===403?'delivery_lookup_not_permitted':'provider_lookup_unavailable'};
  const email=await r.json();if(!(email.to||[]).some(to=>String(to).toLowerCase()===String(account.email).toLowerCase()))return {...accepted,reason:'recipient_mismatch'};
  return {state:email.last_event||'accepted',providerStatusAvailable:true,from:email.from||'',createdAt:email.created_at||''};
 }catch{return {...accepted,reason:'provider_lookup_unavailable'}}
}
