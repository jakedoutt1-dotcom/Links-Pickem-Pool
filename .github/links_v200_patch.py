from pathlib import Path
import re
p=Path('public/index.html'); s=p.read_text(encoding='utf-8')
# v207 hotfix — hard-stop the reload/reset regression without touching the v205 Home design.
# Remove any service-worker controller-change handler that can reload/reset the SPA.
s=re.sub(r"navigator\.serviceWorker\.addEventListener\(\s*['\"]controllerchange['\"][\s\S]*?\)\s*;", "", s)
# Remove the known broad DOM observer loop that turns a one-second countdown mutation into a page rerender loop.
s=re.sub(r"new\s+MutationObserver\s*\([^;]*?\)\.observe\(document\.body,[^;]*?\);", "", s)
# Remove forced full-page reload calls from timer/countdown code. Normal tab render handles state changes.
s=s.replace('location.reload();','')
s=s.replace('window.location.reload();','')
# Add a guard so future SW controller changes never force navigation during an active session.
guard='''<script id="links-v207-stability">\n// v207: timers may update text only; never reload the document on service-worker takeover.\nif('serviceWorker' in navigator){navigator.serviceWorker.addEventListener('controllerchange',()=>{console.info('LINKS service worker updated; reload deferred until normal navigation.');});}\n</script>'''
if 'links-v207-stability' not in s:s=s.replace('</body>',guard+'\n</body>',1)
s=s.replace('nav-v174/standings.png?v=206','nav-v174/standings.png?v=207')
s=s.replace("navigator.serviceWorker.register('/links-sw.js?v=206'", "navigator.serviceWorker.register('/links-sw.js?v=207'")
s=s.replace('links-pickem-v206','links-pickem-v207')
s=re.sub(r'LINKS PICK[’\']EM POOLS — v\d+','LINKS PICK’EM POOLS — v207',s)
p.write_text(s,encoding='utf-8')
sw=Path('public/links-sw.js')
if sw.exists():
 t=sw.read_text(encoding='utf-8').replace('links-pickem-v206','links-pickem-v207')
 sw.write_text(t,encoding='utf-8')
