# Scale readiness: 20,000 pool creators

Status: preparation in progress; production capacity is NOT certified.
Updated: October 3, 2026.

## Target and current blocker

Plan for 20,000 commissioners creating pools, not merely 20,000 registered players. At 20 members per pool that is 400,000 memberships and 6.4 million NFL selections per 16-game week. Multiple weeks and games increase this further. Concurrent users and requests per second must be measured separately from these stored-record counts.

The existing preview shares the production database (confirmed by the owner). Do not run a traffic test, synthetic account creation, destructive fixtures, invitation bursts, or payment scenarios there. No production load test has been run.

## Implemented in this change

- Public NFL schedule/score responses used by weekly standings and Compare Picks share a 15-second Cloudflare Cache API entry. Simultaneous requests in one worker share the pending provider request. Cache entries are per Cloudflare data center, not a global singleton.
- Copies isolate pool-specific winner corrections. Pool records, picks, sessions, and standings are never put in this public cache. Provider failures do not serve expired results. Cache failures fall back to the provider.
- Pick-save authorization keeps its fresh schedule path; per-game kickoff checks remain enforced. Existing season standings also retain their prior 60-second in-process schedule cache.
- Commissioner owner, slot, purchase, and grant lookups have email indexes. These are additive, created through the existing account-schema initializer; moving all runtime schema work into controlled migrations remains outstanding.
- A local synthetic benchmark executes the real weekly standings and Compare Picks handlers against the existing SQLite schema.
- A staging traffic runner refuses the production domain, cross-origin scenarios, unconfirmed database isolation, and unbounded request counts. It checks expected response fields as well as HTTP status. It never logs request credentials or response bodies. Isolation is an explicit operator assertion, not automatic proof of Cloudflare bindings.

## Local evidence (not live capacity)

`node tests/load/local-benchmark.mjs` on October 3:

- 20,000 synthetic pools, 400,000 memberships, 6,400,000 picks.
- 400 sampled endpoint requests passed pool identity and roster/scoring checks.
- Weekly standings: p95 approximately 3.68 ms; Compare Picks: p95 approximately 4.08 ms.
- Owner lookup query plan uses `links_owners_email`.

These are serial requests against in-memory SQLite with mocked sports feeds. They exclude Cloudflare limits, network latency, actual authentication, concurrent writers, email delivery and payments. They do not demonstrate 20,000 simultaneous users. The benchmark reports those limitations in `output/scale-readiness/local-benchmark.json`.

`node tests/shared-score-feed.mjs` also verifies that 1,000 simultaneous cache-helper calls share one provider load, mutation isolation, expiry, different weeks, and provider/cache failures. This is a unit test, not an infrastructure load test.

## Isolate the preview first

1. Create a dedicated Cloudflare D1 database for staging. Obtain its database ID; never substitute the live ID.
2. In the Pages project's Preview environment, bind `DB` to the test database and audit every other database/storage binding for separation. Keep Production unchanged. Use a separate Pages project if environment separation cannot be proven.
3. Apply the schema and seed synthetic data only. Do not export player passwords, sessions, emails or live picks into fixtures.
4. Use separate test email delivery and sandbox payments. Disable outbound invitations to real addresses. Do not use production PayPal credentials.
5. Verify through Cloudflare configuration that database IDs differ; perform a staging-only sentinel write and confirm it is absent from production. Record the IDs privately, not in this repository.
6. Deploy the tested source to that environment. Configure provider fixtures or an isolated provider budget before high-rate traffic. Cache misses across locations can still generate real upstream traffic.

## Traffic test procedure

Copy `tests/load/staging.example.json` to a private file under ignored `output/scale-readiness/`. Replace the origin, synthetic pool ID, and expected response fields. Set `isolatedDatabase` true only after the checks above. Do not commit scenario files containing test session tokens.

Run `node tests/load/staging.mjs output/scale-readiness/staging.private.json`.

Start with 100 requests and concurrency 5, then 20, 100, and 500 while watching D1, worker, and provider metrics. The runner is a bounded closed-loop smoke/load tool; it is not a substitute for a distributed arrival-rate test. Stop a stage if errors rise or queues grow. Initial thresholds are under 0.5% failures, p95 under 1.5 seconds and p99 under 3 seconds. A passing read-only run does not certify writes, logins, or registrations.

Add scenarios for unique synthetic sessions and memberships: login; locker-room reads; pick saves and immediate read-back; join/create flows; package enforcement; concurrent last-slot reservations; duplicate invitation acceptance; unauthorized cross-pool access; mobile request patterns. Account creation and login scenarios require the permanent account migration below and a verified test email sink. Never include real payments. Check correctness and lost/duplicate writes, not only timing.

Before launch, run a distributed kickoff burst and sustained test with an agreed active-user model. Record request rate, concurrent users, duration, error rate, p50/p95/p99, D1 rows read/written and storage growth, worker CPU, provider calls, email queue age, and cost. Retain the version and scenario with each result.

## Remaining release gates

- Permanent player identity: unique account ID and normalized unique login name; verified recovery address; secure password hashing; membership IDs independent of display/login names. Existing duplicates must be resolved through verified account ownership, never merged by name. Support migration and rollback; preserve all existing picks and commissioner ownership.
- One-account locker room: invitation acceptance attaches memberships idempotently; name/password changes do not affect membership IDs. Joining is free; creating games consumes the owner's package allowance. Test concurrent creation and entitlement checks on every relevant server action.
- Database: measure full-season/all-game storage. Remove cross-account legacy scans in `importOwnedPools` and historical purchase loading; paginate owner administration. Move schema creation and credit-trigger initialization out of busy request paths. Evaluate database partitioning/read replication only from measured limits.
- Sports data: shared ingestion for all games, upstream permission/quotas, scheduled score refresh, freshness display and outage behavior. Precomputed standings need revision-aware invalidation for changed picks, credits, eligibility and official results.
- Operations: verify paid-plan limits and budget; alert on 5xx, latency, provider failures, failed pick saves, and usage. Exercise backup restoration into an isolated database and document recovery time/data-loss targets.
- Email: queued delivery with bounded retries, idempotency, bounce handling and provider capacity verification.
- Security: rate-limit registration/login/reset/invites; test account enumeration, token lifecycle, tenant isolation and audit logs.

No Cloudflare plan, alert, backup schedule, new database, or account migration was activated by the local tests. Cloudflare management credentials are not configured in this workspace.

## References

- Cloudflare Cache API: https://developers.cloudflare.com/workers/runtime-apis/cache/
- D1 architecture and throughput: https://developers.cloudflare.com/d1/reference/faq/
- D1 limits: https://developers.cloudflare.com/d1/platform/limits/
