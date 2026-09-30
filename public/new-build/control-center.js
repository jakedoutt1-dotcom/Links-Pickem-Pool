(async()=>{
 const routes={nfl:'nfl.html',college:'college.html',survivor:'survivor.html',confidence:'confidence.html','33':'game33.html',squares:'squares.html',props:'props.html',playoff:'playoff.html',march:'march-madness.html',masters:'golf.html',nascar:'nascar.html',fantasy:'fantasy.html',dynasty:'dynasty.html',custom:'custom.html'};
 const art={nfl:'06_30_15',college:'06_30_10',march:'06_30_04',masters:'06_30_00',nascar:'06_29_55',fantasy:'06_29_32',survivor:'06_29_27',confidence:'06_29_45','33':'06_29_50',custom:'06_29_20'};
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const grid=document.getElementById('topGameGrid');
 try{
 const selected=JSON.parse(localStorage.getItem('links-current-pool')||'null'),requested=new URLSearchParams(location.search).get('pool'),token=localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token');
 if(!selected?.id||!token||(requested&&String(requested)!==String(selected.id))){location.replace('./pool-login.html');return}
 const auth=await fetch('/api/session',{headers:{Authorization:'Bearer '+token},cache:'no-store'}),session=await auth.json();
 if(!auth.ok||session.poolCode!==selected.code){location.replace('./pool-login.html');return}
 const response=await fetch('./api/pool-games?pool='+encodeURIComponent(selected.id),{cache:'no-store'}),data=await response.json();if(!response.ok||!Array.isArray(data.games))throw Error('Pool games could not be loaded. Please refresh.');
 const games=data.games;selected.games=games.map(g=>g.name);selected.role=session.role==='admin'?'commissioner':'player';localStorage.setItem('links-current-pool',JSON.stringify(selected));
 document.getElementById('controlTitle').textContent=selected.name+' · CONTROL CENTER';
 grid.innerHTML=games.map(g=>{
 const formatArt={squares:'/football-squares-logo-v102.png',props:'/super-bowl-props-logo-v102.jpg',playoff:'/nfl-playoff-challenge-logo-v102.jpg'};const picture=formatArt[g.key]?'<img src="'+formatArt[g.key]+'" alt="">':art[g.key]?'<img src="./assets/ChatGPT Image Sep 22, 2026, '+art[g.key]+' PM.png" alt="" loading="lazy">':'<span class="game-symbol" aria-hidden="true">🏆</span>';
 const content=picture+'<span>'+esc(g.name)+'</span><small>'+(routes[g.key]?'PLAY NOW →':'Not available yet')+'</small>';
 return routes[g.key]?'<a href="./'+routes[g.key]+'?pool='+encodeURIComponent(selected.id)+'&game='+encodeURIComponent(g.name)+'">'+content+'</a>':'<div class="unavailable-game">'+content+'</div>';
 }).join('')||'<p>No active games are available in this pool. Your commissioner can manage games from My Pools.</p>';
 document.getElementById('attention').textContent=games.length+' active game'+(games.length===1?'':'s')+' in '+selected.name+'. Choose a game to view your picks and results.';
 document.getElementById('projectionGrid').innerHTML=games.filter(g=>['nfl','college'].includes(g.key)).map(g=>'<a class="action" href="./'+(g.key==='college'?'college.html?view=projected&':'pick-tools.html?sport=nfl&tool=projected&')+'pool='+encodeURIComponent(selected.id)+'">'+esc(g.name)+' projections</a>').join('')||'<p>Open a game to follow its standings.</p>';
 }catch(e){grid.textContent=e.message||'Control center is unavailable. Please refresh.'}
})();
