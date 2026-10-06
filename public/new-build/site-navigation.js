// Shared navigation never signs a player out or changes pool membership.
(()=>{
 function mount(){
  if(!document.getElementById('linksTestingNoticeScript')){const script=document.createElement('script');script.id='linksTestingNoticeScript';script.src='/new-build/testing-access.js';document.head.append(script)}
  if(document.getElementById('linksSiteNavigation'))return;
  const path=location.pathname.replace(/\/+$|\.html$/g,''),page=path.split('/').pop();
  if(path===''||path==='/index'||path==='/new-build'||path==='/new-build/index')return;
  const poolPages=new Set(['college','commissioner','compare-picks','confidence','custom','dynasty','fantasy','football-trivia','game-setup','game33','golf','home-run','march-madness','mlb','my-picks','my-pools','nascar','nfl','nfl-scores','nfl-standings','notifications','pick-tools','playoff','pool-room','pool-shortcut','props','results','squares','survivor','year-standings']);
  const nav=document.createElement('nav');nav.id='linksSiteNavigation';nav.setAttribute('aria-label','Site navigation');
  const style=document.createElement('style');style.textContent='#linksSiteNavigation{box-sizing:border-box;display:flex;flex-wrap:wrap;gap:8px;padding:8px max(16px,env(safe-area-inset-left));background:#080c0f;border-bottom:1px solid #635330;font:600 14px/1.3 system-ui,sans-serif;position:relative;z-index:1}#linksSiteNavigation a{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:44px;padding:9px 14px;color:#f1d184;background:#14191b;border:1px solid #79643a;border-radius:9px;text-decoration:none}#linksSiteNavigation a:hover{background:#28251c}#linksSiteNavigation a:focus-visible{outline:3px solid #f1d184;outline-offset:2px}@media print{#linksSiteNavigation{display:none}}';document.head.append(style);
  function link(text,href){const a=document.createElement('a');a.textContent=text;a.href=href;nav.append(a)}
  link('← Back to Home','/new-build/index.html');
  if(poolPages.has(page)||new URLSearchParams(location.search).has('pool')||path.includes('/nfl-rewrite/'))link('Back to Locker Room','/new-build/control-center.html');
  document.body.prepend(nav);
  // Keep the shared Home control; preserve clickable logos and game-specific exits.
  function removeDuplicateHome(){
   for(const control of document.querySelectorAll('a[href],button[data-nav],button[data-go]')){
    if(nav.contains(control)||control.querySelector('img,svg'))continue;
    const label=control.textContent.trim().replace(/[←→‹›↩🏠]/gu,'').trim();
    if(!/^(?:back\s+to\s+)?home(?:\s+page)?$/i.test(label))continue;
    const target=control.getAttribute('href')||control.dataset.nav;
    let home=control.dataset.go==='home';
    if(target){try{const u=new URL(target,location.href);home=u.origin===location.origin&&['/','/index.html','/index','/new-build/','/new-build/index.html','/new-build/index'].includes(u.pathname)}catch{}}
    if(home&&!control.hasAttribute('data-links-duplicate-home')){control.setAttribute('data-links-duplicate-home','');control.hidden=true;}
   }
  }
  style.textContent+='[data-links-duplicate-home]{display:none!important}';
  removeDuplicateHome();
  const observer=new MutationObserver(removeDuplicateHome);
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
