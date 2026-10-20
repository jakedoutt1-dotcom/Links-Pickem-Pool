import assert from 'node:assert/strict';
import {createPokerAudio} from '../public/new-build/poker-audio.mjs';
let muted = false, visible = true, created = 0, started = 0, stopped = 0, currentContext;
const parameter = () => ({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
class Context {
  constructor() { created++; currentContext = this; this.state = 'suspended'; this.currentTime = 1; this.sampleRate = 8000; }
  createGain() { return {gain:parameter(),connect(){},disconnect(){}}; }
  createBuffer(channels,length) { return {getChannelData:() => new Float32Array(length)}; }
  createBiquadFilter() { return {frequency:parameter(),Q:parameter(),connect(){},disconnect(){}}; }
  source() { return {frequency:parameter(),connect(){},disconnect(){},start(){started++;},stop(){stopped++;}}; }
  createOscillator() { return this.source(); }
  createBufferSource() { return this.source(); }
  async resume() { this.state = 'running'; }
  async close() { this.state = 'closed'; }
}
const audio = createPokerAudio({AudioContext:Context,getMuted:() => muted,isVisible:() => visible});
assert.equal(audio.play('deal'),false,'Polling cannot create or autoplay audio');
muted = true; audio.wake(); assert.equal(created,0,'Muted interactions never create audio');
muted = false; visible = false; audio.wake(); assert.equal(created,0,'Background pages cannot wake audio');
visible = true; audio.wake(); assert.equal(created,1);
currentContext.state = 'interrupted'; audio.wake(); assert.equal(currentContext.state,'running','A fresh gesture recovers mobile audio after an interruption');
for (const kind of ['deal','fold','check','call','raise','allin','turn','warning','win','crowdWin','champion','click']) assert.equal(audio.play(kind),true,kind);
assert.equal(audio.play('champion'),false,'Repeated updates do not stack the champion applause');
assert.equal(audio.play('win'),false,'Duplicate polling cannot repeat the same cue immediately');
const before = started;
muted = true; assert.equal(audio.play('turn'),false);
assert.equal(audio.play('crowdWin'),false,'Crowd respects Mute');
muted = false; visible = false; assert.equal(audio.play('turn'),false);
assert.equal(audio.play('champion'),false,'Crowd stays quiet in the background');
assert.equal(started,before);
audio.silence(); assert.ok(stopped >= started,'Mute can stop already scheduled sounds');
audio.destroy();
let voiceOn=true,crowdOn=true,volume=.4,spoken=[],cancelled=0;
const effects=createPokerAudio({AudioContext:Context,getVoice:()=>voiceOn,getCrowd:()=>crowdOn,getVolume:()=>volume,speech:{speak(line){spoken.push(line)},cancel(){cancelled++},getVoices(){return []}},Utterance:class{constructor(text){this.text=text}}});
effects.wake();effects.play('allin');
assert.equal(spoken[0].text,"I'm all in!");assert.equal(spoken[0].volume,.4);
assert.equal(effects.play('allin'),false,'Repeated polling does not repeat the voice');
effects.silence();assert.equal(cancelled,1,'Mute stops the spoken announcement');
currentContext.currentTime+=2;voiceOn=false;crowdOn=false;effects.play('allin');assert.equal(spoken.length,1,'Voice toggle is separate from chip sounds');
currentContext.currentTime+=2;volume=0;const quiet=started;assert.equal(effects.play('allin'),false);assert.equal(started,quiet,'Zero volume starts no effects');
effects.destroy();
assert.doesNotThrow(() => createPokerAudio({AudioContext:null}).wake(),'Browsers without audio can still play poker');
console.log('PASS Poker audio: gesture activation, distinct cues, duplicate suppression, background/mute guards, cleanup');
