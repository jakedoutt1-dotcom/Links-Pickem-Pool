// Shared bracket rules: used by the browser, API, and tests.
export const REGIONS = ['East', 'West', 'South', 'Midwest'];
export const POINTS = [10, 20, 40, 80, 160, 320];
export const ROUNDS = ['Round of 64', 'Round of 32', 'Sweet 16', 'Elite Eight', 'Final Four', 'Championship'];
export const SEEDS = [[1,16],[8,9],[5,12],[4,13],[6,11],[3,14],[7,10],[2,15]];
export const PAIRINGS = [
  ['East','West','South','Midwest'],
  ['East','South','West','Midwest'],
  ['East','Midwest','South','West']
];
export function makeGames(field, pairing) {
  if (!Array.isArray(pairing) || pairing.length !== 4 || new Set(pairing).size !== 4 || pairing.some(r => !REGIONS.includes(r))) throw Error('Confirm the four regional semifinal assignments.');
  const games = [];
  for (const region of REGIONS) {
    const rows = field.filter(g => g.region === region);
    if (rows.length !== 8) throw Error('The full 64-team field is not available yet.');
    for (let index = 0; index < 8; index++) {
      const row = rows.find(g => SEEDS[index].every(seed => g.teams.some(t => t.seed === seed)));
      if (!row || row.teams.length !== 2) throw Error('Regional seeds are incomplete.');
      games.push({id:region+'-1-'+index, region, round:1, teams:[...row.teams].sort((a,b)=>a.seed-b.seed), eventId:row.eventId, date:row.date});
    }
    for (let round = 2; round <= 4; round++) {
      for (let index=0; index < 8 / 2 ** (round-1); index++) games.push({
        id:region+'-'+round+'-'+index, region, round,
        sources:[region+'-'+(round-1)+'-'+index*2, region+'-'+(round-1)+'-'+(index*2+1)]
      });
    }
  }
  for (let index=0; index<2; index++) games.push({id:'national-5-'+index, region:'Final Four', round:5, sources:pairing.slice(index*2,index*2+2).map(r=>r+'-4-0')});
  games.push({id:'national-6-0', region:'Final Four', round:6, sources:['national-5-0','national-5-1']});
  return games.sort((a,b)=>a.round-b.round || a.id.localeCompare(b.id));
}
export function teamMap(games) { return Object.fromEntries(games.flatMap(g=>g.teams||[]).map(t=>[t.id,t])); }
export function entrants(game, picks) { return game.teams ? game.teams.map(t=>t.id) : game.sources.map(id=>picks[id]||null); }
export function cleanPicks(games, raw={}) {
  const picks = {};
  for (const game of games) {
    const candidates=entrants(game,picks), pick=raw[game.id];
    if (typeof pick==='string' && candidates.every(Boolean) && candidates.includes(pick)) picks[game.id]=pick;
  }
  return picks;
}
export function selectTeam(games, picks, gameId, teamId) {
  const game=games.find(g=>g.id===gameId);
  if (!game || !entrants(game,picks).every(Boolean) || !entrants(game,picks).includes(teamId)) return cleanPicks(games,picks);
  return cleanPicks(games,{...picks,[gameId]:teamId});
}
export function descendants(games) {
  const out={};
  for(const game of games) out[game.id]=game.teams?game.teams.map(t=>t.id):game.sources.flatMap(id=>out[id]);
  return out;
}
export function scoreBracket(games, picks, results={}) {
  const eliminated=new Set(Object.values(results).filter(r=>r.completed&&r.winner).flatMap(r=>r.teams.filter(t=>t.id!==r.winner).map(t=>t.id)));
  let points=0, remaining=0, correct=0;
  const rounds=POINTS.map(()=>0), states={};
  for(const game of games) {
    const pick=picks[game.id], result=results[game.id], value=POINTS[game.round-1];
    if(!pick) { states[game.id]='empty'; continue; }
    if(result?.completed&&result.winner) {
      states[game.id]=result.winner===pick?'correct':'incorrect';
      if(result.winner===pick) { points+=value; rounds[game.round-1]+=value; correct++; }
    } else if(eliminated.has(pick)) states[game.id]='eliminated';
    else { states[game.id]='pending'; remaining+=value; }
  }
  return {points, max:points+remaining, remaining, correct, rounds, states};
}
export function validTie(value) { return typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=400; }
export function rankEntries(entries,games,results) {
  const final=results['national-6-0'], total=final?.completed&&final.winner&&final.teams.every(t=>Number.isFinite(t.score))?final.teams.reduce((s,t)=>s+t.score,0):null;
  const rows=entries.filter(e=>e.submitted).map(e=>({...e,...scoreBracket(games,e.picks,results),tieDistance:total===null?null:Math.abs(e.tie-total)}));
  rows.sort((a,b)=>b.points-a.points || (total===null?0:a.tieDistance-b.tieDistance) || a.player.localeCompare(b.player));
  rows.forEach((row,i)=>{row.rank=i&&row.points===rows[i-1].points&&row.tieDistance===rows[i-1].tieDistance?rows[i-1].rank:i+1;});
  return rows;
}
export function demoTournament() {
  const names=[
    ['Duke','Siena','Ohio State','TCU',"St. John's",'Northern Iowa','Kansas','Cal Baptist','Louisville','South Florida','Michigan State','North Dakota State','UCLA','UCF','UConn','Furman'],
    ['Arizona','Long Island','Villanova','Utah State','Wisconsin','High Point','Arkansas','Hawaii','BYU','Texas','Gonzaga','Kennesaw State','Miami (FL)','Missouri','Purdue','Queens'],
    ['Florida','Prairie View','Clemson','Iowa','Vanderbilt','McNeese','Nebraska','Troy','North Carolina','VCU','Illinois','Penn',"Saint Mary's",'Texas A&M','Houston','Idaho'],
    ['Michigan','Howard','Georgia','Saint Louis','Texas Tech','Akron','Alabama','Hofstra','Tennessee','Miami (Ohio)','Virginia','Wright State','Kentucky','Santa Clara','Iowa State','Tennessee State']
  ];
  const field=REGIONS.flatMap((region,r)=>SEEDS.map((seeds,i)=>({region,eventId:'practice-'+r+'-'+i,date:null,teams:seeds.map((seed,j)=>({id:'practice-'+r+'-'+seed,name:names[r][i*2+j],seed,logo:''}))})));
  return {season:'Practice',field,pairing:PAIRINGS[0],games:makeGames(field,PAIRINGS[0]),results:{},lockAt:null};
}
