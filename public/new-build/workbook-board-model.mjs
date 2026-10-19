const text=(v,max=80)=>{if(typeof v!=='string'||v.length>max||/[<>\x00-\x1f]/.test(v))throw Error('Invalid workbook text.');return v.trim();};
const number=v=>v===null||v===undefined||v===''?null:Number.isInteger(v)&&v>=0&&v<=2000?v:(()=>{throw Error('Invalid workbook number.');})();
export function normalizeBoard(input){
 if(!input||!Array.isArray(input.weeks)||!input.weeks.length||input.weeks.length>22)throw Error('Include 1–22 workbook weeks.');
 const used=new Set();
 const weeks=input.weeks.map(w=>{
  if(!Number.isInteger(w.number)||w.number<1||w.number>22||used.has(w.number))throw Error('Invalid or repeated week.');used.add(w.number);
  if(!Array.isArray(w.games)||w.games.length>24||!Array.isArray(w.players)||w.players.length>100)throw Error('Invalid workbook week.');
  const games=w.games.map(g=>{const away=text(g.away,40),home=text(g.home,40),winner=text(g.winner||'',40);if(!away||!home||away===home&&away!=='TBD'||winner&&![away,home,'TIE'].includes(winner))throw Error('Invalid matchup result.');return {away,home,winner,awayScore:number(g.awayScore),homeScore:number(g.homeScore)};});
  const names=new Set(),players=w.players.map(p=>{const name=text(p.name,60);if(!name||names.has(name.toLowerCase()))throw Error('Player names must be unique.');names.add(name.toLowerCase());if(!Array.isArray(p.picks)||p.picks.length!==games.length)throw Error('Picks must match the games.');return {name,tie:number(p.tie),picks:p.picks.map((v,i)=>{const pick=text(v||'',40);if(pick&&![games[i].away,games[i].home].includes(pick))throw Error('A pick is not in its matchup.');return pick;})};});
  return {number:w.number,label:text(w.label||'Week '+w.number,40),finalTotal:number(w.finalTotal),games,players};
 });
 return {title:text(input.title||'NFL Crew',80),season:Number.isInteger(input.season)&&input.season>=2000&&input.season<=2100?input.season:2026,weeks:weeks.sort((a,b)=>a.number-b.number)};
}
export function weekStandings(week){
 const final=week.games.length>0&&week.games.every(g=>g.winner);
 const rows=week.players.map(p=>({...p,correct:p.picks.reduce((n,pick,i)=>n+(!!pick&&week.games[i].winner!=='TIE'&&pick===week.games[i].winner?1:0),0),difference:p.tie!==null&&week.finalTotal!==null?Math.abs(p.tie-week.finalTotal):null,entered:p.picks.some(Boolean)}));
 const active=rows.filter(p=>p.entered),best=Math.max(0,...active.map(p=>p.correct));
 const leaders=active.filter(p=>p.correct===best),needTie=leaders.length>1&&leaders.some(p=>p.difference===null);
 const bestDiff=Math.min(Infinity,...leaders.map(p=>p.difference??Infinity));
 for(const row of rows){row.leader=row.entered&&row.correct===best;row.winner=!!(final&&row.leader&&(leaders.length===1||!needTie&&row.difference===bestDiff));row.rank=1+active.filter(p=>p.correct>row.correct||final&&!needTie&&p.correct===row.correct&&p.difference!==null&&(row.difference===null||p.difference<row.difference)).length;}
 return {final,needTie:final&&needTie,rows:rows.sort((a,b)=>(b.entered-a.entered)||a.rank-b.rank||a.name.localeCompare(b.name))};
}
