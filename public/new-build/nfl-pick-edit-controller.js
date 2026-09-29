/* LINKS NFL weekly pick edit controller — keeps open-week picks editable without touching slate loading. */
(()=>{
'use strict';
if(!/\/nfl(?:\.html)?$/i.test(location.pathname))return;
const isOpen=()=>document.documentElement.dataset.nflDeadlineClosed!=='1';
function enableOpenCard(){
 if(!isOpen())return;
 document.querySelectorAll('#slate button.game-team').forEach(b=>{b.disabled=false;b.removeAttribute('disabled');b.setAttribute('aria-disabled','false')});
 const tie=document.getElementById('tieTotal');
 if(tie && document.getElementById('savePicksBtn')?.textContent?.includes('LOCK MY PICKS')){tie.disabled=false;tie.removeAttribute('disabled')}
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
   const btn=document.getElementById('savePicksBtn');if(btn)btn.textContent='LOCK MY PICKS';
   const msg=document.getElementById('saveMsg');if(msg)msg.textContent='Picks changed — lock them again before the deadline.';
   try{persistCardLock()}catch{}
   try{syncTieLock()}catch{}
   try{draw()}catch{}
   try{updatePM()}catch{}
   Promise.resolve(saveServer(game,b.dataset.t)).catch(()=>{});
   setTimeout(enableOpenCard,0);
 }catch(err){console.error('LINKS pick edit controller',err)}
}
function onDeadline(e){if(e?.detail?.closed===false)setTimeout(enableOpenCard,0)}
function boot(){
 document.addEventListener('click',choose,true);
 window.addEventListener('links:nfl-deadline',onDeadline);
 const slate=document.getElementById('slate');if(slate)new MutationObserver(()=>setTimeout(enableOpenCard,0)).observe(slate,{childList:true,subtree:true});
 setInterval(enableOpenCard,750);enableOpenCard();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();