from pathlib import Path
import re
p=Path('public/index.html'); s=p.read_text(encoding='utf-8')
# v202 — redesign the complete Home game/pricing flow with webpage styling only.
# Remove the generic emoji category marks and repeated logo thumbnails from the Home category area.
s=s.replace('<span class="links-cat-icon-v193">🏈</span>','<span class="links-cat-mark-v202 nfl" aria-hidden="true"></span>',1)
s=s.replace('<span class="links-cat-icon-v193">🏆</span>','<span class="links-cat-mark-v202 college" aria-hidden="true"></span>',1)
s=s.replace('<span class="links-cat-icon-v193">🏁</span>','<span class="links-cat-mark-v202 other" aria-hidden="true"></span>',1)
s=s.replace('<span class="links-cat-icon-v193">🏈</span>','<span class="links-cat-mark-v202 fantasy" aria-hidden="true"></span>',1)
css='''<style id="links-home-v202">
/* One continuous LINKS home flow — no generated artwork or generic emoji logos. */
.links-games-categories-v193,.links-package-section-v193,.links-install-app,.benefit-strip-v2,.links-owner-tools-v118{position:relative;overflow:hidden;border-color:#314957!important;background:linear-gradient(180deg,#0d171e 0%,#070d12 100%)!important;box-shadow:0 14px 34px rgba(0,0,0,.28)!important}
.links-games-categories-v193:before,.links-package-section-v193:before{content:'';position:absolute;inset:0 0 auto;height:3px;background:linear-gradient(90deg,transparent,#ff6a1a 20%,#f0b24a 50%,#ff6a1a 80%,transparent);opacity:.9}
.links-category-list-v193{display:grid!important;gap:11px!important}
.links-category-v193{border:1px solid #344d5c!important;border-radius:15px!important;background:linear-gradient(135deg,#101c24,#091116)!important;box-shadow:inset 0 1px rgba(255,255,255,.035),0 8px 20px rgba(0,0,0,.22);overflow:hidden}
.links-category-v193 summary{position:relative;display:grid!important;grid-template-columns:64px minmax(0,1fr) auto!important;align-items:center!important;gap:13px!important;min-height:92px;padding:15px 18px!important;cursor:pointer;list-style:none}
.links-category-v193 summary::-webkit-details-marker{display:none}.links-category-v193 summary:after{content:'›';font-size:30px;font-weight:1000;color:#ff7b2d;transition:transform .18s ease}.links-category-v193[open] summary:after{transform:rotate(90deg)}
.links-category-v193 summary em{font-style:normal!important;color:#70c9ff!important;font-weight:950!important;letter-spacing:.5px;font-size:12px!important}.links-category-v193 summary b{font-size:20px!important;letter-spacing:.3px}.links-category-v193 summary small{display:block;color:#93a8b6!important;margin-top:3px;font-size:13px!important}
.links-cat-mark-v202{width:54px;height:54px;border-radius:12px;border:1px solid #466172;display:block;position:relative;background:linear-gradient(145deg,#172732,#0a1117);box-shadow:inset 0 0 0 3px #0a1117,0 4px 10px #0007}
.links-cat-mark-v202:before,.links-cat-mark-v202:after{content:'';position:absolute}
.links-cat-mark-v202.nfl:before{width:30px;height:18px;border:3px solid #ff7a2c;border-radius:55% 55% 55% 55%;left:9px;top:15px;transform:rotate(-22deg)}.links-cat-mark-v202.nfl:after{width:14px;height:2px;background:#f6d6b9;left:20px;top:25px;transform:rotate(-22deg);box-shadow:0 -4px 0 -1px #f6d6b9,0 4px 0 -1px #f6d6b9}
.links-cat-mark-v202.college:before{left:12px;right:12px;bottom:10px;height:4px;background:#f0b24a;box-shadow:5px -7px 0 #f0b24a,10px -14px 0 #f0b24a,15px -21px 0 #f0b24a}.links-cat-mark-v202.college:after{width:28px;height:2px;left:12px;top:13px;background:#70c9ff;box-shadow:0 7px #70c9ff,0 14px #70c9ff}
.links-cat-mark-v202.other:before{width:31px;height:20px;left:12px;top:12px;background:repeating-conic-gradient(#e8edf0 0 25%,#18242c 0 50%) 0/10px 10px;transform:skewY(-7deg)}.links-cat-mark-v202.other:after{width:3px;height:35px;background:#ff6a1a;left:10px;top:10px}
.links-cat-mark-v202.fantasy:before{width:28px;height:28px;border:3px solid #70c9ff;border-radius:50%;left:10px;top:9px}.links-cat-mark-v202.fantasy:after{width:23px;height:10px;border:3px solid #ff7a2c;border-top:0;border-radius:0 0 12px 12px;left:13px;top:32px}
.links-category-games-v193{padding:8px 12px 14px!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;border-top:1px solid #243946}
.links-category-games-v193>div{position:relative;display:block!important;min-height:88px;padding:14px 38px 14px 15px!important;border:1px solid #2d4554!important;border-radius:11px!important;background:linear-gradient(135deg,#101a21,#080e13)!important;box-shadow:none!important}.links-category-games-v193>div:after{content:'›';position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:28px;color:#ff7a2c;font-weight:1000}.links-category-games-v193>div img{display:none!important}.links-category-games-v193>div b{color:#fff!important;font-size:14px!important}.links-category-games-v193>div small{display:block!important;color:#9eb0bc!important;line-height:1.35!important;margin-top:5px!important;font-size:11px!important}
.links-package-section-v193{margin-top:16px!important}.links-package-grid-v150{gap:10px!important}.links-package-card-v150{border:1px solid #344d5c!important;background:linear-gradient(145deg,#111c24,#080f14)!important;border-radius:14px!important;box-shadow:0 8px 20px rgba(0,0,0,.2)!important}.links-package-card-v150.featured{border-color:#ff7428!important;box-shadow:0 0 0 1px rgba(255,116,40,.25),0 10px 25px rgba(0,0,0,.28)!important}.links-package-card-v150 h3{letter-spacing:.7px}.links-package-card-v150 button{border-radius:9px!important;font-weight:950!important}
.links-install-app{margin-top:16px!important}.benefit-strip-v2{margin-top:14px!important}.links-owner-tools-v118{margin-top:14px!important}
@media(max-width:700px){.links-category-v193 summary{grid-template-columns:52px minmax(0,1fr) auto!important;min-height:84px;padding:13px!important;gap:10px!important}.links-cat-mark-v202{width:46px;height:46px}.links-category-v193 summary em{display:none!important}.links-category-v193 summary b{font-size:18px!important}.links-category-games-v193{grid-template-columns:1fr!important}.links-category-games-v193>div{min-height:76px}.links-cat-mark-v202.nfl:before{left:6px;top:12px}.links-cat-mark-v202.nfl:after{left:17px;top:22px}.links-cat-mark-v202.college:before{left:9px;right:9px;bottom:8px}.links-cat-mark-v202.college:after{left:9px;top:10px}.links-cat-mark-v202.other:before{left:9px;top:9px}.links-cat-mark-v202.other:after{left:7px;top:8px}.links-cat-mark-v202.fantasy:before{left:7px;top:6px}.links-cat-mark-v202.fantasy:after{left:10px;top:29px}}
</style>'''
if 'links-home-v202' not in s:s=s.replace('</head>',css+'\n</head>',1)
# Remove v201 emoji pseudo-icons from the old showcase if present; v202 uses structure/lines instead.
s=re.sub(r'\.links-games-grid-v4 \.links-game-v4:nth-child\([^\n]+\n','',s)
s=s.replace("nav-v174/standings.png?v=201","nav-v174/standings.png?v=202")
s=s.replace("navigator.serviceWorker.register('/links-sw.js?v=201'", "navigator.serviceWorker.register('/links-sw.js?v=202'")
s=s.replace('links-pickem-v201','links-pickem-v202')
s=re.sub(r'LINKS PICK[’\']EM POOLS — v\d+','LINKS PICK’EM POOLS — v202',s)
p.write_text(s,encoding='utf-8')
sw=Path('public/links-sw.js')
if sw.exists():
 t=sw.read_text(encoding='utf-8').replace('links-pickem-v201','links-pickem-v202')
 sw.write_text(t,encoding='utf-8')
