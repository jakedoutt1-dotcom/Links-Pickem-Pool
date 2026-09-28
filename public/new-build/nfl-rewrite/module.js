/* LINKS NFL Pick'em module loader v785
   Thin pages load this file; shared logic stays in modules. */
(function(){
 const base='./nfl-rewrite/';
 const scripts=['core.js?v=785','navigation.js?v=785','print-card.js?v=785'];
 function load(src){return new Promise((ok,bad)=>{if(document.querySelector('script[data-links-nfl="'+src+'"]'))return ok();const s=document.createElement('script');s.src=base+src;s.dataset.linksNfl=src;s.onload=ok;s.onerror=bad;document.head.appendChild(s)})}
 async function boot(){for(const s of scripts)await load(s);window.dispatchEvent(new CustomEvent('links:nfl:ready',{detail:{core:window.LINKS_NFL_REWRITE,nav:window.LINKS_NFL_NAV,print:window.LINKS_NFL_PRINT}}))}
 boot().catch(e=>console.error('LINKS NFL module failed',e));
})();