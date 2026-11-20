# LINKS website audit, November 20, 2026

The audit covered the current public site, player and commissioner controls, active sports pools, Game Room games, Playmaker, workbook results and downloads, venue pages, and partner controls.

Confirmed failures repaired

- Changing a LINKS password keeps the selected pool and its renewed role and session. A regression first reproduced the previous switch to the first connected pool.
- NFL deadline editing waits for the selected week to load. Older responses cannot reset the current form. Read failures expose a retry, and saves retain the intended week.
- The legacy football score service retains saved final results through a provider regression. The original handler threw a ReferenceError when a final snapshot existed. The test reproduces that failure and verifies NFL and College recovery.
- Poker phone and TV layouts account for the shared site navigation. The TV standings and phone controls remain within their supported viewports.
- Hosted Trivia phone navigation keeps the live question area within reach while retaining touch-sized controls.
- Removed-game shortcuts and scores are excluded from the current Game Room and public leaderboard.

Verification evidence

- All 81 current public page routes were fetched from production, including the five Coming Soon routes and the 13 active shared score tickers.
- The source link scan checked 1,340 local page and asset references without finding a missing local target.
- Account tests cover login rollout, profile changes, recovery, multiple pools, session renewal, owner permissions, invitations, and pool isolation.
- Sports browser flows cover College, NBA, MLB, Home Run, Golf, NASCAR, Squares, Props, Playoffs, Confidence, and Survivor at phone and desktop widths. Database lifecycle checks cover setup, entries, deadlines, results, and reload.
- NFL checks cover per-game locks, saved picks, player isolation, manual lock and unlock, historical weeks, standings, weekly recap, final-score snapshots, correction approval, and delayed commissioner deadline requests.
- Playmaker checks cover three screen widths, account allowance, sports and game filters, same-game builds, card popups, saved cards, sharing, cancellation, odds and sportsbook links.
- Poker browser checks cover 320, 375, and 390 pixel phones, landscape, desktop, and 720p and 1080p TV. Complete tournament simulations include 360 players, card privacy, cryptographic shuffles, table consolidation, elimination, rebuys, and chip conservation.
- Workbook checks cover public standings, live results, Windows and Mac packages, password-protected downloads, browser receipts, and owner download activity.
- Venue and partner checks cover promotion pages, signup links, flyers, shared scoreboards, access, and layouts.
- The local concurrency run used 105 isolated rooms, 1,800 players, and 100 simultaneous handlers. All 14,400 status, answer, retry, and scoring requests succeeded, with all 1,800 answers saved and scored once.

All 94 maintained regression suites passed. The maintained regression suite now includes NFL and additional active game and pool coverage. Browser fixtures that still expected retired layouts, older login rules, or incomplete save receipts were corrected to exercise the current controls.

Verification limits

Production email inbox delivery, paid transactions, real sportsbook app handoffs, physical phone and TV behavior, and production load capacity require live external-system checks. Browser integration tests use isolated accounts and provider fixtures. The concurrency result describes the local handler test.

Raw logs and screenshots are retained under output/fullsite-nov20, output/accounts-nov20, output/reliability, and output/scale-readiness.
