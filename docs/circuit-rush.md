# LINKS Circuit Rush

An original, free, phone-first circuit puzzle. Six boards start with a shared 180-second clock. Each gold node adds 5 seconds on its first source connection; reconnecting cannot farm time. Clearing each of the first five boards adds 20 seconds. At most 190 bonus seconds can be earned. Tap a movable tile to rotate clockwise, connect the left source through all three LINKS nodes to the right exit, then press Light it up. Every energized connection must be reciprocal with no open leaks. Failed pulses cost three seconds. The timer continues between boards and while the tab is hidden.

## Difficulty and generation

Deterministic seeded boards grow from 5x5 to 6x6 to 7x7. Required solution routes use at least 14/20/28 tiles with 6/8/10 turns, fixed entry/exit pieces, locked tiles, and decoy branches. A known valid route is created before scrambling; the initial board is guaranteed not to be solved. No paid question, map, image, or content service is used. Difficulty needs player feedback; the generation checks establish solvability, not an ideal completion rate.

Daily mode shares a Central-calendar-day seed. Quick play and shared seed challenges offer unlimited local play. Share links reproduce the boards without including the solution. Results distinguish local personal bests from saved public scores. There are no entry fees, cash prizes, payouts, or paid advantages.

## Saved daily scores

The dedicated /new-build/api/circuit-rush endpoint uses existing verified LINKS sessions. Guests can play locally; saving daily scores requires signing in. One active server run per account is replaced by a new start. A start creates a 180-second server deadline and snapshots the optional active venue. Finish sends rotation and pulse events, never an authoritative client score. The server recreates the boards, verifies legal unlocked rotations, board order, pulses and timing, and calculates points. Three seconds are deducted per failed pulse. Points equal 1,000 per solved board plus 10 per whole remaining second (only when at least one board is solved), minus two per rotation, clamped to zero.

Runs can be submitted up to 15 seconds after the maximum extended deadline for network recovery, with zero remaining-time bonus. A run can be saved once. Each account/day keeps its best completed score; a worse repeat does not replace it or inflate totals. Today and All-time leaderboards are separate from trivia and other game scoring. Venue labels represent the player's selected venue, not a GPS attendance check. Public results use display names/opaque IDs and do not expose account emails or action logs.

No browser puzzle can guarantee resistance to automation. Validation rejects arbitrary score payloads and illegal event sequences; these friendly leaderboards are not certified anti-cheat or prize competition systems. The reference solution helper exists only under tests and is not exported by the served engine.

D1 tables are initialized lazily: links_circuit_runs and links_circuit_scores. Existing DB/session setup is reused. No NFL game, scoring, saves, or feeds are changed.

## Checks

- tests/circuit-rush.mjs: 2,400 generated boards, solvability, increasing complexity, immutable rotations, locks, malformed inputs and complete-node/no-leak rules.
- tests/circuit-rush-api.mjs: real SQLite/D1, authentication, CSRF, server scoring, clock, event validation, duplicate submission, expiry, personal best and privacy.
- tests/circuit-rush-browser.mjs: phone/desktop gameplay, graphics, timers, sharing, sound controls and reduced motion.

- tests/circuit-rush-integration.mjs: real authenticated account, browser and API with all six boards solved, server-verified score and replay on phone and desktop.

Levels: Hardwired (5x5), Crossed Signals (6x6), Overload (7x7), Blackout (7x7), Deadlock (8x8), Meltdown (9x9). The last three require longer, more twisting routes, use plausible two-port decoys, and reveal fewer locked route hints. Local bests are versioned for the new rules.
