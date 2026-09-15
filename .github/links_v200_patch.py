from pathlib import Path
import re
p=Path('public/index.html'); s=p.read_text(encoding='utf-8')
# v208 hotfix — remove the actual one-second compare callback that is blanking/reloading the app.
# The v200 compare enhancer scans the entire DOM every second and can schedule a reload when it thinks picks locked.
# Keep auto-save wiring, but do not run compare() on a timer or during the delayed startup tick.
s=s.replace("function tick(){compare();let b=btn();if(b){badge();b.style.display='none'}}\n setInterval(compare,1000);setTimeout(tick,500);",
            "function tick(){let b=btn();if(b){badge();b.style.display='none'}}\n setTimeout(tick,500);")
# Also neutralize the embedded delayed full-page reload in compare() so it cannot fire from any other call path.
s=s.replace("setTimeout(()=>location.reload(),1500)", "")
s=s.replace("setTimeout(()=>window.location.reload(),1500)", "")
# Remove the temporary v207 controller-change script; it is no longer needed.
s=re.sub(r'\n?<script id="links-v207-stability">[\s\S]*?</script>\n?', '\n', s)
# Version/cache bump only; preserve the v205 Home redesign and all unrelated working features.
s=s.replace('nav-v174/standings.png?v=207','nav-v174/standings.png?v=208')
s=s.replace("navigator.serviceWorker.register('/links-sw.js?v=207'", "navigator.serviceWorker.register('/links-sw.js?v=208'")
s=s.replace('links-pickem-v207','links-pickem-v208')
s=re.sub(r'LINKS PICK[’\']EM POOLS — v\d+','LINKS PICK’EM POOLS — v208',s)
p.write_text(s,encoding='utf-8')
sw=Path('public/links-sw.js')
if sw.exists():
 t=sw.read_text(encoding='utf-8').replace('links-pickem-v207','links-pickem-v208')
 sw.write_text(t,encoding='utf-8')
