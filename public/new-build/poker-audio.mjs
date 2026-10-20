// Small, synthesized table sounds: no downloads, music, or autoplay attempts.
export function createPokerAudio({getMuted = () => false, getVolume = () => 1, getCrowd = () => true, getVoice = () => true, speech = globalThis.speechSynthesis, Utterance = globalThis.SpeechSynthesisUtterance, isVisible = () => globalThis.document?.visibilityState !== 'hidden', AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext} = {}) {
  let context = null, master = null, noise = null, last = new Map();
  let speaking = false;
  let lastCrowdAt = -Infinity;
  const active = new Set();
  function wake() {
    if (getMuted() || !isVisible() || !AudioContext) return;
    try {
      if (!context || context.state === 'closed') {
        context = new AudioContext(); master = context.createGain(); master.gain.value = .55; master.connect(context.destination);
        noise = context.createBuffer(1, Math.ceil(context.sampleRate * .22), context.sampleRate);
        const samples = noise.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
      }
      // Mobile Safari can interrupt audio for calls or app switches. The next
      // player gesture should resume that context as well as a suspended one.
      if (context.state !== 'running') void context.resume().catch(() => {});
    } catch { /* Audio never blocks a poker action. */ }
  }
  function envelope(source, duration, delay, volume, filter = null) {
    const gain = context.createGain(), start = context.currentTime + delay;
    gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(volume, start + .004);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    if (filter) { source.connect(filter); filter.connect(gain); } else source.connect(gain);
    gain.connect(master); active.add(source);
    source.onended = () => { active.delete(source); source.disconnect(); filter?.disconnect(); gain.disconnect(); };
    source.start(start); source.stop(start + duration + .01);
  }
  function tone(frequency, duration, delay = 0, volume = .1, type = 'sine', endFrequency = frequency) {
    const source = context.createOscillator(); source.type = type;
    source.frequency.setValueAtTime(frequency, context.currentTime + delay);
    source.frequency.exponentialRampToValueAtTime(endFrequency, context.currentTime + delay + duration);
    envelope(source, duration, delay, volume);
  }
  function brush(duration, delay = 0, volume = .1, frequency = 1800) {
    const source = context.createBufferSource(), filter = context.createBiquadFilter();
    source.buffer = noise; filter.type = 'bandpass'; filter.frequency.value = frequency; filter.Q.value = .65;
    envelope(source, duration, delay, volume, filter);
  }
  function chip(delay = 0, volume = .13) {
    tone(2300, .065, delay, volume, 'triangle', 1900);
    tone(3400, .035, delay + .006, volume * .35);
    brush(.025, delay, volume * .5, 3100);
  }
  function crowd(champion = false, gasp = false) {
    if (!getCrowd()) return;
    if (context.currentTime-lastCrowdAt < .8) return;
    lastCrowdAt = context.currentTime;
    // Low-level room swell plus irregular applause, synthesized locally.
    // No looping background track or external sound downloads.
    const duration = gasp ? .65 : champion ? 2.3 : 1.15;
    for (const frequency of [430,850,1500]) {
      const source = context.createBufferSource(), filter = context.createBiquadFilter();
      source.buffer = noise; source.loop = true;
      filter.type = 'bandpass'; filter.frequency.value = frequency; filter.Q.value = .8;
      envelope(source,duration,.03,gasp ? .025 : champion ? .035 : .025,filter);
    }
    if (!gasp) {
      const count = champion ? 28 : 12;
      for (let i=0;i<count;i++) {
        const delay = .08 + i*(duration-.16)/count + Math.random()*.035;
        brush(.035+Math.random()*.035,delay,.045+Math.random()*.035,1200+Math.random()*1500);
      }
    }
  }
  function silence() {
    if (speaking) { try { speech?.cancel(); } catch {} speaking = false; }
    for (const source of active) { try { source.stop(); } catch {} }
    active.clear();
  }
  function allInVoice() {
    if (!getVoice() || !speech || !Utterance) return;
    try {
      if (speaking) speech.cancel();
      const line = new Utterance("I'm all in!"); line.lang = 'en-US'; line.rate = 1; line.pitch = .85;
      line.volume = Math.max(0,Math.min(1,Number(getVolume()) || 0));
      const voice = speech.getVoices?.().find(v=>/^en[-_]/i.test(v.lang));
      if (voice) line.voice = voice;
      line.onend = line.onerror = () => { speaking = false; };
      speaking = true; speech.speak(line);
    } catch { speaking = false; }
  }
  function play(kind = 'click') {
    if (getMuted() || !isVisible() || context?.state !== 'running') return false;
    const volume = Number(getVolume());
    master.gain.value = .55 * (Number.isFinite(volume) ? Math.max(0,Math.min(1,volume)) : 1);
    if (!master.gain.value) return false;
    const time = context.currentTime;
    if (time - (last.get(kind) ?? -Infinity) < .075) return false;
    last.set(kind, time);
    try {
      if (kind === 'deal') { brush(.09, 0, .2); brush(.08, .10, .16, 2200); }
      else if (kind === 'fold') brush(.13, 0, .16, 850);
      else if (kind === 'check') { tone(210, .055, 0, .16, 'sine', 90); brush(.025, 0, .08, 650); }
      else if (['call','bet','raise','allin','chips'].includes(kind)) { chip(); chip(.055,.1); if (['raise','allin'].includes(kind)) chip(.11,.085); if(kind==='allin'){allInVoice();crowd(true);} }
      else if (kind === 'turn') { tone(660,.12,0,.085); tone(880,.17,.13,.07); }
      else if (kind === 'warning') tone(520,.1,0,.065);
      else if (kind === 'win') { [523.25,659.25,783.99].forEach((f,i) => tone(f,.38,i*.085,.075)); chip(.30,.1); chip(.38,.08); }
      else if (kind === 'crowdWin') { crowd(); chip(.2,.08); chip(.3,.06); }
      else if (kind === 'champion') { crowd(true); [523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,.4,i*.17,.06)); }
      else tone(420,.04,0,.07,'sine',320);
      return true;
    } catch { return false; }
  }
  function destroy() { silence(); last.clear(); try { void context?.close().catch(() => {}); } catch {} context = null; master = null; noise = null; }
  return {wake, play, silence, destroy};
}
