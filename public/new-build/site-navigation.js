// Shared navigation never signs a player out or changes pool membership.
(()=>{
 function mount(){
  if(!document.getElementById('linksFeedbackScript')){const script=document.createElement('script');script.id='linksFeedbackScript';script.src='/new-build/game-feedback.js';document.head.append(script)}
  if(!document.getElementById('linksTestingNoticeScript')){const script=document.createElement('script');script.id='linksTestingNoticeScript';script.src='/new-build/testing-access.js';document.head.append(script)}
  if(document.getElementById('linksSiteNavigation'))return;
  const path=location.pathname.replace(/\/+$|\.html$/g,''),page=path.split('/').pop();
  const isHome=path===''||path==='/index'||path==='/new-build'||path==='/new-build/index';
  if(isHome)return;
  const nav=document.createElement('nav');nav.id='linksSiteNavigation';nav.setAttribute('aria-label','Site navigation');
  const style=document.createElement('style');style.textContent='#linksSiteNavigation{box-sizing:border-box;display:flex;flex-wrap:wrap;gap:8px;padding:8px max(16px,env(safe-area-inset-left));background:#080c0f;border-bottom:1px solid #635330;font:600 14px/1.3 system-ui,sans-serif;position:relative;z-index:1}#linksSiteNavigation a{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:44px;padding:9px 14px;color:#f1d184;background:#14191b;border:1px solid #79643a;border-radius:9px;text-decoration:none}#linksSiteNavigation a:hover{background:#28251c}#linksSiteNavigation a:focus-visible{outline:3px solid #f1d184;outline-offset:2px}@media print{#linksSiteNavigation{display:none}}';document.head.append(style);
  function link(text,href){const a=document.createElement('a');a.textContent=text;a.href=href;nav.append(a)}
  if(!isHome)link('← Back to Home','/new-build/index.html');
  if(page==='control-center')link('Game Room','/new-build/game-room.html');
  document.body.prepend(nav);
  // Keep the shared Home control; preserve clickable logos and game-specific exits.
  function removeDuplicateHome(){
   for(const control of document.querySelectorAll('a[href],button[data-nav],button[data-go]')){
    if(nav.contains(control))continue;
    if(page!=='control-center'&&control.matches('a[href]')){
     const label=control.textContent.trim().replace(/[←→‹›↩🏠]/gu,'').trim();
     const target=new URL(control.getAttribute('href'),location.href);
     if(target.origin===location.origin&&/\/(?:control-center|game-room)(?:\.html)?\/?$/.test(target.pathname)&&/^(?:(?:back|return|go)\s+to\s+)?(?:my\s+)?(?:game room|locker room|pools)$/i.test(label)){
      control.setAttribute('data-links-room-shortcut','');control.hidden=true;
     }
    }
    if(control.querySelector('img,svg'))continue;
    const label=control.textContent.trim().replace(/[←→‹›↩🏠]/gu,'').trim();
    if(!/^(?:back\s+to\s+)?home(?:\s+page)?$/i.test(label))continue;
    const target=control.getAttribute('href')||control.dataset.nav;
    let home=control.dataset.go==='home';
    if(target){try{const u=new URL(target,location.href);home=u.origin===location.origin&&['/','/index.html','/index','/new-build/','/new-build/index.html','/new-build/index'].includes(u.pathname)}catch{}}
    if(home&&!control.hasAttribute('data-links-duplicate-home')){control.setAttribute('data-links-duplicate-home','');control.hidden=true;}
   }
  }
  style.textContent+='[data-links-duplicate-home],[data-links-room-shortcut]{display:none!important}';
  removeDuplicateHome();
  const observer=new MutationObserver(removeDuplicateHome);
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
