import qrcode from './vendor/qrcode.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const hostedMode=new URLSearchParams(location.search).get('event')==='links';
export const hostedAdmin=hostedMode&&new URLSearchParams(location.search).get('admin')==='1';
export function eventHeaders(){return {'Content-Type':'application/json','x-links-account':localStorage.getItem('links-account-token')||'',...(hostedAdmin?{Authorization:'Bearer '+(sessionStorage.getItem('links-owner-admin-token')||'')}:{})};}
async function eventApi(body){const r=await fetch('./api/hosted-cfp',{method:body?'POST':'GET',headers:eventHeaders(),cache:'no-store',signal:AbortSignal.timeout(20000),...(body?{body:JSON.stringify(body)}:{})}),j=await r.json();if(!r.ok)throw Error(j.error||'Event unavailable.');return j;}
export function shareHostedEvent(){
 const url=new URL('./cfp.html?event=links',location.href).href,d=document.createElement('dialog');d.className='hosted-event-share';
 d.innerHTML='<h2>Share the LINKS playoff challenge</h2><div data-qr></div><input aria-label="Event link" readonly><div><button data-copy>Copy link</button> <button data-share>Share event</button> <button data-close>Close</button></div><p role="status"></p>';
 d.querySelector('input').value=url;const qr=qrcode(0,'M');qr.addData(url);qr.make();d.querySelector('[data-qr]').innerHTML=qr.createSvgTag({scalable:true,cellSize:5,margin:20});d.querySelector('svg').setAttribute('aria-label','Scan to join the LINKS playoff challenge');
 d.querySelector('[data-copy]').onclick=async()=>{try{await navigator.clipboard.writeText(url);d.querySelector('[role=status]').textContent='Event link copied.'}catch{d.querySelector('input').select();d.querySelector('[role=status]').textContent='Copy the selected link.'}};
 d.querySelector('[data-share]').onclick=async()=>{try{if(navigator.share)await navigator.share({title:'LINKS College Playoff Challenge',text:'Join the free LINKS College Playoff Challenge. Create your account and pick your bracket!',url});else await d.querySelector('[data-copy]').onclick()}catch(e){if(e.name!=='AbortError')d.querySelector('[role=status]').textContent='Use Copy link to share.'}};
 d.querySelector('[data-close]').onclick=()=>d.close();d.onclose=()=>d.remove();document.body.append(d);d.showModal();
}
export async function mountHostedEvent(root,onReady){
 const workspace=document.querySelector('.workspace');workspace.hidden=true;
 const hero=document.querySelector('.cfp-hero');
 if(hero&&!document.getElementById('shareChallengeTop')){
  const bar=document.createElement('div');bar.className='cfp-challenge-share';
  const button=document.createElement('button');button.id='shareChallengeTop';button.type='button';button.textContent='Share the LINKS challenge';button.onclick=shareHostedEvent;
  bar.append(button);hero.after(bar);
 }

 if(hero&&!hero.querySelector('.cfp-presenting-sponsor')){
  const sponsor=document.createElement('div');sponsor.className='cfp-presenting-sponsor';sponsor.setAttribute('aria-label','Presenting sponsor');
  sponsor.innerHTML='<div class="cfp-presenting-logo" aria-label="Space reserved for presenting sponsor logo"><span>Sponsor logo</span></div><div><span class="cfp-presented-by">Presented by</span><strong>Will be announced soon</strong></div>';
  hero.append(sponsor);
 }

 let recognition=document.getElementById('hostedEventRecognition');
 if(!recognition){
  recognition=document.createElement('section');recognition.id='hostedEventRecognition';recognition.className='cfp-event-recognition';recognition.setAttribute('aria-label','Challenge prizes and sponsors');
  recognition.innerHTML='<section aria-labelledby="challengePrizesTitle"><h2 id="challengePrizesTitle">Top 3 prizes</h2><p>Prizes will be announced soon.</p><ol class="cfp-prize-grid"><li><span class="cfp-prize-place">1st place</span><strong>Will be announced soon</strong></li><li><span class="cfp-prize-place">2nd place</span><strong>Will be announced soon</strong></li><li><span class="cfp-prize-place">3rd place</span><strong>Will be announced soon</strong></li></ol></section><section aria-labelledby="challengeSponsorsTitle"><h2 id="challengeSponsorsTitle">Challenge sponsors</h2><div class="cfp-sponsor-placeholder"><strong>Sponsors will be announced soon</strong><p></p></div></section>';
  workspace.after(recognition);
 }

 async function refresh(body){
  const j=await eventApi(body);
  root.innerHTML='<h2>LINKS College Playoff Challenge</h2><p>Free to join with a LINKS account.</p><p>'+'<span data-event-count>'+j.participants+'</span> joined'+(j.event?' · '+j.season+'–'+String(j.season+1).slice(-2):' · Opening soon')+'</p><div class="hosted-event-actions">'+
   (!j.signedIn&&!j.admin?'<a class="action" href="./links-login.html?next=cfp-event">Sign in</a><a class="action" href="./links-login.html?next=cfp-event&amp;signup=1">Create account</a>':'')+
   (j.admin&&!j.event?'<button data-publish>Open this season’s LINKS event</button>':'')+
   (j.event&&j.signedIn&&!j.joined&&!j.admin?'<button data-join>Join free event</button>':'')+
   (j.joined?'<strong>You’ve joined.</strong>':'')+
   (j.event?'<button data-share-event>Share event & QR</button>':'')+
   (hostedAdmin&&!j.admin?'<a href="./links-admin.html">Sign in to LINKS Owner Admin</a>':'')+'</div><p role="status" data-event-status></p>';
  root.querySelector('[data-share-event]')?.addEventListener('click',shareHostedEvent);
  for(const [selector,action] of [['[data-publish]','publish'],['[data-join]','join']])root.querySelector(selector)?.addEventListener('click',async()=>{root.querySelectorAll('button').forEach(b=>b.disabled=true);try{await refresh({action})}catch(e){root.querySelector('[data-event-status]').textContent=e.message;root.querySelectorAll('button').forEach(b=>b.disabled=false)}});
  const entered=!!(j.event&&(j.joined||j.admin));root.classList.toggle('hosted-event-compact',entered);
  if(entered){workspace.hidden=false;workspace.after(root);await onReady(j.event,j.admin)}
 }
 clearInterval(root._eventCountTimer);root._eventCountTimer=setInterval(()=>{if(!document.hidden)void eventApi().then(j=>{const count=root.querySelector('[data-event-count]');if(count)count.textContent=j.participants}).catch(()=>{})},30000);window.addEventListener('pagehide',e=>{if(!e.persisted)clearInterval(root._eventCountTimer)},{once:true});
 try{await refresh()}catch(e){root.textContent=e.message;const retry=document.createElement('button');retry.textContent='Try again';retry.onclick=()=>mountHostedEvent(root,onReady);root.append(retry)}
}
