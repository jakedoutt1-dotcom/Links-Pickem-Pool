# Daily Challenge venue leaderboard

Before starting a ranked Daily Challenge, a player may choose an active LINKS partner venue to represent. The choice is optional. Playing without a venue still counts on the global Daily Challenge board.

Starting the challenge saves the chosen venue's identity with that attempt. It cannot be changed by reloading, opening a different venue link, or sending another start request. This prevents moving a completed score between venues. Venue affiliation is a player choice, not proof of physical attendance or a GPS check.

Only completed, server-scored Daily Challenge attempts appear on the venue leaderboard. There is still one ranked attempt per account per day. A retry or reload cannot count the same game twice. Incomplete attempts and unranked practice do not contribute.

The public venue leaderboard offers **Today** and **All time** views, with a venue filter. The player board shows the venue beside the player's display name; the venue board totals completed points and participation. Historical results retain their saved venue identity if the partner is later renamed or deactivated. No weekly event setup, owner approval, or venue enrollment is required.

Today follows the Daily Challenge's America/Chicago date boundary, including daylight-saving changes. All time sums saved eligible results per player and venue, so one player may have separate rows for different venues. A player can choose a different venue for a future day's game; earlier results stay with the original venue.

Public data contains display names and public profile IDs, not account email addresses, account tokens, private partner addresses, or raw GPS coordinates.

## Checks

`tests/venue-leaderboard-integration.mjs` exercises real local SQLite storage, actual account authentication, the Daily Challenge request handler, and the venue leaderboard handler. Its browser checks use local fixture data at phone and desktop widths. No production accounts, scores, or external providers are used.
