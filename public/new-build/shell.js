const LINKS_BUILD=window.LINKS_BUILD||'711';
(function(){
  const protectedPage=/\/(commissioner|nfl|nfl-scores|nfl-standings|compare-picks|pick-tools|college|survivor|confidence|game33|squares|march-madness|golf|nascar|fantasy|dynasty|custom)\.html$/i.test(location.pathname);
  let pool=null;try{pool=JSON.parse(localStorage.getItem('links-current-pool')||'null')}catch{}
  const player=localStorage.getItem('links-player-id')||'';
  if(protectedPage&&(!pool?.id||!player)){location.replace('./index.html');return}
  function clearSession(){['links-current-pool','links-player-id','links-player-name','links-player-role','links-session-v1'].forEach(k=>localStorage.removeItem(k));try{sessionStorage.removeItem('links-playmaker-import');sessionStorage.setItem('links-signed-out','1')}catch{}}
  function signOut(){if(!pool?.id||!player)return;document.querySelectorAll('#signOut,#signOutBtn,[id^="gameSignOut"]').forEach(x=>x.remove());let b=document.getElementById('linksGlobalSignOut');if(!b){b=document.createElement('button');b.id='linksGlobalSignOut';b.type='button';b.className='back links-global-signout';b.textContent='SIGN OUT'}b.style.cssText='display:inline-flex!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:9999!important;margin-left:auto!important;min-width:88px!important;min-height:42px!important;align-items:center!important;justify-content:center!important;padding:9px 13px!important;border:1px solid #45657a!important;border-radius:9px!important;background:#0b2130!important;color:#fff!important;font-size:11px!important;font-weight:950!important;cursor:pointer!important';const h=document.querySelector('header.top');if(h){if(b.parentNode!==h)h.appendChild(b)}else if(!b.parentNode)document.body.prepend(b);b.onclick=e=>{e.preventDefault();clearSession();location.replace('./index.html')}}
  function cleanup(){if(!pool?.id||!player)return;document.querySelectorAll('#nflSignedInPlayer,#linksPlayerBadge,.signed').forEach(x=>x.remove());document.querySelectorAll('#gameBack,.cc-nav,.game-back').forEach(x=>x.style.setProperty('display','none','important'));signOut()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup);else cleanup();window.addEventListener('pageshow',cleanup);setTimeout(cleanup,100);setTimeout(cleanup,700);
  window.LINKS_SESSION={clearSession,signOut,cleanup};
})();
