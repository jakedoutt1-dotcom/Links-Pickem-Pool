import {dailyShots,centralDay,launch,step,DT,simulate} from './daily-shot-core.mjs?v=1';
import {createCourt} from './daily-shot-scene.mjs?v=1';
import qrcode from './vendor/qrcode.mjs';
const $=id=>document.getElementById(id),query=new URLSearchParams(location.search),read=(key)=>{try{return localStorage.getItem(key)}catch{return null}};
let pool=null;try{pool=JSON.parse(read('links-current-pool')||'null')?.id||null}catch{}
let meta=null,game=null,court=null,flight=null,acc=0,savePromise=null,busy=false,soundOn=false,audio=null,drag=null,result=null,offset=0;
const sharedDay=/^\d{4}-\d{2}-\d{2}$/.test(query.get('day')||'')?query.get('day'):null,sharedSeed=sharedDay?'daily-shot-v1:'+sharedDay:null;
const now=()=>Date.now()+offset,practiceSeed=()=>sharedSeed||meta?.seed||'daily-shot-v1:'+centralDay();
function headers(){return {'Content-Type':'application/json','x-links-account':read('links-account-token')||'',Authorization:'Bearer '+(read('links-legacy-token')||read('links-token')||'')}}
async function api(body){const params=new URLSearchParams({period:$('period').value,scope:$('scope').value,...(pool?{pool}:{}),...($('scope').value==='venue'?{venue:$('venue').value}:{})});const r=await fetch('./api/daily-shot?'+params,{method:body?'POST':'GET',headers:headers(),cache:'no-store',signal:AbortSignal.timeout(15000),...(body?{body:JSON.stringify({...body,...(pool?{pool}:{})})}:{})}),j=await r.json();if(!r.ok)throw Object.assign(Error(j.error||'Daily Shot could not connect.'),{status:r.status});if(Number.isFinite(j.serverNow))offset=j.serverNow-Date.now();return j;}
function message(text){$('notice').textContent=text}
function sound(frequency=600,duration=.12){if(!soundOn)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();void audio.resume();const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(frequency,t);g.gain.setValueAtTime(.045,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+duration)}catch{}}
function controls(){const can=!!game&&!flight&&!busy&&game.results.length<5&&!game.awaitingNext&&(!game.ranked||now()>=game.run.nextAt);$('shoot').disabled=!can;$('aim').disabled=$('power').disabled=!can;$('start').disabled=busy||!court||!meta?.signedIn||((!meta.run||meta.run.complete)&&meta.remaining===0);$('practice').disabled=busy||!court;$('start').textContent=meta?.run&&!meta.run.complete?'Resume daily run':meta?.remaining===0?'New ranked runs tomorrow':'Start daily run';$('login').hidden=!!meta?.signedIn;$('venue').disabled=!!game||busy;}
function showVenue(){const v=meta?.venues?.find(v=>v.id===$('venue').value),badge=$('venueBadge');badge.hidden=!v;badge.replaceChildren();if(v){if(v.logo&&(/^(https:\/\/|\/)/.test(v.logo))){const img=document.createElement('img');img.src=v.logo;img.alt=v.name;badge.append(img)}const label=document.createElement('span');label.textContent='Playing for '+v.name;badge.append(label);}}
function renderMeta(){
 if(meta?.day)$('challengeDate').textContent=new Date(meta.day+'T12:00Z').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',timeZone:'America/Chicago'})+' · new shots daily';
 $('best').textContent=$('hudBest').textContent=meta?.best??'—';$('streak').textContent=meta?.streak?.current??0;$('remaining').textContent=meta?.remaining??'—';
 const value=$('venue').value||read('links-daily-venue')||query.get('venue')||'';$('venue').replaceChildren(new Option('No venue',''));for(const venue of meta?.venues||[])$('venue').add(new Option(venue.name,venue.id));if([...$('venue').options].some(o=>o.value===value))$('venue').value=value;
 showVenue();
 $('setupStatus').textContent=meta?(meta.signedIn?'Signed in as '+meta.player+'. '+(meta.run?'Your unfinished run is ready to resume.':meta.remaining+' ranked runs left today.'):'Practice is free. Sign in to save your daily score and build your streak.'):'The ranked board could not connect. Free practice is still available.';
 if(sharedDay)$('setupStatus').textContent+=' Shared challenge for '+sharedDay+' is available in practice.';
 $('resetInfo').textContent=meta?'New challenge at '+new Date(meta.resetAt).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+' · midnight Central. Starting a ranked run uses one of today’s three attempts.':'Three ranked runs per day. New shots at midnight Central.';
 renderLeaders();controls();
}
function renderLeaders(){
 $('leaders').replaceChildren();for(const r of meta?.leaderboard||[]){const li=document.createElement('li');if(r.isYou)li.className='you';const place=document.createElement('b'),name=document.createElement('span'),score=document.createElement('strong');place.textContent=r.rank;name.textContent=r.name+(r.isYou?' (you)':'');score.textContent=r.score;li.append(place,name,score);$('leaders').append(li)}
 $('boardTitle').textContent=$('period').value==='week'?'This week’s leaders':'Today’s leaders';$('boardStatus').textContent=meta?(meta.leaderboard.length?'Verified completed runs · '+(meta.scope==='pool'?(meta.pool?.name||'Your pool'):meta.scope==='venue'?'Selected venue':'Everyone'):'No completed ranked runs yet. Take the first shot.'):'The leaderboard is unavailable. Practice still works.';
}
async function refresh(){if(busy)return;try{meta=await api();renderMeta()}catch(e){$('boardStatus').textContent=e.message;if(!meta)renderMeta();else $('setupStatus').textContent='Ranked scoring could not refresh. Your saved score is unchanged; free practice is available.';if(e.status===403&&$('scope').value==='pool')message('Sign in through your Locker Room to see your pool’s Daily Shot scores.')}controls()}
function renderGame(){
 const count=game.results.length;$('score').textContent=game.results.reduce((n,r)=>n+r.points,0);$('shotNumber').textContent='SHOT '+Math.min(5,count+1)+' OF 5';$('mode').textContent=game.ranked?'RANKED · RUN '+game.run.attempt:'UNRANKED PRACTICE';$('shotDots').replaceChildren();
 for(let i=0;i<5;i++){const e=document.createElement('span'),r=game.results[i];e.textContent=r?r.points:i+1;e.className=r?(r.swish?'swish':r.made?'made':'miss'):i===count?'active':'';e.setAttribute('aria-label','Shot '+(i+1)+(r?': '+r.points+' points':i===count?': ready':': upcoming'));$('shotDots').append(e)}
 $('saveState').textContent=game.ranked?(game.run.venueName?'Playing for '+game.run.venueName+'. ':'')+'Shots are verified and saved automatically. You can resume an unfinished run until '+new Date(game.run.deadline).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+'.':'Practice never changes the ranked leaderboard.';
}
function readyShot(){
 if(!game||game.results.length>=5)return;game.awaitingNext=false;const shot=game.shots[game.results.length];court.setShot(shot);$('aim').value='0';$('power').value='35';$('feedback').textContent='';$('next').hidden=true;$('dragHint').hidden=false;$('shotLabel').textContent=shot.label+' · Shot '+(game.results.length+1);preview();renderGame();controls();
}
function input(){return {aim:Math.round(Number($('aim').value)/100*100000)/100000,power:Math.round(Number($('power').value)/100*100000)/100000}}
function preview(){const v=input();$('aimValue').textContent=v.aim===0?'Center':Math.abs(Math.round(v.aim*100))+'% '+(v.aim<0?'left':'right');$('powerValue').textContent=Math.round(v.power*100)+'%';if(game&&!flight&&!game.awaitingNext)court?.preview(v)}
async function start(ranked){
 if(busy||!court)return;if(game&&game.ranked&&game.results.length<5&&!confirm('Leave this run? Your saved shots remain and the attempt still counts.'))return;
 busy=true;controls();try{
  let run=null;if(ranked){meta=await api({action:'start',venueId:$('venue').value||null});run=meta.run;if(!run||run.complete)throw Error('No ranked run was returned. Refresh and try again.');}
  game={ranked,run,seed:ranked?run.seed:practiceSeed(),shots:dailyShots(ranked?run.seed:practiceSeed()),results:ranked?[...run.shots]:[],awaitingNext:false};flight=null;acc=0;result=null;$('setup').hidden=true;$('finish').hidden=true;$('game').hidden=false;$('finishStatus').textContent='';message(ranked?'Your daily run is ready. Five shots. Make them count.':'Practice round — your score stays off the leaderboard.');renderMeta();readyShot();$('game').scrollIntoView({behavior:'instant',block:'start'});
 }catch(e){message(e.message)}finally{busy=false;controls()}
}
async function shoot(){
 if($('shoot').disabled||!game)return;const shot=game.shots[game.results.length],v=input();flight=launch(shot,v);acc=0;game.currentInput=v;$('feedback').textContent='';$('dragHint').hidden=true;controls();sound(240,.08);
 savePromise=game.ranked?(async()=>{try{const j=await api({action:'shoot',id:game.run.id,version:game.run.version,input:v});return j}catch(e){
  // Never resend an uncertain shot: read back the server's immutable saved version.
  try{const j=await api(),r=j.run||j.lastRun;if(r?.id===game.run.id&&r.version===game.run.version+1){j.run=r;return j}}catch{}
  throw e;
 }})():Promise.resolve(null);savePromise.catch(()=>{});
}
async function shotFinished(s){
 busy=true;flight=null;controls();$('feedback').textContent=s.feedback;sound(s.points?880:150,s.points ? .25 : .15);
 try{
  if(game.ranked){const j=await savePromise;meta=j;game.run=j.run;game.results=[...j.run.shots];}
  else game.results.push({input:game.currentInput,points:s.points,made:s.points>0,swish:s.points===20,feedback:s.feedback});
  renderGame();if(game.results.length===5)finish();else{game.awaitingNext=true;$('next').hidden=false;$('next').textContent='Next shot · '+(game.results.length+1)+' of 5';}
 }catch(e){message(e.message+' Refresh the ranked run before continuing.');game.awaitingNext=true;$('next').hidden=true;$('leave').textContent='Return and resume saved run';}
 finally{busy=false;renderMeta();controls()}
}
function finish(){
 const score=game.results.reduce((n,s)=>n+s.points,0);result={score,day:game.seed.split(':').at(-1),ranked:game.ranked,swishes:game.results.filter(s=>s.swish).length};$('finish').hidden=false;$('finishMode').textContent=game.ranked?'VERIFIED DAILY RUN COMPLETE':'PRACTICE ROUND COMPLETE';$('finishTitle').textContent=score===100?'PERFECT FIVE!':score>=60?'You’ve got a shot.':score?'Keep your eye on the rim.':'Every shooter starts somewhere.';$('finalScore').textContent=score+' / 100';$('finishCopy').textContent=result.swishes+' clean swish'+(result.swishes===1?'':'es')+'. '+(game.ranked?'Your completed run is saved. Your best daily run counts.':'Practice only — no ranked attempt used.');$('again').hidden=!meta?.signedIn||meta.remaining===0;$('again').textContent='Next ranked run · '+(meta?.remaining??0)+' left';$('game').hidden=true;$('finish').scrollIntoView({behavior:'smooth',block:'center'});renderMeta();
}
function leave(){if(flight||busy){message('Let this shot finish before leaving the court.');return}game=null;$('game').hidden=true;$('setup').hidden=false;$('leave').textContent='Back to menu';message('');void refresh();}
async function share(){
 if(!result)return;const url=new URL('./daily-shot.html',location.href);url.searchParams.set('day',result.day);url.searchParams.set('score',result.score);const text='I scored '+result.score+'/100 on LINKS Daily Shot'+(result.ranked?'':' (practice)')+'. Can you beat me?',d=document.createElement('dialog');
 d.innerHTML='<h2>Challenge your friends</h2><p></p><div data-qr></div><label>Challenge link<input readonly aria-label="Challenge link"></label><div class="actions"><button data-copy>Copy link</button><button data-share>Share challenge</button><button data-close>Close</button></div><p role="status"></p>';
 d.querySelector('p').textContent=text;d.querySelector('input').value=url.href;const code=qrcode(0,'M');code.addData(url.href);code.make();d.querySelector('[data-qr]').innerHTML=code.createSvgTag({scalable:true,cellSize:5,margin:20});d.querySelector('svg').setAttribute('aria-label','Scan to play this Daily Shot challenge');const status=d.querySelector('[role=status]');d.querySelector('[data-copy]').onclick=async()=>{try{await navigator.clipboard.writeText(text+' '+url.href);status.textContent='Challenge copied. Paste it into a text.'}catch{d.querySelector('input').select();status.textContent='Select and copy the challenge link above.'}};d.querySelector('[data-share]').onclick=async()=>{try{if(navigator.share)await navigator.share({title:'LINKS Daily Shot',text,url:url.href});else await d.querySelector('[data-copy]').onclick()}catch(e){if(e.name!=='AbortError')status.textContent='Use Copy link to share this challenge.'}};d.querySelector('[data-close]').onclick=()=>d.close();d.onclose=()=>d.remove();document.body.append(d);d.showModal();
}
$('finishMenu').onclick=()=>{game=null;$('finish').hidden=true;$('setup').hidden=false;void refresh()};
$('start').onclick=()=>start(true);$('practice').onclick=$('practiceAgain').onclick=()=>start(false);$('again').onclick=()=>start(true);$('shoot').onclick=shoot;$('next').onclick=()=>{if(!busy)readyShot()};$('leave').onclick=leave;$('share').onclick=share;$('refresh').onclick=refresh;$('period').onchange=$('scope').onchange=refresh;$('venue').onchange=()=>{try{localStorage.setItem('links-daily-venue',$('venue').value)}catch{}showVenue();if($('scope').value==='venue')void refresh()};$('aim').oninput=$('power').oninput=preview;
$('sound').onclick=()=>{soundOn=!soundOn;$('sound').textContent=soundOn?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(soundOn));sound(440)};
$('court').addEventListener('pointerdown',e=>{if($('shoot').disabled||e.button!==0&&e.pointerType==='mouse')return;const r=$('court').getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,w:r.width,h:r.height,moved:false};$('court').setPointerCapture(e.pointerId);e.preventDefault()});
$('court').addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=drag.y-e.clientY;drag.moved||=Math.hypot(dx,dy)>15;$('aim').value=String(Math.round(Math.max(-1,Math.min(1,dx/drag.w*2.2))*100));$('power').value=String(Math.round(Math.max(0,Math.min(1,dy/drag.h*2.5))*100));preview()});
$('court').addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.id)return;const moved=drag.moved;drag=null;if(moved)void shoot();else message('Drag upward from the ball to add power, then release.');});$('court').addEventListener('pointercancel',()=>{drag=null});
$('court').addEventListener('keydown',e=>{if($('shoot').disabled)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)){e.preventDefault();if(e.key===' ')void shoot();else{const slider=e.key==='ArrowLeft'||e.key==='ArrowRight'?$('aim'):$('power'),dir=e.key==='ArrowLeft'||e.key==='ArrowDown'?-1:1;slider.value=String(Number(slider.value)+dir);preview()}}});
try{court=createCourt($('court'),delta=>{if(flight){acc+=delta;let scored=false;while(acc>=DT&&!flight.done){const was=flight.points;step(flight);acc-=DT;if(flight.points&&!was)scored=true;}court.renderBall(flight);if(scored){$('feedback').textContent=flight.feedback;sound(1000,.2)}if(flight.done)void shotFinished(flight);}if(game?.ranked&&!flight&&!busy)controls();});$('loadingCourt').hidden=true;}catch(e){$('loadingCourt').textContent='3D graphics could not start. Enable hardware acceleration or try a newer browser.';$('setupStatus').textContent='This device could not start the 3D court.';message('The 3D court could not initialize. Please try Safari, Chrome, or Edge with WebGL enabled.');}
if(sharedDay){const score=Number(query.get('score'));message('Shared challenge: '+sharedDay+(Number.isInteger(score)&&score>=0&&score<=100?' · Score to beat: '+score:'')+'. Choose Free practice to play the same setup.');}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!flight&&!busy)void refresh()});window.addEventListener('pagehide',()=>{court?.dispose();audio?.close()},{once:true});
await refresh();controls();

const metaRefresh=setInterval(()=>{if(!document.hidden&&!busy&&!flight&&(!game||game.results.length===5))void refresh()},60000);window.addEventListener('pagehide',()=>clearInterval(metaRefresh),{once:true});
