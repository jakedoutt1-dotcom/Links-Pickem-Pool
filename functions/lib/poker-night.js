// LINKS Poker Night: integer virtual chips, server-only cards and betting state.
// Raise amounts are the TOTAL street bet ("raise to"), never additional chips.
// Tournament betting follows the Poker TDA full-raise / cumulative-short-all-in rule.
const RANKS = '23456789TJQKA';
const SUITS = 'cdhs';
const BETTING = new Set(['preflop', 'flop', 'turn', 'river']);
const MAX_CHIPS = 1_000_000_000_000;

function fail(code, message) { const error = new Error(message); error.code = code; throw error; }
function chips(value, label, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum || value > MAX_CHIPS) fail('INVALID_CHIPS', `${label} must be whole virtual chips.`);
  return value;
}
function settings(options = {}, previous = {}) {
  const smallBlind = chips(options.smallBlind ?? previous.smallBlind ?? 25, 'Small blind', 1);
  const bigBlind = chips(options.bigBlind ?? previous.bigBlind ?? 50, 'Big blind', 1);
  if (bigBlind < smallBlind) fail('INVALID_BLINDS', 'The big blind cannot be smaller than the small blind.');
  const turnSeconds = Number(options.turnSeconds ?? previous.turnSeconds ?? 30);
  if (!Number.isFinite(turnSeconds) || turnSeconds < 5 || turnSeconds > 180) fail('INVALID_TIMER', 'Choose a turn timer from 5 to 180 seconds.');
  return { smallBlind, bigBlind, turnSeconds };
}
function ordered(players) { return [...players].sort((a, b) => a.seat - b.seat); }
function after(players, seat) { const list = ordered(players); return list.find(p => p.seat > seat) || list[0]; }
function live(table) { return table.players.filter(p => p.inHand && !p.folded); }
function canAct(player) { return player.inHand && !player.folded && player.stack > 0; }
function contribution(table) { return table.players.reduce((total, p) => total + p.contribution, 0); }
function setActor(table, player, now) {
  table.actorId = player?.id || null;
  table.deadline = player ? now + table.turnSeconds * 1000 : 0;
}

export function cardDeck() { return [...SUITS].flatMap(suit => [...RANKS].map(rank => rank + suit)); }
function randomBelow(upper, random) {
  if (random) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) fail('INVALID_RANDOM', 'The test random source must return a value from 0 to less than 1.');
    return Math.floor(value * upper);
  }
  // Rejection sampling avoids modulo bias; Math.random is never used for dealing.
  const limit = 0x100000000 - (0x100000000 % upper), buffer = new Uint32Array(1);
  do { globalThis.crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
  return buffer[0] % upper;
}
function shuffledDeck(random) {
  const deck = cardDeck();
  for (let i = deck.length - 1; i > 0; i--) { const j = randomBelow(i + 1, random); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  return deck;
}

function evaluateFive(cards) {
  const ranks = cards.map(card => RANKS.indexOf(card[0]) + 2).sort((a, b) => b - a);
  const counts = new Map();
  for (const rank of ranks) counts.set(rank, (counts.get(rank) || 0) + 1);
  const groups = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const flush = cards.every(card => card[1] === cards[0][1]);
  const unique = [...counts.keys()].sort((a, b) => b - a);
  const straight = unique.length === 5 && (unique[0] - unique[4] === 4 ? unique[0] : unique.join(',') === '14,5,4,3,2' ? 5 : 0);
  let values, name;
  if (flush && straight) { values = [8, straight]; name = straight === 14 ? 'Royal flush' : 'Straight flush'; }
  else if (groups[0][1] === 4) { values = [7, groups[0][0], groups[1][0]]; name = 'Four of a kind'; }
  else if (groups[0][1] === 3 && groups[1][1] === 2) { values = [6, groups[0][0], groups[1][0]]; name = 'Full house'; }
  else if (flush) { values = [5, ...ranks]; name = 'Flush'; }
  else if (straight) { values = [4, straight]; name = 'Straight'; }
  else if (groups[0][1] === 3) { values = [3, groups[0][0], ...groups.slice(1).map(g => g[0])]; name = 'Three of a kind'; }
  else if (groups[0][1] === 2 && groups[1][1] === 2) { values = [2, Math.max(groups[0][0], groups[1][0]), Math.min(groups[0][0], groups[1][0]), groups[2][0]]; name = 'Two pair'; }
  else if (groups[0][1] === 2) { values = [1, groups[0][0], ...groups.slice(1).map(g => g[0])]; name = 'One pair'; }
  else { values = [0, ...ranks]; name = 'High card'; }
  const padded = [...values]; while (padded.length < 6) padded.push(0);
  return { rank: values[0], name, values, score: padded.reduce((score, value) => score * 15 + value, 0), cards: [...cards] };
}

export function evaluateHand(cards) {
  if (!Array.isArray(cards) || cards.length < 5 || cards.length > 7 || new Set(cards).size !== cards.length || cards.some(card => typeof card !== 'string' || !/^[2-9TJQKA][cdhs]$/.test(card))) {
    fail('INVALID_CARDS', 'A hand needs five to seven different valid cards.');
  }
  let best = null;
  for (let a = 0; a < cards.length - 4; a++) for (let b = a + 1; b < cards.length - 3; b++) for (let c = b + 1; c < cards.length - 2; c++) for (let d = c + 1; d < cards.length - 1; d++) for (let e = d + 1; e < cards.length; e++) {
    const hand = evaluateFive([cards[a], cards[b], cards[c], cards[d], cards[e]]);
    if (!best || hand.score > best.score) best = hand;
  }
  return best;
}

export function createTable(id, players = [], options = {}, now = Date.now()) {
  if (!Array.isArray(players) || players.length > 9) fail('TABLE_FULL', 'A table supports up to nine players.');
  const ids = new Set(), seats = new Set();
  const copy = players.map((player, index) => {
    if (typeof player.id !== 'string' || !player.id || ids.has(player.id)) fail('INVALID_PLAYER', 'Each player needs a unique ID.');
    const seat = player.seat ?? index;
    if (!Number.isInteger(seat) || seat < 0 || seat > 8 || seats.has(seat)) fail('INVALID_SEAT', 'Each player needs a different seat from zero to eight.');
    ids.add(player.id); seats.add(seat);
    return { id: player.id, name: String(player.name || 'Player').slice(0, 40), stack: chips(player.stack ?? 5000, 'Stack'), seat, sittingOut: !!player.sittingOut, holeCards: [], inHand: false, folded: false, allIn: false, contribution: 0, streetBet: 0, actedAtBet: null, voluntaryShown: false };
  });
  if (copy.reduce((sum, p) => sum + p.stack, 0) > MAX_CHIPS) fail('INVALID_CHIPS', 'The table chip total is too large.');
  return { id, players: copy, ...settings(options), phase: 'waiting', handNumber: 0, actionNumber: 0, buttonSeat: null, smallBlindSeat: null, bigBlindSeat: null, actorId: null, board: [], pot: 0, lastPot: 0, currentBet: 0, minRaise: options.bigBlind ?? 50, deadline: 0, handEndsAt: 0, winners: [], pots: [], message: 'Waiting for players.', lastAction: null, createdAt: now, pending: [], deck: [], burns: [], showCards: false };
}

function pay(table, player, amount) {
  const paid = Math.min(player.stack, amount);
  player.stack -= paid; player.streetBet += paid; player.contribution += paid;
  player.allIn = player.stack === 0;
  table.pot = contribution(table);
  return paid;
}

export function startHand(table, options = {}, now = Date.now()) {
  if (!['waiting', 'showdown'].includes(table.phase)) fail('HAND_RUNNING', 'Finish the current hand first.');
  const participants = ordered(table.players.filter(p => p.stack > 0));
  if (participants.length < 2) fail('NEED_PLAYERS', 'At least two players with chips are needed.');
  if (participants.length > 9) fail('TABLE_FULL', 'A table supports up to nine players.');
  const nextSettings = settings(options, table), deck = shuffledDeck(options.random);
  Object.assign(table, nextSettings);
  const previousBB = table.bigBlindSeat, previousSB = table.smallBlindSeat;
  if (!table.handNumber || previousBB === null) {
    table.buttonSeat = participants[0].seat;
    table.smallBlindSeat = participants.length === 2 ? table.buttonSeat : after(participants, table.buttonSeat).seat;
    table.bigBlindSeat = after(participants, table.smallBlindSeat).seat;
  } else {
    // Advance the big blind first. A busted small-blind/dealer seat can be dead;
    // this prevents an elimination from letting the next player skip a big blind.
    table.bigBlindSeat = after(participants, previousBB).seat;
    if (participants.length === 2) {
      table.buttonSeat = participants.find(p => p.seat !== table.bigBlindSeat).seat;
      table.smallBlindSeat = table.buttonSeat;
    } else {
      table.smallBlindSeat = previousBB;
      table.buttonSeat = previousSB ?? table.buttonSeat;
    }
  }
  table.handNumber++; table.actionNumber = (table.actionNumber || 0) + 1; table.phase = 'preflop'; table.board = []; table.deck = deck; table.burns = [];
  table.pot = 0; table.lastPot = 0; table.currentBet = table.bigBlind; table.minRaise = table.bigBlind;
  table.winners = []; table.pots = []; table.showCards = false; table.handEndsAt = 0; table.lastAction = null;
  for (const player of table.players) Object.assign(player, { handStartStack: player.stack, holeCards: [], inHand: player.stack > 0, folded: false, allIn: false, contribution: 0, streetBet: 0, actedAtBet: null, voluntaryShown: false });
  const dealOrder = [...participants.filter(p => p.seat > table.buttonSeat), ...participants.filter(p => p.seat <= table.buttonSeat)];
  for (let round = 0; round < 2; round++) for (const player of dealOrder) player.holeCards.push(table.deck.pop());
  const sb = participants.find(p => p.seat === table.smallBlindSeat), bb = participants.find(p => p.seat === table.bigBlindSeat);
  if (sb) pay(table, sb, table.smallBlind);
  pay(table, bb, table.bigBlind);
  table.pending = participants.filter(canAct).map(p => p.id);
  table.message = `Hand ${table.handNumber}. Blinds ${table.smallBlind}/${table.bigBlind}.`;
  progress(table, table.bigBlindSeat, now);
  return table;
}

function legal(table, player) {
  const enabled = !!player && BETTING.has(table.phase) && table.actorId === player.id && canAct(player);
  const owed = enabled ? Math.max(0, table.currentBet - player.streetBet) : 0;
  const otherStack = player && live(table).some(p => p.id !== player.id && p.stack > 0);
  const reopened = player && (player.actedAtBet === null || table.currentBet - player.actedAtBet >= table.minRaise);
  const maxRaiseTo = enabled ? player.streetBet + player.stack : 0;
  const canRaise = !!(enabled && otherStack && reopened && maxRaiseTo > table.currentBet);
  return { canFold: enabled, canCheck: enabled && owed === 0, canCall: enabled && owed > 0, callAmount: enabled ? Math.min(owed, player.stack) : 0, minRaiseTo: enabled ? table.currentBet + table.minRaise : 0, maxRaiseTo, canRaise, canAllIn: !!(enabled && (maxRaiseTo <= table.currentBet || canRaise)), allInOnly: canRaise && maxRaiseTo < table.currentBet + table.minRaise };
}

export function act(table, playerId, action = {}, options = {}, now = Date.now()) {
  if (!BETTING.has(table.phase)) fail('NO_ACTIVE_HAND', 'There is no active betting round.');
  if (table.actorId !== playerId) fail('NOT_YOUR_TURN', 'Wait for your turn.');
  if (now >= table.deadline && !options.timeout) fail('TURN_EXPIRED', 'Your turn timer has expired.');
  const player = table.players.find(p => p.id === playerId), allowed = legal(table, player);
  let type = String(action.type || '').toLowerCase().replace(/[-_]/g, '');
  if (type === 'bet') type = 'raise';
  let amount = action.amount;
  if (type === 'allin') { amount = allowed.maxRaiseTo; type = amount > table.currentBet ? 'raise' : 'call'; }
  let paid = 0;
  if (type === 'fold') player.folded = true;
  else if (type === 'check') {
    if (!allowed.canCheck) fail('CANNOT_CHECK', 'Call or fold while facing a bet.');
  } else if (type === 'call') {
    if (!allowed.canCall) fail('CANNOT_CALL', 'There is no bet to call.');
    paid = pay(table, player, allowed.callAmount);
  } else if (type === 'raise') {
    if (!allowed.canRaise) fail('CANNOT_RAISE', 'Betting has not reopened, or no other player can call a raise.');
    chips(amount, 'Raise', 1);
    if (amount > allowed.maxRaiseTo || amount <= table.currentBet) fail('INVALID_RAISE', 'Choose a raise within your chip stack and above the current bet.');
    if (amount < allowed.minRaiseTo && amount !== allowed.maxRaiseTo) fail('MIN_RAISE', `The minimum raise is to ${allowed.minRaiseTo}; a smaller raise must be all-in.`);
    const increase = amount - table.currentBet;
    paid = pay(table, player, amount - player.streetBet);
    if (increase >= table.minRaise) table.minRaise = increase;
    table.currentBet = amount;
    for (const other of table.players.filter(canAct)) if (other.id !== playerId && other.streetBet < amount && !table.pending.includes(other.id)) table.pending.push(other.id);
  } else fail('INVALID_ACTION', 'Choose fold, check, call, raise, or all-in.');
  player.actedAtBet = table.currentBet;
  table.actionNumber = (table.actionNumber || 0) + 1;
  table.pending = table.pending.filter(id => id !== playerId);
  table.lastAction = { playerId, type, amount: paid, to: player.streetBet, at: now, timeout: !!options.timeout, allIn: player.allIn };
  table.message = `${player.name} ${type === 'raise' ? `raises to ${player.streetBet}` : type === 'call' ? `calls ${paid}` : type === 'check' ? 'checks' : 'folds'}${player.allIn && type !== 'fold' ? ' (all-in)' : ''}.`;
  progress(table, player.seat, now);
  return table;
}

function refundUncalled(table) {
  const bets = table.players.filter(p => p.inHand).sort((a, b) => b.streetBet - a.streetBet);
  if (bets.length < 2 || bets[0].streetBet <= bets[1].streetBet) return;
  const refund = bets[0].streetBet - bets[1].streetBet;
  bets[0].stack += refund; bets[0].streetBet -= refund; bets[0].contribution -= refund; bets[0].allIn = bets[0].stack === 0;
  table.pot = contribution(table);
}
function nextStreet(table) {
  table.burns.push(table.deck.pop());
  if (table.phase === 'preflop') { table.phase = 'flop'; for (let i = 0; i < 3; i++) table.board.push(table.deck.pop()); }
  else { table.phase = table.phase === 'flop' ? 'turn' : 'river'; table.board.push(table.deck.pop()); }
  table.currentBet = 0; table.minRaise = table.bigBlind;
  for (const player of table.players) { player.streetBet = 0; player.actedAtBet = null; }
  table.pending = table.players.filter(canAct).map(p => p.id);
}
function progress(table, previousSeat, now) {
  const remaining = live(table);
  if (remaining.length === 1) { refundUncalled(table); settle(table, now, false); return; }
  const actors = remaining.filter(canAct);
  table.pending = table.pending.filter(id => actors.some(p => p.id === id));
  if (actors.length === 1) {
    // An otherwise uncallable full big blind is not owed against only short all-ins.
    table.currentBet = Math.max(...remaining.map(p => p.streetBet));
    table.pending = actors[0].streetBet < table.currentBet ? [actors[0].id] : [];
  }
  if (table.pending.length) { setActor(table, after(actors.filter(p => table.pending.includes(p.id)), previousSeat), now); return; }
  refundUncalled(table);
  if (table.phase === 'river') { settle(table, now, true); return; }
  if (actors.length < 2) {
    while (table.board.length < 5) nextStreet(table);
    settle(table, now, true);
  } else {
    nextStreet(table);
    setActor(table, after(table.players.filter(canAct), table.buttonSeat), now);
  }
}

function settle(table, now, reveal) {
  const eligible = live(table), ranks = new Map();
  if (reveal) for (const player of eligible) ranks.set(player.id, evaluateHand([...player.holeCards, ...table.board]));
  const levels = [...new Set(table.players.map(p => p.contribution).filter(Boolean))].sort((a, b) => a - b);
  const payouts = new Map();
  let previous = 0;
  table.pots = []; table.lastPot = table.pot;
  for (const level of levels) {
    const contributors = table.players.filter(p => p.contribution >= level);
    const amount = (level - previous) * contributors.length; previous = level;
    const candidates = eligible.filter(p => p.contribution >= level);
    if (!candidates.length) fail('INVALID_POT', 'A side pot has no eligible player.');
    const best = reveal ? Math.max(...candidates.map(p => ranks.get(p.id).score)) : 0;
    const winners = candidates.filter(p => !reveal || ranks.get(p.id).score === best);
    const clockwise = [...ordered(winners).filter(p => p.seat > table.buttonSeat), ...ordered(winners).filter(p => p.seat <= table.buttonSeat)];
    const share = Math.floor(amount / winners.length), odd = amount % winners.length;
    clockwise.forEach((player, i) => { const value = share + (i < odd ? 1 : 0); player.stack += value; payouts.set(player.id, (payouts.get(player.id) || 0) + value); });
    table.pots.push({ amount, eligibleIds: candidates.map(p => p.id), winnerIds: winners.map(p => p.id) });
  }
  table.winners = [...payouts].map(([playerId, amount]) => ({ playerId, name: table.players.find(p => p.id === playerId).name, amount, handName: reveal ? ranks.get(playerId).name : 'Uncontested', ...(reveal ? { cards: ranks.get(playerId).cards } : {}) }));
  table.showCards = reveal; table.phase = 'showdown'; table.pending = []; table.pot = 0; table.currentBet = 0;
  for (const player of table.players) { player.contribution = 0; player.streetBet = 0; player.allIn = player.stack === 0; }
  setActor(table, null, now); table.handEndsAt = now + 8000;
  table.message = table.winners.map(winner => `${winner.name} wins ${winner.amount}${reveal ? ` with ${winner.handName.toLowerCase()}` : ''}`).join('. ') + '.';
}

export function advanceTimeout(table, options = {}, now = Date.now()) {
  if (!BETTING.has(table.phase) || !table.actorId || now < table.deadline) return table;
  const player = table.players.find(p => p.id === table.actorId);
  return act(table, player.id, { type: legal(table, player).canCheck ? 'check' : 'fold' }, { ...options, timeout: true }, now);
}

function automaticallyShown(table, player) {
  return !!(table.phase === 'showdown' && table.showCards && player?.inHand && !player.folded);
}
function canShow(table, player) {
  return !!(table.phase === 'showdown' && player?.inHand && player.holeCards.length === 2 && !player.voluntaryShown && !automaticallyShown(table, player));
}
export function showHand(table, playerId) {
  const player = table.players.find(p => p.id === playerId);
  // Idempotent within this completed hand. The tournament/API layer also binds
  // the authenticated player to the requested table and hand number.
  if (table.phase === 'showdown' && player?.inHand && player.voluntaryShown) return table;
  if (!canShow(table, player)) fail('CANNOT_SHOW_HAND', 'You can show your own hidden cards only after this hand has ended.');
  player.voluntaryShown = true;
  return table;
}

export function publicTable(table, viewerId = null, { tv = false, allowShow = true } = {}) {
  const viewer = tv ? null : table.players.find(p => p.id === viewerId);
  const yourHandName = viewer?.holeCards?.length === 2 ? table.board.length >= 3
    ? evaluateHand([...viewer.holeCards,...table.board]).name
    : viewer.holeCards[0][0] === viewer.holeCards[1][0] ? 'One pair' : 'High card' : null;
  return {
    yourHandName,
    id: table.id, phase: table.phase, handNumber: table.handNumber, actionNumber: table.actionNumber, turnId: table.actionNumber, buttonSeat: table.buttonSeat,
    smallBlindSeat: table.smallBlindSeat, bigBlindSeat: table.bigBlindSeat, smallBlind: table.smallBlind, bigBlind: table.bigBlind,
    turnSeconds: table.turnSeconds, actorId: table.actorId, board: [...table.board], pot: table.pot, lastPot: table.lastPot,
    currentBet: table.currentBet, minRaise: table.minRaise, deadline: table.deadline, handEndsAt: table.handEndsAt,
    message: table.message, showCards: table.showCards, canShowHand: !!allowShow && canShow(table, viewer),
    lastAction: table.lastAction ? { ...table.lastAction } : null,
    winners: table.winners.map(w => ({ ...w, ...(w.cards ? { cards: [...w.cards] } : {}) })),
    pots: table.pots.map(pot => ({ amount: pot.amount, eligibleIds: [...pot.eligibleIds], winnerIds: [...pot.winnerIds] })),
    players: ordered(table.players).map(player => {
      const voluntaryShown = !!(table.phase === 'showdown' && player.inHand && player.voluntaryShown);
      const cardsShown = automaticallyShown(table, player) || voluntaryShown;
      const reveal = viewer?.id === player.id || cardsShown;
      return {
        id: player.id, name: player.name, seat: player.seat, stack: player.stack,
        streetBet: player.streetBet, bet: player.streetBet, contribution: player.contribution, inHand: player.inHand, folded: player.folded,
        allIn: player.allIn, sittingOut: !!player.sittingOut, you: viewer?.id === player.id, voluntaryShown, cardsShown,
        isDealer: player.seat === table.buttonSeat, isSmallBlind: player.seat === table.smallBlindSeat, isBigBlind: player.seat === table.bigBlindSeat,
        holeCards: reveal ? [...player.holeCards] : [], holeCardCount: player.holeCards.length,
        hiddenCardCount: !reveal && !player.folded ? player.holeCards.length : 0
      };
    }),
    legalActions: legal(table, viewer)
  };
}
