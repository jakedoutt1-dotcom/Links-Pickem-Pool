# Party Room billing

All purchasing UI is in `public/new-build/party-room.html`. `party-pack.html` redirects there and preserves return parameters. No new player login rollout is included. Purchasers use the existing email-code account service; guests never need to purchase or authenticate with that account service.

## Products

- Party Pass: USD 4.99, 24 hours beginning at confirmed capture.
- Annual Party Pack: USD 39.99, 365 days, one-time purchase, no automatic renewal.
- Hosted Trivia Night: USD 29.99 per calendar month, recurring PayPal subscription, separate from Party Pack and pool packages. One active room per commissioner account; existing room restart remains available. Guests join free. Use the existing commissioner email.
- No single-game USD 1 option (user deferred it).
- Local three-question solo demo is free and makes no question-provider calls.

Party Pack covers Trivia Rally, Million Point Challenge, Dead Air, Say What?!, Last Alibi, Captain Clash, and Challenge a Friend Trivia. It does not cover hosted Trivia Night or pool games. Creating a room requires an active pass when enabled; joining and play in existing rooms do not. Rooms retain their existing fixed expiration, including rematches; pass expiration does not terminate an ongoing room.

## Complimentary access

LINKS Admin has a separate Party & Trivia access section. Only an authenticated site owner can grant or revoke access. Enter the recipient's email, choose Party Pass / Annual Party Pack / Hosted Trivia Night, select 1–365 days, optionally add a note, and confirm. Defaults are 1 / 365 / 30 days. Recipients verify that same email in the Party Room to restore access. Trivia hosts still require their existing commissioner identity for hosting.

Grants are saved separately in `links_party_grants`, with creation time, expiration, revocation time, note, and a hashed owner-session identifier. Request IDs make retries idempotent. The panel shows up to 200 recent grants and supports exact email lookup. A grant expires automatically; revocation does not remove paid access or end existing rooms. Granting access does not cancel an existing PayPal subscription or its future charges. Complimentary access never makes a payment-provider request.

## Activation

Billing defaults OFF. Do not enable on production until sandbox checkout has been exercised with a real PayPal sandbox buyer. Local tests mock PayPal, email delivery, and purchases. No paid provider calls or production transactions were used in validation.

Existing configuration: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and `PAYPAL_ENV` (`sandbox` for sandbox; otherwise live).

New configuration:

- `PARTY_PACK_ENABLED=true`: requires passes for creation of the seven included games and enables pass checkout.
- `TRIVIA_HOST_BILLING_ENABLED=true`: replaces the old pool-package/free-room allowance for new hosted Trivia Night rooms with the separate monthly subscription. Can be activated independently.
- `PAYPAL_TRIVIA_MONTHLY_PLAN_ID`: an ACTIVE plan belonging to the same PayPal merchant/environment. USD 29.99, MONTH interval 1, REGULAR tenure, unlimited cycles, no trial, no setup fee, no added tax. Checkout fetches and validates these details before creating a subscription. Do not point this at a pool package plan.

The database tables are created by the helpers. `links_party_purchases` is independent of pool purchases and plans. `links_trivia_subscriptions` stores the PayPal subscription mapping. Subscriptions are reverified against PayPal when access is checked; there is no recurring-charge cron job in LINKS. PayPal performs recurring billing. Cancellation retains an already-confirmed paid period; suspension stops new room creation. Hosts cancel recurring billing in PayPal. The production site and test environment must retain separate databases and merchant environments.

PayPal captures are checked for matching order, reference, completed capture, USD currency, and exact server-selected amount. Only the authenticated purchaser can confirm a purchase. Expiry is written once with a conditional update, so return-page retries cannot extend it. Existing CREATED receipts expose Check payment to recover an interrupted return. Card information never enters LINKS.

Operational limitation: one-time pass refunds/reversals are not yet synchronized by webhook. Before a public paid launch, wire verified PayPal refund/dispute events or establish an explicit admin revocation process. This is a rollout prerequisite alongside sandbox checkout, not a claim of completed production billing certification.

## Validation

- `node tests/party-pack.mjs`: local SQLite/D1 fixture; price tampering, authentication, CSRF, pending/incorrect payment rejection, day/year expiry, idempotent return, cookie restore, all seven creation gates, free guest joins, subscription separation/suspension, and unchanged pool entitlements.
- `node tests/party-pack-browser.mjs`: Playwright/Edge; 390px and 1440px, no horizontal overflow, email and checkout return, three-question demo, separate venue card, launch-off messaging. Uses mocked endpoints.
- `node tests/party-grants.mjs`: owner authorization, CSRF, confirmation, email normalization, duration bounds, retry safety, independent host/party grants, expiration and revocation.
- `node tests/party-grants-browser.mjs`: phone admin form, duration defaults, grant history, revoke confirmation and overflow check.
- Existing `trivia-rally.mjs`, `trivia-night.mjs`, and `million-point.mjs` gameplay tests passed with billing off.

Do not stage the entire working tree. It contains unrelated work and a deliberately unreleased login. Release only these changes plus the seven game API imports/create guards and their HTML script tags, the Trivia Night subscription guard/HTML tag, Party Room markup, new billing/UI helpers, and tests.
