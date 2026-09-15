from pathlib import Path
import re
p=Path('public/index.html'); s=p.read_text(encoding='utf-8')
s=s.replace('LINKS PICK’EM POOLS — v199','LINKS PICK’EM POOLS — v200').replace('LINKS PICK’EM POOLS — v198 • GOOD BOY','LINKS PICK’EM POOLS — v200')
s=re.sub(r'nav-v174/standings\.png(?:\?v=\d+)?','nav-v174/standings.png?v=200',s)
addon='''
<style id="links-v200-style">.compare-reveal-v200{display:flex!important;flex-direction:column;gap:6px;align-items:center;padding:18px!important;border:2px solid #ff9d2e!important;border-radius:16px;background:#21170f!important;text-align:center}.compare-reveal-v200 strong{color:#ffb55a}.compare-reveal-v200 span{font-size:30px;font-weight:900}.compare-reveal-v200.urgent{border-color:#ff3b30!important}.autosave-v200{margin:12px 0;padding:12px;border-radius:12px;text-align:center;font-weight:900;background:#12351f;border:1px solid #31d77a;color:#8dffb7}</style>
<script id="links-v200-features">
(()=>{
 const lock=()=>{try{const w=window.boot&&window.boot.locks,k=window.week||window.officialWeek;return w&&(w[k]||w[String(k)])}catch(e){return null}};
 const fmt=ms=>{let t=Math.max(0,Math.floor(ms/1000)),d=Math.floor(t/86400),h=Math.floor(t%86400/3600),m=Math.floor(t%3600/60),x=t%60;return `${d?d+'D ':''}${String(h).padStart(2,'0')}H ${String(m).padStart(2,'0')}M ${String(x).padStart(2,'0')}S`};
 function compare(){const l=lock();if(!l)return;const ms=Date.parse(l)-Date.now();document.querySelectorAll('*').forEach(el=>{if(el.children.length===0&&el.textContent.trim()==='Picks are still open.'){el.classList.add('compare-reveal-v200');if(ms<=0){el.innerHTML='<strong>🔓 PICKS ARE LOCKED — EVERYONE’S PICKS ARE AVAILABLE</strong>';setTimeout(()=>location.reload(),1500)}else{el.innerHTML=`<strong>⏰ EVERYONE’S PICKS REVEAL IN</strong><span>${fmt(ms)}</span><small>${new Date(l).toLocaleString()}</small>`;el.classList.toggle('urgent',ms<=21600000)}}})}
 let saving=false,deb=null;
 function btn(){return [...document.querySelectorAll('button')].find(b=>/SAVE MY PICKS/i.test(b.textContent||''))}
 function badge(){let x=document.getElementById('autosaveV200'),b=btn();if(!x&&b){x=document.createElement('div');x.id='autosaveV200';x.className='autosave-v200';x.textContent='✓ PICKS AUTO-SAVE';b.insertAdjacentElement('afterend',x)}return x}
 function save(){let b=btn(),x=badge();if(!b||b.disabled||saving)return;saving=true;if(x)x.textContent='SAVING…';b.click();setTimeout(()=>{saving=false;if(x)x.textContent='✓ PICKS SAVED'},800)}
 document.addEventListener('click',e=>{if(e.target.closest('[data-team],.team-card,.pick-team,.team-option'))setTimeout(save,50)},true);
 document.addEventListener('input',e=>{if(/tie/i.test((e.target.id||'')+' '+(e.target.name||'')+' '+(e.target.closest('div')?.textContent||''))){clearTimeout(deb);deb=setTimeout(save,650)}},true);
 function tick(){compare();let b=btn();if(b){badge();b.style.display='none'}}
 new MutationObserver(tick).observe(document.body,{childList:true,subtree:true});setInterval(compare,1000);setTimeout(tick,500);
 if('serviceWorker'in navigator){let reload=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!reload){reload=true;location.reload()}});const reg=()=>navigator.serviceWorker.register('/links-sw.js?v=200',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});window.addEventListener('load',reg);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg()})}
})();
</script>
'''
if 'id="links-v200-features"' not in s:s=s.replace('</body>',addon+'\n</body>',1)
p.write_text(s,encoding='utf-8')
Path('public/links-sw.js').write_text("""const CACHE='links-pickem-v200';self.addEventListener('install',e=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('links-pickem-')&&x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{let r=e.request;if(r.method!=='GET')return;let u=new URL(r.url);if(u.origin!==location.origin)return;if(r.mode==='navigate'){e.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match('/index.html')));return}e.respondWith(fetch(r).then(x=>{if(x.ok){let c=x.clone();caches.open(CACHE).then(z=>z.put(r,c))}return x}).catch(()=>caches.match(r)))})""",encoding='utf-8')
hp=Path('public/_headers');h=hp.read_text(encoding='utf-8');
if '/links-sw.js' not in h:h+='\n/links-sw.js\n  Cache-Control: no-cache, no-store, must-revalidate\n'
hp.write_text(h,encoding='utf-8')
