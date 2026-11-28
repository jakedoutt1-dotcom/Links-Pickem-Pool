const valid=n=>typeof n==='number'&&Number.isInteger(n)&&n>=0&&n<=200;
const distance=(a,b)=>a===b?0:(a??Infinity)<(b??Infinity)?-1:1;
export function rankPlayoffScores(scores,entries,games,ties,resolved,actual,locked){
 const rows=scores.map(row=>{
  const tie=ties.find(t=>t.player===row.playerName);let correct=0;
  for(const e of entries.filter(e=>e.player_name===row.playerName))for(const p of JSON.parse(e.entry_json).picks||[]){const g=games.get(Number(e.period_key))?.find(g=>p.eventId?String(g.eventId||g.id)===String(p.eventId):[g.away,g.home].includes(p.team));if(g?.completed&&g.winner===p.team)correct++;}
  return {...row,correct,totalGuess:locked?tie?.guess??null:null,winningGuess:locked?tie?.winning_guess??null:null,totalDifference:resolved&&valid(tie?.guess)?Math.abs(tie.guess-actual.total):null,winningDifference:resolved&&valid(tie?.winning_guess)?Math.abs(tie.winning_guess-actual.winner):null};
 });
 const compare=(a,b)=>b.score-a.score||(resolved?(distance(a.totalDifference,b.totalDifference)||distance(a.winningDifference,b.winningDifference)||b.correct-a.correct):0);
 rows.sort((a,b)=>compare(a,b)||a.playerName.localeCompare(b.playerName));rows.forEach((r,i)=>r.rank=i&&!compare(r,rows[i-1])?rows[i-1].rank:i+1);return rows;
}
export async function playoffTiebreak({db,pool,player,slates,state}){
 const sb=slates.get(22)||[],game=sb.length===1?sb[0]:null;
 const available=!!game&&Number.isFinite(Date.parse(game.kickoff)),locked=available&&(game.completed||Date.now()>=Date.parse(game.kickoff));
 const entries=(await db.prepare("SELECT player_name,period_key,entry_json FROM special_game_period_entries WHERE pool_id=? AND game_type='playoff'").bind(pool).all()).results||[];
 const ties=entries.filter(e=>Number(e.period_key)===22).map(e=>{const saved=JSON.parse(e.entry_json);return {player:e.player_name,guess:saved.championshipTotal??null,winning_guess:saved.championshipWinner??null}}),mine=ties.find(t=>t.player===player)||null;
 const scored=g=>g.completed&&g.awayScore!==null&&g.awayScore!==undefined&&g.awayScore!==''&&g.homeScore!==null&&g.homeScore!==undefined&&g.homeScore!==''&&Number.isFinite(Number(g.awayScore))&&Number.isFinite(Number(g.homeScore));
 const resolved=locked&&!state.scoringWarning&&[19,20,21,22].every((w,i)=>slates.get(w)?.length===[6,4,2,1][i]&&slates.get(w).every(scored))&&!!game?.winner;
 const actual=resolved?{total:Number(game.awayScore)+Number(game.homeScore),winner:Math.max(Number(game.awayScore),Number(game.homeScore))}:null;
 return {mine:mine?{guess:mine.guess,winningGuess:mine.winning_guess}:null,locked,available,deadline:available?game.kickoff:null,resolved,scores:rankPlayoffScores(state.scores||[],entries,slates,ties,resolved,actual,locked)};
}
