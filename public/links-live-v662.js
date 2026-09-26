/* LINKS LIVE v662 — global two-row live scoreboard. Visual/read-only; does not touch pool picks, standings, deadlines, or database writes. */
(()=>{
  const ID='linksLiveV662';
  const REFRESH_MS=45000;
  let timer=null,busy=false;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const logo=(team,g)=>{
    const ids={ARI:'ari',ATL:'atl',BAL:'bal',BUF:'buf',CAR:'car',CHI:'chi',CIN:'cin',CLE:'cle',DAL:'dal',DEN:'den',DET:'det',GB:'gb',HOU:'hou',IND:'ind',JAX:'jax',KC:'kc',LV:'lv',LAC:'lac',LAR:'lar',MIA:'mia',MIN:'min',NE:'ne',NO:'no',NYG:'nyg',NYJ:'nyj',PHI:'phi',PIT:'pit',SF:'sf',SEA:'sea',TB:'tb',TEN:'ten',WAS:'wsh'};
    return ids[team]?`https://a.espncdn.com/i/teamlogos/nfl/500/${ids[team]}.png`:'';
  };
  const teamName=(team,g)=>team===g.away?(g.awayName||team):(g.homeName||team);
  const live=g=>!g.completed&&(String(g.state||'').toLowerCase()==='in'||Number(g.period)>0);
  const fmtTime=iso=>{try{return new Intl.DateTimeFormat('en-US',{weekday:'short',hour:'numeric',minute:'2-digit'}).format(new Date(iso))}catch(_){return 'UPCOMING'}};
  const status=g=>{
    if(g.completed)return 'FINAL';
    if(live(g)){
      const s=String(g.status||'').trim();
      if(g.clock&&g.period)return `${s&&s.toLowerCase()!=='in'?s:`Q${g.period}`} • ${g.clock}`;
      return s&&s.toLowerCase()!=='in'?s:'LIVE';
    }
    return g.kickoff?fmtTime(g.kickoff):'UPCOMING';
  };
  const card=(g,kind)=>{
    const al=logo(g.away,g),hl=logo(g.home,g),as=g.awayScore==null?'—':g.awayScore,hs=g.homeScore==null?'—':g.homeScore;
    return `<div class="ll-card ${kind}"><div class="ll-state">${kind==='live'?'<span class="ll-dot"></span>':''}${esc(status(g))}</div><div class="ll-team">${al?`<img src="${al}" alt="">`:''}<b>${esc(teamName(g.away,g))}</b><strong>${esc(as)}</strong></div><div class="ll-team">${hl?`<img src="${hl}" alt="">`:''}<b>${esc(teamName(g.home,g))}</b><strong>${esc(hs)}</strong></div></div>`;
  };
  function install(){
    if(document.getElementById(ID))return document.getElementById(ID);
    const el=document.createElement('section');el.id=ID;el.className='links-live-v662';el.setAttribute('aria-label','LINKS LIVE scores');
    el.innerHTML=`<div class="ll-head"><b>LINKS <span>LIVE</span></b><small id="llUpdatedV662">Loading scores…</small></div><div class="ll-line"><div class="ll-label live">● LIVE NOW</div><div id="llLiveRowV662" class="ll-scroll"><div class="ll-empty">Checking live games…</div></div></div><div class="ll-line"><div class="ll-label">FINALS &amp; UP NEXT</div><div id="llOtherRowV662" class="ll-scroll"><div class="ll-empty">Loading scores and upcoming games…</div></div></div>`;
    const top=document.getElementById('top');(top?.parentNode||document.body).insertBefore(el,top?.nextSibling||document.body.firstChild);
    return el;
  }
  async function refresh(){
    if(busy||document.hidden)return;busy=true;install();
    const lr=document.getElementById('llLiveRowV662'),or=document.getElementById('llOtherRowV662'),up=document.getElementById('llUpdatedV662');
    try{
      const r=await fetch('/api/public-scores?sport=nfl&_='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('scores');const d=await r.json();
      const games=Array.isArray(d.games)?d.games:[];
      const lives=games.filter(live);
      const finals=games.filter(g=>g.completed).slice().reverse().slice(0,6);
      const upcoming=games.filter(g=>!g.completed&&!live(g)).slice(0,8);
      lr.innerHTML=lives.length?lives.map(g=>card(g,'live')).join(''):'<div class="ll-empty">No games live right now.</div>';
      const other=[...finals,...upcoming];or.innerHTML=other.length?other.map(g=>card(g,g.completed?'final':'upcoming')).join(''):'<div class="ll-empty">No finished or upcoming games available yet.</div>';
      up.textContent=`NFL • ${lives.length?lives.length+' LIVE':'scores ready'} • updated ${new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`;
    }catch(e){lr.innerHTML='<div class="ll-empty">Live scores temporarily unavailable.</div>';or.innerHTML='<div class="ll-empty">Pull to refresh or check again shortly.</div>';up.textContent='Score feed unavailable';}
    finally{busy=false}
  }
  const css=document.createElement('style');css.id='linksLiveStyleV662';css.textContent=`
.links-live-v662{position:sticky;top:0;z-index:9990;width:100%;background:#070b0f;border-bottom:1px solid #28333d;box-shadow:0 5px 18px #0009;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.ll-head{height:27px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:3px 12px;background:linear-gradient(90deg,#111923,#090d12);border-bottom:1px solid #202a33}.ll-head b{font-size:13px;letter-spacing:.8px}.ll-head b span{color:#ff3b30}.ll-head small{font-size:9px;color:#9ba9b5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ll-line{display:grid;grid-template-columns:92px minmax(0,1fr);min-height:61px;border-bottom:1px solid #1d2730}.ll-line:last-child{border-bottom:0}.ll-label{display:flex;align-items:center;justify-content:center;text-align:center;padding:5px;background:#0d141b;border-right:1px solid #29343e;font-size:9px;line-height:1.15;font-weight:950;letter-spacing:.45px;color:#c8d1d8}.ll-label.live{color:#ff655c;background:#180d0d}.ll-scroll{display:flex;gap:6px;align-items:stretch;overflow-x:auto;overscroll-behavior-x:contain;padding:5px 7px;scrollbar-width:thin}.ll-card{flex:0 0 210px;min-width:210px;border:1px solid #34414d;border-radius:8px;background:#101820;padding:4px 7px}.ll-card.live{border-color:#d83d37;box-shadow:inset 3px 0 0 #ff3b30}.ll-card.final{border-color:#31523f}.ll-state{display:flex;align-items:center;gap:5px;font-size:8px;font-weight:950;color:#aebbc5;margin-bottom:2px}.ll-card.live .ll-state{color:#ff6b63}.ll-card.final .ll-state{color:#69dc96}.ll-dot{width:6px;height:6px;border-radius:50%;background:#ff3b30;box-shadow:0 0 7px #ff3b30;animation:llpulse 1.2s infinite}.ll-team{display:grid;grid-template-columns:22px minmax(0,1fr) auto;align-items:center;gap:5px;min-height:21px}.ll-team img{width:20px;height:20px;object-fit:contain}.ll-team b{font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ll-team strong{font-size:14px}.ll-empty{display:flex;align-items:center;min-width:220px;padding:0 10px;color:#93a1ad;font-size:10px;font-weight:800}@keyframes llpulse{50%{opacity:.35}}
@media(max-width:600px){.ll-head{height:23px;padding:2px 7px}.ll-head b{font-size:11px}.ll-head small{font-size:8px}.ll-line{grid-template-columns:68px minmax(0,1fr);min-height:54px}.ll-label{font-size:7.5px;padding:3px}.ll-scroll{padding:4px 5px;gap:5px}.ll-card{flex-basis:174px;min-width:174px;padding:3px 5px}.ll-team{grid-template-columns:19px minmax(0,1fr) auto;gap:4px;min-height:19px}.ll-team img{width:17px;height:17px}.ll-team b{font-size:9px}.ll-team strong{font-size:12px}.ll-state{font-size:7px}}
`;document.head.appendChild(css);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{install();refresh()},{once:true});else{install();refresh()}
  timer=setInterval(refresh,REFRESH_MS);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});window.addEventListener('pageshow',refresh);window.LinksLiveV662={refresh};
})();
