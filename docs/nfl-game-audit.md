# NFL game-flow audit — 2026-09-29

This audit covers the current new-build pages and the older API routes they coexist with. Changes are local until deployed.

## Rules researched

| Format | Reference and expected flow | Links behavior |
| --- | --- | --- |
| NFL Pick’em | [OfficePoolStop rules](https://officepoolstop.com/rules): pick game winners before the pool deadline; score final results and resolve ties according to published pool rules. | Preserves Links’ first-kickoff weekly lock and existing scoring/tiebreaker. Added authenticated ownership, authoritative matchup validation and deadline checks to the older per-pick adapter. Commissioners retain authenticated correction access. Shared/projection adapters now use the existing kickoff privacy gate. |
| Survivor | [OfficePoolStop Survivor](https://officepoolstop.com/Rules-Survivor-Pool): weekly selection, lives/elimination, missed-week handling and optional no-reuse/tie variants. | Server-derived history, elimination, missed weeks, no team reuse across a season, and selected-game kickoff locking. Default one life and ties lose; existing legacy lives/tieSurvives settings are read. The first saved pool week starts the competition unless startWeek is configured. Results that are missing or pending cannot silently advance a player. |
| Confidence | [SimplySportsWare](https://www.simplysportsware.com/how-to-run-a-confidence-pool): rank N games uniquely 1–N; correct picks earn assigned points. | Working weekly standings plus season totals, final-only weighted grading, rank swaps before kickoff, server hydration and conflict detection. A zero rank is an unfinished draft worth zero. Each matchup locks its selection and rank at kickoff. Ties earn zero; equal totals share a rank. |
| Game 33 | [RunYourPool NFL 33](https://help.runyourpool.com/en/articles/9264884-nfl-33-faq-s) and [EasyOfficePools](https://www.easyofficepools.com/nfl-33-pool-rules-templates-online-management/): exact final score 33, with assignment variants. | Preserves Links’ existing one-team-per-season draw and existing fee/payout records. New page now uses the established assignments, Active/Pending access, final scores and history. Retired the erroneous weekly-choice adapter. Finalization rejects empty schedules, already-final weeks and skipped earlier weeks. |
| Squares | [Super Bowl Squares](https://www.superbowlsquares.org/how-to-play): 10×10 board, randomly assigned digits, cumulative Q1/half/Q3/final scores. | Fixed early quarter/final awards, including overtime. Validates digit permutations. Claims/releases/draws close at kickoff; payment and deletion actions are scoped to the signed-in pool. The new Squares page now supports creation, player claims/releases, number draws, payment tracking and quarter winners. |
| Playoffs | [OfficePoolStop bracket rules](https://officepoolstop.com/Rules-Playoff-Bracket-Pool): a full pre-tournament bracket is distinct from weekly round picks. | Links’ legacy format is weekly postseason picks, not a reseeding bracket. Enforces postseason weeks, real matchups, full slate and first-kickoff lock. The new Playoffs page now supports round pick cards, commissioner round weights, kickoff locks and standings. |
| Super Bowl Props | [OfficePoolStop props rules](https://officepoolstop.com/Rules-Prop-Bet-Pool): configured questions, pre-event answers, commissioner grading. | Legacy entry route requires configured questions, complete nonblank answers and a valid deadline. Official answers are removed from player settings responses. The new Props page now supports multiple-choice setup, entry deadlines, answer sheets, official grading and standings. |
| Fantasy / Dynasty | [Sleeper league formats](https://support.sleeper.com/en/articles/3537396-league-types-formats), [startup/rookie drafts](https://support.sleeper.com/en/articles/3200535-how-to-create-a-supplemental-draft), [lineup scoring locks](https://support.sleeper.com/en/articles/3473234-why-was-someone-able-to-drop-their-starter-after-they-have-played): draft, legal weekly lineup, waivers/trades, stat scoring; Dynasty retains rosters between seasons. | Replaced the local preview with shared Fantasy and Dynasty leagues, drafts, weekly lineup locks, waivers, accepted trades, playoffs and season archives. Both are enabled for creation. Player scores remain commissioner-verified; automatic scoring and scheduled waivers are not connected. See [the detailed comparison](fantasy-dynasty-comparison.md) for the implemented flow and boundaries. |

The external references describe variants; they do not replace the pool’s existing money amounts or configured rules.

## Storage and compatibility

- Survivor and Confidence retain existing links_game_entries rows, with explicit season/type/week periods.
- links_football_versions provides atomic compare-and-save revisions so a stale device cannot replace a newer card.
- Old single-pick clients are still validated through the same football service.
- Game 33 reads pool_33_* records. The erroneous weekly-choice links_game_entries records are retained but are not treated as season assignments.
- Legacy special_game_period_entries and new-build links_game_entries remain separate histories. No automatic merge guesses at season ownership or player intent.
- Legacy Game 33 and special-game tables do not provide complete multi-season archival. Do not reuse an old season as a new competition without explicit rollover/migration.
- NFL Pick’em and all non-NFL entries retain their existing storage.
- Missing ESPN results fail closed for saves that depend on them. Cancelled/postponed games without settled results remain pending; exceptional commissioner rulings are not invented.

## Verification

Automated database/API tests cover auth, pool ownership, unchanged NFL data, confidence rank uniqueness/swaps, stale revisions, final-only scoring, Survivor losses/ties/missed weeks/reuse, kickoff locks, Squares quarter/final boundaries and overtime, and Game 33 finalization order.

Isolated browser tests exercise Confidence save/reload/standings, Survivor picks/history, Game 33 assigned-team display, and live 33 not being marked a winner at 1280px and 390px. Existing NFL selection, privacy and administrative tests are also run. These tests do not certify production database state or deployment.
