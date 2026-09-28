/* LINKS v803 — make LOCK MY PICKS validate the complete visible weekly card. */
(()=>{
'use strict';
if(!/\/nfl(?:\.html)?$/i.test(location.pathname))return;
function syncCompleteCard(){
  try{
    if(typeof picks==='undefined'||!picks||typeof games==='undefined'||!Array.isArray(games))return;
    const rows=[...document.querySelectorAll('#slate .game-matchup')];
    for(const row of rows){
      const selected=row.querySelector('[data-g][data-t].primary');
      if(selected)picks[String(selected.dataset.g)]=String(selected.dataset.t);
    }
    /* During an active commissioner correction window the whole weekly card is open.
       The native lock handler filters by each game's kickoff, so temporarily make its
       validation window match the commissioner deadline. The weekly lock controller
       owns the actual deadline and restores/redraws state. */
    const dl=window.LINKS_NFL_WEEK_DEADLINE;
    const until=dl&&Number(dl.deadlineMs||dl.deadline||0);
    const correction=!!(dl&&dl.open&&Number.isFinite(until)&&until>Date.now());
    if(correction){
      for(const g of games){
        if(!g.__linksOriginalDate)g.__linksOriginalDate=g.date;
        g.date=new Date(until).toISOString();
      }
    }
  }catch(e){console.warn('LINKS v803 card sync',e)}
}
function boot(){
  const btn=document.getElementById('savePicksBtn');
  if(!btn)return;
  btn.addEventListener('click',()=>{
    if(/LOCK MY PICKS/i.test(btn.textContent||'')&&!/UNLOCK/i.test(btn.textContent||''))syncCompleteCard();
  },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();