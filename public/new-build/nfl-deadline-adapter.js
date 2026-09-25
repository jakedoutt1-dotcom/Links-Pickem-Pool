/* LINKS NFL deadline adapter
   Safe bridge around the existing NFL page. No nfl.html rewrite required.
   Loads nfl-deadline.js, watches selected week/slate, uses first kickoff for that week,
   then reads a commissioner override from the same week-specific game-settings period.
*/
(function(){
 'use strict';
 if(!/\/nfl(?:\.html)?$/i.test(location.pathname))return;
 const pool=()=>{try{const p=JSON.parse(localStorage.getItem('links-current-pool')||'null')||{};return p.id||p.poolId||p.pool_id||new URLSearchParams(location.search).get('pool')||''}catch{return new URLSearchParams(location.search).get('pool')||''}};
 const week=()=>document.getElementById('weekSelect')?.value||new URLSearchParams(location.search).get('week')||'';
 const loadedGames=()=>Array.isArray(window.games)?window.games:[];
 const kickoff=g=>g?.date||g?.kickoff||g?.startTime||null;
 function discoverGames(){
   const g=loadedGames(); if(g.length)return g;
   return [...document.querySelectorAll('[data-kickoff]')].map(el=>({date:el.dataset.kickoff}));
 }
 async function overrideFor(w){
   const p=pool(); if(!p||!w)return null;
   try{
     const r=await fetch('./api/game-settings?pool='+encodeURIComponent(p)+'&game='+encodeURIComponent('NFL Pick’em')+'&period='+encodeURIComponent(String(w))+'&_='+Date.now(),{cache:'no-store'});
     if(!r.ok)return null; const j=await r.json();
     const s=j.settings||j.setting||j;
     return s?.lockAt||s?.lock_at||s?.deadline||s?.deadlineAt||s?.deadline_at||null;
   }catch{return null}
 }
 function format(ms){
   if(ms<=0)return 'CLOSED';
   const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000);
   return (d?d+'d ':'')+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
 }
 let seq=0,timer=null;
 async function sync(){
   if(!window.LINKSNFLDeadline)return;
   const my=++seq,w=week(),games=discoverGames(); if(!w||!games.length)return;
   window.LINKSNFLDeadline.setWeek(w,games.map(g=>({date:kickoff(g)})));
   const ov=await overrideFor(w); if(my!==seq)return;
   if(ov)window.LINKSNFLDeadline.setOverride(ov); else window.LINKSNFLDeadline.clearOverride();
   clearInterval(timer);
   const paint=()=>{
     const snap=window.LINKSNFLDeadline.snapshot();
     const el=document.getElementById('countdownClock')||document.getElementById('countdown')||document.getElementById('deadlineCountdown')||document.querySelector('[data-nfl-countdown]');
     if(el){el.textContent=snap.closed?'CLOSED':format(snap.remaining);el.dataset.linksDeadline='weekly-first-kickoff';}
     document.documentElement.dataset.nflDeadlineClosed=snap.closed?'1':'0';
     window.dispatchEvent(new CustomEvent('links:nfl-deadline',{detail:snap}));
   };
   paint(); timer=setInterval(paint,1000);
 }
 function boot(){
   const select=document.getElementById('weekSelect'); if(select)select.addEventListener('change',()=>setTimeout(sync,250));
   document.getElementById('prevWeek')?.addEventListener('click',()=>setTimeout(sync,350));
   document.getElementById('nextWeek')?.addEventListener('click',()=>setTimeout(sync,350));
   const slate=document.getElementById('slate'); if(slate)new MutationObserver(()=>setTimeout(sync,150)).observe(slate,{childList:true,subtree:true});
   sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
