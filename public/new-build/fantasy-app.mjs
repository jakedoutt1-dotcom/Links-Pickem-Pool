import {slots,eligible,teamScore,weekState,isLocked} from './fantasy-core.mjs';
const game=document.body.dataset.game,pool=new URLSearchParams(location.search).get('pool')||'',root=document.getElementById('leagueContent'),nav=document.getElementById('leagueNav'),msg=document.getElementById('leagueMessage');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data,s,view='team',week=1,busy=false,query='',position='';
const admin=()=>data.role==='admin',name=id=>s.teams.find(t=>t.id===id)?.name||id,pname=id=>s.players[id]?.name||id;
const button=(label,action,body={},disabled=false)=>'<button type="button" data-action="'+action+'" data-body="'+esc(JSON.stringify(body))+'" '+(disabled?'disabled':'')+'>'+esc(label)+'</button>';
const table=(heads,rows)=>'<div class="format-scroll"><table class="format-table"><thead><tr>'+heads.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const field=(label,id,value,type='text',extra='')=>'<label>'+esc(label)+'<input id="'+id+'" name="'+id+'" type="'+type+'" value="'+esc(value)+'" '+extra+'></label>';
const select=(label,id,options)=>'<label>'+esc(label)+'<select id="'+id+'" name="'+id+'">'+options+'</select></label>';
const option=(v,label,selected=false)=>'<option value="'+esc(v)+'" '+(selected?'selected':'')+'>'+esc(label)+'</option>';
const teamOptions=(selected)=>s.teams.map(t=>option(t.id,t.name,t.id===selected)).join('');
const playerOptions=(ids)=>'<option value="">None</option>'+ids.map(id=>option(id,pname(id))).join('');
const card=(title,body)=>'<section class="format-card"><h2>'+esc(title)+'</h2>'+body+'</section>';
const form=(id,content,label)=>'<form id="'+id+'" class="league-form">'+content+'<button type="submit">'+label+'</button></form>';
function formData(id){return Object.fromEntries(new FormData(document.getElementById(id)))}
async function api(action='state',body=null,extra={}){const r=await window.LINKS_API_FETCH('./api/fantasy?'+new URLSearchParams({pool,game,action,...extra}),{method:body?'POST':'GET',cache:'no-store',...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify({pool,game,action,week,revision:s?.revision||'',...body})}:{})});const j=await r.json();if(!r.ok)throw Error(j.error||'League request failed.');return j}
async function load(history){if(busy)return;busy=true;msg.textContent='Loading your league...';try{data=await api(history?'history':'state',null,history?{season:history}:{});s=data.league;week=s.currentWeek||1;draw();msg.textContent=data.active?'League saved across your devices.':'Read-only season or archived game.'}catch(e){msg.textContent=e.message;root.innerHTML='';nav.innerHTML=''}finally{busy=false}}
async function save(action,body={}){if(busy||!data.active)return;busy=true;const controls=[...root.querySelectorAll('button')].map(b=>[b,b.disabled]);controls.forEach(([b])=>b.disabled=true);msg.textContent='Saving...';try{await api(action,body);busy=false;await load();msg.textContent='Saved to your league.'}catch(e){msg.textContent=e.message;busy=false;controls.forEach(([b,d])=>b.disabled=d)}}
function wire(){
 root.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.action;if(['draft-start','draft-skip','season-start','finalize','advance','rollover','import-legacy'].includes(a)&&!confirm('Confirm '+a.replaceAll('-',' ')+'? This changes the shared league.'))return;save(a,JSON.parse(b.dataset.body))});
 if(!data.active)root.querySelectorAll('button,input,select').forEach(e=>{if(e.closest('#history')||['viewWeek','search','position'].includes(e.id))return;e.disabled=true});
}
function draw(){
 document.getElementById('leagueStatus').textContent=s.season+' • '+s.phase.replaceAll('_',' ')+' • '+(s.currentWeek?'Week '+s.currentWeek:s.teams.length+' teams');
 const tabs=[['team','My team'],['players','Players'],['draft','Draft'],['matchups','Matchups'],['trades','Trades'],['league','League'],...(admin()?[['admin','Commissioner']]:[])];
 nav.innerHTML=tabs.map(([id,label])=>'<button type="button" data-view="'+id+'" class="'+(view===id?'active':'')+'">'+label+'</button>').join('');
 nav.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(!busy){view=b.dataset.view;if(view!=='matchups')week=s.currentWeek||1;draw()}});
 ({team:myTeam,players:playersView,draft:draftView,matchups:matchupsView,trades:tradesView,league:leagueView,admin:adminView}[view]||myTeam)();wire();
}
function myTeam(){
 const tid=s.myTeam,t=s.teams.find(t=>t.id===tid),st=weekState(s,week),rs=s.rosters[tid]||[];
 if(!t){root.innerHTML=card('Your franchise',s.phase==='SETUP'?'<p>Create your team using your existing pool membership.</p>'+form('join',field('Team name','name','', 'text','required maxlength="80"'),'Create my team'):'<p>Your commissioner assigns franchises before the draft. Ask them about an available team.</p>');document.getElementById('join')?.addEventListener('submit',e=>{e.preventDefault();save('team',formData('join'))});return}
 root.innerHTML=card(t.name,'<div class="league-metrics"><div>FAAB remaining<b>$'+t.faab+'</b></div><div>Rostered<b>'+rs.length+'</b></div><div>Weekly score<b>'+teamScore(s,tid,week).toFixed(2)+'</b></div></div><p>Lineups carry forward when the commissioner advances the week. Each player locks at kickoff. Empty starting spots score zero.</p>');
 if(s.phase==='SEASON'){
 root.innerHTML+=card('Set your starters',form('lineup',slots(s).map(slot=>select(slot,slot,option('','Empty')+rs.filter(r=>!r.reserve&&eligible(s.players[r.id],slot)).map(r=>option(r.id,pname(r.id)+(isLocked(s,r.id,week,Date.now())?' • LOCKED':''),st.lineups[tid]?.[slot]===r.id)).join(''))).join(''),'Save lineup'));
 document.getElementById('lineup').onsubmit=e=>{e.preventDefault();save('lineup',{team:tid,lineup:formData('lineup')})};
 }
 root.insertAdjacentHTML('beforeend',card('Roster',rs.length?table(['Player','Position','Status','Actions'],rs.map(r=>{const p=s.players[r.id];return [esc(p.name)+'<small>'+esc(p.team||'Free agent')+'</small>',esc(p.pos),esc(r.reserve||p.injury||'Active'),['SEASON','OFFSEASON','READY','DRAFT'].includes(s.phase)?button('Bench','reserve',{team:tid,player:r.id,reserve:''})+button('IR','reserve',{team:tid,player:r.id,reserve:'IR'})+(game==='dynasty'?button('Taxi','reserve',{team:tid,player:r.id,reserve:'TAXI'}):'')+button('Drop','drop',{team:tid,player:r.id}):'Draft / offseason roster']})):'<p>Your draft picks will appear here.</p>'));
 if(s.settings.salaryCap)root.insertAdjacentHTML('beforeend',card('Contracts',table(['Player','Salary','Years remaining'],rs.map(r=>[esc(pname(r.id)),r.salary,r.years]))+'<p>Cap: '+s.settings.salaryCap+'. Expiring contracts leave the roster at renewal.</p>'));
}
function filteredPlayers(){
 const owned=new Set(Object.values(s.rosters).flat().map(p=>p.id));
 return Object.values(s.players).filter(p=>(!position||p.pos===position)&&(!query||(p.name+' '+p.team).toLowerCase().includes(query.toLowerCase()))).sort((a,b)=>a.name.localeCompare(b.name)).map(p=>({...p,owned:owned.has(p.id)}));
}
function searchBar(){return '<div class="league-filters">'+field('Search players','search',query,'search')+select('Position','position',option('','All')+['QB','RB','WR','TE','K','DEF'].map(p=>option(p,p,p===position)).join(''))+'</div>'}
function hookSearch(render){document.getElementById('search').oninput=e=>{query=e.target.value;render();wire();const input=document.getElementById('search');input.focus();input.setSelectionRange(query.length,query.length)};document.getElementById('position').onchange=e=>{position=e.target.value;render();wire()}}
function playersView(){
 const tid=s.myTeam,rs=s.rosters[tid]||[],list=filteredPlayers(),windowOpen=s.waiverRunAt&&Date.now()<s.waiverRunAt;
 root.innerHTML=card('NFL player directory','<p>'+(s.waiverRunAt?'Waiver deadline: '+esc(new Date(s.waiverRunAt).toLocaleString())+'. Highest affordable bid wins; ties use rolling priority.':'Free agents can be added before kickoff. Dropped players wait 24 hours.')+'</p>'+searchBar()+table(['Player','Position','Availability'],list.slice(0,75).map(p=>[esc(p.name)+'<small>'+esc(p.team)+' '+esc(p.injury)+'</small>',p.pos,p.owned?'Rostered':button(windowOpen?'Claim':'Add','choose-player',{player:p.id},!tid||s.phase!=='SEASON')]))+'<p>'+list.length+' matches. Showing the first 75; narrow your search.</p>');
 root.querySelectorAll('[data-action="choose-player"]').forEach(b=>{b.removeAttribute('data-action');b.onclick=()=>{const id=JSON.parse(b.dataset.body).player;root.innerHTML+=card('Add '+pname(id),form('acquire',select('Drop a player (optional)','drop',playerOptions(rs.map(p=>p.id)))+(windowOpen?field('FAAB bid','bid',0,'number','min="0" max="'+s.teams.find(t=>t.id===tid).faab+'"'):''),windowOpen?'Submit claim':'Add player'));document.getElementById('acquire').onsubmit=e=>{e.preventDefault();save(windowOpen?'claim':'add',{team:tid,player:id,...formData('acquire')})};b.disabled=true;document.getElementById('acquire').scrollIntoView({block:'center',behavior:'smooth'})}});
 root.innerHTML+=card('Your claims',table(['Player','Bid','Status',''],s.claims.filter(c=>c.team===tid).map(c=>[esc(pname(c.player)),c.bid,esc(c.status)+(c.reason?'<small>'+esc(c.reason)+'</small>':''),c.status==='PENDING'?button('Cancel','claim-cancel',{id:c.id}):''])));
 // innerHTML append replaces nodes; bind player actions after the claims section exists.
 root.querySelectorAll('button[data-body]').forEach(b=>{if(b.hasAttribute('data-action'))return;b.onclick=()=>{const id=JSON.parse(b.dataset.body).player;document.getElementById('acquireCard')?.remove();const wrap=document.createElement('div');wrap.id='acquireCard';wrap.innerHTML=card('Add '+pname(id),form('acquire',select('Drop a player (optional)','drop',playerOptions(rs.map(p=>p.id)))+(windowOpen?field('FAAB bid','bid',0,'number','min="0"'):''),windowOpen?'Submit claim':'Add player'));root.append(wrap);document.getElementById('acquire').onsubmit=e=>{e.preventDefault();save(windowOpen?'claim':'add',{team:tid,player:id,...formData('acquire')})}}});
 hookSearch(playersView);
}
function draftView(){
 const d=s.draft,turn=d?.queue[d.index],mine=turn&&(turn.team===s.myTeam||admin());
 root.innerHTML=card('Draft room','<p>Startup uses a snake draft. Dynasty rookie drafts use the same order each round and honor traded picks. This is an untimed shared draft. The room refreshes every 15 seconds while you are not editing a field.</p>'+(d?'<p class="league-on-clock">'+(turn?esc(name(turn.team))+' is on the clock • Round '+turn.round:'Draft complete')+'</p>':'<p>Your commissioner opens the draft after all teams join.</p>'));
 if(turn&&s.phase==='DRAFT'){
 root.innerHTML+=card('Available players',searchBar()+field('Contract salary (if enabled)','draftSalary',s.settings.salaryCap?1:0,'number','min="0"')+field('Contract years','draftYears',1,'number','min="1" max="10"')+table(['Player','Position',''],filteredPlayers().filter(p=>!p.owned&&(d.type!=='ROOKIE'||p.years===0)).slice(0,75).map(p=>[esc(p.name)+'<small>'+esc(p.team)+'</small>',p.pos,'<button type="button" data-pick="'+esc(p.id)+'" '+(!mine?'disabled':'')+'>Draft player</button>'])));
 root.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>save('draft-pick',{player:b.dataset.pick,salary:document.getElementById('draftSalary').value,years:document.getElementById('draftYears').value}));hookSearch(draftView);
 }
 if(d)root.innerHTML+=card('Draft board',table(['Pick','Round','Team','Player'],d.selections.map(p=>[p.number,p.round,esc(name(p.team)),p.player?esc(pname(p.player)):'Commissioner skipped'])));
 // Rebind after rendering draft history.
 root.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>save('draft-pick',{player:b.dataset.pick,salary:document.getElementById('draftSalary').value,years:document.getElementById('draftYears').value}));
 if(document.getElementById('search'))hookSearch(draftView);
 if(game==='dynasty')root.innerHTML+=card('Future draft picks',table(['Season','Round','Original team','Current owner'],s.picks.filter(p=>!p.player).map(p=>[p.season,p.round,esc(name(p.original)),esc(name(p.owner))])));
 if(document.getElementById('search')){hookSearch(draftView);root.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>save('draft-pick',{player:b.dataset.pick,salary:document.getElementById('draftSalary').value,years:document.getElementById('draftYears').value}))}
}
function matchupsView(){
 const st=weekState(s,week);
 root.innerHTML=card('Weekly matchups',select('Week','viewWeek',Array.from({length:18},(_,i)=>option(i+1,'Week '+(i+1),week===i+1)).join(''))+'<p>'+esc(st.status)+' • Scores require commissioner verification. Unverified players display “Pending”. Playoff ties advance the higher regular-season seed.</p>'+table(['Home','Points','Away','Points'],(st.matchups||[]).map(([a,b])=>[esc(name(a)),teamScore(s,a,week).toFixed(2),esc(name(b)),teamScore(s,b,week).toFixed(2)])));
 document.getElementById('viewWeek').onchange=e=>{week=Number(e.target.value);draw()};
 root.innerHTML+=card('Starting players',table(['Team','Slot','Player','Points','Source'],Object.entries(st.lineups).flatMap(([tid,line])=>Object.entries(line).map(([slot,id])=>[esc(name(tid)),esc(slot),esc(pname(id)),st.points[id]?.points??'Pending',esc(st.points[id]?.source||'Awaiting verification')]))));
 document.getElementById('viewWeek').onchange=e=>{week=Number(e.target.value);draw()};
}
function assetOptions(tid){return (s.rosters[tid]||[]).map(p=>option(p.id,pname(p.id))).join('')+s.picks.filter(p=>p.owner===tid&&!p.player).map(p=>option('pick:'+p.id,p.season+' Round '+p.round+' • '+name(p.original))).join('')}
function tradesView(){
 root.innerHTML=card('Trade center','<p>Both owners must agree. '+(s.settings.tradeApproval?'The commissioner then approves or vetoes.':'Accepted trades execute immediately.')+' Ownership and roster limits are checked again when players move.</p>');
 if(s.myTeam&&['SEASON','OFFSEASON'].includes(s.phase)){
 root.innerHTML+=card('Make an offer',form('trade',select('Trade partner','to',teamOptions())+'<label>You send<select id="give" multiple size="6">'+assetOptions(s.myTeam)+'</select></label><label>You receive<select id="receive" multiple size="6"></select></label>','Send offer'));
 const partner=document.getElementById('to');partner.value=s.teams.find(t=>t.id!==s.myTeam)?.id||'';const fill=()=>document.getElementById('receive').innerHTML=assetOptions(partner.value);partner.onchange=fill;fill();
 document.getElementById('trade').onsubmit=e=>{e.preventDefault();save('trade',{team:s.myTeam,to:partner.value,give:[...document.getElementById('give').selectedOptions].map(o=>o.value),receive:[...document.getElementById('receive').selectedOptions].map(o=>o.value)})};
 }
 const asset=id=>id.startsWith('pick:')?(()=>{const p=s.picks.find(p=>p.id===id.slice(5));return p?p.season+' round '+p.round+' ('+name(p.original)+')':id})():pname(id);
 const html=card('Trade activity',s.trades.length?s.trades.map(t=>'<article class="league-trade"><h3>'+esc(name(t.from))+' → '+esc(name(t.to))+'</h3><p>Sends: '+esc(t.give.map(asset).join(', '))+'</p><p>Receives: '+esc(t.receive.map(asset).join(', '))+'</p><b>'+esc(t.status)+'</b><div class="format-toolbar">'+(t.status==='OFFERED'&&t.to===s.myTeam?button('Accept','trade-response',{id:t.id,response:'accept'})+button('Reject','trade-response',{id:t.id,response:'reject'}):'')+(t.status==='OFFERED'&&t.from===s.myTeam?button('Cancel offer','trade-response',{id:t.id,response:'cancel'}):'')+(t.status==='REVIEW'&&admin()?button('Approve','trade-response',{id:t.id,response:'approve'})+button('Veto','trade-response',{id:t.id,response:'veto'}):'')+'</div></article>').join(''):'<p>No trade offers.</p>');
 root.insertAdjacentHTML('beforeend',html);
}
function leagueView(){
 root.innerHTML=card('Standings',table(['Team','W','L','T','Points for','Points against','FAAB'],s.standings.map(t=>[esc(t.name),t.wins,t.losses,t.ties,t.pf.toFixed(2),t.pa.toFixed(2),t.faab])))+(s.champion?card('League champion',esc(name(s.champion))):'')+card('League rules','<p>'+esc(s.settings.scoring.replace('_',' '))+' • '+s.settings.regularWeeks+' regular-season weeks • '+s.settings.playoffTeams+' playoff teams</p><p>Starting spots: '+esc(slots(s).join(', '))+'</p><p>Bench: '+s.settings.bench+' • IR: '+s.settings.ir+' • Taxi: '+s.settings.taxi+'. IR eligibility: Out, IR, PUP or Suspended. Taxi: rookies and second-year players before the opening kickoff.</p><p>Regular-season ties stand. Ranking: wins plus half a tie, then points scored, then team name. Playoffs reseed each round; a tied matchup advances the higher seed.</p><p>FAAB: '+s.settings.faab+' per season. The commissioner opens and processes waiver windows. Highest affordable bid wins; equal bids use rolling priority. Claims remain private until processed. Dropped players wait 24 hours. Salary-cap contracts apply only if enabled. Free agents receive a $1 one-year contract; waiver winners receive a one-year contract at their bid, with a $1 minimum.</p><details><summary>Scoring breakdown</summary><p>Passing: 1 per 25 yards, 4 per TD, -2 per interception. Rushing/receiving: 1 per 10 yards, 6 per TD. Receptions: 0 / 0.5 / 1 by format. Lost fumbles: -2. Two-point conversions: 2. Field goals: 3 below 40 yards, 4 at 40–49, 5 at 50+. Extra points: 1. Defense: sack 1, interception/recovery/safety/blocked kick 2, TD 6. Points allowed: 0 = 10; 1–6 = 7; 7–13 = 4; 14–20 = 1; 21–27 = 0; 28–34 = -1; 35+ = -4.</p></details>')+card('Season history',form('history',field('Completed season','season',s.season-1,'number','min="2020" max="2100"'),'Open archive'))+card('League activity',table(['When','Who','Action'],s.log.slice(0,60).map(l=>[esc(new Date(l.at).toLocaleString()),esc(l.by),esc(l.action)+(l.detail?'<small>'+esc(l.detail)+'</small>':'')])));
 document.getElementById('history').onsubmit=e=>{e.preventDefault();load(formData('history').season)};
}
function adminView(){
 const x=s.settings;
 root.innerHTML=card('League setup','<ol><li>Set rules and load the NFL directory.</li><li>Players create their teams; you can assign registered members below.</li><li>Open the draft in join order, or enter a custom team order.</li><li>Start the season and refresh the NFL schedule.</li><li>Verify player scores, finalize the week, then advance.</li></ol><div class="format-toolbar">'+button('Refresh NFL directory','catalog')+(data.legacyCount&&!s.teams.length?button('Import legacy teams & rosters','import-legacy'):'')+'</div><p>Scoring mode: commissioner-verified. This page does not claim live automatic player scoring.</p>');
 if(s.phase==='SETUP'){
 root.innerHTML+=card('Rules',form('settings',field('Season','season',s.season,'number')+select('Scoring','scoring',['standard','half_ppr','ppr'].map(v=>option(v,v.replace('_',' '),x.scoring===v)).join(''))+Object.entries(x.slots).map(([k,v])=>field(k+' starters','slot_'+k,v,'number','min="0" max="6"')).join('')+[['bench','Bench'],['ir','IR'],['taxi','Taxi (Dynasty)'],['faab','FAAB budget'],['regularWeeks','Regular-season weeks'],['playoffTeams','Playoff teams: 2, 4 or 8'],['rookieRounds','Rookie rounds'],['salaryCap','Salary cap (0 disables)']].map(([k,l])=>field(l,k,x[k],'number','min="0"')).join('')+select('Trade review','tradeApproval',option('true','Commissioner approval',x.tradeApproval)+option('false','Execute after both owners accept',!x.tradeApproval)),'Save rules'));
 document.getElementById('settings').onsubmit=e=>{e.preventDefault();const b=formData('settings'),settings={...b,tradeApproval:b.tradeApproval==='true',slots:Object.fromEntries(Object.keys(x.slots).map(k=>[k,Number(b['slot_'+k])]))};save('settings',{season:b.season,settings})};
 root.insertAdjacentHTML('beforeend',card('Assign a team',form('assign',field('Team name','name','', 'text','required')+select('Pool member','owner',data.members.map(n=>option(n,n)).join('')),'Create team')));
 document.getElementById('assign').onsubmit=e=>{e.preventDefault();save('team',formData('assign'))};
 }
 if(['SETUP','OFFSEASON'].includes(s.phase)){
 root.insertAdjacentHTML('beforeend',card('Draft order',form('startDraft','<p>One team ID per line, in first-round order. Startup snakes; rookie rounds stay in this order.</p><label>Order<textarea id="draftOrder" rows="6">'+esc(s.teams.map(t=>t.id).join('\n'))+'</textarea></label>'+table(['Team','ID'],s.teams.map(t=>[esc(t.name),esc(t.id)])),'Open draft')));
 document.getElementById('startDraft').onsubmit=e=>{e.preventDefault();if(confirm('Freeze rules and start the shared draft?'))save('draft-start',{order:document.getElementById('draftOrder').value.split(/\s+/).filter(Boolean)})};
 }
 if(s.phase==='DRAFT')root.insertAdjacentHTML('beforeend',card('Draft administration',button('Skip current pick','draft-skip')+'<p>Draft on behalf of an absent owner from the Draft tab. Every selection is logged.</p>'));
 if(s.phase==='READY'){root.insertAdjacentHTML('beforeend',card('Open the season',form('startSeason',field('First active NFL week','startWeek',1,'number','min="1" max="'+x.regularWeeks+'"'),'Start season')));document.getElementById('startSeason').onsubmit=e=>{e.preventDefault();save('season-start',formData('startSeason'))}}
 if(s.phase==='SEASON'){
 root.insertAdjacentHTML('beforeend',card('Week '+s.currentWeek+' controls','<div class="format-toolbar">'+button('Refresh NFL schedule','schedule',{week:s.currentWeek})+button('Finalize scores','finalize',{week:s.currentWeek})+button('Advance week','advance',{week:s.currentWeek})+'</div><p>Finalization requires all NFL games to finish and a verified score for every starter, including explicit zeroes.</p>'));
 const starters=[...new Set(Object.values(weekState(s,s.currentWeek).lineups).flatMap(l=>Object.values(l)))];
 root.insertAdjacentHTML('beforeend',card('Verify a player score',form('stats',select('Starting player','player',starters.map(id=>option(id,pname(id))).join(''))+field('Fantasy points','points',0,'number','step="0.01" min="-200" max="500"')+field('Source / correction reason','reason','','text','required maxlength="300"'),'Save verified score')));
 document.getElementById('stats').onsubmit=e=>{e.preventDefault();save('stats',{...formData('stats'),week:s.currentWeek})};
 root.insertAdjacentHTML('beforeend',card('Waivers',s.waiverRunAt?'<p>Deadline: '+esc(new Date(s.waiverRunAt).toLocaleString())+'</p>'+button('Process eligible claims','waiver-process',{week:s.currentWeek}):form('waivers',field('Run after','runAt','','datetime-local','required'),'Open waiver window')));
 document.getElementById('waivers')?.addEventListener('submit',e=>{e.preventDefault();save('waiver-window',{runAt:new Date(formData('waivers').runAt).toISOString(),week:s.currentWeek})});
 }
 if(s.phase==='COMPLETE')root.insertAdjacentHTML('beforeend',card('Renew the league','<p>Archive '+s.season+'. '+(game==='dynasty'?'Retain eligible rosters and future picks for the rookie draft.':'Clear rosters for next season’s redraft.')+'</p>'+button('Archive & renew for '+(s.season+1),'rollover',{confirmSeason:s.season})));
}
document.getElementById('leagueRefresh').onclick=()=>load();
document.getElementById('leaguePoolLink').href='./control-center.html?pool='+encodeURIComponent(pool);
load();

setInterval(()=>{if(view==='draft'&&s?.phase==='DRAFT'&&!busy&&!document.hidden&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))load()},15000);
