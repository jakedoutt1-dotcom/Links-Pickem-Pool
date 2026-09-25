window.LINKS_BUILD='636';
(function(){
 const V=String(window.LINKS_BUILD);
 try{localStorage.setItem('links-build-version',V)}catch{}
 function paint(){document.documentElement.dataset.linksBuild=V;document.querySelectorAll('.foot,.version').forEach(el=>{el.textContent=el.textContent.replace(/LINKS NEW BUILD\s*·\s*v\d+/ig,'LINKS NEW BUILD · v'+V).replace(/NEW BUILD\s*·\s*v\d+/ig,'NEW BUILD · v'+V).replace(/\bv\d+\b/i,'v'+V)});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();window.addEventListener('pageshow',paint);
})();
/* v636: logged-in pool/player identity persists across New Build pages; commissioner can remove active games without deleting historical picks/results. */
