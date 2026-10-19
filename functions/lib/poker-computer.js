import {evaluateHand} from './poker-night.js';

const rank = card => '23456789TJQKA'.indexOf(card[0]) + 2;
const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
const straightMasks = new Set([...Array.from({length:9},(_,i)=>31<<(i+2)),(1<<14)|(15<<2)]);

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
  const boardSuits = {};
  for (const card of board) boardSuits[card[1]] = (boardSuits[card[1]] || 0)+1;
  const dangerSuit = Object.keys(boardSuits).find(s => boardSuits[s] >= 3);
  const nutBlocker = !!dangerSuit && cards.includes('A'+dangerSuit);
  const facingRaise = callIsRaise(view, legal);
  let strength, draw = 0, madeRank = -1;
  if (!board.length) {
    strength = pair ? .52 + (high-2)*.033 : .13 + (high-2)*.022 + (low-2)*.012;
    if (!pair) strength += (suited ? .055 : 0) + (gap === 1 ? .045 : gap === 2 ? .02 : 0) + (high === 14 && low <= 5 ? .02 : 0);
    strength += late ? .025 : 0;
  } else {
    const made = evaluateHand([...cards,...board]);
    madeRank = made.rank;
    const ranks = board.map(rank), top = Math.max(...ranks);
    const ownPairs = cards.filter(c => ranks.includes(rank(c))).map(rank);
    // A pair or trips on the board alone is not a strong private hand.
    const boardOnly = board.length === 5 && made.score === evaluateHand(board).score;
    if (boardOnly && made.rank === 8 && made.values[1] === 14) return {type:legal.canCheck ? 'check' : 'call'};
    if (boardOnly) strength = .2;
    else if (made.rank >= 4) strength = .88 + (made.rank-4)*.02;
    else if (made.rank === 3) strength = ownPairs.length || pair ? .87 : .42;
    else if (made.rank === 2) strength = ownPairs.length || pair ? .76 : .36;
    else if (made.rank === 1) strength = pair ? high > top ? .77 : high >= top-3 ? .55 : .4 : ownPairs.length ? Math.max(...ownPairs) === top ? .62 + (cards.map(rank).find(r => r !== top) || 2)/140 : .49 : .24;
    else strength = high === 14 ? .25 : .16;
    if (board.length < 5) {
      // Count distinct next-card straight/flush outs, not overlapping draw
      // labels. A draw supplied entirely by the board is not a private draw.
      const known = new Set([...cards,...board]), outs = new Set();
      for (const suit of 'cdhs') for (const r of '23456789TJQKA') {
        const card = r+suit;
        if (known.has(card)) continue;
        const improved = evaluateHand([...cards,...board,card]);
        if ((improved.rank === 4 || improved.rank === 5) && improved.rank > made.rank &&
            cards.some(c => improved.cards.includes(c)) &&
            (board.length < 4 || improved.score > evaluateHand([...board,card]).score)) outs.add(card);
      }
      draw = outs.size / (52-known.size);
      strength += draw * (board.length === 3 ? 1.25 : .7);
    }
    // Connected, suited boards make modest made hands more vulnerable.
    if (made.rank < 4 && new Set(board.map(c => c[1])).size <= 2 && board.length >= 4) strength -= .04;
    if (dangerSuit && made.rank < 5) strength -= boardSuits[dangerSuit] >= 4 ? .2 : .08;
    // A low flush on a four-suited board is vulnerable to a single higher card.
    if (dangerSuit && boardSuits[dangerSuit] >= 4 && made.rank === 5) {
      const privateFlushHigh = Math.max(0,...cards.filter(c => c[1] === dangerSuit).map(rank));
      strength = Math.min(strength, .52 + privateFlushHigh*.025);
    }
  }
  strength = clamp(strength - Math.max(0,opponents.length-1)*.035,.06,.98);
  const call = legal.callAmount || 0, pot = Math.max(view.bigBlind,view.pot || 0);
  const odds = call / Math.max(1,pot+call), pressure = call / Math.max(1,self.stack);
  const roll = random();
  // Do not turn a weak hand into an automatic stack-sized call. A free check
  // remains free, while inexpensive draws can continue at sensible pot odds.
  if (!legal.canCheck) {
    const requirement = Math.max(.25,odds + .12 + (pressure > .3 ? .13 : 0) + (call > view.bigBlind*8 ? .08 : 0) + (facingRaise ? .09 : 0));
    const pricedDraw = draw > 0 && pressure < .25 && odds <= draw*.9;
    const badDrawPrice = madeRank < 1 && draw > 0 && odds > draw + .04;
    if (badDrawPrice || strength < requirement && !pricedDraw) {
      // Pressure cannot make an unbeatable river hand a fold. Compare only
      // possible unseen cards, never opponents' actual cards or the deck.
      if (board.length === 5 && madeRank >= 4 && riverCannotLose(cards,board)) return {type:'call'};
      return {type:'fold'};
    }
  }
  const valueRaise = strength > (facingRaise ? .86 : .73) && roll < .78 ||
    !facingRaise && !board.length && strength > .57 && pressure < .12 && roll < .28;
  // Bluff mostly in position, against one opponent, with chips behind.
  // Never bluff an all-in opponent or try to push a player out of a dry side pot.
  const effectiveStack = Math.min(self.stack,...actors.map(p => p.stack));
  const bluffRoom = actors.length === opponents.length && effectiveStack > pot*.65;
  const steal = !board.length && suited && (gap <= 2 || high >= 12) && view.currentBet <= view.bigBlind;
  const semiBluff = board.length > 0 && board.length < 5 && draw >= .14;
  const riverBluff = board.length === 5 && nutBlocker && madeRank < 1;
  const bluff = opponents.length === 1 && late && legal.canCheck && bluffRoom && strength < .6 &&
    roll < (semiBluff ? .22 : steal ? .12 : riverBluff ? .1 : 0);
  if (legal.canRaise && actors.length && (valueRaise || bluff)) {
    const fraction = bluff ? .5 : strength > .85 ? .75 : .45;
    const target = !board.length && view.currentBet <= view.bigBlind
      ? Math.round(view.bigBlind*(late ? 2.5 : 3))
      : view.currentBet + Math.max(view.bigBlind*2,Math.round((pot+call)*fraction));
    const amount = Math.min(legal.maxRaiseTo,Math.max(legal.minRaiseTo,target));
    // Large commitments need a strong hand; otherwise use check/call/fold.
    if (strength > .72 || amount-self.streetBet < self.stack*.3) return {type:'raise',amount};
  }
  return {type:legal.canCheck ? 'check' : 'call'};
}

function callIsRaise(view, legal) {
  // A call or fold after a raise must not erase the size of the bet faced.
  return !legal.canCheck && view.currentBet > view.bigBlind;
}

function riverCannotLose(cards,board) {
  const known = new Set([...cards,...board]);
  const unseen = [...'cdhs'].flatMap(suit => [...'23456789TJQKA'].map(r => r+suit)).filter(card => !known.has(card));
  const made = evaluateHand([...cards,...board]), score = made.score;
  const beats = candidate => {
    // Cheap category rejection avoids invoking the full evaluator for the
    // thousands of high-card/pair combinations that cannot beat a straight+.
    const counts = new Uint8Array(15);
    let mask=0,maxCount=0;
    for (const card of candidate) {const r=rank(card);mask|=1<<r;maxCount=Math.max(maxCount,++counts[r]);}
    const flush=candidate.every(card=>card[1]===candidate[0][1]);
    const straight=straightMasks.has(mask);
    const category=flush&&straight?8:maxCount===4?7:maxCount===3&&counts.includes(2)?6:flush?5:straight?4:0;
    return category>=made.rank && evaluateHand(candidate).score>score;
  };
  // Examine each distinct possible five-card best hand once. Evaluating every
  // opponent seven-card holding repeats board/one-hole combinations hundreds
  // of times. Zero-hole combinations cannot beat our own best hand.
  for (let omitted=0;omitted<5;omitted++) {
    const four = board.filter((_,i)=>i!==omitted);
    for (const card of unseen) if (beats([...four,card])) return false;
  }
  for (let a=0;a<3;a++) for (let b=a+1;b<4;b++) for (let c=b+1;c<5;c++) {
    const three=[board[a],board[b],board[c]];
    for (let x=0;x<unseen.length-1;x++) for (let y=x+1;y<unseen.length;y++) {
      if (beats([...three,unseen[x],unseen[y]])) return false;
    }
  }
  return true;
}
