from pathlib import Path
import re
p=Path('public/index.html'); s=p.read_text(encoding='utf-8')
# v205 — recreate the approved LINKS concept as a real responsive webpage, not a pasted/generated image.
css='''<style id="links-home-v205">
#home{--wood1:#24150d;--wood2:#100a07;--steel:#52636d;--orange:#ff6b1b;--gold:#e9aa42}
#home .links-sales-hero-v193,#home .links-games-categories-v193,#home .links-package-section-v193{border:2px solid #4a5961!important;border-radius:17px!important;background:linear-gradient(90deg,rgba(255,255,255,.025),transparent 15%,rgba(255,255,255,.02) 45%,transparent 72%),repeating-linear-gradient(2deg,rgba(255,255,255,.018) 0 1px,transparent 1px 7px),linear-gradient(145deg,var(--wood1),var(--wood2))!important;box-shadow:inset 0 0 0 3px #08090a,inset 0 0 22px #000,0 13px 28px #0009!important}
#home .links-sales-hero-v193:before,#home .links-games-categories-v193:before,#home .links-package-section-v193:before{content:'';position:absolute;inset:7px;border:1px solid rgba(223,169,91,.25);border-radius:11px;pointer-events:none}
#home .links-sales-hero-v193 h1,#home .links-games-categories-v193 h2,#home .links-package-section-v193 h2{text-shadow:0 3px 0 #000,0 0 10px #000!important;letter-spacing:.7px}
#home .links-no-busywork-v193{margin:16px -10px -4px!important;padding:17px 12px!important;color:#f1bd54!important;font-weight:1000!important;letter-spacing:1px!important;border-top:1px solid #6e3b1f;border-bottom:1px solid #6e3b1f;background:linear-gradient(90deg,#100805,#2b170c,#100805)!important;text-shadow:0 2px #000}
#home .links-benefits-v193{gap:9px!important}.links-benefits-v193>div{position:relative;border:1px solid #5b6870!important;border-radius:11px!important;background:linear-gradient(145deg,#17130f,#080a0c)!important;box-shadow:inset 0 0 0 2px #0b0c0d,0 5px 12px #0007!important;padding:14px 9px!important}.links-benefits-v193>div b{color:#f2eee8!important;text-shadow:0 2px #000}.links-benefits-v193>div span{color:#c4c9cc!important}
#home .links-games-categories-v193{padding-top:34px!important}.links-games-categories-v193>.kicker{color:#e7b263!important;letter-spacing:2px!important;font-weight:900!important}.links-games-categories-v193>.lead{color:#e7e7e7!important}
#home .links-category-list-v193{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important;margin-top:22px!important}
#home .links-category-v193{border:2px solid #667078!important;border-radius:13px!important;background:linear-gradient(180deg,#15202a 0 45%,#25150d 46% 100%)!important;box-shadow:inset 0 0 0 3px #080a0c,0 8px 18px #0008!important;overflow:hidden}
#home .links-category-v193 summary{min-height:142px!important;padding:78px 16px 14px!important;display:grid!important;grid-template-columns:1fr auto!important;gap:7px!important;align-items:end!important;background:radial-gradient(ellipse at 50% 10%,rgba(80,170,225,.2),transparent 55%),linear-gradient(180deg,#152630,#0a1014 54%,rgba(0,0,0,.1) 55%)!important}
#home .links-category-v193 summary .links-cat-mark-v202{position:absolute!important;left:18px!important;top:18px!important;width:55px!important;height:55px!important;transform:scale(1.05);border-color:#9b6b43!important;background:linear-gradient(145deg,#2b1a10,#0b0d0f)!important}
#home .links-category-v193 summary>span:nth-of-type(2){grid-column:1;min-width:0}#home .links-category-v193 summary b{font-size:19px!important;color:#f5f1e9!important;text-shadow:0 2px #000}#home .links-category-v193 summary small{color:#d3d5d6!important;text-transform:uppercase;letter-spacing:1px;font-size:10px!important}#home .links-category-v193 summary em{display:none!important}#home .links-category-v193 summary:after{grid-column:2;grid-row:1;content:'›'!important;width:40px;height:40px;display:grid;place-items:center;border:1px solid #9c4b1e;border-radius:9px;background:#170c07;color:#ff762b!important;font-size:31px!important;box-shadow:inset 0 0 9px #000}
#home .links-category-v193[open] summary:after{transform:rotate(90deg)}
#home .links-category-games-v193{grid-column:1/-1;grid-template-columns:1fr!important;background:#080c0f!important;padding:10px!important}.links-category-games-v193>div{background:linear-gradient(135deg,#23150e,#0b0d0f)!important;border-color:#57483d!important}.links-category-games-v193>div:after{color:#ff762b!important}
#home .links-package-section-v193{margin-top:18px!important;padding-top:34px!important}.links-package-section-v193>.kicker{color:#e7b263!important;letter-spacing:2px!important}.links-package-card-v150{background:linear-gradient(155deg,#24150d,#090c0e)!important;border:2px solid #555f64!important;box-shadow:inset 0 0 0 2px #08090a,0 7px 16px #0008!important}.links-package-card-v150.featured{border-color:#d66a2b!important}.links-package-card-v150 h3{color:#f1e9dd!important;text-shadow:0 2px #000}.links-package-card-v150 button{background:linear-gradient(#f47a2f,#bd450e)!important;border-color:#ff9a55!important;color:#fff!important;text-shadow:0 1px #000}
#home .links-install-app,#home .benefit-strip-v2,#home .links-owner-tools-v118{border:1px solid #4c5b64!important;background:linear-gradient(145deg,#1b120d,#080c0f)!important;box-shadow:inset 0 0 0 2px #08090a,0 8px 18px #0007!important}
@media(max-width:700px){#home .links-category-list-v193{grid-template-columns:1fr 1fr!important;gap:8px!important}#home .links-category-v193 summary{min-height:124px!important;padding:68px 10px 11px!important}#home .links-category-v193 summary .links-cat-mark-v202{left:12px!important;top:12px!important;width:48px!important;height:48px!important}#home .links-category-v193 summary b{font-size:15px!important;line-height:1.05!important}#home .links-category-v193 summary small{font-size:8px!important}#home .links-category-v193 summary:after{width:34px;height:34px;font-size:27px!important}.links-benefits-v193>div{padding:11px 6px!important}.links-benefits-v193>div b{font-size:12px!important}.links-benefits-v193>div span{font-size:10px!important}}
@media(max-width:420px){#home .links-category-v193 summary b{font-size:14px!important}#home .links-category-list-v193{gap:7px!important}}
</style>'''
if 'links-home-v205' not in s:s=s.replace('</head>',css+'\n</head>',1)
s=s.replace('nav-v174/standings.png?v=204','nav-v174/standings.png?v=205')
s=s.replace("navigator.serviceWorker.register('/links-sw.js?v=204'", "navigator.serviceWorker.register('/links-sw.js?v=205'")
s=s.replace('links-pickem-v204','links-pickem-v205')
s=re.sub(r'LINKS PICK[’\']EM POOLS — v\d+','LINKS PICK’EM POOLS — v205',s)
p.write_text(s,encoding='utf-8')
sw=Path('public/links-sw.js')
if sw.exists():
 t=sw.read_text(encoding='utf-8').replace('links-pickem-v204','links-pickem-v205')
 sw.write_text(t,encoding='utf-8')
