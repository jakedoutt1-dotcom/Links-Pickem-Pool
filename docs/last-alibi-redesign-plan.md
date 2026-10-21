# Last Alibi: evidence-led murder investigation plan

Status: flagship implemented as `night-train-investigation`, dossier version 3: seven gated packets, 35 records, six evidence photographs, exact train map, structured answers with corroborating records, private/shared clue controls, and 30-day save recovery. Existing cases remain separate. Automated engine and browser validation is included; blind human playtests have not established duration or difficulty.

## Decision

Keep every unrelated story a separate case. Do not join the hotel theft, theatre sabotage, card substitution and expedition into one implausible murder. Label their actual mystery type. Rebuild **The Night Train** first as the flagship cooperative murder investigation; it already contains an actual murder and a contained location. Keep classic Blackthorn's Secret Killer party mode separate from cooperative investigator mode.

Aim for a substantial evening investigation. A 60–90 minute first target is an internal hypothesis, not a published promise. Blind playtests must establish actual duration, difficulty and clarity. More documents or compulsory clicks do not establish depth.

## Team and boundaries

One coordinating CEO reviewer plus two specialist workers reviewed references and implemented the story, engine and interface; root owns visual evidence and integration. NFL Pick'em and shared app.js remain outside scope. Existing active rooms keep their original case version.

## What the references actually show

Only official public descriptions were inspected. No paid game was purchased or played, and internal puzzle/validation behavior is not known.

* [My Mystery Party: Professor Hackett](https://mymysteryparty.com/products/catch-a-killer-the-murder-of-professor-hackett): non-roleplay investigation, forensic records, communications, schematic, investigation websites, interviews/voicemail and evidence-based final deductions. Its advertised 3–5 hours is the publisher's claim for that product.
* [Detective Mystery Masters](https://detectivemysterymasters.com/products/unsolved-case-files-the-ultimate-3-in-1-detective-mystery-game): advertised 40+ evidence items, scene images, maps, transcripts, profiles, objectives and sealed envelopes; advertised 2–4 hours per case and spoiler-safe hints. Its exact answer checker is not publicly established.
* [Wolf: how it works](https://wolfescapegames.com/en-us/pages/how-it-works) and [Pharaoh's Tomb](https://wolfescapegames.com/en-us/pages/pharaohs-tomb): shared main display and independent phone clue backpack, saved progress, cinematic visual/logic puzzles. Approximately 150 minutes is a product claim, not a LINKS estimate.
* [Night of Mystery](https://www.nightofmystery.com/how-it-works/) and [Masters of Mystery](https://mastersofmystery.com/pages/how-to-host-a-murder-mystery-party): distinguish character roleplay/staged objectives from evidence-file detective play. LINKS should not mix those onboarding requirements.

Our design inference: use sealed evidence milestones, persistent notebooks and cross-record deductions in an original story. Do not copy stories, puzzles, artwork, scripts or proprietary materials.

## Current deficiencies to fix before calling it a deep case

1. Dossiers repeat a route puzzle, small cipher and clock correction across settings (`functions/lib/last-alibi-dossiers.js`). Distinct names are not distinct investigative experiences.
2. Several cases are theft or sabotage, not murder (`last-alibi-midnight.js`, `last-alibi-quick-cases.js`). Preserve accurate labels rather than rewriting marketing only.
3. Many purported maps/photos are prose or tables. The cinematic cover is reused as scene scenery. Native navigable exhibits need to carry actual spatial or visual facts.
4. Night Train's early records clear most suspects; the phone credential then makes the final packet close to a lookup. Delay conclusive identity until a complete corroborated chain is possible.
5. `answerMatches` in `last-alibi-objectives.js` uses normalized substring inclusion. Contradictory answer dumps and number substrings can pass. Replace this for the new case with structured, exact normalized fields and semantic sets.
6. An attached archive request currently states the task explicitly, and one person's private inspection can expose an objective to everyone. Separate a private discovery from a shared published lead.
7. Existing seven-day expiry is fixed from creation. Show an honest expiry and define a secure recovery/retention policy for multi-session play before promising durable long-case saves.

## Flagship case contract

Use one original fixed murder, a verified victim, six plausible suspects, and a single internally consistent chronology. Lock the writer's truth first: identity, opportunity, means, motive, concealment and the innocent explanation for each red herring. Retain a generic non-instructional cause of death; no real-world harmful procedure is needed.

Do not write a killer's confession into an early recording. A credential establishes a credential's use, not automatically its holder. A motive establishes a reason, not guilt. Clock, route, possession and forensic claims each need a source and stated limits. Every decisive conclusion must rest on at least two independent facts.

### Proposed seven-packet dependency graph

| Packet | Investigator objective | Required independent links | Unlock |
| --- | --- | --- | --- |
| 1. Incident file | Establish where and when the victim was last reliably alive and later found | Initial statements + authentic scene image + medical interval | Scene survey and complete carriage plan |
| 2. The reachable compartment | Reconstruct a viable route during the relevant interval | Scaled map/door legend + service closure notice + photographed physical trace | Service movements and witness interviews |
| 3. Two visits | Distinguish the innocent first delivery from a later return | Tray/label photo + service register + interview contradiction | Communications archive and custody records |
| 4. The hidden exchange | Identify what changed hands, without yet identifying the killer | Real readable detail in an image + message/voicemail + independent inventory | Financial/personal history and a disputed alibi |
| 5. The broken alibi | Reconstruct opportunity from two different sources | Timeline board + synchronized event/audio + route constraint; not another standalone clock worksheet | Credential custody and forensic comparison |
| 6. The corroborating chain | Connect a specific person to the relevant object and opportunity, excluding the strongest alternative | Credential transfer history + physical comparison + earlier movement evidence | Final case submission |
| 7. Prove the murder | Submit killer, means, opportunity and motive with a coherent evidence chain | Multiple cited exhibits across earlier packets; test alternative explanation | Full reconstruction, suspect explanations and debrief |

This is a design skeleton, not final authored answers. A writer must resolve times, locations, causation and alternative explanations before generating final exhibits. The optional phone recording cannot be the only route through a paid or unavailable external service; an accurately labeled in-game recording/transcript must preserve solvability.

The graph is sequential at packet boundaries and exploratory within each packet. Players choose which unlocked records to inspect and can revisit old ones. Wrong conclusions keep the next packet sealed, without resetting work or revealing which individual answer field was correct. No mandatory countdown, arbitrary wait, action-point spend, or forced deciphering unrelated to the murder.

## Evidence production brief

Plan for 30–40 purposeful exhibits, including 6–8 independent photographic evidence shots and one exact carriage-topology map. These are proposed production scope, not assets already built or a substitute for playtested depth. Remove an exhibit if it supplies no necessary fact, meaningful alternative explanation or characterization.

Produce original generated cinematic establishing art for the train exterior, discovered compartment, service passage and final reconstruction. Evidence shots should include the scene overview, latch close-up, tray/glass placement, damaged ticket, passenger contact sheet and locker receipt. Use generated art for atmosphere and plausible environmental traces. Add exact critical labels, numbers and document text as controlled overlays or code-native exhibits, never unreliable generated lettering.

Build an actual carriage map with a scale, orientation, door/hatch legend, sightlines and clearly dated revision. Build a distinct scene photograph, tray/service-label close-up, contact sheet, message thread, original interview audio with transcript, ledger, credential log and medical summary. Each exhibit has an ID, provenance, date, legible zoom and a precise fact/ambiguity in the author's evidence matrix.

No numbered hint circles or required invisible hotspots. Players inspect the image itself. A faithful accessible transcription describes observable information without explaining its significance. Critical details must be readable at supported phone zoom; do not require accidental pixel hunting, color-only distinctions or outside specialist knowledge. Hidden extensions should be believable and discoverable through corroboration, not printed as an answer instruction.

## Interaction and validation

* Case page: short premise, actual mystery type, supported investigators, content note, honest duration once tested, Create/Join/Resume. No confusing mode matrix.
* Shared TV: current unlocked scene, shared evidence and objective progress; never private notes, unrevealed answers or automatic solution hints.
* Phones: independently inspect unlocked evidence; shared notebook, personal notes, bookmarks and explicit Share. Show who found a shared record and retain previous packets.
* Objective: discover a concrete request through the story, record it in the notebook and submit structured fields plus selected supporting records. In solo, discovering it records it immediately; in co-op, only shared findings update the shared objective.
* Validator: exact normalized codes/times, bounded numeric values, accepted name aliases, unordered entity sets where appropriate; reject contradictory alternatives and all-answers lists. Author multiple valid corroborating proof bundles when independent exhibits genuinely establish the same fact; do not require the writer's favorite arbitrary pair. Validate packet, room membership, accessible supporting records and completion idempotence server-side. Do not expose answer keys to clients.
* Hints: optional three-level ladder, where to inspect -> relationship to consider -> explicit explanation only on request. Hint use is not failure and never costs money.
* Save: checkpoint each discovery, submission, shared item and note; reconnect without losing a packet; present retention accurately. Give the reconstructed flagship a new revision/ID so old rooms keep the story they started and old played badges do not mark the rebuilt investigation as already solved.

## Work allocation for the next implementation round

1. Story/evidence owner: write truth timeline, suspect matrix, packet dependencies and contradiction audit first. Produce one complete internally tested case rather than expanding every case at once.
2. Exhibit/experience owner: create scene art and actual phone-readable maps/documents/audio; implement exploration, notebook and clear next objective without spoiler markers.
3. Engine/quality owner: structured objective checks, persistence/versioning, co-op sharing/TV privacy, negative tests and full API playthrough.
4. CEO/root integration: review each milestone against the truth matrix, verify references are inspiration only, and run independent blind playtests before release.

## Release gates

* Solve every packet from visible exhibits alone, with no author knowledge or real phone provider dependency.
* Test wrong, contradictory, partial, oversized, repeated and out-of-order submissions; no digit-substring bypass.
* Confirm no earlier packet uniquely and unambiguously reveals the final culprit; late corroboration must contribute a real inference.
* Test solo plus multiple investigators, mixed private/shared finds, disconnect/resume, host exit and TV privacy.
* Verify each route against actual map adjacency, door state and sightlines; distinguish a photograph's observation from the deduction it supports. Evidence inspection order must not change solvability. Ensure every objective's required record count fits the submission interface.
* Review every exhibit at 390px and 320px phone widths and desktop; critical labels must remain usable with zoom and transcription.
* At least two blind groups report where they stalled, hint use, actual duration and why their final chain rules out alternatives. Revise evidence, not merely add more text. Publish only measured duration ranges.
* Final debrief explains what happened, why each decisive clue matters, and why each tempting alternative fails.

After the flagship passes these gates, reuse the engine and quality checklist for separate cases. Reuse mechanics selectively; do not reskin the same route/cipher/clock sequence into every story.
