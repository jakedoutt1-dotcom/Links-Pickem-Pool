window.LINKS_BUILD='472';
(function(){
 const V=String(window.LINKS_BUILD);
 try{localStorage.setItem('links-build-version',V)}catch{}
 function paint(){
   document.documentElement.dataset.linksBuild=V;
   document.querySelectorAll('.foot,.version').forEach(el=>{
     el.textContent=el.textContent
       .replace(/LINKS NEW BUILD\s*·\s*v\d+/ig,'LINKS NEW BUILD · v'+V)
       .replace(/NEW BUILD\s*·\s*v\d+/ig,'NEW BUILD · v'+V)
       .replace(/\bv415\b/ig,'v'+V)
       .replace(/PRODUCTION v661 PROTECTED/ig,'')
       .replace(/\s+·\s*$/,'');
   });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();
 window.addEventListener('pageshow',paint);
})();
