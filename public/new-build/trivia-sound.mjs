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
export function mountTriviaSound({button,lobbyMusic=false}){
 let context,enabled=false,phase=null,musicTimer=null,nextBeat=0,beat=0;const sources=new Set(),track=createCueTracker();
 const draw=()=>{button.textContent=enabled?'Sound On':'Sound Off';button.setAttribute('aria-pressed',String(enabled));button.title='Sound plays on this device only. Use the TV or host for room audio to avoid echo.'};
 const musicSources=new Set();
 const stopMusic=()=>{clearInterval(musicTimer);musicTimer=null;for(const source of musicSources){try{source.stop()}catch{}}musicSources.clear()};
 const stop=()=>{stopMusic();for(const oscillator of sources){try{oscillator.stop()}catch{}}sources.clear()};
 function tone(frequency,at,duration=.12,volume=.05,music=false){const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);oscillator.connect(gain);gain.connect(context.destination);sources.add(oscillator);if(music)musicSources.add(oscillator);oscillator.onended=()=>{sources.delete(oscillator);musicSources.delete(oscillator);oscillator.disconnect();gain.disconnect()};oscillator.start(at);oscillator.stop(at+duration+.02)}
 // Original 32-beat lounge loop, shared by both trivia waiting rooms.
 function syncMusic(){
  if(!lobbyMusic||phase!=='lobby'||!enabled||document.hidden||context?.state!=='running'){stopMusic();return}
  if(musicTimer!==null)return;
  beat=0;nextBeat=context.currentTime+.04;
  const schedule=()=>{
   if(context.state!=='running'){stopMusic();return}
   while(nextBeat<context.currentTime+.18){
    const chords=[[130.81,164.81,196,246.94],[110,130.81,164.81,196],[87.31,110,130.81,164.81],[98,123.47,146.83,196]],chord=chords[Math.floor(beat/8)%4];
    if(beat%4===0){tone(chord[0]/2,nextBeat,.55,.024,true);chord.slice(1).forEach(hz=>tone(hz,nextBeat,1.15,.009,true))}
    if(beat%2===0)tone(chord[[2,3,1,2][Math.floor(beat/2)%4]]*2,nextBeat,.38,.013,true);
    nextBeat+=60/96;beat=(beat+1)%32;
   }
  };
  schedule();musicTimer=setInterval(schedule,80);
 }
 function play(cue){if(!enabled||document.hidden||context?.state!=='running')return;const t=context.currentTime;const notes=({count:[660],go:[660,990],tick:[440],reveal:[523,659],correct:[659,880,1047],wrong:[330,262],finish:[523,659,784,1047]})[cue]||[];notes.forEach((hz,i)=>tone(hz,t+i*.13,cue==='finish'?.23:.12,cue==='tick'?.025:.05))}
 button.onclick=async()=>{if(enabled){enabled=false;stop();draw();return}try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){button.textContent='Sound unavailable';button.disabled=true;return}context ||= new Audio();await context.resume();enabled=context.state==='running';draw();if(enabled){play('correct');syncMusic()}else button.textContent='Tap to enable sound'}catch{enabled=false;button.textContent='Tap to retry sound'}};
 // Always require an explicit tap on this device, including after reload.
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else syncMusic()});window.addEventListener('pagehide',stop);draw();
 return {update(s,now){phase=s?.phase;syncMusic();for(const cue of track(s,now))play(cue)},stop};
}
