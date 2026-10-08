# Last Alibi small-group mode

Starting with 2–3 ready players automatically creates a cooperative case with six fictional suspects. Neither human is the culprit or receives the solution. The generated evidence, clock puzzles, methods, scenes, and chapter pacing are unchanged. Each investigator retains private notes and shares discovered evidence using the existing controls.

Both players submit a suspect, location, and method. A strict majority identifying the murderer solves the case (both investigators in a two-player case). Correct suspect earns 500 points; correct scene and method add 100 each. The culprit and full explanation reveal only after accusations. TV is optional.

With 4–8 players, the original hidden-role game remains. Active older rooms continue through the existing player-based suspect fallback. Replay rebuilds the mode based on the current human count and avoids consecutive culprit IDs and methods where possible.

Checks: `tests/last-alibi.mjs` (500 original-mode cases and endpoint flow), `tests/last-alibi-coop.mjs` (200 cooperative cases and complete endpoint flow), `tests/last-alibi-coop-browser.mjs` (two actual mobile browser sessions, optional TV, inspection, sharing, comparisons, private notes, reconnect, and sound).
