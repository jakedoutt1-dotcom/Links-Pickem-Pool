/* LINKS NFL results adapter
   Applies shared win/loss grading without modifying the large page files.
   NFL Picks: selected pick turns green/red when ESPN marks matchup final.
   Compare Picks: normalizes existing correct/wrong cells to shared grading colors.
   Picks That Matter: grades both displayed sides from the pool's week results.
*/
(function(){
 'use strict';
 const path=location.pathname, qp=new URLSearchParams(location.search);
 const isNFL=/\/nfl(?:\.html)?$/i.test(path);
 const isCompare=/\/compare-picks(?:\.html)?$/i.test(path);
 const isTools=/\/pick-tools(?:\.html)?$/i.test(path)&&qp.get('sport')!=='college';
 if(!isNFL&&!isCompare&&!isTools)return;

 const week=()=>Number(document.getElementById('weekSelect')?.value||document.getElementById('week')?.value||qp.get('week')||0);
 const pool=()=>{try{const p=JSON.parse(localStorage.getItem('links-current-pool')||'null')||{};return p.id||p.poolId||p.pool_id||qp.get('pool')||''}catch{return qp.get('pool')||''}};
 const role=()=>localStorage.getItem('links-player-role')||'';
 function logoAbbr(el){
   const src=el?.querySelector('img')?.getAttribute('src')||'';
   const m=src.match(/\/([a-z0-9]+)\.png(?:\?|$)/i);
   return m?window.LINKSNFLResults.team(m[1]):'';
 }
 function finalByIndex(results,index){return results?.[index]??results?.[String(index)]??null}
 function applyNFL(){
   if(!window.LINKSNFLResults)return;
   document.querySelectorAll('#slate .game-matchup').forEach((row)=>{
     const selected=row.querySelector('.game-team.primary,[aria-pressed="true"]');
     if(!selected)return;
     const picked=logoAbbr(selected);
     const sides=[...row.querySelectorAll('.game-team')].map(logoAbbr).filter(Boolean);
     if(!picked||sides.length<2)return;
     window.LINKSNFLResults.weekResults(week()).then(results=>{
       const g=results.find(x=>sides.every(t=>x.teams.some(y=>y.abbr===t)));
       const state=!g||!g.final?'pending':g.winner===picked?'win':'loss';
       window.LINKSNFLResults.decorate(selected,state);
     }).catch(()=>{});
   });
 }
 function applyCompare(){
   if(!window.LINKSNFLResults)return;
   document.querySelectorAll('.compare-pick').forEach(el=>{
     if(el.classList.contains('compare-correct'))window.LINKSNFLResults.decorate(el,'win');
     else if(el.classList.contains('compare-wrong'))window.LINKSNFLResults.decorate(el,'loss');
   });
   document.querySelectorAll('.h2h-team').forEach(el=>{
     if(el.classList.contains('h2h-win'))window.LINKSNFLResults.decorate(el,'win');
     else if(el.classList.contains('h2h-loss'))window.LINKSNFLResults.decorate(el,'loss');
   });
 }
 async function applyMatter(){
   if(!window.LINKSNFLResults)return;
   const p=pool(),w=week(); if(!p||!w)return;
   try{
     const r=await fetch('./api/compare-picks?pool='+encodeURIComponent(p)+'&week='+w+'&role='+encodeURIComponent(role())+'&_='+Date.now(),{cache:'no-store'});
     const j=await r.json(); if(!r.ok)return;
     document.querySelectorAll('.gtm-game').forEach(card=>{
       const n=Number((card.querySelector('.gtm-head b')?.textContent||'').match(/(\d+)/)?.[1]||0)-1;
       if(n<0)return;
       const winner=window.LINKSNFLResults.team(finalByIndex(j.results||{},n));
       card.querySelectorAll('.gtm-side').forEach(side=>{
         const pick=logoAbbr(side);
         if(!pick||!winner)return;
         window.LINKSNFLResults.decorate(side,pick===winner?'win':'loss');
       });
     });
   }catch{}
 }
 let running=false;
 function run(){
   if(running||!window.LINKSNFLResults)return;
   running=true;
   Promise.resolve(isNFL?applyNFL():isCompare?applyCompare():applyMatter()).finally(()=>running=false);
 }
 function boot(){
   run();
   const root=document.getElementById('slate')||document.getElementById('box')||document.getElementById('body')||document.body;
   new MutationObserver(()=>setTimeout(run,80)).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-pressed']});
   document.getElementById('weekSelect')?.addEventListener('change',()=>setTimeout(run,250));
   document.getElementById('week')?.addEventListener('change',()=>setTimeout(run,250));
   setInterval(run,60000);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();