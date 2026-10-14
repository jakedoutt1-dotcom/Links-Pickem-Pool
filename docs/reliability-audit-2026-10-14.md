# LINKS reliability audit — October 14, 2026

## Scope and release review

Reviewed from clean main commit `4dfc536b`, separately from the existing dirty checkout. The original checkout and its unrelated local changes were preserved. NFL Pick’em product code and shared behavior affecting NFL are excluded. No production data, real email recipients, or Cloudflare deployments were changed or polled for this audit. The reviewed release is prepared locally; this report does not imply a push or deployment.

The reviewed production changes are confined to game leaderboard name handling and Hosted Trivia TV layout: `functions/lib/party-scoreboard.js`, `functions/new-build/api/party-scoreboard.js`, and `public/new-build/trivia-tv.{css,html,mjs}`. None are NFL routes or shared NFL runtime code. Other changes update obsolete test expectations and add regression automation.

## Fixes

- Guest scoreboard names now remove markup delimiters and control characters without accidentally stripping ordinary letters or digits. Previously stored damaged names are not automatically reconstructed.
- Hosted Trivia TV layout reserves space for the leaderboard and partner banner. Browser layout checks are required alongside the logic suites; syntax checks alone do not establish visual correctness.
- Test expectations were brought into line with existing NBA availability, solo results, room behavior, grants, and question-provider behavior rather than altering NFL or account runtime logic.

## Automated evidence

`tests/reliability-suite.mjs` contains 50 existing isolated suites: 14 account/admin, 22 games, and 14 non-NFL pool suites. An independent inventory found no missing paths and no Playwright or Puppeteer imports in these selected suites. The GitHub workflow uses Node 24, runs each group separately, and uploads logs even after failures.

Syntax checks passed for the changed leaderboard modules, Hosted Trivia TV module, and regression runner. Final regression run: **50 of 50 suites passed**. The fresh results are saved in `output/reliability/results.json`.

The synthetic concurrency report recorded 105 rooms, 1,800 players, concurrency 100, 9,000 polls, 1,800 answer requests, 1,800 duplicate-answer requests, and 1,800 scoring requests. All returned HTTP 200, no scenario errors were recorded, and exactly 1,800 answers were saved. Duplicate processing did not create additional answers or awards.

## Limits

The concurrency benchmark uses in-memory SQLite and serialized database operations. It does not measure Cloudflare D1 capacity, external question-provider traffic, real network delay, or browser rendering. Recorded synthetic p95 times range from approximately 2.7 to 4.9 seconds; these figures are not a production latency guarantee.

Fixtures exercise recovery and invitation logic but do not certify delivery to actual inboxes. Historical corrupted names, expired game rooms, and real production capacity are outside this release’s proven results. Targeted browser checks passed for account/admin recovery and invitations, phone/desktop NBA and MLB, event pools, March brackets, solo Trivia Rally, Putt Club, game leaderboards, presentation audio/demos and Hosted Trivia TV. Long TV questions with twelve leaders and the partner logo fit at 960×540, 1280×720 and 1920×1080. Squares, Props and Playoffs full player/admin integration checks also passed at 390px and 1280px. This release remains local and has not been pushed.
