# LINKS-hosted College Playoff Challenge

Public join link: `/new-build/cfp.html?event=links`. Featured on the home page, Locker Room, and college playoff page. The normal College Playoff game remains available for commissioners to create their own independent pools.

One dedicated shared pool is initialized per current college season. It never reuses or modifies an existing private pool. Each verified LINKS account joins once and owns one bracket. Pool-only legacy credentials do not substitute for an account. Signup and login return directly to the public event. Joining automatically unlocks picks for this event only; private pools retain commissioner-controlled access. The normal official field and first-kickoff deadline still apply.

LINKS Owner Admin → LINKS Playoff Challenge opens the host view. This uses the existing site-owner authentication, never first-visitor ownership or a shared commissioner password. Other commissioners cannot claim or administer the shared pool. Host management credentials cannot submit an entry; the host joins separately with a player account to compete.

The event has a public share link, native phone share, and QR code. Private pool QR invites remain separate. No prizes or sponsors are advertised before they are confirmed.

Players joined counts registered members. Brackets entered counts fully submitted entries. Counts belong to the selected pool and update after an entry is saved and every 30 seconds while the page is visible. Counter polling does not replace the bracket or erase unsaved choices.

Storage: `links_hosted_cfp_events` maps one pool to each season; `links_hosted_cfp_members` maps a hashed verified account email to one canonical player. Emails and account hashes are never included in public responses. Display names have short stable suffixes to keep same-name accounts distinct. Existing CFP tables store the bracket and scoring.

The Locker Room revalidates the current account and connected pools after a browser Back/forward-cache restore. It clears stale headings while refreshing; an expired account session returns to LINKS login instead of falling back to a different saved pool user. Profile dialogs are cleaned up when remounted.

Checks: `tests/hosted-cfp.mjs`, `tests/hosted-cfp-browser.mjs`, existing CFP browser/lifecycle tests, login/signup return tests, Locker Room return tests, and account/pool regressions.

## Validation on November 27, 2026

A user-authorized real signup email was delivered and its six-digit code was successfully confirmed against production. The test account could read its signed-in account, sign out, sign in with its password, and sign out again. No existing pools or picks were changed. Personal test credentials and the code are not committed.

`node tests/load/signup-hosted-cfp.mjs` passed 500 synthetic account workflows at 250 in-flight requests: 4,600 successful requests, 500 simulated verification deliveries, 500 simulated welcome deliveries and 500 saved brackets in about 19.3 seconds. Duplicate joins did not duplicate membership, and sampled private entries belonged to the correct accounts. Local p95 request times: signup 3.08s; password signin 3.14s; joins 0.263s; draft saves 0.895s; submissions 0.927s. This uses production handlers against queued in-memory SQLite, simulated email responses and sports feeds. It does not establish Cloudflare production capacity or real email-provider throughput. Report: `output/scale-readiness/signup-hosted-cfp.json`.

New verified accounts receive a welcome email covering the Locker Room, connecting existing pools, the free public challenge, creating private pools, sharing invites/QR codes and the Game Room. Connecting pools preserves separate memberships, picks, history and commissioner roles. Delivery is queued with the worker lifetime when available, uses a per-account claim and provider idempotency key, and never blocks account creation on delivery failure. An authenticated account can retry its own welcome via the `welcome` action; an already-sent welcome is not resent. `tests/account-welcome.mjs` verifies content, escaping, correct-code-only delivery, duplicate suppression, and recovery from a provider failure.
