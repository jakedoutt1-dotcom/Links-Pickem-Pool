(()=>{
'use strict';
const isStandings=b=>{const img=b?.querySelector('img');const src=(img?.getAttribute('src')||'').toLowerCase();return src.includes('standings')||String(b?.textContent||'').trim().toUpperCase().includes('STANDINGS')};
function fix(){document.querySelectorAll('.tabs .player-tab').forEach(b=>{if(!isStandings(b))return;b.classList.add('links-standings-current');b.disabled=false;b.removeAttribute('disabled');b.removeAttribute('aria-disabled');const img=b.querySelector('img');if(img){img.style.opacity='1';img.style.filter='none'};b.style.opacity='1';b.style.filter='none';b.style.pointerEvents='auto';if(!b.classList.contains('active')){b.style.boxShadow='none';b.style.borderColor='#44566c'}else{b.style.boxShadow='0 0 0 2px #2f78ff,0 0 16px rgba(47,120,255,.65)';b.style.borderColor='#69a2ff'}})}
const start=()=>{fix();new MutationObserver(()=>requestAnimationFrame(fix)).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','class','style','src']});setInterval(fix,800)};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();