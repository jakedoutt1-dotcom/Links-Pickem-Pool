# Public LINKS Playmaker

Published entry: `/new-build/playmaker/`. The previous `/new-build/playmaker.html` entry and existing site links now open this version. The homepage banner links here. This is the public adaptation of the owner's `Links AI/playmaker-redesign` PM-004 project; the original project remains unchanged. Only the browser application, pure domain rules and selected brand/visual assets were copied. Local accounting files, Node server, service adapters, docs, proposals and secrets are not public assets.

## Web gateway

`/new-build/api/playmaker-public?action=config|odds|ai` reuses existing deployment secrets and D1. It does not change the old Playmaker API or NFL Pick'em. Odds go through the existing cached gateway, constrained to one supported league and server-allowlisted categories. Game lines use up to 20 events; player/mixed builds use up to 10 events and exact stat/side filters. Canonical card IDs, source timestamps and league are checked again on the server before AI. Browser prices, labels, odds arrays and client identities are discarded.

AI uses the existing configured model (`PLAYMAKER_AI_MODEL`, default `gpt-5-mini`) with a 2,000-output-token limit, `store:false`, no automatic retries, bounded request/response sizes and a 45-second timeout. Original GPT-5/mini/nano models explicitly use minimal reasoning. Completed output is required; empty top-level output can fall through to nested text. Incomplete output is never shown as a finished answer. This corrects the known output handling/budget weaknesses without claiming to establish the cause of the original PM-004 failures.

Official references: [reasoning and shared output budgets](https://developers.openai.com/api/docs/guides/reasoning), [GPT-5 mini](https://developers.openai.com/api/docs/models/gpt-5-mini).

## Allowances and privacy

`links_playmaker_requests` is created lazily. Each attempt is reserved in one atomic INSERT before provider work. Limits are five per verified account and five per server-observed network address each UTC day; guests use the network allowance. Request IDs are durable duplicate guards. Failed, cancelled or interrupted calls retain reservations. At most one analysis per network and three globally can be reserved in a 70-second window. Daily global attempts default to 100 (`PLAYMAKER_PUBLIC_DAILY_LIMIT`, bounded 1–500). These are request/output limits, not an exact dollar budget.

The ledger contains hashed account/network identifiers, request IDs, status, timestamps, configured model and provider-reported token counters when returned. It does not contain questions, cards, analysis, raw IPs, emails or API keys. Missing DB or trusted edge identity fails closed for AI. Provider failure logs include only bounded HTTP/status/reason metadata. The page makes no AI request on load. Local cards persist in the browser; no account conversation history or billing is added.

## LINKS Live and verification

The existing `home-live.mjs` powers the Playmaker score strip, with refresh, stale status, reduced-motion support and its existing public-data fallback. No pool state is used for this feed.

- `node tests/playmaker-public-api.mjs`: real SQLite/D1-shaped fixture, canonical prices, fixed market queries, quotas/races, consumed failures, duplicate suppression, input/origin validation and output recovery. No real providers.
- `node tests/playmaker-web-browser.mjs`: 320/390/1440px, homepage banner, score feed/refresh, builder, sport/category controls, guide, saved-card history, player prop cards, submitted AI context and plain-text output. No real providers.
- Original project: 102 fixture tests passed before adaptation. This does not certify current provider availability.

Browser captures: `output/playmaker-web/`. Live verification is reported separately after deployment; configuration flags alone do not prove generation or quote availability.

## Permanent owner testing pass

The owner requested permanent paid-tier testing access without a purchase. A complimentary lifetime entitlement is attached to the server-verified owner account in `functions/lib/playmaker-testing-pass.js`, with no expiry. It bypasses the five-attempt account/network limit, not provider service capacity, global concurrency or external API charges. Its records do not consume guest network allowances. Guest requests, body email/paid/testing flags and expired sessions cannot activate it. No payment or paid transaction is fabricated. Playmaker supports the existing verified account cookie or session token and provides a sign-in link returning to Playmaker.

## Build My Bet
The analyst composer offers Conservative, Balanced and Aggressive approaches, singles or 2–8 leg parlays, plus freeform preferences. The gateway loads current canonical markets for the selected sport/book/category, sends bounded candidates, validates exact IDs, distinct events, one book and requested leg count, and returns explanations. Unavailable requests may return no picks with an explanation. The user explicitly chooses View my card before replacing their saved card and opening card.html. No bets are placed. No invented player markets, current statistics, probabilities or guaranteed outcomes. Build requests consume the existing AI allowance; no automatic provider calls. The Cloudflare request compatibility error is fixed; local runtime tests do not prove production provider credentials or billing health.

## Cloudflare AI response fix (PM-WEB-3)
The previous `redirect: 'error'` threw a TypeError in workerd before outbound I/O. Node fetch accepts this option, so earlier Node fixtures missed it. Use `redirect: 'manual'` and explicitly reject all 3xx responses; never follow Location with the API key. Access, rate/billing, request/model and timeout errors now have safe actionable messages, with no provider body or credentials returned. There are no automatic retries.

Regression check using Cloudflare's actual workerd runtime, local D1 and an outbound-service stub (no real provider calls):
```
npm install --prefix tmp/playmaker-runtime-check --no-audit --no-fund miniflare esbuild
node tests/playmaker-worker-runtime.cjs
```
An alternate dependency install can be supplied with PLAYMAKER_RUNTIME_DEPS pointing to its package.json. The test covers successful analysis and Build My Bet, redirect rejection without forwarding the key, sanitized authentication/rate errors, incomplete outputs, durable success/failure records and exactly one outbound attempt per submit.

References: https://developers.cloudflare.com/workers/runtime-apis/request/#constructor and https://developers.openai.com/api/docs/guides/error-codes.

## Matchup grouping
The board shows one card per event, sorted by kickoff. Each card has a sportsbook selector when All available books is selected, with that book’s markets grouped underneath. This preserves quote IDs, odds, source timestamps and card selections while avoiding repeated matchup headings for every book. Pagination counts games, not bookmaker quotes. The global sportsbook and market filters still apply.

## Visual card results
`playmaker/card.html` opens after View my card and from the My play navigation link. Card data remains in existing browser-local storage; the optional AI overview and per-pick reasons are stored in sessionStorage for this tab, never in a URL. The page uses the shared card validator and return calculation, refuses a partially expired card rather than silently recalculating fewer legs, and renders explanations as text. Team monogram badges, leg numbers, market names and large odds make the picks scannable. Reasons and the full AI overview are collapsed. Opening or reloading results generates no AI requests. Storage-blocked browsers stay on the builder with an actionable message if neither transfer method works.

## Builder-first entry
The Playmaker landing page defaults to Build My Bet with visible sport/book and risk/type controls. The full market board and optional calculator are on browse.html, reached through Browse games. card.html remains the saved-card destination; Change picks returns to browse.html. Both entry pages share app.mjs and the existing API, quotas and storage.

## Builder-only experience
The market board and optional calculator are removed from the active Playmaker page. builder.mjs submits explicit build requests with sport, sportsbook, risk, type and preferences. No odds list or board request is made by this UI; the server still resolves fresh candidates before analysis. browse.html redirects old bookmarks to the builder. Results only link back to change preferences/build another card.

## Team logos
Generated pick previews and card results use team-logos.mjs to load the cached public team directory at /new-build/api/playmaker-logos. Supported leagues: NFL, NCAAF, NBA, NCAAB, MLB and NHL. Exact normalized names/aliases map to ESPN team artwork; ambiguous nicknames are omitted, and image errors/unknown teams retain initials. Only HTTPS artwork on a.espncdn.com/i/teamlogos is accepted. The fixed ESPN directory paths use no AI/provider keys and are cached for one day. NFL Pick’em files are unchanged.

## My Cards history
Each completed non-empty build automatically saves a snapshot through card-history.mjs, before the user opens it. cards.html lists Today or This visit with time, sport, approach and pick previews. card.html?id=<opaque UUID> reopens the selected snapshot without an API analysis request. Historical cards validate at creation time and remain viewable after odds age, explicitly labeled saved/not-live. At most 50 snapshots from seven days are retained locally; the interface defaults to the current local calendar day. Storage is browser/device-specific, not account synchronization. Local/session copies merge by UUID so a full/blocked local store can fall back to this tab. No questions are saved, only card output and preferences.

## Sport-specific player categories (PM-WEB-4)
markets.mjs is the shared category/stat allowlist. NFL/NCAAF offer anytime/first touchdowns, passing/rushing/receiving yards, receptions and mixed picks. NBA/NCAAB offer player points, rebounds, assists, made threes, steals, blocks and mixed picks. NHL offers shots on goal, goals, assists, goals+assists points, goalie saves and mixed picks. MLB offers hits, home runs, pitcher strikeouts, total bases, RBIs and mixed picks. MMA retains game lines until additional markets are connected.

Props require an actual player in event.players and the bookmaker's own current price/line; no name is guessed from an ID and no consensus line replaces a bookmaker line. First/anytime TDs are different categories, and hockey points are goals+assists (the provider's `points` stat means goals). No prop data is inferred from generic team totals. The canonical parser and saved-card validator preserve player identity, stat, exact side/line and label. The server restricts candidates to the requested category, requires enough distinct games at one book before spending an AI request, and interleaves candidates across games within a 240-candidate cap. Current multi-leg cards still use distinct games; same-game parlay pricing is not synthesized.

Validation: tests/playmaker-props.mjs covers 46 sport/category combinations, canonical parsing/round trips, invalid metadata, unavailable props before AI, and multi-game coverage. Cloudflare workerd covers a real-fetch/local-D1 prop build with a simulated provider. Browser tests cover responsive dropdown changes, built/saved player props and return math. Bounded live odds-only checks confirmed football TD/yard/reception markets, NBA assists/points and NHL shots/goals+assists; no paid AI probes were sent for this change.

References: https://sportsgameodds.com/player-props-odds-api and https://sportsgameodds.com/docs/data-types/stats.

## Account balances (PM-WEB-5)
Playmaker requires a verified LINKS account. Five daily requests are tracked per account, independently of shared venue Wi-Fi, resetting at midnight UTC. My Account displays free requests, persistent extra credits, total available and the local reset time. Free requests are consumed first; failed/cancelled submissions can use an attempt. The owner lifetime testing pass remains available. Credit grants are server-only and idempotent; checkout is not enabled. Atomic D1 reservations prevent concurrent double spending. Anonymous and legacy AI endpoints cannot bypass sign-in. Card history is scoped to the verified account on this browser; older anonymous cards require explicit import.

## Share cards
Results and each My Cards entry offer Share card. Mobile browsers use the native share sheet (including texting where supported); desktop browsers copy readable picks to the clipboard. A selectable text fallback supports blocked clipboard access. Shared text includes matchup, selection, sportsbook, saved odds and the public builder address. Browser-local archive IDs and account details are never shared. Sharing does not generate an AI request. The recipient can read all selections directly in their message; the builder link opens Playmaker rather than a private local archive.

Sharing also renders a 900px PNG card locally, with a small preview and a download link. Supporting mobile browsers attach the PNG to the native share sheet; other browsers retain text sharing and image download. No image service or AI request is needed.

## Same-game player cards
Builder candidates and output validation now allow several distinct players from one game at the same sportsbook. No repeated player within an event, multiple first-touchdown scorers within an event, duplicate selection or multiple team game lines within an event. Existing return calculation refuses to multiply correlated same-game prices and requires a sportsbook quote. Tests cover a four-player single-game card and incompatible selections with mocked AI.
