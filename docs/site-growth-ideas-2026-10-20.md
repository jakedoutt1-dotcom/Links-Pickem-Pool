# LINKS growth ideas — October 20, 2026

The free five-question Daily Challenge is the current build. These are follow-on ideas, not additional features implemented by this report. Priorities and benefits below are hypotheses for LINKS; the references demonstrate existing product patterns, not promised revenue or retention gains.

## Ranked opportunities

| Priority | Idea and smallest useful release | Effort | Expected benefit to test | Measure |
| --- | --- | --- | --- | --- |
| 1 | **Beat my score, with a real landing page.** Extend Daily Challenge sharing with an attractive spoiler-free result card, date, score, and a challenge link. Recipient lands directly on that day's challenge; completed players see their comparison. Keep standard copy-link fallback on desktop. | Low, builds on the new challenge | Friends introduce friends without an ad budget. | Share attempts, challenge-link visits, first challenge completions from those visits. A share-button click is not proof a message was sent. |
| 2 | **Your crew's weekly board.** Let a player create a private, link-invited Daily Challenge group. Keep the global board, but add friends' weekly totals and completed-day count. Start with daily trivia only so unlike games do not distort scores. | Medium | Familiar names give people a reason to return and compare. | Group invitations accepted, active groups, days played per member, next-week return. |
| 3 | **Venue vs. venue week.** Two opted-in partner venues receive branded QR cards and a shared weekly challenge board. Use capped/top-N per-person scores or averages with a minimum participant threshold, rather than an uncapped total that always favors the larger venue. Show participation beside ranking and explain the rule. | Medium | Venues have something specific to promote and guests can support their location. | Distinct QR visits per venue, completed challenges, repeat participants, venue signups. GPS can suggest a venue; a scanned venue link plus confirmation should work when indoor GPS fails. |
| 4 | **What's happening this week.** A simple venue event card: Hosted Trivia or Poker, date/time, host, join details, and Add to Calendar. Add explicit opt-in reminders later, with unsubscribe controls. Do not send unsolicited texts or notifications. | Low for calendar download; medium for reminders | A visible next event may turn a one-time player into a returning guest. | Event-card visits, calendar downloads, reminder opt-ins, event joins. Calendar download is not proof attendance occurred. |
| 5 | **Venue QR welcome page.** A permanent QR opens a lightweight venue page showing today's free challenge, upcoming hosted event, and approved venue special/logo. Distinguish it from an individual game's room QR so guests do not land in the wrong room. | Low–medium, reuses partner assets | Turns existing table artwork into a clear entry point for new guests. | Scans by venue/artwork campaign, game starts, first-time completions. Do not call a scan a physical visit or track precise location unnecessarily. |

## Recommended next steps

**Low-cost choice:** improve the Beat My Score landing page after the Daily Challenge is stable. It reuses the challenge rather than introducing another game, subscription, or data provider. Keep results spoiler-free and let the recipient play before comparing answers.

**Venue choice:** pilot Venue vs. Venue Week with two willing partners. Use existing partner logos and table artwork, a clear seven-day window, and bragging rights. Do not add cash rewards or new paid tiers for the pilot. Review participation and repeat play before expanding.

For an initial measurement period, compare cohorts and raw counts rather than declaring success from a handful of visits. Use anonymous aggregate events where practical; never put names, emails, passwords, or precise GPS coordinates in analytics URLs. Device-local streaks must be described as device-local until account syncing exists.

## Primary-source evidence

1. [New York Times Games app help](https://thenewyorktimeshelpcenter.helpjuice.com/360052273251-The-New-York-Times-Games-app): describes friends' daily game statistics, invitations, and game stats/streaks. This supports the friends-comparison pattern; it does not establish an expected lift for LINKS.
2. [NYT Connections help](https://thenewyorktimeshelpcenter.helpjuice.com/360011158491-New-York-Times-Games/28525912587924-Connections): explains copying results into a message or other text field. LINKS should make sharing equally straightforward while keeping its own visual identity.
3. [Kahoot! Leagues help](https://support.kahoot.com/hc/en-us/articles/42650236377107-What-is-Kahootopia-Leagues-and-how-to-join-them): describes shared league leaderboards and points from completed games. Its classroom context differs from venues; adapting the pattern is our recommendation, not an equivalent proven outcome.
4. [Discord Scheduled Events](https://support.discord.com/hc/en-us/articles/4409494125719-Scheduled-Events): documents event invite links, RSVP interest, and notifications for interested attendees. LINKS could use an analogous explicit-interest flow without requiring Discord.
5. [Kahoot! joining guide](https://support.kahoot.com/hc/en-us/articles/360039890713-Kahoot-join-How-to-join-a-Kahoot-game?lang=en): supports QR, direct links, and game PIN entry. A permanent venue QR and a temporary game-room QR should have different labels and destinations.

Sources checked October 20, 2026. No subscriptions, external messages, or advertising purchases were made. NFL Pick'em code was not changed.
