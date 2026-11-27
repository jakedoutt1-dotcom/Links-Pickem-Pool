import {SLOTS,ROUNDS,ROUND_POINTS,participants,cleanBracket,validateBracket,BRACKET_RULES} from './cfp-bracket-core.mjs?v=rounds1';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountBracket({root,data,view,api,reload,demo}){
 root._bracketCleanup?.();
 const state=data.bracket;if(!state)return false;
 const pending=!state.config,cfg=state.config||{teams:Array.from({length:12},(_,i)=>({id:'pending-seed-'+(i+1),seed:i+1,name:'Seed '+(i+1),placeholder:true})),deadline:null},accessLocked=!demo&&data.access?.unlocked===false,disabled=accessLocked||pending||state.locked||!data.available,deadline=pending?'Not announced':new Date(cfg.deadline).toLocaleString();
 if(view==='standings'){
  root.innerHTML='<h2>Full-bracket standings</h2><p>Only submitted brackets count. Round points: 10 / 20 / 40 / 80. Maximum: 280. The championship total breaks ties after all 11 official results are final.</p><div class="table-wrap"><table><thead><tr><th>Place</th><th>Player</th><th>Points</th><th>Correct</th><th>Championship guess</th><th>Difference</th></tr></thead><tbody>'+state.standings.rows.map(r=>'<tr><td>'+r.rank+'</td><td>'+esc(r.player)+(r.submitted?'':' (not submitted)')+'</td><td>'+r.points+'</td><td>'+r.wins+'/11</td><td>'+(r.guess??'—')+'</td><td>'+(r.difference??'—')+'</td></tr>').join('')+'</tbody></table></div>'+(state.locked?'<h3>Submitted brackets</h3>'+state.shared.map(e=>'<details><summary>'+esc(e.player)+'</summary>'+SLOTS.map(s=>'<p>'+ROUNDS[s.round]+': '+esc(cfg.teams.find(t=>t.id===e.picks[s.id]?.team)?.name)+' · '+ROUND_POINTS[s.round]+' points</p>').join('')+'</details>').join(''):'<p>Everyone’s picks stay private until the first playoff kickoff.</p>');return true;
 }
 if(view!=='picks')return false;
 let draft=structuredClone(state.entry?.picks||{}),guess=state.entry?.guess??'',dirty=false,layout='bracket';
 const gameNumber=id=>SLOTS.findIndex(s=>s.id===id)+1;
 const teamFor=ref=>cfg.teams.find(t=>t.id===(typeof ref==='number'?cfg.teams.find(t=>t.seed===ref)?.id:draft[ref]?.team));
 const matchup=s=>s.from.map(ref=>teamFor(ref)?.name||(typeof ref==='number'?'Seed '+ref:'Winner of Game '+gameNumber(ref))).join(' vs. ');
 function card(s){
  const p=draft[s.id]||{},next=SLOTS.find(n=>n.from.includes(s.id)),winner=cfg.teams.find(t=>t.id===p.team);
  return '<article id="cfp-game-'+s.id+'" class="cfp-entry" data-slot="'+s.id+'" tabindex="-1"><p class="cfp-game-label">Game '+gameNumber(s.id)+' · '+ROUNDS[s.round]+'</p><h4>'+esc(matchup(s))+'</h4><div class="teams">'+s.from.map(ref=>{
   const t=teamFor(ref),source=typeof ref==='number'?(s.round===1?'First-round bye':'Seed '+ref):'Winner of Game '+gameNumber(ref);
   if(!t)return '<button type="button" class="cfp-feeder" data-go-slot="'+ref+'"><span>'+source+'</span><small>'+esc(matchup(SLOTS.find(g=>g.id===ref)))+'</small><b>Choose the advancing team</b></button>';
   return '<button type="button" title="'+esc(t.name+(t.placeholder?'':' · Record: '+(t.record||'Not posted')+(t.rank?' · Rank #'+t.rank:'')))+'" data-pick="'+esc(t.id)+'" aria-pressed="'+(p.team===t.id)+'" '+(disabled?'disabled':'')+'><small class="cfp-source">'+source+'</small>'+(t.logo?'<img src="'+esc(t.logo)+'" alt="">':'')+'<b>'+(t.placeholder?'':('#'+t.seed+' '))+esc(t.name)+'</b>'+(!t.placeholder?'<small>Record: '+esc(t.record||'Not posted')+(t.rank?' · Rank #'+t.rank:'')+'</small>':'')+'</button>';
  }).join('')+'</div><p class="cfp-round-points">'+ROUND_POINTS[s.round]+' points for the correct winner</p><div class="cfp-advancement">'+(winner?'<strong>'+esc(winner.name)+(next?' advances':' is your champion')+'</strong>':'<span>Choose your winner</span>')+(next?'<button type="button" class="cfp-path-link" data-go-slot="'+next.id+'">'+(winner?'Continue to':'Feeds')+' Game '+gameNumber(next.id)+' · '+ROUNDS[next.round]+'</button>':'<p>Winner of Game 9 vs. winner of Game 10</p>')+'</div></article>';
 }
 function drawConnections(){
  const board=root.querySelector('.cfp-bracket'),svg=board?.querySelector('.cfp-connections');if(!svg)return;
  svg.replaceChildren();if(layout!=='bracket')return;
  const bounds=board.getBoundingClientRect();svg.setAttribute('viewBox','0 0 '+bounds.width+' '+bounds.height);
  for(const target of SLOTS)for(const source of target.from.filter(ref=>typeof ref==='string')){
   const a=board.querySelector('[data-slot="'+source+'"]')?.getBoundingClientRect(),b=board.querySelector('[data-slot="'+target.id+'"]')?.getBoundingClientRect();if(!a||!b)continue;
   const backwards=b.left<a.left,x=(backwards?a.left:a.right)-bounds.left,y=a.top+a.height/2-bounds.top,end=(backwards?b.right:b.left)-bounds.left,endY=b.top+b.height/2-bounds.top,mid=(x+end)/2;
   const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',`M ${x} ${y} H ${mid} V ${endY} H ${end}`);path.setAttribute('class',draft[source]?.team?'selected-path':'pending-path');svg.append(path);
  }
 }
 function render(){
  root._bracketCleanup?.();const horizontal=root.querySelector('.cfp-board-viewport')?.scrollLeft||0;

  const columns=layout==='bracket'?[
   {round:0,side:'left',ids:['r8','r5']},{round:1,side:'left',ids:['q1','q4']},
   {round:2,side:'left',ids:['s1']},{round:3,side:'center',ids:['final']},
   {round:2,side:'right',ids:['s2']},{round:1,side:'right',ids:['q2','q3']},
   {round:0,side:'right',ids:['r7','r6']}
  ]:ROUNDS.map((_,round)=>({round,side:'list',ids:SLOTS.filter(s=>s.round===round).map(s=>s.id)}));
  const boardMarkup=columns.map(({round,side,ids})=>'<section class="cfp-round" data-round="'+round+'" data-side="'+side+'"><h3>'+ROUNDS[round]+'<small>'+ROUND_POINTS[round]+' points</small></h3>'+ids.map(id=>card(SLOTS.find(s=>s.id===id))).join('')+'</section>').join('');
  root.innerHTML='<h2>'+(pending?'Your playoff bracket — lineup coming soon':'Your full playoff bracket')+'</h2><p class="cfp-budget">'+(accessLocked?'Your commissioner needs to unlock your playoff picks.':pending?'Waiting for the official playoff lineup':disabled?(demo?'Practice results shown — clear sample results to edit':'Entire bracket locked'):demo?'Practice bracket — saves stay on this device':'All 11 picks lock together: '+esc(deadline))+'</p><p>Pick winners from the first round through the champion. Changing an earlier winner clears later picks that no longer fit. Points are automatic: 10 in the first round, 20 in the quarterfinals, 40 in the semifinals and 80 for the champion. Maximum: 280.</p><p id="bracketStatus" class="'+(!dirty&&state.entry?.submitted?'cfp-saved-confirmation':'')+'" role="status">'+(accessLocked?'You can view the bracket and standings. Ask your commissioner to unlock your picks.':pending?'Official teams will fill these slots automatically. No commissioner setup is needed.':dirty?'Unsaved changes — lock in your picks again to enter these edits.':state.entry?.submitted?'Your picks are saved and entered.':state.entry?'Draft saved — submit the complete bracket before the deadline.':'Start your bracket below.')+'</p><div class="cfp-layout-nav" aria-label="Bracket layout"><button type="button" data-layout="bracket" aria-pressed="'+(layout==='bracket')+'">Bracket view</button><button type="button" data-layout="rounds" aria-pressed="'+(layout==='rounds')+'">Round by round</button></div><p class="cfp-swipe-hint">'+(layout==='bracket'?'Blue → green → purple → gold. Both sides meet at the championship. Swipe sideways to follow your teams.':'Follow each round from top to bottom.')+'</p><div class="cfp-board-viewport" data-layout="'+layout+'" tabindex="0" aria-label="Playoff bracket — scroll sideways for later rounds"><div class="cfp-bracket"><svg class="cfp-connections" aria-hidden="true"></svg>'+boardMarkup+'</div></div><form id="bracketSave"><label>Championship combined final score (tiebreaker)<input id="championshipGuess" type="number" min="0" max="200" step="1" inputmode="numeric" value="'+esc(guess)+'" '+(disabled?'disabled':'')+'></label><p>Both teams’ final scores added together, including overtime. Closest wins a points tie; equally close players share the place.</p><button type="button" id="saveDraft" '+(disabled?'disabled':'')+'>Save draft</button> <button '+(disabled?'disabled':'')+'>Lock in my picks</button><p>You can edit and lock in updated picks until the first playoff kickoff. Save draft keeps unfinished picks; Lock in my picks enters your complete bracket.</p><p role="status" id="saveStatus"></p></form><details><summary>How scoring works</summary><p>'+esc(BRACKET_RULES)+'</p></details>';
  root.querySelector('.cfp-board-viewport').scrollLeft=horizontal;
  root.querySelectorAll('.cfp-layout-nav [data-layout]').forEach(b=>b.onclick=()=>{captureGuess();layout=b.dataset.layout;render()});
  root.querySelectorAll('[data-go-slot]').forEach(b=>b.onclick=()=>{const target=root.querySelector('[data-slot="'+b.dataset.goSlot+'"]');target?.scrollIntoView({behavior:'smooth',block:'center'});target?.focus({preventScroll:true});});
  const observer=new ResizeObserver(drawConnections);observer.observe(root.querySelector('.cfp-bracket'));let frame=requestAnimationFrame(drawConnections);root._bracketCleanup=()=>{observer.disconnect();cancelAnimationFrame(frame)};
  root.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{captureGuess();const id=b.closest('[data-slot]').dataset.slot;draft[id]={team:b.dataset.pick};draft=cleanBracket(draft,cfg.teams);dirty=true;const top=scrollY;render();scrollTo({top,behavior:'instant'});root.querySelector('[data-slot="'+id+'"] [data-pick="'+draft[id].team+'"]')?.focus({preventScroll:true})});
  function captureGuess(){guess=root.querySelector('#championshipGuess').value;}
  async function save(submit){captureGuess();const note=root.querySelector('#saveStatus'),buttons=root.querySelectorAll('#bracketSave button');buttons.forEach(b=>b.disabled=true);try{const value=guess===''?null:Number(guess);validateBracket(draft,cfg.teams,value,submit);await api({action:'bracketSave',picks:draft,guess:value,submit,revision:cfg.revision,version:state.entry?.version||0});await reload();}catch(e){note.textContent=e.message;buttons.forEach(b=>b.disabled=false)}}
  root.querySelector('#saveDraft').onclick=()=>save(false);root.querySelector('#bracketSave').onsubmit=e=>{e.preventDefault();void save(true)};
 }
 render();return true;
}
