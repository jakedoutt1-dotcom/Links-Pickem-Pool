// Creation controls are displayed only after the server verifies the pool's commissioner session.
(()=>{
 if(document.getElementById('linksCommissionerEntryModule'))return;
 const marker=document.createElement('meta');marker.id='linksCommissionerEntryModule';document.head.appendChild(marker);
 const token=localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token');if(!token)return;
 fetch('/api/session',{headers:{Authorization:'Bearer '+token},cache:'no-store'}).then(async r=>{if(!r.ok)return;const j=await r.json();if(j.role!=='admin')return;
  function mount(){
   const nav=document.querySelector('.links-nfl-shared-nav')||document.querySelector('.links-unified-nav')||document.querySelector('.college-nav')||document.querySelector('header.top');if(!nav)return;
   if(!nav.querySelector('[data-commissioner-pools]')){const a=document.createElement('a');a.dataset.commissionerPools='1';a.className='action';a.href='./commissioner-hub.html';a.textContent='MY POOLS / ADD GAME';nav.appendChild(a)}
   if(/commissioner|admin/i.test(location.pathname+location.search)&&!document.getElementById('linksCommissionerPoolsCard')){
    const main=document.querySelector('main');if(!main)return;const section=document.createElement('section');section.id='linksCommissionerPoolsCard';section.className='card';section.style.cssText='grid-column:1/-1;margin:16px 0';section.innerHTML='<h2>My commissioner pools</h2><p>Add another NFL pool, choose a different game, or manage your package. Each enabled game uses one slot.</p><a class="action primary" href="./commissioner-hub.html">＋ ADD POOL / GAME</a>';main.prepend(section);
   }
  }
  mount();const observer=new MutationObserver(mount);observer.observe(document.body,{childList:true,subtree:true});window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
 }).catch(()=>{});
})();
