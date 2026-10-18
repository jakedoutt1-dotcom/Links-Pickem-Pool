// A private, one-use choice for this betting round. The server still validates
// the actual move, amount and turn ID when it is submitted.
const betting = new Set(['preflop','flop','turn','river']);
export function preselectOptions(room, playerId) {
  const table = room?.table, player = table?.players?.find(p => p.id === playerId);
  const eligible = !!(room?.status === 'playing' && betting.has(table?.phase) && player?.inHand && !player.folded && !player.allIn && !player.sittingOut && !player.away && player.stack > 0);
  const currentBet = Number(table?.currentBet || 0), streetBet = Number(player?.streetBet || 0), stack = Number(player?.stack || 0);
  const maxRaiseTo = streetBet + stack, minRaiseTo = Math.min(maxRaiseTo,currentBet + Number(table?.minRaise || table?.bigBlind || 0));
  return {eligible,waiting:eligible && table.actorId !== playerId,player,streetBet,stack,currentBet,
    callAmount:Math.min(stack,Math.max(0,currentBet - streetBet)),minRaiseTo,maxRaiseTo,
    canRaise:eligible && maxRaiseTo > currentBet && table.players.some(p => p.id !== playerId && p.inHand && !p.folded && p.stack > 0)};
}
export function choosePreselection(room, playerId, move, amount) {
  const options = preselectOptions(room,playerId), table = room?.table;
  if (!options.waiting || !['fold','call','raise'].includes(move)) return null;
  if (move === 'raise' && (!options.canRaise || !Number.isInteger(amount) || amount < options.minRaiseTo || amount > options.maxRaiseTo)) return null;
  return {code:room.code,playerId,tableId:table.id,handNumber:table.handNumber,phase:table.phase,
    currentBet:options.currentBet,minRaise:table.minRaise,stack:options.stack,streetBet:options.streetBet,
    callAmount:options.callAmount,move,...(move === 'raise' ? {amount} : {})};
}
export function resolvePreselection(choice, room, playerId) {
  if (!choice) return {state:'none'};
  const options = preselectOptions(room,playerId), table = room?.table;
  const cancel = reason => ({state:'cancel',reason});
  if (!options.eligible || choice.code !== room.code || choice.playerId !== playerId || choice.tableId !== table.id || choice.handNumber !== table.handNumber || choice.phase !== table.phase || choice.stack !== options.stack || choice.streetBet !== options.streetBet) return cancel('Selection cleared. Review the current hand.');
  if (choice.move !== 'fold' && (choice.currentBet !== options.currentBet || (choice.move === 'raise' && choice.minRaise !== table.minRaise))) return cancel('The bet changed. Choose your move again.');
  if (options.waiting) return {state:'waiting'};
  const legal = table.legalActions || {};
  if (choice.move === 'fold' && legal.canFold) return {state:'ready',move:'fold'};
  if (choice.move === 'call' && legal.canCheck) return {state:'ready',move:'check'};
  if (choice.move === 'call' && legal.canCall && legal.callAmount > 0 && legal.callAmount <= choice.callAmount) return {state:'ready',move:'call'};
  if (choice.move === 'raise' && legal.canRaise && choice.amount <= legal.maxRaiseTo && (choice.amount >= legal.minRaiseTo || choice.amount === legal.maxRaiseTo)) return {state:'ready',move:'raise',amount:choice.amount};
  return cancel('That move is no longer available. Choose your move again.');
}
