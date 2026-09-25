window.LINKS_BUILD='653';
(function(){
 const V=String(window.LINKS_BUILD);
 try{const seen=localStorage.getItem('links-build-version');localStorage.setItem('links-build-version',V);if(seen!==V){if('caches'in window)caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k))));if('serviceWorker'in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.update()));}}catch{}
 function paint(){document.documentElement.dataset.linksBuild=V;document.querySelectorAll('.foot,.version').forEach(el=>{el.textContent=el.textContent.replace(/LINKS NEW BUILD\s*·\s*v\d+/ig,'LINKS NEW BUILD · v'+V).replace(/NEW BUILD\s*·\s*v\d+/ig,'NEW BUILD · v'+V).replace(/\bv\d+\b/i,'v'+V)});}
 function wireNFL(){
  if(!/\/nfl(?:\.html)?$/i.test(location.pathname))return;
  const qp=new URLSearchParams(location.search),pool=qp.get('pool')||'',week=qp.get('week')||'';
  const go=(file,extra)=>{let u='./'+file+'?pool='+encodeURIComponent(pool);if(week)u+='&week='+encodeURIComponent(week);if(extra)u+='&'+extra;location.href=u};
  const bind=(id,fn)=>{const b=document.getElementById(id);if(b&&!b.dataset.linksNav653){b.dataset.linksNav653='1';b.addEventListener('click',e=>{e.preventDefault();fn()})}};
  bind('scoresBtn',()=>go('nfl.html','view=scores'));
  bind('compareBtn',()=>go('compare-picks.html'));
  bind('matterBtn',()=>go('pick-tools.html','sport=nfl&tool=matter'));
  bind('projectedBtn',()=>go('pick-tools.html','sport=nfl&tool=projected'));
  bind('standingsBtn',()=>go('nfl-standings.html'));
  bind('printBtn',()=>{const u=new URL(location.href);u.searchParams.set('print','1');window.open(u.href,'_blank')});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{paint();wireNFL()});else{paint();wireNFL()}
 window.addEventListener('pageshow',()=>{paint();wireNFL()});
 if(/\/nfl(?:\.html)?$/i.test(location.pathname)){const s=document.createElement('script');s.src='./nfl-session-v646.js?v=653';s.defer=true;document.head.appendChild(s)}
})();
/* v653: restore NFL control-panel button handlers while old-functionality port continues. */
