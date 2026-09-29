/* LINKS NFL pick editor — preserve explicit Lock My Picks state without owning pick selection/save logic. */
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
function lockKey(w=selectedWeek()){
 const p=new URLSearchParams(location.search).get('pool')||'default';
 const player=localStorage.getItem('links-player-id')||'';
 return 'links-nfl-card-locked:'+p+':'+player+':week-'+w;
}
function cardLocked(){try{return localStorage.getItem(lockKey())==='1'}catch(e){return false}}
function setCardLocked(v){try{if(v)localStorage.setItem(lockKey(),'1');else localStorage.removeItem(lockKey())}catch(e){}}
function setControlsLocked(locked){
 document.querySelectorAll('#slate .game-team').forEach(b=>{
  b.disabled=!!locked;
  if(locked){b.setAttribute('disabled','');b.setAttribute('aria-disabled','true');b.style.pointerEvents='none'}
  else{b.removeAttribute('disabled');b.setAttribute('aria-disabled','false');b.style.pointerEvents='auto'}
 });
 const tie=document.getElementById('tieTotal');
 if(tie){tie.disabled=!!locked;if(locked){tie.setAttribute('disabled','');tie.setAttribute('aria-disabled','true')}else{tie.removeAttribute('disabled');tie.setAttribute('aria-disabled','false')}}
 const save=document.getElementById('savePicksBtn');
 if(save&&weekOpen()){
  save.disabled=false;save.removeAttribute('disabled');save.setAttribute('aria-disabled','false');
  save.textContent=locked?'UNLOCK MY PICKS':'LOCK MY PICKS';
 }
}
function apply(){
 if(!weekOpen())return; /* closed/finalized week remains owned by the existing deadline adapter */
 setControlsLocked(cardLocked());
}
function beforePick(e){
 const b=e.target.closest?.('#slate .game-team');
 if(!b||!weekOpen()||cardLocked())return;
 b.disabled=false;b.removeAttribute('disabled');b.setAttribute('aria-disabled','false');b.style.pointerEvents='auto';
 /* Never intercept the original working NFL pick handler. */
}
function afterSaveClick(e){
 const save=e.target.closest?.('#savePicksBtn');
 if(!save||!weekOpen())return;
 const wasLocked=cardLocked();
 setTimeout(()=>{
  /* A click while locked is the explicit Unlock action. A click while open is Lock My Picks.
     The original page still owns validation, saving picks, and the Playmaker popup. */
  setCardLocked(!wasLocked);
  apply();
 },0);
}
function changedWeek(){const w=selectedWeek();loadDeadline(w);setTimeout(apply,100)}
function boot(){
 document.addEventListener('pointerdown',beforePick,true);
 document.addEventListener('touchstart',beforePick,{capture:true,passive:true});
 document.addEventListener('click',afterSaveClick,false);
 document.getElementById('weekSelect')?.addEventListener('change',changedWeek);
 document.getElementById('prevWeek')?.addEventListener('click',()=>setTimeout(changedWeek,50));
 document.getElementById('nextWeek')?.addEventListener('click',()=>setTimeout(changedWeek,50));
 const slate=document.getElementById('slate');if(slate)new MutationObserver(apply).observe(slate,{childList:true,subtree:true});
 loadDeadline(selectedWeek());setInterval(apply,400);apply();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();