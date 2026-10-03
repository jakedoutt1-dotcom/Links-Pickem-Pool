import qrcode from './vendor/qrcode.mjs';
import {mountPartners} from './partner-banner.mjs';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const themes={football:['SPORTS','🏆'],music:['MUSIC','♫'],movies:['MOVIES & TV','▶'],history:['HISTORY','Ⅲ'],science:['SCIENCE','⚛'],general:['MIXED BAG','✦']};
let state=null,offset=0,busy=false,bank=[],pending=null,signature='',sequence=0,roomCode=new URL(location.href).searchParams.get('room')||sessionStorage.getItem('trivia-night-room')||'';
const token=()=>localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token')||'';
const seat=()=>localStorage.getItem('trivia-night-seat-'+roomCode)||'';
const selection=()=>({mode:$('playMode').value,categories:[...document.querySelectorAll('[name=category]:checked')].map(e=>e.value),difficulty:$('difficulty').value});
$('categories').innerHTML=Object.entries(themes).map(([key,[name,icon]])=>`<label><span>${icon}</span><input type="checkbox" name="category" value="${key}" checked> ${name}</label>`).join('');
if(new URL(location.href).searchParams.get('host')==='1'||new URL(location.href).searchParams.get('step')==='setup')roomCode='';
$('code').value=roomCode;
$('hostAccountChoices').hidden=!!token();$('hostAccountHelp').hidden=!!token();$('hostOpen').hidden=!token();
async function api(body,query=''){
 const r=await fetch('./api/trivia-night'+query,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token(),'x-trivia-token':seat(),'Content-Type':'application/json'},cache:'no-store',signal:AbortSignal.timeout(12000),...(body?{body:JSON.stringify(body)}:{})});
 const j=await r.json();if(!r.ok){const e=Error(j.error||'Unable to reach trivia.');e.status=r.status;throw e}return j;
}
function adopt(j){
 if($('quickJoin').open)$('quickJoin').close();document.body.classList.remove('qr-joining');
 offset=j.serverNow-Date.now();state=j;roomCode=j.code;sessionStorage.setItem('trivia-night-room',roomCode);
 if(j.token)localStorage.setItem('trivia-night-seat-'+roomCode,j.token);
 document.body.classList.add('in-room');document.body.dataset.role=j.host?'host':'player';$('screen').hidden=!j.host||!['lobby','ended'].includes(j.phase);
 showScreen(j.phase==='lobby'?'waiting':j.phase==='ended'?'results':'game');
 const u=new URL(location.href);u.searchParams.set('room',roomCode);u.searchParams.delete('step');u.searchParams.delete('host');history.replaceState(null,'',u);
 render();
}
function showScreen(name){document.body.dataset.screen=name;$('entry').hidden=name!=='home';$('setup').hidden=name!=='setup';$('room').hidden=['home','setup'].includes(name);document.querySelector('.intro').hidden=name!=='home';}
function openSetup(){++sequence;showScreen('setup');$('screen').hidden=true;const u=new URL(location.href);u.searchParams.delete('room');u.searchParams.delete('host');u.searchParams.set('step','setup');if(new URL(location.href).searchParams.get('step')!=='setup')history.pushState({triviaSetup:true},'',u);window.scrollTo({top:0,behavior:'instant'});$('setupBack').focus();}
function setupHome(){++sequence;roomCode='';state=null;signature='';showScreen('home');document.body.classList.remove('in-room');delete document.body.dataset.view;document.body.dataset.category='general';$('message').textContent='';$('hostMessage').textContent='';$('hostOpen').focus();}
$('setupBack').onclick=()=>{if(history.state?.triviaSetup)history.back();else{const u=new URL(location.href);u.searchParams.delete('step');u.searchParams.delete('host');history.replaceState(null,'',u);setupHome()}};
window.addEventListener('popstate',()=>{if(new URL(location.href).searchParams.get('step')!=='setup'&&document.body.dataset.screen==='setup')setupHome();else if(new URL(location.href).searchParams.get('step')==='setup'&&!state)$('hostOpen').click()});
showScreen('home');
async function act(action,extra={}){
 if(busy)return;busy=true;++sequence;$('message').textContent='';tick();
 try{adopt(await api({action,code:roomCode,gameNumber:state?.game,index:state?.index,phase:state?.phase,...extra}));}
 catch(e){$('message').textContent=e.message;}
 finally{busy=false;tick();}
}
function render(){
 const stable=JSON.stringify({...state,serverNow:0,token:undefined});if(stable===signature){tick();return}signature=stable;
 $('tvStatus').textContent=state.tvConnected?'TV display connected':'Waiting for a display…';
 $('screenStep').textContent=state.phase==='lobby'?'WAITING ROOM':state.phase==='ended'?'RESULTS':'GAME IN PROGRESS';
 const q=state.question,revealed=['reveal','ended'].includes(state.phase),theme=state.categoryIntro||q?.category||'general';document.body.dataset.category=theme;
 $('symbol').textContent=themes[theme][1];$('categoryLabel').textContent=themes[theme][0]+(q?' · '+q.difficulty.toUpperCase():'');
 $('roomTitle').textContent=state.title+' · ROOM '+state.code;
 $('roomStatus').textContent=state.phase==='ended'?'That’s a wrap.':state.phase==='lobby'?'The night starts here.':'Game '+state.game+' · '+state.playerCount+(state.mode==='teams'?' teams':' players');
 $('questionNumber').textContent=state.isFinal?'FINAL ROUND · DOUBLE POINTS':q?'QUESTION '+(state.index+1):'READY WHEN YOU ARE';
 $('phaseLabel').textContent=state.phase==='lobby'?'WAITING FOR THE HOST':state.phase==='ended'?'FINAL SCOREBOARD':revealed?'THE ANSWER IS IN':'THINK FAST. MAKE IT COUNT.';
 $('question').textContent=state.phase==='category'?(state.isFinal?'FINAL ROUND · ':'')+themes[theme][0]+' ROUND':q?.text||(state.host?'Your room is ready.':'Waiting for host to start game');
 $('invite').hidden=!state.host||state.phase!=='lobby';$('screen').hidden=!state.host||!['lobby','ended'].includes(state.phase);
 $('lobbyInvite').hidden=!state.host||state.phase!=='lobby';
 document.querySelector('.stage').hidden=state.phase==='ended'||state.host&&state.phase==='lobby';
 document.querySelector('#room>.standings').hidden=state.phase!=='ended';
 $('triviaPartners').hidden=!['lobby','reveal','ended'].includes(state.phase);
 const screenKey=state.game+':'+state.index+':'+state.phase;if(window.triviaScreenKey!==screenKey){window.triviaScreenKey=screenKey;window.scrollTo({top:0,behavior:'instant'})}
 $('playerSummary').hidden=state.host;const me=state.leaders.find(p=>p.you);$('playerSummary').textContent=me?me.name+' · '+me.score.toLocaleString()+' points · Rank '+me.rank:'';
 $('questionProvider').textContent=state.host?[state.questionSource,state.questionNotice].filter(Boolean).join(' · '):'';
 $('hostStep').textContent=state.isFinal&&state.phase==='reveal'?'Final answer · Review the result, then show final standings':({lobby:'1 · Invite your players, then start the game',category:'2 · Category ready — start when everyone is ready',question:'3 · Wait for answers, then reveal',reveal:'4 · Choose the next category or play the final round',ended:'Game complete · Show standings or play again'})[state.phase];
 if(state.host&&state.phase==='lobby'){const qr=qrcode(0,'M');qr.addData(joinLink());qr.make();$('lobbyQR').innerHTML=qr.createSvgTag({cellSize:6,margin:20,scalable:true});$('lobbyCode').textContent=roomCode;$('lobbyCount').textContent=state.playerCount+(state.mode==='teams'?' teams joined':' players joined');$('lobbyRoster').textContent=state.leaders.map(p=>p.name).join(' · ');}
 $('answers').hidden=state.phase==='category';
 $('answers').innerHTML=q?q.answers.map((a,i)=>`<button data-choice="${i}" class="${state.choice===i?'selected ':''}${revealed?(q.correct===i?'correct':state.choice===i?'wrong':''):''}"><b>${'ABCD'[i]}</b><span>${esc(a)}${revealed&&q.correct===i?' ✓':''}${state.choice===i?' · Your answer':''}</span></button>`).join(''):'';
 $('source').textContent=revealed&&q?'Source: '+q.source+' · '+q.license:'';
 $('answerNote').textContent=state.phase==='category'?(state.isFinal?'One hard question. Double base and speed points. '+(state.mode==='teams'?45:20)+' seconds. Final scores appear after the host reveals.':'Get ready. The host starts the clock when everyone is ready.'):state.phase==='lobby'?(state.host?'Show the QR code so players can join.':'Waiting for host to start game.'):state.phase==='ended'?'Thanks for playing! Stay here if the host starts another game.':revealed?(state.isFinal?'Final answer revealed. The host will show final standings when everyone is ready.':'Scores are updated. The host will start the next question.'):state.host?(state.mode==='teams'?'Each team submits on one phone. Reveal after the timer ends.':'Players answer on their phones. Reveal after the timer ends.'):!state.eligible?'You’re in! Your first question is the next one.':state.choice!==null?'Answer saved. Wait for the host to reveal.':(state.mode==='teams'?'Discuss with your team, then submit one answer. You cannot change it.':'Choose one answer. You cannot change it after submitting.');
 $('hostControls').hidden=!state.host;$('showStandings').hidden=!['lobby','reveal'].includes(state.phase);$('scoreboardTitle').textContent=state.phase==='ended'?'Final standings':'Live standings';$('answered').textContent=state.answered+' answers received · '+state.remaining+' questions remaining';
 $('leaders').innerHTML=state.leaders.length?state.leaders.map(p=>`<li class="${p.you?'you':''}"><span>${p.rank}</span><span>${esc(p.name)}${p.you?' · You':''}</span><strong>${p.score.toLocaleString()}</strong></li>`).join(''):'<li>Waiting for the first player or team.</li>';

 tick();
}
function tick(){
 if(!state)return;const seconds=Math.max(0,Math.ceil((state.deadline-Date.now()-offset)/1000));
 const count=Math.max(0,Math.ceil(((state.startsAt||0)-Date.now()-offset)/1000)),waiting=state.phase==='question'&&!state.question;
 document.body.dataset.view=waiting?'countdown':state.phase;
 $('startCountdown').hidden=!waiting;document.querySelector('.question-area').hidden=waiting;
 const number=count?String(count):'GO';if($('countdownNumber').textContent!==number){$('countdownNumber').textContent=number;const logo=document.querySelector('.countdown-logo');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)logo.animate([{filter:'drop-shadow(0 0 10px #eac15d)'},{filter:'drop-shadow(0 0 50px #ffd67b)'},{filter:'drop-shadow(0 0 10px #eac15d)'}],{duration:650})}
 $('clock').textContent=state.phase==='question'&&!waiting?String(seconds).padStart(2,'0'):'—';
 document.querySelectorAll('[data-choice]').forEach(e=>{e.disabled=busy||waiting||state.host||state.phase!=='question'||seconds===0||!state.eligible||state.choice!==null});
 $('next').hidden=state.isFinal||!['lobby','reveal'].includes(state.phase);$('next').disabled=busy||state.remaining===0;$('next').textContent=state.phase==='lobby'?'Start game':'Choose next category';
 $('startQuestion').hidden=state.phase!=='category';$('startQuestion').disabled=busy;
 $('finalRound').hidden=state.isFinal||state.phase!=='reveal';$('finalRound').disabled=busy||!state.canFinal;
 $('reveal').hidden=state.phase!=='question';$('reveal').disabled=busy||seconds>0;$('reveal').textContent=seconds>0?'Answers open · '+seconds+'s':'Reveal answer';
 $('end').textContent=state.isFinal?'Show final standings':'End game';$('end').classList.toggle('gold',!!state.isFinal);$('end').hidden=!['reveal','lobby'].includes(state.phase);$('end').disabled=busy||(state.phase==='question'&&seconds>0);
 $('restart').hidden=state.phase!=='ended';$('restart').disabled=busy;
 if(state.phase==='question'&&seconds===0&&state.choice===null&&!state.host&&state.eligible)$('answerNote').textContent='Time is up. Waiting for the host to reveal the answer.';
}
$('joinForm').onsubmit=e=>{e.preventDefault();roomCode=$('code').value.trim().toUpperCase();act('join',{name:$('name').value.trim()})};
async function loadBank(){const j=await api(null,'?action=library');$('bankCount').textContent=(j.providerConfigured?'Fresh questions load when you create a game. '+j.count+' backup questions':j.count+' questions')+' · '+j.plan+': '+j.activeRooms+' of '+j.roomLimit+' active trivia rooms. Reuse a room for more games. Rooms expire after 24 hours.';$('existingRooms').replaceChildren();for(const room of j.rooms){const a=document.createElement('a');a.href='./trivia-night.html?room='+room.code;a.textContent='Reopen room '+room.code;$('existingRooms').append(a)}$('create').disabled=j.activeRooms>=j.roomLimit;}
async function hostPoolRequest(body){
 const r=await fetch('./api/pool-switcher',{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token(),'x-links-account':localStorage.getItem('links-account-token')||'','Content-Type':'application/json'},cache:'no-store',signal:AbortSignal.timeout(12000),...(body?{body:JSON.stringify(body)}:{})});const j=await r.json();if(!r.ok)throw Error(j.error||'Your connected pools could not be loaded.');return j;
}
async function offerHostPools(){
 const j=await hostPoolRequest(),pools=(j.pools||[]).filter(p=>p.role==='admin');
 $('hostPools').replaceChildren();
 if(!pools.length){$('hostMessage').textContent='You are signed in, but this player session has no connected commissioner pool. Sign in using the commissioner player for the pool you manage.';return}
 $('hostMessage').textContent='You are signed in. Choose a pool you manage to host Trivia Night:';
 for(const pool of pools){const button=document.createElement('button');button.textContent='Host with '+pool.name;button.onclick=async()=>{button.disabled=true;$('hostMessage').textContent='Opening commissioner access…';try{const opened=await hostPoolRequest({action:'open',pool:pool.id});localStorage.setItem('links-legacy-token',opened.token);localStorage.setItem('links-token',opened.token);localStorage.setItem('links-current-pool',JSON.stringify(opened.pool));localStorage.setItem('links-player-id',opened.playerId);localStorage.setItem('links-player-name',opened.playerId);localStorage.setItem('links-player-role',opened.pool.role);await loadBank();openSetup();$('hostPools').replaceChildren();$('hostSignIn').hidden=true;$('hostMessage').textContent='Hosting with '+pool.name;}catch(e){$('hostMessage').textContent=e.message;button.disabled=false}};$('hostPools').append(button)}
}
$('hostOpen').onclick=async()=>{
 ++sequence;roomCode='';
 if(!token()){$('hostAccountChoices').hidden=false;$('hostAccountHelp').hidden=false;return}
 const button=$('hostOpen');button.disabled=true;button.textContent='Checking host access…';$('hostMessage').textContent='Checking your commissioner sign-in…';$('hostSignIn').hidden=true;
 try{await loadBank();openSetup();$('hostMessage').textContent='Ready to create your room.';$('message').textContent=''}
 catch(e){$('hostAccountChoices').hidden=false;$('hostAccountHelp').hidden=false;$('hostMessage').textContent=e.message;$('hostSignIn').hidden=![401,403].includes(e.status);if(e.status===403){try{await offerHostPools()}catch(problem){$('hostMessage').textContent=problem.message}}$('hostMessage').scrollIntoView({behavior:'smooth',block:'center'})}
 finally{button.disabled=false;button.textContent='Set up a game'}
};
$('create').onclick=()=>act('create',{title:$('title').value,...selection()});
$('answers').onclick=e=>{const b=e.target.closest('[data-choice]');if(b&&!b.disabled)act('answer',{choice:Number(b.dataset.choice)})};
function roundCategories(){const difficulty=document.querySelector('[name=roundLevel]:checked')?.value||'mixed';$('roundCategories').replaceChildren();for(const key of state.availableCategories){const b=document.createElement('button');b.textContent=themes[key][0];b.dataset.theme=key;b.disabled=difficulty!=='mixed'&&state.availableLevels&&!state.availableLevels[key]?.includes(difficulty);b.onclick=()=>{$('categoryPicker').close();act('next',{category:key,difficulty})};$('roundCategories').append(b)}}
$('roundDifficulty').onchange=roundCategories;
$('next').onclick=()=>{document.querySelectorAll('[name=roundLevel]').forEach(r=>{r.parentElement.lastChild.textContent=' '+r.value[0].toUpperCase()+r.value.slice(1)+(r.value==='mixed'?'':' · '+(state.mode==='teams'?{easy:20,medium:30,hard:45}:{easy:10,medium:15,hard:20})[r.value]+' sec')});document.querySelectorAll('[name=roundLevel]').forEach(r=>r.checked=r.value===(state.difficulty||'mixed'));roundCategories();$('categoryPicker').showModal()};
$('startQuestion').onclick=()=>act('start-question');$('finalRound').onclick=()=>act('final');$('reveal').onclick=()=>act('reveal');$('end').onclick=()=>{if(state.isFinal||confirm('End this game and show the final scoreboard?'))act('end')};
$('restart').onclick=()=>{if(confirm('Start another game in this room? Scores reset to zero and a new question set loads. Everyone stays joined.'))act('restart',{categories:state.categories,difficulty:state.difficulty})};
$('leave').onclick=()=>{if(!confirm('Exit this room? Your score is saved, and you can return using this room code.'))return;sessionStorage.removeItem('trivia-night-room');location.href='./trivia-night.html'};
function tvLink(){const u=new URL('./trivia-tv.html',location.href);u.searchParams.set('room',roomCode);return u.href}
$('screen').onclick=()=>{const u=new URL('./trivia-tv.html',location.href);$('tvAddress').textContent=u.host+u.pathname;$('tvAddress').href=u.href;$('tvCode').textContent=roomCode;$('tvOpen').href=tvLink();$('tvCopyStatus').textContent='';$('tvConnect').showModal()};
$('tvCopy').onclick=async()=>{try{await navigator.clipboard.writeText(tvLink());$('tvCopyStatus').textContent='Display link copied.'}catch{$('tvCopyStatus').textContent=tvLink()}};

document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
function joinLink(){const u=new URL('./trivia-night.html',location.href);u.searchParams.set('room',roomCode);return u.href}
$('invite').onclick=()=>{const qr=qrcode(0,'M');qr.addData(joinLink());qr.make();$('qr').innerHTML=qr.createSvgTag({cellSize:5,margin:20,scalable:true});$('qr').querySelector('svg').setAttribute('aria-label','Scan to join trivia');$('inviteCode').textContent=roomCode;$('copyStatus').textContent='';$('invitation').showModal()};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(joinLink());$('copyStatus').textContent='Join link copied.'}catch{$('copyStatus').textContent=joinLink()}};
async function poll(){
 if(roomCode&&!busy&&!$('quickJoin').open&&$('setup').hidden&&!document.hidden&&(state||seat()||token())){const n=++sequence;try{const j=await api(null,'?code='+encodeURIComponent(roomCode));if(n===sequence){adopt(j);$('message').textContent=''}}catch(e){if(n===sequence)$('message').textContent=e.message}}
 setTimeout(poll,state?.countdown?250:state?.phase==='question'?1000:2000);
}
mountPartners($('triviaPartners'),{host:$('triviaPartners'),autoLocate:true});
async function openQRJoin(){
 const linkedCode=new URL(location.href).searchParams.get('room');
 if(!linkedCode||new URL(location.href).searchParams.get('host')==='1')return;
 document.body.classList.add('qr-joining');$('entry').hidden=true;
 if(seat()||token()){try{adopt(await api(null,'?code='+encodeURIComponent(roomCode)));return}catch(e){if(![401,403].includes(e.status)){$('quickJoinMessage').textContent=e.message}}}
 try{const info=await api(null,'?action=info&code='+encodeURIComponent(roomCode));if(info.mode==='teams'){$('quickNameLabel').textContent='Team name';$('quickName').placeholder='Choose your team name';$('quickJoinHelp').textContent='Use one phone for your whole team. Talk through each question and submit one answer together.'}}catch{}
 $('quickJoin').showModal();$('quickName').focus();
}
$('quickJoinForm').onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;++sequence;$('quickJoinButton').disabled=true;$('quickJoinMessage').textContent='Joining…';try{adopt(await api({action:'join',code:roomCode,name:$('quickName').value.trim()}))}catch(error){$('quickJoinMessage').textContent=error.message}finally{busy=false;$('quickJoinButton').disabled=false}};
$('quickJoinExit').onclick=()=>location.href='./trivia-night.html';
$('quickJoin').addEventListener('cancel',e=>{e.preventDefault();location.href='./trivia-night.html'});
setInterval(tick,200);openQRJoin().finally(poll);
if(new URL(location.href).searchParams.get('host')==='1'||new URL(location.href).searchParams.get('step')==='setup')$('hostOpen').click();

$('playMode').onchange=()=>{const team=$('playMode').value==='teams',times=team?[20,30,45]:[10,15,20];$('modeHelp').textContent=team?'Use one phone per team. Discuss together and submit one answer. Easy 20s · Medium 30s · Hard 45s. Up to 250 speed points.':'Answer on your own. Easy 10s · Medium 15s · Hard 20s. Up to 500 speed points.';['easy','medium','hard'].forEach((level,i)=>{$('difficulty').querySelector('[value='+level+']').textContent=level[0].toUpperCase()+level.slice(1)+' · '+times[i]+' seconds · '+[500,1000,1500][i].toLocaleString()+' + speed'})};
