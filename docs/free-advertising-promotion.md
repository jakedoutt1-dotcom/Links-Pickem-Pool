# Free advertising promotion

All available pools, regular games, Hosted Trivia and hosted Poker Night are free for now. Public pricing cards and pass-purchase prompts are removed. Host identity verification, Fair Play, player limits, room expiry and normal account rules remain. There is no announced end date; prices must not appear until explicitly restored.

The existing FREE_GAME_TESTING flag remains true and FREE_HOST_GAME_TESTING is now true. New game-pass checkout and hosted subscription creation are blocked during the promotion, even if payment credentials are configured. Hosted access returns a promotional entitlement without contacting PayPal. Existing purchase records and backend payment validation remain available; no refunds, cancellations or payment-account configuration changes are performed. The owner confirmed payment buttons are not configured and no customers have paid.

The homepage, pool demo catalog, commissioner hub, Game Room, party access pages and individual game information explain free access. Private historical receipt handling is retained but empty for new users. Standard internal plan definitions remain for a future rollout; no public prices are displayed. NFL Pick'em game code, data, scoring, picks and lock settings are unchanged.

Checks include game-promotion.mjs, free-game-testing.mjs, pricing-policy.mjs (promotion disabled only inside its test process to retain payment regression coverage), hosted identity and grant tests, commissioner-hub-ui.cjs and free-pricing browser tests. No production checkout, email or purchase was sent during validation.
