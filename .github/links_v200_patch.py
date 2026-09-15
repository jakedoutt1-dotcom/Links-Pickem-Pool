from pathlib import Path
import re
p=Path('public/index.html'); s=p.read_text(encoding='utf-8')
# v209 rollback/fix — remove the entire unstable v200 enhancement block.
# This restores the native app behavior underneath it while preserving the v205 Home redesign.
s=re.sub(r'\n?<style id="links-v200-style">[\s\S]*?</style>\s*<script id="links-v200-features">[\s\S]*?</script>\n?', '\n', s, count=1)
# Defensive cleanup in case either half of the old add-on exists by itself.
s=re.sub(r'\n?<style id="links-v200-style">[\s\S]*?</style>\n?', '\n', s, count=1)
s=re.sub(r'\n?<script id="links-v200-features">[\s\S]*?</script>\n?', '\n', s, count=1)
# Remove temporary stability scripts from the previous hotfixes if present.
s=re.sub(r'\n?<script id="links-v207-stability">[\s\S]*?</script>\n?', '\n', s)
# Version/cache bump. Do not change the v205 Home design or unrelated features.
s=s.replace('nav-v174/standings.png?v=208','nav-v174/standings.png?v=209')
s=s.replace("navigator.serviceWorker.register('/links-sw.js?v=208'", "navigator.serviceWorker.register('/links-sw.js?v=209'")
s=s.replace('links-pickem-v208','links-pickem-v209')
s=re.sub(r'LINKS PICK[’\']EM POOLS — v\d+','LINKS PICK’EM POOLS — v209',s)
p.write_text(s,encoding='utf-8')
sw=Path('public/links-sw.js')
if sw.exists():
 t=sw.read_text(encoding='utf-8').replace('links-pickem-v208','links-pickem-v209')
 sw.write_text(t,encoding='utf-8')
