/* LINKS v801 — one weekly hard deadline; player lock/unlock is voluntary before it. */
(()=>{
'use strict';
if(!/\/nfl(?:\.html)?$/i.test(location.pathname))return;
const qp=()=>new URLSearchParams(location.search);
const pool=()=>{try{const p=JSON.parse(localStorage.getItem('links-current-pool')||'null')||{};return qp().get('pool')||p.id||p.poolId||p.pool_id||''}catch{return qp().get('pool')||''}};
const wk=()=>Number(document.getElementById('weekSelect')?.value||qp().get('week')||1);
let hardDeadline=0, commissionerOverride=false, busy=false;
async function getDeadline(){if(busy)return;busy=true;try{const p=pool(),w=wk();let override=0;if(p){try{const r=await fetch('./api/game-settings?pool='+encodeURIComponent(p)+'&game='+encodeURIComponent('NFL Pick’em')+'&period='+encodeURIComponent(String(w))+'&week='+w+'&_='+Date.now(),{cache:'no-store'});if(r.ok){const j=await r.json(),s=j.settings||j.setting||j,v=s?.lockAt||s?.lock_at||'';if(v&&Number.isFinite(Date.parse(v)))override=Date.parse(v)}}catch{}}
commissionerOverride=override>Date.now();if(override){hardDeadline=override}else{const ts=(typeof games!=='undefined'?games:[]).map(e=>Date.parse(e.date)).filter(Number.isFinite).sort((a,b)=>a-b);hardDeadline=ts[0]||0}apply()}finally{busy=false}}
function beforeDeadline(){return !!hardDeadline&&Date.now()<hardDeadline}
function playerEditing(){const b=document.getElementById('savePicksBtn');return !!b&&/LOCK MY PICKS/i.test(b.textContent||'')&&!/UNLOCK/i.test(b.textContent||'')}
function apply(){const open=beforeDeadline();if(commissionerOverride&&open){try{historicalView=false;document.body.classList.remove('history-mode')}catch{}const save=document.getElementById('saveBar'),tie=document.getElementById('tieBreaker');if(save)save.style.display='';if(tie)tie.style.display=''}
if(!open)return;
if(playerEditing()){
 document.querySelectorAll('#slate button.game-team').forEach(b=>{b.disabled=false;b.removeAttribute('disabled');b.setAttribute('aria-disabled','false')});
 document.querySelectorAll('#slate .game-state').forEach(s=>s.textContent='OPEN');
 const ti=document.getElementById('tieTotal');if(ti){ti.disabled=false;ti.removeAttribute('disabled');ti.setAttribute('aria-disabled','false')}
 }
}
function afterPlayerAction(){setTimeout(()=>{apply();setTimeout(apply,50);setTimeout(apply,250)},0)}
function boot(){
 const save=document.getElementById('savePicksBtn');if(save)save.addEventListener('click',afterPlayerAction);
 document.getElementById('weekSelect')?.addEventListener('change',()=>setTimeout(getDeadline,100));document.getElementById('prevWeek')?.addEventListener('click',()=>setTimeout(getDeadline,180));document.getElementById('nextWeek')?.addEventListener('click',()=>setTimeout(getDeadline,180));
 const slate=document.getElementById('slate');if(slate)new MutationObserver(()=>apply()).observe(slate,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled']});
 getDeadline();setInterval(()=>{if(hardDeadline&&Date.now()>=hardDeadline){location.reload();return}apply()},500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();