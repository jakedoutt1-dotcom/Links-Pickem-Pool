// Free office-pool standings estimate. Deterministic shared-outcome simulation.
window.LINKS_COLLEGE_PROJECTION=(players,games,probabilities)=>{
 const rows=players.map(p=>({player:p.player,correct:0,expected:0,chance:0}));
 for(const g of games)players.forEach((p,i)=>{const pick=p.picks[g.eventId];if(!pick)return;if(g.completed){if(pick===g.winner){rows[i].correct++;rows[i].expected++}}else{const h=probabilities[g.eventId]??.5;rows[i].expected+=pick===g.home?h:pick===g.away?1-h:0}});
 let seed=123456789;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const pending=games.filter(g=>!g.completed),trials=pending.length?20000:1;
 for(let t=0;t<trials&&players.length;t++){const scores=rows.map(r=>r.correct);for(const g of pending){const winner=random()<(probabilities[g.eventId]??.5)?g.home:g.away;players.forEach((p,i)=>{if(p.picks[g.eventId]===winner)scores[i]++})}const best=Math.max(...scores);scores.forEach((s,i)=>{if(s===best)rows[i].chance+=1/trials})}
 return rows.sort((a,b)=>b.chance-a.chance||b.expected-a.expected);
};
