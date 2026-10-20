// Store only public result text and community cards, never private hole cards.
export function createHandRecap() {
  let scope = '', result = null;
  return {
    update(code, table) {
      if (scope !== code) { scope = code; result = null; }
      if (!table || !['showdown','complete'].includes(table.phase) || !table.winners?.length) return result;
      const key = `${code}:${table.id}:${table.handNumber}`;
      if (result?.key === key) return result;
      const names = id => table.players?.find(p => p.id === id)?.name || table.winners.find(w => w.playerId === id)?.name || 'Player';
      const rows = (table.pots || []).map((pot,index) => {
        const ids = [...new Set(pot.winnerIds || [])];
        const ordered = ids.slice().sort((a,b) => {
          const seat = id => table.players?.find(p => p.id === id)?.seat ?? 0;
          const distance = id => (seat(id)-Number(table.buttonSeat ?? -1)+9)%9 || 9;
          return distance(a)-distance(b);
        });
        const share = Math.floor(pot.amount / Math.max(1,ids.length)), odd = pot.amount % Math.max(1,ids.length);
        return {label:index ? `Side pot ${index}` : 'Main pot', amount:pot.amount,
          winners:ordered.map((id,i) => ({name:names(id),amount:share+(i<odd?1:0)}))};
      });
      result = {key,handNumber:table.handNumber,tableId:table.id,board:[...(table.board || [])],pots:rows,
        winners:table.winners.map(w => ({name:w.name || names(w.playerId),amount:w.amount,handName:w.handName || ''}))};
      return result;
    }
  };
}

export function recapLines(result) {
  if (!result) return [];
  const format = value => Number(value || 0).toLocaleString();
  const lines = result.winners.map(w => `${w.name}: ${format(w.amount)} chips awarded${w.handName === 'Uncontested' ? ' · everyone else folded' : w.handName ? ` · ${w.handName}` : ''}`);
  if (result.pots.length > 1) for (const pot of result.pots) {
    lines.push(`${pot.label} · ${format(pot.amount)} chips: ${pot.winners.map(w=>`${w.name} ${format(w.amount)}`).join(' · ')}`);
  }
  return lines;
}
