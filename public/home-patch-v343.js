(()=>{
'use strict';
async function start(){
 const home=document.getElementById('home'); if(!home||home.dataset.actualNewBuild==='1')return; home.dataset.actualNewBuild='1';
 const modal=document.getElementById('poolLoginModalV150');
 try{
  const res=await fetch('/new-build/index.html?v=668',{cache:'no-store'}); if(!res.ok)throw new Error('New Build source '+res.status);
  const html=await res.text(),doc=new DOMParser().parseFromString(html,'text/html');
  const styles=[...doc.querySelectorAll('style')].map(x=>x.textContent).join('\n').replaceAll("url('./assets/","url('/new-build/assets/").replaceAll('url("./assets/','url("/new-build/assets/').replaceAll("url(./assets/","url(/new-build/assets/");
  const sourceBody=doc.body.cloneNode(true);sourceBody.querySelectorAll('script').forEach(x=>x.remove());sourceBody.querySelectorAll('[src^="./assets/"]').forEach(x=>x.setAttribute('src','/new-build/'+x.getAttribute('src').slice(2)));sourceBody.querySelectorAll('[href^="./assets/"]').forEach(x=>x.setAttribute('href','/new-build/'+x.getAttribute('href').slice(2)));
  [...home.children].forEach(el=>{if(el!==modal)el.style.setProperty('display','none','important')});
  const shell=document.createElement('div');shell.id='linksActualNewBuildHome';while(sourceBody.firstChild)shell.appendChild(sourceBody.firstChild);home.insertBefore(shell,home.firstChild);
  const st=document.createElement('style');st.id='linksActualNewBuildCSS';st.textContent=`body>.wrap{max-width:none!important;width:100%!important;padding:0!important;margin:0!important}#home{max-width:none!important;width:100%!important;margin:0!important;padding:0!important;background:#03080d!important}#linksActualNewBuildHome{display:block!important;width:100%!important;min-height:100vh!important}`+styles+`
#linksProdBuild668{position:fixed;right:8px;bottom:8px;z-index:100002;padding:5px 8px;border:1px solid #31566d;border-radius:6px;background:#03080de8;color:#55ef8d;font:900 9px Arial;letter-spacing:1px}
/* v668 — New Build visual treatment on the proven old Pool Login engine */
#poolLoginModalV150.links-login-modal-v150{position:fixed!important;inset:0!important;z-index:100001!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:18px!important;background:radial-gradient(circle at 50% 18%,rgba(18,70,99,.30),transparent 38%),rgba(2,7,12,.94)!important;backdrop-filter:blur(12px)!important}
#poolLoginModalV150.links-login-modal-v150.hide{display:none!important}
#poolLoginModalV150 .links-login-modal-card-v150{position:relative!important;width:min(94vw,920px)!important;max-height:92vh!important;overflow:auto!important;margin:0!important;padding:0!important;border:1px solid #31566d!important;border-radius:16px!important;background:linear-gradient(145deg,#0b1925 0%,#06101a 55%,#03080d 100%)!important;box-shadow:0 28px 90px #000,0 0 0 1px rgba(229,182,74,.12) inset!important}
#poolLoginModalV150 .links-login-close-v150{position:absolute!important;right:14px!important;top:14px!important;z-index:5!important;width:38px!important;height:38px!important;border-radius:50%!important;border:1px solid #496b82!important;background:#0b1b28!important;color:#fff!important;font-size:18px!important;font-weight:900!important}
#poolLoginModalV150 .player-portal-v2{padding:34px 32px 30px!important;text-align:center!important;background:linear-gradient(180deg,rgba(16,45,64,.38),transparent 34%)!important}
#poolLoginModalV150 .portal-eyebrow-v2{color:#e8bb5b!important;font-size:10px!important;font-weight:1000!important;letter-spacing:3px!important;text-transform:uppercase!important;margin-bottom:7px!important}
#poolLoginModalV150 .portal-title-v2{color:#fff!important;font-size:34px!important;line-height:1!important;font-weight:1000!important;letter-spacing:1px!important;text-shadow:0 3px 12px #000!important}
#poolLoginModalV150 .portal-title-v2:after{content:''!important;display:block!important;width:72px!important;height:2px!important;margin:12px auto!important;background:#e5b64b!important;box-shadow:0 0 12px rgba(229,182,75,.45)!important}
#poolLoginModalV150 .portal-sub-v2{max-width:610px!important;margin:0 auto 24px!important;color:#9fb1bd!important;font-size:12px!important;line-height:1.55!important}
#poolLoginModalV150 .portal-layout-v2{display:grid!important;grid-template-columns:190px minmax(280px,1fr) 190px!important;gap:14px!important;align-items:stretch!important}
#poolLoginModalV150 .portal-side-v2,#poolLoginModalV150 .portal-main-v2{border:1px solid #213b50!important;border-radius:10px!important;background:linear-gradient(145deg,#0b1925,#040a10)!important;box-shadow:inset 0 1px rgba(255,255,255,.04)!important}
#poolLoginModalV150 .portal-side-v2{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;padding:20px 14px!important}
#poolLoginModalV150 .portal-paw-v2{font-size:34px!important;filter:drop-shadow(0 0 10px rgba(229,182,75,.25))!important;margin-bottom:12px!important}
#poolLoginModalV150 .portal-side-copy-v2{color:#9fb1bd!important;font-size:9px!important;font-weight:900!important;letter-spacing:1px!important;line-height:1.7!important}
#poolLoginModalV150 .portal-main-v2{position:relative!important;padding:24px!important;text-align:left!important;border-color:#31566d!important;background:linear-gradient(180deg,#0d2130,#07121b)!important}
#poolLoginModalV150 .portal-label-v2{display:block!important;color:#e8bb5b!important;font-size:10px!important;font-weight:1000!important;letter-spacing:2px!important;margin-bottom:8px!important}
#poolLoginModalV150 #poolCodeInput{width:100%!important;min-height:52px!important;padding:0 14px!important;border:1px solid #486b83!important;border-radius:7px!important;background:#030a10!important;color:#fff!important;font-size:15px!important;outline:none!important;box-shadow:inset 0 2px 10px #000!important}
#poolLoginModalV150 #poolCodeInput:focus{border-color:#5fc8e5!important;box-shadow:0 0 0 3px rgba(95,200,229,.12),inset 0 2px 10px #000!important}
#poolLoginModalV150 #poolSearchHelp{color:#718896!important;font-size:9px!important;margin:7px 2px 13px!important}
#poolLoginModalV150 .pool-search-results{background:#06111a!important;border-color:#31566d!important;color:#fff!important}
#poolLoginModalV150 #enterPoolBtn{width:100%!important;min-height:48px!important;margin-top:12px!important;border:1px solid #54b9d8!important;border-radius:6px!important;background:linear-gradient(180deg,#1880a4,#0b4965)!important;color:#fff!important;font-size:11px!important;font-weight:1000!important;letter-spacing:.8px!important;box-shadow:inset 0 1px rgba(255,255,255,.12),0 7px 18px #0009!important}
#poolLoginModalV150 #enterPoolBtn:hover{border-color:#83d7ee!important;box-shadow:0 0 18px rgba(47,157,199,.35),0 7px 18px #0009!important}
#poolLoginModalV150 .portal-error-v2{color:#ff8a8f!important;font-size:11px!important;font-weight:800!important;margin-top:8px!important}
#poolLoginModalV150 .portal-commissioner-btn-v2{width:100%!important;min-height:52px!important;padding:10px!important;border:1px solid #c9953d!important;border-radius:6px!important;background:linear-gradient(180deg,#75501b,#33210b)!important;color:#fff3d1!important;font-size:9px!important;font-weight:1000!important;line-height:1.4!important;box-shadow:0 5px 14px #0008!important}
@media(max-width:760px){#poolLoginModalV150.links-login-modal-v150{padding:8px!important;align-items:flex-start!important;overflow:auto!important}#poolLoginModalV150 .links-login-modal-card-v150{width:100%!important;max-height:none!important;margin:10px 0!important;border-radius:12px!important}#poolLoginModalV150 .player-portal-v2{padding:30px 14px 18px!important}#poolLoginModalV150 .portal-title-v2{font-size:27px!important}#poolLoginModalV150 .portal-sub-v2{font-size:10px!important;margin-bottom:16px!important;padding:0 18px!important}#poolLoginModalV150 .portal-layout-v2{grid-template-columns:1fr!important;gap:8px!important}#poolLoginModalV150 .portal-side-v2.left-v2{display:none!important}#poolLoginModalV150 .portal-main-v2{order:1!important;padding:18px 14px!important}#poolLoginModalV150 .portal-side-v2.right-v2{order:2!important;padding:10px!important}#poolLoginModalV150 .portal-paw-v2{display:none!important}#poolLoginModalV150 #poolCodeInput{min-height:50px!important;font-size:16px!important}#poolLoginModalV150 #enterPoolBtn{min-height:50px!important}}
`;document.head.appendChild(st);
  const badge=document.createElement('div');badge.id='linksProdBuild668';badge.textContent='LINKS v668';shell.appendChild(badge);
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