# LINKS Million Point Challenge

Original LINKS party trivia game. Entry: `/new-build/million-point.html`. Available through the Party Room card and room-code selector. No account or pool membership required. Not related to pool picks or packages.

## Modes
- Hot Seat: 1–8 players take turns. Creator starts after everyone is ready and advances between turns. Each turn has 15 questions (5 easy, 5 medium, 5 hard), a 60-second question timer, final-answer confirmation, and a six-second reveal. Players explicitly continue or bank between questions. Each gets 50/50, a real 15-second Ask the Room vote that pauses the question clock, and one same-difficulty replacement question. Room advice is not guaranteed correct.
- Head-to-Head: exactly two players answer the same questions simultaneously. One private 50/50 per player. Answers remain hidden until the shared 60-second deadline, followed by six-second reveal and automatic next question. No speed bonus; equal final scores share the win. After banking/missing, a player can watch the rival finish. Banking is available before locking an answer.

Ladder: 100, 200, 300, 500, 1,000, 2,000, 4,000, 8,000, 16,000, 32,000, 64,000, 125,000, 250,000, 500,000, 1,000,000 game points. Guarantees after questions 5 and 10. A wrong answer or timeout ends a run at the last guarantee; banking preserves current points. No cash prizes.

## Data and display
Shared server-only The Trivia API loader with local fallback. Room start loads a private snapshot, never on polls. Choice order shuffled server-side. Previous question IDs are avoided where the available bank permits; small local banks may repeat between turns. Legacy login is untouched. Two D1 tables are created lazily: `links_million_rooms`, `links_million_limits`. Rooms expire in 24 hours. Hashed player tokens, private read-only TV key, origin checks, optimistic concurrency, stale question guards, bounded body size and rate limits.

Host opens TV display or copies its private link. Prefer a TV browser/laptop over HDMI/Cast; screen mirroring retains the phone orientation. Player invitation has no TV key. QR guest link opens the name form. Sound is original synthesized audio, off by default; enable on one shared device. No third-party show assets or music.

## Local verification
`node tests/million-point.mjs` runs full ladders, guarantees, permissions, lifelines, head-to-head privacy, ties, rematch and expiry.
`node tests/million-point-preview.mjs` starts an isolated in-memory preview at http://127.0.0.1:8776/new-build/million-point.html (no production DB or paid API).
`node tests/million-point-browser.mjs` uses Playwright/Edge for two mobile sessions and private TV in both modes, answer confirmation, reveal, room voting, sound and reconnect. Screenshots under `output/million-point/`.
