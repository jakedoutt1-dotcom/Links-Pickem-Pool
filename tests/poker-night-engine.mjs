import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createTable, startHand, act, advanceTimeout, publicTable, evaluateHand, cardDeck } from '../functions/lib/poker-night.js';
if (!globalThis.crypto) globalThis.crypto = webcrypto;

let checks = 0;
function test(name, run) { run(); checks++; console.log(`PASS ${name}`); }
const opts = { smallBlind: 25, bigBlind: 50, turnSeconds: 30, random: () => 0.5 };
const cards = value => value.split(' ');
const make = (stacks = [1000, 1000, 1000], options = {}) => createTable('table-1', stacks.map((stack, seat) => ({ id: String.fromCharCode(65 + seat), name: `Player ${seat + 1}`, seat, stack })), { ...opts, ...options }, 1000);
const go = (table, type, amount) => act(table, table.actorId, { type, amount }, {}, 1001);
const player = (table, id) => table.players.find(p => p.id === id);
const legal = table => publicTable(table, table.actorId).legalActions;
const total = table => table.pot + table.players.reduce((sum, p) => sum + p.stack, 0);
const errorCode = (fn, code) => assert.throws(fn, error => error.code === code);
function forceRunout(table, board = cards('2c 3d 7h 9s Jc')) {
  const used = new Set([...board, ...table.players.flatMap(p => p.holeCards)]);
  const burns = cardDeck().filter(card => !used.has(card)).slice(0, 3);
  table.deck = [board[4], burns[2], board[3], burns[1], board[2], board[1], board[0], burns[0]];
}
function checkDown(table) {
  let turns = 0;
  while (table.phase !== 'showdown') { const action = legal(table); go(table, action.canCheck ? 'check' : 'call'); assert.ok(++turns < 60); }
}

test('52 unique cards; invalid cards, seats, stacks and settings rejected', () => {
  assert.equal(cardDeck().length, 52); assert.equal(new Set(cardDeck()).size, 52);
  for (const bad of [cards('As As 2d 3c 4d'), cards('As Kh Qh Jh'), cards('1c 2c 3c 4c 5c')]) errorCode(() => evaluateHand(bad), 'INVALID_CARDS');
  errorCode(() => make([1.5, 1000]), 'INVALID_CHIPS'); errorCode(() => make([-1, 1000]), 'INVALID_CHIPS');
  errorCode(() => make([100, 100], { bigBlind: 10 }), 'INVALID_BLINDS');
  errorCode(() => make([100, 100], { turnSeconds: 0 }), 'INVALID_TIMER');
  errorCode(() => createTable('x', [{ id: 'a', seat: 0 }, { id: 'b', seat: 0 }]), 'INVALID_SEAT');
  errorCode(() => make(new Array(10).fill(100)), 'TABLE_FULL');
});

test('every hand category and kicker ordering', () => {
  const examples = [
    ['As Jd 9c 7s 3h', 'High card'], ['As Ad 9c 7s 3h', 'One pair'],
    ['As Ad 9c 9s 3h', 'Two pair'], ['As Ad Ac 9s 3h', 'Three of a kind'],
    ['9s 8d 7c 6s 5h', 'Straight'], ['As Js 9s 7s 3s', 'Flush'],
    ['As Ad Ac 9s 9h', 'Full house'], ['As Ad Ac Ah 9h', 'Four of a kind'],
    ['9s 8s 7s 6s 5s', 'Straight flush'], ['As Ks Qs Js Ts', 'Royal flush']
  ];
  const hands = examples.map(([value, name]) => { const hand = evaluateHand(cards(value)); assert.equal(hand.name, name); return hand; });
  for (let i = 1; i < hands.length; i++) assert.ok(hands[i].score > hands[i - 1].score);
  assert.ok(evaluateHand(cards('As Ad Kc 9s 3h')).score > evaluateHand(cards('Ac Ah Qs Jd Th')).score);
  assert.ok(evaluateHand(cards('As Ad Ac Ks Kd')).score > evaluateHand(cards('Ks Kd Kc As Ad')).score);
});

test('seven-card evaluator: wheel, board-only best hand, double trips and three pairs', () => {
  const wheel = evaluateHand(cards('As 2s 3d 4c 5c Ks Qd'));
  assert.equal(wheel.name, 'Straight'); assert.equal(wheel.values[1], 5);
  assert.equal(evaluateHand(cards('As Ad Ac Ks Kd Kc 2d')).values.join(','), '6,14,13');
  assert.equal(evaluateHand(cards('As Ad Ks Kd Qs Qd 2d')).values.join(','), '2,14,13,12');
  const royal = cards('Ah Kh Qh Jh Th');
  assert.equal(evaluateHand([...royal, '2c', '3d']).score, evaluateHand([...royal, 'As', 'Ad']).score);
});

test('crypto shuffle, unique deal and strict private/TV views', () => {
  const table = make(new Array(9).fill(1000)); startHand(table, {}, 1000);
  assert.equal(table.deck.length, 34); assert.equal(new Set([...table.deck, ...table.players.flatMap(p => p.holeCards)]).size, 52);
  const view = publicTable(table, 'A'), tv = publicTable(table, 'A', { tv: true });
  assert.equal(view.players.find(p => p.id === 'A').holeCards.length, 2);
  assert.ok(view.players.filter(p => p.id !== 'A').every(p => p.holeCards.length === 0 && p.hiddenCardCount === 2));
  assert.ok(tv.players.every(p => p.holeCards.length === 0 && !p.you));
  for (const secret of ['deck', 'burns', 'pending', 'actedAtBet']) assert.equal(Object.hasOwn(view, secret), false);
  view.players[0].holeCards[0] = 'xx'; assert.notEqual(table.players[0].holeCards[0], 'xx');
  assert.equal(tv.legalActions.canFold, false);
});

test('three-player betting, big-blind option and post-flop action order', () => {
  const table = make(); startHand(table, opts, 1000);
  assert.equal(table.buttonSeat, 0); assert.equal(table.actorId, 'A'); assert.equal(table.pot, 75);
  assert.equal(legal(table).callAmount, 50); assert.equal(legal(table).minRaiseTo, 100);
  assert.equal(player(table, 'A').handStartStack, 1000);
  go(table, 'call'); assert.equal(table.actorId, 'B'); assert.equal(legal(table).callAmount, 25);
  go(table, 'call'); assert.equal(table.actorId, 'C'); assert.equal(table.phase, 'preflop');
  assert.equal(legal(table).canCheck, true); go(table, 'check');
  assert.equal(table.phase, 'flop'); assert.equal(table.board.length, 3); assert.equal(table.actorId, 'B');
  assert.equal(table.currentBet, 0); assert.equal(table.pot, 150); assert.equal(total(table), 3000);
  checkDown(table); assert.equal(table.board.length, 5); assert.equal(total(table), 3000); assert.equal(table.pot, 0);
});

test('heads-up dealer posts small blind, acts first before flop, last afterward', () => {
  const table = make([1000, 1000]); startHand(table, opts, 1000);
  assert.equal(table.buttonSeat, 0); assert.equal(table.smallBlindSeat, 0); assert.equal(table.bigBlindSeat, 1); assert.equal(table.actorId, 'A');
  go(table, 'call'); go(table, 'check'); assert.equal(table.phase, 'flop'); assert.equal(table.actorId, 'B');
  checkDown(table); const previous = table.actionNumber;
  startHand(table, opts, 2000); assert.equal(table.buttonSeat, 1); assert.equal(table.bigBlindSeat, 0); assert.equal(table.actorId, 'B');
  assert.equal(table.actionNumber, previous + 1); assert.equal(publicTable(table).turnId, table.actionNumber);
});

test('invalid actions reject without state mutation', () => {
  const table = make(); startHand(table, opts, 1000);
  for (const [id, action, code] of [['B', { type: 'call' }, 'NOT_YOUR_TURN'], ['A', { type: 'check' }, 'CANNOT_CHECK'], ['A', { type: 'raise', amount: 75 }, 'MIN_RAISE'], ['A', { type: 'raise', amount: 2000 }, 'INVALID_RAISE'], ['A', { type: 'raise', amount: 100.5 }, 'INVALID_CHIPS'], ['A', { type: 'nope' }, 'INVALID_ACTION']]) {
    const before = JSON.stringify(table); errorCode(() => act(table, id, action, {}, 1001), code); assert.equal(JSON.stringify(table), before);
  }
  errorCode(() => act(table, 'A', { type: 'call' }, {}, table.deadline), 'TURN_EXPIRED');
  const before = table.actionNumber; go(table, 'raise', 150); assert.equal(table.minRaise, 100); assert.equal(legal(table).minRaiseTo, 250); assert.equal(table.actionNumber, before + 1);
});

test('one short all-in does not reopen a caller but unacted players can raise', () => {
  const table = make([1000, 75, 1000]); startHand(table, opts, 1000);
  go(table, 'call'); go(table, 'allin'); assert.equal(table.currentBet, 75); assert.equal(table.minRaise, 50);
  assert.equal(table.actorId, 'C'); assert.equal(legal(table).canRaise, true); assert.equal(legal(table).minRaiseTo, 125);
  go(table, 'call'); assert.equal(table.actorId, 'A'); assert.equal(legal(table).canRaise, false); assert.equal(legal(table).callAmount, 25);
  errorCode(() => go(table, 'allin'), 'CANNOT_RAISE'); go(table, 'call'); assert.equal(table.phase, 'flop');
});

test('cumulative short all-ins reopen only when a full raise is faced', () => {
  const table = make([200, 250, 1000, 1000]); startHand(table, opts, 1000);
  assert.equal(table.actorId, 'D'); go(table, 'raise', 150); assert.equal(table.minRaise, 100);
  go(table, 'allin'); assert.equal(table.currentBet, 200); assert.equal(table.minRaise, 100);
  go(table, 'allin'); assert.equal(table.currentBet, 250); assert.equal(table.minRaise, 100);
  go(table, 'call'); assert.equal(table.actorId, 'D'); assert.equal(legal(table).canRaise, true); assert.equal(legal(table).minRaiseTo, 350);
  go(table, 'raise', 350); assert.equal(table.actorId, 'C'); assert.equal(total(table), 2450);
});

test('an incomplete opening all-in does not reopen earlier checks', () => {
  const table = make([70, 1000, 1000]); startHand(table, opts, 1000);
  go(table, 'call'); go(table, 'call'); go(table, 'check');
  go(table, 'check'); go(table, 'check'); go(table, 'allin');
  assert.equal(table.actorId, 'B'); assert.equal(table.currentBet, 20); assert.equal(legal(table).canRaise, false);
  go(table, 'call'); go(table, 'call'); assert.equal(table.phase, 'turn');
});

test('an unacted player must add a full minimum raise over a short opening all-in', () => {
  const table = make([1000, 70, 1000]); startHand(table, opts, 1000);
  go(table, 'call'); go(table, 'call'); go(table, 'check');
  assert.equal(table.actorId, 'B'); go(table, 'allin');
  assert.equal(table.currentBet, 20); assert.equal(legal(table).canRaise, true); assert.equal(legal(table).minRaiseTo, 70);
  errorCode(() => go(table, 'raise', 50), 'MIN_RAISE'); go(table, 'raise', 70);
  assert.equal(table.minRaise, 50); assert.equal(total(table), 2070);
});

test('all-in blinds run out automatically and unmatched blind chips return', () => {
  const table = make([10, 50]); startHand(table, opts, 1000);
  assert.equal(table.phase, 'showdown'); assert.equal(table.board.length, 5); assert.equal(table.lastPot, 20); assert.equal(total(table), 60);
  const shortBB = make([1000, 10]); startHand(shortBB, opts, 1000);
  assert.equal(shortBB.phase, 'showdown'); assert.equal(shortBB.lastPot, 20); assert.equal(total(shortBB), 1010);
  const three = make([1000, 10, 15]); startHand(three, opts, 1000);
  assert.equal(three.actorId, 'A'); assert.equal(legal(three).callAmount, 15); assert.equal(legal(three).canRaise, false);
  go(three, 'call'); assert.equal(three.phase, 'showdown'); assert.equal(three.lastPot, 40); assert.equal(total(three), 1025);
});

test('main/side pots and unmatched all-in overbet use separate eligible winners', () => {
  const table = make([100, 200, 500]); startHand(table, opts, 1000);
  player(table, 'A').holeCards = cards('As Ah'); player(table, 'B').holeCards = cards('Ks Kh'); player(table, 'C').holeCards = cards('Qs Qh'); forceRunout(table);
  go(table, 'allin'); go(table, 'allin');
  assert.equal(legal(table).canRaise, false); errorCode(() => go(table, 'raise', 500), 'CANNOT_RAISE');
  go(table, 'call');
  assert.equal(table.phase, 'showdown'); assert.deepEqual(table.pots.map(p => p.amount), [300, 200]);
  assert.deepEqual(table.winners.map(w => [w.playerId, w.amount]), [['A', 300], ['B', 200]]);
  assert.deepEqual(table.players.map(p => p.stack), [300, 200, 300]); assert.equal(total(table), 800);
  assert.ok(publicTable(table, null, { tv: true }).players.every(p => p.holeCards.length === 2));
});

test('uncalled full raise is refunded after remaining opponents call all-in', () => {
  const table = make([500, 100, 200]); startHand(table, opts, 1000);
  go(table, 'allin'); go(table, 'call'); go(table, 'call');
  assert.equal(table.lastPot, 500); assert.equal(table.pot, 0); assert.ok(player(table, 'A').stack >= 300); assert.equal(total(table), 800);
});

test('folded best cards never win or appear on TV; dead chips stay in pots', () => {
  const table = make([1000, 1000, 100]); startHand(table, opts, 1000);
  player(table, 'A').holeCards = cards('As Ah'); player(table, 'B').holeCards = cards('Ks Kh'); player(table, 'C').holeCards = cards('Qs Qh'); forceRunout(table);
  go(table, 'raise', 200); go(table, 'call'); go(table, 'call'); assert.equal(table.phase, 'flop');
  go(table, 'check'); go(table, 'fold'); assert.equal(table.phase, 'showdown');
  assert.equal(table.winners[0].playerId, 'B'); assert.equal(table.winners[0].amount, 500);
  const tv = publicTable(table, 'A', { tv: true }); assert.equal(tv.players.find(p => p.id === 'A').holeCards.length, 0);
  assert.equal(publicTable(table, 'A').players.find(p => p.id === 'A').holeCards.length, 2); assert.equal(total(table), 2100);
});

test('split pots award odd chips clockwise from the dealer', () => {
  const table = make([100, 100, 100], { smallBlind: 1, bigBlind: 2 }); startHand(table, { random: () => 0.5 }, 1000);
  player(table, 'A').holeCards = cards('2s 3s'); player(table, 'B').holeCards = cards('4s 5s'); player(table, 'C').holeCards = cards('6s 7s'); forceRunout(table, cards('Ah Kh Qh Jh Th'));
  go(table, 'raise', 5); go(table, 'call'); go(table, 'call'); go(table, 'check'); go(table, 'check'); go(table, 'fold'); checkDown(table);
  assert.deepEqual(table.winners.map(w => [w.playerId, w.amount]), [['B', 8], ['C', 7]]);
  assert.deepEqual(table.players.map(p => p.stack), [95, 103, 102]); assert.equal(total(table), 300);
});

test('uncontested hand ends without revealing cards or dealing a board', () => {
  const table = make(); startHand(table, opts, 1000); go(table, 'fold'); go(table, 'fold');
  assert.equal(table.phase, 'showdown'); assert.equal(table.board.length, 0); assert.equal(table.showCards, false);
  assert.equal(table.lastPot, 50); assert.equal(player(table, 'C').stack, 1025); assert.equal(table.winners[0].amount, 50);
  assert.ok(publicTable(table, 'C', { tv: true }).players.every(p => p.holeCards.length === 0));
  assert.equal(total(table), 3000);
});

test('timeout checks when allowed and folds when facing a bet exactly once', () => {
  const table = make(); startHand(table, opts, 1000);
  const before = JSON.stringify(table); advanceTimeout(table, {}, table.deadline - 1); assert.equal(JSON.stringify(table), before);
  const expiration = table.deadline, number = table.actionNumber;
  advanceTimeout(table, {}, expiration); assert.equal(player(table, 'A').folded, true); assert.equal(table.actionNumber, number + 1);
  advanceTimeout(table, {}, expiration); assert.equal(table.actionNumber, number + 1);
  act(table, table.actorId, { type: 'call' }, {}, expiration + 1);
  const deadline = table.deadline; advanceTimeout(table, {}, deadline);
  assert.equal(table.lastAction.type, 'check'); assert.equal(table.lastAction.timeout, true); assert.equal(table.phase, 'flop');
});

test('dead dealer/small-blind seats do not make surviving players miss the big blind', () => {
  const table = make([1000, 1000, 1000, 1000]); startHand(table, opts, 1000); checkDown(table);
  // Seating fixture: previous big blind C is eliminated before the next hand.
  player(table, 'C').stack = 0;
  startHand(table, opts, 2000); assert.equal(table.bigBlindSeat, 3); assert.equal(table.smallBlindSeat, 2); assert.equal(table.buttonSeat, 1);
  assert.equal(player(table, 'C').inHand, false); assert.equal(player(table, 'C').holeCards.length, 0); assert.equal(player(table, 'D').streetBet, 50);
  checkDown(table); startHand(table, opts, 3000);
  assert.equal(table.bigBlindSeat, 0); assert.equal(table.smallBlindSeat, 3); assert.equal(table.buttonSeat, 2);
});

test('500 randomized complete hands conserve chips, respect actions, and never expose active opponents', () => {
  let seed = 872343; const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 0x100000000);
  for (let hand = 0; hand < 500; hand++) {
    const table = make(Array.from({ length: 2 + Math.floor(random() * 8) }, () => 5 + Math.floor(random() * 1995)));
    const bankroll = total(table); let now = 1000, turns = 0; startHand(table, { random }, now);
    while (table.phase !== 'showdown') {
      const view = publicTable(table, table.actorId), allowed = view.legalActions;
      assert.ok(view.players.filter(p => !p.you).every(p => p.holeCards.length === 0));
      let type, amount;
      const roll = random();
      if (roll < 0.12) type = 'fold';
      else if (roll < 0.38 && allowed.canRaise) { type = 'raise'; amount = allowed.allInOnly || random() < 0.3 ? allowed.maxRaiseTo : allowed.minRaiseTo + Math.floor(random() * (allowed.maxRaiseTo - allowed.minRaiseTo + 1)); }
      else type = allowed.canCheck ? 'check' : 'call';
      now += 10; act(table, table.actorId, { type, amount }, {}, now);
      assert.equal(total(table), bankroll); assert.equal(table.players.reduce((sum, p) => sum + p.contribution, 0), table.pot);
      assert.ok(table.players.every(p => Number.isSafeInteger(p.stack) && p.stack >= 0));
      assert.ok(++turns < 200);
    }
    assert.equal(total(table), bankroll); assert.ok(table.winners.length > 0);
    assert.equal(table.winners.reduce((sum, winner) => sum + winner.amount, 0), table.lastPot);
    const allCards = [...table.deck, ...table.burns, ...table.board, ...table.players.flatMap(p => p.holeCards)];
    assert.equal(allCards.length, 52); assert.equal(new Set(allCards).size, 52);
  }
});

console.log(`PASS ${checks} Poker Night engine checks; 500 complete randomized hands.`);
