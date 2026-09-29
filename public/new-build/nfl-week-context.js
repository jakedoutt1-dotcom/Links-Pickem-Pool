/* Default navigation to the active NFL week; advance only when every game is final.
   This module does not control pick deadlines or saving. */
window.LINKS_NFL_WEEK_READY=(async()=>{
 const url=new URL(location.href),explicit=Number(url.searchParams.get('week'));
 const hasExplicit=Number.isInteger(explicit)&&explicit>=1&&explicit<=22;
 function finish(active){
  window.LINKS_NFL_CURRENT_WEEK=active;
  if(!hasExplicit){url.searchParams.set('week',active);history.replaceState(null,'',url)}
  return hasExplicit?explicit:active;
 }
 const base='https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=100';
 try{
  const response=await fetch(base,{cache:'no-store'});if(!response.ok)throw Error('Schedule unavailable');
  const current=await response.json(),season=current.season?.year||2026;
  const post=Number(current.season?.type)===3;
  let start=post?({1:19,2:20,3:21,4:22,5:22}[current.week?.number]||19):Number(current.week?.number||1);
  start=Math.max(1,Math.min(22,start));
  for(let w=start;w<=22;w++){
   const apiWeek=w<=18?w:({19:1,20:2,21:3,22:5}[w]);
   const r=await fetch(base+'&dates='+season+'&seasontype='+(w<=18?2:3)+'&week='+apiWeek,{cache:'no-store'});
   if(!r.ok)throw Error('Schedule unavailable');
   const j=await r.json(),events=j.events||[];
   if(!events.length||!events.every(e=>e.status?.type?.completed===true||e.competitions?.[0]?.status?.type?.completed===true)){
    return finish(w);
   }
  }
  // The whole season is final; retain its final week for review.
  return finish(22);
 }catch(e){console.warn('NFL active week unavailable',e);return hasExplicit?explicit:null}
})();
