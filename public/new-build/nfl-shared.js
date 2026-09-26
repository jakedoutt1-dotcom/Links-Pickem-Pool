// LINKS NFL shared user-context module — v730
// Additive only: centralizes pool/player/role/current-week context for every NFL user.
(function(){
  if(window.LINKS_NFL) return;
  function pool(){try{return JSON.parse(localStorage.getItem('links-current-pool')||'null')||{}}catch{return{}}}
  function poolId(){const p=pool(),q=new URLSearchParams(location.search);return q.get('pool')||p.id||p.poolId||p.pool_id||''}
  function playerName(){return localStorage.getItem('links-player-name')||''}
  function role(){return localStorage.getItem('links-player-role')||''}
  function currentWeek(){const d=new Date(),starts=['2026-09-10','2026-09-17','2026-09-24','2026-10-01','2026-10-08','2026-10-15','2026-10-22','2026-10-29','2026-11-05','2026-11-12','2026-11-19','2026-11-26','2026-12-03','2026-12-10','2026-12-17','2026-12-24','2026-12-31','2027-01-07'];let w=1;for(let i=0;i<starts.length;i++)if(d>=new Date(starts[i]+'T00:00:00'))w=i+1;return Math.min(18,w)}
  function selectedWeek(){return Number(new URLSearchParams(location.search).get('week'))||currentWeek()}
  function query(extra){const q=new URLSearchParams();const p=poolId();if(p)q.set('pool',p);q.set('week',String(selectedWeek()));if(extra)Object.entries(extra).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=='')q.set(k,String(v))});return q.toString()}
  function href(file,extra){return './'+file+'?'+query(extra)}
  function api(path,extra){const q=new URLSearchParams(query(extra));const r=role();if(r&&!q.has('role'))q.set('role',r);q.set('_',String(Date.now()));return './api/'+path+'?'+q.toString()}
  window.LINKS_NFL={version:'730',pool,poolId,playerName,role,currentWeek,selectedWeek,query,href,api};
})();
