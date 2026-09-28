/* LINKS NFL Pick'em clean rewrite v769
   One authoritative selected-week model. LINKS LIVE is intentionally excluded. */
window.LINKS_NFL_REWRITE=(function(){
 const SEASON=2026;
 const qs=()=>new URLSearchParams(location.search);
 const pool=()=>{try{return JSON.parse(localStorage.getItem('links-current-pool')||'{}')}catch{return{}}};
 const poolId=()=>qs().get('pool')||pool().id||pool().poolId||pool().pool_id||'';
 const player=()=>localStorage.getItem('links-player-name')||localStorage.getItem('links-current-player')||pool().playerName||pool().player||'';
 const week=()=>Math.max(1,Math.min(22,Number(qs().get('week')||document.getElementById('weekSelect')?.value||1)));
 const type=w=>w<=18?2:3;
 const abbr=x=>String(x||'').toUpperCase().replace(/^WAS$/,'WSH');
 const matchupKey=(a,b)=>[abbr(a),abbr(b)].sort().join('|');
 async function scoreboard(w=week()){
   const u='https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates='+SEASON+'&seasontype='+type(w)+'&week='+(w<=18?w:w-18)+'&limit=100';
   const r=await fetch(u,{cache:'no-store'}); if(!r.ok)throw Error('NFL schedule unavailable');
   const j=await r.json();
   return (j.events||[]).map(e=>{
     const c=e.competitions?.[0]||{}, teams=c.competitors||[], home=teams.find(x=>x.homeAway==='home')||teams[0]||{}, away=teams.find(x=>x.homeAway==='away')||teams[1]||{};
     const final=!!(e.status?.type?.completed||c.status?.type?.completed);
     const hs=Number(home.score),as=Number(away.score);
     let winner=null;if(final){if(home.winner)winner=abbr(home.team?.abbreviation);else if(away.winner)winner=abbr(away.team?.abbreviation);else if(Number.isFinite(hs)&&Number.isFinite(as)&&hs!==as)winner=hs>as?abbr(home.team?.abbreviation):abbr(away.team?.abbreviation)}
     return {id:String(e.id),date:e.date||c.date||'',key:matchupKey(home.team?.abbreviation,away.team?.abbreviation),home:abbr(home.team?.abbreviation),away:abbr(away.team?.abbreviation),homeScore:Number.isFinite(hs)?hs:null,awayScore:Number.isFinite(as)?as:null,final,winner};
   }).sort((a,b)=>new Date(a.date)-new Date(b.date)||a.id.localeCompare(b.id));
 }
 async function picks(w=week()){
   const role=localStorage.getItem('links-player-role')||'';
   const api=new URL('../api/compare-picks',location.href);
   api.searchParams.set('pool',poolId());api.searchParams.set('week',String(w));api.searchParams.set('role',role);api.searchParams.set('_',String(Date.now()));
   const r=await fetch(api.toString(),{cache:'no-store'});
   const j=await r.json();if(!r.ok)throw Error(j.error||'Saved picks unavailable');return j;
 }
 function grade(schedule,pickMap){const byTeam=new Map();schedule.forEach(g=>{byTeam.set(g.home,g);byTeam.set(g.away,g)});return Object.entries(pickMap||{}).map(([slot,pick])=>{const team=abbr(pick),g=byTeam.get(team);return {slot:Number(slot),pick:team,game:g||null,status:!g?'unknown':!g.final?'pending':g.winner===team?'win':'loss'};}).sort((a,b)=>a.slot-b.slot)}
 async function model(w=week()){if(!poolId())throw Error('Pool session missing. Open this test after signing into your pool.');const [schedule,data]=await Promise.all([scoreboard(w),picks(w)]);const me=(data.players||[]).find(x=>String(x.player||'').toLowerCase()===String(player()).toLowerCase())||null;return {season:SEASON,week:w,poolId:poolId(),player:player(),schedule,picks:data.players||[],me,graded:me?grade(schedule,me.picks||{}):[]}}
 return {SEASON,poolId,player,week,scoreboard,picks,grade,model,matchupKey};
})();