import {SLOTS} from '../../public/new-build/cfp-bracket-core.mjs';
const validTeam=t=>/^[1-9]\d*$/.test(String(t?.id))&&typeof t.name==='string'&&t.name.trim();
export function officialField(games,season,poll=null,now=Date.now()){
 const first=games.filter(g=>/first round/i.test(g.title)&&!g.tbd&&!g.voided&&Number.isFinite(Date.parse(g.start))).sort((a,b)=>Date.parse(a.start)-Date.parse(b.start));
 if(first.length!==4||new Set(first.flatMap(g=>[g.home.id,g.away.id])).size!==8)return null;
 const seeds=new Map(),ids=new Map();let conflict=false;
 for(const g of games)for(const t of [g.home,g.away])if(validTeam(t)&&Number.isInteger(t.seed)&&t.seed>=1&&t.seed<=12){if((seeds.has(t.seed)&&seeds.get(t.seed).id!==t.id)||(ids.has(t.id)&&ids.get(t.id)!==t.seed))conflict=true;seeds.set(t.seed,t);ids.set(t.id,t.seed);}
 if(conflict)return null;
 let teams=seeds.size===12?[...seeds.values()].sort((a,b)=>a.seed-b.seed):null;
 // In 2025/2026 the four highest FINAL CFP rankings receive byes. Determine the
 // other eight from real first-round participants, never the weekly top twelve.
 if(!teams){
  if(![2025,2026].includes(season)||!poll||Number(poll.season?.year)!==season||!Array.isArray(poll.ranks))return null;
  const selection=new Date(Date.UTC(season,11,3));selection.setUTCDate(3+(7-selection.getUTCDay())%7);
  const published=Date.parse(poll.date);if(!Number.isFinite(published)||published<selection.getTime()||published>=Date.UTC(season,11,15)||now<published)return null;
  const ranked=poll.ranks.filter(r=>Number.isInteger(r.current)&&r.current>0&&r.team?.id),byRank=new Map(ranked.map(r=>[r.current,r]));
  if(byRank.size!==ranked.length||new Set(ranked.map(r=>String(r.team.id))).size!==ranked.length)return null;
  if([1,2,3,4].some(n=>!byRank.has(n)))return null;
  const firstTeams=first.flatMap(g=>[g.home,g.away]),byId=new Map(ranked.map(r=>[String(r.team.id),r]));
  if(firstTeams.some(t=>!byId.has(t.id)))return null;
  const byes=[1,2,3,4].map(n=>byRank.get(n));if(byes.some(r=>firstTeams.some(t=>t.id===String(r.team.id))))return null;
  teams=[...byes.map((r,i)=>({id:String(r.team.id),name:r.team.displayName||r.team.location||r.team.name,rank:r.current,record:r.recordSummary||'',seed:i+1})),...firstTeams.sort((a,b)=>byId.get(a.id).current-byId.get(b.id).current).map((t,i)=>({...t,seed:i+5,rank:byId.get(t.id).current}))];
 }
 if(teams.length!==12||new Set(teams.map(t=>t.id)).size!==12||teams.some(t=>!validTeam(t)))return null;
 for(const slot of SLOTS.filter(s=>s.round===0)){const [high,low]=slot.from.map(n=>teams.find(t=>t.seed===n));if(!first.some(g=>g.home.id===high.id&&g.away.id===low.id))return null;}
 return {teams:teams.map(t=>({id:t.id,seed:t.seed,name:t.name,rank:t.rank??null,record:t.record||'',logo:'https://a.espncdn.com/i/teamlogos/ncaa/500/'+t.id+'.png'})),deadline:first[0].start};
}
export async function loadOfficialField(games,season){
 const direct=officialField(games,season);if(direct)return direct;
 if(games.filter(g=>/first round/i.test(g.title)&&!g.tbd&&!g.voided).length!==4)return null;
 try{const r=await fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings',{headers:{Accept:'application/json'},signal:AbortSignal.timeout(6000)});if(!r.ok)return null;const j=await r.json();return officialField(games,season,j.rankings?.find(p=>p.type==='cfp'));}catch{return null;}
}
