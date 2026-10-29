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

export function automaticCardOptions(rows,legs,compatible,max=8){
 const books=[...new Set(rows.map(p=>p.bookmakerId))].sort((a,b)=>{const preference=['draftkings','fanduel','betmgm','caesars','bet365'];const rank=x=>preference.includes(x)?preference.indexOf(x):99;return rank(a)-rank(b)||a.localeCompare(b)}),options=[],seen=new Set();
 for(let turn=0;turn<12&&options.length<max;turn++)for(const book of books){
  const list=rows.filter(p=>p.bookmakerId===book);if(list.length<legs)continue;const offset=(turn*Math.max(1,Math.floor(list.length/12)))%list.length,rotated=[...list.slice(offset),...list.slice(0,offset)],selected=[],events=new Set();
  for(const p of rotated){if(events.has(p.eventId)||!compatible([...selected,p]))continue;selected.push(p);events.add(p.eventId);if(selected.length===legs)break}
  if(selected.length<legs)for(const p of rotated){if(!compatible([...selected,p]))continue;selected.push(p);if(selected.length===legs)break}
  if(selected.length!==legs)continue;const key=selected.map(p=>p.id).sort().join('|');if(seen.has(key))continue;seen.add(key);options.push({id:'card_'+(options.length+1),picks:selected});if(options.length===max)break;
 }
 return options;
}
export function automaticCardFormat(options,legs){return {type:'json_schema',name:'playmaker_automatic_card',strict:true,schema:{type:'object',properties:{analysis:{type:'string'},cardId:{type:'string',enum:options.map(o=>o.id)},reasons:{type:'array',items:{type:'string',minLength:1},minItems:legs,maxItems:legs}},required:['analysis','cardId','reasons'],additionalProperties:false}}}
