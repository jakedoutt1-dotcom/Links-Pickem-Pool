(()=>{
'use strict';
function label(el,text,cls){if(!el)return;el.classList.add(cls);let lab=el.querySelector(':scope > .links-status-row-label-current');if(!lab){lab=document.createElement('span');lab.className='links-status-row-label-current';el.insertBefore(lab,el.firstChild)}lab.textContent=text;}
function paint(){const body=document.getElementById('paidBody');if(!body)return;body.querySelectorAll('.pay-status').forEach(row=>{if(!row.querySelector('b'))return;const wrap=row.querySelector('.links-access-picks-v256');if(!wrap)return;const picks=wrap.querySelector('.links-picks-status-v256');const access=[...wrap.children].find(x=>x!==picks);label(access,'PLAYER ACCESS:','links-access-status-row-current');label(picks,'PICK STATUS:','links-pick-status-row-current')})}
const start=()=>{paint();new MutationObserver(()=>requestAnimationFrame(paint)).observe(document.body,{childList:true,subtree:true,characterData:true});setInterval(paint,700)};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();