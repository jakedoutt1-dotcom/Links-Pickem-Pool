import {REGIONS,SEEDS,makeGames,descendants} from '../../public/new-build/march-core.mjs';
const BASE='https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard';
const cache=new Map();
async function day(date) {
  const response=await fetch(BASE+'?dates='+date+'&limit=200',{headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});
  if(!response.ok) throw Error('ESPN tournament data is unavailable.');
  const data=await response.json();
  if(!Array.isArray(data.events)) throw Error('ESPN did not return a valid daily schedule.');
  return data;
}
export function parseEvent(event) {
  const competition=event.competitions?.[0], note=(competition?.notes||[]).map(n=>n.headline||'').join(' ');
  if(!/\b(?:NCAA )?Men[’']s Basketball Championship\b/i.test(note)||/First Four|play.in/i.test(note)) return null;
  const region=REGIONS.find(r=>new RegExp('\\b'+r+' Region','i').test(note))||'Final Four';
  const round=/1st Round|First Round|Round of 64/i.test(note)?1:/2nd Round|Second Round|Round of 32/i.test(note)?2:/Sweet 16|Regional Semifinal/i.test(note)?3:/Elite (8|Eight)|Regional Final/i.test(note)?4:/Final Four|National Semifinal/i.test(note)?5:/National Championship/i.test(note)?6:0;
  if(!round) return null;
  const teams=(competition.competitors||[]).map(c=>({id:String(c.team?.id||''),name:c.team?.shortDisplayName||c.team?.displayName||'TBD',seed:Number(c.curatedRank?.current),logo:c.team?.logo||'',score:c.score==null||c.score===''?null:Number(c.score),winner:c.winner===true}));
  if(teams.length!==2) return null;
  const status=event.status?.type||competition.status?.type||{}, completed=status.completed===true;
  const flagged=teams.filter(t=>t.winner),scored=teams.every(t=>Number.isFinite(t.score))&&teams[0].score!==teams[1].score;
  const winner=completed?(flagged.length===1?flagged[0].id:scored?teams[teams[0].score>teams[1].score?0:1].id:''):'';
  return {eventId:String(event.id),region,round,date:event.date||competition.date,teams,completed,winner,detail:status.shortDetail||status.description||'Scheduled'};
}
export async function tournamentFeed(season) {
  const old=cache.get(season);
  if(old&&Date.now()-old.at<120000) return old.data;
  // The public basketball feed accepts individual dates, not date ranges.
  const first=await day(season+'0315');
  const calendar=first.leagues?.[0]?.calendar||[];
  const dates=[...new Set(calendar.map(v=>String(v).slice(0,10).replaceAll('-','')).filter(d=>d>=season+'0315'&&d<=season+'0410'))];
  if(dates.length>27) throw Error('Unexpected tournament calendar.');
  const events=[...first.events];
  for(let i=0;i<dates.length;i+=6) {
    const batch=await Promise.all(dates.slice(i,i+6).filter(d=>d!==season+'0315').map(day));
    batch.forEach(d=>events.push(...d.events));
  }
  const parsed=[...new Map(events.map(e=>[String(e.id),e])).values()].map(parseEvent).filter(Boolean);
  const field=parsed.filter(e=>e.round===1);
  let ready=field.length===32&&new Set(field.flatMap(g=>g.teams.map(t=>t.id))).size===64;
  ready=ready&&field.every(g=>REGIONS.includes(g.region)&&Number.isFinite(Date.parse(g.date))&&g.teams.every(t=>/^\d+$/.test(t.id)&&Number(t.id)>0&&t.seed>=1&&t.seed<=16));
  if(ready) for(const region of REGIONS) for(const pair of SEEDS) if(field.filter(g=>g.region===region&&pair.every(s=>g.teams.some(t=>t.seed===s))).length!==1) ready=false;
  const data={events:parsed,field,ready,checkedAt:new Date().toISOString()};
  cache.set(season,{at:Date.now(),data});return data;
}
export function createTournament(feed,season,pairing) {
  if(!feed.ready) throw Error('The complete 64-team field is not published yet. Try again after the First Four teams are resolved.');
  const games=makeGames(feed.field,pairing),lockAt=new Date(Math.min(...feed.field.map(g=>Date.parse(g.date)))).toISOString();
  const tournament={season,field:feed.field,pairing,games,lockAt};
  return {...tournament,results:mapResults(tournament,feed.events),checkedAt:feed.checkedAt};
}
export function mapResults(tournament,events) {
  const tree=descendants(tournament.games),out={};
  for(const game of tournament.games) {
    const matches=events.filter(e=>e.round===game.round&&(game.round===1?e.eventId===game.eventId:e.teams.every(t=>tree[game.id].includes(t.id))));
    if(matches.length!==1)continue;
    const e=matches[0];
    out[game.id]={eventId:e.eventId,date:e.date,teams:e.teams,completed:e.completed,winner:e.winner,detail:e.detail};
  }
  return out;
}
export async function ensureSchema(db) {
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS links_march_tournaments (pool_id INTEGER NOT NULL, season INTEGER NOT NULL, definition TEXT NOT NULL, lock_at TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, PRIMARY KEY(pool_id,season))'),
    db.prepare('CREATE TABLE IF NOT EXISTS links_march_entries (pool_id INTEGER NOT NULL, season INTEGER NOT NULL, player_name TEXT NOT NULL COLLATE NOCASE, picks_json TEXT NOT NULL, tie INTEGER, submitted INTEGER NOT NULL DEFAULT 0, version INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL, PRIMARY KEY(pool_id,season,player_name))')
  ]);
}
