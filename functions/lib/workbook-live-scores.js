import {sharedScoreFeed} from './shared-score-feed.js';
const abbreviations='ARI Cardinals|ATL Falcons|BAL Ravens|BUF Bills|CAR Panthers|CHI Bears|CIN Bengals|CLE Browns|DAL Cowboys|DEN Broncos|DET Lions|GB Packers|HOU Texans|IND Colts|JAX Jaguars|KC Chiefs|LAC Chargers|LAR Rams|LV Raiders|MIA Dolphins|MIN Vikings|NE Patriots|NO Saints|NYG Giants|NYJ Jets|PHI Eagles|PIT Steelers|SEA Seahawks|SF 49ers|TB Buccaneers|TEN Titans|WSH Commanders';
const aliases=new Map();
for(const entry of abbreviations.split('|')){const [code,name]=entry.split(' ');aliases.set(code.toLowerCase(),code);aliases.set(name.toLowerCase(),code);}
for(const [alias,code] of Object.entries({was:'WSH',jac:'JAX',la:'LAR'}))aliases.set(alias,code);
const team=value=>aliases.get(String(value||'').toLowerCase())||'';
const score=value=>value!==null&&value!==undefined&&value!==''&&Number.isInteger(Number(value))&&Number(value)>=0&&Number(value)<=2000?Number(value):null;
export async function liveWorkbookBoard(board,selected,{load}={}){
 const week=board.weeks.find(w=>w.number===Number(selected))||board.weeks.filter(w=>w.players.some(p=>p.picks.some(Boolean))).at(-1)||board.weeks[0];
 const base={...board,scores:{week:week.number,status:'unavailable',checkedAt:new Date().toISOString()}};
 try{
  const apiWeek=week.number<=18?week.number:({19:1,20:2,21:3,22:5}[week.number]);
  const feed=await sharedScoreFeed(`workbook-nfl:${board.season}:${week.number}`,load||(async()=>{
   const url=`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${board.season}&seasontype=${week.number<=18?2:3}&week=${apiWeek}&limit=100`;
   const response=await fetch(url,{signal:AbortSignal.timeout(7000),headers:{accept:'application/json'}});
   if(!response.ok)throw Error('Scores unavailable');const data=await response.json();
   if(!Array.isArray(data.events)||!data.events.length)throw Error('Scores unavailable');return data;
  }),{ttl:30});
  let matched=0;
  const results=week.games.map(g=>{
   const away=team(g.away),home=team(g.home);if(!away||!home)return {...g};
   const matches=feed.events.filter(e=>{const c=e.competitions?.[0]?.competitors||[];return team(c.find(t=>t.homeAway==='away')?.team?.abbreviation)===away&&team(c.find(t=>t.homeAway==='home')?.team?.abbreviation)===home;});
   if(matches.length!==1)return {...g};matched++;
   const event=matches[0],competition=event.competitions[0],a=competition.competitors.find(t=>t.homeAway==='away'),h=competition.competitors.find(t=>t.homeAway==='home');
   const awayScore=score(a.score),homeScore=score(h.score),final=!!(event.status?.type?.completed||competition.status?.type?.completed);
   const valid=awayScore!==null&&homeScore!==null;
   return {...g,awayScore,homeScore,winner:final&&valid?(awayScore===homeScore?'TIE':awayScore>homeScore?g.away:g.home):''};
  });
  if(!matched)throw Error('No matching results');
  const last=results.at(-1),finalTotal=last?.winner&&last.awayScore!==null&&last.homeScore!==null?last.awayScore+last.homeScore:null;
  base.weeks=board.weeks.map(w=>w.number===week.number?{...w,games:results,finalTotal}:w);
  base.scores.status=matched===week.games.length?'live':'partial';
  return base;
 }catch{return base;}
}
