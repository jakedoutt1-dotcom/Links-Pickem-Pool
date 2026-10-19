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
for (const kind of ['deal','fold','check','call','raise','allin','turn','warning','win','click']) assert.equal(audio.play(kind),true,kind);
assert.equal(audio.play('win'),false,'Duplicate polling cannot repeat the same cue immediately');
const before = started;
muted = true; assert.equal(audio.play('turn'),false);
muted = false; visible = false; assert.equal(audio.play('turn'),false);
assert.equal(started,before);
audio.silence(); assert.ok(stopped >= started,'Mute can stop already scheduled sounds');
audio.destroy();
assert.doesNotThrow(() => createPokerAudio({AudioContext:null}).wake(),'Browsers without audio can still play poker');
console.log('PASS Poker audio: gesture activation, distinct cues, duplicate suppression, background/mute guards, cleanup');
