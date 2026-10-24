/** Pure rules shared by the board, local card, and automated tests. */
export const MAX_ODDS_AGE_MS = 15 * 60 * 1000;
export const MAX_CARD_SIZE = 12;
export const CARD_STORAGE_KEY = 'links-playmaker-redesign:card:v1';

const BOOK_NAMES = Object.freeze({
  draftkings: 'DraftKings', fanduel: 'FanDuel', betmgm: 'BetMGM',
  caesars: 'Caesars', bet365: 'bet365',
});

export function normalizeBook(value) {
  return typeof value === 'string' ? value.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
}

function cleanText(value, max = 160) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : '';
}

function strictNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function americanNumber(value) {
  if (typeof value === 'string' && !/^[+-]?\d+$/.test(value.trim())) return null;
  const parsed = strictNumber(value);
  return parsed !== null && Number.isSafeInteger(parsed) && Math.abs(parsed) >= 100 ? parsed : null;
}

export function americanToDecimal(odds) {
  const value = americanNumber(odds);
  if (value === null) return null;
  return value > 0 ? 1 + value / 100 : 1 + 100 / Math.abs(value);
}

// Provider timestamps must be explicit ISO timestamps with a timezone. Never
// substitute the time this browser fetched the response for the source update.
function timestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(value)) return null;
  const [year, month, day, hour, minute, second] = value.match(/\d+/g).slice(0, 6).map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth || hour > 23 || minute > 59 || second > 59) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function teamName(team) {
  if (typeof team === 'string') return cleanText(team);
  if (!team || typeof team !== 'object') return '';
  return cleanText(team.names?.medium) || cleanText(team.names?.long)
    || cleanText(team.name) || cleanText(team.names?.short);
}

function eventArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.success === false || payload?.ok === false || payload?.data?.success === false) return [];
  const candidates = [payload?.data, payload?.events, payload?.data?.data, payload?.data?.events];
  return candidates.find(Array.isArray) || [];
}

function suppliedTimestamp(book, odd) {
  return book.lastUpdatedAt ?? book.lastUpdated ?? book.updatedAt
    ?? odd.lastUpdatedAt ?? odd.lastUpdated ?? odd.updatedAt;
}

function selectionLabel(market, side, homeTeam, awayTeam, line) {
  if (market === 'total') return `${side === 'over' ? 'Over' : 'Under'} ${line}`;
  const team = side === 'home' ? homeTeam : awayTeam;
  return market === 'spread' ? `${team} ${line > 0 ? '+' : ''}${line}` : team;
}

export function isFreshSelection(selection, now = Date.now()) {
  const updated = timestamp(selection?.updatedAt);
  const starts = timestamp(selection?.startTime);
  return Number.isFinite(now) && updated !== null && starts !== null
    && starts > now && updated <= now + 60_000 && now - updated <= MAX_ODDS_AGE_MS;
}

/**
 * Normalize SportsGameOdds v2 full-game moneyline/spread/total selections.
 * Returns Selection[]; an empty array means no safely displayable selections.
 * No missing team, odds, start, or provider update timestamp is synthesized.
 */
export function parseEvents(payload, selectedBook = 'all', now = Date.now()) {
  if (!Number.isFinite(now)) return [];
  const requestedBook = normalizeBook(selectedBook);
  const output = [];
  const seen = new Set();
  for (const event of eventArray(payload)) {
    if (!event || typeof event !== 'object') continue;
    const eventId = cleanText(event.eventID);
    const status = event.status || {};
    if (!eventId || status.started === true || status.ended === true || status.live === true
      || status.completed === true || status.cancelled === true || status.canceled === true
      || event.started === true || event.ended === true || event.live === true) continue;
    const start = status.startsAt ?? event.startsAt;
    const startTimeMs = timestamp(start);
    if (startTimeMs === null || startTimeMs <= now) continue;
    const homeTeam = teamName(event.teams?.home);
    const awayTeam = teamName(event.teams?.away);
    if (!homeTeam || !awayTeam || !event.odds || typeof event.odds !== 'object') continue;
    for (const [mapOddId, odd] of Object.entries(event.odds)) {
      if (!odd || typeof odd !== 'object' || odd.available === false) continue;
      const oddId = cleanText(odd.oddID) || cleanText(mapOddId);
      const pieces = oddId.split('-');
      const stat = cleanText(odd.statID) || pieces[0];
      const entity = cleanText(odd.statEntityID) || pieces[1];
      const period = cleanText(odd.periodID) || pieces[2];
      const type = cleanText(odd.betTypeID) || pieces[3];
      const side = cleanText(odd.sideID) || pieces[4];
      // This first board supports team game lines only, not player props.
      if (period !== 'game' || stat !== 'points') continue;
      let market;
      if (type === 'ml' && ['home', 'away'].includes(side) && entity === side) market = 'moneyline';
      else if (type === 'sp' && ['home', 'away'].includes(side) && entity === side) market = 'spread';
      else if (type === 'ou' && ['over', 'under'].includes(side) && entity === 'all') market = 'total';
      else continue;
      if (!odd.byBookmaker || typeof odd.byBookmaker !== 'object') continue;
      for (const [bookKey, book] of Object.entries(odd.byBookmaker)) {
        if (!book || typeof book !== 'object' || book.available === false) continue;
        const bookmakerId = normalizeBook(bookKey);
        if (!bookmakerId || (requestedBook !== 'all' && requestedBook !== bookmakerId)) continue;
        const americanOdds = americanNumber(book.odds);
        const rawUpdated = suppliedTimestamp(book, odd);
        const updatedAtMs = timestamp(rawUpdated);
        if (americanOdds === null || updatedAtMs === null || updatedAtMs > now + 60_000
          || now - updatedAtMs > MAX_ODDS_AGE_MS) continue;
        let line = null;
        if (market !== 'moneyline') {
          line = strictNumber(market === 'spread' ? book.spread : book.overUnder);
          if (line === null || Math.abs(line) > 1_000_000 || (market === 'total' && line < 0)) continue;
        }
        const id = `${eventId}:${oddId}:${bookmakerId}`;
        if (seen.has(id)) continue;
        seen.add(id);
        output.push({
          id, eventId, oddId, bookmakerId,
          bookmakerName: BOOK_NAMES[bookmakerId] || cleanText(book.bookmakerName) || cleanText(bookKey),
          sport: cleanText(event.sportID), league: cleanText(event.leagueID),
          homeTeam, awayTeam, eventName: `${awayTeam} at ${homeTeam}`,
          startTime: new Date(startTimeMs).toISOString(), startTimeMs,
          market, period, side, label: selectionLabel(market, side, homeTeam, awayTeam, line), line,
          americanOdds, decimalOdds: americanToDecimal(americanOdds),
          updatedAt: new Date(updatedAtMs).toISOString(), updatedAtMs,
        });
      }
    }
  }
  return output.sort((a, b) => a.startTimeMs - b.startTimeMs || a.eventName.localeCompare(b.eventName)
    || a.market.localeCompare(b.market) || a.bookmakerId.localeCompare(b.bookmakerId));
}

/** Rebuild browser storage into the small schema we accept; discard malformed/stale entries. */
export function validateCard(value, now = Date.now()) {
  if (!Array.isArray(value)) return [];
  const result = [];
  const ids = new Set();
  for (const item of value) {
    if (!item || typeof item !== 'object' || result.length >= MAX_CARD_SIZE) continue;
    const eventId = cleanText(item.eventId);
    const oddId = cleanText(item.oddId);
    const bookmakerId = normalizeBook(item.bookmakerId);
    const homeTeam = cleanText(item.homeTeam);
    const awayTeam = cleanText(item.awayTeam);
    const market = item.market;
    const side = item.side;
    const americanOdds = americanNumber(item.americanOdds);
    const id = `${eventId}:${oddId}:${bookmakerId}`;
    const expectedBookName = BOOK_NAMES[bookmakerId];
    if (!eventId || !oddId || !bookmakerId || !homeTeam || !awayTeam || item.id !== id || ids.has(id)
      || americanOdds === null || !isFreshSelection(item, now)
      || !Number.isFinite(item.decimalOdds) || Math.abs(item.decimalOdds - americanToDecimal(americanOdds)) > 1e-10
      || (expectedBookName && item.bookmakerName !== expectedBookName)
      || !['moneyline', 'spread', 'total'].includes(market)
      || (market === 'total' ? !['over', 'under'].includes(side) : !['home', 'away'].includes(side))) continue;
    const pieces = oddId.split('-');
    const expectedType = market === 'moneyline' ? 'ml' : market === 'spread' ? 'sp' : 'ou';
    if (pieces[0] !== 'points' || pieces[2] !== 'game' || pieces[3] !== expectedType || pieces[4] !== side
      || (market === 'total' ? pieces[1] !== 'all' : pieces[1] !== side)) continue;
    const line = market === 'moneyline' ? null : strictNumber(item.line);
    if (market !== 'moneyline' && (line === null || Math.abs(line) > 1_000_000 || (market === 'total' && line < 0))) continue;
    const startTimeMs = timestamp(item.startTime);
    const updatedAtMs = timestamp(item.updatedAt);
    result.push({
      id, eventId, oddId, bookmakerId,
      bookmakerName: expectedBookName || cleanText(item.bookmakerName) || bookmakerId,
      sport: cleanText(item.sport), league: cleanText(item.league),
      homeTeam, awayTeam, eventName: `${awayTeam} at ${homeTeam}`,
      startTime: new Date(startTimeMs).toISOString(), startTimeMs,
      market, period: 'game', side, label: selectionLabel(market, side, homeTeam, awayTeam, line), line,
      americanOdds, decimalOdds: americanToDecimal(americanOdds),
      updatedAt: new Date(updatedAtMs).toISOString(), updatedAtMs,
    });
    ids.add(id);
  }
  return result;
}

/** Mechanical return calculation only; this does not estimate win probability. */
export function calculateReturn(card, stake) {
  const invalid = (reason) => ({ valid: false, payout: null, profit: null, decimalOdds: null, reason });
  const stakeAmount = strictNumber(stake);
  if (stakeAmount === null || stakeAmount <= 0 || stakeAmount > 1_000_000
    || Math.abs(Math.round(stakeAmount * 100) - stakeAmount * 100) > 0.00001) return invalid('Enter a stake between $0.01 and $1,000,000 with at most two decimal places.');
  if (!Array.isArray(card) || card.length === 0 || card.length > MAX_CARD_SIZE) return invalid('Add a selection to calculate a potential return.');
  const events = new Set();
  const books = new Set();
  let multiplier = 1;
  for (const pick of card) {
    const decimal = americanToDecimal(pick?.americanOdds);
    if (decimal === null || !cleanText(pick?.eventId) || !normalizeBook(pick?.bookmakerId)) return invalid('A selection has invalid odds or identification.');
    if (events.has(pick.eventId)) return invalid('Selections from the same event require a sportsbook quote; a parlay return cannot be calculated here.');
    events.add(pick.eventId);
    books.add(normalizeBook(pick.bookmakerId));
    multiplier *= decimal;
  }
  if (books.size > 1) return invalid('Combined returns require selections from the same sportsbook. Compare individual prices across books.');
  if (!Number.isFinite(multiplier) || stakeAmount * multiplier > Number.MAX_SAFE_INTEGER / 100) return invalid('This return exceeds the supported calculation range.');
  const payout = Math.round((stakeAmount * multiplier + Number.EPSILON) * 100) / 100;
  const profit = Math.round((payout - stakeAmount + Number.EPSILON) * 100) / 100;
  return { valid: true, payout, profit, decimalOdds: multiplier, reason: '' };
}
