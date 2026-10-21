import {mountInviteShare} from './invite-share.mjs';
import {rememberPartySeat} from './party-score-link.mjs';
import qrcode from './vendor/qrcode.mjs';
import {mountMysteryAudio} from './last-alibi-audio.mjs?v=20261016b';

const $ = id => document.getElementById(id);
const sound = mountMysteryAudio($('soundToggle'), {narrationButton:$('narrationToggle'),voiceSelect:$('narrationVoice'),replayButton:$('replayNarration'),status:$('narrationStatus')});
let code = new URL(location.href).searchParams.get('room') || '';
let resumeImportError='';
const resumeFragment=new URLSearchParams(location.hash.slice(1)).get('resume');
if(resumeFragment){try{const saved=JSON.parse(resumeFragment);if(!/^[A-Z0-9]{6,12}$/i.test(saved.code||'')||typeof saved.token!=='string'||!saved.token||saved.token.length>512)throw Error();code=saved.code.toUpperCase();localStorage.setItem('links-alibi-'+code,saved.token);const clean=new URL(location.href);clean.searchParams.set('room',code);clean.hash='';history.replaceState(null,'',clean)}catch{resumeImportError='This private resume link is invalid or cannot be saved on this device.';const clean=new URL(location.href);clean.hash='';history.replaceState(null,'',clean)}}
const setupCase=new URL(location.href).searchParams.get('case'),joinOnly=new URL(location.href).searchParams.has('join');
if(!code&&!setupCase&&!joinOnly&&!resumeImportError)location.replace('./murder-mysteries.html');
document.body.dataset.caseSetup=String(!code&&!joinOnly);if(setupCase&&!code){document.body.dataset.caseLoading='true';$('createForm').querySelector('button').disabled=true;$('message').textContent='Opening your selected case…'}
if(code||joinOnly){$('createForm').hidden=true;document.querySelector('#entry .cover').hidden=true;document.querySelector('#entry .how-to-play').hidden=true}else{$('joinForm').hidden=true}
const displayKey = new URLSearchParams(location.hash.slice(1)).get('display') || '';
let state = null, busy = false, offset = 0, signature = '', generation = 0;
let tab = 'story', selectedRoom = 'study', zoom = 1, inspectId = '', pinned = [];
let photoZoom=1,photoClue='',photoHints=false,workingTheoryDirty=false,workingTheoryKey='';let lastScene = '', lastGame = 0, theoryChapter = -1;const readDeskRecords=new Set();
let deductionId = '', notesKey = '', notesDirty = false, notesCached = false;
let boardIndex = 0, boardAuto = true, boardChanged = 0, boardSignature = '', boardRecords = [];
const midnight = () => state?.dossierVersion>0||state?.chapterCount===3||['midnight-desk','final-encore','night-train','last-hand'].includes(state?.caseId);
let caseCatalog=[{id:'midnight-desk',title:'The Midnight Desk',description:'A witty hotel mystery. Short shift. Long list of excuses.',art:'./assets/last-alibi-midnight-desk-v1.png',shortCase:true,minutes:[8,12],modes:['solo','together'],playerLabel:'1–8 investigators'},{id:'blackthorn',title:'Blackthorn Manor',description:'The original stormbound murder mystery. Follow every alibi, or hide a killer among your crew.',art:'./assets/last-alibi-cover-v1.png',shortCase:false,minutes:[35,45],modes:['solo','together','secret'],playerLabel:'1–8 investigators'}];
function playedCases(){try{const saved=JSON.parse(localStorage.getItem('links-alibi-played-cases')||'[]');return new Set(Array.isArray(saved)?saved.filter(x=>typeof x==='string'):[])}catch{return new Set()}}
function rememberPlayedCase(){if(state?.phase!=='ended'||(state.revealStep??4)<3)return;const played=playedCases();played.add(state.caseId||'blackthorn');try{localStorage.setItem('links-alibi-played-cases',JSON.stringify([...played]))}catch{}}
const caseSpec = () => caseCatalog.find(c=>c.id===(state?.caseId||$('caseId').value));
function safeCaseArt(value,fallback='./assets/last-alibi-midnight-desk-v1.png'){try{let text=String(value||'');if(text&&!text.includes('/')&&/\.(png|svg|webp|jpg)$/i.test(text))text='./assets/'+text;const u=new URL(text,location.href);return text&&(u.origin===location.origin||u.protocol==='https:')?u.href:fallback}catch{return fallback}}
const hotelArt = './assets/last-alibi-midnight-desk-v1.png';
const caseArt = art => midnight() ? safeCaseArt(state?.caseArt||caseSpec()?.art,hotelArt) : './assets/last-alibi-' + art + '-v1.png';
const token = () => localStorage.getItem('links-alibi-' + code) || '';
const headers = () => ({'Content-Type':'application/json','x-alibi-token':displayKey ? '' : token(),'x-alibi-display':displayKey});
const modeNames = {solo:'Solo investigator',together:'Solve Together',secret:'Secret Killer'};
const stages = ['Arrival','First clues','Alibis','The timeline','Final theory','Accusations','The truth'];
const revealLabels = ['Sealed','Reconstruct','Culprit','Explain','Results'];
const deductionLabels = {unconfirmed:'Unconfirmed',alibi:'Has an alibi',suspected:'Suspected'};
const televisionScenes = [
  'A storm has cut Blackthorn Manor off from the village. Adrian Vale is dead. Every guest feared his midnight revelation. Preserve the evidence and find the guest with no alibi.',
  'The dinner conversation has stopped. An empty chair. A changed account. Search the house and bring one useful discovery back to the room.',
  'The locked doors kept secrets in. A surviving entry log and a witness at the gate give the room another way to test its theories.',
  'A rehearsal recording caught an ordinary detail nobody meant to preserve. Put the records together: who was elsewhere when the attack happened?',
  'Adrian’s midnight envelope exposes the guests’ motives. Nearly everyone lied about something. Build your accusation from the verified evidence.'
];
const fallbackObjectives = [
  {title:'Meet the case',instruction:'Read the scene and your private role. Name who did it, where and how.',prompt:'What would prove someone could not have done it?',primaryAction:'role'},
  {title:'Bring back a discovery',instruction:'Choose a room and inspect a record. Share a useful detail, then hear what everyone else found.',prompt:'What did you discover, and what does it actually prove?',primaryAction:'search'},
  {title:'Test an alibi',instruction:'Collect the new records. Compare what they say with the incident window.',prompt:'Which guest can you place elsewhere? Show the record behind your reasoning.',primaryAction:'search'},
  {title:'Make one timeline',instruction:'Compare all three recordings with the incident window.',prompt:'Which detail changed your mind? Let everyone explain one connection.',primaryAction:'evidence'},
  {title:'Build your final theory',instruction:'Choose the suspect who remains without a verified alibi. Check the location and method.',prompt:'Give your case in one sentence, then invite someone to challenge it.',primaryAction:'theory'}
];

async function api(body) {
  const requestRoom = code, requestSeat = displayKey ? '' : token();
  const r = await fetch('./api/last-alibi' + (body ? '' : '?code=' + encodeURIComponent(requestRoom)), {method:body ? 'POST' : 'GET',headers:{...headers(),'x-alibi-token':requestSeat},cache:'no-store',signal:AbortSignal.timeout(15000),...(body ? {body:JSON.stringify({code:requestRoom,...body})} : {})});
  const j = await r.json(); if (!r.ok) throw Object.assign(Error(j.error || 'Unable to connect.'),{status:r.status,room:requestRoom,seat:requestSeat}); return j;
}
const inviteLink = () => { const u = new URL('./last-alibi.html',location.href); u.searchParams.set('room',code); return u.href; };
const privateResumeLink=()=>{const u=new URL('./last-alibi.html',location.href);u.searchParams.set('room',code);u.hash='resume='+encodeURIComponent(JSON.stringify({code,token:token()}));return u.href};
const tvLink = () => inviteLink() + '#display=' + state.displayKey;
function qr() { const q = qrcode(0,'M'); q.addData(inviteLink()); q.make(); $('qr').innerHTML = q.createSvgTag({cellSize:5,margin:12,scalable:true}); }
function cacheNotes() {
  notesCached = false;
  try { if (notesKey) { if (notesDirty) { sessionStorage.setItem(notesKey,$('notes').value); notesCached = true; } else sessionStorage.removeItem(notesKey); } } catch {}
  $('notesMessage').textContent = notesDirty ? (notesCached ? 'Unsaved draft kept in this tab. Save to keep it with your case.' : 'Unsaved notes. Save to keep them with your case.') : $('notes').value ? 'Private notes saved.' : 'Your notes are private. Save when you are ready.';
}
function syncNotes() {
  const key = !state.display && state.players.find(p => p.you)?.id ? 'links-alibi-draft-' + code + '-' + state.game + '-' + state.players.find(p => p.you).id : '';
  if (key !== notesKey) {
    if (notesKey && lastGame !== state.game) { try { sessionStorage.removeItem(notesKey); } catch {} }
    notesKey = key; let draft = null; try { if (key) draft = sessionStorage.getItem(key); } catch {}
    $('notes').value = draft ?? state.notes ?? ''; notesDirty = draft !== null && draft !== (state.notes || '');
  } else if (!notesDirty) $('notes').value = state.notes || '';
  if ($('notes').value === (state.notes || '')) notesDirty = false;
  cacheNotes();
}
function resetSeat() {
  const name = state?.players.find(p => p.you)?.name || $('joinName').value;
  cacheNotes(); // Keep the old seat's unsaved draft, without carrying it into a new seat.
  localStorage.removeItem('links-alibi-' + code); ++generation;
  sound.reset();
  state = null; offset = 0; signature = ''; lastScene = ''; lastGame = 0; theoryChapter = -1;
  tab = 'story'; selectedRoom = 'study'; zoom = 1; inspectId = ''; deductionId = ''; pinned = [];
  notesKey = ''; notesDirty = false; notesCached = false; $('notes').value = '';
  boardIndex = 0; boardAuto = true; boardChanged = 0; boardSignature = ''; boardRecords = [];
  document.querySelectorAll('dialog[open]').forEach(d => d.close());
  for (const id of ['roster','guestSeats','sceneProgress','roomReadiness','suspects','evidenceCards','rooms','hotspots','objectList','revealSteps','results','revealProgress','accusationSummary','inspectionPoints','compareDocs','roleTitle','roleIdentity','roleIntro','roleSecret','roleAlibi','roleTruth','inspectTitle','inspectText','inspectDetail','deductionName','theorySuspect','theoryEvidence','suspectChoice','sceneChoice','methodChoice','supportChoice','deductionEvidence']) $(id).replaceChildren();
  $('tvLink').removeAttribute('href'); $('game').hidden = true; $('entry').hidden = false; $('joinForm').hidden = false;
  $('createForm').hidden = true; document.querySelector('.cover').hidden = true; document.querySelector('.how-to-play').hidden = true; document.querySelector('.rules').hidden = true; $('entry').classList.add('invited');
  document.body.dataset.display = 'false'; delete document.body.dataset.phase; delete document.body.dataset.mode;
  $('code').value = code; $('roomCodeLabel').hidden = false; $('joinName').value = name;
  $('joinRoomIntro').textContent = 'Your seat is no longer available in room ' + code + '. You can join again while its lobby is open, or enter another invitation.';
  $('message').textContent = 'Your seat was removed or is no longer valid. Join again to take a new seat.'; $('joinName').focus();
}
function requestFailed(error) {
  if (error.status === 401 && !displayKey && error.room === code && error.seat) {
    const currentSeat = token(); if (currentSeat && currentSeat !== error.seat) return;
    resetSeat(); return;
  }
  $('message').textContent = error.message;
}
function adopt(j) {
  if (!displayKey) rememberPartySeat('last-alibi',j.code,j.token || localStorage.getItem('links-alibi-' + j.code));
  state = j; code = j.code; offset = j.serverNow - Date.now();
  if (j.token) localStorage.setItem('links-alibi-' + code,j.token);
  const u = new URL(location.href); u.searchParams.set('room',code); history.replaceState(null,'',u);
  $('entry').hidden = true; $('game').hidden = false;
  syncNotes();
  if (lastGame !== j.game) { lastGame = j.game; pinned = []; theoryChapter = -1; deductionId = ''; document.querySelectorAll('dialog[open]').forEach(d => d.close()); }
  const scene = [j.game,j.phase,j.chapter].join(':');
  if (lastScene !== scene) { lastScene = scene; tab = j.phase === 'accuse' ? 'evidence' : (j.dossierVersion>0||j.chapterCount===3||['midnight-desk','final-encore','night-train','last-hand'].includes(j.caseId))&&j.phase==='investigate'?'search':'story'; document.querySelectorAll('dialog[open]').forEach(d => d.close()); $('story').classList.remove('scene-arrived'); requestAnimationFrame(() => $('story').classList.add('scene-arrived')); }
  const sig = JSON.stringify({...j,serverNow:0,token:undefined}); if (sig !== signature) { signature = sig; render(); } tick();
}
async function act(action,extra = {}) {
  if (busy) return false; busy = true; const gen = ++generation; tick(); $('message').textContent = '';
  document.querySelectorAll('#entry button').forEach(b => b.disabled = true);
  try { const result = await api({action,game:state?.game,chapter:state?.chapter,...extra}); if (gen !== generation) return false; adopt(result); return true; }
  catch (e) { if (gen === generation) requestFailed(e); return false; }
  finally { busy = false; document.querySelectorAll('#entry button').forEach(b => b.disabled = false); tick(); }
}
function showTab(next,scroll = false) {
  tab = next; document.querySelectorAll('.pane').forEach(el => el.hidden = state.display || el.id !== tab || ['lobby','ended'].includes(state.phase));
  document.querySelectorAll('#tabs button').forEach(b => { b.classList.toggle('active',b.dataset.tab === tab); b.setAttribute('aria-current',b.dataset.tab === tab ? 'page' : 'false'); });
  if (scroll && $(next)) $(next).scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
}
function allClues() { return [...new Map([...(state.publicClues || []),...(state.discovered || []),...(state.ending?.evidence || [])].map(e => [e.id,e])).values()]; }
function cast() { return (state.suspects || state.players).filter(p => p.character); }
function accusationCandidates() { const mine = state.players.find(p => p.you)?.id; return cast().filter(p => p.id !== mine); }
function isAway() { return !!state.players.find(p => p.you)?.away; }
function participantCount() { return state.progress?.playerCount ?? state.players.filter(p => !p.away).length; }
function canEditDeductions() { return !state.display && !isAway() && !state.paused && !state.accusation && ['briefing','investigate','accuse'].includes(state.phase); }
function choices(select,values,selected = select.value) { select.replaceChildren(new Option('Choose…','')); select.options[0].disabled = true; values.forEach(([v,l]) => select.append(new Option(l,v))); select.value = values.some(([v]) => v === selected) ? selected : ''; }
function make(tag,text,className = '') { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; }
function currentObjective() {
  if (state.phase === 'accuse') return {title:'Seal your accusation',instruction:'Choose who, where and how. Back your conclusion with a shared record, then seal it on your phone.',prompt:'One final conversation. What is your strongest piece of evidence?',primaryAction:'accuse'};
  return state.objective || fallbackObjectives[state.chapter || 0];
}
function render() {
  const active = !['lobby','ended'].includes(state.phase);
  document.body.dataset.recordScene='true';document.body.dataset.case = midnight() ? 'midnight-desk' : 'blackthorn';$('caseTitle').textContent = state.caseTitle || (midnight() ? 'The Midnight Desk' : 'The Blackthorn Case');$('accusationInstruction').textContent=midnight()?'Prove who was responsible, where and how, supported by a record you found or shared. Your crew must establish the complete case; guessing a suspect alone does not close the case.':'Choose who, where and how. Support your case with a shared record. A strict majority of players taking part must identify the culprit to solve the mystery.';$('scoringNote').textContent=midnight()?'500 points for the culprit, 100 each for location and method. Closing the complete case also requires valid supporting proof. Equal scores share a rank.':'Investigators: 500 for the culprit, 100 each for location and method. The murderer earns 500 only if they escape. Equal scores share a rank.';$('goSearch').textContent=midnight()?'Inspect the records':'Enter the manor';$('hint').querySelector('summary').textContent=midnight()?'A useful nudge':'A nudge from the constable';document.body.dataset.display = String(state.display); document.body.dataset.phase = state.phase; document.body.dataset.mode = state.mode || (state.cooperative ? 'together' : 'secret');
  $('caseCode').textContent = 'ROOM ' + code + ' · ' + (modeNames[state.mode] || 'Last Alibi') + ' · ' + (state.difficulty === 'expert' ? 'EXPERT' : 'STANDARD');
  $('hostTools').hidden = !state.host; $('pause').hidden = $('continue').hidden = !active; $('start').hidden = !state.host;
  $('lobby').hidden = state.phase !== 'lobby'; $('tabs').hidden = state.display || !active; $('ending').hidden = state.phase !== 'ended';
  $('accusation').hidden = state.display || state.phase !== 'accuse'; $('tvBoard').hidden = !state.display || !active; $('sceneProgress').hidden = state.phase === 'lobby';
  renderProgress(); if (state.phase === 'lobby') renderLobby(); renderGuests();
  $('awayNotice').hidden = state.display || !active || !isAway();
  const info = state.chapterInfo;
  if (info && active) {
    const objective = currentObjective(); $('chapterLabel').textContent = info.label; $('chapterTitle').textContent = info.title; $('chapterText').textContent = info.story; $('discussionPrompt').textContent = objective.prompt || '';
    $('tvChapter').textContent = state.phase === 'accuse' ? 'FINAL ACCUSATIONS' : info.label; $('tvTitle').textContent = state.phase === 'accuse' ? 'Who has no alibi?' : info.title;
    $('tvStory').textContent = state.phase === 'accuse' ? objective.instruction : (midnight() ? info.story : televisionScenes[state.chapter]) || info.story; $('tvPrompt').textContent = objective.prompt || '';
    $('storyArt').src = $('tvArt').src = info.art?safeCaseArt(info.art):caseArt(['manor','dining','gate','music','study'][state.chapter] || 'manor');$('storyArt').alt=$('tvArt').alt=midnight()?(state.caseTitle||'Last Alibi')+' at night':'Blackthorn Manor at night';
  }
  $('goSearch').hidden = state.phase !== 'investigate'; $('roleButton').hidden = state.display; $('roleButton').textContent = state.cooperative ? 'Read my investigator brief' : 'Open my private role';
  $('roomMapDetails').open=!!state.dossierVersion||!midnight();renderSuspects(); renderSearch(); renderEvidence(); renderGuide(); renderTheory();renderWorkingTheory();renderCaseObjective(); showTab(tab);
  if (state.phase === 'accuse') renderAccusation(); if (state.phase === 'ended') renderEnding();
  if ($('inspect').open && inspectId) fillInspection();if($('deskPhone').open)showCall();renderBoard();
}
function renderProgress() {
  const labels=state.dossierVersion>=2?['Briefing',...Array.from({length:state.chapterCount||6},(_,i)=>'Packet '+(i+1)),'Conclusion','Reconstruction']:midnight()?['Check in','Desk records','Guest accounts','Final dispatch','Accusations','Incident report']:stages;const current = state.phase === 'ended' ? labels.length-1 : state.phase === 'accuse' ? labels.length-2 : state.chapter || 0; $('sceneProgress').replaceChildren();
  labels.forEach((title,i) => { const li = make('li',title,i < current ? 'complete' : i === current ? 'current' : ''); if (i === current) li.setAttribute('aria-current','step'); $('sceneProgress').append(li); });
}
function renderLobby() {
  $('invitation').hidden = state.mode === 'solo'; $('lobbyCode').textContent = code;
  $('modeNote').textContent = midnight() ? (state.mode==='solo'?'One investigator. Read the key records and choose how to spend three optional leads. Essential clues are free.':'2–8 investigators. Compare your discoveries, discuss your theories and choose how to spend three shared optional leads.') : state.mode === 'solo' ? 'One investigator. Six fictional suspects. Inspect every clue and follow the case at your pace.' : state.mode === 'secret' ? '4–8 players. You each become a guest at Blackthorn. One of you will receive the killer role.' : '2–8 investigators. Work together to investigate six fictional guests. None of you is the killer.';
  const minimum = state.mode === 'solo' ? 1 : state.mode === 'secret' ? 4 : 2, ready = state.players.filter(p => p.ready).length;
  $('lobbyStatus').textContent = state.players.length < minimum ? 'Waiting for ' + (minimum - state.players.length) + ' more players.' : ready === state.players.length ? (state.host ? 'Everyone is ready. Open the doors when your room is settled.' : 'Everyone is ready. Your host will open the doors.') : ready + ' / ' + state.players.length + ' ready. Read the mode, then take your seat.';
  qr(); $('roster').replaceChildren(); state.players.forEach(p => { const li = document.createElement('li'); li.append(make('span',p.name + (p.you ? ' · You' : '')),make('b',p.ready ? 'Ready ✓' : 'Taking their seat')); $('roster').append(li); });
}
function renderGuests() {
  const lobby = state.phase === 'lobby', guests = state.players.filter(p => !p.you);
  $('guestTools').hidden = !state.host || state.phase === 'ended' || !guests.length;
  if (!state.host) return;
  $('guestTools').querySelector('summary').textContent = lobby ? 'Manage guest seats' : 'A guest disconnected?';
  $('guestHelp').textContent = lobby ? 'Remove an unused guest seat before starting. They can join again with the invitation.' : 'Mark an unfinished guest away so the room can continue. Their character and evidence stay in the case. They can rejoin on their phone before the reveal. Away guests are outside the final vote and earn no points.';
  $('guestSeats').replaceChildren();
  guests.forEach(p => {
    const row = make('div','','guest-seat'), done = state.phase === 'accuse' ? p.accusationSubmitted : p.chapterReady;
    row.append(make('span',p.name + (p.away ? ' · Away' : !lobby && done ? ' · Finished this scene' : '')));
    if (!p.away) {
      const button = make('button',lobby ? 'Remove seat' : 'Mark away'); button.dataset.guest = p.id; button.dataset.unavailable = String(!lobby && !!done);
      button.onclick = async () => { if (await act(lobby ? 'remove' : 'away',{player:p.id})) $('guestMessage').textContent = p.name + (lobby ? '’s seat was removed.' : ' is marked away. Their place in the story is saved.'); };
      row.append(button);
    } else row.append(make('small','Can return from their phone'));
    $('guestSeats').append(row);
  });
}
function renderGuide() {
  const active = !['lobby','ended'].includes(state.phase); $('guide').hidden = !active; if (!active) return;
  const objective = currentObjective(), mine = state.players.find(p => p.you);
  $('stepLabel').textContent = state.phase === 'accuse' ? 'FINAL SCENE · YOUR LAST WORD' : (midnight()?(state.chapter===0?'CASE BRIEFING':'ACT '+state.chapter+' OF '+(state.chapterCount||3)):'SCENE ' + (state.chapter + 1) + ' OF 5')+' · YOUR NEXT MOVE'; $('objective').textContent = objective.title; $('instruction').textContent = objective.instruction;
  const action = state.progress?.theoryRequired && !state.theory ? 'theory' : objective.primaryAction;
  const labels = {role:state.cooperative ? 'Read my brief' : 'Read my private role',search:'Find a discovery',evidence:'Compare the evidence',theory:state.theory ? 'Review my theory' : 'Save my theory',accuse:state.accusation ? 'Review the evidence' : 'Make my accusation'};
  $('primaryAction').textContent = labels[action] || 'Read this scene'; $('primaryAction').hidden = state.display;
  $('primaryAction').onclick = () => {
    if (action === 'role') return privateRole();
    if (action === 'accuse' && !state.accusation) return $('accusation').scrollIntoView({block:'start',behavior:'smooth'});
    if (action === 'search') { selectedRoom = state.objects?.find(o => !o.collected)?.room || selectedRoom; renderSearch(); }
    const destination = action === 'theory' ? 'suspectPane' : ['search','evidence'].includes(action) ? action : 'evidence'; showTab(destination,true);
    if (action === 'theory' && !$('theoryCheckpoint').hidden) $('theoryCheckpoint').scrollIntoView({block:'center',behavior:'smooth'});
  };
  $('chapterReady').hidden = state.display || !state.guided || state.phase === 'accuse'; $('chapterReady').textContent = mine?.chapterReady ? 'Ready ✓ · Keep investigating' : 'Finished this scene · Ready';
  const ready = state.players.filter(p => !p.away && p.chapterReady).length, total = participantCount();
  $('readyCount').textContent = isAway() ? 'You are away. Rejoin this scene to take part.' : state.phase === 'accuse' ? state.accusationsReceived + ' / ' + total + ' accusations sealed. The host opens the truth when everyone taking part has answered.' : state.progress?.theoryRequired && !state.display && !state.theory ? 'Save a private theory, then tap ready. Your guess stays on your phone.' : ready === total ? 'Everyone taking part is ready. The host can open the next scene.' : ready + ' / ' + total + ' ready. Take the time you need.';
  $('roomReadiness').replaceChildren(); state.players.forEach(p => { const done = !p.away && (state.phase === 'accuse' ? p.accusationSubmitted : p.chapterReady); $('roomReadiness').append(make('span',p.name + (p.away ? ' · Away' : done ? ' ✓' : ''),p.away ? 'away' : done ? 'ready' : '')); });
  $('continue').textContent = state.phase === 'accuse' ? 'Open the truth' : 'Open next scene';if(midnight()){const solo=state.mode==='solo',canAdvance=!!state.pace?.canContinue;$('stepLabel').textContent=state.phase==='accuse'?'YOUR NEXT STEP · FINAL CONCLUSION':state.chapter===0?'YOUR NEXT STEP · BRIEFING':'YOUR NEXT STEP · ACT '+state.chapter+' / '+(state.chapterCount||3);$('instruction').textContent=state.phase==='accuse'?'Choose who, where and how. Support your answer with a record you found or shared.':state.chapter===0?'Read the briefing. Continue when you are ready.':'Read the highlighted record. Optional leads can sharpen your theory.';if(state.phase!=='accuse'&&!state.display){$('primaryAction').textContent=solo?'Continue case →':state.host&&canAdvance?'Open next act →':mine?.chapterReady?'Waiting for your crew':'Ready for next act →';$('primaryAction').onclick=()=>act(solo||state.host&&state.pace?.canContinue?'continue':'chapter-ready');$('chapterReady').hidden=true;$('continue').hidden=true;$('readyCount').textContent=solo?(state.chapter===0?'Continue case opens your first clues.':'Inspect the packet and prove its objective to release more evidence.'):state.pace?.waitingFor?.length?'Waiting for: '+state.pace.waitingFor.join(', '):'Everyone is ready. The host can open the next act.';}else if(state.phase==='accuse'&&!state.display){$('continue').hidden=true;$('chapterReady').hidden=true;if(state.accusation){$('primaryAction').textContent=state.host&&canAdvance?'Reveal the case →':'Waiting for other conclusions';$('primaryAction').onclick=()=>{if(state.host&&state.pace?.canContinue)act('continue')};}else{$('primaryAction').textContent='Make my final conclusion →';$('primaryAction').onclick=()=>$('accusation').scrollIntoView({block:'start',behavior:'instant'})}}}
}
function renderSuspects() {
  $('suspects').replaceChildren(); if (state.display) return;
  const marks = Object.values(state.deductions || {}), count = status => marks.filter(d => d.status === status).length;
  $('deductionSummary').textContent = count('alibi') + ' marked with an alibi · ' + count('suspected') + ' suspected · ' + (cast().length - count('alibi') - count('suspected')) + ' unconfirmed. Your marks are optional and do not affect scoring.';
  cast().forEach(p => {
    const deduction = state.deductions?.[p.id] || {status:'unconfirmed'}, card = make('article','','suspect-card'), record = allClues().find(e => e.id === deduction.evidence);
    card.dataset.suspect = p.id; card.dataset.mark = deduction.status;
    card.append(make('span',p.character.name.split(' ').map(n => n[0]).join(''),'suspect-monogram'),make('h3',p.character.name),make('p',state.cooperative ? p.character.title : p.name + ' · ' + p.character.title),make('p',p.character.intro || ''),make('span',deductionLabels[deduction.status] || deductionLabels.unconfirmed,'deduction-mark'));
    if (record) { const link = make('button',record.title,'deduction-record'); link.onclick = () => { inspectId = record.id; fillInspection(); $('inspect').showModal(); }; card.append(link); }
    const edit = make('button','Update deduction'); edit.className = 'edit-deduction'; edit.disabled = !canEditDeductions(); edit.onclick = () => openDeduction(p.id); card.append(edit);
    const theory = state.progress?.theoryRequired, accusation = state.phase === 'accuse';
    if (deduction.status === 'suspected' && record && accusationCandidates().some(x => x.id === p.id) && (theory || accusation) && (!accusation || midnight() || state.publicClues.some(e => e.id === record.id))) {
      const use = make('button',theory ? 'Use in my theory' : 'Use in my accusation','use-deduction'); use.disabled = !canEditDeductions();
      use.onclick = () => { $(theory ? 'theorySuspect' : 'suspectChoice').value = p.id; $(theory ? 'theoryEvidence' : 'supportChoice').value = record.id; $(theory ? 'theoryCheckpoint' : 'accusation').scrollIntoView({block:'start',behavior:'smooth'}); };
      card.append(use);
    }
    $('suspects').append(card);
  });
}
function openDeduction(id) {
  if (!canEditDeductions()) return;
  const suspect = cast().find(p => p.id === id), deduction = state.deductions?.[id] || {status:'unconfirmed',evidence:null}; if (!suspect) return;
  deductionId = id; $('deductionName').textContent = suspect.character.name; $('deductionStatus').value = deduction.status;
  $('deductionEvidence').replaceChildren(new Option('No record attached','')); allClues().forEach(e => $('deductionEvidence').append(new Option(e.title,e.id))); $('deductionEvidence').value = deduction.evidence || '';
  $('deductionMessage').textContent = 'Only you can see this judgment. Saving it does not submit a theory or accusation.'; $('deduction').showModal();
}
function renderTheory() {
  const required = state.phase === 'investigate' && state.flowVersion === 2 && (midnight()?!!state.progress?.theoryRequired:[2,4].includes(state.chapter)); $('theoryCheckpoint').hidden = state.display || !required; if (!required || state.display) return;
  const fresh = theoryChapter !== state.chapter; theoryChapter = state.chapter;
  choices($('theorySuspect'),accusationCandidates().map(p => [p.id,p.character.name]),fresh ? state.theory?.suspect || '' : $('theorySuspect').value || state.theory?.suspect || '');
  choices($('theoryEvidence'),allClues().map(e => [e.id,e.title]),fresh ? state.theory?.evidence || '' : $('theoryEvidence').value || state.theory?.evidence || '');
  $('theoryTitle').textContent = state.chapter === 2 ? 'Who needs another look?' : 'Who has no verified alibi?';
  $('theoryMessage').textContent = state.theory ? 'Theory saved privately. Discuss your reasoning, then tap ready when you are finished.' : 'This is a working theory. The truth stays sealed until the reveal.';
  $('theoryForm').querySelector('button').textContent = state.theory ? 'Update my theory' : 'Save my theory';
}
function renderSearch() {
  if (!state.rooms?.length) return; if (!state.rooms.some(r => r.id === selectedRoom)) selectedRoom = state.rooms[0].id;
  $('rooms').replaceChildren(); state.rooms.forEach(r => { const b = make('button',r.name); b.classList.toggle('active',r.id === selectedRoom); b.setAttribute('aria-pressed',String(r.id === selectedRoom)); b.onclick = () => { selectedRoom = r.id; zoom = 1; renderSearch(); }; $('rooms').append(b); });
  const flagship=state.caseId==='night-train-investigation';$('roomMapDetails').classList.toggle('records-only',flagship);$('roomMapDetails').querySelector('summary').textContent=flagship?'Choose an evidence location':'Explore the rooms · optional';
  const room = state.rooms.find(r => r.id === selectedRoom), objects = (state.objects || []).filter(o => o.room === selectedRoom);
  $('roomName').textContent = room.name; $('roomArt').src = caseArt(room.art); $('roomArt').alt = room.name + (midnight()?' in '+(state.caseTitle||'the case'):' at Blackthorn Manor'); $('scene').style.width = zoom * 100 + '%';
  $('searchCount').textContent = (state.searched?.length || 0) + (state.mode === 'solo' ? ' clues collected this scene' : ' / 3 discoveries this scene'); $('leadBudget').hidden=!midnight()||!state.leadBudget;$('leadBudget').textContent=state.leadBudget?`${state.leadBudget.remaining} optional leads left · Shared by your crew. Essential clues are free.`:'';$('hotspots').replaceChildren(); $('objectList').replaceChildren();
  const availableCore=midnight()?(state.publicClues||[]).filter(e=>e.chapter===state.chapter):[],recommendation=availableCore.find(e=>!readDeskRecords.has(code+':'+state.game+':'+e.id))||availableCore[0];$('openDeskPhone').hidden=!midnight()||state.display||['sunken-observatory','night-train-investigation'].includes(state.caseId);$('recommendedClue').hidden=!recommendation||state.display;if(recommendation){$('recommendedClue').textContent='Read this first: '+recommendation.title+' →';$('recommendedClue').onclick=()=>{inspectId=recommendation.id;readDeskRecords.add(code+':'+state.game+':'+recommendation.id);fillInspection();$('inspect').showModal();renderSearch();sound.cue('paper')}}const limit = !midnight() && state.mode !== 'solo' && (state.searched?.length || 0) >= 3;
  $('searchHelp').textContent = state.paused ? 'The room is paused. Your discoveries are safe.' : state.phase !== 'investigate' ? 'Searches open during investigation scenes. You can still review your evidence.' : limit ? 'Your three discoveries are collected. Share them, compare the records, or ask another player to inspect a new clue.' : objects.length ? (state.mode === 'solo' ? 'Every available record is yours to inspect. Follow a detail that catches your eye.' : state.dossierVersion?'Inspect the records and share discoveries with your crew. Essential evidence is available to everyone.':'Collect up to three new records this scene. Split the rooms with your crew and compare what you find.') : 'No records are available in this room yet. Try another room.';
  objects.forEach((o,i) => {
    const inspect = async () => { if (!o.collected && !await act('inspect',{id:o.id})) return; inspectId = o.id; fillInspection(); $('inspect').showModal(); sound.cue('paper'); };
    const unavailable = state.paused || (!o.collected && (limit || isAway()));
    const list = make('button',o.title + (o.collected ? ' ✓' : Number(o.cost)>0?' · '+o.cost+' optional lead':''),'object-record'); list.classList.toggle('premium-lead',Number(o.cost)>0);list.disabled = unavailable; list.onclick = inspect; $('objectList').append(list);
  });
}
function pin(id) { pinned = pinned.includes(id) ? pinned.filter(x => x !== id) : [...pinned.slice(-1),id]; renderEvidence(); if ($('inspect').open) fillInspection(); }
function renderEvidence() {
  $('evidenceCards').replaceChildren(); const clues = allClues(); if (!clues.length) $('evidenceCards').append(make('p',midnight()?'Your board is waiting. Inspect a case record and bring something worth discussing.':'Your board is waiting. Enter the manor and inspect a marked object.','empty-state'));
  clues.forEach(e => {
    const card = make('article','','evidence-card'), shared = state.publicClues.some(x => x.id === e.id), open = make('button','Inspect record'), select = make('button',pinned.includes(e.id) ? 'Pinned ✓' : 'Pin to compare');
    open.onclick = () => { inspectId = e.id; fillInspection(); $('inspect').showModal(); sound.cue('paper'); }; select.classList.toggle('pinned',pinned.includes(e.id)); select.onclick = () => pin(e.id);
    card.append(make('p',(shared ? 'SHARED WITH ROOM' : 'YOUR DISCOVERY') + ' · ACT ' + e.chapter),make('h3',e.title),make('span',e.kind,'record-kind'),open,select); $('evidenceCards').append(card);
  });
  $('compareButton').textContent = 'Compare selected (' + pinned.length + ' / 2)'; $('compareButton').disabled = pinned.length !== 2;
  $('hintText').textContent = midnight()?(state.difficulty==='expert'?'Correct each device clock before comparing a guest’s alibi with the incident window. Check the method and location too; naming a suspicious guest is only the beginning.':'Compare each verified record with the incident window. Find who is not accounted for, then prove the location and method with a record you found or shared. Credits buy optional leads; all essential proof remains available without them.'):state.difficulty === 'expert' || state.flowVersion !== 2 ? 'Compare a recording with its clock-reference document. Subtract the device offset to recover police reference time, then compare the corrected interval with the attack. A familiar face in an earlier clip is not an alibi.' : 'The records share the police clock. Compare each recorded interval with the attack window. A guest must be visible throughout the attack to have a verified alibi. A motive alone does not prove guilt.';
}
function fillInspection() {
  const previous = $('inspectTitle').dataset.clue, detail = $('inspectDetail').textContent, e = allClues().find(e => e.id === inspectId); if (!e) return;
  $('inspectType').textContent = e.kind; $('inspectTitle').textContent = e.title; $('inspectTitle').dataset.clue = e.id; $('inspectText').textContent = e.text; $('inspectionPoints').replaceChildren();
  $('evidencePuzzle').hidden=!e.puzzle||state.display;if(e.puzzle){$('evidencePuzzle').dataset.id=e.puzzle.id;$('evidencePuzzlePrompt').textContent=e.puzzle.prompt;if(previous!==e.id){$('evidencePuzzleAnswer').value='';$('evidencePuzzleStatus').textContent=''}}
  $('recordExhibit').replaceChildren();$('recordExhibit').hidden=!e.exhibit;if(e.exhibit){const table=make('table'),head=make('thead'),tr=make('tr');for(const col of e.exhibit.columns){const th=make('th',col);th.scope='col';tr.append(th)}head.append(tr);table.append(head);const body=make('tbody');for(const row of e.exhibit.rows){const line=make('tr');for(const cell of row)line.append(make('td',String(cell)));body.append(line)}table.append(body);$('recordExhibit').append(make('p','ORIGINAL EXHIBIT · '+e.id.toUpperCase(),'eyebrow'),table)}
  renderPhoto(e);(e.inspect||[]).forEach(point => { const b = make('button',point.label); b.onclick = () => { $('inspectDetail').textContent = point.text; sound.cue('clue'); }; $('inspectionPoints').append(b); });
  $('inspectDetail').textContent = previous === e.id ? detail : 'Select a detail to examine.';
  $('shareClue').hidden = state.display || state.publicClues.some(x => x.id === e.id) || !state.discovered.some(x => x.id === e.id); $('shareClue').disabled = busy || state.paused || isAway(); $('pinClue').textContent = pinned.includes(e.id) ? 'Pinned for comparison ✓' : 'Pin for comparison'; if (previous !== e.id) $('inspectionMessage').textContent = '';
}
function privateRole() {
  const p = state.privateRole; if (!p || state.display) return;
  $('roleTitle').textContent = p.name + ' · ' + p.title; $('roleIdentity').textContent = state.cooperative ? 'You are an investigator. None of you are suspects.' : p.guilty ? 'You committed the murder.' : 'You are innocent of the murder.';
  $('roleSecretLabel').textContent = state.cooperative ? 'Your tools' : 'Your secret'; $('roleIntro').textContent = p.intro; $('roleSecret').textContent = p.secret; $('roleAlibi').textContent = p.alibi; $('roleTruth').textContent = p.truth; $('privateRole').showModal();
}
function renderWorkingTheory(){const visible=midnight()&&!state.display;$('myTheoryDetails').hidden=!visible;if(!visible)return;const key=code+':'+state.game,current=state.workingTheory||{};if(workingTheoryKey!==key){workingTheoryKey=key;workingTheoryDirty=false}const selected=workingTheoryDirty?$('workingSuspect').value:current.suspect||'';$('workingSuspect').replaceChildren(new Option('No suspect yet',''));cast().forEach(p=>$('workingSuspect').append(new Option(p.character.name,p.id)));$('workingSuspect').value=selected;if(!workingTheoryDirty)$('workingWhy').value=current.text||'';$('workingTheoryForm').querySelector('button').disabled=busy||state.paused||isAway();}
function renderPhoto(clue){const photo=clue.photo;$('photoEvidence').hidden=!photo;if(!photo)return;if(photoClue!==clue.id){photoClue=clue.id;photoZoom=1;photoHints=false}const asset=safeCaseArt(photo.asset,'');if(!asset){$('photoEvidence').hidden=true;return}$('cluePhoto').src=asset;$('cluePhoto').alt=photo.caption||clue.title;$('photoCaption').textContent=photo.caption||'Inspect the photograph';$('photoDetails').replaceChildren();$('photoDetails').hidden=true;$('photoHintToggle').hidden=!photo.details?.length;paintPhotoText(photo);paintPhotoZoom()}
function paintPhotoText(photo){$('photoHintToggle').setAttribute('aria-expanded',String(photoHints));$('photoHintToggle').textContent=photoHints?'Hide image text':'Read image text';$('photoDetailText').textContent=photoHints?(photo.details||[]).map(p=>p.label+': '+p.text).join('\n\n'):'Zoom and pan the photo. Image text is available if you need an accessible transcription.'}
function paintPhotoZoom(){$('photoCanvas').style.width=photoZoom*100+'%';$('photoZoomLabel').textContent=Math.round(photoZoom*100)+'%';$('photoZoomOut').disabled=photoZoom<=1;$('photoZoomIn').disabled=photoZoom>=3}
function showCall(){const service=state?.callService,phone=service?.phone,ready=!!service?.ready&&typeof phone==='string'&&/^\+[1-9]\d{6,14}$/.test(phone);$('archiveCallInstructions').hidden=!ready;if(ready){$('archivePhoneLink').href='tel:'+phone;$('archivePhoneLink').textContent='Call case archive · '+phone;$('archiveAccessCode').textContent=service.accessCode||'Open this case on your phone to view your code.'}else{$('archivePhoneLink').removeAttribute('href');$('archiveAccessCode').textContent=''}$('archiveLineStatus').textContent=ready?'Found an extension? Call the case archive and follow the recorded instructions.':'Phone line not connected yet. Preview the recording for testing.';$('deskPhoneForm').hidden=ready&&!service?.preview;$('dialDeskPhone').textContent='Preview recording for testing';const call=state?.lastCall;$('phoneTranscript').hidden=!call;if(call){$('phoneCaller').textContent=call.name+' · EXT '+call.number;$('phoneTranscriptText').textContent=call.transcript||''}}
function renderAccusation() {
  choices($('suspectChoice'),accusationCandidates().map(p => [p.id,p.character.name + (state.cooperative ? '' : ' · ' + p.name)])); choices($('sceneChoice'),state.rooms.filter(r => midnight() || ['study','conservatory','gallery'].includes(r.id)).map(r => [r.id,r.name])); choices($('methodChoice'),state.objectsToChoose.map(x => [x,x])); choices($('supportChoice'),(midnight()?allClues():state.publicClues).map(e => [e.id,e.title]));
  $('accuseForm').hidden = !!state.accusation || isAway(); $('accuseMessage').textContent = isAway() ? 'You are away. Rejoin before the reveal to seal an accusation and take part in the final vote.' : state.accusation ? 'Your accusation is sealed. Keep the conversation going while the others finish.' : state.accusationsReceived + ' / ' + participantCount() + ' accusations sealed.';
}
function renderCaseReview() {
  if (state.display) return;
  const answer = state.ending?.answer; if (!answer) return;
  const review = make('section','','case-review'); review.id = 'privateCaseReview'; review.append(make('p','FOR YOUR EYES ONLY','eyebrow'),make('h3','Your case review'));
  if (isAway()) review.append(make('p','You were away when the case closed. Your seat earned no points and was outside the final vote.'));
  else if (state.privateRole?.guilty) review.append(make('p',state.ending.caught ? 'The room identified you. Your objective was to escape the majority accusation.' : 'You escaped the majority accusation and earned 500 points.'));
  if (state.accusation) {
    const chosen = state.accusation, list = make('dl','','case-review-answers');
    for (const [label,actual,expected,chosenText,answerText] of [
      ['Who',chosen.suspect,answer.suspectId,cast().find(p => p.id === chosen.suspect)?.character.name,answer.culprit],
      ['Where',chosen.scene,answer.sceneId,state.rooms.find(r => r.id === chosen.scene)?.name,answer.scene],
      ['How',chosen.object,answer.object,chosen.object,answer.object]
    ]) { const result = make('dd',(chosenText || 'No answer') + (actual === expected ? ' · Correct' : ' · The evidence showed ' + answerText)); result.dataset.correct = String(actual === expected); list.append(make('dt',label),result); }
    review.append(list);
    const support = allClues().find(e => e.id === chosen.evidence); if (support) review.append(make('p','Your supporting record: ' + support.title + '. Compare what it proves with the full reconstruction; no single record has to answer every part of the case.','field-help'));
  }
  const marked = cast().filter(p => state.deductions?.[p.id]);
  if (marked.length) { const detail = document.createElement('details'); detail.append(make('summary','Your deduction board at the close')); const list = document.createElement('ul'); marked.forEach(p => { const d = state.deductions[p.id], evidence = allClues().find(e => e.id === d.evidence); list.append(make('li',p.character.name + ' · ' + deductionLabels[d.status] + (evidence ? ' · ' + evidence.title : ' · No record attached'))); }); detail.append(list); review.append(detail); }
  const notes = $('notes').value; if (notes) { const detail = document.createElement('details'); detail.append(make('summary','Your private notes' + (notesDirty ? ' · unsaved draft' : '')),make('p',notes,'review-notes')); review.append(detail); }
  $('revealSteps').append(review);
}
function renderEnding() {
  rememberPlayedCase();const e = state.ending || {}, step = state.revealStep ?? 4; $('ending').dataset.step = String(step); $('revealProgress').replaceChildren();
  revealLabels.forEach((label,i) => { const li = make('li',label,i < step ? 'complete' : i === step ? 'current' : ''); if (i === step) li.setAttribute('aria-current','step'); $('revealProgress').append(li); });
  $('incidentReport').hidden=true;$('revealSteps').replaceChildren(); $('results').replaceChildren(); $('results').hidden = $('scoringNote').hidden = step < 4;
  $('again').hidden = !state.host || step < 4;$('again').textContent=midnight()?'Replay this case with this crew':'Another Blackthorn case with this crew'; $('revealNext').hidden = !state.host || step >= 4; $('revealNext').textContent = ['Reconstruct the crime','Name the culprit','Hear the full story','Show the results'][step] || '';
  $('revealWait').textContent = step < 4 && !state.host ? 'Your host will turn the next page.' : ''; $('endingEyebrow').textContent = (midnight()?((state.caseTitle||'THE CASE').toUpperCase()+' · '):'THE TRUTH AT BLACKTHORN · ') + (step + 1) + ' / 5';
  if (step === 0) {
    $('endingTitle').textContent = 'Every accusation is sealed.'; $('endingText').textContent = 'The room has made its choice. Before the name, follow what the evidence can prove.'; $('revealSteps').append(make('div','The last alibi is about to fall.','sealed-envelope'));
  } else if (step === 1) {
    $('endingTitle').textContent = 'Reconstruct the missing minutes.'; const a = e.answer || {};
    $('endingText').textContent = (midnight()?'The incident happened in ':'The attack happened in ') + (a.scene?.toLowerCase() || (midnight()?'the location':'the manor')) + ' during ' + (a.time || 'the incident window') + '. The method: ' + (a.object || 'the method in the forensic report') + '.';
    const grid = make('div','','timeline-grid');
    (e.timeline || []).forEach(t => { const card = make('article','','timeline-card'); card.append(make('p',t.source,'eyebrow'),make('h3',t.referenceStart + '–' + t.referenceEnd),make('p',t.offsetMinutes ? 'Device ' + t.deviceStart + '–' + t.deviceEnd + ' · subtract ' + t.offsetMinutes + ' minutes.' : midnight()?'The device and case reference clocks agree.':'The device and police reference clocks agree.'),make('p','Verified elsewhere: ' + (t.cleared.join(', ') || 'no guest') + '.')); grid.append(card); });
    $('revealSteps').append(grid); if (e.decoy) $('revealSteps').append(make('p',e.decoy.explanation,'reveal-note'));
  } else if (step === 2) {
    $('endingTitle').textContent = e.culprit || e.answer?.culprit || 'The culprit is revealed.';
    $('endingText').textContent = midnight()?(e.caught?'Your crew identified the culprit and proved the location and method. An unusually competent piece of investigating.':'The evidence has an explanation, but your crew did not prove the complete case. The records below show what happened.'):e.caught ? 'The room identified the murderer. Blackthorn’s last alibi has fallen.' : state.cooperative ? 'The room did not reach a majority on the murderer. The evidence still tells one story.' : 'The murderer escaped the room’s vote. The evidence now tells the truth.';
    if (!state.cooperative && e.playerName) $('revealSteps').append(make('p','Played by ' + e.playerName,'culprit-player')); $('revealSteps').append(make('p',midnight()?'One guest was absent from the verified alibis during the incident. The location and method still needed their own proof.':'One guest was absent from every verified alibi during the attack.','reveal-note'));
  } else if (step === 3) {
    $('endingTitle').textContent = 'How the truth fits together.'; $('endingText').textContent = e.story || '';
    for(const connection of e.reconstruction||[]){const detail=make('details');detail.append(make('summary','Packet '+connection.packet+' · '+connection.title),make('p','Established: '+connection.answer),make('p','Supporting records: '+connection.records.join(' · ')));$('revealSteps').append(detail)}
    for (const id of ['window','object','reconstruction']) { const record = e.evidence?.find(r => r.id === id); if (!record) continue; const detail = document.createElement('details'); detail.append(make('summary',record.title),make('p',record.text)); $('revealSteps').append(detail); }
  } else {
    $('endingTitle').textContent = e.caught ? 'Case closed.' : 'The truth is on the table.'; $('endingText').textContent = (e.culprit || e.answer?.culprit || 'The culprit') + ' was responsible. Every conclusion now has its evidence.';
    const ordered = [...state.players].sort((a,b) => (b.score || 0) - (a.score || 0)); ordered.forEach(p => { const rank = ordered.findIndex(x => x.score === p.score) + 1, li = document.createElement('li'); li.append(make('span',String(rank),'rank'),make('span',p.name + (p.killer ? ' · Murderer' : '') + (p.away ? ' · Away' : '')),make('strong',(p.score || 0) + ' points')); $('results').append(li); });
    renderCaseReview();if(midnight()&&e.report){$('incidentReport').hidden=false;$('incidentReport').querySelector('.eyebrow').textContent=(state.caseTitle||'CASE').toUpperCase()+' · INCIDENT REPORT';$('incidentReportText').textContent=typeof e.report==='string'?e.report:e.report.summary||e.report.text||'';}
    if (e.theoryFeedback?.length) { const detail = document.createElement('details'); detail.append(make('summary','Your private theory trail')); e.theoryFeedback.forEach(t => detail.append(make('p','Scene ' + (t.chapter + 1) + ': ' + (cast().find(p => p.id === t.suspect)?.character.name || 'Your suspect') + ' · ' + (t.evidenceTitle || 'Your record') + '. ' + (t.correctSuspect ? 'You had the culprit.' : 'Your theory pointed elsewhere.')))); $('revealSteps').append(detail); }
    if (e.story && !state.display) { const detail = document.createElement('details'); detail.append(make('summary','Read the complete explanation'),make('p',e.story)); $('revealSteps').append(detail); }
  }
}
function renderBoard() {
  if (!state.display) return; const nextSignature = JSON.stringify(state.publicClues);
  if (nextSignature !== boardSignature) {
    boardSignature = nextSignature;
    boardRecords = state.publicClues.flatMap(e => {
      const parts = []; let content = '';
      const limit = innerWidth <= 1100 ? 260 : 440;
      for (const word of e.text.split(' ')) { if (content.length + word.length > limit) { parts.push(content); content = ''; } content += (content ? ' ' : '') + word; }
      if (content) parts.push(content); return parts.map((text,i) => ({...e,text,title:e.title + (parts.length > 1 ? ' · ' + (i + 1) + ' / ' + parts.length : '')}));
    });
    boardIndex = Math.max(0,boardRecords.length - 1); boardChanged = Date.now();
  }
  paintBoard();
}
function paintBoard() {
  const e = boardRecords[boardIndex]; $('tvClueTitle').textContent = e?.title || 'The evidence board is waiting.';
  $('tvClueText').textContent = e?.text || 'Search on your phones. Share a record to bring it onto this board. The room’s private roles and theories stay on each player’s phone.';
  $('tvClueIndex').textContent = e ? 'Record ' + (boardIndex + 1) + ' of ' + boardRecords.length : 'Your next discovery belongs here.';
  $('tvPrevious').disabled = $('tvNext').disabled = boardRecords.length < 2; $('tvAuto').textContent = boardAuto ? 'Pause board' : 'Resume board'; $('tvAuto').setAttribute('aria-pressed',String(boardAuto));
}
function narrationScene() {
  if (state.phase === 'ended') { const step = state.revealStep ?? 4; return {key:'truth-' + step,text:$('endingTitle').textContent + ' ' + $('endingText').textContent,cue:step === 2 ? 'reveal' : step === 0 ? 'transition' : ''}; }
  if (state.phase === 'lobby'&&midnight())return {key:'midnight-invitation',text:'Welcome to '+(state.caseTitle||'Last Alibi')+'. Gather your investigators, compare your records, and keep three optional leads for the details that matter.',cue:''};
  if (state.phase === 'lobby') return {key:'invitation',text:'Welcome to Blackthorn Manor. Gather your players, read the mode, and take your seat. The host opens the mystery when everyone is ready.',cue:''};
  const objective = currentObjective(); return {key:'scene-' + state.chapter + '-' + state.phase,text:state.phase === 'accuse' ? objective.title + '. ' + objective.instruction : state.chapterInfo.title + '. ' + state.chapterInfo.story + ' ' + objective.instruction,cue:'transition'};
}
function tick() {
  if (!state) return;
  const now = state.paused ? state.pausedAt : Date.now() + offset, seconds = Math.max(0,Math.ceil((state.deadline - now) / 1000));
  $('clock').textContent = ['lobby','ended'].includes(state.phase) ? '—' : seconds ? Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2,'0') : 'Take your time';
  if(state.dossierVersion)$('clock').textContent='No limit';
  $('clockLabel').textContent = state.dossierVersion?'PROGRESS SAVED':state.paused ? 'ROOM PAUSED' : state.guided ? 'SUGGESTED PACE' : 'SCENE REMAINING'; $('clock').classList.toggle('pace-elapsed',seconds === 0 && !['lobby','ended'].includes(state.phase));
  $('privateResume').hidden=!!state.display||!token();$('saveUntil').textContent=state.expiresAt?'Saved until '+new Date(state.expiresAt).toLocaleString()+'.':'';
  const mine = state.players.find(p => p.you), active = !['lobby','ended'].includes(state.phase);
  $('ready').disabled = busy; $('ready').textContent = mine?.ready ? 'Ready ✓ · Tap to undo' : 'I’m ready';
  if(midnight())$('primaryAction').disabled=!state.caseObjective&&(busy||state.paused||state.display||isAway()||(state.phase==='accuse'&&!!state.accusation&&!(state.host&&state.pace?.canContinue))||(state.mode!=='solo'&&state.players.find(p=>p.you)?.chapterReady&&!state.pace?.canContinue&&state.phase!=='accuse'));$('start').disabled = busy || state.players.length < (state.mode === 'solo' ? 1 : state.mode === 'secret' ? 4 : 2) || !state.players.every(p => p.ready);
  $('caseObjectiveForm').querySelector('button[type=submit]').disabled=busy||state.paused||isAway();$('caseObjectiveHint').disabled=busy||state.paused||isAway()||state.caseObjective?.discovered===false||(state.caseObjective?.hints?.length||0)>=(state.dossierVersion>=3?3:2);
  $('evidencePuzzle').querySelector('button').disabled = busy || state.paused || isAway();
  $('workingTheoryForm').querySelector('button').disabled = busy || state.paused || isAway();
  $('pause').disabled = busy; $('pause').textContent = state.paused ? 'Resume' : 'Pause';
  const canContinue = state.pace ? state.pace.canContinue : !state.guided || (state.phase === 'accuse' ? state.accusationsReceived === state.players.length : state.players.every(p => p.chapterReady));
  $('continue').disabled = busy || state.paused || !canContinue; $('chapterReady').disabled = busy || state.paused || (state.pace ? !state.pace.canReady : false);
  $('accuseForm').querySelector('button').disabled = busy || state.paused || isAway() || (!state.guided && seconds === 0); $('theoryForm').querySelector('button').disabled = busy || state.paused || isAway(); $('confirmAccusation').disabled = busy || state.paused || isAway(); $('revealNext').disabled = busy;
  $('deductionForm').querySelector('button').disabled = busy || !canEditDeductions(); $('saveNotes').disabled = busy || !notesDirty; $('returnToCase').disabled = busy || state.paused;
  document.querySelectorAll('#guestSeats button').forEach(b => b.disabled = busy || state.paused || b.dataset.unavailable === 'true');
  document.querySelectorAll('.edit-deduction,.use-deduction').forEach(b => b.disabled = busy || !canEditDeductions());
  $('hostPace').hidden = !active; $('hostPace').textContent = state.dossierVersion&&state.phase==='investigate'?'The next packet stays sealed until your team proves the objective.':midnight()&&state.mode==='solo'&&!state.paused?'You set the pace. Continue case opens the next act.':state.paused ? 'The room is paused. Resume when everyone is back.' : state.pace?.nextAction || (canContinue ? 'Everyone is ready for the next scene.' : 'Waiting for everyone to finish this scene.');
  if (state.display && boardAuto && !state.paused && boardRecords.length > 1 && Date.now() - boardChanged > 18000) { boardIndex = (boardIndex + 1) % boardRecords.length; boardChanged = Date.now(); paintBoard(); }
  sound.update({...state,narrationScene:narrationScene()},now);
}

$('createForm').onsubmit = e => { e.preventDefault(); act('create',{caseId:$('caseId').value,name:$('createName').value.trim(),minutes:Number($('minutes').value),mode:$('mode').value,difficulty:$('difficulty').value}); };
function updateModeDescription(){const spec=caseCatalog.find(c=>c.id===$('caseId').value),quick=!!(spec?.shortCase||spec?.objectiveBased),packetCount=spec?.packets||6;$('modeDescription').textContent=quick?($('mode').value==='solo'?'One investigator. Find the next lead, inspect the documents, and prove each objective. '+packetCount+' sealed packets; no countdown.':'2–8 investigators. Split the evidence, share discoveries, and prove objectives together. '+packetCount+' sealed packets; no countdown.'):{together:'Investigate six fictional guests together. None of you is the killer.',solo:'One investigator, every clue. Follow the mystery at your own pace.',secret:'Become a guest at Blackthorn. One player is the murderer and may bluff. Best for a group comfortable playing a role.'}[$('mode').value]}
function chooseCase(){const clockCase=['midnight-desk','blackthorn'].includes($('caseId').value);$('difficulty').querySelector('[value=expert]').disabled=!clockCase;$('difficulty').disabled=!clockCase;if(!clockCase)$('difficulty').value='standard';const spec=caseCatalog.find(c=>c.id===$('caseId').value)||caseCatalog[0],quick=!!(spec.shortCase||spec.objectiveBased),secret=$('mode').querySelector('[value="secret"]'),previous=$('minutes').value;secret.disabled=!spec.modes.includes('secret');secret.textContent=secret.disabled?'Secret Killer · classic case only':'Secret Killer · 4–8 players';if(secret.disabled&&$('mode').value==='secret')$('mode').value='together';$('minutes').replaceChildren(...spec.minutes.map(n=>new Option(spec.objectiveBased?'Self-paced · no timer':n+' minutes',n)));$('minutes').value=spec.minutes.map(String).includes(previous)?previous:String(quick?spec.minutes[0]:spec.minutes.at(-1));document.body.dataset.case=quick?'midnight-desk':'blackthorn';$('coverArt').src=safeCaseArt(spec.art,quick?hotelArt:'./assets/last-alibi-cover-v1.png');$('coverArt').alt=spec.title+' — an original LINKS mystery';$('coverLabel').textContent='LAST ALIBI · '+spec.title.toUpperCase();$('coverTitle').replaceChildren(make('span',spec.id==='midnight-desk'?'The night shift.':quick?spec.title:'A room full of secrets.'),document.createElement('br'),make('span',spec.id==='midnight-desk'?'The excuses never sleep.':quick?'Every excuse has a crack.':'One missing alibi.'));$('coverDescription').textContent=spec.description;$('createForm').querySelector('h2').textContent='Start '+spec.title;$('minutes').closest('label').hidden=!!spec.objectiveBased;$('difficulty').closest('label').hidden=!clockCase;$('coverBadge').textContent=(spec.playerLabel||'1–8 investigators').toUpperCase()+(spec.objectiveBased?' · SOLVE OBJECTIVES · PHONES + OPTIONAL TV':' · '+spec.minutes.join('–')+' MINUTES · PHONES + OPTIONAL TV');$('caseDescription').textContent=spec.description;$('casePlayedNote').hidden=!playedCases().has(spec.id);for(const card of $('caseCards').children)card.setAttribute('aria-pressed',String(card.dataset.case===spec.id));updateModeDescription()}
const requestedCase=new URL(location.href).searchParams.get('case');
function renderCaseCatalog(){const selected=requestedCase||$('caseId').value;$('caseId').replaceChildren(...caseCatalog.map(c=>new Option(c.title+(c.objectiveBased?' · '+(c.packets||6)+' sealed packets':' · '+c.minutes.join('–')+' minutes'),c.id)));$('caseId').value=caseCatalog.some(c=>c.id===selected)?selected:caseCatalog[0].id;$('caseCards').replaceChildren();for(const c of caseCatalog){const card=make('button','','case-choice');card.type='button';card.dataset.case=c.id;card.setAttribute('aria-pressed',String(c.id===$('caseId').value));const art=document.createElement('img');art.src=safeCaseArt(c.art);art.alt='';art.loading='lazy';const copy=make('span','','case-choice-copy');if(playedCases().has(c.id))copy.append(make('small','ALREADY PLAYED ON THIS DEVICE','case-completed'));copy.append(make('strong',c.title),make('small',c.objectiveBased?((c.caseType||'CASE FILE').toUpperCase()+' · '+(c.packets||6)+' SEALED PACKETS · '+(c.exhibits||'20+')+' RECORDS'):c.shortCase?'QUICK CASE · '+c.minutes.join('–')+' MIN':'CLASSIC · '+c.minutes.join('–')+' MIN'),make('span',c.description),make('small',(c.playerLabel||'1–8 investigators')+(['midnight-desk','blackthorn'].includes(c.id)?' · Standard or Expert':' · Evidence investigation')));card.append(art,copy);card.onclick=()=>{$('caseId').value=c.id;if(!code){const u=new URL(location.href);u.searchParams.set('case',c.id);history.replaceState(null,'',u)}chooseCase();$('createForm').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})};$('caseCards').append(card)}$('caseLibrary').hidden=true;filterCases();chooseCase();if(state)render()}
function filterCases(){const term=$('caseSearch').value.trim().toLocaleLowerCase();let visible=0;for(const card of $('caseCards').children){const c=caseCatalog.find(c=>c.id===card.dataset.case),matches=!term||[c?.title,c?.description,c?.theme,c?.id].filter(Boolean).join(' ').toLocaleLowerCase().includes(term);card.hidden=!matches;if(matches)visible++}$('caseSearchEmpty').hidden=visible>0}
$('caseSearch').oninput=filterCases;
async function loadCaseCatalog(){try{const r=await fetch('./api/last-alibi?action=cases',{cache:'no-store',signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error();const j=await r.json();if(!Array.isArray(j.cases)||!j.cases.length)throw Error();const valid=j.cases.filter(c=>typeof c.id==='string'&&typeof c.title==='string'&&Array.isArray(c.minutes)&&c.minutes.every(n=>Number.isFinite(n)&&n>0)&&Array.isArray(c.modes));if(!valid.length||setupCase&&!valid.some(c=>c.id===setupCase))throw Error();caseCatalog=valid;renderCaseCatalog();document.body.dataset.caseLoading='false';if(setupCase&&!code){$('message').textContent='';$('createForm').querySelector('button').disabled=false}}catch{if(setupCase&&!code){$('message').textContent='This case could not open. Return to All mysteries and choose your case again.';$('createForm').hidden=true;document.querySelector('#entry .cover').hidden=true;document.querySelector('#entry .how-to-play').hidden=true;document.body.dataset.caseLoading='false'}}}
$('caseId').onchange=chooseCase;$('mode').onchange=updateModeDescription;renderCaseCatalog();loadCaseCatalog();
$('joinForm').onsubmit = e => { e.preventDefault(); code = $('code').value.trim().toUpperCase(); act('join',{name:$('joinName').value.trim()}); };
$('ready').onclick = () => act('ready'); $('start').onclick = () => act('start'); $('pause').onclick = () => act('pause'); $('continue').onclick = () => act('continue'); $('again').onclick = () => act('again'); $('revealNext').onclick = () => act('reveal',{step:state.revealStep});
$('chapterReady').onclick = () => act('chapter-ready'); $('roleButton').onclick = $('notebookRole').onclick = privateRole; $('goSearch').onclick = () => showTab('search',true); $('openNotebook').onclick = () => showTab('notebook',true);
$('reviewDeductions').onclick = () => showTab('suspectPane',true); $('returnToCase').onclick = () => act('return');
for (const b of document.querySelectorAll('[data-tab]')) b.onclick = () => showTab(b.dataset.tab,true);
for (const b of document.querySelectorAll('[data-close]')) b.onclick = () => $(b.dataset.close).close();
$('shareClue').onclick = async () => { if (await act('share',{id:inspectId})) { $('inspectionMessage').textContent = 'Shared with the room.'; sound.cue('clue'); } };
$('pinClue').onclick = () => pin(inspectId);
$('compareButton').onclick = () => { $('compareDocs').replaceChildren(); pinned.forEach(id => { const e = allClues().find(e => e.id === id); if (!e) return; const doc = make('article','','document'); doc.append(make('p',e.kind,'stamp'),make('h2',e.title),make('p',e.text)); $('compareDocs').append(doc); }); $('compare').showModal(); };
$('zoomIn').onclick = () => { zoom = Math.min(2.5,zoom + .5); $('scene').style.width = zoom * 100 + '%'; }; $('zoomOut').onclick = () => { zoom = Math.max(1,zoom - .5); $('scene').style.width = zoom * 100 + '%'; };
$('notes').oninput = () => { notesDirty = $('notes').value !== (state.notes || ''); cacheNotes(); tick(); };
$('saveNotes').onclick = async () => { const text = $('notes').value; if (await act('notes',{text})) { notesDirty = $('notes').value !== text; cacheNotes(); tick(); } };
$('deductionForm').onsubmit = async e => { e.preventDefault(); if (await act('deduction',{suspect:deductionId,status:$('deductionStatus').value,evidence:$('deductionEvidence').value || null})) $('deduction').close(); };
$('theoryForm').onsubmit = async e => { e.preventDefault(); if (await act('theory',{suspect:$('theorySuspect').value,evidence:$('theoryEvidence').value})) sound.cue('ready'); };
$('accuseForm').onsubmit = e => { e.preventDefault(); $('accusationSummary').replaceChildren(); for (const [id,label] of [['suspectChoice','Who'],['sceneChoice','Where'],['methodChoice','How'],['supportChoice','Record']]) $('accusationSummary').append(make('dt',label),make('dd',$(id).selectedOptions[0]?.textContent || '')); $('sealAccusation').showModal(); };
$('confirmAccusation').onclick = async () => { if (await act('accuse',{suspect:$('suspectChoice').value,scene:$('sceneChoice').value,object:$('methodChoice').value,evidence:$('supportChoice').value})) { $('sealAccusation').close(); sound.cue('accusation'); } };
async function copy(value,id) { try { await navigator.clipboard.writeText(value); $(id).textContent = 'Link copied.'; } catch { $(id).textContent = value; } }
$('openDeskPhone').onclick=()=>{showCall();$('phoneStatus').textContent='';$('deskPhone').showModal();$('deskExtension').focus()};
$('deskPhoneForm').onsubmit=async e=>{e.preventDefault();if(busy)return;$('phoneStatus').textContent='Loading the recording preview…';$('dialDeskPhone').disabled=true;const ok=await act('dial',{number:$('deskExtension').value});$('dialDeskPhone').disabled=false;if(ok){showCall();$('phoneStatus').textContent='Recording transcript loaded. A private record was added to your evidence.';sound.cue('clue')}else $('phoneStatus').textContent=$('message').textContent||'Recording not found. Check the extension and the clue that supplied it.'};
$('photoHintToggle').onclick=()=>{photoHints=!photoHints;const clue=allClues().find(e=>e.id===inspectId);paintPhotoText(clue?.photo||{details:[]})};
$('photoZoomIn').onclick=()=>{photoZoom=Math.min(3,photoZoom+.5);paintPhotoZoom()};$('photoZoomOut').onclick=()=>{photoZoom=Math.max(1,photoZoom-.5);paintPhotoZoom()};$('photoReset').onclick=()=>{photoZoom=1;paintPhotoZoom()};
$('workingWhy').oninput=$('workingSuspect').onchange=()=>{workingTheoryDirty=true;$('workingTheoryStatus').textContent='Unsaved private draft.'};$('workingTheoryForm').onsubmit=async e=>{e.preventDefault();const ok=await act('case-theory',{suspect:$('workingSuspect').value||null,text:$('workingWhy').value});if(ok){workingTheoryDirty=false;$('workingTheoryStatus').textContent='Your private theory is saved.'}else $('workingTheoryStatus').textContent=$('message').textContent||'Your theory could not be saved. Try again.'};
$('shareReport').onclick=async()=>{const report=$('incidentReportText').textContent;if(!report)return;const link=new URL('./last-alibi.html',location.href).href;try{if(navigator.share){await navigator.share({title:'Last Alibi · Case incident report',text:report,url:link});$('reportShareStatus').textContent='Incident report shared.'}else{await navigator.clipboard.writeText(report+' '+link);$('reportShareStatus').textContent='Incident report copied.'}}catch(e){$('reportShareStatus').textContent=e.name==='AbortError'?'':'Sharing did not open. Please try again.'}};
$('copyResume').onclick=()=>copy(privateResumeLink(),'resumeStatus');
$('copy').onclick = () => copy(inviteLink(),'copyMessage'); $('tvButton').onclick = () => { $('tvLink').href = tvLink(); $('tv').showModal(); }; $('copyTv').onclick = () => copy(tvLink(),'tvMessage');
$('full').onclick = async () => { try { await document.documentElement.requestFullscreen(); } catch { $('message').textContent = 'Use your browser’s full screen option.'; } };
$('tvPrevious').onclick = () => { boardIndex = (boardIndex - 1 + boardRecords.length) % boardRecords.length; boardChanged = Date.now(); paintBoard(); }; $('tvNext').onclick = () => { boardIndex = (boardIndex + 1) % boardRecords.length; boardChanged = Date.now(); paintBoard(); }; $('tvAuto').onclick = () => { boardAuto = !boardAuto; boardChanged = Date.now(); paintBoard(); };
async function poll() {
  if (code && (displayKey || token()) && !busy && !document.hidden) { const gen = ++generation; try { const j = await api(); if (gen === generation) { adopt(j); $('message').textContent = ''; } } catch (e) { if (gen === generation) requestFailed(e); } }
  setTimeout(poll,2000);
}
if (code) { $('code').value = code; $('createForm').hidden = true; document.querySelector('.cover').hidden = true; document.querySelector('.how-to-play').hidden = true; document.querySelector('.rules').hidden = true; $('entry').classList.add('invited'); $('joinRoomIntro').textContent = 'Your seat is waiting in room ' + code + '. Enter your name to join the mystery.'; $('roomCodeLabel').hidden = true; $('joinName').focus(); }
if (displayKey) { $('entry').hidden = true; $('full').hidden = false; $('message').textContent = 'Opening the crime board…'; }
mountInviteShare({anchor:$('copy'),getUrl:inviteLink,title:'Last Alibi'}); setInterval(tick,250); poll();

$('evidencePuzzle').onsubmit=async event=>{event.preventDefault();const ok=await act('solve-puzzle',{id:$('evidencePuzzle').dataset.id,answer:$('evidencePuzzleAnswer').value});$('evidencePuzzleStatus').textContent=ok?'Case opened. The sealed record is in your private evidence notebook. Share it when ready.':$('message').textContent||'Check the source records and try again.';if(ok)sound.cue('clue')};

function renderCaseObjective(){
 const g=state.caseObjective,form=$('caseObjectiveForm');form.hidden=!g||state.display;if(!g)return;
 const packetKey=String(g.id)+':'+state.game+':'+String(g.discovered)+':'+(g.fields||[]).map(f=>f.id).join(','),changed=form.dataset.packet!==packetKey,structured=Array.isArray(g.fields)&&g.fields.length>0,discovered=g.discovered!==false;
 if(changed){form.dataset.packet=packetKey;$('caseObjectiveAnswer').value='';for(const id of ['caseObjectiveProof1','caseObjectiveProof2','caseObjectiveProof3'])$(id).value='';$('caseObjectiveStatus').textContent='';$('caseObjectiveFields').replaceChildren();for(const field of g.fields||[]){const label=make('label',field.label),input=document.createElement('input');input.dataset.objectiveField=field.id;input.id='objective-'+field.id;input.maxLength=80;input.autocomplete='off';input.required=true;input.placeholder=field.type==='time'?'For example, 21:30':field.type==='set'?'Separate entries with commas':field.type==='code'?'Enter the code':'Enter your deduction';if(field.type==='code'||field.type==='time')input.inputMode='text';label.append(input);$('caseObjectiveFields').append(label)}}
 $('caseObjectiveFields').hidden=!structured||!discovered;$('legacyObjectiveLabel').hidden=structured||!discovered;$('caseObjectiveAnswer').required=!structured&&discovered;$('caseObjectiveAnswer').disabled=structured||!discovered;for(const input of $('caseObjectiveFields').querySelectorAll('input'))input.disabled=!discovered;
 for(const id of ['caseObjectiveProof1','caseObjectiveProof2','caseObjectiveProof3']){const input=$(id),chosen=input.value;input.closest('label').hidden=!discovered;input.disabled=!discovered;input.replaceChildren(new Option(id==='caseObjectiveProof3'?'No third record':'Choose a record you inspected',''),...allClues().map(e=>new Option(e.title,e.id)));input.value=chosen}
 form.querySelector('button[type=submit]').hidden=!discovered;$('caseObjectiveTitle').textContent=g.title;$('caseObjectivePrompt').textContent=g.prompt;$('caseObjectiveHints').replaceChildren(...(g.hints||[]).map(t=>make('p',t)));
 if(!discovered&&state.mode!=='solo')$('caseObjectiveStatus').textContent='Inspect the records. Share a lead to update the team objective.';
 $('primaryAction').textContent='Investigate this packet →';$('primaryAction').disabled=false;$('primaryAction').onclick=()=>showTab('search',true);$('chapterReady').hidden=true;$('continue').hidden=true;$('instruction').textContent='Find the connections yourself. Submit your deduction with supporting records to unseal more evidence.';$('readyCount').textContent='Packet '+g.packet+' / '+g.packets+' · Everyone shares progress. Optional hints never open a packet.';
}
$('caseObjectiveForm').onsubmit=async event=>{event.preventDefault();const fields=state.caseObjective?.fields,payload={evidence:[$('caseObjectiveProof1').value,$('caseObjectiveProof2').value,$('caseObjectiveProof3').value].filter(Boolean)};if(fields?.length){payload.answers={};for(const input of $('caseObjectiveFields').querySelectorAll('input'))payload.answers[input.dataset.objectiveField]=input.value.trim()}else payload.answer=$('caseObjectiveAnswer').value;const ok=await act('submit-objective',payload);$('caseObjectiveStatus').textContent=ok?'Deduction verified. The next evidence packet is now open.':$('message').textContent||'Recheck the records.';if(ok)sound.cue('clue')};
$('caseObjectiveHint').onclick=()=>act('objective-hint');

if(resumeImportError)$('message').textContent=resumeImportError;
