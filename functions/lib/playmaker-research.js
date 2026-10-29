const cache=new Map();
const num=v=>typeof v==='number'&&Number.isFinite(v)?v:typeof v==='string'&&/^-?\d+(?:\.\d+)?$/.test(v)?Number(v):null;
const mean=list=>list.length?Math.round(list.reduce((a,b)=>a+b,0)/list.length*100)/100:null;
function seasonStart(league,now){const d=new Date(now),month={NFL:8,NCAAF:7,NBA:9,NHL:9,NCAAB:10,MLB:2}[league]??0;return new Date(Date.UTC(d.getUTCFullYear()-(d.getUTCMonth()<month?1:0),month,1)).toISOString()}
export function researchForPick(pick,current,history,now=Date.now()){
 const event=current.find(e=>e.eventID===pick.eventId),team=event?.players?.[pick.playerId]?.teamID;
 const side=event?.teams?.home?.teamID===team?'home':event?.teams?.away?.teamID===team?'away':null;
 const opponent=side?event.teams[side==='home'?'away':'home']?.teamID:null;
 const valid=[...new Map(history.events.filter(e=>e?.eventID).map(e=>[e.eventID,e])).values()].filter(e=>e.leagueID===pick.league&&e.status?.ended===true&&e.status?.finalized===true&&Date.parse(e.status.startsAt)<Math.min(now,Date.parse(pick.startTime))&&Date.parse(e.status.startsAt)>=Date.parse(seasonStart(pick.league,now))).sort((a,b)=>Date.parse(b.status.startsAt)-Date.parse(a.status.startsAt));
 const samples=pick.playerId?valid.flatMap(e=>{const value=num(e.results?.game?.[pick.playerId]?.[pick.statId]);return value===null?[]:[{eventId:e.eventID,date:e.status.startsAt,value}]}):[];
 const allowedStat=pick.league==='NFL'||pick.league==='NCAAF'?['receiving_yards','passing_yards'].includes(pick.statId)?'passing_yards':pick.statId:pick.statId;
 const defense=opponent&&allowedStat?valid.flatMap(e=>{const defending=e.teams?.home?.teamID===opponent?'home':e.teams?.away?.teamID===opponent?'away':null;if(!defending)return [];const value=num(e.results?.game?.[defending==='home'?'away':'home']?.[allowedStat]);return value===null?[]:[value]}):[];
 const complete=history.complete===true,avg5=complete?mean(samples.slice(0,5).map(x=>x.value)):null,avg10=complete?mean(samples.slice(0,10).map(x=>x.value)):null;
 const summary={source:'SportsGameOdds finalized results',asOf:history.asOf||null,complete,playerGames:samples.length,last5:avg5,last5Games:complete?Math.min(5,samples.length):0,last10:avg10,last10Games:complete?Math.min(10,samples.length):0,seasonSampleMean:mean(samples.map(x=>x.value)),seasonSampleGames:samples.length,opponentTeamId:opponent,opponentAllowedStat:allowedStat||null,opponentAllowedMean:mean(defense),opponentSampleGames:defense.length,opponentRecent5Allowed:complete?mean(defense.slice(0,5)):null,missing:['Verified injuries and current player availability','Confirmed playing time / snaps / minutes',...(samples.length?[]:['Player historical results']),...(defense.length?[]:['Opponent defensive results']),...(complete?[]:['Complete history pagination'])]};
 if(avg5!==null&&avg10!==null&&samples.length>=5)summary.historicalReference=Math.round((avg5*0.5+avg10*0.3+summary.seasonSampleMean*0.2)*100)/100;
 return summary;
}
export async function loadResearch(candidates,current,env,services={},now=Date.now()){
 const groups=new Map();for(const p of candidates){if(!groups.has(p.league))groups.set(p.league,[]);groups.get(p.league).push(p)}
 const byLeague=new Map();await Promise.all([...groups].slice(0,3).map(async([league,picks])=>{
 const ids=[...new Set(picks.map(p=>p.eventId))].slice(0,4),events=current.filter(e=>ids.includes(e.eventID)),teams=[...new Set(events.flatMap(e=>[e.teams?.home?.teamID,e.teams?.away?.teamID]).filter(Boolean))].slice(0,8),players=new Set(picks.map(p=>p.playerId).filter(Boolean));
 let result={events:[],complete:false,asOf:null};if(!teams.length){byLeague.set(league,result);return}
 const key=league+':'+teams.sort().join(',')+':'+[...players].sort().join(',');const hit=cache.get(key);if(!services.historyFetch&&hit&&now-hit.at<15*60*1000){byLeague.set(league,hit.value);return}
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),6500);
 try{let cursor;for(let page=0;page<2;page++){
 const url=new URL('https://api.sportsgameodds.com/v2/events');url.search=new URLSearchParams({leagueID:league,teamID:teams.join(','),ended:'true',finalized:'true',startsAfter:seasonStart(league,now),startsBefore:new Date(now).toISOString(),expandResults:'true',oddIDs:'points-home-game-ml-home',limit:'100',...(cursor?{cursor}:{})});
 const r=await (services.historyFetch||fetch)(url.href,{signal:controller.signal,headers:{Accept:'application/json','x-api-key':String(env.SPORTS_GAME_ODDS_API_KEY||env.SPORTSGAMEODDS_API_KEY||env.SGO_API_KEY||'').trim()},redirect:'manual'});if(!r.ok)throw Error('History unavailable');
 const reader=r.body.getReader(),parts=[];let size=0;try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>8*1024*1024){await reader.cancel();throw Error('History too large')}parts.push(value)}}finally{reader.releaseLock()}const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length}const data=JSON.parse(new TextDecoder().decode(bytes));if(data.success===false||!Array.isArray(data.data))throw Error('History unavailable');
 for(const e of data.data.slice(0,100)){const values=e.results?.game||{};result.events.push({eventID:e.eventID,leagueID:e.leagueID,status:e.status,teams:{home:{teamID:e.teams?.home?.teamID},away:{teamID:e.teams?.away?.teamID}},results:{game:Object.fromEntries(Object.entries(values).filter(([id])=>players.has(id)||id==='home'||id==='away'))}})}
 cursor=typeof data.nextCursor==='string'&&data.nextCursor.length<2000?data.nextCursor:null;if(!cursor){result.complete=true;break}
 }result.asOf=new Date(now).toISOString();if(!services.historyFetch){cache.set(key,{at:now,value:result});while(cache.size>4)cache.delete(cache.keys().next().value)}}catch{}finally{clearTimeout(timer)}byLeague.set(league,result);
 }));const memo=new Map();return Object.fromEntries(candidates.map(p=>{const key=p.eventId+':'+(p.playerId||'team')+':'+(p.statId||p.market);if(!memo.has(key))memo.set(key,researchForPick(p,current,byLeague.get(p.league)||{events:[],complete:false},now));return [p.id,memo.get(key)]}));
}
