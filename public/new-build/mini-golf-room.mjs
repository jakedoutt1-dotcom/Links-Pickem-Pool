export function connectRoom({reset,restore}){
const $=id=>document.getElementById(id);let room='',token='',round=0,phase='',submitted=false,pending=null,polling=false;const storage='links-mini-room-v1';
try{const saved=JSON.parse(localStorage.getItem(storage)||'null');if(saved){room=saved.room;token=saved.token}}catch{}
if(!token)token=crypto.randomUUID()+crypto.randomUUID();
const persist=()=>{try{localStorage.setItem(storage,JSON.stringify({room,token}))}catch{}};
const key=()=>storage+':'+room+':'+round;
async function api(action,extra={}){const r=await fetch('./api/mini-golf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,room,token,round,...extra})});const b=await r.json();if(!r.ok){const e=Error(b.error||'Please retry');e.status=r.status;throw e;}return b}
function error(e){$('roomError').textContent=e.message}
async function sync(){if(!room||polling)return;polling=true;try{
if(pending&&!submitted){try{await api('finish',{shots:pending});submitted=true}catch(e){if(e.status===409){pending=null}else throw e}}
const b=await api('state');if(b.round!==round){round=b.round;submitted=b.me.finished;pending=null;reset((round-1)%3);if(b.phase==='playing'){try{const shots=JSON.parse(localStorage.getItem(key())||'[]');restore(shots)}catch{}}}phase=b.phase;submitted=b.me.finished||submitted;
$('roomPanel').hidden=false;$('roomLabel').textContent='Room '+room+' · Round '+round;
$('roomStatus').textContent=phase==='lobby'?'Waiting for the host to start.':phase==='results'?'Round complete — fewest strokes wins.':submitted?'Waiting for '+b.remaining+' player'+(b.remaining===1?'':'s')+'…':'Play this hole at your own pace. '+b.remaining+' still playing.';
$('startRound').hidden=!b.host||phase==='playing';$('startRound').textContent=phase==='results'?'Start next hole':'Start round';$('endRound').hidden=!b.host||phase!=='playing';
$('roomPlayers').replaceChildren();const rows=b.players.slice();if(phase==='results')rows.sort((a,b)=>(a.dnf?999:a.score)-(b.dnf?999:b.score));let rank=0,last=null;rows.forEach((p,i)=>{const li=document.createElement('li');if(phase==='results'){if(p.score!==last){rank=i+1;last=p.score}li.textContent=p.dnf?p.name+' — Did not finish':rank+'. '+p.name+' — '+p.score+' strokes'}else li.textContent=p.name+(p.finished?' · Finished':' · '+(phase==='lobby'?'Ready':'Playing'));$('roomPlayers').append(li)});$('roomError').textContent='';
}catch(e){error(e)}finally{polling=false}}
async function enter(action){try{const b=await api(action,{room:$('roomInput').value.trim().toUpperCase(),name:$('playerName').value});room=b.room;round=0;phase='lobby';pending=null;submitted=false;persist();reset();await sync()}catch(e){error(e)}}
$('createRoom').onclick=()=>enter('create');$('joinRoom').onclick=()=>enter('join');$('startRound').onclick=async()=>{try{await api('start');await sync()}catch(e){error(e)}};
$('endRound').onclick=async()=>{if(!confirm('End this round? Unfinished players will be marked Did not finish.'))return;try{await api('end');await sync()}catch(e){error(e)}};
$('retryRoom').onclick=sync;$('leaveRoom').onclick=()=>{room='';phase='';pending=null;submitted=false;persist();$('roomPanel').hidden=true;reset()};
$('shareRoom').onclick=async()=>{const url=new URL(location.href);url.search='room='+room;try{if(navigator.share)await navigator.share({title:'LINKS Putt Club',text:'Join room '+room,url:url.href});else{await navigator.clipboard.writeText(url.href);$('roomError').textContent='Invite link copied.'}}catch{ $('roomError').textContent='Share room code '+room}};
$('roomInput').value=new URLSearchParams(location.search).get('room')||'';if($('roomInput').value)$('multiplayer details').open=true;
setInterval(()=>{if(!document.hidden)sync()},3000);sync();
return {locked:()=>!!room&&(phase!=='playing'||submitted||!!pending),active:()=>!!room,save(shots){if(room)try{localStorage.setItem(key(),JSON.stringify(shots))}catch{}},finish(shots){if(room){pending=shots.slice();sync()}}};
}
