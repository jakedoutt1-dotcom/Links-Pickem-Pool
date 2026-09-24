window.LINKS_BUILD='585';
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
  .playmaker{height:auto!important;min-height:0!important;aspect-ratio:4/1!important;max-width:none!important;margin:0 1.4%!important;padding:0!important;background:#02070c!important;overflow:hidden!important;border-radius:0!important}
  .playmaker-banner-img{content:url('./assets/playmaker 3.png?v=585')!important;display:block!important;position:static!important;inset:auto!important;width:100%!important;height:auto!important;max-height:none!important;object-fit:contain!important;object-position:center!important;opacity:1!important;visibility:visible!important;transform:none!important;z-index:0!important}
  .playmaker>*:not(.playmaker-banner-img){position:relative!important;z-index:2!important}
  .playmaker-control-row .playmaker-open-row{font-size:15px!important;padding:13px 24px!important;border:2px solid #55e36a!important;background:linear-gradient(180deg,#27c84a,#087724)!important;color:#fff!important;box-shadow:0 0 18px #24d94f66,0 5px 14px #000a!important}
  .playmaker-control-row button:nth-child(2){border:2px solid #ffd700!important;background:linear-gradient(180deg,#ffd700,#b98200)!important;color:#171006!important;box-shadow:0 0 16px #ffd70066,0 4px 12px #0009!important}
 }
 .promo,.promo-community{position:relative!important;min-height:340px!important;background:#07101a!important;overflow:hidden!important}
 .promo::before,.promo-community::before{content:''!important;position:absolute!important;inset:0!important;display:block!important;background-image:linear-gradient(90deg,rgba(3,8,13,.38),rgba(3,8,13,.04)),url('./assets/bigger together.png?v=585')!important;background-size:cover!important;background-position:center center!important;background-repeat:no-repeat!important;z-index:0!important;pointer-events:none!important}
 .promo>* ,.promo-community>*{position:relative!important;z-index:2!important}.promo .community-photo,.promo-community .community-photo{display:none!important}
 .promo h2 span,.promo-community h2 span{color:#ffd700!important;font-weight:1000!important;text-shadow:0 2px 8px #000,0 0 14px #ffd70044!important}
 @media(max-width:700px){.hero .script{font-weight:900!important;color:#ffd700!important}.hero .connection,.hero .right{font-weight:1000!important;color:#fff!important}.hero .right b{color:#ffd700!important}.promo,.promo-community{min-height:390px!important}.promo::before,.promo-community::before{background-image:linear-gradient(180deg,rgba(3,8,13,.22),rgba(3,8,13,.03) 55%,rgba(3,8,13,.32)),url('./assets/bigger together.png?v=585')!important;background-size:cover!important;background-position:center center!important}}
 `;
 document.head.appendChild(style);
 function paint(){document.documentElement.dataset.linksBuild=V;document.querySelectorAll('.foot,.version').forEach(el=>{el.textContent=el.textContent.replace(/LINKS NEW BUILD\s*·\s*v\d+/ig,'LINKS NEW BUILD · v'+V).replace(/NEW BUILD\s*·\s*v\d+/ig,'NEW BUILD · v'+V).replace(/\bv\d+\b/i,'v'+V)});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();window.addEventListener('pageshow',paint);
})();
