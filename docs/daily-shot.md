# LINKS Daily Shot

Play at `/new-build/daily-shot.html`. Entries are linked from the Game Room shelf, its Daily Shot feature banner, and the Locker Room footer. Sign-in and account creation return to the game with `next=daily-shot`.

## Playing

Pull downward on the court to set power (farther pull = higher arc, full power within 80–140 screen pixels), move left/right to adjust direction, and release to shoot. A tap does not waste a shot. Sliders and arrow keys provide the same aim/power controls; Space or Shoot releases the ball. The court, ball, glass backboard, rim, net and rebounds are real Three.js geometry. The arena panorama is scenery, not a static game-screen screenshot. Animation follows a fixed-step simulation and the camera follows high/wide shots. Sound is optional and off initially.

Five shots make a run. A clean swish earns 20, a made rim/bank shot earns 10, and a miss earns zero. Maximum score is 100. Only downward hoop crossings count. Rim, backboard and floor collisions are simulated; there is no random make/miss decision.

Everyone receives the same five positions for a Central Time day, derived from `daily-shot-v1:YYYY-MM-DD`. Unlimited practice works without an account or score-service connection. Practice never writes ranked results. Historical shared challenges use the shared day in practice; ranked runs always use the server's current day.

## Ranked runs and persistence

Three ranked starts are allowed per player per day. An unfinished run is resumed rather than consuming another attempt, including simultaneous start requests from different tabs. A run lasts at most 20 minutes and never crosses the midnight Central reset. Started but unfinished attempts count toward the three-run limit, as stated in the game.

The endpoint `/new-build/api/daily-shot` accepts `start` and `shoot`. Account identity is resolved by the existing LINKS account session; an authenticated pool-member session is also supported. The server derives the identity and name rather than accepting an owner from the request. Legacy pool identities and unified account identities are separate until the existing login transition connects them.

Each shot sends only run ID, optimistic version, and aim/power. Both runtimes use the same deterministic physics; the server recalculates the outcome and ignores claimed scores. Version, ownership, deadline and flight-completion guards prevent overwrites, double counting, cross-account writes and rushed subsequent shots. An uncertain network submission is read back, never automatically resubmitted. This verifies scoring from inputs; it is not a claim of bot-proof input generation.

The isolated tables are `links_shot_profiles` and `links_shot_runs`. Saved names are sanitized and email-shaped display names receive a generic player label. Public boards expose display names and opaque public IDs, not private account owners, emails, session tokens, or venue addresses. No existing pool picks or game scores are migrated.

## Boards, streaks and invitations

Daily standings count the best completed run per player. Weekly standings sum daily bests from Monday through Sunday. Replays cannot inflate either board. Tied scores share rank. Filters support all players, authenticated members of the current pool, and an active selected venue. Venue choice is captured at run start. Venue logos and names appear beside the game setup and the venue name accompanies the active run.

Completing a ranked run builds the daily play streak. Yesterday's streak remains current until the player misses today's completion. Practice does not create or extend a ranked streak.

After a run, Share challenge & QR opens a scannable QR code, native share options and a copyable public challenge URL. It carries only the day and target score, never authentication details. Practice results are labeled as practice in the message.

## Verification

- `node --test tests/daily-shot.mjs`: physics, deterministic setup, bank/rim/swish scoring, input bounds, all five attainable shots, Central boundaries, three-run cap, resume, duplicate/stale submissions, server scoring, weekly bests, auth/CSRF, profile privacy, pool membership, venue filtering and simultaneous starts.
- `node tests/daily-shot-browser.mjs`: actual WebGL scene at 390px/1280px, five verified shots and a 100-point completed run, reload/resume, pointer input, offline practice, QR/copy/native sharing, daily attempt count and overflow checks.
- Existing Game Room, login, account and game regression suites verify integration.

The artwork was created with built-in image generation and copied into `public/new-build/assets/daily-shot-card-v1.png` and `daily-shot-arena-v1.png`; corresponding `.prompt.json` files retain the prompts. Three.js and the QR encoder reuse the project's existing licensed vendor modules. Future scoring/physics changes must version the rules and seed and preserve in-progress attempts rather than silently changing a live day's rules.
