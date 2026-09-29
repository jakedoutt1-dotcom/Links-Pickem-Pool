/* LINKS NFL pick editor — weekly-card editing is controlled ONLY by the selected week's first kickoff. */
(()=>{
'use strict';
if(!/\/nfl(?:\.html)?$/i.test(location.pathname))return;
const FINALIZED_WEEK=3;
const selectedWeek=()=>Number(document.getElementById('weekSelect')?.value||new URLSearchParams(location.search).get('week')||0);
let deadlineByWeek=new Map(),loading=new Set();
async function loadDeadline(w){
 if(!w||deadlineByWeek.has(w)||loading.has(w))return;
 loading.add(w);
 try{
  const base='https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=100';
  const cur=await fetch(base,{cache:'no-store'}).then(r=>r.json());
  const st=Number(cur.season?.type||2);
  const j=await fetch(base+'&seasontype='+st+'&week='+encodeURIComponent(w),{cache:'no-store'}).then(r=>r.json());
  const times=(j.events||[]).map(e=>Date.parse(e.date)).filter(Number.isFinite).sort((a,b)=>a-b);
  if(times.length)deadlineByWeek.set(w,times[0]);
 }catch(e){}finally{loading.delete(w);apply()}
}
function weekOpen(){
 const w=selectedWeek();
 if(!w||w<=FINALIZED_WEEK)return false;
 const d=deadlineByWeek.get(w);
 if(!d){loadDeadline(w);return false}
 return Date.now()<d;
}
function clearOldCardLock(w){
 try{
  const p=new URLSearchParams(location.search).get('pool')||'default';
  const player=localStorage.getItem('links-player-id')||'';
  for(const period of ['current','week-'+w,String(w)])localStorage.removeItem('links-nfl-card-locked:'+p+':'+player+':'+period);
 }catch(e){}
}
function unlockOpenWeek(){
 const w=selectedWeek();
 if(!weekOpen())return;
 clearOldCardLock(w);
 /* Keep the original NFL page as the owner of selection + save behavior.
    This controller only removes stale disabled states; it never intercepts the click. */
 document.querySelectorAll('#slate .game-team').forEach(b=>{
  b.disabled=false;
  b.removeAttribute('disabled');
  b.setAttribute('aria-disabled','false');
  b.style.pointerEvents='auto';
 });
 const tie=document.getElementById('tieTotal');
 if(tie){tie.disabled=false;tie.removeAttribute('disabled');tie.setAttribute('aria-disabled','false')}
 const save=document.getElementById('savePicksBtn');
 if(save){save.disabled=false;save.removeAttribute('disabled');save.setAttribute('aria-disabled','false')}
}
function apply(){
 if(weekOpen())unlockOpenWeek();
 /* Do not add another lock here. The page/deadline adapter owns the closed-week state. */
}
function beforePick(e){
 const b=e.target.closest?.('#slate .game-team');
 if(!b||!weekOpen())return;
 b.disabled=false;
 b.removeAttribute('disabled');
 b.setAttribute('aria-disabled','false');
 b.style.pointerEvents='auto';
 /* Intentionally no preventDefault / stopPropagation / stopImmediatePropagation. */
}
function changedWeek(){const w=selectedWeek();loadDeadline(w);setTimeout(apply,100)}
function boot(){
 document.addEventListener('pointerdown',beforePick,true);
 document.addEventListener('touchstart',beforePick,{capture:true,passive:true});
 document.getElementById('weekSelect')?.addEventListener('change',changedWeek);
 document.getElementById('prevWeek')?.addEventListener('click',()=>setTimeout(changedWeek,50));
 document.getElementById('nextWeek')?.addEventListener('click',()=>setTimeout(changedWeek,50));
 const slate=document.getElementById('slate');if(slate)new MutationObserver(apply).observe(slate,{childList:true,subtree:true});
 loadDeadline(selectedWeek());setInterval(apply,400);apply();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();