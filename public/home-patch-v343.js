(()=>{
'use strict';
async function start(){
 const home=document.getElementById('home'); if(!home||home.dataset.actualNewBuild==='1')return; home.dataset.actualNewBuild='1';
 const modal=document.getElementById('poolLoginModalV150');
 try{
  const res=await fetch('/new-build/index.html?v=666',{cache:'no-store'}); if(!res.ok)throw new Error('New Build source '+res.status);
  const html=await res.text(); const doc=new DOMParser().parseFromString(html,'text/html');
  const styles=[...doc.querySelectorAll('style')].map(x=>x.textContent).join('\n').replaceAll("url('./assets/","url('/new-build/assets/").replaceAll('url("./assets/','url("/new-build/assets/').replaceAll("url(./assets/","url(/new-build/assets/");
  const sourceBody=doc.body.cloneNode(true); sourceBody.querySelectorAll('script').forEach(x=>x.remove());
  sourceBody.querySelectorAll('[src^="./assets/"]').forEach(x=>x.setAttribute('src','/new-build/'+x.getAttribute('src').slice(2)));
  sourceBody.querySelectorAll('[href^="./assets/"]').forEach(x=>x.setAttribute('href','/new-build/'+x.getAttribute('href').slice(2)));
  [...home.children].forEach(el=>{if(el!==modal)el.style.setProperty('display','none','important')});
  document.getElementById('linksActualNewBuildHome')?.remove(); const shell=document.createElement('div'); shell.id='linksActualNewBuildHome'; while(sourceBody.firstChild)shell.appendChild(sourceBody.firstChild); home.insertBefore(shell,home.firstChild);
  document.getElementById('linksActualNewBuildCSS')?.remove(); const st=document.createElement('style'); st.id='linksActualNewBuildCSS'; st.textContent=`body>.wrap{max-width:none!important;width:100%!important;padding:0!important;margin:0!important}#home{max-width:none!important;width:100%!important;margin:0!important;padding:0!important;background:#03080d!important}#linksActualNewBuildHome{display:block!important;width:100%!important;min-height:100vh!important}`+styles+`#linksProdBuild666{position:fixed;right:8px;bottom:8px;z-index:99999;padding:5px 8px;border:1px solid #31566d;border-radius:6px;background:#03080de8;color:#55ef8d;font:900 9px Arial;letter-spacing:1px}`; document.head.appendChild(st);
  const badge=document.createElement('div');badge.id='linksProdBuild666';badge.textContent='LINKS v666';shell.appendChild(badge);
  function showLegacy(id){shell.style.setProperty('display','none','important'); const el=document.getElementById(id); if(el){el.classList.remove('hide');el.style.removeProperty('display');window.scrollTo(0,0);return true} return false}
  function clickLegacy(id){const el=document.getElementById(id);if(!el)return false;el.click();return true}
  function createPool(){
    shell.style.setProperty('display','none','important');
    if(clickLegacy('showCreatePool'))return;
    if(clickLegacy('createFreePoolTopV339'))return;
    showLegacy('createPoolPage');
  }
  function linksAdmin(){
    shell.style.setProperty('display','none','important');
    if(clickLegacy('showLinksAdmin'))return;
    showLegacy('linksAdminLogin');
  }
  function poolLogin(){shell.style.removeProperty('display'); if(!clickLegacy('openPoolLoginV150')){modal?.classList.remove('hide')}}
  shell.addEventListener('click',e=>{
    const el=e.target.closest('button,a,[role="button"]');if(!el)return; const txt=(el.textContent||'').trim().toUpperCase(); const href=(el.getAttribute('href')||'').toLowerCase();
    if((txt.includes('CREATE')&&txt.includes('POOL'))||href.includes('create')){e.preventDefault();e.stopImmediatePropagation();createPool();return}
    if(txt.includes('LINKS ADMIN')||txt==='ADMIN'||href.includes('admin')){e.preventDefault();e.stopImmediatePropagation();linksAdmin();return}
    if(txt.includes('POOL LOGIN')||txt.includes('ENTER MY POOL')||txt.includes('LOGIN TO POOL')||txt==='SIGN IN'||txt.includes('ENTER POOL')||href.includes('pool-login')){e.preventDefault();e.stopImmediatePropagation();poolLogin();return}
    if(href.startsWith('/new-build/')||href.startsWith('./'))e.preventDefault();
  },true);
 }catch(err){console.error('LINKS actual New Build transplant failed',err);home.dataset.actualNewBuild='0'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();