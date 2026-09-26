// LINKS NFL shared module — v731
// Additive/shared infrastructure only. v729 working page behavior remains the protected baseline.
(function(){
  if(window.LINKS_NFL && Number(window.LINKS_NFL.version)>=731) return;
  const VERSION='731';
  const NFL_PAGES={
    picks:['nfl.html',{}],
    scores:['nfl-scores.html',{}],
    compare:['compare-picks.html',{}],
    matter:['pick-tools.html',{sport:'nfl',tool:'matter'}],
    projected:['pick-tools.html',{sport:'nfl',tool:'projected'}],
    standings:['nfl-standings.html',{}]
  };
  function readJSON(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
  function pool(){return readJSON('links-current-pool')||{}}
  function poolId(){const p=pool(),q=new URLSearchParams(location.search);return q.get('pool')||p.id||p.poolId||p.pool_id||''}
  function playerName(){return localStorage.getItem('links-player-name')||''}
  function playerId(){return localStorage.getItem('links-player-id')||localStorage.getItem('links-player-email')||playerName()||''}
  function role(){return localStorage.getItem('links-player-role')||''}
  function isCommissioner(){return /admin|commissioner/i.test(role())}
  function currentWeek(){const d=new Date(),starts=['2026-09-10','2026-09-17','2026-09-24','2026-10-01','2026-10-08','2026-10-15','2026-10-22','2026-10-29','2026-11-05','2026-11-12','2026-11-19','2026-11-26','2026-12-03','2026-12-10','2026-12-17','2026-12-24','2026-12-31','2027-01-07'];let w=1;for(let i=0;i<starts.length;i++)if(d>=new Date(starts[i]+'T00:00:00'))w=i+1;return Math.min(18,w)}
  function selectedWeek(){return Math.max(1,Math.min(22,Number(new URLSearchParams(location.search).get('week'))||currentWeek()))}
  function context(){return{version:VERSION,pool:pool(),poolId:poolId(),playerName:playerName(),playerId:playerId(),role:role(),isCommissioner:isCommissioner(),currentWeek:currentWeek(),selectedWeek:selectedWeek()}}
  function query(extra,week){const q=new URLSearchParams(),p=poolId();if(p)q.set('pool',p);q.set('week',String(week||selectedWeek()));if(extra)Object.entries(extra).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=='')q.set(k,String(v))});return q.toString()}
  function href(file,extra,week){return './'+file+'?'+query(extra,week)}
  function pageHref(page,week){const def=NFL_PAGES[page];return def?href(def[0],def[1],week):href('nfl.html',{},week)}
  function api(path,extra,week){const q=new URLSearchParams(query(extra,week)),r=role();if(r&&!q.has('role'))q.set('role',r);q.set('_',String(Date.now()));return './api/'+path+'?'+q.toString()}
  function comparePicksUrl(week){return api('compare-picks',{},week)}
  function picksUrl(week){return api('picks',{},week)}
  function preserveContext(anchor,week){if(!anchor||!anchor.href)return anchor;try{const u=new URL(anchor.href,location.href);if(u.origin!==location.origin)return anchor;const p=poolId();if(p&&!u.searchParams.get('pool'))u.searchParams.set('pool',p);if(!u.searchParams.get('week'))u.searchParams.set('week',String(week||selectedWeek()));anchor.href=u.href}catch{}return anchor}
  function preserveAllLinks(root=document){root.querySelectorAll('a[href]').forEach(a=>preserveContext(a))}
  function setWeek(week,{navigate=false}={}){week=Math.max(1,Math.min(22,Number(week)||currentWeek()));const u=new URL(location.href);u.searchParams.set('week',String(week));const p=poolId();if(p)u.searchParams.set('pool',p);if(navigate)location.href=u.href;else history.replaceState({},'',u.href);return week}
  function emit(name,detail={}){window.dispatchEvent(new CustomEvent('links:nfl:'+name,{detail:{...context(),...detail}}))}
  window.LINKS_NFL={version:VERSION,NFL_PAGES,pool,poolId,playerName,playerId,role,isCommissioner,currentWeek,selectedWeek,context,query,href,pageHref,api,comparePicksUrl,picksUrl,preserveContext,preserveAllLinks,setWeek,emit};
  document.addEventListener('DOMContentLoaded',()=>{preserveAllLinks();emit('ready')},{once:true});
})();
