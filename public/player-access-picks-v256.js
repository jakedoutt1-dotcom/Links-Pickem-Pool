(()=>{
'use strict';
let busy=false,last=0,statusByName={},contactsByName={};
const norm=s=>String(s||'').trim().toLowerCase();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function apiUrl(path){return typeof q==='function'?q(path):path}
async function load(){
 if(busy||Date.now()-last<4000)return;
 busy=true;last=Date.now();
 try{
  const r=await fetch(apiUrl('/api/player-status-v246'),{credentials:'same-origin',cache:'no-store'});
  if(r.ok){const d=await r.json();statusByName={};(Array.isArray(d?.players)?d.players:[]).forEach(p=>statusByName[norm(p.name)]=!!p.picksLocked)}
  const ar=await fetch(apiUrl('/api/admin'),{credentials:'same-origin',cache:'no-store'});
  if(ar.ok){const a=await ar.json();contactsByName={};Object.entries(a.playerContacts||{}).forEach(([n,v])=>contactsByName[norm(n)]={email:v?.email||'',phone:v?.phone||''})}
 }catch(e){}
 busy=false;paint();
}
function ensureModal(){
 let m=document.getElementById('linksProfileModalV257');if(m)return m;
 m=document.createElement('div');m.id='linksProfileModalV257';m.className='links-profile-overlay-v257 hide';
 m.innerHTML=`<div class="links-profile-modal-v257" role="dialog" aria-modal="true" aria-labelledby="linksProfileTitleV257"><button type="button" class="links-profile-close-v257" aria-label="Close">×</button><h3 id="linksProfileTitleV257">PLAYER PROFILE</h3><label>Name<input id="linksProfileNameV257" readonly></label><label>Email<input id="linksProfileEmailV257" type="email" autocomplete="email" placeholder="player@email.com"></label><label>Phone Number<input id="linksProfilePhoneV257" type="tel" autocomplete="tel" placeholder="(615) 555-1234"></label><div class="links-profile-actions-v257"><button type="button" id="linksProfileSaveV257">SAVE PROFILE</button><a id="linksProfileEmailBtnV257" class="links-profile-link-v257" href="#">✉️ EMAIL</a><a id="linksProfileTextBtnV257" class="links-profile-link-v257" href="#">💬 TEXT</a></div><div id="linksProfileMsgV257" class="small"></div></div>`;
 document.body.appendChild(m);
 m.querySelector('.links-profile-close-v257').onclick=()=>m.classList.add('hide');
 m.onclick=e=>{if(e.target===m)m.classList.add('hide')};
 return m;
}
function links(m){
 const email=m.querySelector('#linksProfileEmailV257').value.trim(),phone=m.querySelector('#linksProfilePhoneV257').value.trim();
 const eb=m.querySelector('#linksProfileEmailBtnV257'),tb=m.querySelector('#linksProfileTextBtnV257');
 eb.href=email?'mailto:'+encodeURIComponent(email):'#';eb.classList.toggle('disabled',!email);
 tb.href=phone?'sms:'+phone.replace(/[^+\d]/g,''):'#';tb.classList.toggle('disabled',!phone);
}
function openProfile(name){
 const m=ensureModal(),c=contactsByName[norm(name)]||{email:'',phone:''};m.dataset.player=name;
 m.querySelector('#linksProfileNameV257').value=name;m.querySelector('#linksProfileEmailV257').value=c.email;m.querySelector('#linksProfilePhoneV257').value=c.phone;m.querySelector('#linksProfileMsgV257').textContent='';
 links(m);m.classList.remove('hide');
 m.querySelector('#linksProfileEmailV257').oninput=()=>links(m);m.querySelector('#linksProfilePhoneV257').oninput=()=>links(m);
 m.querySelector('#linksProfileSaveV257').onclick=async()=>{
  const email=m.querySelector('#linksProfileEmailV257').value.trim(),phone=m.querySelector('#linksProfilePhoneV257').value.trim(),msg=m.querySelector('#linksProfileMsgV257'),btn=m.querySelector('#linksProfileSaveV257');
  btn.disabled=true;msg.textContent='Saving…';
  try{const r=await fetch(apiUrl('/api/admin/player-contact'),{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({player:name,email,phone})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not save profile.');contactsByName[norm(name)]={email:d.email||email,phone:d.phone||phone};msg.textContent='✓ Profile saved.';links(m)}catch(e){msg.textContent=e.message||'Could not save profile.'}finally{btn.disabled=false}
 };
}
function paint(){
 const pane=document.getElementById('paid'),body=document.getElementById('paidBody');if(!pane||!body||pane.classList.contains('hide'))return;
 [...body.children].forEach(row=>{
  if(!row.classList.contains('pay-status'))return;const nameText=row.querySelector('b')?.textContent?.trim(),name=norm(nameText);if(!name)return;
  let nameWrap=row.querySelector('.links-player-name-v257');
  if(!nameWrap){const b=row.querySelector('b');if(b){nameWrap=document.createElement('span');nameWrap.className='links-player-name-v257';b.parentNode.insertBefore(nameWrap,b);nameWrap.appendChild(b);const pb=document.createElement('button');pb.type='button';pb.className='links-profile-btn-v257';pb.textContent='PROFILE';pb.onclick=e=>{e.preventDefault();e.stopPropagation();openProfile(nameText)};nameWrap.appendChild(pb)}}
  let s=row.querySelector('.links-picks-status-v256');if(!s){s=document.createElement('span');s.className='links-picks-status-v256';const existing=row.lastElementChild;if(existing){let wrap=row.querySelector('.links-access-picks-v256');if(!wrap){wrap=document.createElement('span');wrap.className='links-access-picks-v256';row.insertBefore(wrap,existing);wrap.appendChild(existing)}wrap.appendChild(s)}else row.appendChild(s)}
  const locked=!!statusByName[name];s.textContent=locked?'✅ PICKS LOCKED':'⬜ PICKS NOT LOCKED';s.classList.toggle('locked',locked);
 });
}
function tick(){const p=document.getElementById('paid');if(p&&!p.classList.contains('hide')){paint();load()}}
const start=()=>{ensureModal();tick();document.addEventListener('click',()=>setTimeout(tick,100),true);setInterval(tick,1200)};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();