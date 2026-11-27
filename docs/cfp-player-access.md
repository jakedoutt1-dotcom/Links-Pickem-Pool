# College playoff player access

Commissioners open College Playoff Pick’em and expand **Manage player access**. Choose **Unlock picks** for a player or **Lock picks** to revoke access. These labels describe player access only; LINKS does not collect an entry fee.

Access starts locked and applies only to that pool and college season, including the commissioner’s own entry. Players may view the bracket and standings while waiting. Existing saved entries are preserved if access is locked. The official first-kickoff deadline still locks every round; unlocking access never extends it. Practice mode remains available without commissioner access.

The API enforces access on both legacy per-game saves and full-bracket draft/submission writes. The actual SQL write also checks access, covering revocation during an in-flight request. Only an authenticated commissioner in that pool can change a current roster member’s status. Only commissioners receive the access roster. Removing a player clears their unlock records.

Isolated storage: `links_cfp_access`, keyed by pool, season and canonical roster name. Existing NFL access records are unchanged.

Checks: `node --test tests/cfp-api.mjs tests/cfp-bracket.mjs`, `node tests/cfp-browser.mjs`, `node tests/delete-player.mjs`, and the pool regression group.

Players choose **Lock in my picks** to submit their complete bracket and receive **Your picks are saved and entered.** They may update and lock in edits before first kickoff. **Save draft** keeps an incomplete entry and does not enter it into standings. Scoring uses 10 / 20 / 40 / 80 by round, 280 maximum, with the combined championship score breaking final points ties. Confidence dropdowns are removed; existing saved winners and guesses are retained, and any old confidence fields are ignored.

The default bracket is a compact mirrored seven-column tournament layout: blue first-round teams at both ends, green quarterfinals, purple semifinals and a gold championship in the center. Connectors follow advancement inward on both sides. Phone users pan within the bracket; desktop fits the full diagram. Team buttons retain a 48px minimum height. The Round by round view retains larger team logos, records and rankings.

The compact bracket omits redundant “Feeds Game”/“Continue to Game” buttons; advancement stays visible through the connector lines and selected winners. The championship tiebreaker input sits inside the gold championship matchup and explicitly shows the combined-score example 28 + 24 = 52. Closest absolute difference wins a final points tie; equally close guesses share the place, with overtime included.

The approved hero uses `assets/cfp-hero-ranking-preview-v2.png`, created with built-in image generation. Its adjacent `.prompt.json` retains the prompt and November 24, 2026 official CFP ranking source. It is promotional artwork labeled “Rankings preview • Field not final”; it does not populate the playable bracket, which still waits for the official field. The full image fits the phone width with no duplicate title block and no cropping of team logos. Replace the artwork when the final field is selected.
