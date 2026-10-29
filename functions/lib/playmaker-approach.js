export const AUTO_LEGS={conservative:2,balanced:3,aggressive:4,lottery:6};
export function approachCandidates(rows,risk){
 if(risk==='balanced')return rows.filter(p=>!p.alternate);
 if(risk==='lottery')return rows.filter(p=>p.americanOdds>=150);
 const desired=rows.filter(p=>p.alternate&&p.market==='prop'&&Math.abs(p.line-p.mainLine)<=Math.max(1,Math.abs(p.mainLine)*0.3)&&(p.side==='over'?risk==='conservative'?p.line<p.mainLine:p.line>p.mainLine:p.side==='under'?risk==='conservative'?p.line>p.mainLine:p.line<p.mainLine:false));
 const groups=new Map();for(const p of desired){const k=p.eventId+':'+p.playerId+':'+p.statId+':'+p.side+':'+p.bookmakerId;if(!groups.has(k)||Math.abs(p.line-p.mainLine)<Math.abs(groups.get(k).line-groups.get(k).mainLine))groups.set(k,p)}
 const alternates=[...groups.values()];
 if(risk==='aggressive'){const keys=new Set(alternates.map(p=>p.eventId+':'+p.playerId+':'+p.statId+':'+p.bookmakerId));return [...alternates,...rows.filter(p=>!p.alternate&&(p.market!=='prop'||!keys.has(p.eventId+':'+p.playerId+':'+p.statId+':'+p.bookmakerId)))]}
 const keys=new Set(alternates.map(p=>p.eventId+':'+p.playerId+':'+p.statId+':'+p.bookmakerId));return [...alternates,...rows.filter(p=>!p.alternate&&!keys.has(p.eventId+':'+p.playerId+':'+p.statId+':'+p.bookmakerId))];
}
export const RESEARCH_RULES='Use only supplied verified research. Compare player last-five, last-ten and season-sample stats, sample sizes, and opponent stats allowed for the relevant category. Averages are historical references, not calibrated probabilities. Never invent injuries, playing time, weather, defensive rankings or stats. Explain missing fields. Avoid projecting role changes without verified evidence. Balanced uses the posted main line; aggressive uses a real moderately harder alternate line; conservative prefers easier real alternates. For overs a harder line is higher; for unders it is lower. Lottery ticket means very high risk and a low chance of all legs winning, not a special advantage. Do not increase the requested number of legs. A sportsbook main line is not our independent projection.';
