import qrcode from './vendor/qrcode.mjs';
import {rememberPartySeat} from './party-score-link.mjs';
import {updateVenueRoom} from './venue-link.mjs';

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chips = value => Number(value || 0).toLocaleString();
const url = new URL(location.href), isTv = url.searchParams.get('tv') === '1';
const displayKey = new URLSearchParams(url.hash.slice(1)).get('display') || '';
let code = (url.searchParams.get('room') || url.searchParams.get('code') || '').trim().toUpperCase();
let room = null, session = {}, busy = false, fetching = false, generation = 0, offset = 0, cardsHidden = false, raiseOpen = false, tableSignature = '', playerSignature = '', lastTurn = '', lastWin = '', connectionFailures = 0;
let muted = readStorage('links-poker-muted') === '1', audio = null, confirmResolve = null;
let rememberedCode = '', potSignature = '';
const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
function readStorage(key) { try { return localStorage.getItem(key); } catch { return null; } }
function writeStorage(key, value) { try { localStorage.setItem(key, value); } catch { /* The live seat still works without browser storage. */ } }
function note(text, error = false) { $('notice').textContent = text; $('notice').classList.toggle('error', error); $('notice').hidden = !text; }
function setHtml(id, html) { if ($(id).innerHTML !== html) $(id).innerHTML = html; }
function showPanel(name) { for (const id of ['welcome','setupPanel','joinPanel','room']) $(id).hidden = id !== name; if (name !== 'room') document.body.dataset.pokerTurn = 'false'; }
function now() { return Date.now() + offset; }
function seconds(until) { return Math.max(0, Math.ceil((Number(until) - now()) / 1000)); }
function timeLeft(until) { const s = seconds(until); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2,'0')}`; }
function nameOf(id) { return room?.players?.find(p => p.id === id)?.name || 'Player'; }
function myPlayer() { return room?.players?.find(p => p.id === session.playerId); }
function dateValue(value) { return typeof value === 'string' ? Date.parse(value) : Number(value || 0); }

function wakeAudio() {
  if (muted) return;
  try { const Context = window.AudioContext || window.webkitAudioContext; if (!audio && Context) audio = new Context(); if (audio?.state === 'suspended') void audio.resume(); } catch { /* Sound is optional. */ }
}
function sound(kind = 'click') {
  if (muted || !audio || audio.state !== 'running') return;
  const t = audio.currentTime;
  const tones = kind === 'turn' ? [[620,0,.1],[820,.13,.16]] : kind === 'win' ? [[440,0,.15],[554,.1,.16],[660,.2,.3]] : kind === 'deal' ? [[1800,0,.035],[1300,.04,.035]] : [[460,0,.04]];
  for (const [frequency, delay, duration] of tones) {
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.type = kind === 'deal' ? 'triangle' : 'sine'; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, t + delay); gain.gain.linearRampToValueAtTime(.07, t + delay + .008); gain.gain.exponentialRampToValueAtTime(.001, t + delay + duration);
    oscillator.connect(gain).connect(audio.destination); oscillator.start(t + delay); oscillator.stop(t + delay + duration + .02);
  }
}
document.addEventListener('pointerdown', wakeAudio, {passive:true});
document.addEventListener('keydown', wakeAudio);
function updateMute() { $('muteButton').textContent = muted ? 'Sound on' : 'Mute'; $('muteButton').setAttribute('aria-pressed', String(muted)); }
$('muteButton').onclick = () => { muted = !muted; writeStorage('links-poker-muted', muted ? '1' : '0'); updateMute(); if (!muted) { wakeAudio(); sound(); } };
updateMute();

const suitSymbols = {s:'♠',h:'♥',d:'♦',c:'♣'}, rankNames = {A:'Ace',K:'King',Q:'Queen',J:'Jack',T:'10'};
function cardData(value) {
  if (!value) return null;
  const raw = typeof value === 'string' ? value : `${value.rank || value.value || ''}${value.suit || ''}`;
  const match = raw.match(/^(10|[2-9TJQKA])([shdc])$/i);
  return match ? {rank:match[1].toUpperCase().replace('10','T'),suit:match[2].toLowerCase()} : null;
}
function cardHtml(value, {back = false, empty = false, animate = false, winning = false} = {}) {
  if (back) return '<span class="card back" role="img" aria-label="Hidden card"></span>';
  const card = cardData(value);
  if (!card || empty) return '<span class="card empty" aria-hidden="true"></span>';
  const suit = suitSymbols[card.suit], rank = card.rank === 'T' ? '10' : card.rank;
  const label = `${rankNames[card.rank] || rank} of ${{s:'spades',h:'hearts',d:'diamonds',c:'clubs'}[card.suit]}`;
  return `<span class="card ${'hd'.includes(card.suit) ? 'red' : ''} ${animate ? 'deal' : ''} ${winning ? 'winning' : ''}" role="img" aria-label="${label}${winning ? ', winning hand' : ''}"><span class="rank">${rank}</span><span class="suit">${suit}</span><span class="large-suit" aria-hidden="true">${suit}</span></span>`;
}
const hands = [
  ['Royal flush',['As','Ks','Qs','Js','Ts'],'Ace-high straight flush. The highest possible hand.'],
  ['Straight flush',['9h','8h','7h','6h','5h'],'Five consecutive cards of the same suit.'],
  ['Four of a kind',['Ac','Ad','Ah','As','Kd'],'Four cards of one rank, plus a kicker.'],
  ['Full house',['Kh','Ks','Kd','7c','7s'],'Three of one rank and two of another.'],
  ['Flush',['Ad','Jd','8d','6d','3d'],'Five cards of the same suit, not in sequence.'],
  ['Straight',['9s','8d','7h','6c','5s'],'Five consecutive ranks. An ace can be high or low.'],
  ['Three of a kind',['Qc','Qh','Qs','9d','4h'],'Three cards of one rank, plus two kickers.'],
  ['Two pair',['Js','Jh','6d','6c','As'],'Two different pairs, plus a kicker.'],
  ['One pair',['Th','Tc','As','8d','4s'],'Two cards of one rank, plus three kickers.'],
  ['High card',['Ac','Jd','8h','6s','3c'],'No higher combination. Compare highest cards, then kickers.'],
];
$('rankList').innerHTML = hands.map(([name,cards,description]) => `<li><h3>${name}</h3><div class="rank-cards">${cards.map(c => cardHtml(c)).join('')}</div><p>${description}</p></li>`).join('');
for (const [button, dialog] of [['rulesButton','rulesDialog'],['ranksButton','ranksDialog']]) $(button).onclick = () => $(dialog).showModal();
$('rulesToRanks').onclick = () => { $('rulesDialog').close(); $('ranksDialog').showModal(); };
document.querySelectorAll('[data-close]').forEach(button => button.onclick = () => button.closest('dialog').close());
function confirmAction(title, text, button = 'Confirm') {
  if (confirmResolve) return Promise.resolve(false);
  $('confirmTitle').textContent = title; $('confirmText').textContent = text; $('confirmYes').textContent = button; $('confirmDialog').showModal();
  return new Promise(resolve => { confirmResolve = resolve; });
}
function finishConfirm(value) { $('confirmDialog').close(); const resolve = confirmResolve; confirmResolve = null; resolve?.(value); }
$('confirmYes').onclick = () => finishConfirm(true); $('confirmNo').onclick = () => finishConfirm(false);
$('confirmDialog').addEventListener('cancel', event => { event.preventDefault(); finishConfirm(false); });

async function api(body, retried = false) {
  const headers = {'Content-Type':'application/json'}, params = new URLSearchParams({code});
  if (!isTv && readStorage('links-account-token')) headers['x-links-account'] = readStorage('links-account-token');
  if (isTv) { params.set('tv','1'); headers['x-poker-display'] = displayKey; }
  else { if (session.playerToken) headers['x-poker-token'] = session.playerToken; if (session.hostToken) headers['x-poker-host'] = session.hostToken; }
  let response;
  try { response = await fetch('./api/poker-night' + (body ? '' : '?' + params), {method:body ? 'POST' : 'GET', headers, cache:'no-store', signal:AbortSignal.timeout(12000), ...(body ? {body:JSON.stringify(body)} : {})}); }
  catch (error) { if (!retried && ['create','join'].includes(body?.action)) return api(body,true); throw error; }
  let data; try { data = await response.json(); } catch { throw Error('The table could not connect. We’ll keep trying; your seat is saved.'); }
  if (!response.ok || data.ok === false) throw Object.assign(Error(data.error || 'That action could not be completed.'), {status:response.status});
  return data;
}
function adopt(data) {
  if (data.session && !isTv) { session = {...session,...data.session}; }
  const incoming = data.room || data;
  if (!incoming.code) return;
  room = incoming; code = room.code;
  if (room.serverNow) offset = dateValue(room.serverNow) - Date.now();
  if (!isTv && session.playerToken) {
    writeStorage('links-poker-session-' + code, JSON.stringify(session));
    writeStorage('links-poker-seat-' + code, session.playerToken);
    writeStorage('links-poker-last-room', code);
    if (rememberedCode !== code && room.mode !== 'practice' && room.playerId) { rememberedCode = code; void rememberPartySeat('poker-night',code,session.playerToken); }
    if (room.mode !== 'practice') void updateVenueRoom('poker-night',code,session.playerToken,'',{bannerOnly:true,host:$('hostVenuePanel')});
  }
  const clean = new URL(location.href); clean.searchParams.set('room',code); clean.searchParams.delete('code');
  if (!isTv) { clean.hash = ''; clean.searchParams.delete('tv'); }
  history.replaceState(null,'',clean);
  showPanel('room'); render();
}
async function act(action, extra = {}) {
  if (busy || isTv) return;
  busy = true; generation++; updateControls(); note('');
  try {
    const data = await api({action,code,playerId:session.playerId,playerToken:session.playerToken,hostToken:session.hostToken,requestId:crypto.randomUUID(),...extra});
    adopt(data); sound(action === 'bet' ? 'click' : 'deal');
  } catch (error) { note(error.message,true); }
  finally { busy = false; updateControls(); }
}
async function poll() {
  if (!code || busy || fetching || ['closed','finished'].includes(room?.status) || (!isTv && !session.playerToken)) return;
  fetching = true; const ticket = generation;
  try { const data = await api(); if (ticket !== generation) return; adopt(data); if (connectionFailures) note('Back at the table. Your seat is connected.'); connectionFailures = 0; }
  catch (error) { if (ticket !== generation) return; connectionFailures++; if (connectionFailures === 1) note(error.message,true); }
  finally { fetching = false; }
}

$('showSetup').onclick = () => { showPanel('setupPanel'); $('hostName').focus(); };
$('showJoin').onclick = () => { showPanel('joinPanel'); $('joinCode').focus(); };
for (const id of ['cancelSetup','cancelJoin']) $(id).onclick = () => showPanel('welcome');
function setupMode() {
  const mode = $('mode').value;
  $('botsField').hidden = mode !== 'practice'; $('hostOnlyField').hidden = mode !== 'tournament';
  $('maxReentries').closest('label').hidden = mode === 'practice';
  for (const id of ['blindMinutes','breakEvery','breakMinutes','reentryLevels']) $(id).closest('label').hidden = mode !== 'tournament';
  $('setupSummary').textContent = mode === 'practice' ? 'Practice against computer opponents. Practice scores stay off public leaderboards. Start a fresh practice game when your stack runs out.' : mode === 'friends' ? 'One table with fixed blinds. An allowed buy back restores the starting virtual chip stack after elimination. No payment is involved.' : 'Blinds rise on the schedule you choose. A buy back restores the starting virtual chip stack after elimination, before the cutoff. No payment is involved.';
}
$('mode').onchange = setupMode; setupMode();
$('createForm').onsubmit = async event => {
  event.preventDefault(); if (busy) return;
  const settings = Object.fromEntries(['startingChips','tableSize','smallBlind','bigBlind','blindMinutes','turnSeconds','maxReentries','reentryLevels','breakEvery','breakMinutes','botCount'].map(id => [id,Number($(id).value)]));
  if (settings.bigBlind !== settings.smallBlind * 2) return note('Set the big blind to exactly twice the small blind.',true);
  if (settings.startingChips < settings.bigBlind * 10) return note('Start everyone with at least ten big blinds.',true);
  busy = true; const button = event.submitter; button.disabled = true; note(''); generation++;
  try { session = {}; adopt(await api({action:'create',name:$('hostName').value.trim(),mode:$('mode').value,hostOnly:$('mode').value === 'tournament' && $('hostOnly').checked,settings,requestId:crypto.randomUUID()})); wakeAudio(); }
  catch (error) { note(error.message,true); }
  finally { busy = false; button.disabled = false; updateControls(); }
};
$('joinForm').onsubmit = async event => {
  event.preventDefault(); if (busy) return; code = $('joinCode').value.trim().toUpperCase();
  const previous = read('links-poker-session-' + code);
  if (previous?.playerToken) { session = previous; await poll(); return; }
  busy = true; const button = event.submitter; button.disabled = true; note(''); generation++;
  try { session = {}; adopt(await api({action:'join',code,name:$('joinName').value.trim(),requestId:crypto.randomUUID()})); wakeAudio(); }
  catch (error) { note(error.message,true); }
  finally { busy = false; button.disabled = false; updateControls(); }
};

function inviteUrl() { const address = new URL('./poker-night.html',location.href); address.searchParams.set('room',code); return address.href; }
function tvUrl() { const address = new URL(inviteUrl()); address.searchParams.set('tv','1'); address.hash = new URLSearchParams({display:room?.displayKey || ''}).toString(); return address.href; }
function drawQr(target, link) { if ($(target).dataset.link === link) return; const qr = qrcode(0,'M'); qr.addData(link); qr.make(); $(target).innerHTML = qr.createSvgTag({cellSize:6,margin:8,scalable:true}); $(target).dataset.link = link; }
$('inviteButton').onclick = () => { $('inviteCode').textContent = code; $('inviteLink').value = inviteUrl(); drawQr('inviteQr',inviteUrl()); $('shareStatus').textContent = ''; $('inviteDialog').showModal(); };
async function copyText(text, target) { try { await navigator.clipboard.writeText(text); $(target).textContent = 'Link copied. Paste it into a message.'; } catch { $(target).textContent = 'Select and copy the link above.'; } }
$('copyInvite').onclick = () => copyText('Join me for LINKS Poker Night! Virtual chips only.\n' + inviteUrl(),'shareStatus');
$('shareInvite').onclick = async () => { if (!navigator.share) return copyText(inviteUrl(),'shareStatus'); try { await navigator.share({title:'LINKS Poker Night',text:'Your seat is waiting. Virtual chips only.',url:inviteUrl()}); } catch (error) { if (error.name !== 'AbortError') void copyText(inviteUrl(),'shareStatus'); } };
$('tvButton').onclick = () => { if (!room?.displayKey) return note('Your TV link is not ready. Try again in a moment.',true); $('tvLink').value = tvUrl(); $('openTv').href = tvUrl(); $('tvStatus').textContent = ''; $('tvDialog').showModal(); };
$('copyTv').onclick = () => copyText(tvUrl(),'tvStatus');
$('fullScreenButton').onclick = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); else note('Use your TV or browser’s full-screen setting.'); } catch { note('Use your TV or browser’s full-screen setting.'); } };
$('exitButton').onclick = async () => {
  if (!isTv && room?.status === 'playing' && !await confirmAction('Leave this screen?', 'Your seat stays saved. Blinds continue, and missed turns automatically check or fold. Reopen your room link on this browser to return.', 'Leave screen')) return;
  generation++; code = ''; room = null; session = {}; history.replaceState(null,'',location.pathname); document.body.classList.remove('tv'); showPanel('welcome'); note('');
};

function sortedStandings() { const list = Array.isArray(room?.standings) ? room.standings : room?.players || []; return list.slice().sort((a,b) => (a.place && b.place ? a.place-b.place : a.place ? 1 : b.place ? -1 : (b.stack || 0) - (a.stack || 0))); }
function render() {
  const host = !isTv && !!(room.isHost || session.hostToken), lobby = room.status === 'lobby', table = room.table;
  document.body.classList.toggle('tv',isTv);
  $('roomLabel').textContent = `${room.mode === 'tournament' ? 'HOSTED TOURNAMENT' : room.mode === 'practice' ? 'PRACTICE · COMPUTER OPPONENTS' : 'TEXAS HOLD’EM'} · ROOM ${code}`;
  $('roomTitle').textContent = room.status === 'closed' ? 'This room is closed.' : room.status === 'finished' ? 'A night to remember.' : lobby ? 'Your seat is waiting.' : isTv ? 'LINKS Poker Night' : 'Play to the last stack.';
  $('lobby').hidden = !lobby; $('gameArea').hidden = lobby || room.status === 'closed'; $('standingsPanel').hidden = lobby; $('hostDesk').hidden = !host || room.status === 'closed'; $('tvButton').hidden = !host; $('fullScreenButton').hidden = !isTv; $('inviteButton').hidden = room.status === 'closed' || room.mode === 'practice';
  $('lobbyCode').textContent = code;
  $('lobbySettings').textContent = `${chips(room.settings?.startingChips)} starting chips · ${room.settings?.tableSize || 9} seats per table · ${room.settings?.turnSeconds || 30} seconds to act`;
  $('lobbyRebuy').textContent = room.settings?.maxReentries ? `${room.settings.maxReentries} virtual-chip buy back${room.settings.maxReentries > 1 ? 's' : ''} per player${room.mode === 'tournament' ? ', through blind level ' + room.settings.reentryLevels : ''}.` : 'No buy backs. Everyone gets one starting stack.';
  setHtml('lobbyRoster',(room.players || []).map(p => `<span>${esc(p.name)}${p.id === session.playerId ? ' · You' : ''}</span>`).join(''));
  $('lobbyHelp').textContent = (host ? `${room.players?.length || 0} joined. Start when everyone is ready; at least two players are needed.` : 'The host will start when everyone is ready. Keep this page open.') + ' After that, hands deal automatically. Keep playing while you have chips; the last stack wins.';
  $('startButton').hidden = !host || !lobby; $('startButton').disabled = busy || (room.players?.length || 0) < 2;
  $('lobbyQr').hidden = room.mode === 'practice';
  if (lobby && room.mode !== 'practice') drawQr('lobbyQr',inviteUrl());
  const activeHand = table && ['preflop','flop','turn','river'].includes(table.phase);
  const smallBlind = activeHand ? table.smallBlind ?? room.smallBlind : room.smallBlind;
  const bigBlind = activeHand ? table.bigBlind ?? room.bigBlind : room.bigBlind;
  $('blindsValue').textContent = `${chips(smallBlind)} / ${chips(bigBlind)}`;
  $('blindsValue').title = activeHand && room.bigBlind !== bigBlind ? `Next hand: ${chips(room.smallBlind)} / ${chips(room.bigBlind)}` : 'Blinds for this hand';
  $('blindAdvance').hidden = !activeHand || room.bigBlind === bigBlind;
  $('blindAdvance').textContent = `Next hand: ${chips(room.smallBlind)} / ${chips(room.bigBlind)}`;
  $('levelLabel').textContent = `LEVEL ${room.level || 1}`;
  $('remainingValue').textContent = `${room.remaining ?? room.players?.filter(p => p.stack > 0).length ?? 0} / ${room.players?.length || 0}`;
  const ranking = sortedStandings(), myIndex = ranking.findIndex(p => p.id === session.playerId);
  $('rankValue').textContent = isTv ? 'Live' : myIndex < 0 ? '—' : `${myPlayer()?.place || myPlayer()?.rank || myIndex + 1}${myPlayer()?.place ? ' · Final' : ''}`;
  $('rankValue').previousElementSibling.textContent = isTv ? 'FEATURED TABLE' : 'YOUR POSITION';
  if (isTv) $('rankValue').textContent = table ? String(table.id).replace(/^table[-_]?/,'') : '—';
  $('tableLabel').textContent = table ? `${String(table.id).replace(/^table[-_]?/i,'TABLE ')} · HAND ${table.handNumber || 1}` : 'WAITING FOR A SEAT';
  $('actionMessage').textContent = room.status === 'paused' ? 'Game paused. Your chips and seat are safe.' : table?.waitingForTables ? 'Hand complete. Waiting for the other tables.' : table?.message || (table?.actorId ? `${nameOf(table.actorId)} to act.` : 'The next hand is on its way.');
  $('phaseLabel').textContent = ({preflop:'BEFORE THE FLOP',flop:'THE FLOP',turn:'THE TURN',river:'THE RIVER',showdown:'SHOWDOWN',complete:'HAND COMPLETE',waiting:'NEXT HAND SOON'})[table?.phase] || String(table?.phase || 'WAITING FOR THE DEAL').toUpperCase();
  renderTable(table); renderHand(table); renderStandings(ranking);
  $('finishedPanel').hidden = room.status !== 'finished'; $('championName').textContent = room.winnerId ? `${nameOf(room.winnerId)} wins Poker Night!` : 'Thanks for playing.';
  const tables = room.tables || [];
  $('tableCount').textContent = `${tables.length} table${tables.length === 1 ? '' : 's'}`;
  if (host) setHtml('tableList',tables.map(t => `<article class="table-status ${t.id === room.featuredTableId ? 'featured' : ''}"><h3>${esc(String(t.id).replace(/^table[-_]?/i,'Table '))}${t.id === room.featuredTableId ? ' · On TV' : ''}</h3><p>${t.players?.length || 0} players · ${esc(t.phase || 'Waiting')}<br>Pot ${chips(t.pot)}</p><button type="button" data-feature="${esc(t.id)}" ${t.id === room.featuredTableId || busy ? 'disabled' : ''}>Feature on TV</button></article>`).join(''));
  $('pauseButton').textContent = room.status === 'paused' ? 'Resume game' : 'Pause game'; $('pauseButton').disabled = busy || !['playing','paused'].includes(room.status);
  $('closeButton').disabled = busy || room.status === 'closed';
  const venue = room.venue; $('venueBanner').hidden = !venue?.logo;
  if (venue?.logo) { const logo = new URL(venue.logo,location.origin); if (['https:','http:'].includes(logo.protocol)) { $('venueLogo').src = logo.href; $('venueLogo').alt = venue.name || 'Venue logo'; } else $('venueBanner').hidden = true; }
  updateControls(); tick();
}
function seatPositions(count, mobile) {
  if (count <= 2) return mobile ? [[50,94],[50,7]] : [[50,94],[50,7]];
  if (mobile) return [[50,95],[15,82],[14,59],[16,35],[28,10],[72,10],[84,35],[86,59],[85,82]];
  return [[50,95],[20,86],[7,60],[12,28],[35,8],[65,8],[88,28],[93,60],[80,86]];
}
function renderTable(table) {
  const myId = !isTv ? session.playerId : '', players = (table?.players || []).slice();
  const ownIndex = players.findIndex(p => p.id === myId);
  if (ownIndex > 0) players.push(...players.splice(0,ownIndex));
  const mobile = matchMedia('(max-width:600px)').matches, positions = seatPositions(players.length,mobile);
  const board = table?.board || [], signature = `${table?.id}:${table?.handNumber}:${board.join(',')}`;
  const fresh = signature !== tableSignature; if (fresh && tableSignature && board.length) sound('deal'); tableSignature = signature;
  const winningCards = table?.phase === 'showdown' && table?.showCards ? (table.winners || []).flatMap(w => w.cards || []) : [];
  setHtml('board',Array.from({length:5},(_,i) => cardHtml(board[i],{empty:!board[i],animate:fresh && !!board[i],winning:winningCards.includes(board[i])})).join(''));
  $('potValue').textContent = chips(table?.phase === 'showdown' ? table.lastPot : table?.pot);
  const nextPot = `${table?.id}:${table?.handNumber}:${table?.pot}`;
  if (nextPot !== potSignature) { const pot = $('potValue').closest('.pot'); pot.classList.remove('chips-moving'); if (potSignature && table?.pot) { void pot.offsetWidth; pot.classList.add('chips-moving'); } potSignature = nextPot; }
  const seatHtml = players.map((p,index) => {
    const position = positions[index] || positions[0];
    const revealed = isTv ? ['showdown','complete'].includes(table?.phase) && !p.folded : p.id !== myId && ['showdown','complete'].includes(table?.phase) && !p.folded;
    const cards = revealed && p.holeCards?.length ? p.holeCards.map(c => cardHtml(c)).join('') : (!p.folded ? cardHtml(null,{back:true}) + cardHtml(null,{back:true}) : '');
    const markers = `${p.seat === table.buttonSeat ? '<b class="marker" title="Dealer">D</b>' : ''}${p.seat === table.smallBlindSeat ? '<b class="marker blind" title="Small blind">SB</b>' : ''}${p.seat === table.bigBlindSeat ? '<b class="marker blind" title="Big blind">BB</b>' : ''}`;
    return `<div class="seat ${p.id === myId ? 'you' : ''} ${p.id === table.actorId ? 'active' : ''} ${p.folded ? 'folded' : ''}" style="left:${position[0]}%;top:${position[1]}%"><div class="seat-cards">${cards}</div><div class="seat-label"><span class="markers">${markers}</span><span class="seat-name">${esc(p.name)}${p.id === myId ? ' · You' : ''}</span><span class="seat-stack">${chips(p.stack)}</span>${p.folded || p.allIn || p.away ? `<span class="seat-status">${p.folded ? 'Folded' : p.allIn ? 'All in' : 'Away'}</span>` : ''}</div>${p.bet ? `<span class="seat-bet">Bet ${chips(p.bet)}</span>` : ''}</div>`;
  }).join('');
  setHtml('seats',seatHtml);
  const winners = table?.winners || [];
  const showWin = winners.length > 0 && ['showdown','complete'].includes(table?.phase);
  $('winnerToast').hidden = !showWin;
  if (showWin) {
    const texts = winners.map(w => typeof w === 'string' ? nameOf(w) : `${w.name || nameOf(w.playerId || w.id)}${w.amount ? ' +' + chips(w.amount) : ''}`);
    const handNames = [...new Set(winners.map(w => w.handName).filter(name => name && name !== 'Uncontested'))];
    $('winnerToast').textContent = texts.join(' · ') + (winners.length > 1 ? ' · Pot awarded' : ' wins this hand!') + (handNames.length ? ' · ' + handNames.join(' / ') : '');
    const win = `${table?.id}:${table?.handNumber}:${texts.join(',')}`; if (win !== lastWin) { sound('win'); lastWin = win; }
  }
}
function renderHand(table) {
  const player = myPlayer(), seat = table?.players?.find(p => p.id === session.playerId);
  $('myHand').hidden = isTv || !player || room.status === 'finished';
  $('myStack').textContent = `${chips(player?.stack)} chips`;
  const privateCards = cardsHidden ? [null,null] : seat?.holeCards || [];
  const signature = JSON.stringify([privateCards,cardsHidden]);
  if (signature !== playerSignature) { const html = privateCards.length ? privateCards.map(c => cardHtml(c,{back:cardsHidden,animate:!cardsHidden})).join('') : cardHtml(null,{back:true}) + cardHtml(null,{back:true}); $('privateCards').innerHTML = html; $('bettingHand').innerHTML = html; playerSignature = signature; }
  $('hideCardsButton').textContent = cardsHidden ? 'Show cards' : 'Hide cards'; $('hideCardsButton').setAttribute('aria-pressed',String(cardsHidden));
  $('sitOutButton').textContent = player?.away || seat?.away ? 'I’m back' : 'Sit out'; $('sitOutButton').disabled = busy || !['playing','paused'].includes(room.status);
  $('myStatus').textContent = room.status === 'paused' ? 'The host paused the game.' : player?.status === 'eliminated' ? room.canRebuy ? 'Your stack is out. You can buy back in below.' : 'Your stack is out. Stay to watch the rest of the game.' : player?.away || seat?.away ? 'Sitting out. Blinds continue; turns automatically check or fold.' : seat?.folded ? 'You folded. Watch this hand and get ready for the next.' : seat?.allIn ? 'You’re all in. Good luck.' : table?.actorId === session.playerId ? 'Your turn. Choose your move below.' : !seat ? 'Waiting to be seated for the next hand.' : 'Your cards are private. Watch the table for your turn.';
  const canRebuy = typeof room.canRebuy === 'object' ? !!room.canRebuy.allowed : !!room.canRebuy;
  $('rebuyPanel').hidden = !canRebuy;
  $('rebuyButton').textContent = `Buy back in · ${chips(room.settings?.startingChips)} chips`;
  $('rebuyButton').disabled = busy;
  $('rebuyHelp').textContent = `${Math.max(0,(room.settings?.maxReentries || 0) - (player?.reentries || 0))} buy back(s) remaining.${room.mode === 'tournament' ? ' Available through level ' + room.settings.reentryLevels + '.' : ''} You’ll join between hands.`;
}
function renderStandings(players) {
  setHtml('standings',players.map((p,index) => `<li class="${p.id === session.playerId && !isTv ? 'you' : ''}"><span class="rank-number">${p.place || p.rank || index + 1}</span><span class="player-name">${esc(p.name)}${p.id === session.playerId && !isTv ? ' · You' : ''}<small>${p.place ? 'Finished' : p.stack <= 0 ? 'Out · May be eligible to buy back' : p.tableId ? esc(String(p.tableId).replace(/^table[-_]?/i,'Table ')) : 'Waiting for seat'}</small></span><span class="stack-value">${chips(p.stack)}</span></li>`).join(''));
}
function updateControls() {
  if (!room) return;
  const table = room.table, legal = table?.legalActions || {}, turn = !isTv && room.status === 'playing' && table?.actorId === session.playerId && !busy && (!table.deadline || dateValue(table.deadline) > now());
  document.body.dataset.pokerTurn = String(turn);
  $('bettingControls').hidden = !turn;
  $('foldButton').disabled = !turn || !legal.canFold;
  $('callButton').disabled = !turn || (!legal.canCheck && !(legal.callAmount > 0));
  const stack = table?.players?.find(p => p.id === session.playerId)?.stack;
  $('callButton').textContent = legal.canCheck ? 'Check' : `${legal.callAmount >= stack ? 'All-in call' : 'Call'} ${chips(legal.callAmount)}`;
  $('raiseOpen').disabled = !turn || !legal.canRaise;
  const turnKey = `${table?.id}:${table?.handNumber}:${table?.turnId}`;
  if (turnKey !== lastTurn) { raiseOpen = false; if (turn) { sound('turn'); if (navigator.vibrate && document.visibilityState === 'visible') navigator.vibrate(90); } lastTurn = turnKey; }
  $('raisePanel').hidden = !raiseOpen || !turn || !legal.canRaise;
  $('raiseOpen').textContent = raiseOpen ? 'Cancel raise' : 'Raise';
  const min = Number(legal.minRaiseTo || 0), max = Number(legal.maxRaiseTo || 0);
  $('raiseAmount').min = String(Math.min(min,max)); $('raiseAmount').max = String(max); $('raiseAmount').step = '1';
  if (Number($('raiseAmount').value) < min || Number($('raiseAmount').value) > max) $('raiseAmount').value = String(Math.min(min,max));
  updateRaise();
  $('rebuyButton').disabled = busy; $('startButton').disabled = busy || (room.players?.length || 0) < 2;
  $('nextButton').disabled = busy || room.status !== 'playing' || !room.nextHandAt || seconds(dateValue(room.nextHandAt)) > 0;
}
function updateRaise() { const amount = Number($('raiseAmount').value), all = amount === Number(room?.table?.legalActions?.maxRaiseTo); $('raiseOutput').textContent = chips(amount); $('raiseButton').textContent = `${all ? 'All in' : 'Raise to'} ${chips(amount)}`; }
$('raiseAmount').oninput = updateRaise;
$('raiseOpen').onclick = () => { raiseOpen = !raiseOpen; if (raiseOpen) $('raiseAmount').value = String(Math.min(room.table.legalActions.minRaiseTo,room.table.legalActions.maxRaiseTo)); updateControls(); };
document.querySelectorAll('[data-bet]').forEach(button => button.onclick = () => { const table = room?.table, legal = table?.legalActions || {}, min = Number(legal.minRaiseTo || 0), max = Number(legal.maxRaiseTo || 0); let amount = button.dataset.bet === 'all' ? max : button.dataset.bet === 'pot' ? Number(table.currentBet || 0) + Number(table.pot || 0) + Number(legal.callAmount || 0) : button.dataset.bet === 'half' ? Number(table.currentBet || 0) + Math.ceil((Number(table.pot || 0) + Number(legal.callAmount || 0)) / 2) : min; $('raiseAmount').value = String(Math.min(max,Math.max(min,amount))); updateRaise(); });
async function bet(move, amount) {
  if (busy || !room?.table) return;
  const table = room.table, hand = {tableId:table.id,handNumber:table.handNumber,turnId:table.turnId}, player = table.players?.find(p => p.id === session.playerId);
  if (move === 'raise' && amount >= table.legalActions.maxRaiseTo || move === 'call' && table.legalActions.callAmount >= (player?.stack || Infinity)) {
    if (!await confirmAction('Put your stack in?', `This commits all ${chips(player?.stack)} of your remaining virtual chips to this hand.`, 'Go all in')) return;
    if (room?.table?.id !== hand.tableId || room?.table?.turnId !== hand.turnId || room?.table?.handNumber !== hand.handNumber) return note('The turn changed while the confirmation was open. Review the current table.');
  }
  await act('bet',{...hand,move,...(amount !== undefined ? {amount} : {})});
}
$('foldButton').onclick = () => bet('fold');
$('callButton').onclick = () => bet(room?.table?.legalActions?.canCheck ? 'check' : 'call');
$('raiseButton').onclick = () => bet('raise',Number($('raiseAmount').value));
$('hideCardsButton').onclick = () => { cardsHidden = !cardsHidden; renderHand(room?.table); };
$('startButton').onclick = () => act('start');
$('rebuyButton').onclick = async () => { if (await confirmAction('Back in the game?', `Use one of your allowed buy backs to receive ${chips(room.settings.startingChips)} virtual chips. No payment is involved.`, 'Buy back in')) await act('rebuy'); };
$('sitOutButton').onclick = async () => { const away = !!(myPlayer()?.away || room?.table?.players?.find(p => p.id === session.playerId)?.away); if (away || await confirmAction('Step away from the table?', 'Your blinds still apply. While you’re away, turns automatically check when allowed or fold. Press “I’m back” when ready.', 'Sit out')) await act('sitout',{away:!away}); };
$('pauseButton').onclick = () => act(room?.status === 'paused' ? 'resume' : 'pause');
$('nextButton').onclick = () => act('next');
$('closeButton').onclick = async () => { if (await confirmAction('Close this poker room?', 'This ends the room for everyone. Current hands cannot continue after closing.', 'Close room')) await act('close'); };
$('tableList').onclick = event => { const button = event.target.closest('[data-feature]'); if (button) void act('feature',{tableId:button.dataset.feature}); };
function tick() {
  if (!room) return;
  const deadline = dateValue(room.table?.deadline), remaining = seconds(deadline);
  $('turnClock').textContent = room.status === 'paused' ? 'Ⅱ' : deadline ? remaining : '—';
  $('turnClock').classList.toggle('urgent',room.status === 'playing' && !!deadline && remaining <= 5);
  if (deadline && remaining === 0 && room.table?.actorId === session.playerId) updateControls();
  $('levelClock').textContent = room.status === 'paused' ? room.autoResumeAt ? timeLeft(dateValue(room.autoResumeAt)) + ' break' : 'Paused' : room.nextLevelAt ? timeLeft(dateValue(room.nextLevelAt)) : 'Fixed blinds';
  if (room.nextHandAt && room.status === 'playing') {
    const next = seconds(dateValue(room.nextHandAt)); $('nextButton').disabled = busy || next > 0;
    if (room.table?.waitingForTables || ['showdown','complete'].includes(room.table?.phase)) {
      const finalStack = room.remaining === 1;
      $('actionMessage').textContent = next > 0 ? (finalStack ? `Final result in ${next}s.` : `Next hand deals automatically in ${next}s.`) + (room.canRebuy ? ' Buy back in below to keep playing.' : '') : finalStack ? 'Confirming the winner…' : 'Dealing the next hand…';
    }
  }
}
setInterval(tick,250);
setInterval(() => { if (!document.hidden) void poll(); },1500);
document.addEventListener('visibilitychange',() => { if (!document.hidden) void poll(); });
window.addEventListener('resize',() => { if (room?.table) renderTable(room.table); });
window.addEventListener('online',() => void poll());

if (isTv) {
  document.body.classList.add('tv'); $('showSetup').hidden = true; $('showJoin').hidden = true;
  if (!code || !displayKey) { showPanel('welcome'); note('Open the TV display link from the host’s TV display button. The room code alone cannot open a private table display.',true); }
  else { showPanel('room'); note('Connecting the featured table…'); void poll().then(() => { if (!connectionFailures) note(''); }); }
} else if (code) {
  session = read('links-poker-session-' + code) || {};
  if (session.playerToken) { showPanel('room'); note('Returning to your saved seat…'); void poll().then(() => { if (!connectionFailures) note(''); }); }
  else { $('joinCode').value = code; showPanel('joinPanel'); }
} else showPanel('welcome');
