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
export const BRACKET_RULES='Submit your entire 11-game bracket and championship combined-score prediction before the first playoff kickoff. Seeds 1–4 receive byes; teams advance along the official fixed CFP paths, without reseeding. Correct winners earn fixed points by round: first round 10, quarterfinals 20, semifinals 40, championship 80 (280 points maximum); wrong picks earn zero, including later picks of eliminated teams. All rounds and the tiebreaker lock together at the first kickoff or reported live game, whichever comes first. Closest championship combined final score, including overtime, breaks a final points tie; over and under count equally and equally close players share rank. Brackets stay private until the contest locks. Save a draft while working, then submit all 11 picks. Only submitted brackets count. No changes after the deadline. Over/Under is not part of full-bracket scoring.';
export function participants(slot,picks,teams){return slot.from.map(ref=>typeof ref==='number'?teams.find(t=>t.seed===ref)?.id:picks[ref]?.team).filter(Boolean)}
export function cleanBracket(input,teams){const picks={};for(const slot of SLOTS){const p=input?.[slot.id];if(p&&participants(slot,picks,teams).includes(String(p.team)))picks[slot.id]={team:String(p.team)};}return picks}
export function validateBracket(input,teams,guess,submit=true){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!SLOTS.some(s=>s.id===k)))throw Error('Choose valid bracket games.');
 const picks=cleanBracket(input,teams);
 for(const id of Object.keys(input))if(!picks[id])throw Error('A later-round team must win its previous game in your bracket.');
 if(guess!==null&&(!Number.isInteger(guess)||guess<0||guess>200))throw Error('Enter a championship combined score from 0 to 200.');
 if(submit&&(Object.keys(picks).length!==11||guess===null))throw Error('Complete all 11 winners and the championship combined score before submitting.');
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
 const rows=roster.map(player=>{const e=entries.find(e=>e.player===player&&e.submitted),p=e?.picks||{};let points=0,wins=0;for(const [id,g] of Object.entries(results))if(p[id]?.team===g.winner){points+=ROUND_POINTS[SLOTS.find(s=>s.id===id).round];wins++}return {player,points,wins,submitted:!!e,guess:locked?e?.guess??null:null,difference:resolved&&e?Math.abs(e.guess-total):null};});
 rows.sort((a,b)=>b.points-a.points||(resolved?(a.difference??Infinity)-(b.difference??Infinity):0)||a.player.localeCompare(b.player));
 let rank=0;rows.forEach((r,i)=>{const prev=rows[i-1];if(!prev||prev.points!==r.points||(resolved&&prev.difference!==r.difference))rank=i+1;r.rank=rank});return {rows,resolved,actualTotal:total,results};
}
