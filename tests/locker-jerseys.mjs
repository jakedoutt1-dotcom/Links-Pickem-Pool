import assert from 'node:assert/strict';
import {jerseyPlayers} from '../public/new-build/locker-jerseys.mjs';
const roster=[{playerId:'me',displayName:'My Display Name'},{playerId:'a',displayName:'Alice'},{playerId:'b',displayName:'Bob'},{playerId:'blocked',displayName:'No Access',status:'pending'}];
const first=jerseyPlayers(roster,'me','My Display Name');assert.equal(first.slots[3].name,'My Display Name');assert.equal(first.slots[3].me,true);assert.deepEqual(new Set(first.slots.filter(Boolean).map(p=>p.id)),new Set(['me','a','b']));assert.equal(first.slots.filter(Boolean).length,3);
const next=jerseyPlayers(roster,'me','New Display Name',first.order);assert.deepEqual(next.order,first.order);assert.equal(next.slots[3].name,'New Display Name');
const removed=jerseyPlayers(roster.filter(p=>p.playerId!=='a'),'me','Me',first.order);assert.ok(!removed.slots.some(p=>p?.id==='a'));
assert.equal(jerseyPlayers([],'me','Me').slots.filter(Boolean).length,1);
console.log('PASS jersey roster: signed-in center, display names, no duplicates, revoked members excluded, stable random neighbors, empty roster');
