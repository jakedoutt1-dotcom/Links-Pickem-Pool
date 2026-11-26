# March Madness bracket challenge

The March Madness page now uses a complete men's 64-team / 63-game bracket. Region and round navigation replaces the old daily-game picker. Players save drafts, predict the championship's combined score, and submit a complete bracket before the first Round of 64 tip-off.

## Open it

- Practice: /new-build/march-madness.html?demo=1
- Pool: /new-build/march-madness.html?pool=POOL_ID
- Admin invitations: Share pool opens the QR code, Copy Invite, and the phone share menu.
- Season: use the tournament-year selector or season=2027.

Without a pool parameter the page is explicitly a practice bracket; practice storage is separate from real entries. Its sample field is not a published upcoming tournament.

## Automatic tournament setup

No commissioner import, seed entry, pairing selection, or publish action is needed. An authenticated visit opens the tournament once ESPN provides all 32 resolved Round of 64 matchups and the NCAA publishes the official regional paths for that tournament year. The waiting page retries every minute while visible. Unresolved play-in placeholders keep entries closed until the field is complete.

NCAA bracket links determine which regional champions meet in each semifinal; pairings are never guessed or copied from a previous year. The first confirmed import is persisted with its first Round of 64 deadline. Manual field/pairing replacements are disabled. Existing saved tournaments and entries remain intact.

Admins can use Share pool before the field opens as well as afterward. It reuses the existing authenticated invitation service: a scannable QR code, Copy Invite, and Share Invite. Each invitee creates their own player name and password. Group invitations expire in seven days and can be turned off from the popup. The same shortcut is available on College Playoff.

## Scoring and storage

Round values are 10, 20, 40, 80, 160, 320 (1,920 total). Maximum possible removes future points for eliminated teams. After the final, equal points are ranked by absolute distance from the championship combined score; equal distances share rank. This is the LINKS tiebreaker rule.

The authenticated /new-build/api/march endpoint derives the player from the pool session, verifies roster membership and the enabled game, validates every bracket path, and enforces the deadline server-side. Whole-bracket saves use optimistic versions. Opponents' entries are returned only after the deadline, and only submitted entries count.

Two isolated tables are created idempotently through the existing DB binding: links_march_tournaments and links_march_entries. No NFL, college football, or legacy March picks are migrated or modified.

ESPN's public basketball scoreboard is queried by individual calendar dates. Tournament notes, rounds, regions, seeds, and team identities drive the import; regular-season, NIT, and First Four games are excluded. Completed results are matched to bracket paths, not feed order. Results refresh on page load or Refresh with a two-minute server cache. On feed failure the response labels its stored tournament snapshot as stale rather than claiming live results. Official corrections in the ESPN feed are reflected on the next successful refresh.

## Verification

Run node --test tests/march.test.mjs with Node 24+ (built-in SQLite). The suite covers advancement, elimination, scoring, tiebreakers, feed mapping, authentication, privacy, full submission, concurrent versions, automatic official pairings, and deadline enforcement.

Run node tests/march-browser.mjs with Playwright available to Node (installed normally or via NODE_PATH). On Windows it uses installed Edge; elsewhere it uses Playwright Chromium. PLAYWRIGHT_CHROMIUM_EXECUTABLE optionally supplies an executable. MARCH_SCREENSHOT_DIR optionally chooses the screenshot directory; otherwise it writes output/march-madness in the repository. Pool APIs in browser tests are mocked, so tests do not touch production.

The 2026 ESPN feed was also checked directly: 32 opening matchups, all 63 games, and correct matching for East–South / West–Midwest national semifinals. Desktop and 390px phone screens were checked, including all 63 selections, draft reload, submission, sample results, read-only bracket comparison, and save-conflict recovery.

## References

- [ESPN bracket flow and result indicators](https://support.espn.com/hc/en-us/articles/360040324812-Your-Bracket-Explained)
- [ESPN round scoring and leaderboard](https://support.espn.com/hc/en-us/articles/360040752191-What-s-my-ranking-Leaderboard-Explanation)

Deployment uses the repository's existing Cloudflare Pages flow. Deploy public assets and functions together. Local verification does not establish that production has been deployed.

Before the field is confirmed, the game page shows a colored bracket with seed placeholders and disabled entry controls. Practice fields contain no school identities. College Playoff follows the same rule, and the dated weekly top-12 panel is hidden until an official field exists. Evergreen game cards use blank colored brackets without team logos or helmets.
