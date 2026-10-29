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

The explicit Same-game parlay bet type enforces one event and one sportsbook during candidate eligibility and final output validation. Selecting it defaults Game lines to Mixed picks where supported. Too few compatible selections returns before an AI request is reserved.

## Server-response investigation
A user reported a non-JSON production build response. Anonymous live config returns valid JSON; authenticated production logs were unavailable because the existing Cloudflare session returned 403. No paid AI probe was sent. Candidate capacity checks now retain at most the requested eight legs per book/event rather than repeatedly validating an unbounded growing list. Canonical parsing already checks freshness; the redundant per-row reparse was removed and the requested book is passed directly into normalization. A 2,000-line regression board passes. Browser non-JSON errors show HTTP status and an allowlisted Cloudflare error number, never arbitrary HTML. This hardening does not establish the root cause of the reported production failure.

A subsequent screenshot confirmed a non-JSON HTTP 502 roughly ten seconds after submit. The odds gateway now aborts provider loading after 12 seconds, caps streamed bodies at 8 MiB and caps its in-memory cached text at 8 million characters. Config exposes only the owner’s latest ledger timestamp/status; the browser checks that after a 502 to distinguish attempts recorded at AI reservation from failures before that stage. These changes are locally verified, but no authenticated live reproduction or root-cause confirmation has been obtained.

## Choose game
Same-game parlay now requires a game selection. The verified-account games action returns upcoming canonical matchups and kickoff times without AI. Builds forward eventID to the odds provider and enforce the selected ID again after canonical normalization, since provider event lookups ignore schedule filters. Sport changes reload options; no available games/errors disable building until a game is selected. Regression tests cover Mixed picks with four same-game legs, wrong/missing games before AI and mobile selector behavior. Live NFL mixed odds were fetched successfully (10 events/1,679 normalized selections); no authenticated live AI build has been verified because no signed-in browser is connected and Cloudflare credentials are expired. Provider event lookup reference: https://sportsgameodds.com/docs/endpoints/getEvents.

## Recorded AI failures and structured cards
The latest production screenshot shows a failed AI-reserved attempt, excluding failures before reservation for that submission. Builder output now uses Responses text.format json_schema strict with candidate IDs enumerated, rather than prompt-only JSON formatting. All canonical compatibility checks remain. Safe failure codes/messages persist in a request-keyed table and are returned only with the verified owner’s latest attempt; the browser can recover them through config after a proxy replaces an error body. Distinct format/count/selection/incomplete errors are tested. This is not yet an authenticated live confirmation of the reported 502 root cause. Official format reference: https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses.

## API key configuration audit
The server sends one Authorization: Bearer credential to the fixed https://api.openai.com/v1/responses endpoint, with no redirects or credential fallbacks after rejection. OPENAI_API_KEY retains precedence, followed by PLAYMAKER_OPENAI_API_KEY and PLAYMAKER_AI_API_KEY. Blank values are trimmed before fallback selection; optional pasted outer quotes and an accidental Bearer prefix are removed. Internal whitespace is rejected. Authenticated config reports only the selected setting name, never the key. Provider 401 and 403 now have distinct safe codes/messages and persist through the error diagnostic path. Unit/runtime tests use fake keys and confirm header construction. This audit does not validate the encrypted production key; an invalid/revoked key or account permission issue requires repair in the provider/Cloudflare settings. Official reference: https://developers.openai.com/api/reference/overview.

## Approach-only builder and verified research
AI Pick for Me requires only Conservative, Balanced, Aggressive or Lottery ticket. Server policy sets 2/3/4/6 legs respectively and scans three season-appropriate leagues (NFL/NBA/NHL or MLB/NBA/NHL); sport, book, kind and leg overrides from the browser are ignored. It reuses the verified account allowance, one AI request per submit, canonical odds, one-book compatibility, history, sharing and no-bet behavior. Lottery selection requires quoted +150 or longer odds per leg and is explicitly labeled very high risk, including shared card images/text. Insufficient markets fail before AI reservation. No guaranteed or synthesized probabilities/payouts.

Balanced filters to main lines. Conservative prefers the nearest easier real alternate; Aggressive prefers the nearest harder real alternate within 30% or one stat unit. For unders the harder direction is lower. Where no harder alternative exists, main lines can remain and a saved warning discloses it. Alternate selections carry exact line/price-specific IDs; canonical storage validation preserves them. Lottery uses actual longer-priced quotes rather than multiplying a stat or inventing a price.

Research is loaded server-side from the existing SportsGameOdds /events endpoint, scoped to current teams, the current season, finalized past games and an as-of cutoff. Up to two pages/league, eight teams and three leagues are bounded by deadlines/body limits; partial or unavailable history is labeled. Recent-5/10 are withheld when pagination is incomplete. Zero is a genuine value; missing stats are not imputed to zero. Season statistics are explicitly a recorded-game sample. Opponent allowed statistics use the opposing offense’s recorded team totals; receiving/passing yard props show passing yards allowed. Per-player averages are not confused with team allowance. No league-wide ranking, opponent-strength adjustment, hit probability, injury status or playing-time forecast is invented.

The historical reference uses 50% last-five mean, 30% last-ten mean and 20% season-sample mean only when at least five player results and complete pagination exist. It is labeled descriptive, not a trained/calibrated projection. AI receives deduplicated research with sample sizes, missing fields, exact source and its date; it must compare player history and opposing defense and explain gaps. Pick details retain the evidence in saved cards. Missing current injury/availability and role data are always disclosed until a verified feed is connected.

Tests: playmaker-research.mjs exercises all four automatic approaches, longer-odds gating, real alternate-line round trips, historical samples, opponent identification/allowance and one AI attempt. Responsive browser checks cover approach-only balanced and lottery generation and saved research. Runtime and API regressions use mocked external providers. No new live paid AI call was made for this change. Historical access/coverage depends on the existing provider plan; unavailable data falls back to an explicit unavailable label rather than fabricated research.
References: https://sportsgameodds.com/docs/data-types/stats and https://sportsgameodds.com/docs/guides/data-batches.

Automatic cards are restricted to games starting within 48 hours. Automatic Conservative requires quotes of -150 or shorter, Balanced excludes quotes longer than +150, Aggressive excludes quotes longer than +500, and Lottery requires +150 or longer. These are transparent market-price risk filters, not model-estimated win probabilities or guarantees. Manual categories retain their requested market constraints; inherently speculative categories are not transformed into lower-risk bets.

## Automatic builder result flow
Automatic requests now keep progress, errors, empty-result explanations and cancellation inside the AI Pick for Me box. A successfully archived automatic card opens card.html directly; the custom builder retains its View my card step. Switching back to custom restores its result/status placement. Removed a nonessential scroll call before pick rendering, which could interrupt rendering on browsers rejecting the instant scroll option. Browser regression checks cover automatic navigation, visible provider errors, empty results, cancellation, and switching modes. These UI fixes do not by themselves verify a live provider build.
