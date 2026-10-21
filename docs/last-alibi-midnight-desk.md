# Last Alibi case library

Current new-room format: dossier version 2, six discoverable objectives, 21–26 records per case, generated cinematic artwork and seven-day resume. Earlier development scopes below describe preserved compatibility versions.

## Direction

This is an update to Last Alibi, not a separate Game Room game. The new original hotel caper is a shorter cooperative investigation; Blackthorn Manor remains available for longer solo/cooperative and Secret Killer play. Existing active rooms must keep their case identity and rules. All game access remains free during the advertising promotion.

The original game premise is a midnight concierge investigation: a charity sapphire has disappeared, witnesses have questionable alibis, and the hotel would prefer the incident report to sound like a hospitality achievement. Suspects, dialogue, settings, clues and artwork are original LINKS material. Six playable case choices form the initial library; a persistent campaign or daily case-writing service is not claimed.

## Public reference review

- https://www.nightofmystery.com/shop-mysteries/ — themes and player-group choices suggest presenting a clear case selector rather than silently replacing one story with another.
- https://www.nightofmystery.com/how-it-works/ — broad patterns worth adapting include advance role briefings, staged objectives/evidence and a structured accusation/reveal. Their host can participate without reading the solution, but still manages the event. Our software-managed flow is an adaptation, not a claim about their product.
- https://www.nightofmystery.com/product/a-clueless-murder/ — its public explanation of matching solutions across differently themed versions reinforces the need to describe replay variants honestly.

Only public pages were reviewed. No paid scripts, solution packets, character sheets, plot text, artwork or downloadable kits were reused.

## Presentation

New generated artwork: public/new-build/assets/last-alibi-midnight-desk-v1.png. Hotel styling uses glossy black, brass and warm lobby lighting. The real LINKS logo remains in the site header. Classic manor artwork remains available for classic cases. Game Room, Party Room and venue presentation card images identify the new episode.

## Additional references saved for future case design

- https://detectivemysterymasters.com/products/unsolved-case-files-the-ultimate-3-in-1-detective-mystery-game — reviewed public descriptions of document packs, scene photographs, call logs, timelines and audio clues. These support using varied original evidence rather than long exposition. No cases or evidence from the product were copied.
- https://mastersofmystery.com/collections/murder-mystery-games — reviewed theme and player-count organization for the case library.
- https://mymysteryparty.com/collections/murder-mystery-party-games — saved as a reference for case categories, group play and optional hosting timelines.

## Shipped implementation scope (local until pushed)

Six playable library choices: The Sunken Observatory, The Midnight Desk, The Final Encore, The Night Train, The Last Hand, and classic Blackthorn Manor. Short cases support Solo and Solve Together with three investigation acts and 8/12-minute estimates; classic cases retain 35/45-minute settings and Secret Killer mode. Duration is a reading/play estimate, not an artificial waiting requirement. Solo progression uses one Continue case action. Core records are introduced by chapter; optional leads use three shared favor credits. Private My Theory drafts are optional and do not block progression. The final conclusion still requires the suspect, scene, method and decisive proof.

Evidence images support zoom and pan with no overlay markers. An optional Read image text control provides a plain accessibility transcription. The hidden extensions in original evidence images open the corresponding archive recording. Extra short cases cross-reference credential codes against separate issue records, so a recording does not simply announce the culprit's name. Each authored case retains its solution on replay; replay is not advertised as a new story.

Case data is separated from engine code in functions/lib/last-alibi-quick-cases.js. Add original case configurations to grow the library, then validate the closed suspect set, factual consistency, one inferable solution, correct phone source/chapter/proof path and accessible image details. A large case library remains an ongoing authoring effort; unimplemented cases are not shown as playable.

## Additional escape-room reference

- https://wolfescapegames.com/en-us/pages/pharaohs-tomb — public product page reviewed October 20, 2026. Advertises a chapter-based cinematic escape story, visual/logic/deduction puzzles, saved progress, TV viewing and a phone-accessible Digital Backpack for inspecting clues. Useful direction for original LINKS cases: shared scene on TV, individual evidence inspection on phones, puzzle-gated discoveries, varied locations and atmospheric sound. Only the public description was reviewed; the paid game was not played and no puzzles, story, artwork or recordings were copied. Its advertised main game requires desktop/laptop; LINKS should retain phone-first play. The original Sunken Observatory case now explores this direction.

## Dedicated phone activation

The owner requested a real dedicated number, not a simulated dialer. The incoming-call connector is implemented at /new-build/api/mystery-phone. It is not activated: no provider account, number, funding, or recordings have been purchased or configured. See last-alibi-phone-setup.md. Unconfigured local gameplay explicitly offers a recording preview for testing; it must not claim that a real call occurred. Configured phone mode hides this preview and rejects direct HTTP proof unlocking. Private access codes and discovered clue transcripts are excluded from the TV view.

## Original expedition expansion

The Sunken Observatory adds an original island expedition, five continuous suspect alibis, a three-digit brass-token puzzle and a private sealed transfer record. Players cross-reference an image with a field guide, submit a server-validated answer, then choose whether to share the unlocked evidence. Answers are not included in client state or TV responses; locked proof cannot be opened through inspect. No service call is required for this case. New objective-based room expiry is seven days; older rooms retain their original four-hour expiry. Illustrations are original SVG assets, not rendered 3D scenes or borrowed Wolf artwork.

## Evidence-file progression (new rooms)

New investigator rooms use dossierVersion 1. Each case has three distinct, server-validated objectives requiring a deduction plus two specific inspected/shared records. Later evidence is not sent until its packet opens. Continue cannot bypass a gate; optional hints never unlock packets; stale objective submissions are rejected. Core evidence requires independent inspection instead of automatic publication. Objectives are shared team progress while notebooks, theories and unshared proof remain private. Existing rooms without this version and classic Blackthorn retain their original flow. No countdown; new rooms are resumable for seven days. Fixed authored solutions remain fixed on replay. These are compact investigations, not yet playtested 2–4-hour productions.

Research distinction: Detective Mystery Masters publicly advertises realistic evidence files and 2–4-hour cases; Wolf describes chapter-linked visual/logic puzzles and saved progress; Night of Mystery and the other party-kit sites describe role-based parties. LINKS follows the owner’s requested evidence-file objective format using original content. Only public product descriptions were inspected; paid packets, hidden solutions and proprietary puzzles were not accessed or copied.

## Expanded dossier version 2

Newly created investigator rooms now have six sealed evidence packets and twelve extra original records per case. The original three checkpoints occupy packets 1, 3 and 6; new route, cipher/index and timing/forensic deductions occupy packets 2, 4 and 5. Each case has 21–26 records. Objectives themselves must be discovered by inspecting their source exhibits. Typed submissions require the right deduction and two or three specific known records. Progress remains shared; the final report and unshared evidence remain private. Existing v1 three-packet rooms and older rooms retain their original content/flow through explicit version checks.

Original expansions:
- Midnight Desk: service routing, an acrostic collection alias, cross-midnight scanner correction.
- Final Encore: real versus proposed backstage routes, reordered technical insert, frame-count timing.
- Night Train: replacement-carriage mapping, reversed-carbon account code, printer/reference clock alignment.
- Last Hand: pack/seal provenance, crop-to-contact-sheet card identification, audit/camera time alignment.
- Sunken Observatory: tide and handling constraints, ordered star-plate coordinates, UTC/island custody conversion.

Case artwork is now photographic generated key art rather than schematic SVG covers (the earlier generated hotel/manor artwork stays). See last-alibi-generated-art.md for exact prompts and project asset paths. Exact evidence tables are accessible HTML, and required digits are not inferred from generated decorative imagery. No paid reference game was purchased or played; public pages, public gallery art and published hosting descriptions informed the structure. Long playtime and commercial-game difficulty equivalence are not claimed without human playtesting. Classic Blackthorn remains the separate role-playing party format. Personal and operator phone costs are not presented as game fees.
