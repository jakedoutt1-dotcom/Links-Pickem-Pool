// Original LINKS sound design. Music and effects are synthesized on this device.
// Speech uses available browser voices; no recordings or voice API are fetched here.
const preferencePrefix = 'links-dead-air-audio-';
const readStorage = key => { try { return localStorage.getItem(key); } catch { return null; } };
const readPreference = key => readStorage(preferencePrefix + key);
const savePreference = (key, value) => { try { localStorage.setItem(preferencePrefix + key, value); } catch {} };

export function selectNarratorVoice(voices, preferred = '') {
  const selected = voices.find(voice => voice.voiceURI === preferred);
  if (selected) return selected;
  const english = voices.filter(voice => /^en(?:[-_]|$)/i.test(voice.lang));
  const rank = voice => (voice.localService ? 50 : 0) + (/en[-_]GB/i.test(voice.lang) ? 15 : 0)
    + (/natural|enhanced|premium|neural/i.test(voice.name) ? 12 : 0) + (voice.default ? 5 : 0);
  return [...english].sort((a, b) => rank(b) - rank(a))[0] || null;
}

export const SIGNAL_LINES = {
  intro: 'This is The Signal. Three lives. Twelve broadcasts. Keep the station alive, and it might return the favor.',
  question: 'Question live. Keep your signal clear.',
  answer: 'The answer is on screen. Check your signal.',
  brief: 'Stand by for the survival test. Everyone plays. Only an at-risk failure costs a life.',
  observe: 'Watch closely. The station remembers.',
  challenge: 'Your controls are live. Make your choice.',
  result: 'Transmission report. Your place on the signal board has changed.',
  finalIntro: 'Final broadcast. Everyone can still win. Restore twelve transmitter bars. Each correct answer adds two.',
  final: 'The tower is listening. Send your answer.',
  finalAnswer: 'The tower has received your answer. Check your transmitter bars.',
  ended: 'The broadcast is over. Your signal made it out.'
};
const challengeRules = {
  signal: 'Remember the symbols in order. After the blackout, rebuild the sequence on your phone.',
  evidence: 'Study the six shelves. After the blackout, choose the shelf whose object changed.',
  frequency: 'Tune the correct frequency. Three clues arrive, one at a time.',
  power: 'Choose a generator in secret. Stay within its capacity. Overload it, and everyone on it fails.'
};
const answering = state => ['question', 'challenge', 'final'].includes(state.phase);
const visibleClueCount = state => state.challenge?.type === 'frequency' && answering(state) ? state.challenge.clues?.length || 0 : 0;
const relevantResults = state => {
  const you = state.players?.find(player => player.you);
  return you ? (state.results || []).filter(result => result.name === you.name) : state.results || [];
};

// Read only phase instructions and clues already in the public view. Sequence, shelf
// answers, selections and correct-answer fields are never used during active play.
export function deadAirNarration(state) {
  if (!state || state.phase === 'lobby') return '';
  if (state.narrationScene) return String(state.narrationScene.text || '');
  const challenge = state.challenge;
  if (challenge?.type === 'frequency' && answering(state)) {
    const count = visibleClueCount(state);
    return count ? 'Clue ' + count + '. ' + challenge.clues[count - 1] : 'Tune in. Your first clue is coming.';
  }
  if (state.phase === 'brief') {
    if (state.deadline - state.startsAt <= 5500) return ({
      signal: 'Signal Lost. Memorize the order, then rebuild it.',
      evidence: 'Evidence Edit. Remember the shelves. Spot the change.',
      frequency: 'Frequency Lock. Three clues. Find the frequency.',
      power: 'Power Split. Choose a generator. Avoid an overload.'
    })[challenge?.type] || 'Your survival test begins next.';
    return (challenge?.title ? challenge.title + '. ' : '') + (challengeRules[challenge?.type] || SIGNAL_LINES.brief);
  }
  if (state.phase === 'observe') return ['frequency', 'power'].includes(challenge?.type) ? 'Stand by. Your answer controls open next.' : 'Watch closely. Hold the picture in your mind.';
  if (state.phase === 'question') return [SIGNAL_LINES.question, 'The question is live. Knowledge keeps the lights on.', 'A new question. Give the station something it can use.'][(state.cycle || 0) % 3];
  if (state.phase === 'answer') {
    if (state.cleanBroadcast) return 'Clean broadcast. 150 bonus points each. ' + (state.cycle >= 11 ? 'The final broadcast is next.' : 'Straight to the next broadcast.');
    const you = state.players?.find(player => player.you), risk = state.players?.filter(player => player.atRisk).length || 0;
    if (you?.lives === 0) return 'Echo, you are still on air. Clear two survival challenges to return with one life.';
    return you?.atRisk ? 'Your signal is at risk. Clear the next challenge to protect your life.' : you ? 'Signal secure. The survival test comes next.'
      : risk ? risk + (risk === 1 ? ' signal is' : ' signals are') + ' at risk. Clear the next challenge to stay alive.' : 'Every signal is secure. The survival test comes next.';
  }
  if (state.phase === 'result') {
    const results = relevantResults(state);
    if (results.some(result => /BACK ON AIR/.test(result.note))) return 'An Echo is back on air. One life restored. The station has not finished with you.';
    if (results.some(result => /SIGNAL LOST/.test(result.note))) return 'A signal has become an Echo. You still play. Clear two challenges to return with one life.';
    if (results.some(result => /Lost one life/.test(result.note))) return 'A life lost. Keep playing. Your next answer can change the broadcast.';
    return results.length && results.every(result => result.ok) ? 'Challenge cleared. The station will have to try harder.' : 'The test is over. Read your transmission report.';
  }
  if (state.phase === 'ended') {
    const high = Math.max(0, ...(state.players || []).map(player => player.progress || 0));
    return state.mode === 'solo' && high < 12 ? 'The tower went dark before you restored twelve bars. Another broadcast awaits.'
      : high >= 12 ? 'Twelve bars. The transmitter is restored. Your signal made it out.' : 'The tower has gone dark. The furthest signal wins the broadcast.';
  }
  return SIGNAL_LINES[state.phase] || '';
}

export function deadAirPhaseCue(state) {
  if (state.narrationScene?.cue !== undefined) return state.narrationScene.cue;
  if (state.phase === 'intro') return 'ident';
  if (state.phase === 'question') return 'question';
  if (state.phase === 'answer') {
    const risk = state.players?.find(player => player.you)?.atRisk ?? state.players?.some(player => player.atRisk);
    return risk ? 'risk' : relevantResults(state).some(result => !result.ok) ? 'wrong' : 'correct';
  }
  if (state.phase === 'result') {
    const results = relevantResults(state);
    if (results.some(result => /BACK ON AIR/.test(result.note))) return 'echoReturn';
    if (results.some(result => /SIGNAL LOST|Lost one life/.test(result.note))) return 'lifeLost';
    return results.some(result => !result.ok) ? 'wrong' : 'correct';
  }
  if (state.phase === 'finalIntro') return 'final';
  if (state.phase === 'ended') return 'ending';
  if (state.phase === 'finalAnswer') return relevantResults(state).some(result => !result.ok) ? 'wrong' : 'correct';
  return state.phase === 'observe' ? 'tune' : 'transition';
}

export function splitNarration(text, limit = 220) {
  const sentences = String(text).replace(/\s+/g, ' ').trim().match(/[^.!?]+(?:[.!?]+[”"']?|$)/g) || [];
  const chunks = [];
  let current = '';
  for (const sentence of sentences) {
    let rest = sentence.trim();
    if (current && current.length + rest.length + 1 > limit) { chunks.push(current); current = ''; }
    while (rest.length > limit) {
      const space = rest.lastIndexOf(' ', limit), boundary = space > 0 ? space : limit;
      chunks.push(rest.slice(0, boundary).trim()); rest = rest.slice(boundary).trim();
    }
    current = [current, rest].filter(Boolean).join(' ');
  }
  if (current) chunks.push(current);
  return chunks;
}

/** Optional controls are game-local; the original one-argument API remains supported. */
export function mountDeadAirAudio(button, {narrationButton, voiceSelect, replayButton, status, caption} = {}) {
  let ctx, master, music, effects, noiseBuffer;
  let activated = false, enabled = false, disposed = false, audioFailed = false, resuming = null;
  let muted = (readPreference('muted') ?? readStorage('links-games-muted')) === '1';
  let narrationPreference = readPreference('narration'), preferredVoice = readPreference('voice') || '';
  let state = null, phaseKey = '', tickKey = '', scoreStep = 0, scoreTimer;
  let speechTimer, speechWatchdog, speechGeneration = 0, utterance = null, speaking = false;
  let pendingNarration = false, voices = [];
  const active = new Set(), cueTimes = new Map(), listeners = [];
  const synth = window.speechSynthesis, supportsSpeech = !!(synth && window.SpeechSynthesisUtterance);
  const listen = (target, event, handler, options) => {
    if (!target?.addEventListener) return;
    target.addEventListener(event, handler, options);
    listeners.push(() => target.removeEventListener(event, handler, options));
  };
  const narrationEnabled = () => narrationPreference === null
    ? !!(state?.display || state?.mode === 'solo') : narrationPreference === '1';
  // Native speech can work even when Web Audio cannot. Keep master mute available
  // throughout that narration session, including the silence between spoken lines.
  const soundIsOn = () => enabled || (activated && supportsSpeech && narrationEnabled());
  const available = () => !disposed && activated && !muted && !document.hidden && !state?.paused;
  const canSound = () => available() && enabled && ctx?.state === 'running';
  const sayStatus = text => { if (status && status.textContent !== text) status.textContent = text; };
  const sceneKey = value => [value.code || '', value.game, value.phaseId, value.phase, visibleClueCount(value), value.narrationScene?.key || ''].join(':');

  function draw() {
    if (button) {
      button.textContent = muted ? 'Unmute sound' : soundIsOn() ? 'Mute sound' : audioFailed ? 'Retry sound' : 'Start sound';
      button.setAttribute('aria-pressed', String(muted));
      button.setAttribute('aria-label', muted ? 'Unmute game sound and narration' : soundIsOn() ? 'Mute game sound and narration' : 'Start game sound');
      button.title = 'Original broadcast ambience and effects. Use one shared speaker to avoid echo.';
    }
    if (narrationButton) {
      narrationButton.disabled = !supportsSpeech;
      narrationButton.textContent = !supportsSpeech ? 'Voice unavailable' : narrationEnabled() ? 'The Signal on' : 'The Signal off';
      narrationButton.setAttribute('aria-pressed', String(supportsSpeech && narrationEnabled()));
      narrationButton.title = 'The Signal uses your device voice. Voice quality varies by browser. Captions stay available.';
    }
    if (replayButton) replayButton.disabled = !supportsSpeech || !deadAirNarration(state) || !!state?.paused;
    if (voiceSelect) voiceSelect.disabled = !supportsSpeech;
  }

  function ramp(parameter, value, seconds = .15) {
    if (!ctx || !parameter) return;
    parameter.cancelScheduledValues(ctx.currentTime);
    parameter.setTargetAtTime(value, ctx.currentTime, Math.max(.01, seconds / 3));
  }
  function duck(value) { ramp(music?.gain, value ? .16 : .58, .3); ramp(effects?.gain, value ? .45 : .82, .12); }
  function release(record) {
    active.delete(record);
    for (const node of record.nodes) { try { node.disconnect(); } catch {} }
  }
  function track(source, nodes, bus) {
    const record = {source, nodes, bus}; active.add(record); source.onended = () => release(record);
  }
  function stopSources(bus) {
    for (const record of [...active]) {
      if (bus && record.bus !== bus) continue;
      try { record.source.stop(); } catch {}
      release(record);
    }
  }
  function stopBed() { clearTimeout(scoreTimer); scoreTimer = null; stopSources('music'); }
  function stopSound() { ramp(master?.gain, 0, .045); stopBed(); stopSources(); }

  function buildGraph() {
    master = ctx.createGain(); master.gain.value = .72;
    music = ctx.createGain(); music.gain.value = .58;
    effects = ctx.createGain(); effects.gain.value = .82;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18; compressor.knee.value = 18; compressor.ratio.value = 3;
    compressor.attack.value = .008; compressor.release.value = .3;
    music.connect(master); effects.connect(master); master.connect(compressor); compressor.connect(ctx.destination);
    // A short original room response; no downloaded samples.
    const reverb = ctx.createConvolver(), impulse = ctx.createBuffer(2, Math.ceil(ctx.sampleRate * .8), ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const samples = impulse.getChannelData(channel);
      for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / samples.length, 3.5) * .22;
    }
    reverb.buffer = impulse;
    const wet = ctx.createGain(); wet.gain.value = .16;
    music.connect(reverb); effects.connect(reverb); reverb.connect(wet); wet.connect(master);
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const samples = noiseBuffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    listen(ctx, 'statechange', () => {
      if (ctx.state !== 'running') { stopSound(); enabled = false; }
      else if (available()) { enabled = true; startBed(); }
      draw();
    });
  }

  function envelope(gain, at, duration, volume, attack) {
    gain.setValueAtTime(.0001, at);
    gain.exponentialRampToValueAtTime(Math.max(.0001, volume), at + Math.min(attack, duration / 3));
    gain.exponentialRampToValueAtTime(.0001, at + duration);
  }
  function tone(hz, at, duration, volume = .03, {type = 'sine', bus = 'effects', attack = .015, pan = 0, detune = 0, endHz} = {}) {
    const source = ctx.createOscillator(), gain = ctx.createGain(), nodes = [source, gain];
    source.type = type; source.frequency.setValueAtTime(hz, at); source.detune.value = detune;
    if (endHz) source.frequency.exponentialRampToValueAtTime(endHz, at + duration);
    envelope(gain.gain, at, duration, volume, attack); source.connect(gain);
    const destination = bus === 'music' ? music : effects;
    if (ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner(); panner.pan.value = pan; gain.connect(panner); panner.connect(destination); nodes.push(panner);
    } else gain.connect(destination);
    track(source, nodes, bus); source.start(at); source.stop(at + duration + .025);
  }
  function noise(at, duration, volume, frequency, {type = 'lowpass', bus = 'effects', attack = .025, q = .6, endFrequency} = {}) {
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = noiseBuffer; source.loop = true;
    filter.type = type; filter.frequency.setValueAtTime(frequency, at); filter.Q.value = q;
    if (endFrequency) filter.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
    envelope(gain.gain, at, duration, volume, attack);
    source.connect(filter); filter.connect(gain); gain.connect(bus === 'music' ? music : effects);
    track(source, [source, filter, gain], bus); source.start(at); source.stop(at + duration + .025);
  }
  function cue(kind) {
    if (!canSound()) return;
    kind = ({clue: 'tune', paper: 'lock', chapter: 'transition', life: 'lifeLost', echo: 'echoReturn'})[kind] || kind;
    const t = ctx.currentTime;
    if (t - (cueTimes.get(kind) ?? -100) < .14) return;
    cueTimes.set(kind, t);
    if (kind === 'ident') {
      noise(t, .5, .07, 1900, {type: 'bandpass', endFrequency: 450});
      [220, 330, 277.18, 440].forEach((hz, i) => tone(hz, t + .18 + i * .17, .38, .04, {type: 'triangle'}));
      tone(55, t, 1.4, .05, {attack: .12});
    } else if (kind === 'tune') {
      noise(t, .3, .055, 2000, {type: 'bandpass', q: 1.3, endFrequency: 800});
      tone(740, t + .08, .18, .012, {endHz: 440});
    } else if (kind === 'question') {
      noise(t, .12, .028, 1300, {type: 'bandpass'}); tone(330, t + .06, .24, .026);
    } else if (kind === 'tick') {
      tone(880, t, .045, .012); noise(t, .025, .01, 1800, {type: 'bandpass'});
    } else if (kind === 'lock' || kind === 'ready') {
      tone(440, t, .08, .022, {type: 'triangle'}); tone(kind === 'ready' ? 587.33 : 550, t + .07, .12, .017);
    } else if (kind === 'correct') {
      tone(330, t, .2, .036, {type: 'triangle'}); tone(495, t + .13, .48, .03);
    } else if (kind === 'wrong') {
      tone(196, t, .2, .035, {type: 'triangle'}); tone(146.83, t + .15, .36, .03);
    } else if (kind === 'risk') {
      noise(t, .42, .06, 650, {type: 'bandpass'});
      tone(220, t, .33, .04, {type: 'triangle'}); tone(207.65, t + .26, .6, .036);
    } else if (kind === 'lifeLost') {
      tone(180, t, .9, .065, {endHz: 45}); noise(t + .12, .7, .065, 1300, {type: 'bandpass', endFrequency: 120});
      tone(55, t + .4, .8, .03);
    } else if (kind === 'echoReturn') {
      noise(t, .6, .05, 280, {type: 'bandpass', endFrequency: 1700});
      [220, 330, 440].forEach((hz, i) => tone(hz, t + .15 + i * .18, .65, .034, {type: 'triangle'}));
    } else if (kind === 'final') {
      noise(t, 1.1, .06, 900, {type: 'bandpass', attack: .2, endFrequency: 160});
      [55, 82.41, 110].forEach((hz, i) => tone(hz, t + i * .2, 2, .05, {attack: .12}));
      [330, 440, 660].forEach((hz, i) => tone(hz, t + .55 + i * .2, .5, .022));
    } else if (kind === 'ending') {
      [110, 164.81, 220, 440].forEach((hz, i) => tone(hz, t + i * .22, 2.6 - i * .3, .04, {attack: .04}));
      noise(t, .65, .04, 1000, {type: 'bandpass', endFrequency: 100});
    } else if (kind === 'transition') {
      noise(t, .38, .055, 1500, {type: 'bandpass', endFrequency: 450});
      tone(110, t + .12, .65, .04, {type: 'triangle'});
    }
  }

  function score() {
    scoreTimer = null;
    if (!canSound()) return;
    const progression = state?.phase === 'ended' ? [[55, 82.41, 110]]
      : state?.phase?.startsWith('final') ? [[55, 82.41, 123.47], [51.91, 77.78, 116.54]]
      : [[55, 82.41, 110], [51.91, 77.78, 103.83], [49, 73.42, 98], [58.27, 87.31, 116.54]];
    const chord = progression[scoreStep % progression.length], t = ctx.currentTime;
    chord.forEach((hz, i) => tone(hz, t + i * .18, 6.4, .025 - i * .004,
      {bus: 'music', attack: 1.3, pan: (i - 1) * .2, detune: i === 1 ? -2 : 2}));
    noise(t + .4, 5.8, .015, 900, {bus: 'music', type: 'bandpass', attack: 1.6, q: .5, endFrequency: 1300});
    // Leave the observation and answer windows clear; the carrier moves only between tests.
    if (scoreStep % 2 === 1 && ['lobby', 'intro', 'brief', 'result', 'finalIntro'].includes(state?.phase)) {
      tone(220, t + 3.8, 1.1, .007, {bus: 'music', attack: .2, pan: -.2});
    }
    scoreStep++; scoreTimer = setTimeout(score, 7400);
  }
  function startBed() {
    if (!canSound()) return;
    ramp(master?.gain, .72, .08);
    if (!scoreTimer) score();
  }

  function stopNarration() {
    speechGeneration++; clearTimeout(speechTimer); clearTimeout(speechWatchdog);
    speechTimer = speechWatchdog = null;
    const ownedSpeech = !!utterance; utterance = null; speaking = false;
    if (ownedSpeech) { try { synth.cancel(); } catch {} }
    duck(false);
  }
  function speakScene({replay = false} = {}) {
    const text = deadAirNarration(state);
    if (caption) caption.textContent = text;
    if (!text || !supportsSpeech || !narrationEnabled()) { pendingNarration = false; return; }
    if (!available()) { pendingNarration = true; return; }
    pendingNarration = false; stopNarration();
    const generation = speechGeneration, chunks = splitNarration(text);
    let index = 0;
    function next() {
      if (disposed || generation !== speechGeneration || !available() || !narrationEnabled()) return;
      if (index >= chunks.length) { utterance = null; speaking = false; duck(false); sayStatus('Narration complete. Replay the scene any time.'); return; }
      const line = new window.SpeechSynthesisUtterance(chunks[index++]), voice = selectNarratorVoice(voices, preferredVoice);
      if (voice) line.voice = voice;
      line.lang = voice?.lang || 'en-GB';
      // Mild changes preserve intelligibility; extreme pitch shifts make device speech muddy.
      line.rate = .96; line.pitch = .9; line.volume = .95;
      utterance = line; speaking = true; duck(true);
      sayStatus(replay ? 'Replaying The Signal with your device voice.' : 'The Signal is speaking.');
      const finish = error => {
        if (generation !== speechGeneration || utterance !== line) return;
        clearTimeout(speechWatchdog); speechWatchdog = null; utterance = null;
        if (error) {
          // Retain ownership until stopNarration cancels a hung browser utterance.
          utterance = line; stopNarration(); pendingNarration = error === 'not-allowed';
          sayStatus(error === 'not-allowed' ? 'Tap Replay narration to start the device voice.' : 'Device voice unavailable. Follow the scene text or try Replay.');
          return;
        }
        speechTimer = setTimeout(next, 260);
      };
      line.onend = () => finish(); line.onerror = event => finish(event.error || 'unavailable');
      speechWatchdog = setTimeout(() => finish('timeout'), Math.max(18000, line.text.length * 130));
      try { synth.speak(line); } catch { finish('unavailable'); }
    }
    // Generation guards keep late cancellation events from speaking obsolete chapters.
    next();
  }

  async function activate() {
    if (disposed || muted || document.hidden) return;
    activated = true;
    // Speech starts inside a gesture handler whenever possible, including on mobile.
    if (pendingNarration && !state?.paused) speakScene();
    if (resuming) return resuming;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error('Web Audio unavailable');
      if (!ctx || ctx.state === 'closed') { ctx = new Audio(); buildGraph(); }
      resuming = ctx.resume(); await resuming;
      if (disposed || muted || document.hidden) return;
      enabled = ctx.state === 'running'; audioFailed = !enabled;
      if (enabled) { duck(speaking); startBed(); }
    } catch {
      audioFailed = true; enabled = false;
      sayStatus('Sound effects are unavailable here. You can still read and play the broadcast.');
    } finally { resuming = null; draw(); }
  }
  function setNarrationEnabled(value) {
    narrationPreference = value ? '1' : '0'; savePreference('narration', narrationPreference);
    stopNarration(); pendingNarration = !!value && !!deadAirNarration(state);
    sayStatus(value ? 'Narrator enabled. Use one device for shared narration.' : 'Narrator off. Scene text remains available.'); draw();
  }
  function replayNarration() {
    if (!supportsSpeech || !deadAirNarration(state) || state?.paused) return;
    // Replay explicitly restores this device's sound and narration.
    muted = false; savePreference('muted', '0'); narrationPreference = '1'; savePreference('narration', '1');
    pendingNarration = false; activated = true; void activate(); speakScene({replay: true}); draw();
  }
  function setVoice(value) {
    preferredVoice = value || ''; savePreference('voice', preferredVoice);
    if (voiceSelect) voiceSelect.value = preferredVoice;
    if (speaking) { stopNarration(); pendingNarration = true; sayStatus('Voice changed. Replay the scene to hear it.'); }
  }
  function refreshVoices() {
    try { voices = supportsSpeech ? synth.getVoices() : []; } catch { voices = []; }
    if (voiceSelect) {
      const option = (value, text) => { const item = document.createElement('option'); item.value = value; item.textContent = text; return item; };
      voiceSelect.replaceChildren(option('', 'Automatic · device narrator'));
      for (const voice of [...voices].sort((a, b) => a.name.localeCompare(b.name))) {
        voiceSelect.append(option(voice.voiceURI, voice.name + ' · ' + voice.lang + (voice.localService ? ' · on device' : '')));
      }
      voiceSelect.value = voices.some(voice => voice.voiceURI === preferredVoice) ? preferredVoice : '';
    }
    draw();
  }

  function update(nextState, now) {
    if (disposed || !nextState) return;
    const previous = state, nextKey = sceneKey(nextState), changed = nextKey !== phaseKey;
    const phaseChanged = !previous || previous.code !== nextState.code || previous.game !== nextState.game || previous.phaseId !== nextState.phaseId || previous.phase !== nextState.phase;
    state = nextState;
    if (changed) {
      const hadScene = !!phaseKey;
      phaseKey = nextKey; stopNarration();
      if (phaseChanged) { tickKey = ''; scoreStep = 0; cueTimes.clear(); stopBed(); }
      pendingNarration = !!deadAirNarration(state);
      if (caption) caption.textContent = deadAirNarration(state);
      const transition = phaseChanged ? deadAirPhaseCue(state) : 'tune';
      if (hadScene && state.phase !== 'lobby' && transition) cue(transition);
      if (!state.paused) { startBed(); speakScene(); }
    }
    if (state.paused && !previous?.paused) {
      stopSound(); stopNarration(); pendingNarration = !!deadAirNarration(state);
      sayStatus('Broadcast paused. Sound and narration are paused.');
    } else if (!state.paused && previous?.paused) {
      startBed(); pendingNarration = false; sayStatus('Broadcast resumed. Replay the scene if you need it.');
    }
    const remaining = Math.ceil((state.deadline - now) / 1000);
    if (!state.paused && answering(state) && remaining > 0 && remaining <= 5) {
      const key = [state.code, state.game, state.phaseId, remaining].join(':');
      if (tickKey !== key) { tickKey = key; cue('tick'); }
    }
    draw();
  }

  const gesture = event => {
    if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
    if ([button, narrationButton, replayButton, voiceSelect].some(control => control && (control === event.target || control.contains?.(event.target)))) return;
    if (!muted && (!enabled || pendingNarration)) void activate();
  };
  listen(document, 'click', gesture, true); listen(document, 'keydown', gesture, true);
  listen(document, 'visibilitychange', () => {
    if (document.hidden) {
      stopSound(); stopNarration(); pendingNarration = false;
      if (ctx?.state === 'running') ctx.suspend().catch(() => {});
    } else if (activated && !muted) void activate();
  });
  listen(window, 'pagehide', () => { stopSound(); stopNarration(); pendingNarration = false; });
  listen(synth, 'voiceschanged', refreshVoices);
  listen(button, 'click', () => {
    if (!muted && !soundIsOn()) { void activate(); return; }
    muted = !muted; savePreference('muted', muted ? '1' : '0');
    if (muted) { stopSound(); stopNarration(); pendingNarration = false; sayStatus('Sound and narration muted on this device.'); }
    else { void activate(); sayStatus('Sound on. Replay the scene for narration.'); }
    draw();
  });
  listen(narrationButton, 'click', () => {
    setNarrationEnabled(!narrationEnabled());
    if (narrationEnabled()) { muted = false; savePreference('muted', '0'); void activate(); }
  });
  listen(replayButton, 'click', replayNarration);
  listen(voiceSelect, 'change', () => setVoice(voiceSelect.value));
  refreshVoices();
  if (!supportsSpeech) sayStatus('Device narration is unavailable. The complete scene remains on screen.');
  return {
    cue, update, replayNarration, setNarrationEnabled, setVoice, getVoices: () => [...voices], stopNarration,
    dispose() {
      disposed = true; stopSound(); stopNarration(); listeners.forEach(remove => remove());
      if (ctx && ctx.state !== 'closed') void ctx.close().catch(() => {});
    }
  };
}
