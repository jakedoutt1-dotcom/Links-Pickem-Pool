import assert from 'node:assert/strict';
import {recapIsOpen} from '../public/new-build/nfl-weekly-recap.mjs';

for (const {kickoff, tuesdayEnd, wednesdayStart} of [
  {
    kickoff: '2026-10-13T00:15:00Z',
    tuesdayEnd: '2026-10-14T04:59:59Z',
    wednesdayStart: '2026-10-14T05:00:00Z'
  },
  {
    kickoff: '2026-11-17T01:15:00Z',
    tuesdayEnd: '2026-11-18T05:59:59Z',
    wednesdayStart: '2026-11-18T06:00:00Z'
  }
]) {
  const atKickoff = Date.parse(kickoff);
  assert.equal(recapIsOpen(kickoff, atKickoff - 1), false);
  assert.equal(recapIsOpen(kickoff, atKickoff + 3 * 3600000), true);
  assert.equal(recapIsOpen(kickoff, Date.parse(tuesdayEnd)), true);
  assert.equal(recapIsOpen(kickoff, Date.parse(wednesdayStart)), false);
  assert.equal(recapIsOpen(kickoff, Date.parse(tuesdayEnd) + 7 * 86400000), false);
}
assert.equal(recapIsOpen(null), false);
console.log('PASS Monday and Tuesday recap window, Wednesday midnight Central cutoff, and no stale recap next week');
