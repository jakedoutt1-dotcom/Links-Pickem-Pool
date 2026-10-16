import assert from 'node:assert/strict';
import {mountDeadAirAudio, deadAirNarration, deadAirPhaseCue} from '../public/new-build/dead-air-audio.mjs';
import {createAudioFixture, restoreAudioGlobals} from './helpers/game-audio-fixture.mjs';

const environment = options => createAudioFixture(mountDeadAirAudio, options);
const scene = (extra = {}) => ({code: 'RADIO', game: 1, phase: 'intro', phaseId: 1, mode: 'solo', deadline: 20000, cycle: 0, paused: false,
  players: [{name: 'Listener', you: true, lives: 3, progress: 0, atRisk: false}], ...extra});
const update = (test, value) => test.player.update(value, test.now);

try {
  // A compromised or accidentally overbroad state must not make speech reveal answers.
  const privateChallenge = {type: 'signal', sequence: ['HIDDEN SEQUENCE'], correct: 'SECRET ANSWER', board: ['HIDDEN OBJECT']};
  for (const phase of ['brief', 'observe', 'challenge', 'final']) {
    const text = deadAirNarration(scene({phase, challenge: privateChallenge, selection: 'PRIVATE SELECTION'}));
    assert.doesNotMatch(text, /HIDDEN|SECRET|PRIVATE/);
  }
  assert.equal(deadAirNarration(scene({phase: 'question', question: {text: 'Public question', correct: 'SECRET ANSWER', options: ['SECRET ANSWER']}})).includes('SECRET'), false);
  assert.match(deadAirNarration(scene({phase: 'ended', players: [{progress: 8}]})), /before you restored twelve/);
  assert.match(deadAirNarration(scene({phase: 'ended', players: [{progress: 12}]})), /transmitter is restored/);
  for (const cycle of [0, 10, 11]) {
    const clean = deadAirNarration(scene({phase: 'answer', cleanBroadcast: true, cycle}));
    assert.match(clean, /150 bonus points each/);
    assert.match(clean, cycle === 11 ? /final broadcast is next/ : /next broadcast/);
    assert.doesNotMatch(clean, /survival|challenge/);
  }
  for (const type of ['signal', 'evidence', 'frequency', 'power', 'relay']) {
    const repeat = deadAirNarration(scene({phase: 'brief', startsAt: 1000, deadline: 6000, challenge: {type}}));
    assert.ok(repeat.split(/\s+/).length <= 10, 'Repeated five-second introductions need a short reminder');
  }
  const relay = scene({phase: 'brief', startsAt: 0, deadline: 10000, challenge: {type: 'relay', title: 'Relay Trace', route: ['SECRET ROUTE'], correct: 'SECRET EXIT'}});
  assert.match(deadAirNarration(relay), /Start at IN/);
  assert.equal(deadAirPhaseCue(relay), 'relay');
  assert.match(deadAirNarration({...relay, phase: 'challenge'}), /Which edge/);
  assert.doesNotMatch(deadAirNarration(relay) + deadAirNarration({...relay, phase: 'challenge'}), /SECRET/);

  let test = environment(); update(test, scene());
  assert.equal(test.contexts.length, 0); assert.equal(test.synth.spoken.length, 0);
  await test.gesture(); assert.equal(test.synth.spoken.length, 1);
  assert.match(test.synth.current.text, /This is The Signal/);
  assert.ok(test.synth.current.pitch > .8 && test.synth.current.rate >= .9, 'Keep a clear, intelligible device voice');
  assert.equal(test.contexts[0].nodes[1].gain.value, .16);
  update(test, scene()); assert.equal(test.synth.spoken.length, 1, 'Polling does not repeat host lines');
  const old = test.synth.current;
  update(test, scene({phase: 'question', phaseId: 2})); assert.equal(test.synth.cancellations, 1);
  old.onend(); test.advance(300); assert.equal(test.synth.spoken.length, 2);

  const frequency = scene({phase: 'challenge', phaseId: 3, challenge: {type: 'frequency', correct: 'HIDDEN', clues: ['Between 20 and 26, inclusive.']}});
  update(test, frequency); assert.equal(test.synth.current.text, 'Clue 1. Between 20 and 26, inclusive.');
  update(test, frequency); const before = test.synth.spoken.length;
  const sources = test.contexts[0].sources.length;
  update(test, {...frequency, challenge: {...frequency.challenge, clues: [...frequency.challenge.clues, 'A multiple of 3.']}});
  assert.equal(test.synth.spoken.length, before + 1); assert.equal(test.synth.current.text, 'Clue 2. A multiple of 3.');
  assert.equal(test.contexts[0].sources.length, sources + 2, 'A fresh clue gives a tuning cue without restarting background music');
  assert.ok(test.synth.spoken.every(line => !line.text.includes('HIDDEN')));
  test.controls.replayButton.click(); await Promise.resolve(); assert.equal(test.synth.current.text, 'Clue 2. A multiple of 3.');
  test.controls.button.click(); assert.equal(test.synth.current, null);
  assert.equal(test.contexts[0].nodes[0].gain.value, 0, 'Mute silences narration, soundtrack and the room tail');
  const mutedCount = test.synth.spoken.length; await test.gesture(); assert.equal(test.synth.spoken.length, mutedCount);
  test.controls.button.click(); await Promise.resolve(); assert.equal(test.synth.spoken.length, mutedCount);
  test.controls.replayButton.click(); await Promise.resolve();
  update(test, {...frequency, paused: true}); assert.equal(test.synth.current, null);
  update(test, frequency); assert.equal(test.synth.current, null);
  test.controls.replayButton.click(); await Promise.resolve(); document.hidden = true; document.fire('visibilitychange');
  assert.equal(test.synth.current, null);
  assert.match(test.controls.status.textContent, /Narration stopped while this page was hidden/);
  document.hidden = false; document.fire('visibilitychange'); await Promise.resolve(); assert.equal(test.synth.current, null);
  assert.match(test.controls.status.textContent, /Replay narration/);
  test.controls.replayButton.click(); await Promise.resolve(); window.fire('pagehide'); assert.equal(test.synth.current, null);
  assert.match(test.controls.status.textContent, /Narration stopped/);
  test.player.dispose(); assert.equal(test.timers.size, 0);

  // Countdown is confined to the last five seconds of live answer windows.
  test = environment({preferences: {'links-dead-air-audio-narration': '0'}}); await test.gesture();
  const timed = scene({phase: 'question', phaseId: 2, deadline: 10000}); update(test, timed);
  let count = test.contexts[0].sources.length; update(test, {...timed, deadline: 6000});
  assert.equal(test.contexts[0].sources.length, count);
  update(test, {...timed, deadline: 5000}); assert.equal(test.contexts[0].sources.length, count + 2);
  count = test.contexts[0].sources.length; update(test, {...timed, deadline: 5000}); assert.equal(test.contexts[0].sources.length, count);
  update(test, {...timed, phase: 'observe', phaseId: 3, deadline: 5000}); count = test.contexts[0].sources.length;
  test.advance(1000); update(test, {...timed, phase: 'observe', phaseId: 3, deadline: 5000});
  assert.equal(test.contexts[0].sources.length, count, 'No distracting countdown during memory observation');
  for (const kind of ['ident', 'tune', 'relay', 'question', 'lock', 'ready', 'correct', 'wrong', 'risk', 'lifeLost', 'echoReturn', 'final', 'ending']) {
    test.advance(200); count = test.contexts[0].sources.length; test.player.cue(kind);
    assert.ok(test.contexts[0].sources.length > count, kind + ' has a distinct procedural cue');
  }
  test.player.dispose();

  for (const [note, expected, phrase] of [
    ['BACK ON AIR · 1 life restored', 'echoReturn', /One life restored/],
    ['SIGNAL LOST · You are an Echo', 'lifeLost', /Clear two challenges/],
    ['Lost one life', 'lifeLost', /A life lost/],
    ['Challenge cleared', 'correct', /Challenge cleared/],
    ['Challenge missed', 'wrong', /test is over/]
  ]) {
    const state = scene({phase: 'result', results: [{name: 'Listener', note, ok: expected === 'correct' || expected === 'echoReturn'}]});
    assert.equal(deadAirPhaseCue(state), expected); assert.match(deadAirNarration(state), phrase);
  }
  const atRisk = scene({phase: 'answer', players: [{name: 'Listener', you: true, atRisk: true, lives: 2}]});
  assert.equal(deadAirPhaseCue(atRisk), 'risk'); assert.match(deadAirNarration(atRisk), /protect your life/);
  const echoMiss = scene({phase: 'answer', players: [{name: 'Listener', you: true, atRisk: false, lives: 0}], results: [{name: 'Listener', ok: false}]});
  assert.equal(deadAirPhaseCue(echoMiss), 'wrong'); assert.match(deadAirNarration(echoMiss), /Echo/);
  const markedResult = scene({phase: 'result', results: [
    {name: 'Listener', you: false, note: 'Lost one life', ok: false},
    {name: 'Changed display label', you: true, note: 'Challenge cleared', ok: true}
  ]});
  assert.equal(deadAirPhaseCue(markedResult), 'correct', 'Explicit viewer result takes precedence over a display-name match');
  assert.match(deadAirNarration(markedResult), /Challenge cleared/);
  for (const [outcome, text] of [['charged', /Echo charge 1 of two/], ['safe', /No life lost/], ['echo', /still playing/]]) {
    assert.match(deadAirNarration(scene({phase: 'result', results: [{you: true, outcome, echoCharge: 1}]})), text);
  }

  // A revoked seat clears the old room without changing preferences or disabling future joins.
  test = environment(); update(test, scene()); await test.gesture();
  test.player.setVoice('cloud'); test.controls.replayButton.click(); await Promise.resolve();
  const staleSpeech = test.synth.current;
  test.player.reset();
  assert.equal(test.synth.current, null);
  assert.equal(test.timers.size, 0, 'Room reset stops score and narration timers');
  assert.equal(test.controls.caption.textContent, '');
  assert.equal(test.controls.replayButton.disabled, true);
  assert.equal(test.contexts[0].nodes[0].gain.value, 0);
  const resetSpeechCount = test.synth.spoken.length, resetSources = test.contexts[0].sources.length;
  staleSpeech.onend(); test.advance(30000); await test.gesture();
  document.hidden = true; document.fire('visibilitychange');
  document.hidden = false; document.fire('visibilitychange'); await Promise.resolve();
  assert.equal(test.synth.spoken.length, resetSpeechCount, 'Removed room cannot replay on late callback or gesture');
  assert.equal(test.contexts[0].sources.length, resetSources, 'Removed room cannot restart its music on focus');
  update(test, scene()); await Promise.resolve();
  assert.ok(test.synth.current, 'The same scene can play on an explicit rejoin');
  assert.ok(test.contexts[0].sources.length > resetSources, 'Rejoining also restores music after a hidden-page suspension');
  assert.equal(test.synth.current.voice.voiceURI, 'cloud', 'Room reset preserves voice choice');
  test.controls.button.click(); test.player.reset(); update(test, scene()); await test.gesture();
  assert.equal(test.synth.current, null, 'Room reset preserves mute');
  assert.equal(test.controls.button.getAttribute('aria-pressed'), 'true'); test.player.dispose();

  test = environment(); update(test, scene({mode: 'friends'})); await test.gesture();
  assert.equal(test.synth.spoken.length, 0, 'Multiplayer phones opt into narration');
  test.controls.narrationButton.click(); await Promise.resolve(); assert.equal(test.synth.spoken.length, 1);
  test.player.setVoice('cloud'); assert.equal(test.store.get('links-dead-air-audio-voice'), 'cloud');
  test.controls.replayButton.click(); await Promise.resolve(); assert.equal(test.synth.current.voice.voiceURI, 'cloud');
  test.player.dispose();
  test = environment(); update(test, scene({mode: 'friends', display: true})); await test.gesture();
  assert.equal(test.synth.spoken.length, 1, 'TV defaults to one shared announcer'); test.player.dispose();
  test = environment({preferences: {'links-dead-air-audio-muted': '1'}}); update(test, scene()); await test.gesture();
  assert.equal(test.contexts.length, 0); test.player.dispose();
  test = environment({preferences: {'links-dead-air-audio-narration': '0'}}); update(test, scene()); await test.gesture();
  assert.equal(test.synth.spoken.length, 0); test.player.dispose();
  test = environment({storageBlocked: true}); update(test, scene()); await test.gesture();
  test.synth.error('not-allowed'); assert.match(test.controls.status.textContent, /Tap Replay/);
  test.controls.replayButton.click(); await Promise.resolve(); test.advance(30000);
  assert.equal(test.synth.current, null); assert.match(test.controls.status.textContent, /Follow the scene text/); test.player.dispose();
  for (const failure of [{audio: false}, {resumeFails: true}]) {
    test = environment(failure); update(test, scene()); await test.gesture();
    assert.ok(test.synth.current, 'Native narration can work without Web Audio');
    assert.equal(test.controls.button.textContent, 'Mute sound');
    assert.equal(test.controls.button.getAttribute('aria-label'), 'Mute game sound and narration');
    test.controls.button.click(); assert.equal(test.synth.current, null);
    assert.equal(test.store.get('links-dead-air-audio-muted'), '1');
    const before = test.synth.spoken.length;
    update(test, scene({phase: 'question', phaseId: 2})); await test.gesture();
    assert.equal(test.synth.spoken.length, before, 'Master mute blocks later phases when Web Audio is unavailable');
    test.controls.button.click(); await Promise.resolve(); assert.ok(test.synth.current);
    test.synth.end(); test.advance(260); update(test, scene({phase: 'question', phaseId: 2}));
    assert.equal(test.controls.button.textContent, 'Mute sound', 'Keep mute usable between spoken lines');
    test.controls.button.click(); assert.equal(test.controls.button.getAttribute('aria-pressed'), 'true');
    test.player.dispose();
  }
  test = environment({speech: false, audio: false}); update(test, scene()); await test.gesture();
  assert.equal(test.controls.narrationButton.disabled, true); assert.match(test.controls.caption.textContent, /The Signal/); test.player.dispose();
  console.log('PASS Dead Air audio: gesture/narrator defaults, clear device voice, no overlap, clue dedupe without bed reset, no hidden answers or sequence, mute/pause/visibility/leave, final-five countdown, life/risk/Echo feedback, preferences and browser fallbacks.');
} finally { restoreAudioGlobals(); }
