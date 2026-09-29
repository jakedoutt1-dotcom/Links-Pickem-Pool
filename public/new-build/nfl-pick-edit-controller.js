/* LINKS NFL weekly pick edit controller — finalized weeks 1-3 stay locked; future weeks stay editable. */
(()=>{
'use strict';
if(!/\/nfl(?:\.html)?$/i.test(location.pathname))return;
const FINALIZED_WEEK=3;
const week=()=>Number(window.selectedWeek||new URLSearchParams(location.search).get('week')||0);
const isFinalized=()=>week()>0&&week()<=FINALIZED_WEEK;
const isOpen=()=>!isFinalized();
function enableOpenCard(){
 if(!isOpen())return;
 document.documentElement.dataset.nflDeadlineClosed='0';
 document.querySelectorAll('#slate button.game-team').forEach(b=>{b.disabled=false;b.removeAttribute('disabled');b.setAttribute('aria-disabled','false')});
 const tie=document.getElementById('tieTotal');
 if(tie){tie.disabled=false;tie.removeAttribute('disabled');tie.setAttribute('aria-disabled','false')}
 const save=document.getElementById('savePicksBtn');
 if(save)save.disabled=false;
}
function choose(e){
 const b=e.target.closest?.('#slate button.game-team[data-g][data-t]');
 if(!b||!isOpen())return;
 e.preventDefault();e.stopImmediatePropagation();
 try{
   const game=games.find(x=>String(x.id)===String(b.dataset.g));
   if(!game)return;
   picks[b.dataset.g]=b.dataset.t;
   editing=true;picksCommitted=false;pmSelected.clear();
   try{localSave()}catch{}
   const bar=document.getElementById('saveBar');if(bar)bar.classList.remove('saved');
   const btn=document.getElementById('savePicksBtn');if(btn){btn.disabled=false;btn.textContent='LOCK MY PICKS'}
   const msg=document.getElementById('saveMsg');if(msg)msg.textContent='Picks changed — lock them again before the deadline.';
   try{persistCardLock()}catch{}
   try{syncTieLock()}catch{}
   try{draw()}catch{}
   try{updatePM()}catch{}
   Promise.resolve(saveServer(game,b.dataset.t)).catch(()=>{});
   setTimeout(enableOpenCard,0);
 }catch(err){console.error('LINKS pick edit controller',err)}
}
function boot(){
 document.addEventListener('click',choose,true);
 const slate=document.getElementById('slate');if(slate)new MutationObserver(()=>setTimeout(enableOpenCard,0)).observe(slate,{childList:true,subtree:true});
 const weekSelect=document.getElementById('weekSelect');if(weekSelect)weekSelect.addEventListener('change',()=>setTimeout(enableOpenCard,150));
 setInterval(enableOpenCard,500);enableOpenCard();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();