import {sharedScoreFeed} from '../../lib/shared-score-feed.js';

// Public scores only. The homepage must not depend on seven third-party browser
// requests, and this endpoint must never accept an arbitrary provider URL.
const FEEDS = [
  ['NFL', 'football/nfl'], ['CFB', 'football/college-football'],
  ['MLB', 'baseball/mlb'], ['NBA', 'basketball/nba'],
  ['WNBA', 'basketball/wnba'], ['NHL', 'hockey/nhl'],
  ['NCAAM', 'basketball/mens-college-basketball'],
];
const text = (value, max = 100) => String(value ?? '').trim().slice(0, max);
const rank = state => state === 'in' ? 0 : state === 'post' ? 1 : 2;
export function normalizeLiveEvents(events, league) {
  return events.flatMap(event => {
    const competition = event?.competitions?.[0];
    const teams = Array.isArray(competition?.competitors) ? competition.competitors : [];
    const away = teams.find(team => team.homeAway === 'away');
    const home = teams.find(team => team.homeAway === 'home');
    const status = competition?.status?.type || event?.status?.type || {};
    if (!away?.team || !home?.team || !['pre', 'in', 'post'].includes(status.state)) return [];
    const team = row => ({
      name: text(row.team.abbreviation || row.team.shortDisplayName || row.team.displayName, 35),
      score: status.state === 'pre' ? '' : text(row.score, 12),
    });
    return [{id: text(event.id, 40), league, away: team(away), home: team(home),
      state: status.state, detail: text(status.shortDetail || status.detail),
      startsAt: Number.isFinite(Date.parse(event.date)) ? new Date(event.date).toISOString() : null}];
  }).sort((a, b) => rank(a.state) - rank(b.state) ||
    (Date.parse(a.startsAt) || 0) - (Date.parse(b.startsAt) || 0)).slice(0, 8);
}

async function readFeed(league, path) {
  return sharedScoreFeed('home-live-v3:' + league, async () => {
    let lastError;
    for (const host of ['site.api.espn.com', 'site.web.api.espn.com']) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      try {
        const response = await fetch('https://' + host + '/apis/site/v2/sports/' + path + '/scoreboard', {
          signal: controller.signal, headers: {Accept: 'application/json'}, redirect: 'error',
        });
        if (!response.ok) throw Error('Score provider unavailable.');
        const data = await response.json();
        if (!Array.isArray(data.events)) throw Error('Invalid score feed.');
        return {events: normalizeLiveEvents(data.events, league), asOf: Date.now()};
      } catch (error) { lastError = error; }
      finally { clearTimeout(timeout); }
    }
    throw lastError;
  }, {ttl: 45});
}

export async function onRequest({request}) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return Response.json({error: 'Method not allowed.'}, {status: 405, headers: {Allow: 'GET, HEAD', 'Cache-Control': 'no-store'}});
  }
  const settled = await Promise.allSettled(FEEDS.map(([league, path]) => readFeed(league, path)));
  const available = settled.filter(result => result.status === 'fulfilled').map(result => result.value);
  const unavailable = FEEDS.filter((_, index) => settled[index].status === 'rejected').map(([league]) => league);
  const payload = available.length ? {
    events: available.flatMap(feed => feed.events).sort((a, b) => rank(a.state) - rank(b.state)),
    asOf: Math.min(...available.map(feed => feed.asOf)), unavailable,
  } : {error: 'Live scores could not refresh. Please try again.', events: [], unavailable};
  return new Response(request.method === 'HEAD' ? null : JSON.stringify(payload), {
    status: available.length ? 200 : 503,
    headers: {'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': available.length ? 'public, max-age=15, s-maxage=15' : 'no-store'},
  });
}
