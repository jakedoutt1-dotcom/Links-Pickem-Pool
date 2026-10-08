// Shared, deterministic league rules. Every mutation is committed with a database revision check.
export const POSITIONS=['G','F','C'];
export const SLOTS=['G','F','C','UTIL','BENCH','IR'];
export const same=(a,b)=>String(a).trim().toLowerCase()===String(b).trim().toLowerCase();
export function fail(message,status=400){throw Object.assign(Error(message),{status})}
const requireIt=(ok,msg,status)=>{if(!ok)fail(msg,status)};
export function number(v,min,max,label,integer=false){const n=Number(v);requireIt(v!==''&&v!=null&&Number.isFinite(n)&&n>=min&&n<=max&&(!integer||Number.isInteger(n)),'Invalid '+label+'.');return n}
const text=(v,label,max=80)=>{const s=String(v||'').trim();requireIt(s.length>0&&s.length<=max,'Enter '+label+' (up to '+max+' characters).');return s};
const uid=()=>crypto.randomUUID();
export function newLeague(game,season){return {game,season,phase:'SETUP',revision:'',settings:{scoring:'points',slots:{G:2,F:2,C:1,UTIL:3},bench:5,ir:2,taxi:game==='dynasty'?3:0,faab:100,regularWeeks:20,playoffTeams:4,rookieRounds:4,tradeApproval:true,salaryCap:0},teams:[],players:{},rosters:{},weeks:{},draft:null,picks:[],claims:[],trades:[],log:[],waiverRunAt:null,waiverOrder:[],cooldowns:{},champion:null}}
export function slots(s){return Object.entries(s.settings.slots).flatMap(([pos,n])=>Array.from({length:n},(_,i)=>pos+'-'+(i+1)))}
export const eligible=(p,slot)=>slot.startsWith('UTIL-')||p.pos===slot.split('-')[0];
export function team(s,id){const t=s.teams.find(t=>t.id===id);requireIt(t,'Team not found.',404);return t}
export function owner(s,id,actor){const t=team(s,id);requireIt(same(t.owner,actor.name),'You can only manage your own team.',403);return t}
export const roster=(s,id)=>s.rosters[id]||[];
const hasPlayer=(s,id)=>Object.hasOwn(s.players,id);
const owned=(s,id)=>Object.entries(s.rosters).find(([,r])=>r.some(p=>p.id===id))?.[0];
export function weekState(s,w){return s.weeks[w]||{lineups:{},points:{},status:'OPEN',schedule:[]}}
export function isLocked(s,id,w,now){const st=weekState(s,w);return st.status==='FINAL'||st.schedule.some(g=>g.completed||now>=Date.parse(g.kickoff))}
const slateRequired=(s,w)=>requireIt(weekState(s,w).schedule.length,'Load the NBA schedule for this week before making roster moves.');
function earliest(s,w){return Math.min(...weekState(s,w).schedule.map(g=>Date.parse(g.kickoff)))}
function checkCapacity(s,id){
 const rs=roster(s,id),normal=rs.filter(p=>!['IR','TAXI'].includes(p.reserve));
 requireIt(normal.length<=slots(s).length+s.settings.bench,'Active roster is full. Include a player to drop.');
 requireIt(rs.filter(p=>p.reserve==='IR').length<=s.settings.ir,'IR is full.');
 requireIt(rs.filter(p=>p.reserve==='TAXI').length<=s.settings.taxi,'Taxi squad is full.');
 if(s.settings.salaryCap)requireIt(rs.reduce((n,p)=>n+p.salary,0)<=s.settings.salaryCap,'This move exceeds the salary cap.');
}
function add(s,tid,pid,salary=0,years=1){requireIt(hasPlayer(s,pid),'Player not found.');requireIt(!owned(s,pid),'That player is already rostered.');roster(s,tid).push({id:pid,salary,years,reserve:''});checkCapacity(s,tid)}
function drop(s,tid,pid,w,now){const rs=roster(s,tid),p=rs.find(p=>p.id===pid);requireIt(p,'Drop player is not on this team.');requireIt(!isLocked(s,pid,w,now),'Players lock at their NBA weekly lock.');s.rosters[tid]=rs.filter(p=>p.id!==pid);for(const line of Object.values(weekState(s,w).lineups))for(const k of Object.keys(line))if(line[k]===pid)delete line[k];s.cooldowns[pid]=now+86400000}
export const POINTS={pts:1,three:1,fgm:2,fga:-1,ftm:1,fta:-1,reb:1,ast:2,stl:4,blk:4,to:-2};
export function scoreStats(stats){let total=0;for(const [k,v] of Object.entries(stats)){requireIt(Object.hasOwn(POINTS,k),'Unknown basketball stat: '+k);total+=number(v,0,3000,k)*POINTS[k]}return Math.round(total*100)/100}

export function teamScore(s,tid,w){const st=weekState(s,w);return Math.round(Object.values(st.lineups[tid]||{}).reduce((n,id)=>n+(st.points[id]?.points||0),0)*100)/100}
export function standings(s){return s.teams.map(t=>{let wins=0,losses=0,ties=0,pf=0,pa=0;for(const [w,st]of Object.entries(s.weeks)){if(Number(w)>s.settings.regularWeeks||st.status!=='FINAL')continue;const m=st.matchups?.find(m=>m.includes(t.id));if(!m)continue;const opponent=m.find(id=>id!==t.id),a=teamScore(s,t.id,w),b=teamScore(s,opponent,w);pf+=a;pa+=b;if(a>b)wins++;else if(a<b)losses++;else ties++}return {...t,wins,losses,ties,pf:Math.round(pf*100)/100,pa:Math.round(pa*100)/100}}).sort((a,b)=>(b.wins+b.ties/2)-(a.wins+a.ties/2)||b.pf-a.pf||a.name.localeCompare(b.name))}
function generateSchedule(s){
 const ids=s.teams.map(t=>t.id);if(ids.length%2)ids.push(null);let rot=[...ids];
 for(let w=1;w<=s.settings.regularWeeks;w++){const matchups=[];for(let i=0;i<rot.length/2;i++)if(rot[i]&&rot.at(-1-i))matchups.push([rot[i],rot.at(-1-i)]);s.weeks[w]={...weekState(s,w),matchups};rot=[rot[0],rot.at(-1),...rot.slice(1,-1)]}
}
function ensurePicks(s){if(s.game!=='dynasty')return;for(let y=s.phase==='OFFSEASON'?s.season:s.season+1;y<=s.season+3;y++)for(const t of s.teams)for(let r=1;r<=s.settings.rookieRounds;r++)if(!s.picks.some(p=>p.season===y&&p.original===t.id&&p.round===r))s.picks.push({id:y+':'+t.id+':'+r,season:y,original:t.id,owner:t.id,round:r,player:null})}
function tradeAssets(s,ids,tid,w,now){requireIt(Array.isArray(ids)&&new Set(ids).size===ids.length,'Choose distinct trade assets.');for(const id of ids){if(id.startsWith('pick:')){requireIt(s.game==='dynasty','Future picks are Dynasty only.');const p=s.picks.find(p=>p.id===id.slice(5));requireIt(p&&p.owner===tid&&!p.player,'Draft pick ownership changed.')}else{requireIt(owned(s,id)===tid,'Player ownership changed.');requireIt(!isLocked(s,id,w,now),'A trade player has already locked for the week.')}}}
function executeTrade(s,t,w,now){tradeAssets(s,t.give,t.from,w,now);tradeAssets(s,t.receive,t.to,w,now);const transfer=(ids,from,to)=>{for(const id of ids)if(id.startsWith('pick:'))s.picks.find(p=>p.id===id.slice(5)).owner=to;else{const p=roster(s,from).find(p=>p.id===id);s.rosters[from]=roster(s,from).filter(p=>p.id!==id);roster(s,to).push({...p,reserve:''});for(const line of Object.values(weekState(s,w).lineups))for(const key of Object.keys(line))if(line[key]===id)delete line[key]}};transfer(t.give,t.from,t.to);transfer(t.receive,t.to,t.from);checkCapacity(s,t.from);checkCapacity(s,t.to);t.status='COMPLETED'}
export function applyAction(original,b,actor,{now=Date.now(),members=[]}={}){
 const s=structuredClone(original),a=b.action,w=number(b.week??1,1,26,'week',true),admin=()=>requireIt(actor.role==='admin','Commissioner only.',403);
 const current=()=>{requireIt(s.phase==='SEASON','The season must be active.');requireIt(w===s.currentWeek,'Choose the active week.');slateRequired(s,w);requireIt(weekState(s,w).status!=='FINAL'||a==='advance','This week is final. Advance to the next week.');};
 const preDraft=()=>requireIt(s.phase==='SETUP','League rules and teams are frozen after the draft starts.');
 if(a==='settings'){
  admin();preDraft();const x=b.settings||{};requireIt(x.scoring==='points','Choose head-to-head points.');
  s.season=number(b.season??s.season,2020,2100,'season',true);
  for(const k of ['G','F','C','UTIL'])s.settings.slots[k]=number(x.slots?.[k]??s.settings.slots[k],0,6,k+' slots',true);
  requireIt(slots(s).length>0&&slots(s).length<=20,'Choose 1 to 20 starting spots.');
  for(const [k,min,max]of [['bench',0,30],['ir',0,10],['taxi',0,10],['faab',0,10000],['regularWeeks',1,23],['rookieRounds',1,10],['salaryCap',0,100000]])s.settings[k]=number(x[k]??s.settings[k],min,max,k,true);
  s.settings.taxi=0;s.settings.salaryCap=0;s.settings.scoring=x.scoring;s.settings.tradeApproval=x.tradeApproval!==false;
  const playoff=number(x.playoffTeams??4,2,8,'playoff teams',true);requireIt([2,4,8].includes(playoff),'Playoff field must be 2, 4 or 8.');requireIt(s.settings.regularWeeks+Math.log2(playoff)<=26,'Playoffs must finish by week 26.');s.settings.playoffTeams=playoff;
  for(const t of s.teams){t.faab=s.settings.faab;checkCapacity(s,t.id)}
 }else if(a==='team'){
  preDraft();requireIt(s.teams.length<16,'Maximum 16 teams.');const name=text(b.name,'a team name'),who=actor.role==='admin'&&b.owner?String(b.owner):actor.name;
  requireIt(members.some(n=>same(n,who))||same(actor.name,who),'Choose a member of this pool.');
  requireIt(!s.teams.some(t=>same(t.owner,who)||same(t.name,name)),'This owner or team name already has a franchise.');
  const id=uid();s.teams.push({id,name,owner:who,faab:s.settings.faab});s.rosters[id]=[];s.waiverOrder.push(id);
 }else if(a==='draft-start'){
  admin();requireIt(s.phase==='SETUP'||s.phase==='OFFSEASON','A draft is already underway or the season is active.');
  requireIt(s.teams.length>=2&&s.teams.length>=s.settings.playoffTeams,'Add enough teams for the configured playoff field.');
  const order=b.order||s.teams.map(t=>t.id);requireIt(Array.isArray(order)&&order.length===s.teams.length&&new Set(order).size===order.length&&order.every(id=>s.teams.some(t=>t.id===id)),'Draft order must include each team once.');
  const rookie=s.phase==='OFFSEASON'&&s.game==='dynasty';ensurePicks(s);
  const rounds=rookie?s.settings.rookieRounds:slots(s).length+s.settings.bench;
  s.draft={type:rookie?'ROOKIE':'STARTUP',order,rounds,index:0,selections:[],queue:[]};
  for(let r=1;r<=rounds;r++){const row=rookie||r%2?order:[...order].reverse();for(const id of row){const pick=rookie?s.picks.find(p=>p.season===s.season&&p.round===r&&p.original===id):null;s.draft.queue.push({team:pick?.owner||id,round:r,pickId:pick?.id||null})}}
  s.phase='DRAFT';
 }else if(a==='draft-pick'){
  requireIt(s.phase==='DRAFT','No draft is open.');const turn=s.draft.queue[s.draft.index];requireIt(turn,'Draft is complete.');if(actor.role!=='admin')owner(s,turn.team,actor);
  if(s.draft.type==='ROOKIE')requireIt(s.players[b.player]?.years===0,'Rookie drafts accept rookies only.');
  add(s,turn.team,b.player,number(b.salary??0,s.settings.salaryCap?1:0,100000,'salary'),number(b.years??1,1,10,'contract years',true));
  if(turn.pickId)s.picks.find(p=>p.id===turn.pickId).player=b.player;
  s.draft.selections.push({...turn,player:b.player,number:s.draft.index+1});s.draft.index++;
  if(s.draft.index===s.draft.queue.length){s.phase='READY';generateSchedule(s)}
 }else if(a==='draft-skip'){
  admin();requireIt(s.phase==='DRAFT','No draft is open.');const turn=s.draft.queue[s.draft.index];if(turn.pickId)s.picks.find(p=>p.id===turn.pickId).player='SKIPPED';s.draft.selections.push({...turn,player:null,number:++s.draft.index});if(s.draft.index===s.draft.queue.length){s.phase='READY';generateSchedule(s)}
 }else if(a==='season-start'){
  admin();requireIt(s.phase==='READY','Finish the draft first.');s.currentWeek=number(b.startWeek??1,1,s.settings.regularWeeks,'start week',true);for(const t of s.teams)checkCapacity(s,t.id);if(!s.weeks[s.currentWeek]?.matchups)generateSchedule(s);s.phase='SEASON';ensurePicks(s);
 }else if(a==='lineup'){
  current();const tid=b.team;owner(s,tid,actor);const st=s.weeks[w],old=st.lineups[tid]||{},line=b.lineup;requireIt(line&&typeof line==='object'&&!Array.isArray(line),'Choose your starters.');
  const valid=slots(s),seen=new Set();for(const [slot,id]of Object.entries(line)){requireIt(valid.includes(slot),'Invalid lineup slot.');if(!id)continue;const r=roster(s,tid).find(p=>p.id===id);requireIt(r&&!r.reserve,'Only active roster players can start.');requireIt(!seen.has(id),'A player can start only once.');seen.add(id);requireIt(eligible(s.players[id],slot),'Player is not eligible for '+slot+'.')}
  for(const slot of valid){if(old[slot]!==line[slot]){for(const id of [old[slot],line[slot]].filter(Boolean))requireIt(!isLocked(s,id,w,now),'A player in this move has locked at weekly lock.')}}
  st.lineups[tid]=Object.fromEntries(Object.entries(line).filter(([,id])=>id));
 }else if(a==='reserve'){
  if(!['OFFSEASON','READY','DRAFT'].includes(s.phase))current();owner(s,b.team,actor);const p=roster(s,b.team).find(p=>p.id===b.player);requireIt(p,'Player not on your team.');requireIt(!isLocked(s,b.player,w,now),'Player has locked.');
  requireIt(['','IR','TAXI'].includes(b.reserve),'Invalid reserve slot.');
  if(b.reserve==='IR')requireIt(['IR','PUP','Out','Suspended'].includes(s.players[p.id].injury),'Player is not eligible for IR.');
  if(b.reserve==='TAXI'){requireIt(s.game==='dynasty'&&s.players[p.id].years<=1,'Taxi players must be rookies or second-year players.');requireIt(['OFFSEASON','READY','DRAFT'].includes(s.phase)||w===s.startWeek&&now<earliest(s,w),'Taxi additions close at the first weekly lock of your season.')}
  p.reserve=b.reserve;checkCapacity(s,b.team);if(b.reserve)for(const [slot,id]of Object.entries(weekState(s,w).lineups[b.team]||{}))if(id===b.player)delete s.weeks[w].lineups[b.team][slot];
 }else if(a==='waiver-window'){
  admin();current();requireIt(!s.waiverRunAt,'Finish the current waiver window first.');const when=Date.parse(b.runAt);requireIt(Number.isFinite(when)&&when>now&&when<now+7*86400000,'Choose a waiver deadline within seven days.');s.waiverRunAt=when;
 }else if(a==='claim'){
  current();const t=owner(s,b.team,actor);requireIt(s.waiverRunAt&&now<s.waiverRunAt,'Waiver claims are closed.');requireIt(!owned(s,b.player)&&hasPlayer(s,b.player),'Player is unavailable.');const bid=number(b.bid,0,t.faab,'FAAB bid',true);
  requireIt(!s.claims.some(c=>c.team===t.id&&c.player===b.player&&c.status==='PENDING'),'A claim for this player is already pending.');
  if(b.drop)requireIt(owned(s,b.drop)===t.id,'You do not own the drop player.');
  s.claims.push({id:uid(),team:t.id,player:b.player,drop:b.drop||'',bid,status:'PENDING',created:now});
 }else if(a==='claim-cancel'){
  const c=s.claims.find(c=>c.id===b.id);requireIt(c&&c.status==='PENDING','Claim is no longer pending.');owner(s,c.team,actor);requireIt(now<s.waiverRunAt,'Waiver deadline has passed.');c.status='CANCELLED';
 }else if(a==='waiver-process'){
  admin();current();requireIt(s.waiverRunAt&&now>=s.waiverRunAt,'Wait until the waiver deadline.');
  const pending=s.claims.filter(c=>c.status==='PENDING').sort((a,b)=>b.bid-a.bid||s.waiverOrder.indexOf(a.team)-s.waiverOrder.indexOf(b.team)||a.created-b.created);
  for(const pendingClaim of pending){const c=s.claims.find(x=>x.id===pendingClaim.id),snapshot=structuredClone(s);try{const t=team(s,c.team);requireIt(c.bid<=t.faab,'Insufficient FAAB.');requireIt(!isLocked(s,c.player,w,now),'Player has locked for this week.');requireIt(now>=(s.cooldowns[c.player]||0),'Dropped-player waiting period has not ended.');if(c.drop)drop(s,c.team,c.drop,w,now);add(s,c.team,c.player,s.settings.salaryCap?Math.max(1,c.bid):0);t.faab-=c.bid;c.status='WON';s.waiverOrder=s.waiverOrder.filter(id=>id!==c.team).concat(c.team)}catch(e){Object.assign(s,snapshot);const rejected=s.claims.find(x=>x.id===c.id);rejected.status='FAILED';rejected.reason=e.message}}
  s.waiverRunAt=null;
 }else if(a==='add'||a==='drop'){
  if(!(a==='drop'&&['OFFSEASON','READY','DRAFT'].includes(s.phase)))current();owner(s,b.team,actor);requireIt(!s.waiverRunAt,'Player transactions use waivers while the window is open.');
  if(a==='drop')drop(s,b.team,b.player,w,now);else{requireIt(!isLocked(s,b.player,w,now),'Player has locked.');requireIt(now>=(s.cooldowns[b.player]||0),'Dropped players wait 24 hours before becoming available.');if(b.drop)drop(s,b.team,b.drop,w,now);add(s,b.team,b.player,s.settings.salaryCap?1:0)}
 }else if(a==='trade'){
  if(s.phase!=='OFFSEASON')current();const from=owner(s,b.team,actor);team(s,b.to);requireIt(from.id!==b.to,'Choose another team.');tradeAssets(s,b.give,from.id,w,now);tradeAssets(s,b.receive,b.to,w,now);requireIt(b.give.length+b.receive.length>0,'Choose trade assets.');
  s.trades.push({id:uid(),from:from.id,to:b.to,give:b.give,receive:b.receive,status:'OFFERED',week:w,created:now});
 }else if(a==='trade-response'){
  if(s.phase!=='OFFSEASON')current();const t=s.trades.find(t=>t.id===b.id);requireIt(t,'Trade not found.');requireIt(t.week===w,'Trade offer expired.');
  if(b.response==='cancel'){owner(s,t.from,actor);requireIt(t.status==='OFFERED','Trade cannot be cancelled.');t.status='CANCELLED'}
  else if(b.response==='reject'){owner(s,t.to,actor);requireIt(t.status==='OFFERED','Trade is no longer offered.');t.status='REJECTED'}
  else if(b.response==='accept'){owner(s,t.to,actor);requireIt(t.status==='OFFERED','Trade is no longer offered.');tradeAssets(s,t.give,t.from,w,now);tradeAssets(s,t.receive,t.to,w,now);if(s.settings.tradeApproval)t.status='REVIEW';else executeTrade(s,t,w,now)}
  else {admin();requireIt(t.status==='REVIEW','Both owners must agree first.');requireIt(['approve','veto'].includes(b.response),'Invalid response.');if(b.response==='approve')executeTrade(s,t,w,now);else t.status='VETOED'}
 }else if(a==='stats'){
  admin();current();requireIt(hasPlayer(s,b.player),'Select a player.');requireIt(now>=earliest(s,w),'Scoring opens at the first weekly lock.');const reason=text(b.reason,'the scoring source or correction reason',300);let points;
  if(b.stats)points=scoreStats(b.stats,s.settings.scoring);else points=number(b.points,-1000,3000,'fantasy points');
  s.weeks[w].points[b.player]={points,source:reason,at:new Date(now).toISOString(),by:actor.name};
 }else if(a==='finalize'){
  admin();current();const st=s.weeks[w];requireIt(st.endsAt&&now>=Date.parse(st.endsAt),'Wait until this scoring week has ended.');requireIt(st.schedule.every(g=>g.completed),'All NBA games must be final before settling this week.');
  for(const tid of s.teams.map(t=>t.id))for(const id of Object.values(st.lineups[tid]||{}))requireIt(st.points[id]!=null,'Missing verified score for '+s.players[id].name+'. Enter zero explicitly for a bye or inactive player.');
  st.status='FINAL';
  if(w>=s.settings.regularWeeks){
   if(w===s.settings.regularWeeks){s.seeds=standings(s).slice(0,s.settings.playoffTeams).map(t=>t.id);s.weeks[w+1]={...weekState(s,w+1),matchups:s.seeds.slice(0,s.seeds.length/2).map((id,i)=>[id,s.seeds.at(-1-i)])}}
   else{const winners=st.matchups.map(([a,b])=>{const diff=teamScore(s,a,w)-teamScore(s,b,w);return diff>0?a:diff<0?b:s.seeds.indexOf(a)<s.seeds.indexOf(b)?a:b});if(winners.length===1){s.champion=winners[0];s.phase='COMPLETE'}else{winners.sort((a,b)=>s.seeds.indexOf(a)-s.seeds.indexOf(b));s.weeks[w+1]={...weekState(s,w+1),matchups:winners.slice(0,winners.length/2).map((id,i)=>[id,winners.at(-1-i)])}}}
  }
 }else if(a==='advance'){
  admin();current();requireIt(s.weeks[w].status==='FINAL','Finalize this week first.');requireIt(w<26,'Season has ended.');s.currentWeek=w+1;
  const next=s.weeks[w+1]||weekState(s,w+1);for(const t of s.teams)next.lineups[t.id]=Object.fromEntries(Object.entries(s.weeks[w].lineups[t.id]||{}).filter(([,id])=>roster(s,t.id).some(p=>p.id===id&&!p.reserve)));s.weeks[w+1]=next;
  for(const t of s.trades)if(['OFFERED','REVIEW'].includes(t.status))t.status='EXPIRED';
  for(const c of s.claims)if(c.status==='PENDING')c.status='EXPIRED';s.waiverRunAt=null;
 }else if(a==='rollover'){
  admin();requireIt(s.phase==='COMPLETE','Complete the championship before renewing.');requireIt(Number(b.confirmSeason)===s.season,'Confirm the completed season.');s.season++;s.phase=s.game==='dynasty'?'OFFSEASON':'SETUP';s.weeks={};s.draft=null;s.champion=null;s.seeds=[];s.currentWeek=null;s.startWeek=null;s.claims=[];s.trades=[];s.cooldowns={};s.waiverRunAt=null;
  for(const p of Object.values(s.players))p.years++;
  for(const t of s.teams){t.faab=s.settings.faab;if(s.game==='basketball')s.rosters[t.id]=[];else{s.rosters[t.id]=roster(s,t.id).filter(p=>!s.settings.salaryCap||--p.years>0);for(const p of roster(s,t.id))p.reserve='';}}
  ensurePicks(s);
 }else fail('Unsupported league action.');
 if(a==='season-start')s.startWeek=s.currentWeek;
 s.log.unshift({id:uid(),action:a,by:actor.name,at:new Date(now).toISOString(),detail:b.reason||b.player||b.name||b.id||'',week:w,season:s.season});
 s.log=s.log.slice(0,300);return s
}
export function publicLeague(s,actor){const out=structuredClone(s),mine=s.teams.find(t=>same(t.owner,actor.name))?.id;out.log=out.log.filter(l=>!['claim','claim-cancel'].includes(l.action)||same(l.by,actor.name));out.claims=out.claims.filter(c=>c.status!=='PENDING'||c.team===mine);out.trades=out.trades.filter(t=>t.status==='COMPLETED'||t.from===mine||t.to===mine||actor.role==='admin');return {...out,standings:standings(s),myTeam:mine||null}}
