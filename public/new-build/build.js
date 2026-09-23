window.LINKS_BUILD='394';
(function(){
 const V=window.LINKS_BUILD,key='links-build-version';
 try{
  const seen=localStorage.getItem(key);
  if(seen!==V){
   localStorage.setItem(key,V);
   if('caches'in window)caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k))));
   if('serviceWorker'in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.update()));
  }
 }catch{}
 function paint(){
  document.querySelectorAll('.foot,.version').forEach(el=>{
   el.textContent=el.textContent
    .replace(/LINKS NEW BUILD · v\d+/i,'LINKS NEW BUILD · v'+V)
    .replace(/NEW BUILD · v\d+/i,'NEW BUILD · v'+V);
  });
  document.documentElement.dataset.linksBuild=V;
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();
})();