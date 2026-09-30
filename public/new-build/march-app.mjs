import {REGIONS,POINTS,ROUNDS,PAIRINGS,teamMap,entrants,cleanPicks,selectTeam,scoreBracket,rankEntries,validTie,demoTournament} from './march-core.mjs';
const $=id=>document.getElementById(id), escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const q=new URLSearchParams(location.search), pool=q.get('pool')||'', demo=!pool;
const currentYear=new Date().getFullYear(), nextSeason=currentYear+(new Date().getMonth()>=6?1:0);
let season=Number(q.get('season'))||nextSeason, view=['bracket','scores','standings','rules','admin'].includes(q.get('view'))?q.get('view'):'bracket';
let data=null,picks={},tie=null,version=0,submitted=false,savedAt=null,dirty=false,busy=false,region='East',round=1,viewing=null,preview=null,scoreRound=1,clockOffset=0;
const practiceKey='links-march-bracket-practice-v2';
const logo=team=>team?.logo&&/^https:\/\/a\.espncdn\.com\//.test(team.logo)?'<img src="'+escape(team.logo)+'" alt="" loading="lazy">':'';
const numberPicks=()=>Object.keys(picks).length;
const closed=()=>!demo&&!!data?.tournament?.lockAt&&Date.now()+clockOffset>=Date.parse(data.tournament.lockAt);
const canEdit=()=>!!data?.tournament&&!closed()&&!viewing&&!busy;
const showMessage=(text,error=false)=>{$('message').textContent=text;$('message').className='message'+(error?' error':'');};
const dateText=value=>value?new Date(value).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}):'Not set';
async function api(options={}) {
  const token=localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token')||'';
  const response=await fetch('./api/march?'+new URLSearchParams({pool,season,...(options.query||{})}),{
    method:options.body?'POST':'GET',cache:'no-store',headers:{Authorization:'Bearer '+token,...(options.body?{'Content-Type':'application/json'}:{})},
    ...(options.body?{body:JSON.stringify({pool,season,...options.body})}:{})
  });
  const body=await response.json();
  if(!response.ok)throw Error(body.error||'The bracket service could not complete this request.');
  return body;
}
function practiceRows() {
  const t=data.tournament;
  data.rows=rankEntries(submitted?[{player:'Your practice bracket',picks,tie,submitted:true}]:[],t.games,t.results);
  data.submittedCount=submitted?1:0;
}
async function load() {
  if(busy)return;
  busy=true;$('refresh').disabled=true;$('season').disabled=true;showMessage('Loading tournament…');
  try {
    if(demo) {
      data={tournament:demoTournament(),player:'You',role:'player',pool:{name:'Practice bracket'},rows:[],submittedCount:0,closed:false};
      try{const saved=JSON.parse(localStorage.getItem(practiceKey)||'null');if(saved&&!dirty){picks=cleanPicks(data.tournament.games,saved.picks);tie=validTie(saved.tie)?saved.tie:null;submitted=!!saved.submitted&&Object.keys(picks).length===63&&validTie(tie);savedAt=saved.savedAt;}}catch{}
      practiceRows();
    } else {
      const next=await api();
      clockOffset=Date.parse(next.serverNow)-Date.now();
      data=next;
      if(!dirty){picks=cleanPicks(data.tournament?.games||[],data.entry?.picks||{});tie=data.entry?.tie??null;version=data.entry?.version||0;submitted=!!data.entry?.submitted;savedAt=data.entry?.savedAt||null;}
    }
    if(view==='admin'&&data.role!=='admin')view='bracket';
    showMessage(data.warning||'');
  }catch(e){showMessage(e.message,true);if(!data)$('content').innerHTML='<section class="empty-panel"><h2>Unable to open this pool</h2><p>'+escape(e.message)+'</p><a href="./pool-login.html?code='+encodeURIComponent(pool)+'">Sign in to your pool</a></section>';}
  finally{busy=false;$('refresh').disabled=false;if(data)render();}
}
function navigation() {
  $('season').disabled=demo||busy;$('refresh').disabled=busy;
  const tabs=[['bracket','My bracket'],['scores','Tournament scores'],['standings','Pool standings'],['rules','How to play']];
  if(data.role==='admin')tabs.push(['admin','ADMIN']);
  $('mainNav').innerHTML=tabs.map(([id,title])=>'<button data-view="'+id+'" class="'+(view===id?'active':'')+'" aria-current="'+(view===id?'page':'false')+'">'+title+'</button>').join('');
  $('mainNav').querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;viewing=null;render();});
  $('identity').textContent=data.pool.name+(demo?' · Sample field':(' · '+(data.player||'Commissioner')));
  $('modeBadge').textContent=demo?'PRACTICE MODE':closed()?'BRACKETS LOCKED':data.tournament?'BRACKETS OPEN':'AWAITING THE FIELD';
}
function empty(title,description,action='') {return '<section class="empty-panel"><span class="eyebrow">THE ROAD TO THE FINAL FOUR</span><h2>'+title+'</h2><p>'+description+'</p>'+action+'</section>';}
function render() {
  navigation();
  if(view==='rules')return renderRules();
  if(view==='admin')return renderAdmin();
  if(!data.tournament){$('content').innerHTML=empty('Your next March starts here.','The '+season+' bracket will open after the tournament field is available and your commissioner confirms the setup. Until then, explore the practice bracket.','<a href="./march-madness.html?demo=1">Try a practice bracket →</a>');return;}
  if(view==='scores')return renderScores();
  if(view==='standings')return renderStandings();
  renderBracket();
}
function summary(displayPicks) {
  const t=data.tournament,stats=scoreBracket(t.games,displayPicks,t.results),teams=teamMap(t.games),champion=teams[displayPicks['national-6-0']],count=Object.keys(displayPicks).length;
  return '<div class="summary"><div class="stat"><small>Bracket progress</small><strong>'+count+' <span>/ 63 picks</span></strong><div class="progress"><i style="width:'+count/63*100+'%"></i></div></div><div class="stat"><small>Points earned</small><strong>'+stats.points+'</strong><span>'+stats.correct+' correct picks</span></div><div class="stat"><small>Maximum possible</small><strong>'+stats.max+'</strong><span>Including points already earned</span></div><div class="stat"><small>Your champion</small><strong class="champion-name">'+escape(champion?.name||'Make your pick')+'</strong><span>'+(champion?'No. '+champion.seed+' seed':'The last team standing')+'</span></div></div>';
}
function matchMarkup(game,displayPicks,stats,teams) {
  const ids=entrants(game,displayPicks),ready=ids.every(Boolean),result=data.tournament.results[game.id],pick=displayPicks[game.id],state=stats.states[game.id];
  return '<div class="match" data-round="'+game.round+'">'+ids.map((id,index)=>{
    const team=teams[id],selected=pick===id&&!!id;
    const outcome=id&&result?.completed&&result.winner?(id===result.winner?'winner':result.teams?.some(t=>t.id===id)?'loser':'eliminated'):'';
    const outcomeLabel=outcome==='winner'?'Winner':outcome==='loser'?'Lost':outcome==='eliminated'?'Eliminated':'';
    const placeholder=game.round===5?game.sources[index].split('-')[0]+' champion':game.round===6?'Semifinal '+(index+1)+' winner':'Pick previous round';
    return '<button class="team '+(!id?'placeholder':'')+(selected?' selected '+state:'')+(outcome?' result-'+outcome:'')+'" data-game="'+game.id+'" data-team="'+escape(id||'')+'" aria-pressed="'+selected+'" aria-label="'+escape(team?team.name+', seed '+team.seed+', '+ROUNDS[game.round-1]+(selected?', selected':'')+(outcomeLabel?', '+outcomeLabel:''):placeholder)+'" '+(!ready||!canEdit()?'disabled':'')+'><span class="seed">'+(team?.seed||'—')+'</span>'+logo(team)+'<span class="name">'+escape(team?.name||placeholder)+(selected?'<small class="your-pick-label">'+(viewing?'Their pick':'Your pick')+'</small>':'')+(outcomeLabel?'<small class="outcome-label">'+outcomeLabel+'</small>':'')+'</span><span class="pick-mark">'+(selected?(state==='correct'?'✓':['incorrect','eliminated'].includes(state)?'×':'✓'):'')+'</span></button>';
  }).join('')+(result?.completed?'<div class="match-result"><b>FINAL</b> · '+escape(teams[result.winner]?.name||'Result pending')+(pick&&result.winner?' · '+(state==='correct'?'Correct +'+POINTS[game.round-1]:'Incorrect'):'')+'</div>':'')+'</div>';
}
function renderBracket() {
  const t=data.tournament,displayPicks=viewing?.picks||picks,teams=teamMap(t.games),stats=scoreBracket(t.games,displayPicks,t.results);
  const rounds=region==='Final Four'?[5,6]:[1,2,3,4];
  if(!rounds.includes(round))round=rounds[0];
  const count=Object.keys(displayPicks).length;
  const status=dirty?'Unsaved changes':submitted?'Bracket submitted':savedAt?'Draft saved':'Start your bracket';
  $('content').innerHTML=(viewing?'<div class="review-banner"><strong>Viewing '+escape(viewing.player)+'’s bracket</strong><button id="myBracket">Back to my bracket</button></div>':'')+summary(displayPicks)+
    '<div class="bracket-toolbar"><div><h2>'+escape(viewing?.player||'Your road to the title')+'</h2><p id="deadline">'+(demo?'Sample field · Practice as often as you like':closed()?'Locked · '+dateText(t.lockAt):'All picks lock '+dateText(t.lockAt))+'</p></div><div class="toolbar-actions">'+(canEdit()?'<button id="nextPick">Next unpicked game →</button><button id="reset">Reset bracket</button>':'')+(demo?'':'<button id="reloadSaved" '+(busy?'disabled':'')+'>Reload saved bracket</button>')+(demo?'<button id="demoResults">'+(Object.keys(t.results).length?'Clear sample results':'Preview sample results')+'</button>':'')+'</div></div>'+
    '<div class="region-nav" aria-label="Bracket region">'+[...REGIONS,'Final Four'].map(r=>{const gs=t.games.filter(g=>g.region===r),n=gs.filter(g=>displayPicks[g.id]).length;return '<button data-region="'+r+'" class="'+(region===r?'active':'')+'" aria-pressed="'+(region===r)+'">'+r+'<small>'+n+' / '+gs.length+' picks</small></button>';}).join('')+'</div>'+
    '<div class="mobile-round"><label for="roundSelect">Round</label><select id="roundSelect">'+rounds.map(r=>'<option value="'+r+'" '+(round===r?'selected':'')+'>'+ROUNDS[r-1]+'</option>').join('')+'</select><button id="nextRound">Next →</button></div>'+
    '<section class="bracket-board '+(region==='Final Four'?'national':'')+'" aria-label="'+region+' bracket">'+rounds.map(r=>'<section class="round-column '+(round===r?'mobile-active':'')+'"><h3 class="round-title">'+ROUNDS[r-1]+' <span>'+POINTS[r-1]+' PTS</span></h3><div class="round-matches">'+t.games.filter(g=>g.region===region&&g.round===r).map(g=>matchMarkup(g,displayPicks,stats,teams)).join('')+'</div></section>').join('')+'</section>'+
    '<div class="bracket-bottom"><div class="legend"><span>✓ Selected</span><span class="yes">✓ Correct</span><span class="no">× Incorrect / eliminated</span></div><span>Changing a winner clears affected later picks.</span></div>'+
    '<section class="submission"><div><h3 id="saveStatus" class="'+(!dirty&&submitted?'saved-tag':'')+'">'+(viewing?'Submitted bracket':escape(status))+'</h3><p>'+count+' of 63 picks'+(savedAt&&!viewing?' · Saved '+dateText(savedAt):'')+'</p><p>'+(closed()?'The entry deadline has passed.':demo?'Practice saves stay on this device.':'Save a draft as you go. Submit your completed bracket before the deadline.')+'</p></div><div class="tie-field"><label for="tie">Championship combined score</label><input id="tie" type="number" inputmode="numeric" min="0" max="400" step="1" placeholder="e.g. 145" value="'+escape(viewing?.tie??tie??'')+'" '+(!canEdit()?'disabled':'')+'><small>Tiebreaker: both teams’ final scores added together.</small></div><div class="submit-actions">'+(!viewing&&!closed()?'<button id="saveDraft" '+(busy?'disabled':'')+'>Save draft</button><button id="submit" class="primary" '+(busy?'disabled':'')+'>Submit bracket</button>':'<span class="badge">READ ONLY</span>')+'</div></section>';
  $('content').querySelectorAll('[data-region]').forEach(b=>b.onclick=()=>{region=b.dataset.region;round=region==='Final Four'?5:1;renderBracket();});
  $('roundSelect').onchange=e=>{round=Number(e.target.value);renderBracket();};
  $('nextRound').onclick=()=>{const i=rounds.indexOf(round);if(i===rounds.length-1){const all=[...REGIONS,'Final Four'];region=all[(all.indexOf(region)+1)%all.length];round=region==='Final Four'?5:1;}else round=rounds[i+1];renderBracket();};
  $('content').querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>{if(!canEdit())return;const oldCount=numberPicks();picks=selectTeam(t.games,picks,b.dataset.game,b.dataset.team);dirty=true;submitted=false;renderBracket();const cleared=oldCount-numberPicks();showMessage(cleared>0?cleared+' affected later pick(s) cleared. Choose the new path to the championship.':'Pick selected. Save your draft when you are ready.');$('content').querySelector('[data-game="'+b.dataset.game+'"][data-team="'+b.dataset.team+'"]')?.focus({preventScroll:true});});
  if($('nextPick'))$('nextPick').onclick=nextPick;
  if($('reloadSaved'))$('reloadSaved').onclick=()=>{if(busy||dirty&&!confirm('Discard unsaved changes and reload your saved bracket?'))return;dirty=false;load();};
  if($('reset'))$('reset').onclick=()=>{if(!confirm('Clear this bracket and tiebreaker? Your saved pool bracket stays unchanged until you save or submit.'))return;picks={};tie=null;dirty=true;submitted=false;renderBracket();showMessage('Bracket reset. Save to keep this change.');};
  $('tie').oninput=e=>{tie=e.target.value===''?null:Number(e.target.value);dirty=true;submitted=false;$('saveStatus').textContent='Unsaved changes';$('saveStatus').className='';showMessage('Tiebreaker changed. Save or submit your bracket.');};
  if($('saveDraft'))$('saveDraft').onclick=()=>save(false);
  if($('submit'))$('submit').onclick=()=>save(true);
  if($('myBracket'))$('myBracket').onclick=()=>{viewing=null;renderBracket();};
  if($('demoResults'))$('demoResults').onclick=()=>{if(Object.keys(t.results).length)t.results={};else{const actual={};for(const g of t.games){const ids=entrants(g,actual);actual[g.id]=[...ids].sort((a,b)=>teams[a].seed-teams[b].seed)[0];t.results[g.id]={completed:true,winner:actual[g.id],teams:ids.map(id=>({...teams[id],score:id===actual[g.id]?78:70})),detail:'Sample final'};}}practiceRows();renderBracket();showMessage('Practice only: '+(Object.keys(t.results).length?'sample outcomes are now displayed.':'sample outcomes cleared.'));};
}
function nextPick() {
  const game=data.tournament.games.find(g=>!picks[g.id]&&entrants(g,picks).every(Boolean));
  if(!game){$('tie')?.focus();return;}
  region=game.region;round=game.round;renderBracket();
  const button=$('content').querySelector('[data-game="'+game.id+'"]');button?.focus();button?.scrollIntoView({block:'center',behavior:'smooth'});
}
async function save(final) {
  if(!canEdit())return;
  if(tie!==null&&!validTie(tie)){showMessage('Enter a whole-number combined score from 0 to 400.',true);$('tie').focus();return;}
  if(final&&(numberPicks()!==63||!validTie(tie))){showMessage('Complete all 63 picks and the championship tiebreaker before submitting.',true);nextPick();return;}
  busy=true;renderBracket();showMessage(final?'Submitting your bracket…':'Saving your draft…');
  try {
    if(demo){savedAt=new Date().toISOString();localStorage.setItem(practiceKey,JSON.stringify({picks,tie,submitted:final,savedAt}));}
    else {const result=await api({body:{action:'save',picks,tie,submitted:final,version,revision:data.revision}});version=result.version;savedAt=result.savedAt;}
    submitted=final;dirty=false;
    if(demo)practiceRows();
    showMessage(final?(demo?'Practice bracket submitted on this device.':'Your bracket is submitted. You can revise and resubmit it until tip-off.'):'Draft saved. Submit your completed bracket before tip-off.');
  }catch(e){showMessage(e.message,true);}
  finally{busy=false;renderBracket();}
}
function renderScores() {
  const t=data.tournament,rows=t.games.filter(g=>g.round===scoreRound),teams=teamMap(t.games);
  $('content').innerHTML='<div class="bracket-toolbar"><div><h2>Tournament scores</h2><p>'+(demo?'Practice outcomes only':('ESPN results · Last checked '+dateText(t.checkedAt)))+'</p></div><select id="scoreRound" aria-label="Scoreboard round">'+ROUNDS.map((name,i)=>'<option value="'+(i+1)+'" '+(scoreRound===i+1?'selected':'')+'>'+name+'</option>').join('')+'</select></div><div class="score-grid">'+rows.map(g=>{const r=t.results[g.id],ts=r?.teams||g.teams||[];return '<article class="score-card"><small>'+escape(g.region)+' · '+escape(r?.detail||(ts.length?'Scheduled':'Matchup not set'))+'</small>'+(ts.length?ts.map(team=>'<div class="score-team '+(r?.winner===team.id?'winner':'')+'">'+logo(team)+'<small>'+escape(team.seed||'')+'</small><span>'+escape(team.name||teams[team.id]?.name||'TBD')+'</span><b>'+escape(r?.teams.find(x=>x.id===team.id)?.score??'—')+'</b></div>').join(''):'<p class="muted">Waiting for the previous round.</p>')+(r?.date?'<p class="muted"><small>'+dateText(r.date)+'</small></p>':'')+'</article>';}).join('')+'</div>';
  $('scoreRound').onchange=e=>{scoreRound=Number(e.target.value);renderScores();};
}
function renderStandings() {
  if(!demo&&!closed()){$('content').innerHTML=empty('The standings tip off with the tournament.',data.submittedCount+' bracket(s) submitted. Everyone’s picks stay private until '+dateText(data.tournament.lockAt)+'.');return;}
  const rows=data.rows||[],teams=teamMap(data.tournament.games);
  if(!rows.length){$('content').innerHTML=empty('No submitted brackets yet.',demo?'Complete and submit your practice bracket to try the standings.':'Only complete brackets submitted before the deadline count in the standings.');return;}
  $('content').innerHTML='<div class="bracket-toolbar"><div><h2>Pool standings</h2><p>'+(demo?'Your practice bracket · sample results':'Ranked by points, then championship tiebreaker after the final')+'</p></div><span class="badge">'+rows.length+' BRACKET'+(rows.length===1?'':'S')+'</span></div><div class="panel table-scroll"><table><thead><tr><th scope="col">Rank</th><th scope="col">Player</th><th scope="col">Points</th><th scope="col">Max possible</th><th scope="col">Champion</th><th scope="col">Tiebreaker</th><th scope="col">Bracket</th></tr></thead><tbody>'+rows.map((row,i)=>'<tr><td class="rank">'+row.rank+'</td><td>'+escape(row.player)+'</td><td><b>'+row.points+'</b></td><td>'+row.max+'</td><td>'+escape(teams[row.picks['national-6-0']]?.name||'—')+'</td><td>'+row.tie+(row.tieDistance!==null?' · '+row.tieDistance+' off':'')+'</td><td><button class="row-button" data-entry="'+i+'">View bracket</button></td></tr>').join('')+'</tbody></table></div>';
  $('content').querySelectorAll('[data-entry]').forEach(b=>b.onclick=()=>{viewing=rows[Number(b.dataset.entry)];view='bracket';render();});
}
function renderRules() {
  $('content').innerHTML='<div class="bracket-toolbar"><div><span class="eyebrow">THE GAME PLAN</span><h2>Easy to enter. Hard to predict.</h2><p>One bracket per player, per pool, per tournament year.</p></div></div><div class="rule-grid"><article class="panel"><span class="rule-number">01</span><h3>Pick the whole path.</h3><p>Choose the winner of every matchup, moving through the four regions to the Final Four and your national champion. First Four games are not scored.</p></article><article class="panel"><span class="rule-number">02</span><h3>Submit before tip-off.</h3><p>Save drafts as you go. Complete all 63 picks and a championship combined-score tiebreaker, then submit. All picks lock together at the first Round of 64 game.</p></article><article class="panel"><span class="rule-number">03</span><h3>Let the points build.</h3><p>Correct picks earn more each round. Follow the results on your bracket and compare submitted entries after the deadline.</p></article></div><section class="panel"><h2>Every round raises the stakes.</h2><div class="points-grid">'+ROUNDS.map((name,i)=>'<div><strong>'+POINTS[i]+'</strong><span>'+name+'</span></div>').join('')+'</div><p><strong>1,920 points</strong> for a perfect bracket. Maximum possible includes points earned plus points still available from your surviving selections. An eliminated team cannot earn future points.</p><h3>When brackets tie</h3><p>After the championship is final, the closest predicted combined score wins the tiebreaker. If points and tiebreaker distance are both equal, the players share the rank. Before the final, equal points share a rank.</p><h3>Changing your mind</h3><p>You may edit and resubmit until the deadline. Changing an early winner clears later picks that depend on that team. A saved draft is not an entry: remember to submit again after editing.</p><h3>Real pool, real results</h3><p>The commissioner confirms the tournament field and Final Four regional pairings. The field is frozen once anyone saves a bracket. Tournament scores refresh from ESPN when you open or refresh this page. Practice mode uses sample teams and stays separate from your pool.</p><p><a href="https://support.espn.com/hc/en-us/articles/360040324812-Your-Bracket-Explained" target="_blank" rel="noopener">Explore ESPN’s bracket guide ↗</a></p></section>';
}
function renderAdmin() {
  if(data.role!=='admin')return;
  const t=data.tournament;
  $('content').innerHTML='<section class="panel"><span class="eyebrow">COMMISSIONER DESK</span><h2>Set the field. Open the challenge.</h2><p>Import the '+season+' men’s NCAA tournament field from ESPN. Review the seeded matchups and confirm which regions meet in the national semifinals. Setup freezes as soon as the first player saves a draft.</p>'+(t?'<div class="notice"><b>Tournament published</b> · All brackets lock '+dateText(t.lockAt)+'.</div>':'')+'<button id="loadField" '+(busy?'disabled':'')+'>Check ESPN tournament field</button><div id="fieldPreview"></div></section>';
  $('loadField').onclick=async()=>{if(busy)return;busy=true;$('loadField').disabled=true;showMessage('Checking ESPN’s tournament field…');try{preview=await api({query:{view:'preview'}});showMessage(preview.ready?'Review all four regions and confirm the official semifinal pairings.':'The complete field is not available yet.');}catch(e){showMessage(e.message,true);}finally{busy=false;renderAdmin();}};
  if(!preview)return;
  const box=$('fieldPreview');
  if(!preview.ready){box.innerHTML='<p>The complete 64-team field is not available. Check again after Selection Sunday and the First Four matchups are resolved.</p>';return;}
  const first=new Date(Math.min(...preview.field.map(g=>Date.parse(g.date))));
  box.innerHTML='<div class="setup-grid">'+REGIONS.map(r=>'<section><h3>'+r+'</h3>'+preview.field.filter(g=>g.region===r).sort((a,b)=>Math.min(...a.teams.map(t=>t.seed))-Math.min(...b.teams.map(t=>t.seed))).map(g=>'<p>'+g.teams.map(t=>t.seed+' '+escape(t.name)).join(' vs. ')+'</p>').join('')+'</section>').join('')+'</div><p><b>Bracket deadline:</b> '+dateText(first)+'</p><div class="setup-controls"><div><label for="pairing">Official Final Four regional pairings</label><select id="pairing"><option value="">Choose from the official bracket</option>'+PAIRINGS.map((p,i)=>'<option value="'+i+'">'+p[0]+' vs '+p[1]+' · '+p[2]+' vs '+p[3]+'</option>').join('')+'</select></div><button id="publish" class="primary" '+(closed()||first.getTime()<=Date.now()?'disabled':'')+'>Publish tournament</button></div>';
  $('publish').onclick=async()=>{if(busy)return;const value=$('pairing').value;if(value===''){showMessage('Confirm the official Final Four regional pairings first.',true);return;}busy=true;$('publish').disabled=true;try{await api({body:{action:'publish',pairing:PAIRINGS[Number(value)],revision:data.revision}});preview=null;busy=false;await load();showMessage('Tournament published.');}catch(e){busy=false;renderAdmin();showMessage(e.message,true);}};
}
$('practiceNotice').hidden=!demo;
$('season').innerHTML=[...new Set([nextSeason,currentYear,currentYear-1])].filter(y=>y>=2025).map(y=>'<option '+(season===y?'selected':'')+'>'+y+'</option>').join('');
if(![...$('season').options].some(o=>Number(o.value)===season))season=nextSeason;
$('season').value=String(season);$('season').disabled=demo;
$('season').onchange=async e=>{if(busy){e.target.value=String(season);return;}if(dirty&&!confirm('Switch years and discard your unsaved changes?')){e.target.value=String(season);return;}season=Number(e.target.value);dirty=false;picks={};tie=null;version=0;submitted=false;savedAt=null;data=null;preview=null;viewing=null;await load();};
$('refresh').onclick=()=>load();
if(pool){$('poolLink').href='./control-center.html?pool='+encodeURIComponent(pool);$('poolLink').textContent='My pool';$('signOut').hidden=false;}
$('signOut').onclick=async()=>{if(dirty&&!confirm('Sign out and discard your unsaved changes?'))return;const token=localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token')||'';const account=localStorage.getItem('links-account-token');await Promise.allSettled([fetch('/api/logout',{method:'POST',headers:{Authorization:'Bearer '+token}}),fetch('./api/home-session?pool='+encodeURIComponent(pool),{method:'DELETE'}),...(account?[fetch('./api/account',{method:'POST',headers:{'Content-Type':'application/json','x-links-account':account},body:JSON.stringify({action:'logout'})})]:[])]);for(const key of ['links-legacy-token','links-token','links-account-token','links-current-pool','links-player-id','links-player-name','links-player-role','links-current-role','links-session-v1'])localStorage.removeItem(key);try{sessionStorage.setItem('links-signed-out','1');sessionStorage.removeItem('links-playmaker-import');}catch{}dirty=false;location.href='./index.html';};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
let wasClosed=false;
setInterval(()=>{if(!data)return;const isClosed=closed();if(isClosed&&!wasClosed){wasClosed=true;render();showMessage('The tournament has tipped off. Brackets are locked.');}wasClosed=isClosed;},1000);
await load();
