(()=>{
'use strict';
async function start(){
 const home=document.getElementById('home'); if(!home||home.dataset.actualNewBuild==='1')return; home.dataset.actualNewBuild='1';
 const modal=document.getElementById('poolLoginModalV150');
 try{
  const res=await fetch('/new-build/index.html?v=667',{cache:'no-store'}); if(!res.ok)throw new Error('New Build source '+res.status);
  const html=await res.text(),doc=new DOMParser().parseFromString(html,'text/html');
  const styles=[...doc.querySelectorAll('style')].map(x=>x.textContent).join('\n').replaceAll("url('./assets/","url('/new-build/assets/").replaceAll('url("./assets/','url("/new-build/assets/').replaceAll("url(./assets/","url(/new-build/assets/");
  const sourceBody=doc.body.cloneNode(true); sourceBody.querySelectorAll('script').forEach(x=>x.remove()); sourceBody.querySelectorAll('[src^="./assets/"]').forEach(x=>x.setAttribute('src','/new-build/'+x.getAttribute('src').slice(2))); sourceBody.querySelectorAll('[href^="./assets/"]').forEach(x=>x.setAttribute('href','/new-build/'+x.getAttribute('href').slice(2)));
  [...home.children].forEach(el=>{if(el!==modal)el.style.setProperty('display','none','important')});
  const shell=document.createElement('div');shell.id='linksActualNewBuildHome';while(sourceBody.firstChild)shell.appendChild(sourceBody.firstChild);home.insertBefore(shell,home.firstChild);
  const st=document.createElement('style');st.id='linksActualNewBuildCSS';st.textContent=`body>.wrap{max-width:none!important;width:100%!important;padding:0!important;margin:0!important}#home{max-width:none!important;width:100%!important;margin:0!important;padding:0!important;background:#03080d!important}#linksActualNewBuildHome{display:block!important;width:100%!important;min-height:100vh!important}`+styles+`#linksProdBuild667{position:fixed;right:8px;bottom:8px;z-index:99999;padding:5px 8px;border:1px solid #31566d;border-radius:6px;background:#03080de8;color:#55ef8d;font:900 9px Arial;letter-spacing:1px}`;document.head.appendChild(st);
  const badge=document.createElement('div');badge.id='linksProdBuild667';badge.textContent='LINKS v667';shell.appendChild(badge);
  const openScreen=id=>{const target=document.getElementById(id);if(!target)return false;modal?.classList.add('hide');home.classList.add('hide');target.classList.remove('hide');target.style.removeProperty('display');window.scrollTo(0,0);return true};
  const createPool=()=>{if(!openScreen('createPoolPage'))document.getElementById('showCreatePool')?.click()};
  const linksAdmin=()=>{if(!openScreen('linksAdmin'))document.getElementById('showLinksAdmin')?.click()};
  const poolLogin=()=>{modal?.classList.remove('hide');setTimeout(()=>document.getElementById('poolCodeInput')?.focus(),40)};
  shell.addEventListener('click',e=>{const el=e.target.closest('button,a,[role="button"]');if(!el)return;const txt=(el.textContent||'').trim().toUpperCase(),href=(el.getAttribute('href')||'').toLowerCase();
   if((txt.includes('CREATE')&&txt.includes('POOL'))||href.includes('create')){e.preventDefault();e.stopImmediatePropagation();createPool();return}
   if(txt.includes('LINKS ADMIN')||txt==='ADMIN'||href.includes('admin')){e.preventDefault();e.stopImmediatePropagation();linksAdmin();return}
   if(txt.includes('POOL LOGIN')||txt.includes('ENTER MY POOL')||txt.includes('LOGIN TO POOL')||txt==='SIGN IN'||txt.includes('ENTER POOL')||href.includes('pool-login')){e.preventDefault();e.stopImmediatePropagation();poolLogin();return}
   if(href.startsWith('/new-build/')||href.startsWith('./'))e.preventDefault();
  },true);
 }catch(err){console.error('LINKS New Build transplant failed',err);home.dataset.actualNewBuild='0'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();