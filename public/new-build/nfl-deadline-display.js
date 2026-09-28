/* LINKS v796 — passive NFL deadline display only. Never disables picks or hides data. */
(()=>{
'use strict';
if(!/\/nfl(?:\.html)?$/i.test(location.pathname))return;
const qp=new URLSearchParams(location.search);
const pool=()=>{try{const p=JSON.parse(localStorage.getItem('links-current-pool')||'null')||{};return qp.get('pool')||p.id||p.poolId||p.pool_id||''}catch{return qp.get('pool')||''}};
const week=()=>Number(document.getElementById('weekSelect')?.value||qp.get('week')||1);
async function firstKickoff(w){try{const base='https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=100';const cur=await fetch(base,{cache:'no-store'}).then(r=>r.json()),st=Number(cur.season?.type||2);const j=await fetch(base+'&seasontype='+st+'&week='+encodeURIComponent(w),{cache:'no-store'}).then(r=>r.json());const ds=(j.events||[]).map(e=>e.date).filter(Boolean).sort((a,b)=>Date.parse(a)-Date.parse(b));return ds[0]||null}catch{return null}}
async function override(w){const p=pool();if(!p)return null;try{const r=await fetch('./api/game-settings?pool='+encodeURIComponent(p)+'&game='+encodeURIComponent('NFL Pick’em')+'&period='+encodeURIComponent(String(w))+'&week='+w+'&_='+Date.now(),{cache:'no-store'});if(!r.ok)return null;const j=await r.json(),s=j.settings||j.setting||j;const v=s?.lockAt||s?.lock_at||null;return v&&Number.isFinite(Date.parse(v))?v:null}catch{return null}}
function fmt(ms){if(ms<=0)return'DEADLINE PASSED';const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000);return(d?d+'D ':'')+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}
let timer=null,seq=0;
async function sync(){const my=++seq,w=week(),[kick,ov]=await Promise.all([firstKickoff(w),override(w)]);if(my!==seq)return;const deadline=ov||kick,label=document.querySelector('#pickCountdown span'),clock=document.getElementById('countdownClock');if(label)label.textContent=ov?'COMMISSIONER DEADLINE':'PICKS DEADLINE · FIRST KICKOFF';clearInterval(timer);const paint=()=>{if(!clock)return;clock.textContent=deadline?fmt(Date.parse(deadline)-Date.now()):'DEADLINE UNAVAILABLE'};paint();timer=setInterval(paint,1000)}
function boot(){document.getElementById('weekSelect')?.addEventListener('change',()=>setTimeout(sync,100));document.getElementById('prevWeek')?.addEventListener('click',()=>setTimeout(sync,180));document.getElementById('nextWeek')?.addEventListener('click',()=>setTimeout(sync,180));sync()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();