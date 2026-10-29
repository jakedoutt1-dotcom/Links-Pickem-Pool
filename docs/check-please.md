# Check, Please!

Free mobile and desktop skill game at `/new-build/check-please.html`, linked first in the Game Room carousel. The name was chosen by the owner during development. No Game Pass, paid AI calls, external game engine, motion permission or app install is required.

Players drag the range control or game scene, or use arrows/A/D. Fixed 50 ms simulation steps govern steering, spring/damping tray balance, seeded obstacles, collision grace, five spills, 12-second deliveries and a 60-second shift. Quitting saves only a device best, never a ranked score. Hiding the page does not stop the shift clock. Sound is opt-in. Reduced motion removes walking bob and spill particles while keeping essential steering and obstacle movement.

Guests can play the daily course or random practice. Signed-in players can start one active daily run per account, optionally attributed to an active venue. The server recreates the course and replays integer steering inputs, calculates the score itself, checks elapsed wall time, and rejects malformed, unfinished, repeated, replaced and expired attempts. D1 stores only the best daily score per account. Public scores show a display name and optional venue, never email or private owner hash. This is replay verification, not a guarantee against scripted perfect play.

`links_check_runs`, `links_check_scores` and their rank index are created lazily using the existing DB binding. There are no changes to NFL Pick'em or existing score tables. Sign-in returns players to this game. Offline failures fall back to clearly labeled device-only play; failed score confirmation never claims a server save.

## Artwork

Built-in image generation was used. Optimized copies live in:

- `public/new-build/assets/check-please-cover-v1.webp`
- `public/new-build/assets/check-please-results-v1.webp`
- `public/new-build/assets/check-please-venue-v1.webp`

The first two reuse the approved concept previews, framed by CSS beneath the new Check, Please! title. Gameplay characters, chairs, food, tray, hands, particles and HUD are drawn live in canvas/CSS, not a static gameplay screenshot.

Prompt set: (1) stylized 3D mobile arcade concept of a waiter balancing soda, wings and nachos through a crowded navy/gold sports grill; (2) funny end-of-round concept with nachos landing on a laughing patron; (3) actual empty venue background, centered first-person camera and wide clear wood aisle, booths on the edges, navy/gold lighting, no people, foreground food, text, logos or HUD. Original generated PNG files remain in the conversation's generated-images directory; the website consumes only the workspace WebP copies above.

## Validation

`node tests/check-please.mjs` checks deterministic physics, skill versus idle play, round limits, exact replay, input bounds, authentication, same-origin POSTs, clock checks, server-derived scores, private identities, one daily best, replaced/repeated/expired attempts.

`node tests/check-please-browser.mjs` uses clean Edge and mocked network responses at 320, 390 and 1440 px. Covers guest and signed-in play, rendering, slider input, complete rounds, local bests, ranked save, venue selection, quit/cancel and no console errors or missing assets. Screenshots are written to `output/check-please/`. Browser tests require the bundled Playwright dependency directory in `NODE_PATH`.
