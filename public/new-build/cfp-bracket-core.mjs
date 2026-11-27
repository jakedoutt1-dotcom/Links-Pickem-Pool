// Official 2026-27 CFP paths: https://collegefootballplayoff.com/sports/2026/8/9/bracket-place-holder
export const SLOTS=[
 {id:'r8',round:0,from:[8,9]}, {id:'r5',round:0,from:[5,12]},
 {id:'r7',round:0,from:[7,10]}, {id:'r6',round:0,from:[6,11]},
 {id:'q1',round:1,from:[1,'r8']}, {id:'q4',round:1,from:[4,'r5']},
 {id:'q2',round:1,from:[2,'r7']}, {id:'q3',round:1,from:[3,'r6']},
 {id:'s1',round:2,from:['q1','q4']}, {id:'s2',round:2,from:['q2','q3']},
 {id:'final',round:3,from:['s1','s2']}
];
export const ROUND_POINTS=[10,20,40,80];
export const MAX_POINTS=280;
export const ROUNDS=['First round','Quarterfinals','Semifinals','Championship'];
export const BRACKET_RULES='Submit your entire 11-game bracket and both championship score predictions before the first playoff kickoff. Seeds 1–4 receive byes; teams advance along the official fixed CFP paths, without reseeding. Correct winners earn fixed points by round: first round 10, quarterfinals 20, semifinals 40, championship 80 (280 points maximum); wrong picks earn zero, including later picks of eliminated teams. All rounds and both tiebreaker predictions lock together at the first kickoff or reported live game, whichever comes first. For the tiebreaker, guess the total points scored by both teams in the championship, including overtime. If bracket points tie, rank by closest combined total, then closest prediction of the eventual winning team\'s score, then most correct game picks. Over and under count equally. All championship scores include overtime. If players are still equal after all three tiebreakers, they share rank. Example: you and Amanda finish with the same bracket points and both predict a championship total of 55. The first tiebreaker cannot separate you, so compare your winning-team score predictions. If the champion scores 28, a guess of 30 beats a guess of 35. If those predictions are equally close too, compare the number of correct game picks. Identical brackets always have the same number of correct picks, so this third tiebreaker cannot separate identical brackets. If you are still tied, you share rank; nobody wins just because they submitted first. A guess above the actual score and a guess the same distance below it are equally close. Brackets stay private until the contest locks. Save a draft while working, then submit all 11 picks. Only submitted brackets count. No changes after the deadline.';
export function participants(slot,picks,teams){return slot.from.map(ref=>typeof ref==='number'?teams.find(t=>t.seed===ref)?.id:picks[ref]?.team).filter(Boolean)}
export function cleanBracket(input,teams){const picks={};for(const slot of SLOTS){const p=input?.[slot.id];if(p&&participants(slot,picks,teams).includes(String(p.team)))picks[slot.id]={team:String(p.team)};}return picks}
export function validateBracket(input,teams,guess,submit=true,winningGuess=null){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!SLOTS.some(s=>s.id===k)))throw Error('Choose valid bracket games.');
 const picks=cleanBracket(input,teams);
 for(const id of Object.keys(input))if(!picks[id])throw Error('A later-round team must win its previous game in your bracket.');
 if(guess!==null&&(!Number.isInteger(guess)||guess<0||guess>200))throw Error('Enter a championship combined score from 0 to 200.');
 if(submit&&(Object.keys(picks).length!==11||guess===null))throw Error('Complete all 11 winners and the championship combined score before submitting.');
 if(winningGuess!==null&&(!Number.isInteger(winningGuess)||winningGuess<0||winningGuess>200))throw Error('Enter a championship winning-team score from 0 to 200.');
 if(submit&&winningGuess===null)throw Error('Enter the championship winning-team score before submitting.');
 if(guess!==null&&winningGuess!==null&&winningGuess>guess)throw Error('The winning-team score cannot exceed the combined total.');
 return picks;
}
export function bracketClosed(config,games,now=Date.now()){return !!config?.locked||!config||now>=Date.parse(config.deadline)||games.some(g=>g.live||g.final||g.locked)}
export function bracketResults(teams,games){
 const actual={},results={};
 for(const slot of SLOTS){const ids=participants(slot,actual,teams);if(ids.length!==2)continue;
  const candidates=games.filter(g=>!g.voided&&[g.home.id,g.away.id].every(id=>ids.includes(id))&&[g.home.id,g.away.id].length===2&&g.home.id!==g.away.id);
  // A rematch in another round must not be used: require provider playoff-round metadata.
  const roundMatch=g=>slot.round===0?/first round/i.test(g.title):slot.round===1?/quarterfinal/i.test(g.title):slot.round===2?/semifinal/i.test(g.title):/national championship/i.test(g.title)&&!/semi|quarter/i.test(g.title);
  const g=candidates.find(roundMatch);if(g?.final&&ids.includes(g.winner)){actual[slot.id]={team:g.winner};results[slot.id]=g;}
 }return results;
}
export function bracketStandings(roster,entries,teams,games,locked){
 const results=bracketResults(teams,games),final=results.final;
 const total=final&&[final.home.score,final.away.score].every(s=>s!==null&&s!==undefined&&s!==''&&Number.isFinite(Number(s)))?Number(final.home.score)+Number(final.away.score):null;
 const resolved=Object.keys(results).length===11&&total!==null;
 const actualWinningScore=total===null?null:Number(final.home.id===final.winner?final.home.score:final.away.score);
 const rows=roster.map(player=>{const e=entries.find(e=>e.player===player&&e.submitted),p=e?.picks||{};let points=0,wins=0;for(const [id,g] of Object.entries(results))if(p[id]?.team===g.winner){points+=ROUND_POINTS[SLOTS.find(s=>s.id===id).round];wins++}return {player,points,wins,submitted:!!e,guess:locked?e?.guess??null:null,winningGuess:locked?e?.winningGuess??e?.winning_guess??null:null,difference:resolved&&Number.isInteger(e?.guess)?Math.abs(e.guess-total):null,winningDifference:resolved&&Number.isInteger(e?.winningGuess??e?.winning_guess)?Math.abs((e.winningGuess??e.winning_guess)-actualWinningScore):null};});
 const distance=(a,b)=>a===b?0:(a??Infinity)<(b??Infinity)?-1:1;
 const compare=(a,b)=>b.points-a.points||(resolved?(distance(a.difference,b.difference)||distance(a.winningDifference,b.winningDifference)||b.wins-a.wins):0);
 rows.sort((a,b)=>compare(a,b)||a.player.localeCompare(b.player));
 let rank=0;rows.forEach((r,i)=>{if(!i||compare(rows[i-1],r)!==0)rank=i+1;r.rank=rank});return {rows,resolved,actualTotal:total,actualWinningScore,results};
}
