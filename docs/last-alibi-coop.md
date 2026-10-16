# Last Alibi guided cases

New rooms explicitly choose Solo, Solve Together (2–8 investigators), or Secret Killer (4–8 guests). Solo and Solve Together create six fictional suspects; investigators never receive the solution. In Secret Killer, one player receives a private culprit role. The TV receives only public information and cannot join a seat or control the case.

New rooms use `flowVersion: 2`. Each scene provides an objective and a discussion prompt. During Acts II and IV, each player saves a private suspect-and-evidence theory before marking ready. Theories can be revised during that scene; other players see only completion progress. The host can continue as soon as everyone is ready. Older active rooms retain their original readiness rules.

Standard difficulty uses synchronized recording clocks. Expert difficulty requires correcting the device timestamps. Both retain the earlier recording that looks convincing but does not cover the attack window. Case generation verifies one solution and avoids consecutive culprit characters, methods, and scenes where possible.

Each investigator seals a suspect, location, method, and supporting shared record. A strict majority identifying the culprit solves the case. Correct suspect earns 500 points; correct scene and method add 100 each. In Secret Killer, an uncaught culprit earns 500. Scores are saved once when the case ends. The host then reveals the timeline, culprit, explanation, and scores in synchronized steps across phones and TV. Private theories become personal feedback at the final step.

Original procedural ambience and effects run on the device. The optional narrator uses available browser voices, with voice selection, replay, captions, music ducking, and a shared mute control. Solo and TV default to narration after a user gesture; multiplayer phones default to narrator off. No paid voice service or recorded actor is required. Actual voice timbre depends on the device.

Checks include generated-case uniqueness, private views, theory readiness, pause enforcement, reveal permissions, legacy compatibility, rematch cleanup, and scoreboard idempotence in `tests/last-alibi-flow.mjs`; audio lifecycle in `tests/last-alibi-audio.mjs`; and solo/group phone and TV interactions in the browser suites.
