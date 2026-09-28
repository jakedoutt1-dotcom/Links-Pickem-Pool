/* LINKS v802 — keep LOCK MY PICKS validation in sync with the selections visibly shown on the card. */
(()=>{
'use strict';
if(!/\/nfl(?:\.html)?$/i.test(location.pathname))return;
function syncVisibleSelections(){
  try{
    document.querySelectorAll('#slate .game-matchup').forEach(row=>{
      const selected=row.querySelector('button.game-team.primary[data-g][data-t]');
      if(!selected)return;
      if(typeof picks!=='undefined'&&picks){picks[String(selected.dataset.g)]=String(selected.dataset.t)}
    });
  }catch(e){}
}
function boot(){
  const btn=document.getElementById('savePicksBtn');
  if(!btn)return;
  btn.addEventListener('click',()=>{
    if(/LOCK MY PICKS/i.test(btn.textContent||'')&&!/UNLOCK/i.test(btn.textContent||''))syncVisibleSelections();
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();