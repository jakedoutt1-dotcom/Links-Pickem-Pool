# LINKS site audit — October 20, 2026

## Scope and coordination

The lead coordinated three workers covering accounts/invites/admin, non-NFL pools, and Game Room games. The lead checked homepage scores/navigation, workbook downloads/results, pricing/access, partner assets, and integration. Prior unpushed pool-availability and free Two-Minute Drill work was preserved.

NFL Pick'em game pages, rewrite modules, pick-save API, football feed, and football scoring core were left unchanged. No production records, real payments, email sends, or Cloudflare checks were performed. These are local results, not a deployment certificate.

## Confirmed product fixes

- Barnes Pool Results now cancels a stalled request after 12 seconds. Refresh becomes available again, previously displayed picks/results remain visible, and a retry can succeed. A browser regression simulates the timeout and recovery.
- Last Alibi TV spectators no longer see the purchase-help block that consumed about 100 pixels of the evidence board. Full cooperative phone/TV play passed, with an assertion covering available evidence space. Player purchase help remains available.
- The venue presentation's entrance animation extended content 6 pixels past a 390-pixel phone viewport. The animation distance now stays inside its mobile gutter; its regression checks the first animation frame and every presentation slide.

## Verification

- Accounts/admin worker: 15 suites passed, including three mobile login flows. Covered setup/recovery, role preservation, invitation authorization/expiry, session revocation, cross-pool isolation, owner permissions, and rejected cookies.
- Pool worker: 28 suites passed, including NBA, MLB, College, Squares, Props, Playoffs, March, Golf, NASCAR, Survivor/Confidence, Game 33 internals, and Fantasy/Dynasty fixtures. Phone and desktop browser coverage included current admin navigation.
- Game worker: 32 core/API suites and seven focused browser suites passed. Covered Poker privacy, actions, continuation, late/rebuy flows, multiple TV tables and mobile controls; Hosted Trivia submission, team scoring, Fair Play and closure; Last Alibi cooperative play/recovery; Dead Air flow/recovery; Putt Club courses, controls and rooms; and leaderboard handling.
- Lead checks passed for homepage routing and live-score recovery; complete Windows/Mac downloads and private download authorization; workbook public standings/scoring; pass prices, activation, grants and ownership; partner uploads/GPS; chat unread permissions; commissioner setup; welcome dismissal and room switching. Barnes timeout recovery passed on top of its phone/desktop board checks.
- Static scan of 67 non-NFL HTML pages checked 913 local file references: no missing local targets. This does not verify external image CDNs.
- Updated outdated College, Golf/NASCAR, Fantasy and Game 33 browser tests to use actual admin tool buttons. Updated a Dead Air fixture to include the answer options its reveal flow now requires. No forced hidden-control clicks were introduced.

## Remaining limits

- Fantasy/Dynasty remain Coming Soon: automatic player stats need the Tank01 subscription/key integration; player-directory commercial licensing must also be resolved. Fixture passes do not remove these launch blockers.
- The older standalone Hosted Trivia browser fixture still times out during setup. Its attempted partial updates were removed; current Hosted Trivia API/team/submission/closure tests pass. This is an unresolved test-fixture gap, not proof of a production failure or complete end-to-end hosted-browser certification.
- Real inbox delivery, current provider credentials/data availability, physical-device sound, TV hardware, and production load were not certified.
- An existing NFL combined-test HTTP-status mismatch and the pre-existing `tests/nfl-admin-ui.cjs` working-tree change were left alone under NFL protection.

Changes are local and not pushed by this audit.
