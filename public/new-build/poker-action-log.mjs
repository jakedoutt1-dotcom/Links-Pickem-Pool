// A local view of public actions observed while this table is open, never a hand history.
export function createActionLog({limit = 8} = {}) {
  const capacity = Math.max(1, Math.min(20, Math.floor(Number(limit) || 8)));
  let scope = '', entries = [], lastSequence = -1;
  return {
    reset() { scope = ''; entries = []; lastSequence = -1; },
    update(roomCode, table) {
      if (!table) { this.reset(); return []; }
      const nextScope = JSON.stringify([String(roomCode || ''), table.id, table.handNumber]);
      if (scope !== nextScope) { scope = nextScope; entries = []; lastSequence = -1; }
      const action = table.lastAction;
      const sequence = Number(table.actionNumber ?? table.turnId);
      if (!action || !Number.isSafeInteger(sequence) || sequence <= lastSequence) return entries.map(entry => ({...entry}));
      lastSequence = sequence;
      const type = action.type;
      if (!['fold', 'check', 'call', 'raise'].includes(type)) return entries.map(entry => ({...entry}));
      const name = String(table.players?.find(player => player.id === action.playerId)?.name || 'Player');
      const amount = type === 'raise' ? action.to : action.amount;
      if (['call', 'raise'].includes(type) && (!Number.isSafeInteger(amount) || amount < 0)) return entries.map(entry => ({...entry}));
      const move = type === 'fold' ? 'folds' : type === 'check' ? 'checks' : type === 'raise' ? `raises to ${amount.toLocaleString()}` : `calls ${amount.toLocaleString()}`;
      const suffix = action.allIn && ['call', 'raise'].includes(type) ? ' · all-in' : '';
      entries.unshift({key: `${scope}:${sequence}`, text: `${name} ${move}${suffix}${action.timeout ? ' · timer expired' : ''}`});
      entries = entries.slice(0, capacity);
      return entries.map(entry => ({...entry}));
    },
  };
}

export function renderActionLog(list, entries) {
  const signature = JSON.stringify(entries);
  if (list.dataset.actions === signature) return;
  list.dataset.actions = signature;
  const document = list.ownerDocument;
  const rows = entries.map(entry => {
    const row = document.createElement('li');
    row.textContent = entry.text;
    return row;
  });
  if (!rows.length) {
    const empty = document.createElement('li');
    empty.textContent = 'New actions will appear here as players act.';
    rows.push(empty);
  }
  list.replaceChildren(...rows);
}
