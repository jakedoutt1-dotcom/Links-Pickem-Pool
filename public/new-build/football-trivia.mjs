const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let difficulty='easy',data={},a=null,busy=false,practice=false,sound=false,audio,offset=0,board='weekly',lastTD=false;
const secondsPerPlay={easy:6,medium:8,hard:10};
const points={easy:10,medium:20,hard:40};
// Public practice questions only. Scored questions and answers remain server-side.
const samples=[['A touchdown is worth how many points?','6','3','2','7'],['A field goal is worth how many points?','3','6','2','1'],['Which team won Super Bowl I?','Packers','Chiefs','Bears','Steelers'],['A safety is worth how many points?','2','3','1','6'],['Which position usually receives the snap?','Quarterback','Cornerback','Safety','Linebacker'],['What is a defender catching a pass called?','Interception','Punt','Snap','Touchback'],['Which city is home to the Packers?','Green Bay','Chicago','Detroit','Dallas'],['Which Bears legend wore number 34?','Walter Payton','Mike Ditka','Gale Sayers','Dick Butkus'],['Which team was once the Dallas Texans?','Chiefs','Cowboys','Texans','Titans'],['What action starts a scrimmage play?','Snap','Punt return','Tackle','Fair catch']];
let practiceDeck=[];
function tone(kind){if(!sound)return;try{audio||=new (window.AudioContext||window.webkitAudioContext)();audio.resume();if(kind==='touchdown'){const buffer=audio.createBuffer(1,audio.sampleRate,audio.sampleRate),samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*.2;const crowd=audio.createBufferSource(),gain=audio.createGain();crowd.buffer=buffer;gain.gain.setValueAtTime(.15,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+1);crowd.connect(gain);gain.connect(audio.destination);crowd.start();}const notes=kind==='touchdown'?[523,659,784,1046]:kind==='correct'?[660,880]:kind==='tick'?[500]:[180,110];notes.forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.13;o.type=kind==='wrong'?'triangle':'sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.08,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.15);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.16)})}catch{}}
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',sound);if(sound)tone('correct')};
async function api(body){const tokens=[...new Set([localStorage.getItem('links-legacy-token'),localStorage.getItem('links-token')].filter(Boolean))];let r;for(const token of tokens.length?tokens:['']){r=await fetch('./api/football-trivia',{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'x-links-account':localStorage.getItem('links-account-token')||'','Content-Type':'application/json'},cache:'no-store',signal:AbortSignal.timeout(15000),...(body?{body:JSON.stringify(body)}:{})});if(r.status!==401)break;}const j=await r.json();if(!r.ok){const error=Error(j.error||'Trivia is unavailable.');error.status=r.status;throw error;}return j}
function adopt(j){data=j;a=j.attempt;offset=a?a.serverNow-Date.now():0;render();leaderboard();if(j.feedback)feedback(j.feedback)}
function setLoading(loading){const start=$('start');if(start){start.disabled=loading;start.textContent=loading?'Checking your account…':'Start weekly drive';}if(loading)$('message').textContent='Checking your weekly drive…';}
function showStartError(error){
 $('message').textContent=error.message||'Unable to start. Please try again.';
 if(error.status===401||error.status===403){const link=document.createElement('a');link.href=error.status===401?'./pool-login.html':'./control-center.html';link.textContent=error.status===401?' Sign in to your pool':' Open Locker Room → Connect My Pools';$('message').append(link);}
 $('message').scrollIntoView({block:'nearest'});
}
async function resume(){if(busy)return;busy=true;setLoading(true);try{practice=false;adopt(await api());$('message').textContent=''}catch(e){if(!a)render();showStartError(e)}finally{busy=false;setLoading(false)}}
function feedback(f){showPlay(f.correct ? 'gain' : 'miss');$('feedback').replaceChildren();const span=document.createElement('span');span.textContent=(f.correct?'FIRST DOWN! ':f.timedOut?'TIME EXPIRED. ':'INCOMPLETE. ')+(f.correct?'+'+f.earned+' points ('+f.bonus+' speed bonus). ':'')+'Answer: '+f.answer;$('feedback').append(span);if(f.source){const link=document.createElement('a');link.href=f.source;link.target='_blank';link.rel='noopener';link.textContent='Check source';$('feedback').append(link)}tone(f.correct?'correct':'wrong')}
const playNames=['Deep in your own territory','The snap · Own 30','Take the handoff · Own 40','Break through · Midfield','Air it out · Opponent 40','Make the catch · Opponent 30','Into the red zone · Opponent 20','Goal-line push · Opponent 10','Touchdown · LINKS!'];
// Each frame in the 3 x 3 sheet is 512 x 341.33. Scale uniformly like
// background-size: cover, then position the selected frame inside the viewport.
function sizePlayArtwork(){
 const scene=$('playScene'),w=scene.clientWidth,h=scene.clientHeight;
 if(!w||!h)return;
 if(scene.dataset.outcome==='miss'){scene.style.backgroundSize='cover';scene.style.backgroundPosition='center';return;}
 const frameW=Math.max(w,h*1.5),frameH=frameW/1.5,stage=Number(scene.dataset.stage)||0;
 scene.style.backgroundSize=`${frameW*3}px ${frameH*3}px`;
 scene.style.backgroundPosition=`${(w-frameW)/2-(stage%3)*frameW}px ${(h-frameH)/2-Math.floor(stage/3)*frameH}px`;
}
new ResizeObserver(sizePlayArtwork).observe($('playScene'));
function showPlay(outcome){
 const stage=Math.min(8,a?.correct||0),miss=outcome==='miss';
 const scene=$('playScene');scene.dataset.stage=String(stage);scene.dataset.outcome=miss?'miss':'gain';
 sizePlayArtwork();
 scene.setAttribute('aria-label',miss?'LINKS receiver misses a pass. No yards gained.':playNames[stage]);
 $('sceneCaption').textContent=miss?(stage===8?'No extra points this play · Touchdown secured':'Incomplete · Hold your field position'):playNames[stage];
}
function render(){showPlay();
 const stadium=document.querySelector('.stadium'),scoreboard=document.querySelector('.scoreboard'),finished=a?.status==='complete';
 scoreboard.classList.toggle('final-scoreboard',finished);
 const consolePanel=document.querySelector('.console');stadium.prepend(consolePanel);stadium.prepend(scoreboard);
 stadium.classList.toggle('drive-finished',finished);
 $('points').textContent=String(a?.score||0).padStart(3,'0');const correct=a?.correct||0,yards=Math.min(100,20+correct*10);$('ball').style.left='clamp(30px, '+yards+'%, calc(100% - 30px))';$('ball').setAttribute('aria-label','Ball '+yards+' yards from your goal line');$('drive').textContent=yards===100?'TD':yards===50?'MIDFIELD':yards<50?'OWN '+yards:'OPP '+(100-yards);$('down').textContent=a?.status==='active'?'DOWN '+(a.misses+1)+' · 10 TO GO':a?.status==='complete'?'DRIVE COMPLETE':'READY FOR KICKOFF';$('play').textContent=a?'PLAY '+Math.min(a.play,10)+' / 10':'10 PLAYS · ONE SHOT';
 if(correct>=8&&!lastTD){lastTD=true;$('celebrate').hidden=false;tone('touchdown');setTimeout(()=>$('celebrate').hidden=true,2200)}
 if(!a){$('clock').textContent=String(secondsPerPlay[difficulty]).padStart(2,'0');$('game').innerHTML='<p class="mode">NFL football · Choose your challenge</p><h2>How deep is your playbook?</h2><div class="difficulty">'+Object.entries(points).map(([d,p])=>'<button data-difficulty="'+d+'" aria-pressed="'+(d===difficulty)+'" class="'+(d===difficulty?'active':'')+'"><strong>'+d.toUpperCase()+'</strong><small>'+p+' pts + up to '+(p/2)+' speed · '+secondsPerPlay[d]+' sec</small><small>'+(d==='easy'?'The fundamentals':d==='medium'?'Know your football':'Expert history')+'</small></button>').join('')+'</div><label>Your leaderboard name<input id="alias" maxlength="40" value="'+esc(localStorage.getItem('links-player-name')||'Player')+'"></label><p>Easy: 6 seconds · Medium: 8 seconds · Hard: 10 seconds. One scored drive each week, across every pool. Your name and score appear on the LINKS trivia leaderboard.</p><div class="setup-actions"><button id="start" class="primary">Start weekly drive</button><button id="practice">Try practice</button></div>';
 $('game').querySelectorAll('[data-difficulty]').forEach(b=>b.onclick=()=>{difficulty=b.dataset.difficulty;render()});$('start').onclick=start;$('practice').onclick=startPractice;return}
 if(a.status==='complete'){$('clock').textContent='FINAL';$('game').innerHTML='<p class="mode">'+(practice?'PRACTICE · NOT RANKED':'WEEKLY DRIVE COMPLETE')+'</p><h2>'+(correct>=8?'You found the end zone!':'That’s your drive!')+'</h2><div class="result-score">'+a.score+' <small>PTS</small></div><p>'+correct+' correct · '+a.difficulty.toUpperCase()+' · '+(correct>=8?'1 touchdown':'Keep studying your playbook')+'</p><p>'+(practice?'Practice never changes your weekly score.':'Your score is saved. Come back next Monday for a fresh challenge.')+'</p><button id="again">Play practice</button>'; $('again').onclick=startPractice;return}
 $('game').innerHTML='<p class="mode">'+(practice?'PRACTICE · SAMPLE QUESTIONS':a.difficulty+' · '+points[a.difficulty]+' POINTS + UP TO '+(points[a.difficulty]/2)+' SPEED BONUS')+'</p><h2 class="question">'+esc(a.question.text)+'</h2><div class="answers">'+a.question.choices.map((c,i)=>'<button data-answer="'+i+'">'+String.fromCharCode(65+i)+'. '+esc(c)+'</button>').join('')+'</div>';$('game').querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.answer)));keepQuestionVisible();tick();
}
async function start(){if(busy){$('message').textContent='Checking your account—please wait a moment.';return;}if(!localStorage.getItem('links-legacy-token')&&!localStorage.getItem('links-token')){showStartError({status:401,message:'Sign in to your pool before starting your weekly drive.'});return;}if(!confirm('Start your one scored football drive for this week? The clock starts immediately, and refreshing will not restart it.'))return;busy=true;$('start').disabled=true;try{practice=false;lastTD=false;adopt(await api({action:'start',difficulty,name:$('alias').value}));$('message').textContent=''}catch(e){render();showStartError(e)}finally{busy=false;setLoading(false)}}
function startPractice(){if(busy)return;practice=true;lastTD=false;offset=0;practiceDeck=samples.map(q=>({text:q[0],answer:q[1],choices:q.slice(1).sort(()=>Math.random()-.5)})).sort(()=>Math.random()-.5);a={score:0,correct:0,misses:0,play:1,status:'active',difficulty,deadline:Date.now()+secondsPerPlay[difficulty]*1000,question:practiceDeck[0]};$('feedback').replaceChildren();$('message').textContent='Practice uses sample questions. Scores are not ranked.';render()}
async function answer(choice){if(busy||a?.status!=='active')return;busy=true;$('game').querySelectorAll('button').forEach(b=>b.disabled=true);try{if(practice){const q=practiceDeck[a.play-1],timedOut=Date.now()>a.deadline,correct=!timedOut&&q.choices[choice]===q.answer;const bonus=correct?Math.floor((points[a.difficulty]/2)*Math.max(0,Math.min(1,(a.deadline-Date.now())/(secondsPerPlay[a.difficulty]*1000)))):0,earned=correct?points[a.difficulty]+bonus:0;a.score+=earned;a.correct+=correct?1:0;a.misses=correct?0:a.misses+1;a.play++;a.status=a.play>10||a.misses>=4?'complete':'active';a.deadline=Date.now()+secondsPerPlay[a.difficulty]*1000;a.question=practiceDeck[a.play-1];render();feedback({correct,timedOut,earned,bonus,answer:q.answer})}else{adopt(await api({action:'answer',id:a.id,version:a.version,choice}));$('message').textContent=''}}catch(e){$('message').textContent=e.message+' Use Refresh / resume.';a=null;$('game').innerHTML='<h2>Connection interrupted</h2><p>Your server-side attempt is saved. Resume below.</p>'}finally{busy=false}}
function keepQuestionVisible(){
 const panel=$('game'),rect=panel.getBoundingClientRect();
 if(rect.top<0||rect.bottom>window.innerHeight){
 const top=document.querySelector('.scoreboard').getBoundingClientRect().top+window.scrollY;
 window.scrollTo({top:Math.max(0,top-8),behavior:'instant'});
 }
}
let lastSecond;
function tick(){if(a?.status!=='active')return;const seconds=Math.max(0,Math.ceil((a.deadline-Date.now()-offset)/1000));$('clock').textContent=String(seconds).padStart(2,'0');document.querySelector('.clock').classList.toggle('urgent',seconds<=3);if(seconds!==lastSecond&&seconds>0&&seconds<=3)tone('tick');lastSecond=seconds;if(seconds===0&&!busy)answer(null)}setInterval(tick,100);
function leaderboard(){
 $('weekly').setAttribute('aria-pressed',board==='weekly');$('season').setAttribute('aria-pressed',board==='seasonal');$('poolBoardTitle').textContent=data.poolName||'Your Pool';
 function table(rows){let rank=0,prev;return rows.length?'<table><thead><tr><th>Rank</th><th>Player</th><th>Points</th><th>'+(board==='weekly'?'Level':'TD / Best')+'</th></tr></thead><tbody>'+rows.map((r,i)=>{if(r.score!==prev)rank=i+1;prev=r.score;return '<tr><td>'+rank+'</td><td>'+esc(r.name)+'</td><td>'+r.score+'</td><td>'+esc(board==='weekly'?r.difficulty:r.touchdowns+' / '+r.best)+'</td></tr>'}).join('')+'</tbody></table>':'<p>No completed drives loaded yet. Sign in for scored standings.</p>'}
 $('leaders').innerHTML=table(data[board]||[]);$('poolLeaders').innerHTML=table(data[board==='weekly'?'poolWeekly':'poolSeasonal']||[]);
}

$('weekly').onclick=()=>{board='weekly';leaderboard()};$('season').onclick=()=>{board='seasonal';leaderboard()};$('refresh').onclick=()=>{if(a?.status==='active'&&practice&&!confirm('Leave this practice drive?'))return;resume()};
render();leaderboard();if(localStorage.getItem('links-token')||localStorage.getItem('links-legacy-token'))resume();else $('message').textContent='Try practice, or sign in to your pool for the weekly leaderboard.';
