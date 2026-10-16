# Hosted Trivia: teams and Fair Play

## Hosting and joining

Create a new Hosted Trivia room and choose **Teams · Captain + teammate recommendations**. The room invitation and QR code remain the same for everyone. The first teammate chooses **Create a team**, enters their own name and a team name, and becomes captain. Other teammates choose **Join a team**, select it, and enter the captain's six-digit team code. The captain can find and copy that code in their team details.

Every person uses their own phone. The 200-person room limit includes captains and teammates. Someone joining after a question starts becomes eligible on the next question.

Teammates tap an answer to recommend it and can change their recommendation while answers remain open. Only the captain sees the four percentages and the number of teammates who have voted. Percentages use recommendations received, excluding the captain; they may not total exactly 100 because of rounding. Recommendations never choose or submit the final answer automatically.

The captain chooses and submits one team answer. A submitted answer closes recommendations and locks the whole team's answer. The team gets one score, with its existing team speed bonus based on the captain's submission time. If time runs out without submission, a saved captain selection counts for base points only. A teammate's recommendation alone does not count as a team answer. The host can change the captain under **Teams & captains**; saved selections, submissions and Fair Play locks survive the transfer.

## Fair Play

New room setup defaults to **On · Notify the host** in both individual and team modes. Hosts can instead choose **Strict · Notify and lock selection** or **Off · Honor system**. Players see the room's Fair Play rules when joining and must acknowledge them when alerts are enabled.

- Alerts apply only to eligible, unsubmitted players during a live answer timer, not countdowns, breaks or results.
- A hidden page or page unload attempts to report the interruption. Focus changes alone do not trigger it. Pending notices retry when the browser returns or reconnects; notices that arrive after the question are ignored.
- In strict mode, the person's saved answer or recommendation locks for that question. A captain leaving also locks the team selection. A teammate leaving does not lock the captain or other teammates.
- Hosts see **Fair Play notices** with player, team and question details. **Excuse interruption** removes the matching current lock while time remains. It does not undo a submitted answer, alter scores or reopen an earlier question.
- Notices are private to the host and affected player. Only one notice per person per question is recorded. The room keeps the latest 200 notices and displays the latest 20 unexcused notices to the host.

This is a deterrent, not proof of cheating. Calls, locking a phone, switching apps and browser behavior can hide a page. It cannot detect a second device, inspect what someone opened or guarantee that a mobile browser delivers an interruption report. Browser storage failures retain pending notices in memory only. Hosts should treat an alert as an interruption to review.

## Compatibility and verification

Existing rooms retain their settings and older team rooms retain one-phone-per-team play. Create a new room to use captains and Fair Play. Individual question timing, answer submission and scoring are unchanged apart from an explicitly selected Fair Play lock. NFL Pick'em is outside this change.

Server tests: `trivia-team-captains.mjs`, `trivia-fair-play.mjs`, plus the existing hosted-trivia lifecycle, team, answer-change, submit, room-close and venue-score suites. The new server tests are included in the `games` reliability group.

Browser tests: `trivia-team-captains-browser.cjs` uses isolated local fixtures for phone team joining, private live votes, captain transfer, Fair Play notices and host exceptions. `trivia-submit-answer-browser.cjs` checks the existing individual flow. `trivia-tv-long-question.cjs` checks TV questions, standings and venue-banner placement. Browser visibility events are simulated; these checks do not certify behavior on every physical phone.
