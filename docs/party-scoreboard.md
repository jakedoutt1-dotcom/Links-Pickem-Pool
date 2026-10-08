# LINKS Party Pack Scoreboard

Entry: `/new-build/party-scoreboard.html`, linked from Party Room and all seven included games.

- Overall ranking: wins, shared rank for equal wins.
- Per-game ranking: personal best score; games played and wins shown separately.
- Periods: Monday-midnight America/Chicago week, Central calendar year, all time.
- Results start on deployment. No reconstruction of expired historical rooms.
- Only completed multiplayer games count; guests remain free and solo games are excluded.
- Last Alibi uses the case outcome (cooperative investigators, or murderer versus investigators). Dead Air ranks final transmitter progress, then points. Trivia uses final winner lists when supplied; other games use highest final score. Shared winners each receive a win.

## Persistence and identity

`functions/lib/party-scoreboard.js` owns the registry and outcome rules. Each room's version-checked write and result inserts execute in the same D1 transaction. Results are uniquely keyed by game, room, round, seat. Capture terminal state before rematch/leave so it survives both. Scores never come from client requests.

Guest results store a hashed seat identity, not a public name. The scoreboard uses the existing verified-email account session, NOT the postponed unified player login. Players opt in on the scoreboard and prove each seat by possession of its private room token on that device. One account may claim only one seat in each room. Names do not link accounts. Existing opted-in players automatically link new seats when signed in; failed linking never blocks play.

New D1 tables are created lazily: links_party_results, links_party_score_profiles, links_party_score_seats. The game polling path adds no scoreboard schema queries unless committing a completed result. Room expiry does not remove saved results.

## Future games

Add an explicit entry and outcome rule to SCORE_GAMES. Capture partyFinish after advance and pass it to savePartyRoom with the final state, or append partyResultStatements to an existing atomic room-write batch. Add rememberPartySeat in the authenticated player response handler and a scoreboard link. Tests must cover completion, rematch, failed version checks, and solo exclusions. Do not include a new game before defining what a win means.

## Validation

`node tests/party-scoreboard.mjs`
`node tests/party-scoreboard-browser.cjs` (Playwright with Edge)
Existing game suites: trivia-rally, friend-challenge, million-point, dead-air, say-what, last-alibi, captain-clash.

Scores are friendly records, not normalized competitive ratings: difficulty, game mode and room size affect point totals. Overall wins avoid summing incomparable points.

No billing flags or new login launch settings are changed by this feature.
