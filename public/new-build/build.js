window.LINKS_BUILD='642';
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
/* v642: NFL pool page shows the signed-in player and suppresses the Control Center return button. */
