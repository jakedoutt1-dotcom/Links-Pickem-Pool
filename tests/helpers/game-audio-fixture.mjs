import assert from 'node:assert/strict';
const saved = Object.fromEntries(['window', 'document', 'localStorage', 'setTimeout', 'clearTimeout'].map(key => [key, globalThis[key]]));
class Target {
  listeners = new Map();
  addEventListener(name, fn) { if (!this.listeners.has(name)) this.listeners.set(name, new Set()); this.listeners.get(name).add(fn); }
  removeEventListener(name, fn) { this.listeners.get(name)?.delete(fn); }
  fire(name, extra = {}) { for (const fn of this.listeners.get(name) || []) fn({type: name, target: this, ...extra}); }
}
class Control extends Target {
  textContent = ''; value = ''; disabled = false; children = []; attributes = new Map();
  setAttribute(name, value) { this.attributes.set(name, value); }
  getAttribute(name) { return this.attributes.get(name); }
  replaceChildren(...nodes) { this.children = nodes; }
  append(node) { this.children.push(node); }
  contains(node) { return node === this; }
  click() { this.fire('click'); }
}
class Param {
  value = 0; history = [];
  setValueAtTime(value, time) { this.value = value; this.history.push({value, time}); }
  exponentialRampToValueAtTime(value, time) { this.setValueAtTime(value, time); }
  setTargetAtTime(value, time) { this.setValueAtTime(value, time); }
  cancelScheduledValues() {}
}
class Node {
  gain = new Param(); frequency = new Param(); detune = new Param(); Q = new Param(); pan = new Param();
  threshold = new Param(); knee = new Param(); ratio = new Param(); attack = new Param(); release = new Param();
  connections = []; stopped = false;
  connect(node) { this.connections.push(node); }
  disconnect() { this.disconnected = true; }
  start(time) { this.startedAt = time; }
  stop(time) { this.stopAt = time; if (time === undefined) { this.stopped = true; this.onended?.(); } }
}
export const voiceList = [
  {voiceURI: 'fr', name: 'French', lang: 'fr-FR', localService: true, default: true},
  {voiceURI: 'cloud', name: 'Natural English', lang: 'en-GB', localService: false},
  {voiceURI: 'local', name: 'English', lang: 'en-US', localService: true},
];

export function createAudioFixture(mount, {preferences = {}, speech = true, audio = true, resumeFails = false, storageBlocked = false} = {}) {
  let now = 0, timerId = 0;
  const timers = new Map(), contexts = [], store = new Map(Object.entries(preferences));
  class Context extends Target {
    state = 'suspended'; sampleRate = 8000; destination = new Node(); nodes = []; sources = [];
    constructor() { super(); contexts.push(this); }
    get currentTime() { return now / 1000; }
    createGain() { const node = new Node(); this.nodes.push(node); return node; }
    createOscillator() { const node = new Node(); this.sources.push(node); return node; }
    createBufferSource() { return this.createOscillator(); }
    createStereoPanner() { return this.createGain(); }
    createDynamicsCompressor() { return this.createGain(); }
    createConvolver() { return this.createGain(); }
    createBiquadFilter() { return this.createGain(); }
    createBuffer(channels, length) { return {getChannelData: () => new Float32Array(length)}; }
    async resume() { if (resumeFails) throw Error('Audio context unavailable'); this.state = 'running'; this.fire('statechange'); }
    async suspend() { this.state = 'suspended'; this.fire('statechange'); }
    async close() { this.state = 'closed'; this.fire('statechange'); }
  }
  const synth = new Target();
  synth.spoken = []; synth.current = null; synth.cancellations = 0; synth.voices = [...voiceList];
  synth.getVoices = () => synth.voices;
  synth.speak = line => { assert.equal(synth.current, null, 'Narrator must never overlap or queue utterances'); synth.current = line; synth.spoken.push(line); };
  synth.cancel = () => { synth.cancellations++; const old = synth.current; synth.current = null; old?.onerror?.({error: 'canceled'}); };
  synth.end = () => { const line = synth.current; synth.current = null; line?.onend?.(); };
  synth.error = error => { const line = synth.current; synth.current = null; line?.onerror?.({error}); };
  globalThis.window = new Target();
  if (audio) window.AudioContext = Context;
  if (speech) { window.speechSynthesis = synth; window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } }; }
  globalThis.document = new Target(); document.hidden = false; document.createElement = () => new Control();
  globalThis.localStorage = {getItem: key => { if (storageBlocked) throw Error('blocked'); return store.get(key) ?? null; }, setItem: (key, value) => { if (storageBlocked) throw Error('blocked'); store.set(key, value); }};
  globalThis.setTimeout = (fn, delay) => { const id = ++timerId; timers.set(id, {fn, at: now + delay}); return id; };
  globalThis.clearTimeout = id => timers.delete(id);
  const controls = Object.fromEntries(['button', 'narrationButton', 'voiceSelect', 'replayButton', 'status', 'caption'].map(key => [key, new Control()]));
  const player = mount(controls.button, controls);
  const advance = milliseconds => {
    const end = now + milliseconds;
    for (;;) {
      const next = [...timers.entries()].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      now = next[1].at; timers.delete(next[0]); next[1].fn();
    }
    now = end;
  };
  const gesture = async () => { document.fire('click', {target: new Control()}); await Promise.resolve(); await Promise.resolve(); };
  return {player, controls, synth, contexts, store, timers, advance, gesture, get now() { return now; }};
}


export function restoreAudioGlobals() {
  for (const [key, value] of Object.entries(saved)) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; }
}
