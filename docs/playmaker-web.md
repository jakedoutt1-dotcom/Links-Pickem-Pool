# Public LINKS Playmaker

Published entry: `/new-build/playmaker/`. The previous `/new-build/playmaker.html` entry and existing site links now open this version. The homepage banner links here. This is the public adaptation of the owner's `Links AI/playmaker-redesign` PM-004 project; the original project remains unchanged. Only the browser application, pure domain rules and selected brand/visual assets were copied. Local accounting files, Node server, service adapters, docs, proposals and secrets are not public assets.

## Web gateway

`/new-build/api/playmaker-public?action=config|odds|ai` reuses existing deployment secrets and D1. It does not change the old Playmaker API or NFL Pick'em. Odds go through the existing cached gateway, constrained to one supported league, 20 events and six full-game moneyline/spread/total markets. Canonical card IDs, source timestamps and league are checked again on the server before AI. Browser prices, labels, odds arrays and client identities are discarded.

AI uses the existing configured model (`PLAYMAKER_AI_MODEL`, default `gpt-5-mini`) with a 2,000-output-token limit, `store:false`, no automatic retries, bounded request/response sizes and a 45-second timeout. Original GPT-5/mini/nano models explicitly use minimal reasoning. Completed output is required; empty top-level output can fall through to nested text. Incomplete output is never shown as a finished answer. This corrects the known output handling/budget weaknesses without claiming to establish the cause of the original PM-004 failures.

Official references: [reasoning and shared output budgets](https://developers.openai.com/api/docs/guides/reasoning), [GPT-5 mini](https://developers.openai.com/api/docs/models/gpt-5-mini).

## Allowances and privacy

`links_playmaker_requests` is created lazily. Each attempt is reserved in one atomic INSERT before provider work. Limits are five per verified account and five per server-observed network address each UTC day; guests use the network allowance. Request IDs are durable duplicate guards. Failed, cancelled or interrupted calls retain reservations. At most one analysis per network and three globally can be reserved in a 70-second window. Daily global attempts default to 100 (`PLAYMAKER_PUBLIC_DAILY_LIMIT`, bounded 1–500). These are request/output limits, not an exact dollar budget.

The ledger contains hashed account/network identifiers, request IDs, status, timestamps, configured model and provider-reported token counters when returned. It does not contain questions, cards, analysis, raw IPs, emails or API keys. Missing DB or trusted edge identity fails closed for AI. Provider failure logs include only bounded HTTP/status/reason metadata. The page makes no AI request on load. Local cards persist in the browser; no account conversation history or billing is added.

## LINKS Live and verification

The existing `home-live.mjs` powers the Playmaker score strip, with refresh, stale status, reduced-motion support and its existing public-data fallback. No pool state is used for this feed.

- `node tests/playmaker-public-api.mjs`: real SQLite/D1-shaped fixture, canonical prices, fixed market queries, quotas/races, consumed failures, duplicate suppression, input/origin validation and output recovery. No real providers.
- `node tests/playmaker-web-browser.mjs`: 320/390/1440px, homepage banner, score feed/refresh, board, guide, card persistence, Odds Lab, submitted AI context and plain-text output. No real providers.
- Original project: 102 fixture tests passed before adaptation. This does not certify current provider availability.

Browser captures: `output/playmaker-web/`. Live verification is reported separately after deployment; configuration flags alone do not prove generation or quote availability.

## Permanent owner testing pass

The owner requested permanent paid-tier testing access without a purchase. A complimentary lifetime entitlement is attached to the server-verified owner account in `functions/lib/playmaker-testing-pass.js`, with no expiry. It bypasses the five-attempt account/network limit, not provider service capacity, global concurrency or external API charges. Its records do not consume guest network allowances. Guest requests, body email/paid/testing flags and expired sessions cannot activate it. No payment or paid transaction is fabricated. Playmaker supports the existing verified account cookie or session token and provides a sign-in link returning to Playmaker.

## Build My Bet
The analyst composer offers Conservative, Balanced and Aggressive approaches, singles or 2–8 leg parlays, plus freeform preferences. The gateway loads current canonical markets for the selected sport/book, sends bounded candidates, validates exact IDs, distinct events, one book and requested leg count, and returns explanations. Unavailable requests may return no picks with an explanation. The user explicitly chooses Use this card before replacing their saved card. No bets are placed. No invented props, current statistics, probabilities or guaranteed outcomes. Build requests consume the existing AI allowance; no automatic provider calls. The Cloudflare request compatibility error is fixed; local runtime tests do not prove production provider credentials or billing health.

## Cloudflare AI response fix (PM-WEB-3)
The previous `redirect: 'error'` threw a TypeError in workerd before outbound I/O. Node fetch accepts this option, so earlier Node fixtures missed it. Use `redirect: 'manual'` and explicitly reject all 3xx responses; never follow Location with the API key. Access, rate/billing, request/model and timeout errors now have safe actionable messages, with no provider body or credentials returned. There are no automatic retries.

Regression check using Cloudflare's actual workerd runtime, local D1 and an outbound-service stub (no real provider calls):
```
npm install --prefix tmp/playmaker-runtime-check --no-audit --no-fund miniflare esbuild
node tests/playmaker-worker-runtime.cjs
```
An alternate dependency install can be supplied with PLAYMAKER_RUNTIME_DEPS pointing to its package.json. The test covers successful analysis and Build My Bet, redirect rejection without forwarding the key, sanitized authentication/rate errors, incomplete outputs, durable success/failure records and exactly one outbound attempt per submit.

References: https://developers.cloudflare.com/workers/runtime-apis/request/#constructor and https://developers.openai.com/api/docs/guides/error-codes.
