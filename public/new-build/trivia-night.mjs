import qrcode from './vendor/qrcode.mjs';
import {mountPartners} from './partner-banner.mjs';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const themes={football:['FOOTBALL','🏈'],music:['MUSIC','♫'],movies:['MOVIES & TV','▶'],history:['HISTORY','Ⅲ'],science:['SCIENCE','⚛'],general:['MIXED BAG','✦']};
let state=null,offset=0,busy=false,bank=[],pending=null,signature='',sequence=0,roomCode=new URL(location.href).searchParams.get('room')||sessionStorage.getItem('trivia-night-room')||'';
const token=()=>localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token')||'';
const seat=()=>localStorage.getItem('trivia-night-seat-'+roomCode)||'';
const selection=()=>({categories:[...document.querySelectorAll('[name=category]:checked')].map(e=>e.value),difficulty:$('difficulty').value});
$('categories').innerHTML=Object.entries(themes).map(([key,[name,icon]])=>`<label><span>${icon}</span><input type="checkbox" name="category" value="${key}" checked> ${name}</label>`).join('');
if(new URL(location.href).searchParams.get('host')==='1')roomCode='';
$('code').value=roomCode;
async function api(body,query=''){
 const r=await fetch('./api/trivia-night'+query,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token(),'x-trivia-token':seat(),'Content-Type':'application/json'},cache:'no-store',signal:AbortSignal.timeout(12000),...(body?{body:JSON.stringify(body)}:{})});
 const j=await r.json();if(!r.ok){const e=Error(j.error||'Unable to reach trivia.');e.status=r.status;throw e}return j;
}
function adopt(j){
 offset=j.serverNow-Date.now();state=j;roomCode=j.code;sessionStorage.setItem('trivia-night-room',roomCode);
 if(j.token)localStorage.setItem('trivia-night-seat-'+roomCode,j.token);
 $('entry').hidden=true;$('setup').hidden=true;$('room').hidden=false;
 const u=new URL(location.href);u.searchParams.set('room',roomCode);history.replaceState(null,'',u);
 render();
}
async function act(action,extra={}){
 if(busy)return;busy=true;++sequence;$('message').textContent='';tick();
 try{adopt(await api({action,code:roomCode,gameNumber:state?.game,index:state?.index,phase:state?.phase,...extra}));}
 catch(e){$('message').textContent=e.message;}
 finally{busy=false;tick();}
}
function render(){
 const stable=JSON.stringify({...state,serverNow:0,token:undefined});if(stable===signature){tick();return}signature=stable;
 const q=state.question,revealed=['reveal','ended'].includes(state.phase),theme=state.categoryIntro||q?.category||'general';document.body.dataset.category=theme;
 $('symbol').textContent=themes[theme][1];$('categoryLabel').textContent=themes[theme][0]+(q?' · '+q.difficulty.toUpperCase():'');
 $('roomTitle').textContent=state.title+' · ROOM '+state.code;
 $('roomStatus').textContent=state.phase==='ended'?'That’s a wrap.':state.phase==='lobby'?'The night starts here.':'Game '+state.game+' · '+state.playerCount+' players / teams';
 $('questionNumber').textContent=state.isFinal?'FINAL ROUND · DOUBLE POINTS':q?'QUESTION '+(state.index+1):'READY WHEN YOU ARE';
 $('phaseLabel').textContent=state.phase==='lobby'?'WAITING FOR THE HOST':state.phase==='ended'?'FINAL SCOREBOARD':revealed?'THE ANSWER IS IN':'THINK FAST. MAKE IT COUNT.';
 $('question').textContent=state.phase==='category'?(state.isFinal?'FINAL ROUND · ':'')+themes[theme][0]+' ROUND':q?.text||'Get your team together.';
 $('lobbyInvite').hidden=state.phase!=='lobby';
 if(state.phase==='lobby'){const qr=qrcode(0,'M');qr.addData(joinLink());qr.make();$('lobbyQR').innerHTML=qr.createSvgTag({cellSize:6,margin:20,scalable:true});$('lobbyCode').textContent=roomCode;$('lobbyCount').textContent=state.playerCount+' players / teams joined';}
 $('answers').hidden=state.phase==='category';
 $('answers').innerHTML=q?q.answers.map((a,i)=>`<button data-choice="${i}" class="${state.choice===i?'selected ':''}${revealed?(q.correct===i?'correct':state.choice===i?'wrong':''):''}"><b>${'ABCD'[i]}</b><span>${esc(a)}${revealed&&q.correct===i?' ✓':''}${state.choice===i?' · Your answer':''}</span></button>`).join(''):'';
 $('source').textContent=revealed&&q?'Source: '+q.source+' · '+q.license:'';
 $('answerNote').textContent=state.phase==='category'?(state.isFinal?'One hard question. Double base and speed points. 20 seconds. Final scores appear after the host reveals.':'Get ready. The host starts the clock when everyone is ready.'):state.phase==='lobby'?'Invite friends with the room QR code. The host starts the first question.':state.phase==='ended'?'Thanks for playing! Stay here if the host starts another game.':revealed?'Scores are updated. The host will start the next question.':state.host?'Players answer on their phones. Reveal after the timer ends.':!state.eligible?'You’re in! Your first question is the next one.':state.choice!==null?'Answer saved. Wait for the host to reveal.':'Choose one answer. You cannot change it after submitting.';
 $('hostControls').hidden=!state.host;$('showStandings').hidden=!state.host;$('scoreboardTitle').textContent=state.phase==='ended'?'Final standings':'Live standings';$('answered').textContent=state.answered+' answers received · '+state.remaining+' questions remaining';
 $('leaders').innerHTML=state.leaders.length?state.leaders.map(p=>`<li class="${p.you?'you':''}"><span>${p.rank}</span><span>${esc(p.name)}${p.you?' · You':''}</span><strong>${p.score.toLocaleString()}</strong></li>`).join(''):'<li>Waiting for the first player or team.</li>';
 if(state.host&&state.phase==='ended'&&window.triviaFinalShown!==state.game){window.triviaFinalShown=state.game;window.showTriviaStandings?.();}
 tick();
}
function tick(){
 if(!state)return;const seconds=Math.max(0,Math.ceil((state.deadline-Date.now()-offset)/1000));
 $('clock').textContent=state.phase==='question'?String(seconds).padStart(2,'0'):'—';
 document.querySelectorAll('[data-choice]').forEach(e=>{e.disabled=busy||state.host||state.phase!=='question'||seconds===0||!state.eligible||state.choice!==null});
 $('next').hidden=!['lobby','reveal'].includes(state.phase);$('next').disabled=busy||state.remaining===0;$('next').textContent=state.phase==='lobby'?'Start game':'Choose next category';
 $('startQuestion').hidden=state.phase!=='category';$('startQuestion').disabled=busy;
 $('finalRound').hidden=state.phase!=='reveal';$('finalRound').disabled=busy||!state.canFinal;
 $('reveal').hidden=state.phase!=='question';$('reveal').disabled=busy||seconds>0;
 $('end').hidden=state.phase==='ended';$('end').disabled=busy||(state.phase==='question'&&seconds>0);
 $('restart').hidden=state.phase!=='ended';$('restart').disabled=busy;
 if(state.phase==='question'&&seconds===0&&state.choice===null&&!state.host&&state.eligible)$('answerNote').textContent='Time is up. Waiting for the host to reveal the answer.';
}
$('joinForm').onsubmit=e=>{e.preventDefault();roomCode=$('code').value.trim().toUpperCase();act('join',{name:$('name').value.trim()})};
async function loadBank(){const j=await api(null,'?action=library');bank=j.questions;$('bankCount').textContent=bank.length+' questions available. Starter categories other than football contain three sample questions each; expand the library for a full evening.';}
async function hostPoolRequest(body){
 const r=await fetch('./api/pool-switcher',{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token(),'x-links-account':localStorage.getItem('links-account-token')||'','Content-Type':'application/json'},cache:'no-store',signal:AbortSignal.timeout(12000),...(body?{body:JSON.stringify(body)}:{})});const j=await r.json();if(!r.ok)throw Error(j.error||'Your connected pools could not be loaded.');return j;
}
async function offerHostPools(){
 const j=await hostPoolRequest(),pools=(j.pools||[]).filter(p=>p.role==='admin');
 $('hostPools').replaceChildren();
 if(!pools.length){$('hostMessage').textContent='You are signed in, but this player session has no connected commissioner pool. Sign in using the commissioner player for the pool you manage.';return}
 $('hostMessage').textContent='You are signed in. Choose a pool you manage to host Trivia Night:';
 for(const pool of pools){const button=document.createElement('button');button.textContent='Host with '+pool.name;button.onclick=async()=>{button.disabled=true;$('hostMessage').textContent='Opening commissioner access…';try{const opened=await hostPoolRequest({action:'open',pool:pool.id});localStorage.setItem('links-legacy-token',opened.token);localStorage.setItem('links-token',opened.token);localStorage.setItem('links-current-pool',JSON.stringify(opened.pool));localStorage.setItem('links-player-id',opened.playerId);localStorage.setItem('links-player-name',opened.playerId);localStorage.setItem('links-player-role',opened.pool.role);await loadBank();$('setup').hidden=false;$('setup').scrollIntoView({behavior:'smooth'});$('hostPools').replaceChildren();$('hostSignIn').hidden=true;$('hostMessage').textContent='Hosting with '+pool.name;}catch(e){$('hostMessage').textContent=e.message;button.disabled=false}};$('hostPools').append(button)}
}
$('hostOpen').onclick=async()=>{
 if(!token()){location.href='./pool-login.html?triviaHost=1';return}
 const button=$('hostOpen');button.disabled=true;button.textContent='Checking host access…';$('hostMessage').textContent='Checking your commissioner sign-in…';$('hostSignIn').hidden=true;
 try{await loadBank();$('setup').hidden=false;$('setup').scrollIntoView({behavior:'smooth'});$('hostMessage').textContent='Ready to create your room.';$('message').textContent=''}
 catch(e){$('hostMessage').textContent=e.message;$('hostSignIn').hidden=![401,403].includes(e.status);if(e.status===403){try{await offerHostPools()}catch(problem){$('hostMessage').textContent=problem.message}}$('hostMessage').scrollIntoView({behavior:'smooth',block:'center'})}
 finally{button.disabled=false;button.textContent='Set up a game'}
};
$('create').onclick=()=>act('create',{title:$('title').value,...selection()});
$('answers').onclick=e=>{const b=e.target.closest('[data-choice]');if(b&&!b.disabled)act('answer',{choice:Number(b.dataset.choice)})};
$('next').onclick=()=>{$('roundCategories').replaceChildren();for(const key of state.availableCategories){const b=document.createElement('button');b.textContent=themes[key][0];b.dataset.theme=key;b.onclick=()=>{$('categoryPicker').close();act('next',{category:key})};$('roundCategories').append(b)}$('categoryPicker').showModal()};
$('startQuestion').onclick=()=>act('start-question');$('finalRound').onclick=()=>act('final');$('reveal').onclick=()=>act('reveal');$('end').onclick=()=>{if(confirm('End this game and show the final scoreboard?'))act('end')};
$('restart').onclick=()=>{if(confirm('Start another game in this room? Scores reset to zero and questions can repeat. Everyone stays joined.'))act('restart',{categories:state.categories,difficulty:state.difficulty})};
$('leave').onclick=()=>{if(!confirm('Exit this room? Your score is saved, and you can return using this room code.'))return;sessionStorage.removeItem('trivia-night-room');location.href='./trivia-night.html'};
$('screen').onclick=()=>{document.body.classList.toggle('big');$('screen').textContent=document.body.classList.contains('big')?'Normal view':'Big screen'};
$('libraryOpen').onclick=()=>{$('library').showModal()};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
$('download').onclick=()=>download(bank,'links-trivia-questions.json');
$('file').onchange=async()=>{pending=null;$('import').disabled=true;try{const f=$('file').files[0];if(!f)return;if(f.size>550000)throw Error('Use a JSON file under 550 KB.');const rows=JSON.parse(await f.text());if(!Array.isArray(rows)||!rows.length||rows.length>500)throw Error('Use a JSON array of 1–500 questions.');pending=rows;$('importPreview').textContent=rows.length+' questions selected. Replacing will remove the current library for future games. Download your backup first.';$('import').disabled=false}catch(e){$('importPreview').textContent=e.message}};
$('import').onclick=async()=>{if(!pending||!confirm('Replace this pool’s question library with the uploaded file?'))return;$('import').disabled=true;try{const j=await api({action:'import',questions:pending});await loadBank();$('importPreview').textContent='Saved '+j.count+' questions. Future games will use this library.';pending=null}catch(e){$('importPreview').textContent=e.message;$('import').disabled=false}};
function joinLink(){const u=new URL('./trivia-night.html',location.href);u.searchParams.set('room',roomCode);return u.href}
$('invite').onclick=()=>{const qr=qrcode(0,'M');qr.addData(joinLink());qr.make();$('qr').innerHTML=qr.createSvgTag({cellSize:5,margin:20,scalable:true});$('qr').querySelector('svg').setAttribute('aria-label','Scan to join trivia');$('inviteCode').textContent=roomCode;$('copyStatus').textContent='';$('invitation').showModal()};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(joinLink());$('copyStatus').textContent='Join link copied.'}catch{$('copyStatus').textContent=joinLink()}};
async function poll(){
 if(roomCode&&!busy&&$('setup').hidden&&!document.hidden&&(state||seat()||token())){const n=++sequence;try{const j=await api(null,'?code='+encodeURIComponent(roomCode));if(n===sequence){adopt(j);$('message').textContent=''}}catch(e){if(n===sequence)$('message').textContent=e.message}}
 setTimeout(poll,state?.phase==='question'?2500:5000);
}
mountPartners($('triviaPartners'),{host:$('triviaPartners')});
setInterval(tick,200);poll();
if(new URL(location.href).searchParams.get('host')==='1')$('hostOpen').click();
