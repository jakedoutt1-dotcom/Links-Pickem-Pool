from pathlib import Path
import re
p=Path('public/index.html'); s=p.read_text(encoding='utf-8')
# v203 — navigation active state cleanup + commissioner ADMIN button polish.
css='''<style id="links-nav-v203">
/* Inactive nav buttons stay clean; only the actual active tab receives the electric-blue selection halo. */
#app .tabs button.player-tab{box-shadow:none!important;outline:none!important;filter:none!important;transition:border-color .14s ease,box-shadow .14s ease,transform .14s ease!important}
#app .tabs button.player-tab:not(.active){border-color:#344754!important;background:#080d11!important}
#app .tabs button.player-tab:not(.active) img.links-nav-art-v174{filter:none!important;-webkit-filter:none!important;opacity:.84!important;box-shadow:none!important}
#app .tabs button.player-tab.active{border-color:#39baff!important;box-shadow:0 0 0 2px #1a91d6,0 0 16px rgba(50,184,255,.72)!important;transform:translateY(-1px)}
#app .tabs button.player-tab.active img.links-nav-art-v174{filter:none!important;-webkit-filter:none!important;opacity:1!important}
/* Standings artwork stays full color, but cannot impersonate an active tab when another page is selected. */
#app .tabs button[data-tab="standings"]:not(.active){border-color:#344754!important;box-shadow:none!important;filter:saturate(.78) brightness(.82)!important}
#app .tabs button[data-tab="standings"]:not(.active) img{opacity:.86!important}
/* Commissioner button uses the same LINKS nav geometry with a restrained orange identity. */
#app .tabs button[data-tab="admin"]{position:relative;min-height:72px!important;border:1px solid #5b4739!important;border-radius:10px!important;background:linear-gradient(135deg,#17120f,#090d10 62%,#1c110b)!important;color:#fff!important;font-size:16px!important;font-weight:950!important;letter-spacing:.5px!important;text-shadow:0 2px 3px #000!important;box-shadow:inset 0 0 0 1px rgba(255,132,60,.08)!important;overflow:hidden}
#app .tabs button[data-tab="admin"]:before{content:'LINKS';display:inline-flex;align-items:center;justify-content:center;margin-right:9px;padding:4px 6px;border:1px solid #ff7a2d;border-radius:5px;color:#ff9a5b;font-size:9px;letter-spacing:1px;vertical-align:2px;background:#160d08}
#app .tabs button[data-tab="admin"]:after{content:'›';position:absolute;right:13px;top:50%;transform:translateY(-50%);color:#ff7a2d;font-size:25px}
#app .tabs button[data-tab="admin"]:not(.active){box-shadow:inset 0 0 0 1px rgba(255,132,60,.08)!important}
#app .tabs button[data-tab="admin"].active{border-color:#ff7a2d!important;background:linear-gradient(135deg,#28140a,#101316 60%,#301407)!important;box-shadow:0 0 0 2px rgba(255,106,26,.5),0 0 16px rgba(255,106,26,.55)!important}
@media(max-width:600px){#app .tabs button[data-tab="admin"]{min-height:68px!important;font-size:15px!important}#app .tabs button[data-tab="admin"]:before{font-size:8px;margin-right:6px}}
</style>'''
if 'links-nav-v203' not in s:s=s.replace('</head>',css+'\n</head>',1)
# Cache/version bump.
s=s.replace('nav-v174/standings.png?v=202','nav-v174/standings.png?v=203')
s=s.replace("navigator.serviceWorker.register('/links-sw.js?v=202'", "navigator.serviceWorker.register('/links-sw.js?v=203'")
s=s.replace('links-pickem-v202','links-pickem-v203')
s=re.sub(r'LINKS PICK[’\']EM POOLS — v\d+','LINKS PICK’EM POOLS — v203',s)
p.write_text(s,encoding='utf-8')
sw=Path('public/links-sw.js')
if sw.exists():
 t=sw.read_text(encoding='utf-8').replace('links-pickem-v202','links-pickem-v203')
 sw.write_text(t,encoding='utf-8')
