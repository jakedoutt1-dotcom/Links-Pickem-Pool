from pathlib import Path
import re
p=Path('public/index.html'); s=p.read_text(encoding='utf-8')
# v206 hotfix — prevent one-second countdown/compare updates from triggering page-wide rerenders.
# Remove the known broad observer loop if any prior build reintroduced it.
s=re.sub(r"new\s+MutationObserver\s*\(\s*tick\s*\)\s*\.observe\s*\(\s*document\.body\s*,\s*\{\s*childList\s*:\s*true\s*,\s*subtree\s*:\s*true\s*\}\s*\)\s*;?", "", s)
s=re.sub(r"new\s+MutationObserver\s*\(\s*\(\s*\)\s*=>\s*tick\(\)\s*\)\s*\.observe\s*\(\s*document\.body\s*,\s*\{[^}]*subtree\s*:\s*true[^}]*\}\s*\)\s*;?", "", s)
# Never force a full page reload from service-worker controller changes.
s=re.sub(r"navigator\.serviceWorker\.addEventListener\(\s*['\"]controllerchange['\"]\s*,\s*\(\s*\)\s*=>\s*\{[^}]*location\.reload\(\)[^}]*\}\s*\)\s*;?", "", s)
# If the compare lock timer still contains its old forced reload, let normal UI navigation/rendering handle the lock instead.
s=s.replace("location.reload(); // compare-lock-refresh", "")
s=s.replace("location.reload();// compare-lock-refresh", "")
# Cache/version bump only; preserve v205 Home styling.
s=s.replace('nav-v174/standings.png?v=205','nav-v174/standings.png?v=206')
s=s.replace("navigator.serviceWorker.register('/links-sw.js?v=205'", "navigator.serviceWorker.register('/links-sw.js?v=206'")
s=s.replace('links-pickem-v205','links-pickem-v206')
s=re.sub(r'LINKS PICK[’\']EM POOLS — v\d+','LINKS PICK’EM POOLS — v206',s)
p.write_text(s,encoding='utf-8')
sw=Path('public/links-sw.js')
if sw.exists():
 t=sw.read_text(encoding='utf-8').replace('links-pickem-v205','links-pickem-v206')
 sw.write_text(t,encoding='utf-8')
