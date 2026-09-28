/* LINKS v804 — make LOCK MY PICKS validate the complete visible weekly card using the native pick format. */
(()=>{
'use strict';
if(!/\/nfl(?:\.html)?$/i.test(location.pathname))return;
function norm(v){return String(v==null?'':v).trim().toUpperCase()}
function teamFor(game,raw){
  const want=norm(raw);
  const teams=(game?.competitions?.[0]?.competitors||[]);
  return teams.find(x=>{
    const t=x?.team||{};
    return [t.id,t.abbreviation,t.displayName,t.shortDisplayName,t.name].some(v=>norm(v)===want);
  })||null;
}
function syncCompleteCard(){
  try{
    if(typeof picks==='undefined'||!picks||typeof games==='undefined'||!Array.isArray(games))return;
    document.querySelectorAll('#slate .game-matchup').forEach(row=>{
      const selected=row.querySelector('button.game-team.primary[data-g][data-t]');
      if(!selected)return;
      const game=games.find(g=>String(g.id)===String(selected.dataset.g));
      if(!game)return;
      const team=teamFor(game,selected.dataset.t);
      if(team)picks[String(game.id)]=String(team.team.id);
    });

    const dl=window.LINKS_NFL_WEEK_DEADLINE;
    const until=Number(dl?.deadlineMs||dl?.deadline||0);
    const correction=!!(dl?.open&&Number.isFinite(until)&&until>Date.now());
    if(correction){
      for(const game of games){
        if(!game.__linksOriginalDate)game.__linksOriginalDate=game.date;
        game.date=new Date(until).toISOString();
      }
    }
  }catch(e){console.warn('LINKS v804 card sync',e)}
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