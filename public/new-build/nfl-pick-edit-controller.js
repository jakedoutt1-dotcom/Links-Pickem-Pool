/* LINKS NFL pick editor — DOM-only bridge so future weeks are selectable without relying on page lexical globals. */
(()=>{
'use strict';
if(!/\/nfl(?:\.html)?$/i.test(location.pathname))return;
const FINALIZED_WEEK=3;
const selectedWeek=()=>Number(document.getElementById('weekSelect')?.value||new URLSearchParams(location.search).get('week')||0);
const openWeek=()=>selectedWeek()>FINALIZED_WEEK;
const deadlineOpen=()=>document.documentElement.dataset.nflDeadlineClosed!=='1';
const canEdit=()=>openWeek()&&deadlineOpen();
function unlockDOM(){
 if(!canEdit())return;
 document.querySelectorAll('#slate .game-team').forEach(b=>{b.disabled=false;b.removeAttribute('disabled');b.setAttribute('aria-disabled','false');b.style.pointerEvents='auto'});
 const tie=document.getElementById('tieTotal');if(tie){tie.disabled=false;tie.removeAttribute('disabled');tie.setAttribute('aria-disabled','false')}
 const save=document.getElementById('savePicksBtn');if(save)save.disabled=false;
}
/* The page's original onclick owns the actual pick/save logic. We only remove stale disabled state.
   Do NOT stop propagation: doing that prevented the original handler from ever receiving the pick. */
function beforePick(e){
 const b=e.target.closest?.('#slate .game-team');
 if(!b||!canEdit())return;
 b.disabled=false;b.removeAttribute('disabled');b.style.pointerEvents='auto';
}
function onDeadline(e){setTimeout(()=>{if(e?.detail?.closed===false)unlockDOM()},0)}
function boot(){
 document.addEventListener('pointerdown',beforePick,true);
 document.addEventListener('touchstart',beforePick,{capture:true,passive:true});
 window.addEventListener('links:nfl-deadline',onDeadline);
 document.getElementById('weekSelect')?.addEventListener('change',()=>setTimeout(unlockDOM,100));
 const slate=document.getElementById('slate');if(slate)new MutationObserver(unlockDOM).observe(slate,{childList:true,subtree:true});
 setInterval(unlockDOM,400);unlockDOM();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();