const centralDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Chicago',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

function centralCalendarDay(timestamp) {
  const parts = Object.fromEntries(centralDate.formatToParts(timestamp).map(part => [part.type, part.value]));
  return new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
}

function isRecapDay(day) {
  return day.getUTCDay() === 1 || day.getUTCDay() === 2;
}

export function recapIsOpen(lastKickoff, now = Date.now()) {
  const kickoff = Date.parse(lastKickoff);
  if (!Number.isFinite(kickoff) || now < kickoff) return false;

  const today = centralCalendarDay(now);
  if (!isRecapDay(today)) return false;
  const lastGameDay = centralCalendarDay(kickoff);
  const daysUntilWednesday = (3 - lastGameDay.getUTCDay() + 7) % 7;
  lastGameDay.setUTCDate(lastGameDay.getUTCDate() + daysUntilWednesday);
  return today < lastGameDay;
}

function currentPlayer() {
  const params = new URLSearchParams(location.search);
  const pool = params.get('pool');
  const savedPool = JSON.parse(localStorage.getItem('links-current-pool') || 'null');
  const player = localStorage.getItem('links-player-id');
  if (!pool || pool !== String(savedPool?.id) || !player) return null;
  return {pool, player};
}

async function showRecap() {
  const session = currentPlayer();
  if (!session || !isRecapDay(centralCalendarDay(Date.now())) ||
      typeof window.HTMLDialogElement?.prototype.showModal !== 'function') return;
  await window.LINKS_NFL_WEEK_READY;
  const activeWeek = window.LINKS_NFL_CURRENT_WEEK;
  if (!Number.isInteger(activeWeek)) return;

  const query = new URLSearchParams({pool: session.pool, week: activeWeek, default: '1'});
  const response = await window.LINKS_API_FETCH('./api/standings-v649?' + query, {
    cache: 'no-store', signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) return;
  const recap = await response.json();
  const updatedSession = currentPlayer();
  if (updatedSession?.pool !== session.pool || updatedSession.player !== session.player ||
      !recap.allFinal || !recap.finalizedWinners?.length || !recapIsOpen(recap.lastKickoff)) return;

  const dismissalKey = 'links-nfl-recap-dismissed:' +
    encodeURIComponent(session.pool) + ':' + encodeURIComponent(session.player);
  const recapId = centralCalendarDay(Date.parse(recap.lastKickoff)).getUTCFullYear() + ':' + recap.week;
  if (localStorage.getItem(dismissalKey) === recapId) return;

  const dialog = document.createElement('dialog');
  dialog.id = 'nfl-weekly-recap';
  dialog.setAttribute('aria-labelledby','nfl-weekly-recap-title');
  dialog.innerHTML = `
    <h2 id="nfl-weekly-recap-title"></h2>
    <p data-winner></p>
    <p data-total hidden></p>
    <table>
      <caption>Final standings</caption>
      <thead><tr>
        <th scope="col">Player</th><th scope="col">Record</th>
        <th scope="col">Guess</th><th scope="col">Off by</th>
      </tr></thead>
      <tbody></tbody>
    </table>
    <div class="recap-actions">
      <button type="button" class="action primary" data-close autofocus>Back to Picks</button>
      <button type="button" class="action" data-dismiss>Don’t show again this week</button>
      <a class="action" data-standings>Weekly Standings</a>
    </div>`;
  const weekLabel = {19: 'Wild Card', 20: 'Divisional', 21: 'Conference Championships', 22: 'Super Bowl'};
  dialog.querySelector('h2').textContent = (weekLabel[recap.week] || 'Week ' + recap.week) + ' results';
  const winners = recap.finalizedWinners;
  dialog.querySelector('[data-winner]').textContent =
    (winners.length === 1 ? '🏆 Winner: ' : '🏆 Tied winners: ') + winners.join(' & ');
  if (recap.actualTie != null) {
    const total = dialog.querySelector('[data-total]');
    total.textContent = 'Final tiebreaker total: ' + recap.actualTie + ' points';
    total.hidden = false;
  }
  const body = dialog.querySelector('tbody');
  for (const row of recap.rows) {
    const tr = body.insertRow();
    const name = document.createElement('th');
    name.scope = 'row';
    name.textContent = row.player;
    tr.append(name);
    if (winners.includes(row.player)) tr.dataset.winner = '';
    for (const value of [row.wins + '–' + row.losses, row.tiePick, row.tieDiff]) {
      tr.insertCell().textContent = value ?? '—';
    }
  }

  dialog.querySelector('[data-standings]').href = './nfl-standings.html?' +
    new URLSearchParams({pool: session.pool, week: recap.week});
  dialog.querySelector('[data-close]').onclick = () => dialog.close();
  dialog.querySelector('[data-dismiss]').onclick = () => {
    try { localStorage.setItem(dismissalKey, recapId); }
    finally { dialog.close(); }
  };
  document.body.append(dialog);
  dialog.showModal();
  const expiration = setInterval(() => {
    if (!recapIsOpen(recap.lastKickoff)) dialog.close();
  }, 15000);
  dialog.addEventListener('close', () => {
    clearInterval(expiration);
    dialog.remove();
  }, {once: true});
}

if (typeof window !== 'undefined') showRecap().catch(() => {});
