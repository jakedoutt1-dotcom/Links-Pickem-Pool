const $=id=>document.getElementById(id),key='links-account-token',query=new URLSearchParams(location.search),games=new Set(['trivia-rally.html','million-point.html','dead-air.html','say-what.html','last-alibi.html','captain-clash.html','friend-challenge.html','trivia-night.html']);
let state=null,busy=false,chosen='',email='';
if(games.has(query.get('next')))sessionStorage.setItem('links-party-next',query.get('next'));
const date=value=>new Date(value).toLocaleString();
async function api(body,endpoint='party-pack'){
 const r=await fetch('./api/'+endpoint,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','x-links-account':localStorage.getItem(key)||''},cache:'no-store',signal:AbortSignal.timeout(15000),...(body?{body:JSON.stringify(body)}:{})});let j;try{j=await r.json()}catch{throw Error('Could not reach LINKS. Please try again.')}
 if(!r.ok)throw Error(j.error||'Unable to complete that request.');return j;
}
function message(text){$('status').textContent=text;}
async function run(task){if(busy)return;busy=true;document.querySelectorAll('#account button,[data-plan],#venueBuy').forEach(b=>b.disabled=true);try{await task()}catch(e){message(e.message);$('status').scrollIntoView({block:'center',behavior:'smooth'})}finally{busy=false;render();}}
function render(){
 const signed=!!state?.email,active=!!state?.access;
 $('emailForm').hidden=signed;$('codeForm').hidden=signed||!email;$('access').hidden=!signed;$('accountTitle').textContent=signed?'Your LINKS access':'Verify your email';
 $('accessText').textContent=signed?state.email+(active?' · Party Pack active until '+date(state.access.expires_at):' · Choose a pass to host. Guests join free.'):'';
 const next=sessionStorage.getItem('links-party-next');$('play').href=active&&games.has(next)&&next!=='trivia-night.html'?'./'+next:'./party-room.html#partyGames';$('play').hidden=!active&&!state?.enabled;
 $('launch').textContent=!state?'Unable to check availability. Refresh to try again.':state.enabled?'Only the room creator buys access. Guests join free.':'A paid pass is required to host. Checkout is temporarily unavailable. Guests with an invitation can still join.';
 document.querySelectorAll('[data-plan]').forEach(b=>b.disabled=busy||!state?.checkoutReady||active);
 document.querySelectorAll('#account button').forEach(b=>b.disabled=busy);
 $('venueBuy').disabled=busy||!state?.venueReady||!!state?.venueAccess;
 $('venueStatus').textContent=state?.venueAccess?'Subscribed · Paid through '+date(state.venueAccess.paid_until):state?.venueReady?'$29.99 USD billed monthly. Renews automatically until canceled. One active room per host account. Cancel in PayPal.':'Monthly subscriptions open soon. Hosted Trivia Night is separate from the Party Pack.';
 $('receipts').replaceChildren();for(const p of state?.purchases||[]){const row=document.createElement('p');row.textContent=(p.plan==='host_day'?'Trivia Night Day Pass':p.plan==='day'?'Party Pass':'Annual Party Pack')+' · '+(p.status==='PAID'?'Paid · access through '+date(p.expires_at):'Awaiting payment confirmation');if(p.status==='CREATED'){const b=document.createElement('button');b.textContent='Check payment';b.onclick=()=>run(async()=>{await api({action:'capture',purchase:p.id});await refresh();message('Payment confirmed. Your pass is ready.');});row.append(b)}$('receipts').append(row)}
}
async function refresh(){state=await api();render();}
async function finish(){const purchase=query.get('purchase'),subscription=query.get('subscription');if(!state?.email||(!purchase&&!subscription))return;if(purchase)await api({action:'capture',purchase});else await api({action:'venue-verify',subscription});query.delete('purchase');query.delete('subscription');history.replaceState(null,'',location.pathname+(query.size?'?'+query:'')+'#account');await refresh();message('Payment confirmed. You are ready to play.');}
async function purchase(plan){if(!state?.email){chosen=plan;message('First verify your email so you can restore your purchase on any device.');$('account').scrollIntoView({behavior:'smooth'});$('email').focus({preventScroll:true});return}const result=await api(plan==='venue'?{action:'venue-checkout'}:{action:'checkout',plan});location.assign(result.url);}
document.querySelectorAll('[data-plan]').forEach(b=>b.onclick=()=>run(()=>purchase(b.dataset.plan)));$('venueBuy').onclick=()=>run(()=>purchase('venue'));
document.getElementById('emailForm').onsubmit=e=>{e.preventDefault();run(async()=>{const response=await api({action:'send-code',email:$('email').value},'account');email=response.email;message('Check your email for the eight-digit code.');render();$('code').focus();})};
$('codeForm').onsubmit=e=>{e.preventDefault();run(async()=>{const j=await api({action:'verify',email,code:$('code').value,remember:true},'account');localStorage.setItem(key,j.token);await refresh();await finish();message(chosen?'Email verified. Choose your pass again to continue to PayPal.':'Email verified. Your existing access is shown here.');chosen='';})};
$('signout').onclick=()=>run(async()=>{await api({action:'logout'});localStorage.removeItem(key);email='';$('code').value='';await refresh();message('Enter the email used for your purchase.');});
if(query.get('checkout')==='canceled')message('Checkout canceled. No new access was activated.');
await run(async()=>{await refresh();await finish();});
