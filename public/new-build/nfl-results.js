/* LINKS shared NFL result grading
   One source of truth for NFL Picks, Compare Picks, Projected and Picks That Matter.
   A selection is graded only after ESPN marks its matchup final.
*/
(function(){
 'use strict';
 const ALIAS={WAS:'WSH',WSH:'WSH',JAC:'JAX',JAX:'JAX',LA:'LAR',LAR:'LAR',OAK:'LV',LV:'LV',SD:'LAC',LAC:'LAC',STL:'LAR'};
 const team=v=>{const x=String(v||'').toUpperCase().replace(/[^A-Z]/g,'');return ALIAS[x]||x};
 function parseEvent(e){
   const c=e?.competitions?.[0],cs=c?.competitors||[];
   const final=!!(e?.status?.type?.completed||c?.status?.type?.completed||/final/i.test(e?.status?.type?.description||''));
   const rows=cs.map(x=>({abbr:team(x?.team?.abbreviation),winner:x?.winner===true,score:Number(x?.score||0)}));
   if(final&&rows.length===2&&!rows.some(x=>x.winner)&&rows[0].score!==rows[1].score){rows[0].winner=rows[0].score>rows[1].score;rows[1].winner=rows[1].score>rows[0].score}
   return {id:String(e?.id||''),final,teams:rows,winner:rows.find(x=>x.winner)?.abbr||null};
 }
 async function weekResults(week,seasonType){
   const st=Number(seasonType||2),w=Number(week||0);if(!w)return [];
   const u='https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=100&seasontype='+st+'&week='+w;
   const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw new Error('NFL results unavailable');const j=await r.json();return (j.events||[]).map(parseEvent);
 }
 function find(results,picked,opponent){
   const p=team(picked),o=team(opponent);
   return (results||[]).find(g=>g.teams.some(t=>t.abbr===p)&&(!o||g.teams.some(t=>t.abbr===o)))||null;
 }
 function grade(results,picked,opponent){
   const g=find(results,picked,opponent);if(!g||!g.final)return {state:'pending',game:g};
   return {state:g.winner===team(picked)?'win':'loss',game:g};
 }
 function decorate(el,state){
   if(!el)return;el.classList.remove('links-pick-win','links-pick-loss','links-pick-pending');
   el.classList.add(state==='win'?'links-pick-win':state==='loss'?'links-pick-loss':'links-pick-pending');
   el.dataset.pickResult=state;
 }
 function installCSS(){if(document.getElementById('linksNFLResultsCSS'))return;const s=document.createElement('style');s.id='linksNFLResultsCSS';s.textContent='.links-pick-win{background:#123d25!important;border-color:#35d06f!important;color:#eafff0!important;box-shadow:0 0 0 1px rgba(53,208,111,.25) inset}.links-pick-loss{background:#48191d!important;border-color:#ef5350!important;color:#fff1f1!important;box-shadow:0 0 0 1px rgba(239,83,80,.25) inset}.links-pick-pending{}';document.head.appendChild(s)}
 installCSS();
 window.LINKSNFLResults={team,parseEvent,weekResults,find,grade,decorate};
})();
