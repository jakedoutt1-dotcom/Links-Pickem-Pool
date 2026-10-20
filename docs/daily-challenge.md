# LINKS Daily Challenge

Built October 20, 2026. Local implementation; not a deployment confirmation.

- Public page: `/new-build/daily-challenge.html`; entry banners on the homepage and Game Room, a Game Room card, and a Locker Room link.
- Free ranked play uses the existing verified LINKS account. Five shared questions each Central calendar day, 100 points per correct answer, 20 seconds per question, no speed bonus. Each question starts when the player presses Next. Locking an answer is final.
- One ranked attempt per account per day. Server deadlines, compare-and-save versions, and stored daily decks prevent restart/replay awards or answer changes across deployments. Reload resumes the same timer.
- Public top-100 daily scores use display names and opaque profile identifiers; emails and account identifiers are not returned. Equal scores share rank. Completing the challenge builds a daily completion streak, including a zero-score finish. The current streak remains through the following day until that day is missed.
- Result badges: Daily Finisher, Perfect Five, Three-Day Streak, Seven-Day Streak. Practice stays explicitly unranked and does not award server achievements.
- Guest practice runs entirely in the browser and remains available if the API is unavailable. Practice does not consume the ranked attempt. Fair Play guidance asks players not to look up answers; the feature cannot prevent another device or shared answers.
- Share uses the phone share sheet or a desktop clipboard fallback. Ranked text includes the challenge date. No automatic messages or reminders are sent.
- Original 60-question starter bank rotates in 12-day blocks without repeating within a block. It repeats over time; expand the curated bank before describing it as an unlimited fresh-question service. No paid trivia-provider calls are made by this feature.
- D1 tables are initialized lazily: `links_daily_profiles`, `links_daily_decks`, `links_daily_attempts`. No new API secrets or subscriptions are required. The existing site DB binding and account setup are required.
- New stadium artwork is stored in `public/new-build/assets/daily-challenge-hero-v1.png`. Mobile entrance motion, confetti and glow honor reduced-motion settings.

## Validation

`tests/daily-challenge.mjs` verifies shared rotation, answer privacy, authentic account sessions, same-origin writes, ownership, concurrent replay protection, deadline scoring, one daily attempt, completion-only rankings, Central/DST boundaries and streaks.

`tests/daily-challenge-browser.mjs` covers 320/375/390/1280 layouts, five questions, answer selection/submission/reveal, completion, share cancellation, signed-out practice, practice return, expired timers and initial API failure.

`tests/daily-challenge-integration.mjs` runs the real endpoint and D1 fixture behind the real browser UI at phone and desktop sizes: authentication, timer resume, five server-graded answers, badges, streak/ranking, no replay, and homepage/Game Room entry links.

`tests/game-room-login.cjs` covers login and signup returning to Game Room and Daily Challenge. The current `tests/login-optional-setup.cjs` covers the unchanged old pool-login behavior. The older `tests/login-transition-browser.cjs` still expects removed mandatory-setup copy and does not match the current transition flow; it was not changed to restore that obsolete behavior.

NFL Pick'em game files, rules, save API and football feed are unchanged. Physical-device share previews and real signup email delivery are not certified by local fixtures.

See `site-growth-ideas-2026-10-20.md` for researched follow-ons. Friend leaderboards, venue-versus-venue competition, referral rewards and opt-in reminders are proposals, not features shipped by this change.
