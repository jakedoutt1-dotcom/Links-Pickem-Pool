import {evaluateHand} from './poker-night.js';

const rank = card => '23456789TJQKA'.indexOf(card[0]) + 2;
const clamp = (value,min,max) => Math.max(min,Math.min(max,value));

// Accept only the player's sanitized table view. Never inspect the deck,
// opponents' private cards, or upcoming community cards.
export function computerMove(view, playerId, random = () => crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000) {
  const self = view.players.find(p => p.id === playerId), legal = view.legalActions;
  const cards = self?.holeCards || [], board = view.board || [];
  if (cards.length !== 2) return {type:legal.canCheck ? 'check' : 'fold'};
  const opponents = view.players.filter(p => p.id !== playerId && p.inHand && !p.folded);
  const actors = opponents.filter(p => p.stack > 0);
  const ordered = view.players.filter(p => p.inHand && !p.folded).slice().sort((a,b) => a.seat-b.seat);
  const last = ordered.filter(p => p.seat <= view.buttonSeat).at(-1) || ordered.at(-1);
  const late = last?.id === playerId || (ordered.length === 2 && view.phase === 'preflop' && view.buttonSeat === self.seat);
  const high = Math.max(...cards.map(rank)), low = Math.min(...cards.map(rank));
  const pair = high === low, suited = cards[0][1] === cards[1][1], gap = high-low;
  let strength, draw = 0;
  if (!board.length) {
    strength = pair ? .52 + (high-2)*.033 : .13 + (high-2)*.022 + (low-2)*.012;
    if (!pair) strength += (suited ? .055 : 0) + (gap === 1 ? .045 : gap === 2 ? .02 : 0) + (high === 14 && low <= 5 ? .02 : 0);
    strength += late ? .025 : 0;
  } else {
    const made = evaluateHand([...cards,...board]);
    const ranks = board.map(rank), top = Math.max(...ranks);
    const ownPairs = cards.filter(c => ranks.includes(rank(c))).map(rank);
    // A pair or trips on the board alone is not a strong private hand.
    const boardOnly = board.length === 5 && made.score === evaluateHand(board).score;
    if (boardOnly && made.rank === 8 && made.values[1] === 14) return {type:legal.canCheck ? 'check' : 'call'};
    if (boardOnly) strength = .2;
    else if (made.rank >= 4) strength = .88 + (made.rank-4)*.02;
    else if (made.rank === 3) strength = ownPairs.length || pair ? .87 : .42;
    else if (made.rank === 2) strength = ownPairs.length || pair ? .76 : .36;
    else if (made.rank === 1) strength = pair ? high > top ? .77 : high >= top-3 ? .55 : .4 : ownPairs.length ? Math.max(...ownPairs) === top ? .7 : .49 : .24;
    else strength = high === 14 ? .25 : .16;
    if (board.length < 5) {
      const all = [...cards,...board], counts = {};
      for (const c of all) counts[c[1]] = (counts[c[1]] || 0)+1;
      const flushDraw = Object.entries(counts).some(([s,n]) => n === 4 && cards.some(c => c[1] === s));
      const unique = new Set(all.map(rank)); if (unique.has(14)) unique.add(1);
      let straightDraw = false;
      for (let start=1;start<=10;start++) {
        const window = Array.from({length:5},(_,i) => start+i);
        if (window.filter(n => unique.has(n)).length === 4 && cards.some(c => window.includes(rank(c)) || rank(c) === 14 && window.includes(1))) straightDraw = true;
      }
      draw = (flushDraw ? .17 : 0) + (straightDraw ? .1 : 0);
      strength += draw * (board.length === 3 ? 1.25 : .7);
    }
    // Connected, suited boards make modest made hands more vulnerable.
    if (made.rank < 4 && new Set(board.map(c => c[1])).size <= 2 && board.length >= 4) strength -= .04;
  }
  strength = clamp(strength - Math.max(0,opponents.length-1)*.035,.06,.98);
  const call = legal.callAmount || 0, pot = Math.max(view.bigBlind,view.pot || 0);
  const odds = call / Math.max(1,pot+call), pressure = call / Math.max(1,self.stack);
  const roll = random();
  // Do not turn a weak hand into an automatic stack-sized call. A free check
  // remains free, while inexpensive draws can continue at sensible pot odds.
  if (!legal.canCheck) {
    const requirement = Math.max(.25,odds + .12 + (pressure > .3 ? .13 : 0) + (call > view.bigBlind*8 ? .08 : 0));
    if (strength < requirement && !(draw > 0 && pressure < .18 && odds < draw + .06) && !(pressure < .1 && roll < .055)) return {type:'fold'};
  }
  const valueRaise = strength > .73 && roll < .78 || strength > .57 && pressure < .12 && roll < .28;
  const bluff = opponents.length <= 2 && late && pressure < .05 && strength < .5 && roll < (draw ? .13 : .045);
  if (legal.canRaise && actors.length && (valueRaise || bluff)) {
    const target = view.currentBet + Math.max(view.bigBlind*2,Math.round((pot+call)*(strength > .85 ? .75 : .5)));
    const amount = Math.min(legal.maxRaiseTo,Math.max(legal.minRaiseTo,target));
    // Large commitments need a strong hand; otherwise use check/call/fold.
    if (strength > .72 || amount-self.streetBet < self.stack*.3) return {type:'raise',amount};
  }
  return {type:legal.canCheck ? 'check' : 'call'};
}
