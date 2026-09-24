window.LINKS_BUILD='580';
(function(){
 const V=String(window.LINKS_BUILD);
 try{localStorage.setItem('links-build-version',V)}catch{}
 const style=document.createElement('style');
 style.id='links-home-visual-patch';
 style.textContent=`
 @media(min-width:701px){
  .top .brand{position:static!important;left:auto!important;transform:none!important;min-width:280px!important;justify-content:flex-start!important}.top .brand-logo{width:205px!important;object-position:left center!important}.top .nav{padding:0!important}
  .hero{grid-template-columns:1fr 1fr 1fr!important}.hero .center{justify-content:center!important;text-align:center!important}.hero .hero-logo{width:min(108%,670px)!important;margin:auto!important;object-position:center center!important}
  .hero .script{font-weight:900!important;color:#ffd700!important;text-shadow:0 2px 8px #000,0 0 14px #ffd70044!important}.hero .connection{font-weight:1000!important;color:#fff!important}.hero .right{font-weight:1000!important;color:#fff!important}.hero .right b{color:#ffd700!important;font-weight:1000!important}
  .playmaker{height:112px!important;min-height:112px!important;max-width:none!important;margin:0 1.4%!important;background:#02070c!important;overflow:hidden!important}.playmaker-banner-img{content:url('./assets/C221BCF3-04E9-4F0A-9E98-FF448726A361.png?v=580')!important;display:block!important;width:100%!important;height:100%!important;max-height:112px!important;object-fit:contain!important;object-position:center!important;transform:none!important;background:#02070c!important}
 }
 .promo,.promo-community{min-height:340px!important;background-color:#07101a!important;background-image:linear-gradient(90deg,rgba(3,8,13,.44),rgba(3,8,13,.08)),url('./assets/bigger together.png?v=580')!important;background-size:cover!important;background-position:center center!important;background-repeat:no-repeat!important}.promo .community-photo,.promo-community .community-photo{display:none!important}
 @media(max-width:700px){.hero .script{font-weight:900!important;color:#ffd700!important}.hero .connection,.hero .right{font-weight:1000!important;color:#fff!important}.hero .right b{color:#ffd700!important}.promo,.promo-community{min-height:390px!important;background-image:linear-gradient(180deg,rgba(3,8,13,.25),rgba(3,8,13,.05) 55%,rgba(3,8,13,.35)),url('./assets/bigger together.png?v=580')!important;background-size:cover!important;background-position:center center!important;background-repeat:no-repeat!important}}
 `;
 document.head.appendChild(style);
 function paint(){document.documentElement.dataset.linksBuild=V;document.querySelectorAll('.foot,.version').forEach(el=>{el.textContent=el.textContent.replace(/LINKS NEW BUILD\s*·\s*v\d+/ig,'LINKS NEW BUILD · v'+V).replace(/NEW BUILD\s*·\s*v\d+/ig,'NEW BUILD · v'+V).replace(/\bv\d+\b/i,'v'+V)});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();window.addEventListener('pageshow',paint);
})();
