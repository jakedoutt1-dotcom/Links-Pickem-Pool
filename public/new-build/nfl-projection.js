(function(root){
 const norm=t=>({WAS:'WSH',JAC:'JAX',LA:'LAR'}[String(t||'').toUpperCase()]||String(t||'').toUpperCase());
 function fraction(v){if(v==null||v==='')return null;v=Number(v);if(!Number.isFinite(v)||v<0||v>100)return null;return v>1?v/100:v}
 function probability(j){const wp=j.winprobability||[];for(let i=wp.length-1;i>=0;i--){const h=fraction(wp[i].homeWinPercentage);if(h!==null)return h}const predictor=j.predictor,od=j.header?.competitions?.[0]?.odds?.[0];for(const pair of [[predictor?.homeTeam?.gameProjection,predictor?.awayTeam?.gameProjection],[od?.homeTeamOdds?.winPercentage,od?.awayTeamOdds?.winPercentage]]){const h=fraction(pair[0]),a=fraction(pair[1]);if(h!==null&&a!==null&&h+a>0)return h/(h+a)}return null}
 // Enumerate shared game outcomes: players picking the same team stay correlated.
 // This is the chance to finish first or tied first, before the score tiebreaker.
 function project(players,games,results,probs){
 const rows=players.map(p=>({player:p.player,correct:0,projected:0,picked:0,pending:0,chance:0})),pending=[];
 games.forEach((g,n)=>{const i=g.gameIndex??n,winner=norm(results[i]||g.winner),picks=players.map(p=>norm(p.picks?.[i]));const home=probs[i]?.home??.5;
 picks.forEach((p,k)=>{if(!p)return;rows[k].picked++;if(winner){if(p===winner)rows[k].correct++}else if(!g.completed){rows[k].pending++;rows[k].projected+=p===norm(g.home)?home:p===norm(g.away)?1-home:0}});
 if(!winner&&!g.completed)pending.push({home,picks,homeTeam:norm(g.home),awayTeam:norm(g.away)});
 });rows.forEach(r=>r.projected+=r.correct);
 if(pending.length>18)throw Error('Too many games to calculate weekly odds.');
 function visit(n,weight,scores){if(!weight)return;if(n===pending.length){const max=Math.max(...scores);scores.forEach((score,k)=>{if(score===max)rows[k].chance+=weight});return}const g=pending[n];for(const [team,p] of [[g.homeTeam,g.home],[g.awayTeam,1-g.home]])visit(n+1,weight*p,scores.map((score,k)=>score+(g.picks[k]===team?1:0)))}
 if(rows.length)visit(0,1,rows.map(r=>r.correct));return rows.sort((a,b)=>b.chance-a.chance||b.projected-a.projected);
 }
 root.LINKS_NFL_PROJECTION={probability,project};
})(typeof window==='undefined'?globalThis:window);
