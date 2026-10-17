const CACHE_KEY = 'links-home-live-v2';
const MAX_CACHE_AGE = 10 * 60 * 1000;
const REFRESH_DELAY = 60 * 1000;
const RETRY_DELAY = 15 * 1000;

export function validLiveSnapshot(value, now = Date.now()) {
  return !!value && Array.isArray(value.events) && value.events.length <= 56 &&
    Number.isFinite(value.asOf) && value.asOf <= now + 60000 && now - value.asOf <= MAX_CACHE_AGE &&
    value.events.every(event => event && ['pre', 'in', 'post'].includes(event.state) &&
      typeof event.league === 'string' && typeof event.detail === 'string' &&
      typeof event.away?.name === 'string' && typeof event.home?.name === 'string');
}

export function startHomeLive() {
  const track = document.getElementById('liveTrackHome');
  const bar = track?.closest('.livebar-home');
  if (!bar || bar.dataset.liveReady) return;
  bar.dataset.liveReady = '1';
  const refresh = document.createElement('button');
  refresh.type = 'button'; refresh.className = 'live-refresh-home'; refresh.textContent = 'Refresh';
  refresh.setAttribute('aria-label', 'Refresh live scores'); bar.append(refresh);
  const status = document.createElement('span');
  status.className = 'live-status-home'; status.setAttribute('role', 'status');
  bar.insertAdjacentElement('afterend', status);
  let snapshot = null, busy = false, timer = null, stale = false, stopped = false;
  bar.dataset.liveState = 'empty';
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (validLiveSnapshot(cached)) snapshot = cached;
    else localStorage.removeItem(CACHE_KEY);
  } catch {}
  function render(value, fallback = false) {
    track.replaceChildren();
    const events = value?.events || [];
    bar.dataset.liveState = events.length ? (fallback ? 'cached' : 'ready') : 'empty';
    if (!events.length) {
      const empty = document.createElement('span');
      empty.textContent = fallback ? 'Scores are reconnecting. Try again.' : 'No games are scheduled in the current score feeds.';
      track.append(empty); return;
    }
    for (let copy = 0; copy < 2; copy++) for (const game of events) {
      const row = document.createElement('span');
      if (copy) row.setAttribute('aria-hidden', 'true');
      row.append(document.createTextNode(game.league + ' · ' + game.away.name +
        (game.state === 'pre' ? '' : ' ' + String(game.away.score ?? ''))));
      const home = document.createElement('b');
      home.textContent = game.home.name + (game.state === 'pre' ? '' : ' ' + String(game.home.score ?? ''));
      const detail = document.createElement('em');
      detail.textContent = (!fallback && game.state === 'in' ? '● LIVE · ' : '') + game.detail;
      row.append(home, detail); track.append(row);
    }
  }
  const time = value => new Date(value.asOf).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'});
  function renderFallback() {
    const usable = validLiveSnapshot(snapshot) && snapshot.events.length;
    if (!usable) {snapshot = null; try {localStorage.removeItem(CACHE_KEY);} catch {}}
    render(usable ? snapshot : null, true);
    status.textContent = usable ? 'Last update ' + time(snapshot) + ' · reconnecting. Scores may have changed.' : 'Live scores could not refresh.';
    refresh.textContent = 'Try again';
  }
  if (snapshot) { render(snapshot, true); status.textContent = 'Last update ' + time(snapshot) + ' · refreshing…'; }
  async function load() {
    clearTimeout(timer);
    if (busy || stopped || document.hidden) return;
    busy = true; refresh.disabled = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('/new-build/api/live-scores', {cache: 'no-store', signal: controller.signal});
      if (!response.ok) throw Error('Score feed unavailable.');
      const next = await response.json();
      if (!validLiveSnapshot(next)) throw Error('Invalid score feed.');
      snapshot = next; stale = false; render(snapshot);
      status.textContent = 'Updated ' + time(snapshot) +
        (snapshot.unavailable?.length ? ' · Some leagues are reconnecting.' : '');
      refresh.textContent = 'Refresh';
      try {localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));} catch {}
    } catch {stale = true; renderFallback();}
    finally {
      clearTimeout(timeout); busy = false; refresh.disabled = false;
      if (!stopped) timer = setTimeout(load, stale ? RETRY_DELAY : REFRESH_DELAY);
    }
  }
  refresh.addEventListener('click', load);
  document.addEventListener('visibilitychange', () => {if (document.hidden) clearTimeout(timer); else {if (stale) renderFallback(); load();}});
  window.addEventListener('online', load);
  window.addEventListener('pagehide', () => {stopped = true; clearTimeout(timer);});
  window.addEventListener('pageshow', () => {if (stopped) {stopped = false; load();}});
  load();
}

if (typeof document !== 'undefined') startHomeLive();
