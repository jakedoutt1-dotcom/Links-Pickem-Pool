/* LINKS v800 — commissioner correction window. Does not load or rewrite picks. */
(()=>{
'use strict';
if(!/\/nfl(?:\.html)?$/i.test(location.pathname))return;
const qp=()=>new URLSearchParams(location.search);
const pool=()=>{try{const p=JSON.parse(localStorage.getItem('links-current-pool')||'null')||{};return qp().get('pool')||p.id||p.poolId||p.pool_id||''}catch{return qp().get('pool')||''}};
const week=()=>Number(document.getElementById('weekSelect')?.value||qp().get('week')||1);
let deadline=0,active=false,busy=false;
async function readDeadline(){if(busy)return;busy=true;try{const p=pool(),w=week();if(!p){active=false;deadline=0;return}const u='./api/game-settings?pool='+encodeURIComponent(p)+'&game='+encodeURIComponent('NFL Pick’em')+'&period='+encodeURIComponent(String(w))+'&week='+w+'&_='+Date.now();const r=await fetch(u,{cache:'no-store'});if(!r.ok){active=false;deadline=0;return}const j=await r.json(),s=j.settings||j.setting||j,v=s?.lockAt||s?.lock_at||'';deadline=v&&Number.isFinite(Date.parse(v))?Date.parse(v):0;active=deadline>Date.now()}catch{active=false;deadline=0}finally{busy=false;apply()}}
function cardUnlocked(){const b=document.getElementById('savePicksBtn');return !!b&&/LOCK MY PICKS/i.test(b.textContent||'')&&!/UNLOCK/i.test(b.textContent||'')}
function apply(){if(!active||deadline<=Date.now()||!cardUnlocked())return;document.querySelectorAll('#slate button.game-team[data-g]').forEach(b=>{b.disabled=false;b.removeAttribute('disabled');b.setAttribute('aria-disabled','false')});const states=document.querySelectorAll('#slate .game-state');states.forEach(s=>{if(/LOCKED/i.test(s.textContent||''))s.textContent='OPEN'});const ti=document.getElementById('tieTotal');if(ti){ti.disabled=false;ti.setAttribute('aria-disabled','false')}}
const mo=new MutationObserver(()=>apply());
function boot(){const slate=document.getElementById('slate');if(slate)mo.observe(slate,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled']});document.getElementById('weekSelect')?.addEventListener('change',()=>setTimeout(readDeadline,80));document.getElementById('prevWeek')?.addEventListener('click',()=>setTimeout(readDeadline,160));document.getElementById('nextWeek')?.addEventListener('click',()=>setTimeout(readDeadline,160));document.getElementById('savePicksBtn')?.addEventListener('click',()=>setTimeout(()=>{readDeadline();apply()},80));readDeadline();setInterval(()=>{if(deadline&&deadline<=Date.now()){active=false;location.reload()}else apply()},1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();