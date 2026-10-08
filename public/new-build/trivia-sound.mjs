import {automaticGameSound} from './automatic-game-sound.mjs';
import {createCorrectSound} from './correct-sound.mjs';
import {createLossSound} from './loss-sound.mjs';
// Original synthesized game cues and the supplied LINKS waiting-room soundtrack.
export function createCueTracker(){
 let room='',seen=new Set(),previous=null,last=0;
 return (s,now)=>{
  if(!s)return [];
  const identity=s.code+':'+s.game;if(identity!==room){room=identity;seen=new Set();previous=null;last=0}
  const fresh=!!previous&&now-last<2500,cues=[],key=identity+':'+s.index;
  const once=(id,cue,allowed=true)=>{if(seen.has(id))return;seen.add(id);if(allowed)cues.push(cue)};
  if(s.phase==='question'){
   const countdown=Math.ceil(((s.startsAt||0)-now)/1000),remaining=Math.ceil((s.deadline-now)/1000);
   if(countdown>0&&countdown<=3)once(key+':count:'+countdown,'count');
   if(now>=s.startsAt&&now<s.deadline){once(key+':go','go',fresh);if(remaining>=1&&remaining<=3)once(key+':tick:'+remaining,'tick')}
  }
  if(s.phase==='reveal')once(key+':reveal',s.choice===null||s.choice===undefined?'reveal':s.choice===s.question?.correct?'correct':'wrong',fresh);
  if(s.phase==='ended')once(identity+':ended','finish',fresh);
  previous=s.phase;last=now;return cues;
 };
}
export function mountTriviaSound({button,lobbyMusic=false}){
 let context,enabled=false,state=null,clockOffset=0,musicSource=null,musicGain=null,musicKey=null;const buffers=new Map(),loading=new Map(),failed=new Set();const correct=createCorrectSound();const loss=createLossSound();const sources=new Set(),track=createCueTracker();
 const draw=()=>{button.textContent=enabled?'Sound On':'Sound Off';button.setAttribute('aria-pressed',String(enabled));button.title='Sound plays on this device only. Use the TV or host for room audio to avoid echo.'};
 const stopMusic=()=>{if(musicSource){try{musicSource.stop()}catch{}musicSource.disconnect();musicSource=null}musicGain?.disconnect();musicGain=null;musicKey=null};
 const stop=()=>{correct.stop();loss.stop();stopMusic();for(const oscillator of sources){try{oscillator.stop()}catch{}}sources.clear()};
 function tone(frequency,at,duration=.12,volume=.05){const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);oscillator.connect(gain);gain.connect(context.destination);sources.add(oscillator);oscillator.onended=()=>{sources.delete(oscillator);oscillator.disconnect();gain.disconnect()};oscillator.start(at);oscillator.stop(at+duration+.02)}
 // Both supplied tracks share the same opt-in as game cues. Cache decoded audio per page.
 function syncMusic(){
  const now=Date.now()+clockOffset;
  const answering=state?.phase==='question'&&now>=(state.startsAt||0)&&now<state.deadline;
  const key=state?.phase==='lobby'?'the-night-starts-here':answering?'think-fast':null;
  if(!lobbyMusic||!key||!enabled||document.hidden||context?.state!=='running'){stopMusic();return}
  if(musicKey!==key)stopMusic();
  if(musicSource){musicGain.gain.value=answering?(state.deadline-now<=3000?.035:.20):.55;return}
  if(loading.has(key)||failed.has(key))return;
  if(!buffers.has(key)){
   loading.set(key,fetch(new URL('./audio/'+key+'.mp3',import.meta.url))
    .then(response=>{if(!response.ok)throw new Error('Music unavailable');return response.arrayBuffer()})
    .then(bytes=>context.decodeAudioData(bytes))
    .then(buffer=>{buffers.set(key,buffer)})
    .catch(()=>{failed.add(key);button.title='Music could not load. Turn sound off and on to retry.'})
    .finally(()=>{loading.delete(key);syncMusic()}));
   return;
  }
  musicKey=key;musicSource=context.createBufferSource();musicSource.buffer=buffers.get(key);musicSource.loop=true;
  musicGain=context.createGain();musicGain.gain.value=answering?(state.deadline-now<=3000?.035:.20):.55;
  musicSource.connect(musicGain);musicGain.connect(context.destination);musicSource.start();
  // Audio-clock deadline also stops music if a screen update is delayed.
  if(answering)musicSource.stop(context.currentTime+Math.max(0,(state.deadline-now)/1000));
 }
 function play(cue){if(!enabled||document.hidden||context?.state!=='running')return;if(cue==='correct'&&lobbyMusic&&correct.play(context))return;if(cue==='wrong'&&loss.play(context))return;const t=context.currentTime;const notes=({count:[660],go:[660,990],tick:[440],reveal:[523,659],correct:[659,880,1047],wrong:[330,262],finish:[523,659,784,1047]})[cue]||[];notes.forEach((hz,i)=>tone(hz,t+i*.13,cue==='finish'?.23:.12,cue==='tick'?.025:.05))}
 button.onclick=async()=>{if(enabled){enabled=false;stop();draw();return}try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){button.textContent='Sound unavailable';button.disabled=true;return}failed.clear();context ||= new Audio();await context.resume();enabled=context.state==='running';draw();if(enabled){loss.load(context);if(lobbyMusic)correct.load(context);play('go');syncMusic()}else button.textContent='Tap to enable sound'}catch{enabled=false;button.textContent='Tap to retry sound'}};
 // Pause audio when hidden; normal game interaction enables sound.
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else syncMusic()});window.addEventListener('pagehide',stop);draw();automaticGameSound(button,()=>enabled);
 return {update(s,now){state=s;clockOffset=now-Date.now();syncMusic();for(const cue of track(s,now))play(cue)},stop};
}
