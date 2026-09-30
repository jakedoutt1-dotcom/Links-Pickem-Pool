// Practice-only presentation. No network requests or persistent storage.
(()=>{
const $=id=>document.getElementById(id);
const esc=v=>String(v??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const table=(headers,rows)=>'<div class="format-scroll"><table><thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const context={college:['AP Top 25 slate','Commissioner-selected matchups'],confidence:['Confidence card','Use every point value once'],survivor:['Survivor entry','One life · no repeat teams'],game33:['Season team','18 weeks · $50 sample entry'],squares:['Bills vs. Dolphins','$10 per square · sample board'],props:['Super Bowl props','2 points per correct answer'],playoff:['Divisional round','2 points per correct pick'],golf:['Sample golf tournament','Choose one golfer'],nascar:['Sample Cup Series race','Choose one driver'],fantasy:['Weekly lineup','Redraft · sample roster'],dynasty:['Franchise lineup','Keep players between seasons'],march:['Sample Final Four','160 per semifinal · 320 champion'],nfl:['Weekly picks','Two sample matchups']};
function update(s){
 if(['nfl','march'].includes(s.game))return;
 if(!document.getElementById('demoRuleSource')){
 const references={college:['RunYourPool college formats','https://help.runyourpool.com/en/collections/3970404-cfb-college-football'],confidence:['RunYourPool confidence rules','https://www.runyourpool.com/articles/2023/12/01/this-week-in-pools-nfl-week-12-recap/'],survivor:['Survivor rules overview','https://footballsurvivorleague.com/survivor-pool-rules'],game33:['NFL 33 format overview','https://www.footballpool.app/nfl-33-pool/'],squares:['Squares scoring explained','https://runapool.com/football-squares'],props:['OfficeFootballPool formats','https://www.officefootballpool.com/all-in-fantasy-football'],playoff:['Playoff scoring variants','https://help.runyourpool.com/en/articles/9264952-nfl-playoff-power-ranking-faq-s'],golf:['Golf formats and rules','https://www.golfpoolspro.com/rules'],nascar:['NASCAR Fantasy Live format','https://support.nascar.com/044876-Getting-Started'],fantasy:['Fantasy football overview','https://sleeper.com/fantasy-football'],dynasty:['Dynasty league overview','https://support.sleeper.com/en/articles/1960098-introduction-to-dynasty-leagues']};
 const ref=references[s.game],note=document.createElement('p');note.id='demoRuleSource';note.textContent='Format reference: ';const a=document.createElement('a');a.href=ref[1];a.target='_blank';a.rel='noopener noreferrer';a.textContent=ref[0];note.append(a,document.createTextNode('. Other sites may use different settings; the LINKS rules above apply here.'));document.getElementById('rulesBox').append(note);
 }

 let box=$('demoGameStatus');if(!box){box=document.createElement('section');box.id='demoGameStatus';box.className='demo-game-status';$('board').before(box)}
 const [title,detail]=context[s.game];const count=s.game==='squares'?(s.picks.square||[]).length:Object.keys(s.picks).length;
 box.innerHTML='<div><strong>'+title+'</strong><small>'+detail+'</small></div><div><strong>'+(s.finished?'SAMPLE FINAL':s.saved?'PICKS SAVED':'PICKS OPEN')+'</strong><small>'+count+' selection'+(count===1?'':'s')+' · practice only</small></div>';
 if(s.game==='survivor')box.innerHTML+='<p>'+(s.finished?(s.picks[0]==='Bills'?'ALIVE · 0 of 1 lives lost':'ELIMINATED · 1 of 1 lives lost'):'ALIVE · 0 of 1 lives lost')+'</p>';
 if(s.game==='march'&&!$('fullBracketLink')){const link=document.createElement('a');link.id='fullBracketLink';link.href='./march-madness.html?demo=1';link.textContent='Try the full 64-team practice bracket →';link.className='demo-full-bracket';box.after(link)}
 let slip=$('demoSelectionSlip');if(!slip){slip=document.createElement('aside');slip.id='demoSelectionSlip';slip.className='demo-selection-slip';$('board').after(slip)}
 const selected=Object.entries(s.picks).flatMap(([key,value])=>Array.isArray(value)?value.map(v=>'Square '+((Number(v.split('-')[0])-1)*10+Number(v.split('-')[1]))):[value+(s.game==='confidence'?' · '+(s.ranks[key]||'Unassigned')+' points':'')]);
 const hints={confidence:'Assign 1 and 2 once each. Your highest value belongs on your strongest pick.',survivor:'One winner keeps you alive. Used teams cannot be picked again.',game33:'Your assigned team stays yours all season. Only a final score of 33 qualifies.',squares:'Choose squares, then save to lock them. Quarter winners appear in matching colors.',props:'Answer every question before saving your card.',playoff:'This card covers the Divisional round only.',college:'Choose a winner for each game on the commissioner’s slate.',golf:'Your event selection appears here before you save.',nascar:'Review your driver before saving your race entry.',fantasy:'Set a starter in each sample position before saving.',dynasty:'Set your starters. Keep your franchise roster between seasons.'};
 slip.innerHTML='<h3>Your '+(['fantasy','dynasty'].includes(s.game)?'lineup':'entry')+'</h3>'+(selected.length?'<ul>'+selected.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ul>':'<p>No selections yet.</p>')+'<p>'+hints[s.game]+'</p><strong>'+(s.finished?'Final results available':s.saved?'✓ Saved in this demo':'Unsaved · select and save')+'</strong>';
 if($('demoSave'))$('demoSave').disabled=s.saved||s.finished;
 if($('demoEdit'))$('demoEdit').hidden=!s.saved||s.finished||s.game==='squares';
}
function view(label,s,out,card){
 const g=s.game,p=s.picks;if(['nfl','march'].includes(g))return false;const intro='<h2>'+esc(label)+'</h2><p>Practice pool · fictional results and players.</p>';
 let headers,rows;
 if(/standings|league/i.test(label)){
  const pending=s.finished?null:'Awaiting sample results';
  if(g==='march'){const pts=(p.semi1==='Team A'?160:0)+(p.semi2==='Team C'?160:0)+(p.champion==='Team A'?320:0);headers=['Player','Points','Possible'];rows=[['Demo Player',pending??pts,640],['Demo Alex',pending??480,640],['Demo Jordan',pending??320,640]];}
  else if(g==='survivor'){headers=['Player','Status','Lives lost'];rows=[['Demo Player',s.finished?(p[0]==='Bills'?'Alive':'Eliminated'):'Alive',s.finished&&p[0]!=='Bills'?'1 / 1':'0 / 1'],['Demo Alex','Alive','0 / 1'],['Demo Jordan','Eliminated','1 / 1']];}
  else if(g==='golf'){headers=['Player','Golfer','Score'];rows=[['Demo Player',p[0]||'Not selected',pending??(p[0]==='Sample Golfer A'?'−8':'−5')],['Demo Alex','Sample Golfer A',pending??'−8']];}
  else if(g==='nascar'){headers=['Player','Driver','Finish'];rows=[['Demo Player',p[0]||'Not selected',pending??(p[0]==='Kyle Larson'?'1st':'3rd')],['Demo Alex','Denny Hamlin',pending??'3rd']];}
  else if(['fantasy','dynasty'].includes(g)){headers=['Team','Record','Points for'];rows=[['Demo Player','3–1','412.50'],['Demo Alex','2–2','398.20'],['Demo Jordan','1–3','362.75']];}
  else if(['confidence','props','playoff'].includes(g)){const pts=g==='confidence'?((p[0]==='Bills'?Number(s.ranks[0]):0)+(p[1]==='Ravens'?Number(s.ranks[1]):0)):g==='props'?2*(Number(p[0]==='Yes')+Number(p[1]==='No')):2*(Number(p[0]==='Bills')+Number(p[1]==='Ravens'));headers=['Player','Points'];rows=[['Demo Player',pending??pts],['Demo Alex',pending??2],['Demo Jordan',pending??0]];}
  if(rows){if(s.finished&&['march','confidence','props','playoff'].includes(g))rows.sort((a,b)=>b[1]-a[1]);out.innerHTML=intro+table(headers,rows);return true;}
 }
 if(['fantasy','dynasty'].includes(g)&&label==='Players'){
  out.innerHTML=intro+'<p>Browse the sample player directory. Set starters from My Team.</p>';const grid=document.createElement('div');grid.className='demo-player-directory';for(const [name,pos,pts] of [['Sample QB A','QB',20],['Sample QB B','QB',16],['Sample RB A','RB',14],['Sample RB B','RB',10]]){const row=document.createElement('article');row.className='format-card';row.append(card(name));const detail=document.createElement('p');detail.textContent=pos+' · '+pts+' sample points · '+(Object.values(p).includes(name)?'Your starter':'Available');row.append(detail);grid.append(row)}out.append(grid);return true;
 }
 if(['fantasy','dynasty'].includes(g)&&label==='Draft'){out.innerHTML=intro+'<p>'+(g==='dynasty'?'Sample rookie draft board. Your franchise keeps its existing roster.':'Sample redraft board. Each season begins with a new roster.')+'</p>'+table(['Pick','Team','Player'],[['1.01','Demo Player','Sample QB A'],['1.02','Demo Alex','Sample QB B'],['2.01','Demo Alex','Sample RB B'],['2.02','Demo Player','Sample RB A']]);return true;}
 if(g==='game33'&&/results|history/i.test(label)){out.innerHTML=intro+table(['Week','Player','Team score','Payout'],[['1','Demo Alex','33 FINAL','$88.89 sample'],['2','No winner','No team scored 33','Rolled forward'],['4','Demo Player',s.finished?'Bills · 33 FINAL':'Awaiting sample results',s.finished?'$177.78 sample':'Pending']]);return true;}
 return false;
}
window.LINKS_DEMO_EXPERIENCE={update,view};
})();
