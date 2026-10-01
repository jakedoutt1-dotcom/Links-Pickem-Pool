(()=>{
 const q=new URLSearchParams(location.search),el=document.getElementById('standings'),status=document.getElementById('status');let selected={};try{selected=JSON.parse(localStorage.getItem('links-current-pool')||'{}')}catch{}
 const pool=q.get('pool')||q.get('poolId')||selected.id||selected.poolId||selected.pool_id,token=localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token');
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let busy=false,loaded=false;
 async function load(){if(busy)return;if(!pool||!token){el.textContent='Sign in to your pool to view standings.';return}busy=true;
 try{const r=await fetch('./api/season-standings?pool='+encodeURIComponent(pool),{headers:{Authorization:'Bearer '+token},cache:'no-store'}),j=await r.json();if(!r.ok)throw Error(j.error||'Standings are unavailable.');
 status.textContent=j.gradedWeeks.length?'Season totals · '+j.gradedWeeks.length+' weeks · '+j.finalGames+' final games':'No final games counted yet.';
 if(j.failedWeeks.length)status.textContent+=' · Incomplete: could not load weeks '+j.failedWeeks.join(', ');
 const rows=j.rows;if(!rows.length){el.className='empty';el.textContent=j.failedWeeks.length?'Season standings could not be loaded. Please try again.':'No players have joined this pool yet.'}
 else{el.className='table';el.innerHTML='<div class="row head"><div>Rank</div><div>Player</div><div class="center">W</div><div class="center">L</div><div class="center">Record</div><div class="center">Week Wins</div></div>'+rows.map((x,i)=>'<div class="row"><b>'+(i+1)+'</b><b class="player">'+esc(x.name)+'</b><span class="center win">'+x.wins+'</span><span class="center loss">'+x.losses+'</span><b class="center">'+x.wins+'–'+x.losses+'</b><b class="center">'+x.weekWins+'</b></div>').join('')}loaded=true;
 }catch(e){status.textContent=(loaded?'Update failed; displayed totals may be out of date. ':'')+e.message;if(!loaded)el.textContent='Standings could not be loaded. Please refresh.'}finally{busy=false}}
 window.addEventListener('links:nfl:ready',()=>window.LINKS_NFL_NAV?.mount('alltime',document.querySelector('main')));
 load();const timer=setInterval(()=>{if(!document.hidden)load()},60000);window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
})();
