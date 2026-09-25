window.LINKS_BUILD='644';
(function(){
 const V=String(window.LINKS_BUILD);
 try{
   const seen=localStorage.getItem('links-build-version');
   localStorage.setItem('links-build-version',V);
   if(seen!==V){
     if('caches' in window)caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k))));
     if('serviceWorker' in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.update()));
   }
 }catch{}
 function paint(){document.documentElement.dataset.linksBuild=V;document.querySelectorAll('.foot,.version').forEach(el=>{el.textContent=el.textContent.replace(/LINKS NEW BUILD\s*·\s*v\d+/ig,'LINKS NEW BUILD · v'+V).replace(/NEW BUILD\s*·\s*v\d+/ig,'NEW BUILD · v'+V).replace(/\bv\d+\b/i,'v'+V)});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();
 window.addEventListener('pageshow',paint);
})();
/* v644: hard-remove inline Playmaker controls and restore standings week-history navigation. */
/* redeploy trigger: Cloudflare queue retry 2026-09-25 */
