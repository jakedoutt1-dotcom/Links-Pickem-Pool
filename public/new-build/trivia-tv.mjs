import {mountTriviaSound} from './trivia-sound.mjs?v=tv-audio2';
import qrcode from './vendor/qrcode.mjs';
const sounds=mountTriviaSound({button:document.getElementById('soundToggle'),lobbyMusic:true});
const $=id=>document.getElementById(id),themes={football:'SPORTS',music:'MUSIC',movies:'MOVIES & TV',history:'HISTORY',science:'SCIENCE',general:'MIXED BAG'};
let code='',state=null,offset=0,heartbeat=0,timer,version=0,signature='';
function tick(){if(!state)return;sounds.update(state,Date.now()+offset);const now=Date.now()+offset,count=Math.max(0,Math.ceil((state.startsAt-now)/1000)),waiting=state.phase==='question'&&!state.question;$('countdown').hidden=!waiting;$('questionArea').hidden=waiting;$('countdownNumber').textContent=count||'GO';$('clock').textContent=state.phase==='question'&&!waiting?String(Math.max(0,Math.ceil((state.deadline-now)/1000))).padStart(2,'0'):'—';}
function fitQuestion(){
 const display=$('display');if(display.hidden)return;display.style.minHeight=Math.max(0,innerHeight-display.getBoundingClientRect().top-14)+'px';const stage=$('stage');if(stage.hidden)return;const bannerSpace=($('venueBanner').hidden?0:$('venueBanner').offsetHeight)+($('tvStandings').hidden?0:$('tvStandings').offsetHeight+10);
 let question=Math.min(40,Math.max(24,innerWidth*.026)),answer=Math.min(30,Math.max(20,innerWidth*.019));
 const apply=()=>{stage.style.setProperty('--tv-question-size',question+'px');stage.style.setProperty('--tv-answer-size',answer+'px')};apply();
 while(stage.getBoundingClientRect().bottom>innerHeight-14-bannerSpace&&(question>18||answer>15)){question=Math.max(18,question-1);answer=Math.max(15,answer-1);apply()}
}
window.addEventListener('resize',()=>requestAnimationFrame(fitQuestion));
document.addEventListener('fullscreenchange',()=>requestAnimationFrame(fitQuestion));
function render(){
 const leaders=state.leaders||[];$('tvStandings').hidden=state.phase==='lobby'||!leaders.length;$('standingCount').textContent='Top '+Math.min(12,leaders.length)+' of '+leaders.length;$('tvLeaders').replaceChildren();for(const player of leaders.slice(0,12)){const row=document.createElement('li');for(const [cls,value] of [['rank',player.rank],['name',player.name],['points',Number(player.score||0).toLocaleString()]]){const span=document.createElement('span');span.className=cls;span.textContent=value;row.append(span)}$('tvLeaders').append(row)}
 const q=state.question,phase=state.phase,theme=state.categoryIntro||q?.category||'general';document.body.dataset.category=theme;
 const logo=$('venueLogo'),venue=state.venue;logo.hidden=!venue?.logo;$('venueBanner').hidden=!venue;$('venueName').textContent=venue?.name||'';logo.alt=venue?.name||'';logo.onerror=()=>{logo.hidden=true;requestAnimationFrame(fitQuestion)};logo.onload=()=>requestAnimationFrame(fitQuestion);if(venue?.logo&&logo.getAttribute('src')!==venue.logo)logo.src=venue.logo;
 $('title').textContent=state.title;$('roomLabel').textContent='ROOM '+code;$('lobby').hidden=phase!=='lobby';$('stage').hidden=phase==='lobby';
 $('category').textContent=themes[theme]+(q?' · '+q.difficulty.toUpperCase():'');$('number').textContent=state.isFinal?'FINAL ROUND · DOUBLE POINTS':'QUESTION '+(state.index+1);
 $('question').textContent=phase==='category'?themes[theme]+' · Get ready':q?.text||(phase==='ended'?'Thanks for playing!':'');
 $('answers').replaceChildren();if(q)q.answers.forEach((text,i)=>{const row=document.createElement('div');row.className='tv-answer'+(q.correct===i?' correct':'');const letter=document.createElement('b');letter.textContent='ABCD'[i];const label=document.createElement('span');label.textContent=text+(q.correct===i?' ✓':'');row.append(letter,label);$('answers').append(row)});
 $('note').textContent=phase==='ended'?'Game complete · Final standings below.':phase==='reveal'?'Answer revealed · Live standings below':phase==='category'?'The host will start the clock.':(state.mode==='teams'?'Discuss together. Submit one answer on your team’s phone.':'Answer on your phone. The host reveals after time is up.');$('source').textContent=q?.source?'Source: '+q.source+' · '+q.license:'';
 $('count').textContent=state.playerCount+(state.mode==='teams'?' teams joined':' players joined');tick();requestAnimationFrame(fitQuestion);
}
async function poll(n){if(n!==version||!code)return;try{
 const ping=Date.now()-heartbeat>15000;const r=await fetch('./api/trivia-night'+(ping?'':'?action=display&code='+encodeURIComponent(code)),{method:ping?'POST':'GET',cache:'no-store',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(12000),...(ping?{body:JSON.stringify({action:'display',code})}:{})});const j=await r.json();if(n!==version)return;if(!r.ok){const error=Error(j.error||'Unable to connect.');error.status=r.status;throw error}if(ping)heartbeat=Date.now();state=j;offset=j.serverNow-Date.now();$('connect').hidden=true;$('display').hidden=false;$('status').textContent='';const next=JSON.stringify({...j,serverNow:0});if(signature!==next){signature=next;render()}else tick();
 }catch(e){if(n!==version)return;$('status').textContent=(e.message||'Connection interrupted.')+' '+([400,404].includes(e.status)?'Check the code with your host.':'Reconnecting…');if([400,404].includes(e.status)){$('display').hidden=true;$('connect').hidden=false;state=null;return}}
 if(n===version)timer=setTimeout(()=>poll(n),state?.countdown?250:state?.phase==='question'?1000:2000);
}
function connect(value){code=value.trim().toUpperCase();if(!/^[A-F0-9]{10}$/.test(code)){$('status').textContent='Enter the 10-character room code.';return}clearTimeout(timer);state=null;signature='';heartbeat=0;const u=new URL(location.href);u.searchParams.set('room',code);history.replaceState(null,'',u);$('joinCode').textContent=code;const link=new URL('./trivia-night.html',location.href);link.searchParams.set('room',code);const qr=qrcode(0,'M');qr.addData(link.href);qr.make();$('qr').innerHTML=qr.createSvgTag({cellSize:6,margin:20,scalable:true});$('status').textContent='Connecting…';poll(++version)}
$('connect').onsubmit=e=>{e.preventDefault();void sounds.activate();connect($('roomCode').value)};
$('disconnect').onclick=()=>{++version;clearTimeout(timer);code='';state=null;sounds.stop();$('connect').hidden=false;$('display').hidden=true;$('status').textContent='Display disconnected.';history.replaceState(null,'',location.pathname)};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else $('status').textContent='Use your device’s full-screen or landscape mode.'}catch{$('status').textContent='Full screen is unavailable. The display still works in this window.'}};
setInterval(tick,200);const initial=new URL(location.href).searchParams.get('room');if(initial){$('roomCode').value=initial;connect(initial)};
