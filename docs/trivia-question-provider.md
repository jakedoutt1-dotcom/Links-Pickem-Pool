# Shared factual trivia questions

Use `functions/lib/trivia-provider.js` for new factual trivia games. The server reads `TRIVIA_API_KEY`; never put it in browser code, URLs, logs, or public room state.

Current consumers: Trivia Night, Challenge a Friend, Dead Air, and ranked Two Minute Drill. Offline football practice retains its sample questions. Caption prompts, drawing prompts, mystery evidence, and generated logic puzzles do not use this factual-question API.

Call `loadGameQuestions` only after authorization and game eligibility checks, at creation/start or rematch, never on polling or each answer. Cache the promise outside optimistic-update retry loops. Pass categories, optional difficulties, a local backup, and previously used IDs. The legacy category name `football` means broad Sports; football-only games must pass `tags: ['american_football']`. Tagged responses are also checked locally.

Canonical question: `{id, category, difficulty, text, answers, correct, source, license}`. Provider questions have their correct answer at index zero; shuffle choices on the server and preserve the correct index. Use `completeQuestionBank` with a category/difficulty-filtered backup and the minimum deck size to fill short responses. Repeats can occur after the available library is exhausted.

Persist the resulting deck privately for the room/attempt. Only project current question text and choices into player/TV views; reveal the correct answer after the answer window. Start deadlines after loading. Keep active legacy decks readable. Room expiry follows each game's existing policy; do not copy fetched content into the owner question library.

Provider failures fall back to bundled questions. No-key local tests use the bundled library. Paid-provider responses are mocked in `tests/shared-trivia-provider.mjs` and `tests/trivia-provider.mjs`; these tests do not consume the subscription. A successful mock test does not verify deployment secrets or live subscription access.
