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

The first two reuse the approved concept previews, framed by CSS beneath the new Check, Please! title. The gameplay scene is rendered live: depth-projected booths, lamps, screens and textured floor advance past the camera; detailed cartoon characters use deformable meshes with independently animated hips, thighs, calves, shoulders and elbows. A WebGL skinning renderer has an animated software-mesh fallback. Feet use a grounded baseline; walking and dancing are not whole-image bobbing. The tray and food are separate layers, so spills still remove the correct item. Particles and HUD remain live canvas/CSS.

Prompt set: (1) stylized 3D mobile arcade concept of a waiter balancing soda, wings and nachos through a crowded navy/gold sports grill; (2) funny end-of-round concept with nachos landing on a laughing patron; (3) actual empty venue background, centered first-person camera and wide clear wood aisle, booths on the edges, navy/gold lighting, no people, foreground food, text, logos or HUD. Original generated PNG files remain in the conversation's generated-images directory; the website consumes only the workspace WebP copies above.

## Validation

`node tests/check-please.mjs` checks deterministic physics, skill versus idle play, round limits, exact replay, input bounds, authentication, same-origin POSTs, clock checks, server-derived scores, private identities, one daily best, replaced/repeated/expired attempts.

`node tests/check-please-browser.mjs` uses clean Edge and mocked network responses at 320, 390 and 1440 px. Covers guest and signed-in play, rendering, slider input, complete rounds, local bests, ranked save, venue selection, quit/cancel and no console errors or missing assets. Screenshots are written to `output/check-please/`. Browser tests require the bundled Playwright dependency directory in `NODE_PATH`.

## Moving venue and character rigs (v2)

New optimized artwork is in `public/new-build/assets/`: `check-please-fan-v2.webp`, `check-please-dancer-v2.webp`, `check-please-booth-v2.webp`, `check-please-chair-v2.webp`, `check-please-tray-v2.webp`, `check-please-wings-v2.webp`, `check-please-nachos-v2.webp`, `check-please-soda-v2.webp`, and `check-please-floor-v2.webp`. Built-in image generation supplied the art; WebP conversion preserves transparency. Originals remain untouched.

Prompt set: a full-body, richly sculpted, expressive glasses-wearing patron in navy/cream plaid; a full-body curly-haired woman in a navy/gold jersey in a dance pose; an isolated navy leather/walnut/brass booth assembly; an isolated matching upholstered chair; an empty metal serving tray held by navy-sleeved hands; separate buffalo wings, nachos and iced cola; and a straight-down repeating walnut-floor texture. All props/people request transparent backgrounds and animated-film lighting/detail, with no room or typography. The floor requests a tileable opaque texture. These are texture assets, not pre-rendered gameplay clips.

The renderer in `check-please-scene.mjs` projects scenery from world depth, advances architecture in depth, and uses fractional render time for smooth movement independently of the fixed simulation step. `check-please-actors.mjs` skins each character texture with joint rotation, alternating foot lifts, calf bends, hip sway and arm/elbow movement. The dancer has a separate raised-arm rig and rhythm. Reduced-motion mode scales joint motion down and disables optional walking camera bob; it preserves the essential movement needed to read the game. Simulation, collision rules, saved inputs and server scoring are unchanged.

`node tests/check-please-scene.mjs` verifies forward/outward scenery movement, steering response, scale and a continuous set of booths through a full shift. Browser tests compare lower-body and upper-body alpha silhouettes at two animation phases for GPU and software paths, confirming that limbs change pose rather than the complete image merely translating. They also check transparency, actual artwork loading, control input, complete rounds and ranked saves at phone/desktop widths.
