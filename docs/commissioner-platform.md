# Commissioner platform

## Agreed package model

- One free active game-pool slot per verified commissioner email account.
- Plus: $19.99/year, three total slots. Pro: $29.99/year, six. All Access: $49.99/year, ten.
- Slots are totals, not additional allowances. Repeated NFL pools are supported by creating separately named pools. Multiple different games in one pool each consume a slot and share that pool's player roster.
- Players join free. Package charges are for commissioner software access, not entry fees or prizes.
- Annual purchases do not renew automatically. Same-plan renewals extend the expiry. Upgrades start a new year at the selected price; there is no automatic proration.
- Archive releases capacity and preserves data. Restore consumes capacity. After a paid package expires, one selected pool remains writable; other games become read-only. Pre-existing pools are grandfathered during adoption and cannot be used to create additional capacity beyond the allowance.

## Entry points and ownership

`commissioner-hub.html` is the verified workspace. Create Pool and My Pools redirect here. Commissioner-only navigation and admin cards are mounted after `/api/session` confirms the role, independently of browser role flags. Players do not receive Add Pool controls.

Accounts use expiring, rate-limited email codes and hashed session tokens. Gmail dots, plus aliases, and googlemail.com map to one identity. Verification imports existing pool ownership using commissioner email, then stores an immutable owner mapping. A pool session alone cannot claim another account's pools. Using another device or clearing local storage cannot reset the allowance. Multiple genuinely separate email addresses cannot be completely prevented by email verification alone.

Capacity reservations use an atomic SQL check. Creation batches pool/player/game/ownership records together. Failed creations release reservations. Historical commissioner purchase records appear in the workspace; old test-mode `pool_service` flags are not treated as payment receipts.

Old pool creation, game-add, game-instance creation, and unverified checkout/switch routes are retired. Legacy game-list reconciliation cannot reactivate account-managed archived games. API middleware rejects writes to archived, disabled, or expired slots.

## Data and deployment

The new account tables use the existing `DB` binding and are created additively by `ensureAccounts` on first use. No existing picks, standings, or player records are deleted by the account migration. Archive changes game availability only. Verification and welcome messages reuse the existing email service. Checkout uses the existing PayPal environment variables; no credentials are stored in the client.

New game entries for Survivor, Confidence, Game 33, March Madness, Golf, NASCAR, and Custom use `links_game_entries`, never NFL tables. Options use `links_game_options`. Existing unscoped browser caches are not imported into another player or pool. Golf/NASCAR/Custom setup is available from the workspace after switching to the proper commissioner session.

## Validation

- `tests/commissioner-account.cjs`: real in-memory SQLite; verification/replay/guess limits, ownership, one-free and paid capacity, repeated NFL pools, mixed games, archive/restore, expiration, rollback, mocked PayPal amount/capture verification, and old route retirement.
- `tests/commissioner-controls.cjs`: player versus commissioner UI, including forged browser role.
- `tests/commissioner-hub-ui.cjs`: mobile/desktop verification, package wording, pool form, errors, no password persistence, and layout.
- `tests/office-entries.cjs`: authenticated game isolation, kickoff validation, confidence values, commissioner options, and configured deadlines.
- Existing NFL selection, privacy, standings, admin/email, homepage routing, and College API/UI tests were run with fixtures.

No production email, payment, database mutation, deployment, or push was performed during implementation. Live email verification and PayPal sandbox checkout/return need deployment verification. The checkout return can be retried from purchase history; this implementation does not add a refund/chargeback webhook.

## Remaining game-specific work

This is not certification of every older game's scoring engine. The Fantasy page still contains local roster/placeholder draft, trade, and league views and is excluded from new paid-pool creation. Squares, Dynasty, Props, and Playoffs do not have complete current-build routes and are not offered as new games. Existing legacy records are retained.

The older games' full scoring/results experiences need separate end-to-end validation: Survivor elimination progression, tournament bracket advancement, and Golf/NASCAR standings are not implemented by the commissioner package system. The working NFL and standalone College flows remain separate. Do not advertise unfinished game modes as fully operational.

## Shared pool tabs
Game and admin pages loading shell.js show server-authorized pool tabs below the header. Commissioners with a verified account see owned pools and Add Pool / Game. Players explicitly link each authenticated pool membership to their verified email using Connect my pools. Identical player names and unverified contact emails never grant cross-pool access. Linking another pool requires signing into that pool once. New pools do not copy players.

The additive links_player_memberships table binds pool/player to verified account email; an existing binding cannot be overwritten. Switching rechecks membership and global access, issues a target-scoped session, replaces local pool/player context, clears transient week/Playmaker state and navigates to the sole game's page or the multi-game control center. Weekly pending eligibility remains governed by the game's existing controls. Verification codes use neutral LINKS wording for both players and commissioners.

Validation: node tests/pool-switcher.cjs; node tests/commissioner-account.cjs; Playwright tests/commissioner-controls.cjs. No live emails, production database changes, or deployment were performed during validation.

## Remembered sessions and sensitive changes
Player and commissioner sign-in now offer Remember me on this device (selected by default). Unchecked sign-in stores authentication keys in sessionStorage for the current tab and caps server sessions at 12 hours; remembered sessions retain the 30-day maximum. Pool creation/opening/switching cannot extend the originating account/session expiry. Temporary login clears existing homepage shortcut cookies and does not offer remembered shortcut creation. Browser session restoration can restore tab storage, so Sign Out remains the dependable way to end access on a shared device.

session-security.js loads before page scripts and routes only known authentication keys through tab storage in temporary mode. Existing pick caches and unrelated preferences retain their prior storage behavior. The same module presents a masked password dialog only when the API returns REAUTH_REQUIRED; credentials are not saved.

Both API middleware chains enforce fresh commissioner password verification for password resets, bulk password operations, commissioner transfers, and changed commissioner contact email. Unchanged email settings and weekly player activation do not require confirmation. Verification attempts are limited to five per pool/player per 15-minute window using links_reauth_limits. No production records were changed during development.

Tests: session-security-api.cjs (real in-memory SQLite), session-security-ui.cjs (browser storage and confirmation/cancellation), commissioner-account.cjs, pool-switcher.cjs, commissioner-hub-ui.cjs, nfl-admin-api.cjs.

## Season standings performance
All-Time / Year Standings now uses one authenticated season-standings request. It performs pool/session checks and five bulk pool reads, then loads only weeks with entries and weekly activation (up to four score requests concurrently). It shares the weekly gradeWeek calculation, including corrections, tiebreakers and Pending exclusions. Only public schedule data is cached for 60 seconds within a worker; rejected fetches are removed and pool-specific corrections are applied to copies. No player totals or eligibility are cached. The page no longer waits for the current-week feed, and refreshes once a minute while visible. Partial upstream failures are explicitly marked incomplete. This optimizes the existing season scope; it does not invent historical seasons or alter saved results.
Validation: tests/season-standings.cjs, tests/season-standings-ui.cjs and all 22 weeks in tests/nfl-standings.cjs.
