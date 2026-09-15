from pathlib import Path
import re
p=Path('public/index.html'); s=p.read_text(encoding='utf-8')
# v204 — Pool commissioner button: simply ADMIN and exactly the same geometry as the other nav tiles.
css='''<style id="links-nav-v204">
#app .tabs button[data-tab="admin"]{min-height:0!important;height:auto!important;padding:0!important;border-radius:10px!important;border:1px solid #5b4739!important;background:linear-gradient(135deg,#17120f,#090d10 62%,#1c110b)!important;color:#fff!important;font-size:16px!important;font-weight:950!important;letter-spacing:.5px!important;text-shadow:0 2px 3px #000!important;box-shadow:inset 0 0 0 1px rgba(255,132,60,.08)!important;position:relative;overflow:hidden}
#app .tabs button[data-tab="admin"]:before{content:none!important;display:none!important}
#app .tabs button[data-tab="admin"]:after{content:none!important;display:none!important}
#app .tabs button[data-tab="admin"]:not(.active){box-shadow:inset 0 0 0 1px rgba(255,132,60,.08)!important}
#app .tabs button[data-tab="admin"].active{border-color:#ff7a2d!important;background:linear-gradient(135deg,#28140a,#101316 60%,#301407)!important;box-shadow:0 0 0 2px rgba(255,106,26,.5),0 0 16px rgba(255,106,26,.55)!important}
</style>'''
if 'links-nav-v204' not in s:s=s.replace('</head>',css+'\n</head>',1)
# Keep the visible label simple. Existing gear is fine; no LINKS badge or arrow.
s=s.replace('>⚙️ ADMIN</button>','>⚙️ ADMIN</button>')
s=s.replace('nav-v174/standings.png?v=203','nav-v174/standings.png?v=204')
s=s.replace("navigator.serviceWorker.register('/links-sw.js?v=203'", "navigator.serviceWorker.register('/links-sw.js?v=204'")
s=s.replace('links-pickem-v203','links-pickem-v204')
s=re.sub(r'LINKS PICK[’\']EM POOLS — v\d+','LINKS PICK’EM POOLS — v204',s)
p.write_text(s,encoding='utf-8')
sw=Path('public/links-sw.js')
if sw.exists():
 t=sw.read_text(encoding='utf-8').replace('links-pickem-v203','links-pickem-v204')
 sw.write_text(t,encoding='utf-8')
