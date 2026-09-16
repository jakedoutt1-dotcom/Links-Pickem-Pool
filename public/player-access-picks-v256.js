(()=>{
'use strict';
let busy=false,last=0,statusByName={};
const norm=s=>String(s||'').trim().toLowerCase();
async function load(){
 if(busy||Date.now()-last<4000)return;
 busy=true;last=Date.now();
 try{
  const u=typeof q==='function'?q('/api/player-status-v246'):'/api/player-status-v246';
  const r=await fetch(u,{credentials:'same-origin',cache:'no-store'});
  if(!r.ok)throw 0;
  const d=await r.json();
  statusByName={};
  (Array.isArray(d?.players)?d.players:[]).forEach(p=>statusByName[norm(p.name)]=!!p.picksLocked);
 }catch(e){}
 busy=false;
 paint();
}
function paint(){
 const pane=document.getElementById('paid'),body=document.getElementById('paidBody');
 if(!pane||!body||pane.classList.contains('hide'))return;
 [...body.children].forEach(row=>{
  if(!row.classList.contains('pay-status'))return;
  const name=norm(row.querySelector('b')?.textContent);
  if(!name)return;
  let s=row.querySelector('.links-picks-status-v256');
  if(!s){
   s=document.createElement('span');s.className='links-picks-status-v256';
   const existing=row.lastElementChild;
   if(existing){
    let wrap=row.querySelector('.links-access-picks-v256');
    if(!wrap){wrap=document.createElement('span');wrap.className='links-access-picks-v256';row.insertBefore(wrap,existing);wrap.appendChild(existing)}
    wrap.appendChild(s);
   }else row.appendChild(s);
  }
  const locked=!!statusByName[name];
  s.textContent=locked?'✅ PICKS LOCKED':'⬜ PICKS NOT LOCKED';
  s.classList.toggle('locked',locked);
 });
}
function tick(){const p=document.getElementById('paid');if(p&&!p.classList.contains('hide')){paint();load()}}
const start=()=>{tick();document.addEventListener('click',()=>setTimeout(tick,100),true);setInterval(tick,1200)};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();