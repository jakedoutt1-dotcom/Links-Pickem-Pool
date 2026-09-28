/* LINKS v792: projected standings must grade saved picks by TEAM matchup, not pick-array slot. Also label NFL slate with moneyline odds. */
(()=>{
 const q=()=>new URLSearchParams(location.search);
 const abbr=x=>String(x||'').trim().toUpperCase().replace(/^WAS$/,'WSH').replace(/^JAC$/,'JAX').replace(/^LA$/,'LAR');
 const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 async function projected(){
  if(!/\/pick-tools\.html$/i.test(location.pathname)||q().get('tool')!=='projected')return;
  const body=document.getElementById('body'),status=document.getElementById('status');if(!body||!status||!window.LINKS_NFL_REWRITE)return;
  const week=Number(document.getElementById('week')?.value||q().get('week')||1),pool=q().get('pool')||LINKS_NFL_REWRITE.poolId(),role=localStorage.getItem('links-player-role')||'',me=localStorage.getItem('links-player-name')||'';
  try{
   const [games,r]=await Promise.all([LINKS_NFL_REWRITE.scoreboard(week),fetch('./api/compare-picks?pool='+encodeURIComponent(pool)+'&week='+week+'&role='+encodeURIComponent(role)+'&_='+Date.now(),{cache:'no-store'})]);
   const data=await r.json();if(!r.ok)throw Error(data.error||'Saved picks unavailable');
   const byTeam=new Map();games.forEach((g,i)=>{g._i=i;byTeam.set(abbr(g.home),g);byTeam.set(abbr(g.away),g)});
   const probs=new Map();await Promise.all(games.filter(g=>!g.final).map(async g=>{try{const rr=await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event='+encodeURIComponent(g.id),{cache:'no-store'}),j=await rr.json(),wp=j.winprobability||[];if(wp.length){const h=Number(wp[wp.length-1].homeWinPercentage);if(Number.isFinite(h)){probs.set(g.id,{home:h,away:1-h});return}}const od=j.header?.competitions?.[0]?.odds?.[0],h=Number(od?.homeTeamOdds?.winPercentage),a=Number(od?.awayTeamOdds?.winPercentage);if(Number.isFinite(h)&&Number.isFinite(a))probs.set(g.id,{home:h>1?h/100:h,away:a>1?a/100:a})}catch{}}));
   const rows=(data.players||[]).filter(p=>Object.keys(p.picks||{}).length).map((p,order)=>{let correct=0,expected=0,picked=0,pending=0;Object.values(p.picks||{}).forEach(raw=>{const pick=abbr(raw);if(!pick)return;const g=byTeam.get(pick);if(!g)return;picked++;if(g.final){if(abbr(g.winner)===pick)correct++;return}pending++;const pr=probs.get(g.id);let chance=.5;if(pr)chance=pick===abbr(g.home)?pr.home:pick===abbr(g.away)?pr.away:.5;expected+=Math.max(0,Math.min(1,chance))});return{player:p.player||'Player',order,picked,pending,correct,projected:correct+expected}}).sort((a,b)=>b.projected-a.projected||b.correct-a.correct||a.order-b.order);
   status.innerHTML='<b>WEEK '+week+' · PROJECTED STANDINGS</b><div class="proj-meta">● ESPN WIN PROBABILITY PROJECTION<br>Final games use the same saved picks and final winners as Weekly Standings. Remaining games add each player’s actual picked team probability.</div>';
   body.innerHTML='<div class="proj-list-title">PROJECTED</div>'+rows.map((x,i)=>{const pct=x.picked?100*x.projected/x.picked:0;return '<div class="proj-rank '+(String(x.player).toLowerCase()===String(me).toLowerCase()?'me':'')+'"><div class="rank">'+(i+1)+'</div><div class="name">'+esc(x.player)+'<div class="proj-meta"><b>'+x.projected.toFixed(2)+'</b> / '+x.picked+' projected · '+x.correct+' correct now · '+x.pending+' remaining</div><div class="proj-meter"><span style="width:'+Math.min(100,pct).toFixed(1)+'%"></span></div></div><div class="pct">'+pct.toFixed(0)+'%</div></div>'}).join('');
  }catch(e){console.error('LINKS projected v792',e)}
 }
 async function moneylines(){
  if(!/\/nfl\.html$/i.test(location.pathname)||!window.LINKS_NFL_REWRITE)return;
  try{const games=await LINKS_NFL_REWRITE.scoreboard();const odds=new Map();games.forEach(g=>{odds.set(abbr(g.away),g.awayMoneyline);odds.set(abbr(g.home),g.homeMoneyline)});document.querySelectorAll('#linksRealSlate .game-team[data-team]').forEach(btn=>{const ml=odds.get(abbr(btn.dataset.team));if(!ml)return;let el=btn.querySelector('.links-moneyline');if(!el){el=document.createElement('small');el.className='links-moneyline';btn.querySelector('span')?.appendChild(el)}el.textContent='ML '+ml})}catch(e){console.error('LINKS moneyline v792',e)}
 }
 function run(){setTimeout(projected,500);setTimeout(moneylines,900);setTimeout(moneylines,1800)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();window.addEventListener('popstate',run);
 document.addEventListener('change',e=>{if(e.target?.id==='week')setTimeout(projected,350);if(e.target?.id==='weekSelect')setTimeout(moneylines,500)});
})();