import {mountInviteShare} from './invite-share.mjs';
import {rememberPartySeat} from './party-score-link.mjs';
import qrcode from './vendor/qrcode.mjs';
import {mountMysteryAudio} from './last-alibi-audio.mjs?v=20261016b';

const $ = id => document.getElementById(id);
const sound = mountMysteryAudio($('soundToggle'), {narrationButton:$('narrationToggle'),voiceSelect:$('narrationVoice'),replayButton:$('replayNarration'),status:$('narrationStatus')});
let code = new URL(location.href).searchParams.get('room') || '';
const displayKey = new URLSearchParams(location.hash.slice(1)).get('display') || '';
let state = null, busy = false, offset = 0, signature = '', generation = 0;
let tab = 'story', selectedRoom = 'study', zoom = 1, inspectId = '', pinned = [];
let lastScene = '', lastGame = 0, theoryChapter = -1;
let deductionId = '', notesKey = '', notesDirty = false, notesCached = false;
let boardIndex = 0, boardAuto = true, boardChanged = 0, boardSignature = '', boardRecords = [];
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
  if (lastScene !== scene) { lastScene = scene; tab = j.phase === 'accuse' ? 'evidence' : 'story'; document.querySelectorAll('dialog[open]').forEach(d => d.close()); $('story').classList.remove('scene-arrived'); requestAnimationFrame(() => $('story').classList.add('scene-arrived')); }
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
  document.body.dataset.display = String(state.display); document.body.dataset.phase = state.phase; document.body.dataset.mode = state.mode || (state.cooperative ? 'together' : 'secret');
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
    $('tvStory').textContent = state.phase === 'accuse' ? objective.instruction : televisionScenes[state.chapter] || info.story; $('tvPrompt').textContent = objective.prompt || '';
    $('storyArt').src = $('tvArt').src = './assets/last-alibi-' + (['manor','dining','gate','music','study'][state.chapter] || 'manor') + '-v1.png';
  }
  $('goSearch').hidden = state.phase !== 'investigate'; $('roleButton').hidden = state.display; $('roleButton').textContent = state.cooperative ? 'Read my investigator brief' : 'Open my private role';
  renderSuspects(); renderSearch(); renderEvidence(); renderGuide(); renderTheory(); showTab(tab);
  if (state.phase === 'accuse') renderAccusation(); if (state.phase === 'ended') renderEnding();
  if ($('inspect').open && inspectId) fillInspection(); renderBoard();
}
function renderProgress() {
  const current = state.phase === 'ended' ? 6 : state.phase === 'accuse' ? 5 : state.chapter || 0; $('sceneProgress').replaceChildren();
  stages.forEach((title,i) => { const li = make('li',title,i < current ? 'complete' : i === current ? 'current' : ''); if (i === current) li.setAttribute('aria-current','step'); $('sceneProgress').append(li); });
}
function renderLobby() {
  $('invitation').hidden = state.mode === 'solo'; $('lobbyCode').textContent = code;
  $('modeNote').textContent = state.mode === 'solo' ? 'One investigator. Six fictional suspects. Inspect every clue and follow the case at your pace.' : state.mode === 'secret' ? '4–8 players. You each become a guest at Blackthorn. One of you will receive the killer role.' : '2–8 investigators. Work together to investigate six fictional guests. None of you is the killer.';
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
  $('stepLabel').textContent = state.phase === 'accuse' ? 'FINAL SCENE · YOUR LAST WORD' : 'SCENE ' + (state.chapter + 1) + ' OF 5 · YOUR NEXT MOVE'; $('objective').textContent = objective.title; $('instruction').textContent = objective.instruction;
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
  $('continue').textContent = state.phase === 'accuse' ? 'Open the truth' : 'Open next scene';
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
    if (deduction.status === 'suspected' && record && accusationCandidates().some(x => x.id === p.id) && (theory || accusation) && (!accusation || state.publicClues.some(e => e.id === record.id))) {
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
  const required = state.phase === 'investigate' && state.flowVersion === 2 && [2,4].includes(state.chapter); $('theoryCheckpoint').hidden = state.display || !required; if (!required || state.display) return;
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
  const room = state.rooms.find(r => r.id === selectedRoom), objects = (state.objects || []).filter(o => o.room === selectedRoom);
  $('roomName').textContent = room.name; $('roomArt').src = './assets/last-alibi-' + room.art + '-v1.png'; $('roomArt').alt = room.name + ' at Blackthorn Manor'; $('scene').style.width = zoom * 100 + '%';
  $('searchCount').textContent = (state.searched?.length || 0) + (state.mode === 'solo' ? ' clues collected this scene' : ' / 3 discoveries this scene'); $('hotspots').replaceChildren(); $('objectList').replaceChildren();
  const limit = state.mode !== 'solo' && (state.searched?.length || 0) >= 3;
  $('searchHelp').textContent = state.paused ? 'The room is paused. Your discoveries are safe.' : state.phase !== 'investigate' ? 'Searches open during investigation scenes. You can still review your evidence.' : limit ? 'Your three discoveries are collected. Share them, compare the records, or ask another player to inspect a new clue.' : objects.length ? (state.mode === 'solo' ? 'Every available record is yours to inspect. Follow a detail that catches your eye.' : 'Collect up to three new records this scene. Split the rooms with your crew and compare what you find.') : 'No records are available in this room yet. Try another room.';
  objects.forEach((o,i) => {
    const inspect = async () => { if (!o.collected && !await act('inspect',{id:o.id})) return; inspectId = o.id; fillInspection(); $('inspect').showModal(); sound.cue('paper'); };
    const b = make('button',o.collected ? '✓' : String(i + 1),'hotspot'); b.style.left = [27,65,44,80][i % 4] + '%'; b.style.top = [65,55,35,72][i % 4] + '%'; b.setAttribute('aria-label','Inspect ' + o.title); b.disabled = state.paused || (!o.collected && (limit || isAway())); b.onclick = inspect; $('hotspots').append(b);
    const list = make('button',o.title + (o.collected ? ' ✓' : ''),'object-record'); list.disabled = b.disabled; list.onclick = inspect; $('objectList').append(list);
  });
}
function pin(id) { pinned = pinned.includes(id) ? pinned.filter(x => x !== id) : [...pinned.slice(-1),id]; renderEvidence(); if ($('inspect').open) fillInspection(); }
function renderEvidence() {
  $('evidenceCards').replaceChildren(); const clues = allClues(); if (!clues.length) $('evidenceCards').append(make('p','Your board is waiting. Enter the manor and inspect a marked object.','empty-state'));
  clues.forEach(e => {
    const card = make('article','','evidence-card'), shared = state.publicClues.some(x => x.id === e.id), open = make('button','Inspect record'), select = make('button',pinned.includes(e.id) ? 'Pinned ✓' : 'Pin to compare');
    open.onclick = () => { inspectId = e.id; fillInspection(); $('inspect').showModal(); sound.cue('paper'); }; select.classList.toggle('pinned',pinned.includes(e.id)); select.onclick = () => pin(e.id);
    card.append(make('p',(shared ? 'SHARED WITH ROOM' : 'YOUR DISCOVERY') + ' · ACT ' + e.chapter),make('h3',e.title),make('span',e.kind,'record-kind'),open,select); $('evidenceCards').append(card);
  });
  $('compareButton').textContent = 'Compare selected (' + pinned.length + ' / 2)'; $('compareButton').disabled = pinned.length !== 2;
  $('hintText').textContent = state.difficulty === 'expert' || state.flowVersion !== 2 ? 'Compare a recording with its clock-reference document. Subtract the device offset to recover police reference time, then compare the corrected interval with the attack. A familiar face in an earlier clip is not an alibi.' : 'The records share the police clock. Compare each recorded interval with the attack window. A guest must be visible throughout the attack to have a verified alibi. A motive alone does not prove guilt.';
}
function fillInspection() {
  const previous = $('inspectTitle').dataset.clue, detail = $('inspectDetail').textContent, e = allClues().find(e => e.id === inspectId); if (!e) return;
  $('inspectType').textContent = e.kind; $('inspectTitle').textContent = e.title; $('inspectTitle').dataset.clue = e.id; $('inspectText').textContent = e.text; $('inspectionPoints').replaceChildren();
  e.inspect.forEach(point => { const b = make('button',point.label); b.onclick = () => { $('inspectDetail').textContent = point.text; sound.cue('clue'); }; $('inspectionPoints').append(b); });
  $('inspectDetail').textContent = previous === e.id ? detail : 'Select a detail to examine.';
  $('shareClue').hidden = state.display || state.publicClues.some(x => x.id === e.id) || !state.discovered.some(x => x.id === e.id); $('shareClue').disabled = busy || state.paused || isAway(); $('pinClue').textContent = pinned.includes(e.id) ? 'Pinned for comparison ✓' : 'Pin for comparison'; if (previous !== e.id) $('inspectionMessage').textContent = '';
}
function privateRole() {
  const p = state.privateRole; if (!p || state.display) return;
  $('roleTitle').textContent = p.name + ' · ' + p.title; $('roleIdentity').textContent = state.cooperative ? 'You are an investigator. None of you are suspects.' : p.guilty ? 'You committed the murder.' : 'You are innocent of the murder.';
  $('roleSecretLabel').textContent = state.cooperative ? 'Your tools' : 'Your secret'; $('roleIntro').textContent = p.intro; $('roleSecret').textContent = p.secret; $('roleAlibi').textContent = p.alibi; $('roleTruth').textContent = p.truth; $('privateRole').showModal();
}
function renderAccusation() {
  choices($('suspectChoice'),accusationCandidates().map(p => [p.id,p.character.name + (state.cooperative ? '' : ' · ' + p.name)])); choices($('sceneChoice'),state.rooms.filter(r => ['study','conservatory','gallery'].includes(r.id)).map(r => [r.id,r.name])); choices($('methodChoice'),state.objectsToChoose.map(x => [x,x])); choices($('supportChoice'),state.publicClues.map(e => [e.id,e.title]));
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
  const e = state.ending || {}, step = state.revealStep ?? 4; $('ending').dataset.step = String(step); $('revealProgress').replaceChildren();
  revealLabels.forEach((label,i) => { const li = make('li',label,i < step ? 'complete' : i === step ? 'current' : ''); if (i === step) li.setAttribute('aria-current','step'); $('revealProgress').append(li); });
  $('revealSteps').replaceChildren(); $('results').replaceChildren(); $('results').hidden = $('scoringNote').hidden = step < 4;
  $('again').hidden = !state.host || step < 4; $('revealNext').hidden = !state.host || step >= 4; $('revealNext').textContent = ['Reconstruct the crime','Name the culprit','Hear the full story','Show the results'][step] || '';
  $('revealWait').textContent = step < 4 && !state.host ? 'Your host will turn the next page.' : ''; $('endingEyebrow').textContent = 'THE TRUTH AT BLACKTHORN · ' + (step + 1) + ' / 5';
  if (step === 0) {
    $('endingTitle').textContent = 'Every accusation is sealed.'; $('endingText').textContent = 'The room has made its choice. Before the name, follow what the evidence can prove.'; $('revealSteps').append(make('div','The last alibi is about to fall.','sealed-envelope'));
  } else if (step === 1) {
    $('endingTitle').textContent = 'Reconstruct the missing minutes.'; const a = e.answer || {};
    $('endingText').textContent = 'The attack happened in ' + (a.scene?.toLowerCase() || 'the manor') + ' during ' + (a.time || 'the incident window') + '. The method: ' + (a.object || 'the method in the forensic report') + '.';
    const grid = make('div','','timeline-grid');
    (e.timeline || []).forEach(t => { const card = make('article','','timeline-card'); card.append(make('p',t.source,'eyebrow'),make('h3',t.referenceStart + '–' + t.referenceEnd),make('p',t.offsetMinutes ? 'Device ' + t.deviceStart + '–' + t.deviceEnd + ' · subtract ' + t.offsetMinutes + ' minutes.' : 'The device and police reference clocks agree.'),make('p','Verified elsewhere: ' + (t.cleared.join(', ') || 'no guest') + '.')); grid.append(card); });
    $('revealSteps').append(grid); if (e.decoy) $('revealSteps').append(make('p',e.decoy.explanation,'reveal-note'));
  } else if (step === 2) {
    $('endingTitle').textContent = e.culprit || e.answer?.culprit || 'The culprit is revealed.';
    $('endingText').textContent = e.caught ? 'The room identified the murderer. Blackthorn’s last alibi has fallen.' : state.cooperative ? 'The room did not reach a majority on the murderer. The evidence still tells one story.' : 'The murderer escaped the room’s vote. The evidence now tells the truth.';
    if (!state.cooperative && e.playerName) $('revealSteps').append(make('p','Played by ' + e.playerName,'culprit-player')); $('revealSteps').append(make('p','One guest was absent from every verified alibi during the attack.','reveal-note'));
  } else if (step === 3) {
    $('endingTitle').textContent = 'How the truth fits together.'; $('endingText').textContent = e.story || '';
    for (const id of ['window','object','reconstruction']) { const record = e.evidence?.find(r => r.id === id); if (!record) continue; const detail = document.createElement('details'); detail.append(make('summary',record.title),make('p',record.text)); $('revealSteps').append(detail); }
  } else {
    $('endingTitle').textContent = e.caught ? 'Case closed.' : 'The truth is on the table.'; $('endingText').textContent = (e.culprit || e.answer?.culprit || 'The culprit') + ' was responsible. Every conclusion now has its evidence.';
    const ordered = [...state.players].sort((a,b) => (b.score || 0) - (a.score || 0)); ordered.forEach(p => { const rank = ordered.findIndex(x => x.score === p.score) + 1, li = document.createElement('li'); li.append(make('span',String(rank),'rank'),make('span',p.name + (p.killer ? ' · Murderer' : '') + (p.away ? ' · Away' : '')),make('strong',(p.score || 0) + ' points')); $('results').append(li); });
    renderCaseReview();
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
  if (state.phase === 'lobby') return {key:'invitation',text:'Welcome to Blackthorn Manor. Gather your players, read the mode, and take your seat. The host opens the mystery when everyone is ready.',cue:''};
  const objective = currentObjective(); return {key:'scene-' + state.chapter + '-' + state.phase,text:state.phase === 'accuse' ? objective.title + '. ' + objective.instruction : state.chapterInfo.title + '. ' + state.chapterInfo.story + ' ' + objective.instruction,cue:'transition'};
}
function tick() {
  if (!state) return;
  const now = state.paused ? state.pausedAt : Date.now() + offset, seconds = Math.max(0,Math.ceil((state.deadline - now) / 1000));
  $('clock').textContent = ['lobby','ended'].includes(state.phase) ? '—' : seconds ? Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2,'0') : 'Take your time';
  $('clockLabel').textContent = state.paused ? 'ROOM PAUSED' : state.guided ? 'SUGGESTED PACE' : 'SCENE REMAINING'; $('clock').classList.toggle('pace-elapsed',seconds === 0 && !['lobby','ended'].includes(state.phase));
  const mine = state.players.find(p => p.you), active = !['lobby','ended'].includes(state.phase);
  $('ready').disabled = busy; $('ready').textContent = mine?.ready ? 'Ready ✓ · Tap to undo' : 'I’m ready';
  $('start').disabled = busy || state.players.length < (state.mode === 'solo' ? 1 : state.mode === 'secret' ? 4 : 2) || !state.players.every(p => p.ready);
  $('pause').disabled = busy; $('pause').textContent = state.paused ? 'Resume' : 'Pause';
  const canContinue = state.pace ? state.pace.canContinue : !state.guided || (state.phase === 'accuse' ? state.accusationsReceived === state.players.length : state.players.every(p => p.chapterReady));
  $('continue').disabled = busy || state.paused || !canContinue; $('chapterReady').disabled = busy || state.paused || (state.pace ? !state.pace.canReady : false);
  $('accuseForm').querySelector('button').disabled = busy || state.paused || isAway() || (!state.guided && seconds === 0); $('theoryForm').querySelector('button').disabled = busy || state.paused || isAway(); $('confirmAccusation').disabled = busy || state.paused || isAway(); $('revealNext').disabled = busy;
  $('deductionForm').querySelector('button').disabled = busy || !canEditDeductions(); $('saveNotes').disabled = busy || !notesDirty; $('returnToCase').disabled = busy || state.paused;
  document.querySelectorAll('#guestSeats button').forEach(b => b.disabled = busy || state.paused || b.dataset.unavailable === 'true');
  document.querySelectorAll('.edit-deduction,.use-deduction').forEach(b => b.disabled = busy || !canEditDeductions());
  $('hostPace').hidden = !active; $('hostPace').textContent = state.paused ? 'The room is paused. Resume when everyone is back.' : state.pace?.nextAction || (canContinue ? 'Everyone is ready for the next scene.' : 'Waiting for everyone to finish this scene.');
  if (state.display && boardAuto && !state.paused && boardRecords.length > 1 && Date.now() - boardChanged > 18000) { boardIndex = (boardIndex + 1) % boardRecords.length; boardChanged = Date.now(); paintBoard(); }
  sound.update({...state,narrationScene:narrationScene()},now);
}

$('createForm').onsubmit = e => { e.preventDefault(); act('create',{name:$('createName').value.trim(),minutes:Number($('minutes').value),mode:$('mode').value,difficulty:$('difficulty').value}); };
$('mode').onchange = () => { $('modeDescription').textContent = {together:'Investigate six fictional guests together. None of you is the killer.',solo:'One investigator, every clue. Follow the mystery at your own pace.',secret:'Become a guest at Blackthorn. One player is the murderer and may bluff. Best for a group comfortable playing a role.'}[$('mode').value]; };
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
