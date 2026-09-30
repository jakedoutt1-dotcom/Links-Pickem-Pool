# Demo layout review — September 30, 2026

Scope: improve secondary game layouts and practice demos, and add Golf/NASCAR event formats. NFL Pick’em and March Madness remain unchanged reference layouts, including NFL Admin. Existing Golf/NASCAR entries remain accessible in the previous-event section.

## Research and decisions

Public product pages, sample reports, help pages, and the Golf Pools Pro visible leaderboard were reviewed. These are not authenticated end-to-end competitor audits. Recommendations below are LINKS design decisions, not claims that competitors have identical rules.

| Game | Layout/control decision | Reference |
| --- | --- | --- |
| College | Keep matchup cards together, identify the commissioner-selected slate, separate saving from results. | [RYP college help](https://help.runyourpool.com/en/collections/3970404-cfb-college-football) |
| Confidence | Keep each confidence value next to its pick; show an entry review and points-based standings rather than generic win/loss columns. | [RYP confidence sample report](https://www.runyourpool.com/samples/confidence/poolwide_stats.cfm) |
| Survivor | Promote alive/eliminated status and lives lost; preserve a separate history view. | [RYP pool controls and reports](https://help.runyourpool.com/en/collections/3970517-general-settings-questions) |
| Game 33 | Emphasize the season assignment and weekly result/rollover, not a weekly picking form. Preserve LINKS’ existing exact-33 rule. | [FootballPool 33 overview](https://www.footballpool.app/nfl-33-pool/) (search excerpt; direct page fetch failed) |
| Squares | Keep the board primary. Review selected squares and cost before irreversible save; keep matching quarter-winner panels. | [RYP sample grid and winners](https://www.runyourpool.com/PGA-Golf-Squares-Pools.cfm) (grid presentation reference, not football scoring) |
| Props | Short question cards, obvious selected answers, separate save and sample grading. | [OfficeFootballPool formats](https://www.officefootballpool.com/all-in-fantasy-football) |
| Playoff | Identify the active round and points per correct pick above the card. Do not substitute a power-ranking game for LINKS’ round picks. | [RYP playoff scoring configuration](https://help.runyourpool.com/en/articles/9264952-nfl-playoff-power-ranking-faq-s) |
| Golf | Lead with the tournament and golfer selection, with golfer/score columns in the standings. | [Golf Pools Pro](https://www.golfpoolspro.com/) (public leaderboard visually inspected) |
| NASCAR | Lead with race context and driver identity; report finishing position instead of football win/loss columns. Offer simple finishing-position pools and a five-starter/garage format inspired by Fantasy Live. | [NASCAR gameplay](https://support.nascar.com/044876-Getting-Started) |
| Fantasy | Distinguish lineup, player directory, draft, matchups, and trades. | [Sleeper fantasy](https://sleeper.com/fantasy-football), [trade view](https://support.sleeper.com/en/articles/9701146-welcome-to-a-new-trading-experience) |
| Dynasty | Keep the roster emphasis, but identify rookie drafts and season-to-season continuity. | [Sleeper dynasty](https://support.sleeper.com/en/articles/1960098-introduction-to-dynasty-leagues) |

## Implemented demo changes

- Compact game header and contextual status above selections.
- Entry review beside the board on desktop and below it on phones.
- Save, edit, and show-results are separate actions. Squares saves require confirmation and stay locked until demo reset.
- Selected picks remain labeled; supported matchup results show winner/loser colors.
- Sport-specific standings for Confidence, Survivor, Props, Playoff, Golf, and NASCAR.
- Separate Fantasy/Dynasty player directories and draft boards rather than repeating the lineup view.
- Explicit sample data throughout; no new promises about real scoring integrations or commissioner capabilities.

Validation: `tests/game-demos.cjs` covers all 13 demos at 390 and 1280 pixels, saving, results, reset, tab navigation, overflow, unchanged local/session storage, and absence of pool API requests. Demo fixtures remain deliberately small; this does not turn them into complete multi-user seasons.

## Real games and limits

Shared responsive styles cover College, Confidence, Survivor, Game 33, Squares, Props, Playoff, Golf, NASCAR, Fantasy and Dynasty. Golf adds pick-N/count-best, tiered selections and one-and-done earnings. NASCAR offers finishing-position totals or five starters plus a garage driver, with usage limits. These are LINKS formats, not exact competitor clones. NASCAR bonus matchup picks are not included.

Golf and NASCAR results require commissioner verification; these changes do not add automatic live scoring. NASCAR garage closure uses the configured deadline or the commissioner’s close control, not a live stage feed. New event records use separate additive tables; legacy saved entries are preserved. Their new demos share the real selection/rendering code and use memory-only sample data.

References for Golf formats: https://www.golfpoolspro.com/rules and https://help.easyofficepools.com/article/97-most-popular-pick-6-use-4-setup-explained .

Validation includes event scoring/API permission and privacy tests, both event demo layouts at 390/1280px, commissioner-only setup, and existing football, college, pool-format, fantasy and bracket suites.
