const $=id=>document.getElementById(id);let period='week',loadId=0,initialGame=new URLSearchParams(location.search).get('game');
async function api(){const r=await fetch('./api/party-scoreboard?'+new URLSearchParams({period,game:initialGame||$('game').value}),{headers:{'x-links-account':localStorage.getItem('links-account-token')||''},cache:'no-store'});const j=await r.json();if(!r.ok)throw Error(j.error||'Please try again.');return j}

// Anonymous identity is device-local. Seat proofs come from the games, never from names.
async function linkGuestScores(){
 let secret=localStorage.getItem('links-scoreboard-guest-secret');
 if(!/^[a-f0-9]{64}$/i.test(secret||'')){secret=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');localStorage.setItem('links-scoreboard-guest-secret',secret)}
 const games=[['mini-golf','links-putt-seat-'],['trivia-rally','links-rally-seat-'],['friend-challenge','links-friend-seat-'],['million-point','links-million-'],['dead-air','links-dead-air-'],['last-alibi','links-alibi-']];
 const seats=[];
 for(const [game,prefix] of games)for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key?.startsWith(prefix)){const room=key.slice(prefix.length),token=localStorage.getItem(key);if(/^[A-F0-9]{10}$/.test(room)&&typeof token==='string'&&token.length===72)seats.push({game,room,token})}}
 if(!seats.length)return;
 for(let i=0;i<seats.length;i+=50){
  const r=await fetch('./api/party-scoreboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'guest',secret,seats:seats.slice(i,i+50)}),cache:'no-store'});
  if(!r.ok)throw Error('Guest scores could not sync. Please refresh to retry.');
 }
}

async function load(){const id=++loadId,j=await api();if(id!==loadId)return;initialGame=null;if($('game').options.length===1)for(const g of j.games)$('game').add(new Option(g.name,g.id));$('game').value=j.game;$('winsHead').hidden=!!j.solo;$('bestHead').hidden=j.game==='all';$('boardTitle').textContent=j.game==='all'?'Overall standings':j.games.find(g=>g.id===j.game).name+' standings';$('record').textContent=j.highScore===null?(j.solo?'Finish a ranked run to join this board. Goal Line saves after the final whistle.':'Completed games · Solo scores earn no multiplayer wins'):(j.game==='mini-golf'?'Fewest strokes · ':'High score · ')+j.highScore.toLocaleString();$('empty').hidden=!!j.rows.length;$('rows').replaceChildren();$('rankingNote').textContent='Top 100 · Ranked by '+(j.game==='all'?'wins':(j.game==='mini-golf'?'fewest strokes':'personal best score'))+'; ties share a rank. Weeks start Monday at midnight Central.';let rank=0,previous=null;for(const [i,r]of j.rows.entries()){const metric=j.game==='all'?r.wins:r.best;if(metric!==previous)rank=i+1;previous=metric;const tr=document.createElement('tr');if(r.id===j.profile?.id)tr.className='you';for(const value of [rank,r.name+(String(r.id).startsWith('guest:')?' · Guest':r.id===j.profile?.id?' · You':''),...(j.solo?[]:[r.wins]),r.played,...(j.game==='all'?[]:[r.best])]){const td=document.createElement('td');td.textContent=value;tr.append(td)}$('rows').append(tr)}}

document.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>{period=b.dataset.period;document.querySelectorAll('[data-period]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));load().catch(e=>{$('record').textContent=e.message})});
$('game').onchange=()=>load().catch(e=>{$('record').textContent=e.message});
linkGuestScores().catch(e=>{$('record').textContent=e.message}).finally(()=>load().catch(e=>{$('record').textContent=e.message}));

setInterval(()=>{if(!document.hidden)load().catch(()=>{})},30000);
