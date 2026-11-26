import {normalizeGame as normalizeFootball} from './nhl-core.mjs';
export {pickClosed} from './mlb-core.mjs';
export const cfpSeason=(now=Date.now())=>{const d=new Date(now);return d.getUTCFullYear()-(d.getUTCMonth()<6?1:0)};
export function isPlayoff(event){
 const c=event.competitions?.[0]||{},notes=[...(event.notes||[]),...(c.notes||[])].map(n=>n.headline||n.text||'').join(' ');
 return /college football playoff|\bcfp\b|national championship|playoff|quarterfinal|semifinal/i.test(notes+' '+(event.shortName||'')+' '+(event.name||''));
}
export function normalizePlayoff(event){
 const g=normalizeFootball(event),c=event.competitions?.[0]||{},raw=c.odds?.find(o=>Number.isFinite(Number(o.overUnder))&&o.overUnder!=null)?.overUnder;
 g.title=(c.notes||event.notes||[]).map(n=>n.headline||n.text||'').filter(Boolean).join(' - ')||'College Football Playoff';
 g.tbd=g.tbd||![g.home.id,g.away.id].every(id=>/^[1-9]\d*$/.test(id));
 g.totalLine=raw!=null&&Number(raw)>0?Number(raw):null;
 for(const side of ['away','home']){const t=(c.competitors||[]).find(t=>t.homeAway===side)||{},rank=Number(t.curatedRank?.current||t.rank),seed=Number(t.seed||t.curatedRank?.seed);g[side].rank=Number.isInteger(rank)&&rank>0&&rank<99?rank:null;g[side].seed=Number.isInteger(seed)&&seed>0&&seed<99?seed:null;g[side].logo=/^\d+$/.test(g[side].id)?'https://a.espncdn.com/i/teamlogos/ncaa/500/'+g[side].id+'.png':'';}
 return g;
}
export function gradePlayoff(roster,picks,games){
 const byId=new Map(games.map(g=>[g.id,g]));
 return roster.map(player=>{let wins=0,losses=0,points=0,pending=0,totalWins=0,totalLosses=0,pushes=0;
  for(const pick of picks.filter(p=>p.player===player)){
   const g=byId.get(pick.event_id);if(g?.voided)continue;
   if(!g?.final||!g.winner){pending++;continue;}
   if(pick.team===g.winner){wins++;points+=1+Number(pick.bonus||0)}else losses++;
   if(pick.total_side&&pick.total_line!=null&&g.home.score!=null&&g.away.score!=null){
    const score=Number(g.home.score)+Number(g.away.score),line=Number(pick.total_line);
    if(!Number.isFinite(score))continue;
    if(score===line)pushes++;else if((score>line?'over':'under')===pick.total_side){totalWins++;points++}else totalLosses++;
   }
  }
  return {player,wins,losses,points,pending,totalWins,totalLosses,pushes};
 }).sort((a,b)=>b.points-a.points||a.player.localeCompare(b.player));
}
export const CFP_RULES='Pick the winner of each College Football Playoff game, from the first round through the championship. Other bowl games are excluded. Each correct winner earns 1 point. If confidence bonuses are enabled, distribute up to 3 extra points across your games; they score only when that winner is correct. If Over/Under is enabled and a total is posted, a correct Over/Under pick earns 1 more point. An exact total is a push and earns 0. Each game locks at its scheduled kickoff or when reported live, whichever comes first. Overtime counts. Lines are fixed for your pool when first saved. Rules lock after the first saved pick. Later rounds open when both teams and kickoff are confirmed. Opponents\' picks stay private until that game locks. Missing picks earn 0; equal points share rank. Postponed or canceled games are void. Future playoff field changes follow the published schedule rather than a fixed number of teams.';
