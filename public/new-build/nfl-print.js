(()=>{
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function label(w){w=Number(w)||1;return w<=18?'Week '+w:({19:'Wild Card',20:'Divisional',21:'Conference Championships',22:'Super Bowl'}[w]||'Week '+w)}
function openCard(){
 const q=new URLSearchParams(location.search),week=Number(document.getElementById('weekSelect')?.value||q.get('week')||1),name=localStorage.getItem('links-player-name')||'Player';
 const gs=Array.isArray(window.games)?window.games:(typeof games!=='undefined'&&Array.isArray(games)?games:[]);
 const ps=(typeof picks!=='undefined'&&picks)||{};
 const tie=(typeof tieTotal!=='undefined'?tieTotal:document.getElementById('tieTotal')?.value)||'';
 if(!gs.length){alert('Your pick card is still loading. Try Print My Picks again in a moment.');return}
 const rows=gs.map((g,i)=>{const c=g.competitions?.[0],teams=c?.competitors||[],away=teams.find(x=>x.homeAway==='away'),home=teams.find(x=>x.homeAway==='home'),a=away?.team?.abbreviation||'',h=home?.team?.abbreviation||'',pick=ps[i]||'';return `<tr><td>${i+1}</td><td>${esc(a)} @ ${esc(h)}</td><td><b>${esc(pick||'—')}</b></td></tr>`}).join('');
 const w=window.open('','linksPickCard','width=900,height=950');if(!w){alert('Please allow pop-ups to print your picks.');return}
 w.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>LINKS Pick Card — ${esc(name)} — ${label(week)}</title><style>@page{size:letter;margin:.35in}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#111;margin:0}.head{text-align:center;border-bottom:3px solid #111;padding-bottom:8px;margin-bottom:10px}.brand{font-size:24px;font-weight:900}.sub{font-size:13px;margin-top:4px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border-bottom:1px solid #bbb;padding:6px 8px;text-align:left}th{background:#eee}.game{width:52px}.tie{margin-top:10px;padding:9px;border:2px solid #111;font-size:13px}.foot{text-align:center;margin-top:8px;font-size:9px;color:#555}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body><div class="head"><div class="brand">LINKS NFL PICK’EM</div><div class="sub"><b>${esc(name)}</b> · ${label(week)}</div></div><table><thead><tr><th class="game">Game</th><th>Matchup</th><th>My Pick</th></tr></thead><tbody>${rows}</tbody></table><div class="tie"><b>Monday Night Tiebreaker:</b> ${esc(tie||'—')} combined points</div><div class="foot">LINKS · My Picks</div><script>window.onload=()=>setTimeout(()=>window.print(),150)<\/script></body></html>`);w.document.close();
}
window.LINKS_NFL_PRINT={open:openCard};
document.addEventListener('click',e=>{const b=e.target.closest('#printBtn');if(!b)return;e.preventDefault();openCard()});
})();