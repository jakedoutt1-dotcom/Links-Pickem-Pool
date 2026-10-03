// Original synthesized cues; no audio downloads or third-party recordings.
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
export function mountTriviaSound({button}){
 let context,enabled=false;const sources=new Set(),track=createCueTracker();
 const draw=()=>{button.textContent=enabled?'Sound On':'Sound Off';button.setAttribute('aria-pressed',String(enabled));button.title='Sound plays on this device only. Use the TV or host for room audio to avoid echo.'};
 const stop=()=>{for(const oscillator of sources){try{oscillator.stop()}catch{}}sources.clear()};
 function tone(frequency,at,duration=.12,volume=.05){const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);oscillator.connect(gain);gain.connect(context.destination);sources.add(oscillator);oscillator.onended=()=>{sources.delete(oscillator);oscillator.disconnect();gain.disconnect()};oscillator.start(at);oscillator.stop(at+duration+.02)}
 function play(cue){if(!enabled||document.hidden||context?.state!=='running')return;const t=context.currentTime;const notes=({count:[660],go:[660,990],tick:[440],reveal:[523,659],correct:[659,880,1047],wrong:[330,262],finish:[523,659,784,1047]})[cue]||[];notes.forEach((hz,i)=>tone(hz,t+i*.13,cue==='finish'?.23:.12,cue==='tick'?.025:.05))}
 button.onclick=async()=>{if(enabled){enabled=false;stop();draw();return}try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){button.textContent='Sound unavailable';button.disabled=true;return}context ||= new Audio();await context.resume();enabled=context.state==='running';draw();if(enabled)play('correct');else button.textContent='Tap to enable sound'}catch{enabled=false;button.textContent='Tap to retry sound'}};
 // Always require an explicit tap on this device, including after reload.
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});window.addEventListener('pagehide',stop);draw();
 return {update(s,now){for(const cue of track(s,now))play(cue)},stop};
}
