window.LINKS_BUILD='634';
(function(){
 const V=String(window.LINKS_BUILD);
 try{localStorage.setItem('links-build-version',V)}catch{}
 function paint(){document.documentElement.dataset.linksBuild=V;document.querySelectorAll('.foot,.version').forEach(el=>{el.textContent=el.textContent.replace(/LINKS NEW BUILD\s*·\s*v\d+/ig,'LINKS NEW BUILD · v'+V).replace(/NEW BUILD\s*·\s*v\d+/ig,'NEW BUILD · v'+V).replace(/\bv\d+\b/i,'v'+V)});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();window.addEventListener('pageshow',paint);
})();
/* v632: authoritative visible build marker. Home page loads this file with a versioned URL and checks /api/build with cache disabled. */

/* v634: New Build login, players, NFL picks and history use the existing production DB schema directly. */
