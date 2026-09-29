/* Default navigation to the next unstarted NFL week. Explicit history links stay explicit.
   This module does not control pick deadlines or saving. */
window.LINKS_NFL_WEEK_READY=(async()=>{
 const url=new URL(location.href),explicit=Number(url.searchParams.get('week'));
 if(Number.isInteger(explicit)&&explicit>=1&&explicit<=22)return explicit;
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
   const j=await r.json(),times=(j.events||[]).map(e=>Date.parse(e.date)).filter(Number.isFinite);
   if(times.length&&Math.min(...times)>Date.now()){
    url.searchParams.set('week',w);history.replaceState(null,'',url);return w;
   }
  }
  // No unstarted week remains in this season; retain its final week for review.
  url.searchParams.set('week','22');history.replaceState(null,'',url);return 22;
 }catch(e){console.warn('NFL upcoming week unavailable',e);return null}
})();
