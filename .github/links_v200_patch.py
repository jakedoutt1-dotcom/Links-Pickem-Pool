from pathlib import Path
import re
p=Path('public/index.html'); s=p.read_text(encoding='utf-8')
# Permanently keep the existing Standings artwork full color, selected or not.
s=re.sub(r'\.tabs \[data-tab="standings"\]:not\(\.active\) img\.links-nav-art-v174\{[^}]*\}', '.tabs [data-tab="standings"] img.links-nav-art-v174{filter:none!important;opacity:1!important}', s)
s=re.sub(r'nav-v174/standings\.png(?:\?v=\d+)?','nav-v174/standings.png?v=200a',s)
# Stop v200 PWA from forcing a controller-change reload that can erase pool-selection state.
s=s.replace("if('serviceWorker'in navigator){let reload=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!reload){reload=true;location.reload()}});const reg=()=>navigator.serviceWorker.register('/links-sw.js?v=200',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});window.addEventListener('load',reg);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg()})}", "if('serviceWorker'in navigator){const reg=()=>navigator.serviceWorker.register('/links-sw.js?v=200a',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});window.addEventListener('load',reg);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg()})}")
# Cache version bump without forced navigation reload.
s=s.replace("links-pickem-v200","links-pickem-v200a")
p.write_text(s,encoding='utf-8')
sw=Path('public/links-sw.js')
if sw.exists():
 t=sw.read_text(encoding='utf-8').replace("links-pickem-v200","links-pickem-v200a")
 sw.write_text(t,encoding='utf-8')
