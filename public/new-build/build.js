window.LINKS_BUILD='578';
(function(){
 const V=String(window.LINKS_BUILD);
 try{localStorage.setItem('links-build-version',V)}catch{}

 /* Home visual patch: header alignment, hero emphasis, Playmaker fit, Bigger Together art. CSS only. */
 const style=document.createElement('style');
 style.id='links-home-visual-patch';
 style.textContent=`
 @media(min-width:701px){
   .top .brand{position:static!important;left:auto!important;transform:none!important;min-width:280px!important;justify-content:flex-start!important;z-index:auto!important}
   .top .brand-logo{width:205px!important;max-height:66px!important;object-position:left center!important}
   .top .nav{padding-left:0!important;padding-right:0!important}
   .hero{grid-template-columns:1fr 1fr 1fr!important}
   .hero .center{justify-content:center!important;text-align:center!important}
   .hero .hero-logo{width:min(108%,670px)!important;margin-left:auto!important;margin-right:auto!important;object-position:center center!important}
   .hero .script{font-weight:900!important;color:#ffd700!important;text-shadow:0 2px 8px #000,0 0 14px rgba(255,215,0,.28)!important}
   .hero .connection{font-weight:1000!important;color:#fff!important;opacity:1!important;text-shadow:0 2px 7px #000!important}
   .hero .right{font-weight:1000!important;color:#fff!important;opacity:1!important;text-shadow:0 2px 7px #000!important}
   .hero .right b{color:#ffd700!important;font-weight:1000!important;text-shadow:0 2px 7px #000,0 0 12px rgba(255,215,0,.24)!important}
   .playmaker{height:112px!important;min-height:112px!important;max-width:none!important;margin:0 1.4%!important;background:#02070c!important;overflow:hidden!important}
   .playmaker-banner-img{content:url('./assets/C221BCF3-04E9-4F0A-9E98-FF448726A361.png')!important;display:block!important;width:100%!important;height:100%!important;max-height:112px!important;object-fit:contain!important;object-position:center center!important;transform:none!important;background:#02070c!important}
 }
 .promo{background-color:#07101a!important;background-image:linear-gradient(90deg,rgba(3,8,13,.50) 0%,rgba(3,8,13,.14) 45%,rgba(3,8,13,.08) 100%),url('./assets/bigger together.png')!important;background-size:cover!important;background-position:center center!important;background-repeat:no-repeat!important}
 @media(max-width:700px){
   .hero .script{font-weight:900!important;color:#ffd700!important}
   .hero .connection,.hero .right{font-weight:1000!important;color:#fff!important;opacity:1!important}
   .hero .right b{color:#ffd700!important;font-weight:1000!important}
   .promo{min-height:390px!important;background-image:linear-gradient(180deg,rgba(3,8,13,.30),rgba(3,8,13,.08) 55%,rgba(3,8,13,.36)),url('./assets/bigger together.png')!important;background-size:cover!important;background-position:center center!important;background-repeat:no-repeat!important}
 }
 `;
 document.head.appendChild(style);

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
