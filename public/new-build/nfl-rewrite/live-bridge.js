/* LINKS NFL live modular bridge v776
   Keeps the existing live NFL page/design/engine intact.
   Adds shared navigation wiring and routes Print My Picks through the logged-in user's existing print flow. */
(()=>{
  function boot(){
    if(!window.LINKS_NFL_NAV)return;
    const oldTabs=document.querySelector('main .tabs');
    const before=document.querySelector('.week-nav')||document.querySelector('main .card')?.firstElementChild;
    const nav=LINKS_NFL_NAV.mount('picks',before);
    if(oldTabs)oldTabs.style.display='none';
    const print=nav?.querySelector('[data-nfl-nav="print"]');
    if(print){
      print.addEventListener('click',e=>{
        e.preventDefault();
        const existing=document.getElementById('printBtn');
        if(existing) existing.click();
        else window.dispatchEvent(new CustomEvent('links:nfl:print'));
      },true);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
