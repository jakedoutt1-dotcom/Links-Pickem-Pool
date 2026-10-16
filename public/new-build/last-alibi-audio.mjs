// Original LINKS sound design. Music and effects are synthesized on this device.
// Speech uses available browser voices; no recordings or voice API are fetched here.
const preferencePrefix = 'links-last-alibi-audio-';
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

// Only public scene content is read. Private roles, secrets and discoveries are ignored.
export function lastAlibiNarration(state) {
  if (!state || state.phase === 'lobby') return '';
  if (state.narrationScene) return String(state.narrationScene.text || '');
  if (state.phase === 'accuse') return 'The evidence is on the table. One guest has no alibi. Choose the suspect, the room, and the method. Support your answer with a record. Seal your accusation when you are certain.';
  if (state.phase === 'ended') {
    if (state.revealStep === 0) return 'The accusations are sealed. First, reconstruct the crime.';
    if (state.revealStep === 1) return 'Reconstruct the incident. Correct the recording clocks, and compare the verified timeline.';
    if (!state.ending) return '';
    if (state.revealStep === 2) return 'One guest has no verified alibi. ' + state.ending.culprit + '.';
    return (state.ending.caught ? 'The truth has caught up with the murderer. ' : 'The room has reached its verdict. Now, the truth. ') + state.ending.story;
  }
  const scene = state.chapterInfo;
  return scene ? [scene.title, scene.narration || scene.story].filter(Boolean).join('. ') : '';
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
export function mountMysteryAudio(button, {narrationButton, voiceSelect, replayButton, status, caption} = {}) {
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
  const sceneKey = value => [value.code || '', value.game, value.phase, value.chapter, value.revealStep ?? '', value.narrationScene?.key || ''].join(':');

  function draw() {
    if (button) {
      button.textContent = muted ? 'Unmute sound' : soundIsOn() ? 'Mute sound' : audioFailed ? 'Retry sound' : 'Start sound';
      button.setAttribute('aria-pressed', String(muted));
      button.setAttribute('aria-label', muted ? 'Unmute game sound and narration' : soundIsOn() ? 'Mute game sound and narration' : 'Start game sound');
      button.title = 'Original suspense music and effects. Use one shared speaker to avoid echo.';
    }
    if (narrationButton) {
      narrationButton.disabled = !supportsSpeech;
      narrationButton.textContent = !supportsSpeech ? 'Voice unavailable' : narrationEnabled() ? 'Narrator on' : 'Narrator off';
      narrationButton.setAttribute('aria-pressed', String(supportsSpeech && narrationEnabled()));
      narrationButton.title = 'Device narration. Voice quality varies by browser. Scene text is always available.';
    }
    if (replayButton) replayButton.disabled = !supportsSpeech || !lastAlibiNarration(state) || !!state?.paused;
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
    const reverb = ctx.createConvolver(), impulse = ctx.createBuffer(2, Math.ceil(ctx.sampleRate * 1.6), ctx.sampleRate);
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
  function noise(at, duration, volume, frequency, {type = 'lowpass', bus = 'effects', attack = .025, q = .6} = {}) {
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = noiseBuffer; source.loop = true;
    filter.type = type; filter.frequency.value = frequency; filter.Q.value = q;
    envelope(gain.gain, at, duration, volume, attack);
    source.connect(filter); filter.connect(gain); gain.connect(bus === 'music' ? music : effects);
    track(source, [source, filter, gain], bus); source.start(at); source.stop(at + duration + .025);
  }
  function bell(hz, at, volume = .05, duration = 1.8) {
    for (const [ratio, weight, length] of [[1, 1, 1], [2.76, .22, .65], [5.4, .055, .32]]) {
      tone(hz * ratio, at, duration * length, volume * weight, {attack: .008});
    }
  }

  function cue(kind) {
    if (!canSound()) return;
    kind = ({clue: 'discovery', chapter: 'transition', ending: 'reveal'})[kind] || kind;
    const t = ctx.currentTime;
    if (t - (cueTimes.get(kind) ?? -100) < .14) return;
    cueTimes.set(kind, t);
    if (kind === 'paper') {
      noise(t, .15, .06, 2800, {type: 'bandpass'}); noise(t + .07, .23, .045, 1700, {type: 'bandpass'});
    } else if (kind === 'tick') {
      tone(650, t, .055, .018, {type: 'triangle'}); noise(t, .035, .012, 1600);
    } else if (kind === 'discovery') {
      noise(t, .12, .035, 2400, {type: 'bandpass'});
      bell(293.66, t, .043, 1.15); bell(440, t + .14, .027, 1.1);
    } else if (kind === 'share') {
      tone(196, t, .12, .04, {type: 'triangle'}); bell(392, t + .09, .034, .75); bell(587.33, t + .19, .018, .65);
    } else if (kind === 'ready') {
      tone(220, t, .13, .032, {type: 'triangle'}); tone(293.66, t + .1, .3, .025);
    } else if (kind === 'accusation') {
      noise(t, .1, .13, 480); tone(92.5, t, .35, .08, {endHz: 55}); bell(185, t + .12, .035, 1.5);
    } else if (kind === 'reveal') {
      noise(t, 1.1, .07, 220, {attack: .2}); bell(146.83, t, .06, 3.2); bell(220, t + .35, .045, 2.8);
      bell(state?.ending?.caught ? 293.66 : 155.56, t + .85, .045, 3);
    } else if (kind === 'transition') {
      noise(t, 1.4, .06, 170, {attack: .3}); tone(73.42, t, 1.7, .055, {attack: .06});
      bell(293.66, t + .15, .038, 2); bell(220, t + .46, .032, 2.1);
    }
  }

  function score() {
    scoreTimer = null;
    if (!canSound()) return;
    const progression = state?.phase === 'ended' ? [[73.42, 110, 146.83]]
      : [[73.42, 110, 164.81], [65.41, 98, 146.83], [58.27, 87.31, 130.81], [69.3, 103.83, 146.83]];
    const chord = progression[scoreStep % progression.length], t = ctx.currentTime;
    chord.forEach((hz, i) => tone(hz, t + i * .22, 7.4, .026 - i * .004,
      {bus: 'music', attack: 1.4, pan: (i - 1) * .25, detune: i === 1 ? -3 : 2}));
    noise(t + .5, 6.3, .047, 150, {bus: 'music', attack: 1.8});
    // Space for conversation; no accelerating pulse during guided play.
    if (scoreStep % 2 === 1 && state && !['lobby', 'ended'].includes(state.phase)) {
      tone(293.66, t + 4.2, 1.8, .008, {bus: 'music', attack: .3, pan: -.2});
    }
    scoreStep++; scoreTimer = setTimeout(score, 8600);
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
    const text = lastAlibiNarration(state);
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
      line.rate = .9; line.pitch = .88; line.volume = .95;
      utterance = line; speaking = true; duck(true);
      sayStatus(replay ? 'Replaying the scene with your device voice.' : 'The narrator is reading the scene.');
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
      sayStatus('Sound effects are unavailable here. You can still read and play the case.');
    } finally { resuming = null; draw(); }
  }
  function setNarrationEnabled(value) {
    narrationPreference = value ? '1' : '0'; savePreference('narration', narrationPreference);
    stopNarration(); pendingNarration = !!value && !!lastAlibiNarration(state);
    sayStatus(value ? 'Narrator enabled. Use one device for shared narration.' : 'Narrator off. Scene text remains available.'); draw();
  }
  function replayNarration() {
    if (!supportsSpeech || !lastAlibiNarration(state) || state?.paused) return;
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
    state = nextState;
    if (changed) {
      const hadScene = !!phaseKey;
      phaseKey = nextKey; tickKey = ''; scoreStep = 0; cueTimes.clear(); stopNarration(); stopBed();
      pendingNarration = !!lastAlibiNarration(state);
      if (caption) caption.textContent = lastAlibiNarration(state);
      const transition = state.narrationScene?.cue ?? (state.phase === 'ended' && (state.revealStep ?? 4) >= 2 ? 'reveal' : state.phase === 'accuse' ? 'accusation' : 'transition');
      if (hadScene && state.phase !== 'lobby' && transition) cue(transition);
      if (!state.paused) { startBed(); speakScene(); }
    }
    if (state.paused && !previous?.paused) {
      stopSound(); stopNarration(); pendingNarration = !!lastAlibiNarration(state);
      sayStatus('Case paused. Sound and narration are paused.');
    } else if (!state.paused && previous?.paused) {
      startBed(); pendingNarration = false; sayStatus('Case resumed. Replay the scene if you need it.');
    }
    const remaining = Math.ceil((state.deadline - now) / 1000);
    if (!state.guided && !state.paused && ['briefing', 'investigate', 'accuse'].includes(state.phase) && remaining > 0 && remaining <= 10) {
      const key = phaseKey + ':' + remaining;
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
