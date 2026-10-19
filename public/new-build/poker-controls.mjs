export function raisePreset(table, preset) {
  const legal = table?.legalActions || {}, min = Math.min(Number(legal.minRaiseTo || 0), Number(legal.maxRaiseTo || 0)), max = Number(legal.maxRaiseTo || 0);
  const potAfterCall = Number(table?.pot || 0) + Number(legal.callAmount || 0);
  const requested = preset === 'all' ? max : preset === 'pot' ? Number(table?.currentBet || 0) + potAfterCall : preset === 'half' ? Number(table?.currentBet || 0) + Math.ceil(potAfterCall / 2) : min;
  return Math.min(max, Math.max(min, requested));
}
export function validRaise(table, amount) {
  const legal = table?.legalActions || {};
  return !!legal.canRaise && Number.isInteger(amount) && amount > 0 && amount <= legal.maxRaiseTo && (amount >= legal.minRaiseTo || amount === legal.maxRaiseTo);
}
