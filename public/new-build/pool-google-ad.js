// A single display unit below NFL reading content, never automatic placement
// around picks, setup or live game controls. Existing ad-free benefits apply.
(async()=>{
 const page=location.pathname.replace(/\/$/,'').split('/').pop().replace(/\.html$/,''),q=new URLSearchParams(location.search);
 if(!['nfl-scores','nfl-standings','year-standings','results'].includes(page)||['admin','print'].includes(q.get('view'))||['invite','setup','reset','demo','print'].some(k=>q.has(k))||document.getElementById('linksPoolReadingAd'))return;
 let token;try{token=localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token')}catch{return}if(!token)return;
 try{const r=await fetch('/api/session',{headers:{Authorization:'Bearer '+token},cache:'no-store',signal:AbortSignal.timeout(10000)});if(!r.ok||(await r.json()).access?.adFree!==false)return}catch{return}
 if(document.getElementById('linksPoolReadingAd'))return;
 const main=document.querySelector('main');if(!main)return;
 const area=document.createElement('aside');area.id='linksPoolReadingAd';area.setAttribute('aria-label','Advertisements');area.style.cssText='box-sizing:border-box;width:calc(100% - 32px);max-width:970px;margin:64px auto 32px;padding:20px 0;border-top:1px solid #29485d;text-align:center;clear:both';
 const label=document.createElement('div');label.textContent='Advertisements';label.style.cssText='font:11px Arial,sans-serif;color:#9fb0bc;margin-bottom:16px';
 const ad=document.createElement('ins');ad.className='adsbygoogle';ad.style.display='block';ad.dataset.adClient='ca-pub-2654873707790051';ad.dataset.adSlot='9269292379';ad.dataset.adFormat='auto';ad.dataset.fullWidthResponsive='true';area.append(label,ad);main.after(area);
 const observer=new MutationObserver(()=>{if(ad.getAttribute('data-ad-status')==='unfilled'){area.hidden=true;observer.disconnect()}});observer.observe(ad,{attributes:true,attributeFilter:['data-ad-status']});window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
 if(!document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')){const script=document.createElement('script');script.async=true;script.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2654873707790051';script.crossOrigin='anonymous';script.onerror=()=>{area.hidden=true;observer.disconnect()};document.head.append(script)}
 try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch{area.hidden=true;observer.disconnect()}
})();
