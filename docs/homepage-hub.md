# Homepage hub cleanup

The homepage now leads with two image cards: Pool Games opens /new-build/pool-demos.html and Game Room opens the existing /new-build/game-room.html. The intro is shorter on phones and desktops. Daily Challenge and Circuit Rush use compact secondary cards. Existing login, create-pool, live scores, package pricing, Excel downloads, venue promotion and Barnes Results remain available.

The separate pool catalog preserves all 13 playable demo cards, their exact destination routes, artwork and copy, plus the existing coming-soon cards and package pricing. NFL Pick'em engine, data, scoring, pick-lock behavior, storage and demo implementation are unchanged; only the location of its existing homepage catalog card changes. The catalog uses the same demo URLs rather than a second implementation.

home-hub.css scopes destination/shortcut styles and the shorter hero to the homepage. Catalog intro styles are separate. No global game or pool styles were modified. The duplicate large Game Room and Locker Room banners were replaced by the main destination cards, with Trivia Rally and Poker artwork retained within the Game Room card.

Validation: tests/home-hub-browser.mjs exercises phone and desktop fit, both destinations, all demo routes, original NFL card preservation, demo navigation, logos/records/moneyline and separation from real pool storage. Existing Circuit Rush and Daily Challenge entry tests retain their homepage anchors.
