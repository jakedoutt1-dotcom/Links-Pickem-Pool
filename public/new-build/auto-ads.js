// Load Auto Ads only after confirming a pool is not ad-free. Never guess on errors.
(async()=>{
 if(window.LINKS_AUTO_ADS_CHECKED)return;window.LINKS_AUTO_ADS_CHECKED=true;
 const page=location.pathname.replace(/\/$/,'').split('/').pop().replace(/\.html$/,''),q=new URLSearchParams(location.search);
 if(q.get('view')==='admin'||q.has('invite')||q.has('setup'))return;
 const publicPage=['','new-build','index','how-to-play'].includes(page);
 // Auto placement is limited to public reading pages, never game controls.
 if(!publicPage)return;
 const token=localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token');
 if(token){try{const r=await fetch('/api/session',{headers:{Authorization:'Bearer '+token},cache:'no-store'});if(!r.ok)return;const s=await r.json();if(s.access?.adFree!==false)return;let pool;try{pool=JSON.parse(localStorage.getItem('links-current-pool')||'null')}catch{}if(!publicPage&&(!pool||pool.code!==s.poolCode||q.get('pool')&&String(q.get('pool'))!==String(pool.id)))return}catch{return}}
 else if(!publicPage)return;
 if(document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'))return;
 const script=document.createElement('script');script.async=true;script.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2654873707790051';script.crossOrigin='anonymous';document.head.append(script);
})();
