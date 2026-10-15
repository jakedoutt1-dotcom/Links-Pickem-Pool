# LINKS reliability review — October 15, 2026

## Scope

Reviewed from `959050ab` in the isolated reliability worktree. The lead reviewed integration and the homepage; three workers covered non-NFL pools/data, games/leaderboards, and emails/accounts/admin. The original checkout remains preserved. No production data, real email sends, paid provider requests, or Cloudflare checks were performed.

NFL Pick’em pages, APIs, saves, shared authentication/navigation, and the homepage NFL card and demo route are unchanged. The email helper change is gated to non-NFL player messages; NFL and mixed NFL welcome/invite subject, text, and HTML were compared with the baseline and are identical.

## Confirmed fixes

- NBA no longer treats a missing final score as zero and invents a winner. NBA/MLB finals without an official winner stay pending and remain eligible for a later results refresh.
- MLB rejects picks on incomplete matchups. Current pick saves no longer wait on unrelated historical-result requests.
- Goal Line continues uploading valid queued results after an earlier rejected replay, retaining the failed replay for retry.
- Putt Club room requests have a 12-second deadline so a hung request releases the polling lock and can recover.
- Non-NFL player welcome/invite emails use the selected game's displayed deadline and rules instead of football kickoff instructions. They explain that player invitations do not grant commissioner controls.
- The homepage exposes Pool games, Game Room, and How it works navigation on phones. Removed the link to a hidden package section, the stale package offers, and the instruction to choose a package. Existing pool cards and demo routes are preserved.

## Validation

- All 25 game reliability suites passed, covering question-provider behavior, mixed decks, hosted answer submission/scoring/restart/closure, solo games, leaderboard authorization and results, and Putt Club's 18 holes and room recovery.
- Targeted NBA/MLB API regressions cover missing final results, later recovery, delayed history requests, pick deadlines, permissions, and privacy. The new incomplete-result regression failed before its fix and passes afterward.
- College, moneyline matching/failure handling, March scoring/replay, Golf/NASCAR schedules/scoring, event pools, Home Run Club, Squares, and Playoff Challenge fixtures passed. NBA/MLB records and missing-data fallbacks, team-logo URL construction, and MLB pitcher fallbacks were checked.
- Welcome/invite links, escaping and provider rejection; setup invitation authorization/expiry/revocation/role preservation; game-invite resend; and recovery/password/membership fixtures passed. Setup template edits were excluded from the final change to preserve the shared NFL path.
- Admin authorization, pool deletion rollback/isolation, package grants, partner GPS/QR management, logo upload validation, and Locker Room Talk unread/access fixtures passed.
- Edge browser checks passed for NBA/MLB at 390 and 1280 pixels, NASCAR artwork/fallbacks, and Squares winner display. Hosted Trivia long questions with 12 leaders and the partner logo fit at 960×540, 1280×720, and 1920×1080.
- The homepage fits at 360, 390, and 1280 pixels with no script errors. Visible section links have visible destinations. Root routing/invite preservation checks passed.
- New email-content and incomplete-result regressions are included in the reliability runner. Previously passing suites were not repeatedly run without a relevant change.

## Limits and protected findings

These checks use local fixtures and mocked network responses. They do not certify current provider credentials/availability, live logo CDN responses, actual inbox delivery, physical-device audio, or production capacity. Previously stored incorrect winners were not bulk-edited.

Custom Pool, Confidence, Survivor, Fantasy, Dynasty, Props, and Game 33 remain publicly paused. Internal Fantasy tests cover football, not fantasy basketball. Isolated Confidence/Survivor tests passed; the combined football suite also ran an existing NFL case with an outdated HTTP-status expectation (403 expected, 409 returned). NFL code and its test were left unchanged. This is not evidence of a live NFL failure.

Before activating Custom Pool, its legacy page needs clearer player/commissioner controls, visible load errors, and complete lifecycle coverage. The shared setup-invitation email still contains older wording about not using the old login; changing that would also change NFL-linked setup messages, so it was left untouched under the requested NFL protection.

This report describes local review and fixes; it does not establish deployment.
