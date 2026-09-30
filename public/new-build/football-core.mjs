// Shared server/browser rules. Results are settled only from completed games.
export function parseFootball(events=[]){return events.map(e=>{
 const c=e.competitions?.[0],teams=(c?.competitors||[]).map(t=>({id:String(t.team?.id),name:t.team?.shortDisplayName||t.team?.displayName||String(t.team?.id),code:t.team?.abbreviation||'',logo:t.team?.logo||'',moneyline:teamMoneyline(c,t.homeAway),score:t.score==null?null:Number(t.score)}));
 const status=e.status||c?.status||{},completed=!!status.type?.completed;
 return {id:String(e.id),date:e.date||c?.date,teams,state:status.type?.state||'',detail:status.type?.shortDetail||'',completed,winner:completed&&teams.length===2&&teams.every(t=>Number.isFinite(t.score))?(teams[0].score===teams[1].score?'TIE':teams.reduce((a,b)=>a.score>b.score?a:b).id):null};
}).filter(g=>g.teams.length===2)}
export const locked=(g,now=Date.now())=>!g||!Number.isFinite(Date.parse(g.date))||now>=Date.parse(g.date)||g.state!=='pre';
export function outcome(p,g){if(!p)return 'MISSED';if(!g?.completed||!g.winner)return 'PENDING';return g.winner==='TIE'?'TIE':g.winner===p.selection?'WIN':'LOSS'}
export function confidenceScore(picks,games){let score=0,max=0,correct=0;for(const p of picks){const g=games.find(g=>g.id===p.eventId),r=outcome(p,g),points=Number(p.points)||0;if(r==='WIN'){score+=points;correct++}if(r==='WIN'||r==='PENDING')max+=points}return {score,max,correct}}
export function survivorStatus(rows,slates,startWeek,week,{lives=1,tieSurvives=false}={}){
 let losses=0,wins=0;const history=[];
 for(let w=startWeek;w<=week;w++){const picks=rows.filter(p=>Number(p.period.split('-')[2])===w),p=picks[0],games=slates[w]||[],g=games.find(g=>g.id===p?.eventId);let result=p?outcome(p,g):games.length&&games.every(g=>locked(g))?'MISSED':'PENDING';
 if(w<week&&!games.length)result='PENDING';
 if(losses>=lives)break;
 if(result==='WIN')wins++;if(result==='LOSS'||result==='MISSED'||result==='TIE'&&!tieSurvives)losses++;
 history.push({week,eventId:p?.eventId,selection:p?.selection,team:g?.teams.find(t=>t.id===p?.selection)?.name||p?.selection||'No pick',result});
 }
 return {status:losses>=lives?'ELIMINATED':'ALIVE',losses,wins,lives,history};
}

// Display only published American moneylines; never substitute spreads or probabilities.
export function teamMoneyline(competition,side){
 if(!['home','away'].includes(side))return '';
 const odds=competition?.odds?.[0];
 const value=odds?.[side+'TeamOdds']?.moneyLine??odds?.[side+'TeamOdds']?.moneyline??odds?.[side+'MoneyLine']??odds?.[side+'Moneyline']??odds?.moneyline?.[side]?.close?.odds;
 if(value==null||String(value).trim()==='')return '';
 const n=Number(value);return Number.isFinite(n)&&Math.abs(n)>=100?(n>0?'+':'')+n:'';
}
