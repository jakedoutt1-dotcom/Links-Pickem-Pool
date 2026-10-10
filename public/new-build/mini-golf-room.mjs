import {courses} from './mini-golf-courses.mjs';
export function connectRoom({reset,restore,onState=()=>{}}){
const $=id=>document.getElementById(id);let room='',token='',round=0,phase='',submitted=false,pending=null,polling=false;const storage='links-mini-room-v1';
try{const saved=JSON.parse(localStorage.getItem(storage)||'null');if(saved){room=saved.room;token=saved.token}}catch{}
const invited=new URLSearchParams(location.search).get('room');if(invited&&invited.toUpperCase()!==room)room='';
if(!token)token=crypto.randomUUID()+crypto.randomUUID();
const soloRuns=new Map();
async function saveSolo(shots,hole){let run=soloRuns.get(shots);if(!run){run=crypto.randomUUID().replaceAll('-','').slice(0,10).toUpperCase();soloRuns.set(shots,run)}try{localStorage.setItem('links-putt-seat-'+run,token)}catch{}for(let attempt=0;attempt<3;attempt++){try{await api('solo',{room:run,hole,shots,name:$('soloName').value||'Guest Golfer'});$('status').textContent+=' · Score saved';return}catch(e){if(e.status&&e.status<500){error(e);return}if(attempt===2){$('status').textContent+=' · Score could not save. Check your connection.';return}await new Promise(r=>setTimeout(r,1000*(attempt+1)))}}}
const persist=()=>{try{localStorage.setItem(storage,JSON.stringify({room,token}))}catch{}};
const key=()=>storage+':'+room+':'+round;
async function api(action,extra={}){const r=await fetch('./api/mini-golf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,room,token,round,...extra})});const b=await r.json();if(!r.ok){const e=Error(b.error||'Please retry');e.status=r.status;throw e;}return b}
function error(e){$('roomError').textContent=e.message}
async function sync(){if(!room||polling)return false;polling=true;try{
if(pending&&!submitted){try{await api('finish',{shots:pending});submitted=true}catch(e){if(e.status===409){pending=null}else throw e}}
const b=await api('state');if(b.round!==round){round=b.round;submitted=b.me.finished;pending=null;reset(b.hole??(Math.max(1,round)-1)%courses.length,b.rulesVersion||1);if(b.phase==='playing'){try{const shots=JSON.parse(localStorage.getItem(key())||'[]');restore(shots)}catch{}}}phase=b.phase;submitted=b.me.finished||submitted;
$('roomPanel').hidden=false;$('roomLabel').textContent='Room '+room+' · Round '+round;
$('roomStatus').textContent=phase==='lobby'?'Waiting for the host to start.':phase==='results'?'Round complete — fewest strokes wins.':submitted?'Waiting for '+b.remaining+' player'+(b.remaining===1?'':'s')+'…':'Play this hole at your own pace. '+b.remaining+' still playing.';
$('startRound').hidden=!b.host||phase==='playing';$('startRound').textContent=phase==='results'?'Start next hole':'Start round';$('endRound').hidden=!b.host||phase!=='playing';
$('roomPlayers').replaceChildren();const rows=b.players.slice();if(phase==='results')rows.sort((a,b)=>(a.dnf?999:a.score)-(b.dnf?999:b.score));let rank=0,last=null;rows.forEach((p,i)=>{const li=document.createElement('li');if(phase==='results'){if(p.score!==last){rank=i+1;last=p.score}li.textContent=p.dnf?p.name+' — Did not finish':rank+'. '+p.name+' — '+p.score+' strokes'}else li.textContent=p.name+(p.finished?' · Finished':' · '+(phase==='lobby'?'Ready':'Playing'));$('roomPlayers').append(li)});$('roomError').textContent='';onState(b);return true;
}catch(e){error(e);return false}finally{polling=false}}
async function enter(action){try{const b=await api(action,{room:$('roomInput').value.trim().toUpperCase(),name:$('playerName').value});room=b.room;try{localStorage.setItem('links-putt-seat-'+room,token)}catch{}round=0;phase='lobby';pending=null;submitted=false;persist();reset();await sync()}catch(e){error(e)}}
$('createRoom').onclick=()=>enter('create');$('joinRoom').onclick=()=>enter('join');async function start(){try{await api('start');return await sync()}catch(e){error(e);return false}}
$('startRound').onclick=start;
$('endRound').onclick=async()=>{if(!confirm('End this round? Unfinished players will be marked Did not finish.'))return;try{await api('end');await sync()}catch(e){error(e)}};
$('retryRoom').onclick=sync;$('leaveRoom').onclick=()=>{room='';phase='';pending=null;submitted=false;persist();$('roomPanel').hidden=true;reset()};
$('shareRoom').onclick=async()=>{const url=new URL('./mini-golf.html',location.href);url.search='room='+room;try{if(navigator.share)await navigator.share({title:'LINKS Putt Club',text:'Join room '+room,url:url.href});else{await navigator.clipboard.writeText(url.href);$('roomError').textContent='Invite link copied.'}}catch{ $('roomError').textContent='Share room code '+room}};
$('roomInput').value=new URLSearchParams(location.search).get('room')||'';if($('roomInput').value)document.querySelector('#multiplayer details').open=true;
setInterval(()=>{if(!document.hidden)sync()},3000);sync();
return {saveSolo,start,refresh:sync,leave:()=>$('leaveRoom').click(),locked:()=>!!room&&(phase!=='playing'||submitted||!!pending),active:()=>!!room,save(shots){if(room)try{localStorage.setItem(key(),JSON.stringify(shots))}catch{}},finish(shots){if(room){pending=shots.slice();sync()}}};
}
