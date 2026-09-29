/* Shared NFL navigation only. nfl.html owns the slate, player hydration,
   selection handlers and saves. Never replace or rename its #slate. */
(()=>{
 const V=String(window.LINKS_VERSION||window.LINKS_BUILD||'779');
 const q=()=>new URLSearchParams(location.search);
 const session=()=>{try{return JSON.parse(localStorage.getItem('links-current-pool')||'null')}catch{return null}};
 const realPool=()=>!!(q().get('pool')&&session()&&String(session().id||session().poolId||session().pool_id)===String(q().get('pool'))&&localStorage.getItem('links-player-id'));
 function load(id,src,ready){return new Promise((resolve,reject)=>{if(ready())return resolve();let s=document.getElementById(id);if(s){const w=()=>ready()?resolve():setTimeout(w,20);return w()}s=document.createElement('script');s.id=id;s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
 async function boot(){
  if(!realPool())return;
  try{
   await load('linksNflSharedNav','./nfl-rewrite/navigation.js?v='+V,()=>!!window.LINKS_NFL_NAV);
   document.getElementById('tutorial')?.remove();
   document.querySelectorAll('main .tabs,.tabs.nfl-tabs,#nflnav,.nflnav').forEach(x=>{if(!x.classList.contains('links-nfl-shared-nav'))x.remove()});
   const before=document.querySelector('.week-nav')||document.querySelector('main .card')?.firstElementChild||document.querySelector('main');
   LINKS_NFL_NAV.mount('picks',before);
  }catch(e){console.error('LINKS NFL navigation:',e)}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
