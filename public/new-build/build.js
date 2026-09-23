window.LINKS_BUILD=window.LINKS_BUILD||'411'
(async function(){
 const key='links-build-version';
 async function getBuild(){try{const r=await fetch('./api/build?ts='+Date.now(),{cache:'no-store'});if(r.ok){const j=await r.json();if(j.build)return String(j.build)}}catch{}return String(window.LINKS_BUILD)}
 const V=await getBuild();window.LINKS_BUILD=V;
 try{const seen=localStorage.getItem(key);if(seen!==V){localStorage.setItem(key,V);if('caches'in window)caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k))));if('serviceWorker'in navigator)navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.update()));}}catch{}
 function paint(){document.querySelectorAll('.foot,.version').forEach(el=>{el.textContent=el.textContent.replace(/LINKS NEW BUILD · v\d+/i,'LINKS NEW BUILD · v'+V).replace(/NEW BUILD · v\d+/i,'NEW BUILD · v'+V).replace(/PRODUCTION v661 PROTECTED/ig,'').replace(/\s+·\s*$/,'')});document.documentElement.dataset.linksBuild=V}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();
})();