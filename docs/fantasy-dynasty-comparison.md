# Fantasy and Dynasty implementation / platform comparison

Reviewed 2026-09-29. This is a comparison of eight established platforms, not an exhaustive survey of every fantasy website. No commercial service has universal rules; the choices below are published as Links league rules.

## Research and decisions

| Platform / primary source | Relevant flow | Links implementation |
| --- | --- | --- |
| [ESPN lineup locks](https://support.espn.com/hc/en-us/articles/360000977452-Lineup-Lock-Times) | Configurable roster deadlines. | Individual-player kickoff locks, server-enforced; frozen weekly lineups and authoritative NFL schedule checks. |
| [Yahoo waivers](https://help.yahoo.com/kb/SLN6811.html) | Waiver windows and priority rules. Search-indexed official summary reviewed; direct page returned 429. | Explicit commissioner-opened FAAB windows, hidden pending bids, conditional drops, rolling-priority ties and one-time processing. |
| [Sleeper waivers](https://support.sleeper.com/en/articles/3978868-waivers-for-regular-season-playoffs) and [taxi squads](https://support.sleeper.com/en/articles/3640482-how-do-taxi-squads-work) | Acquisition windows, player locks, protected development spots. | Kickoff locks; 24-hour dropped-player waiting period; rookies/second-year taxi eligibility; taxi additions close at the first kickoff of the league's opening week. |
| [NFL official rules, 2023 edition](https://static.www.nfl.com/league/apps/fantasy/media/rules/OfficialRules2023.pdf) | Historical primary reference for game-time player availability. Not treated as the 2026 rules. | Blocks free-agent acquisitions and drops after that player's kickoff until the next active week. |
| [CBS Commissioner FAQ](https://www.cbssports.com/fantasy/football/games/commissioner/frequently-asked-questions) | Custom drafts, schedules and transaction rules. | Commissioner setup follows Links membership and pool administration. |
| [Fantrax formats](https://www.fantrax.com/) | Separate redraft, keeper and dynasty formats. | Distinct Fantasy and Dynasty pages; Fantasy clears rosters on renewal, Dynasty retains them. |
| [MyFantasyLeague features](https://home.myfantasyleague.com/features) | Startup/rookie drafts, future-pick trades and salary/contract options. | Snake startup; linear rookie draft; tradable picks through three future seasons; optional basic salary caps and contract expiration. |
| [Fleaflicker Dynasty](https://www.fleaflicker.com/help/how-do-you-play-dynasty-fantasy-football) | Multi-season rosters, rookie drafts, taxi squads and future picks. | Retained franchise ownership, archived seasons, rookie-only selections and owner-approved asset transfers. |

The NFL player directory uses the [documented, read-only Sleeper API](https://docs.sleeper.com/), cached daily. A read-only live check found 3,233 eligible directory records, including 32 defenses. That verifies directory availability, not automatic scoring or production deployment.

## Links flow

1. Create a Fantasy or Dynasty game using the existing package/slot system.
2. Sign in through the existing pool login. Each registered member creates one team; commissioners can assign registered owners.
3. Set roster size, starting positions, Standard/Half PPR/PPR, FAAB, playoff field and optional salary cap. Load the NFL directory.
4. Open a shared, untimed snake draft. Only the current owner or commissioner can select; duplicate ownership and capacity violations fail. The commissioner can skip a pick. The draft view refreshes while idle.
5. Start at the selected NFL week. Set weekly starters. FLEX accepts RB/WR/TE; SUPERFLEX also accepts QB. IR and taxi players must be activated before starting.
6. Add/drop, submit private waiver claims, or negotiate trades. Both owners consent before commissioner review when enabled. Final execution rechecks assets and roster capacity atomically.
7. The commissioner verifies individual fantasy scores with a source/reason. Totals and standings calculate from weekly starting lineups. Every starter needs an explicit verified score, including zero, before finalization.
8. Advance weeks, carry lineups forward, and seed playoffs. Playoffs reseed; tied playoff games advance the better regular-season seed.
9. Archive the completed season and renew. Redraft clears rosters. Dynasty retains players and traded future picks, expires enabled salary-cap contracts, and opens a rookie draft.

Free-agent contracts are one year at $1 when salary caps are enabled; waiver contracts are one year at the winning bid with a $1 minimum. Startup/rookie contract terms are entered at selection. No real payments are collected by these controls.

## Boundaries compared with the larger platforms

- **Player scoring remains commissioner-verified.** No reliable automated player-stat integration is connected. The older name-based scoring parser is not used for these new leagues. Missing scores are never treated as verified zeroes.
- Waivers are opened and processed by the commissioner. There is no background scheduled waiver worker.
- Drafts are untimed. No automatic picks, auction draft, rankings or projections.
- No IDP, multi-team trades, league chat, external-platform import, contract extensions/RFA/franchise-tag system, or arbitrary scoring category editor.
- Dynasty trades, cuts and reserve moves work in the offseason; free-agent acquisitions/waivers operate during the active season.
- Rules freeze at the startup draft. No silent midseason rule changes.
- Legacy import explicitly maps existing Links owners and player names to unique directory IDs. It fails on ambiguous players and preserves the original tables. It imports teams/rosters, not prior season scores or unfinished legacy transactions.
- Cancelled games or conflicting provider schedules require investigation; missing events never unlock already-started players.

## Storage and verification

The authenticated API stores separate Fantasy/Dynasty league documents in pool_settings, using atomic compare-and-save revisions. Teams, rosters, lineups, draft selections and transaction state commit together. Renewal archives the completed season in the same database batch. Archived games reject writes.

Database-backed tests cover draft order/ownership, duplicate players, position eligibility, kickoff locks, private bids, failed conditional claims, budget deductions, accepted trades, traded rookie picks, IR/taxi, missing scores, playoffs, retention, archives, stale-device races, cross-pool access and archived games. Browser tests exercise both pages at 1280px and 390px. These isolated tests do not certify production account/data state.

Local source changes are not a deployment.
