from pathlib import Path
import re
p=Path('public/index.html'); s=p.read_text(encoding='utf-8')
# v201 — Standings uses the same privacy rule/message as Projected while current picks are open.
needle='async function renderStandings(){\n  // v198: while the current NFL week is still open for picks, keep the default'
insert='''async function renderStandings(){
  // v201: protect standings while the CURRENT week is open, matching Projected.
  if(role!=="admin"){
    let privacy;
    try{privacy=await api(q("/api/compare"))}catch(e){privacy=null}
    if(privacy && !privacy.locked){
      $("#standingsTitle").textContent=`${weekLabel()} Standings`;
      $("#potBadge").textContent="";$("#potBadge").classList.add("hide");
      $("#autoTieStatus").textContent="🔒 Standings unlock after this week's picks lock so nobody can see another player's selections early.";
      $("#standingsBody").innerHTML=`<div class="card" style="text-align:center"><b>Standings are protected until picks lock.</b></div>`;
      $("#standingsWinnerAdmin")?.classList.add("hide");
      return;
    }
  }
  // v198: while the current NFL week is still open for picks, keep the default'''
if needle in s:s=s.replace(needle,insert,1)
# v201 — Home game showcase: remove repeated generic logo tiles and give every game a distinct sport identity + link-like interaction.
css='''<style id="links-home-v201">
.links-games-grid-v4 .links-game-v4{position:relative;cursor:pointer;padding:15px 42px 15px 15px!important;border:1px solid #3d5365!important;background:linear-gradient(135deg,#121e28,#0a1117)!important;box-shadow:0 7px 18px rgba(0,0,0,.24);transition:transform .14s ease,border-color .14s ease,box-shadow .14s ease}
.links-games-grid-v4 .links-game-v4:hover,.links-games-grid-v4 .links-game-v4:active{transform:translateY(-2px);border-color:#ff7a25!important;box-shadow:0 10px 24px rgba(0,0,0,.34),0 0 0 1px rgba(255,122,37,.2)}
.links-games-grid-v4 .links-game-v4 .game-card-logo{display:none!important}
.links-games-grid-v4 .links-game-v4:before{display:block;font-size:31px;line-height:1;margin:0 0 10px;filter:drop-shadow(0 2px 3px #000)}
.links-games-grid-v4 .links-game-v4:after{content:'›';position:absolute;right:15px;top:50%;transform:translateY(-50%);font-size:34px;font-weight:900;color:#ff7a25}
.links-games-grid-v4 .links-game-v4:nth-child(1):before{content:'🏈'}.links-games-grid-v4 .links-game-v4:nth-child(2):before{content:'🎓🏈'}.links-games-grid-v4 .links-game-v4:nth-child(3):before{content:'🏀'}.links-games-grid-v4 .links-game-v4:nth-child(4):before{content:'3️⃣3️⃣'}.links-games-grid-v4 .links-game-v4:nth-child(5):before{content:'▦'}.links-games-grid-v4 .links-game-v4:nth-child(6):before{content:'🏆'}.links-games-grid-v4 .links-game-v4:nth-child(7):before{content:'📊'}.links-games-grid-v4 .links-game-v4:nth-child(8):before{content:'🎯'}.links-games-grid-v4 .links-game-v4:nth-child(9):before{content:'🏟️'}.links-games-grid-v4 .links-game-v4:nth-child(10):before{content:'⛳'}.links-games-grid-v4 .links-game-v4:nth-child(11):before{content:'🏁'}.links-games-grid-v4 .links-game-v4:nth-child(12):before{content:'🏈📋'}.links-games-grid-v4 .links-game-v4:nth-child(13):before{content:'👑🏈'}
.links-games-grid-v4 .links-game-v4 b{font-size:16px!important}.links-games-grid-v4 .links-game-v4 span{font-size:12px!important}
@media(max-width:560px){.links-games-grid-v4 .links-game-v4{min-height:104px}}
</style>'''
if 'links-home-v201' not in s:s=s.replace('</head>',css+'\n</head>',1)
# Version/cache bumps.
s=s.replace('nav-v174/standings.png?v=200b','nav-v174/standings.png?v=201')
s=s.replace("navigator.serviceWorker.register('/links-sw.js?v=200b'", "navigator.serviceWorker.register('/links-sw.js?v=201'")
s=s.replace('links-pickem-v200b','links-pickem-v201')
s=re.sub(r'LINKS PICK[’\']EM POOLS — v\d+','LINKS PICK’EM POOLS — v201',s)
p.write_text(s,encoding='utf-8')
sw=Path('public/links-sw.js')
if sw.exists():
 t=sw.read_text(encoding='utf-8').replace('links-pickem-v200b','links-pickem-v201')
 sw.write_text(t,encoding='utf-8')
