import assert from 'node:assert/strict';
import {mountMysteryAudio, lastAlibiNarration, selectNarratorVoice, splitNarration} from '../public/new-build/last-alibi-audio.mjs';

import {createAudioFixture, restoreAudioGlobals, voiceList} from './helpers/game-audio-fixture.mjs';
const environment = options => createAudioFixture(mountMysteryAudio, options);

const scene = (extra = {}) => ({code: 'ALIBI', game: 1, phase: 'briefing', chapter: 0, mode: 'solo', guided: true, deadline: 100000, paused: false,
  chapterInfo: {title: 'The invitation', story: 'The bell rings. Every guest has a secret.'}, privateRole: {secret: 'NEVER READ THIS SECRET'}, ...extra});
const update = (test, value) => test.player.update(value, test.now);

try {
  assert.equal(selectNarratorVoice(voiceList).voiceURI, 'local', 'Automatic voice should prefer local English');
  assert.equal(selectNarratorVoice(voiceList, 'cloud').voiceURI, 'cloud', 'Respect an explicit voice choice');
  assert.equal(selectNarratorVoice(voiceList.filter(voice => voice.lang.startsWith('fr'))), null);
  const long = Array.from({length: 110}, () => 'Evidence').join(' ') + '.';
  assert.ok(splitNarration(long).every(chunk => chunk.length <= 220));
  assert.equal(splitNarration(long).join(' '), long);
  assert.doesNotMatch(lastAlibiNarration(scene()), /SECRET/);
  const ending = {culprit: 'SECRET CULPRIT', story: 'SECRET CULPRIT committed the murder.', caught: true};
  for (const revealStep of [0, 1]) assert.doesNotMatch(lastAlibiNarration(scene({phase: 'ended', revealStep, ending})), /SECRET CULPRIT/);

  // Browsers get no AudioContext or speech request until a real input path unlocks it.
  let test = environment();
  update(test, scene());
  assert.equal(test.contexts.length, 0); assert.equal(test.synth.spoken.length, 0);
  await test.gesture();
  assert.equal(test.contexts.length, 1); assert.equal(test.synth.spoken.length, 1);
  assert.equal(test.synth.current.voice.voiceURI, 'local');
  assert.equal(test.contexts[0].nodes[1].gain.value, .16, 'Music must duck under narration');
  for (let i = 0; i < 8; i++) update(test, scene());
  assert.equal(test.synth.spoken.length, 1, 'Polling must not repeat a scene');
  const previous = test.synth.current;
  update(test, scene({chapter: 1, phase: 'investigate', chapterInfo: {title: 'New scene', story: long}}));
  assert.equal(test.synth.cancellations, 1); assert.match(test.synth.current.text, /New scene/);
  previous.onend(); test.advance(300);
  assert.equal(test.synth.spoken.length, 2, 'Late callbacks from the canceled chapter must be inert');
  test.synth.end(); test.advance(260);
  assert.equal(test.synth.spoken.length, 3, 'Long scenes advance one completed utterance at a time');
  test.controls.replayButton.click(); await Promise.resolve();
  assert.match(test.synth.current.text, /New scene/); assert.equal(test.synth.cancellations, 2);
  test.controls.button.click();
  assert.equal(test.synth.current, null); assert.equal(test.controls.button.getAttribute('aria-pressed'), 'true');
  assert.equal(test.contexts[0].nodes[0].gain.value, 0, 'Mute must also silence the reverb tail');
  assert.ok(test.contexts[0].sources.every(source => source.stopped));
  const mutedCount = test.synth.spoken.length; await test.gesture(); test.advance(1000);
  assert.equal(test.synth.spoken.length, mutedCount); assert.equal(test.store.get('links-last-alibi-audio-muted'), '1');
  test.controls.button.click(); await Promise.resolve();
  assert.equal(test.synth.spoken.length, mutedCount, 'Unmuting does not unexpectedly replay old narration');
  test.controls.replayButton.click(); await Promise.resolve();
  update(test, scene({paused: true})); assert.equal(test.synth.current, null);
  update(test, scene()); assert.equal(test.synth.current, null, 'Resume leaves narration to Replay');
  test.controls.replayButton.click(); await Promise.resolve();
  document.hidden = true; document.fire('visibilitychange'); assert.equal(test.synth.current, null);
  document.hidden = false; document.fire('visibilitychange'); await Promise.resolve();
  assert.equal(test.synth.current, null, 'Returning to a tab must not replay stale speech');
  test.controls.replayButton.click(); await Promise.resolve();
  window.fire('pagehide'); assert.equal(test.synth.current, null);
  test.player.dispose(); assert.equal(test.timers.size, 0); assert.equal(test.contexts[0].state, 'closed');

  // Shared reveal stages are deduplicated and cannot speak the solution early.
  test = environment(); await test.gesture();
  update(test, scene({phase: 'ended', revealStep: 0, ending}));
  update(test, scene({phase: 'ended', revealStep: 1, ending}));
  assert.ok(test.synth.spoken.every(line => !line.text.includes('SECRET CULPRIT')));
  update(test, scene({phase: 'ended', revealStep: 2, ending, narrationScene: {key: 'culprit', text: 'The culprit is SECRET CULPRIT.', cue: 'reveal'}}));
  assert.match(test.synth.current.text, /SECRET CULPRIT/);
  const revealCount = test.synth.spoken.length;
  update(test, scene({phase: 'ended', revealStep: 2, ending, narrationScene: {key: 'culprit', text: 'The culprit is SECRET CULPRIT.', cue: 'reveal'}}));
  assert.equal(test.synth.spoken.length, revealCount);
  update(test, scene({phase: 'ended', revealStep: 3, ending, narrationScene: {key: 'silent', text: '', cue: ''}}));
  assert.equal(test.synth.current, null, 'An empty public presentation script explicitly silences narration');
  test.player.dispose();

  // Guided suggestions never sound a deadline; timed games tick only once per second.
  test = environment({preferences: {'links-last-alibi-audio-narration': '0'}}); await test.gesture();
  const timed = scene({deadline: 10000}); update(test, timed);
  let sources = test.contexts[0].sources.length; update(test, timed);
  assert.equal(test.contexts[0].sources.length, sources);
  update(test, {...timed, guided: false}); assert.equal(test.contexts[0].sources.length, sources + 2);
  sources = test.contexts[0].sources.length; update(test, {...timed, guided: false});
  assert.equal(test.contexts[0].sources.length, sources);
  for (const kind of ['paper', 'discovery', 'share', 'ready', 'transition', 'accusation', 'reveal']) {
    test.advance(200); sources = test.contexts[0].sources.length; test.player.cue(kind);
    assert.ok(test.contexts[0].sources.length > sources, kind + ' produces its own cue');
  }
  test.player.dispose();

  test = environment(); update(test, scene({mode: 'together'})); await test.gesture();
  assert.equal(test.synth.spoken.length, 0, 'Group phones start with narrator off');
  test.controls.narrationButton.click(); await Promise.resolve(); assert.equal(test.synth.spoken.length, 1);
  test.player.setVoice('cloud'); assert.equal(test.store.get('links-last-alibi-audio-voice'), 'cloud');
  test.controls.replayButton.click(); await Promise.resolve(); assert.equal(test.synth.current.voice.voiceURI, 'cloud');
  test.controls.narrationButton.click(); assert.equal(test.store.get('links-last-alibi-audio-narration'), '0');
  test.player.dispose();

  test = environment({preferences: {'links-games-muted': '1'}}); update(test, scene()); await test.gesture();
  assert.equal(test.contexts.length, 0, 'Respect the previous game-audio mute preference on migration');
  test.player.dispose();
  test = environment({preferences: {'links-last-alibi-audio-narration': '0'}}); update(test, scene({display: true})); await test.gesture();
  assert.equal(test.synth.spoken.length, 0, 'Stored narrator preference overrides display default'); test.player.dispose();
  test = environment({storageBlocked: true}); update(test, scene()); await test.gesture();
  test.synth.error('not-allowed'); assert.match(test.controls.status.textContent, /Tap Replay/);
  test.controls.replayButton.click(); await Promise.resolve(); assert.ok(test.synth.current);
  test.advance(30000); assert.equal(test.synth.current, null, 'Watchdog cancels a stalled speech engine');
  assert.match(test.controls.status.textContent, /Follow the scene text/); test.player.dispose();
  for (const failure of [{audio: false}, {resumeFails: true}]) {
    test = environment(failure); update(test, scene()); await test.gesture();
    assert.ok(test.synth.current, 'Native narration can work without Web Audio');
    assert.equal(test.controls.button.textContent, 'Mute sound');
    assert.equal(test.controls.button.getAttribute('aria-label'), 'Mute game sound and narration');
    test.controls.button.click(); assert.equal(test.synth.current, null);
    assert.equal(test.store.get('links-last-alibi-audio-muted'), '1');
    const before = test.synth.spoken.length;
    update(test, scene({chapter: 1})); await test.gesture();
    assert.equal(test.synth.spoken.length, before, 'Master mute blocks later scenes when Web Audio is unavailable');
    test.controls.button.click(); await Promise.resolve(); assert.ok(test.synth.current);
    test.synth.end(); test.advance(260); update(test, scene({chapter: 1}));
    assert.equal(test.controls.button.textContent, 'Mute sound', 'Keep mute usable between spoken lines');
    test.controls.button.click(); assert.equal(test.controls.button.getAttribute('aria-pressed'), 'true');
    test.player.dispose();
  }
  test = environment({speech: false, audio: false}); update(test, scene()); await test.gesture();
  assert.equal(test.controls.narrationButton.disabled, true); assert.equal(test.controls.replayButton.disabled, true);
  assert.match(test.controls.status.textContent, /read and play/); test.player.dispose();
  console.log('PASS Last Alibi audio: gesture activation, local voice choice, single-utterance narration, stale callback cancellation, ducking, mute/reverb, pause/visibility/leave cleanup, staged reveal privacy, guided/timed cues, preferences and unavailable/stalled browser fallbacks.');
} finally {
  restoreAudioGlobals();
}
