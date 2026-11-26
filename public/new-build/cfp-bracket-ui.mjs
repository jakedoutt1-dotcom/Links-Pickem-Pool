import {SLOTS,ROUNDS,participants,cleanBracket,validateBracket,BRACKET_RULES} from './cfp-bracket-core.mjs?v=autofield1';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountBracket({root,data,view,api,reload,demo}){
 root._bracketCleanup?.();
 const state=data.bracket;if(!state)return false;
 const cfg=state.config,disabled=state.locked||!data.available,deadline=cfg?new Date(cfg.deadline).toLocaleString():'';
 if(view==='standings'){
  root.innerHTML='<h2>Full-bracket standings</h2><p>Only submitted brackets count. Confidence points: 66 maximum. The championship total breaks ties after all 11 official results are final.</p><div class="table-wrap"><table><thead><tr><th>Place</th><th>Player</th><th>Points</th><th>Correct</th><th>Championship guess</th><th>Difference</th></tr></thead><tbody>'+state.standings.rows.map(r=>'<tr><td>'+r.rank+'</td><td>'+esc(r.player)+(r.submitted?'':' (not submitted)')+'</td><td>'+r.points+'</td><td>'+r.wins+'/11</td><td>'+(r.guess??'—')+'</td><td>'+(r.difference??'—')+'</td></tr>').join('')+'</tbody></table></div>'+(state.locked?'<h3>Submitted brackets</h3>'+state.shared.map(e=>'<details><summary>'+esc(e.player)+'</summary>'+SLOTS.map(s=>'<p>'+ROUNDS[s.round]+': '+esc(cfg.teams.find(t=>t.id===e.picks[s.id]?.team)?.name)+' · '+e.picks[s.id]?.confidence+' points</p>').join('')+'</details>').join(''):'<p>Everyone’s picks stay private until the first playoff kickoff.</p>');return true;
 }
 if(view!=='picks')return false;
 if(!cfg){root.innerHTML='<h2>Pick your full playoff bracket</h2><p>Pick every round through the champion, use confidence values 1–11 once each, and predict the championship combined score. Everything locks at the first playoff kickoff.</p><p class="notice">Waiting for the official playoff field. LINKS will open the seeded bracket automatically when the final field and first-round kickoff times are available. No commissioner setup is needed.</p>';return true;}
 let draft=structuredClone(state.entry?.picks||{}),guess=state.entry?.guess??'',dirty=false;
 const gameNumber=id=>SLOTS.findIndex(s=>s.id===id)+1;
 const teamFor=ref=>cfg.teams.find(t=>t.id===(typeof ref==='number'?cfg.teams.find(t=>t.seed===ref)?.id:draft[ref]?.team));
 const matchup=s=>s.from.map(ref=>teamFor(ref)?.name||(typeof ref==='number'?'Seed '+ref:'Winner of Game '+gameNumber(ref))).join(' vs. ');
 function card(s){
  const p=draft[s.id]||{},used=Object.entries(draft).filter(([id])=>id!==s.id).map(([,p])=>p.confidence),next=SLOTS.find(n=>n.from.includes(s.id)),winner=cfg.teams.find(t=>t.id===p.team);
  return '<article id="cfp-game-'+s.id+'" class="cfp-entry" data-slot="'+s.id+'" tabindex="-1"><p class="cfp-game-label">Game '+gameNumber(s.id)+' · '+ROUNDS[s.round]+'</p><h4>'+esc(matchup(s))+'</h4><div class="teams">'+s.from.map(ref=>{
   const t=teamFor(ref),source=typeof ref==='number'?(s.round===1?'First-round bye':'Seed '+ref):'Winner of Game '+gameNumber(ref);
   if(!t)return '<button type="button" class="cfp-feeder" data-go-slot="'+ref+'"><span>'+source+'</span><small>'+esc(matchup(SLOTS.find(g=>g.id===ref)))+'</small><b>Choose the advancing team</b></button>';
   return '<button type="button" data-pick="'+esc(t.id)+'" aria-pressed="'+(p.team===t.id)+'" '+(disabled?'disabled':'')+'><small class="cfp-source">'+source+'</small><img src="'+esc(t.logo)+'" alt=""><b>#'+t.seed+' '+esc(t.name)+'</b><small>Record: '+esc(t.record||'Not posted')+(t.rank?' · Rank #'+t.rank:'')+'</small></button>';
  }).join('')+'</div><label>Confidence points<select class="confidence" aria-label="Confidence for '+s.id+'" '+(disabled||!p.team?'disabled':'')+'><option value="">Choose points</option>'+Array.from({length:11},(_,i)=>i+1).map(n=>'<option value="'+n+'" '+(p.confidence===n?'selected':'')+(used.includes(n)?' disabled':'')+'>'+n+' points'+(used.includes(n)?' (used)':'')+'</option>').join('')+'</select></label><div class="cfp-advancement">'+(winner?'<strong>'+esc(winner.name)+(next?' advances':' is your champion')+'</strong>':'<span>Choose your winner</span>')+(next?'<button type="button" class="cfp-path-link" data-go-slot="'+next.id+'">'+(winner?'Continue to':'Feeds')+' Game '+gameNumber(next.id)+' · '+ROUNDS[next.round]+'</button>':'<p>Winner of Game 9 vs. winner of Game 10</p>')+'</div></article>';
 }
 function drawConnections(){
  const board=root.querySelector('.cfp-bracket'),svg=board?.querySelector('.cfp-connections');if(!svg)return;
  svg.replaceChildren();if(!matchMedia('(min-width:1101px)').matches)return;
  const bounds=board.getBoundingClientRect();svg.setAttribute('viewBox','0 0 '+bounds.width+' '+bounds.height);
  for(const target of SLOTS)for(const source of target.from.filter(ref=>typeof ref==='string')){
   const a=board.querySelector('[data-slot="'+source+'"]')?.getBoundingClientRect(),b=board.querySelector('[data-slot="'+target.id+'"]')?.getBoundingClientRect();if(!a||!b)continue;
   const x=a.right-bounds.left,y=a.top+a.height/2-bounds.top,end=b.left-bounds.left,endY=b.top+b.height/2-bounds.top,mid=(x+end)/2;
   const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',`M ${x} ${y} H ${mid} V ${endY} H ${end}`);path.setAttribute('class',draft[source]?.team?'selected-path':'pending-path');svg.append(path);
  }
 }
 function render(){
  root._bracketCleanup?.();

  root.innerHTML='<h2>Your full playoff bracket</h2><p class="cfp-budget">'+(disabled?(demo?'Practice results shown — clear sample results to edit':'Entire bracket locked'):demo?'Practice bracket — saves stay on this device':'All 11 picks lock together: '+esc(deadline))+'</p><p>Pick winners from the first round through the champion. Changing an earlier winner clears later picks that no longer fit. Assign each number 1–11 once: 66 possible points.</p><p id="bracketStatus" role="status">'+(dirty?'Unsaved changes.':state.entry?.submitted?'Your complete bracket is submitted.':state.entry?'Draft saved — submit the complete bracket before the deadline.':'Start your bracket below.')+'</p><div class="cfp-bracket"><svg class="cfp-connections" aria-hidden="true"></svg>'+ROUNDS.map((title,round)=>'<section class="cfp-round"><h3>'+title+'</h3>'+SLOTS.filter(s=>s.round===round).map(card).join('')+'</section>').join('')+'</div><form id="bracketSave"><label>Championship combined final score (tiebreaker)<input id="championshipGuess" type="number" min="0" max="200" step="1" inputmode="numeric" value="'+esc(guess)+'" '+(disabled?'disabled':'')+'></label><p>Both teams’ final scores added together, including overtime. Closest wins a points tie; equally close players share the place.</p><button type="button" id="saveDraft" '+(disabled?'disabled':'')+'>Save draft</button> <button '+(disabled?'disabled':'')+'>Submit full bracket</button><p role="status" id="saveStatus"></p></form><details><summary>How scoring works</summary><p>'+esc(BRACKET_RULES)+'</p></details>';
  root.querySelectorAll('[data-go-slot]').forEach(b=>b.onclick=()=>{const target=root.querySelector('[data-slot="'+b.dataset.goSlot+'"]');target?.scrollIntoView({behavior:'smooth',block:'center'});target?.focus({preventScroll:true});});
  const observer=new ResizeObserver(drawConnections);observer.observe(root.querySelector('.cfp-bracket'));let frame=requestAnimationFrame(drawConnections);root._bracketCleanup=()=>{observer.disconnect();cancelAnimationFrame(frame)};
  root.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{captureGuess();const id=b.closest('[data-slot]').dataset.slot;draft[id]={team:b.dataset.pick,confidence:draft[id]?.confidence??null};draft=cleanBracket(draft,cfg.teams);dirty=true;const top=scrollY;render();scrollTo({top,behavior:'instant'});root.querySelector('[data-slot="'+id+'"] [data-pick="'+draft[id].team+'"]')?.focus({preventScroll:true})});
  root.querySelectorAll('.confidence').forEach(select=>select.onchange=()=>{
   captureGuess();const id=select.closest('[data-slot]').dataset.slot;draft[id].confidence=select.value===''?null:Number(select.value);dirty=true;
   root.querySelector('#bracketStatus').textContent='Unsaved changes.';
   // Keep the native picker mounted and focused normally. Replacing and refocusing
   // a select during its change event can reopen the phone's selection sheet.
   root.querySelectorAll('.confidence').forEach(other=>{
    const owner=other.closest('[data-slot]').dataset.slot,used=new Set(Object.entries(draft).filter(([key])=>key!==owner).map(([,p])=>p.confidence));
    for(const option of other.options){if(option.value==='')continue;const n=Number(option.value),taken=used.has(n);option.disabled=taken;option.textContent=n+' points'+(taken?' (used)':'');}
   });
  });
  function captureGuess(){guess=root.querySelector('#championshipGuess').value;}
  async function save(submit){captureGuess();const note=root.querySelector('#saveStatus'),buttons=root.querySelectorAll('#bracketSave button');buttons.forEach(b=>b.disabled=true);try{const value=guess===''?null:Number(guess);validateBracket(draft,cfg.teams,value,submit);await api({action:'bracketSave',picks:draft,guess:value,submit,revision:cfg.revision,version:state.entry?.version||0});await reload();}catch(e){note.textContent=e.message;buttons.forEach(b=>b.disabled=false)}}
  root.querySelector('#saveDraft').onclick=()=>save(false);root.querySelector('#bracketSave').onsubmit=e=>{e.preventDefault();void save(true)};
 }
 render();return true;
}
