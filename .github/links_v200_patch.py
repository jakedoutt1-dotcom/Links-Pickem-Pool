from pathlib import Path
import re
p=Path('public/index.html'); s=p.read_text(encoding='utf-8')
# Keep Standings artwork full color.
s=re.sub(r'nav-v174/standings\.png(?:\?v=[^"\']+)?','nav-v174/standings.png?v=200b',s)
# Durable CSS override for any older inactive grayscale rule.
css='<style id="standings-color-v200b">button[data-tab="standings"] img.links-nav-art-v174{filter:none!important;-webkit-filter:none!important;opacity:1!important}</style>'
if 'standings-color-v200b' not in s:s=s.replace('</head>',css+'\n</head>',1)
# Remove the MutationObserver that was calling the whole tick routine for every DOM change.
# The countdown itself may update once per second; page-wide mutation-driven refresh must not.
s=s.replace("new MutationObserver(tick).observe(document.body,{childList:true,subtree:true});setInterval(compare,1000);setTimeout(tick,500);", "setInterval(compare,1000);setTimeout(tick,500);")
# Keep PWA update checks limited to app load and return from background, with no forced page reload.
s=s.replace("navigator.serviceWorker.register('/links-sw.js?v=200a'", "navigator.serviceWorker.register('/links-sw.js?v=200b'")
s=s.replace("links-pickem-v200a","links-pickem-v200b")
p.write_text(s,encoding='utf-8')
sw=Path('public/links-sw.js')
if sw.exists():
 t=sw.read_text(encoding='utf-8').replace('links-pickem-v200a','links-pickem-v200b').replace('links-pickem-v200','links-pickem-v200b')
 sw.write_text(t,encoding='utf-8')
