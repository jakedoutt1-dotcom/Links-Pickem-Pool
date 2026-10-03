import {supportedGolfEvent} from './golf-event-support.mjs';
export const FORMATS={golf:{best:'Pick golfers · best scores count',tiers:'Tiered golf · best scores count',one:'One-and-done'},nascar:{simple:'Race finish pool',fantasy:'Fantasy roster · five starters + garage'}};
export function cleanConfig(game,input){
 const c={...input},n=Number;
 if(!FORMATS[game]?.[c.format])throw Error('Choose a supported format.');
 c.title=String(c.title||'').trim().slice(0,100);c.year=n(c.year);c.lockAt=new Date(c.lockAt).toISOString();
 if(!c.title||!Number.isInteger(c.year)||c.year<2024||c.year>2100)throw Error('Enter an event title and season.');
 c.pickCount=c.format==='fantasy'?5:c.format==='one'?1:n(c.pickCount);
 c.countBest=game==='golf'&&c.format!=='one'?n(c.countBest):c.pickCount;
 if(!Number.isInteger(c.pickCount)||c.pickCount<1||c.pickCount>10||!Number.isInteger(c.countBest)||c.countBest<1||c.countBest>c.pickCount)throw Error('Choose valid selection and counted-score limits.');
 c.penalty=n(c.penalty??10);if(!Number.isFinite(c.penalty)||c.penalty<0||c.penalty>100)throw Error('Choose a cut/withdrawal score from 0 to 100.');
 c.tieRule=c.tieRule==='best-finish'?'best-finish':'shared';
 c.scoring=c.scoring==='automatic'?'automatic':'manual';
 if(game==='nascar'&&c.scoring==='automatic'&&(!/^nascar-\d+$/.test(c.raceId||'')||c.year!==2026))throw Error('Automatic scoring requires a 2026 race from the NASCAR schedule.');
 if(game==='golf'&&c.scoring==='automatic'&&!/^\d+$/.test(c.tournamentId||''))throw Error('Choose a PGA tournament for automatic scoring.');
 if(game==='golf'&&!supportedGolfEvent(c.title))throw Error('Choose an individual stroke-play tournament. Team and match-play events are not supported.');
 c.phase=c.phase==='chase'?'chase':'regular';
 c.field=(c.field||[]).map(x=>({name:String(x.name||'').trim(),tier:n(x.tier)||1}));
 if(c.field.length<c.pickCount+(c.format==='fantasy'?1:0)||c.field.length>200||c.field.some(x=>!x.name||x.name.length>150)||new Set(c.field.map(x=>x.name.toLowerCase())).size!==c.field.length)throw Error('Enter a unique eligible field large enough for this format.');
 if(c.format==='tiers'&&new Set(c.field.map(x=>x.tier)).size!==c.pickCount)throw Error('Provide one tier for each required golfer selection.');
 return c;
}
export function validateCard(c,card,used=[]){
 const picks=card.picks||[],garage=card.garage||'';
 if(picks.length!==c.pickCount||new Set(picks).size!==picks.length||picks.some(p=>!c.field.some(f=>f.name===p)))throw Error('Choose exactly '+c.pickCount+' different eligible selections.');
 if(c.format==='tiers'&&new Set(picks.map(p=>c.field.find(f=>f.name===p).tier)).size!==c.pickCount)throw Error('Choose one golfer from each tier.');
 if(c.format==='one'&&picks.some(p=>used.includes(p)))throw Error('This golfer was already used this season.');
 if(c.format==='fantasy'){
  if(!garage||picks.includes(garage)||!c.field.some(f=>f.name===garage))throw Error('Choose a different eligible garage driver.');
  const limit=c.phase==='chase'?5:10;
  if([...picks,garage].some(p=>used.filter(x=>x===p).length>=limit))throw Error('A driver has reached the '+limit+'-race use limit.');
 }
 return {picks:[...picks],garage:c.format==='fantasy'?garage:''};
}
export function scoreCard(game,c,card,results){
 const rows=card.picks.map(name=>({name,...results[name]}));
 if(rows.some(r=>!r.status||r.status==='pending'))return {score:null,detail:'Awaiting verified results',counted:[]};
 if(game==='golf'){
  if(c.format==='one'){const r=rows[0];return {score:r.status==='final'?Number(r.earnings):0,detail:'Tournament earnings',counted:[r.name]};}
  const scored=rows.map(r=>({...r,value:r.status==='final'?Number(r.score):c.penalty})).sort((a,b)=>a.value-b.value).slice(0,c.countBest);
  return {score:scored.reduce((s,r)=>s+r.value,0),detail:'Lowest '+c.countBest+' scores count',counted:scored.map(r=>r.name)};
 }
 if(c.format==='simple')return {score:rows.reduce((sum,r)=>sum+Number(r.finish),0),detail:'Lowest combined finishing positions wins',counted:card.picks};
 return {score:rows.reduce((sum,r)=>sum+Number(r.points),0),detail:'Verified race points · garage excluded',counted:card.picks};
}
export function rules(game,c){
 if(game==='golf')return c.format==='one'?'Choose one golfer per tournament. Each golfer may be used once per season. Verified tournament earnings become your points; the highest season total wins. Missed cuts and withdrawals earn zero.':
  'Choose '+c.pickCount+' golfers'+(c.format==='tiers'?', one from each tier':'')+'. Your best '+c.countBest+' scores to par count; the lowest total wins. A missed cut or withdrawal is scored as +'+c.penalty+'. Equal totals share rank. Save before the event deadline.';
 const tie=c.tieRule==='best-finish'?' Ties compare each entry’s best finishing position, then the next best; identical finishes share rank.':' Equal totals share rank.';
 return (c.format==='simple'?'Choose '+c.pickCount+' drivers. Their verified finishing positions are added; the lowest total wins. Save before the race deadline.':
 'Choose five starters and a different garage driver. Only the final starters score. Drivers may be used '+(c.phase==='chase'?5:10)+' times in this season phase. Picks lock five minutes before the published race start. Swap your garage driver before the final-stage cutoff. The commissioner sets the garage cutoff. Highest points wins. This LINKS format does not include bonus matchup picks.')+tie+(c.scoring==='automatic'?' Official final results are imported automatically after inspection. Fantasy points are 55 for first, 35 for second, then one fewer per position down to a minimum of 1, plus stage points.':'');
}

export function compareEntries(game,c,results,a,b){
 if(a.score==null||b.score==null)return a.score==null?(b.score==null?0:1):-1;
 const diff=(c.format==='fantasy'||c.format==='one'?b.score-a.score:a.score-b.score);if(diff)return diff;
 if(game==='nascar'&&c.tieRule==='best-finish'){
 const finishes=row=>(row.card?.picks||[]).map(n=>results[n]?.finish).sort((x,y)=>x-y),aa=finishes(a),bb=finishes(b);
 if(aa.length!==c.pickCount||bb.length!==c.pickCount||[...aa,...bb].some(n=>!Number.isInteger(n)))return 0;
 for(let i=0;i<aa.length;i++)if(aa[i]!==bb[i])return aa[i]-bb[i];
 }return 0;
}
export function rankEntries(game,c,results,rows){
 rows.sort((a,b)=>compareEntries(game,c,results,a,b)||a.player.localeCompare(b.player));let rank=0;
 return rows.map((r,i)=>{if(i===0||compareEntries(game,c,results,rows[i-1],r)!==0)rank=i+1;return {...r,rank:r.score==null?null:rank}});
}
