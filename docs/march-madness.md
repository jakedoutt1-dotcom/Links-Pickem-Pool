# March Madness bracket challenge

The March Madness page now uses a complete men's 64-team / 63-game bracket. Region and round navigation replaces the old daily-game picker. Players save drafts, predict the championship's combined score, and submit a complete bracket before the first Round of 64 tip-off.

## Open it

- Practice: /new-build/march-madness.html?demo=1
- Pool: /new-build/march-madness.html?pool=POOL_ID
- Commissioner: the same pool page, then Commissioner.
- Season: use the tournament-year selector or season=2027.

Without a pool parameter the page is explicitly a practice bracket; practice storage is separate from real entries. Its sample field is not a published upcoming tournament.

## Commissioner setup

Enable March Madness in the pool. Once ESPN exposes all 32 Round of 64 matchups with resolved team IDs and seeds, use Check ESPN tournament field, review the matchups, and confirm the official Final Four regional pairings. Publish before the first Round of 64 tip-off.

This initial version opens the field after First Four participants resolve; it does not support advance picks on unresolved play-in placeholders. A field cannot be replaced after any player saves a draft or after tip-off. Previous per-game March entries remain untouched; they are not silently converted into full brackets.

## Scoring and storage

Round values are 10, 20, 40, 80, 160, 320 (1,920 total). Maximum possible removes future points for eliminated teams. After the final, equal points are ranked by absolute distance from the championship combined score; equal distances share rank. This is the LINKS tiebreaker rule.

The authenticated /new-build/api/march endpoint derives the player from the pool session, verifies roster membership and the enabled game, validates every bracket path, and enforces the deadline server-side. Whole-bracket saves use optimistic versions. Opponents' entries are returned only after the deadline, and only submitted entries count.

Two isolated tables are created idempotently through the existing DB binding: links_march_tournaments and links_march_entries. No NFL, college football, or legacy March picks are migrated or modified.

ESPN's public basketball scoreboard is queried by individual calendar dates. Tournament notes, rounds, regions, seeds, and team identities drive the import; regular-season, NIT, and First Four games are excluded. Completed results are matched to bracket paths, not feed order. Results refresh on page load or Refresh with a two-minute server cache. On feed failure the response labels its stored tournament snapshot as stale rather than claiming live results. Official corrections in the ESPN feed are reflected on the next successful refresh.

## Verification

Run node --test tests/march.test.mjs with Node 24+ (built-in SQLite). The suite covers advancement, elimination, scoring, tiebreakers, feed mapping, authentication, privacy, full submission, concurrent versions, setup freeze, and deadline enforcement.

Run node tests/march-browser.mjs with Playwright available to Node (installed normally or via NODE_PATH). On Windows it uses installed Edge; elsewhere it uses Playwright Chromium. PLAYWRIGHT_CHROMIUM_EXECUTABLE optionally supplies an executable. MARCH_SCREENSHOT_DIR optionally chooses the screenshot directory; otherwise it writes output/march-madness in the repository. Pool APIs in browser tests are mocked, so tests do not touch production.

The 2026 ESPN feed was also checked directly: 32 opening matchups, all 63 games, and correct matching for East–South / West–Midwest national semifinals. Desktop and 390px phone screens were checked, including all 63 selections, draft reload, submission, sample results, read-only bracket comparison, and save-conflict recovery.

## References

- [ESPN bracket flow and result indicators](https://support.espn.com/hc/en-us/articles/360040324812-Your-Bracket-Explained)
- [ESPN round scoring and leaderboard](https://support.espn.com/hc/en-us/articles/360040752191-What-s-my-ranking-Leaderboard-Explanation)

Deployment uses the repository's existing Cloudflare Pages flow. Deploy public assets and functions together. Local verification does not establish that production has been deployed.
