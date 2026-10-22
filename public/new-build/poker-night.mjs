import {createPokerProfile} from './poker-profile.mjs?v=luxe2';
import {createTableChat} from './poker-chat.mjs?v=compact5';
import {createPokerAudio} from './poker-audio.mjs?v=rich2';
import {pokerSeatPosition} from './poker-seats.mjs?v=luxe3';
import {raisePreset,validRaise} from './poker-controls.mjs';
import {createActionLog,renderActionLog} from './poker-action-log.mjs';
import {createHandRecap,recapLines} from './poker-recap.mjs';
import qrcode from './vendor/qrcode.mjs';
import {rememberPartySeat} from './party-score-link.mjs';
import {updateVenueRoom} from './venue-link.mjs';
import {preselectOptions,choosePreselection,resolvePreselection} from './poker-preselect.mjs';

const $ = id => document.getElementById(id);
const tableChat=createTableChat(async(action,extra)=>{if(!await act(action,extra))throw Error('Message was not sent. Wait a moment and try again.');},name=>confirmAction('Remove '+name+'?', 'They will lose access to this room and chat immediately. Their current hand resolves safely before their remaining chips leave play. They cannot buy back in with this seat.','Remove player'));
const pokerProfile=createPokerProfile(async(action,extra)=>{if(!await act(action,extra))throw Error('Could not save right now. Please try again.');});
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chips = value => Number(value || 0).toLocaleString();
const url = new URL(location.href), isTv = url.searchParams.get('tv') === '1';
const displayKey = new URLSearchParams(url.hash.slice(1)).get('display') || '';
let selectedTvTable = isTv ? url.searchParams.get('table') || '' : '';
let code = (url.searchParams.get('room') || url.searchParams.get('code') || '').trim().toUpperCase();
let room = null, session = {}, busy = false, fetching = false, generation = 0, offset = 0, cardsHidden = false, raiseOpen = false, tableSignature = '', playerSignature = '', lastTurn = '', lastWin = '', connectionFailures = 0;
let muted = readStorage('links-poker-muted') === '1', confirmResolve = null;
const pokerAudio = createPokerAudio({getMuted:()=>muted,getVolume:()=>Number($('effectsVolume').value)/100,getCrowd:()=>$('crowdEffects').checked,getVoice:()=>$('voiceEffects').checked});
let tableAudio = null, lastWarning = '', lastNotifiedTurn = '';
let rememberedCode = '', lastPotState = null, lastFinishedPoll = 0, lastChampion = '';
let preselection = null, preRaiseOpen = false, syncNeeded = false, exactDirty = false;
const actionLog = createActionLog();
const handRecap = createHandRecap();
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

function wakeAudio() { pokerAudio.wake(); }
function sound(kind = 'click') { return pokerAudio.play(kind); }
document.addEventListener('pointerdown', wakeAudio, {passive:true});
document.addEventListener('keydown', wakeAudio);
function updateMute() { $('muteButton').textContent = muted ? 'Sound on' : 'Mute'; $('muteButton').setAttribute('aria-pressed', String(muted)); }
$('muteButton').onclick = () => { muted = !muted; writeStorage('links-poker-muted', muted ? '1' : '0'); updateMute(); if (muted) pokerAudio.silence(); if (!muted) { wakeAudio(); sound(); } };
updateMute();
const savedEffects = read('links-poker-effects') || {};
$('effectsVolume').value = String(Number.isFinite(savedEffects.volume) ? Math.max(0,Math.min(100,savedEffects.volume)) : 70);
$('crowdEffects').checked = savedEffects.crowd !== false;
$('voiceEffects').checked = savedEffects.voice !== false;
$('motionEffects').checked = savedEffects.motion !== false;
$('fourColorDeck').checked = savedEffects.fourColor === true;
function applyEffects(save = false) {
  document.body.classList.toggle('poker-still',!$('motionEffects').checked);
  document.body.classList.toggle('four-color-deck',$('fourColorDeck').checked);
  $('effectsVolumeValue').textContent = $('effectsVolume').value+'%';
  if (save) {
    pokerAudio.silence();
    writeStorage('links-poker-effects',JSON.stringify({volume:Number($('effectsVolume').value),crowd:$('crowdEffects').checked,voice:$('voiceEffects').checked,motion:$('motionEffects').checked,fourColor:$('fourColorDeck').checked}));
  }
}
for (const id of ['effectsVolume','crowdEffects','voiceEffects','motionEffects','fourColorDeck']) $(id).oninput=()=>applyEffects(true);
$('previewEffects').onclick=()=>{wakeAudio();$('effectsStatus').textContent=sound($('crowdEffects').checked?'crowdWin':'chips')?'Sound preview.':muted?'Unmute to hear the preview.':'Turn the volume up and tap again to hear the preview.';};
applyEffects();

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
  return `<span class="card suit-${card.suit} ${'hd'.includes(card.suit) ? 'red' : ''} ${animate ? 'deal' : ''} ${winning ? 'winning' : ''}" role="img" aria-label="${label}${winning ? ', winning hand' : ''}"><span class="rank">${rank}</span><span class="suit">${suit}</span><span class="large-suit" aria-hidden="true">${suit}</span></span>`;
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
  if (isTv) { params.set('tv','1'); if (selectedTvTable) params.set('table',selectedTvTable); headers['x-poker-display'] = displayKey; }
  else { if (session.playerToken) headers['x-poker-token'] = session.playerToken; if (session.hostToken) headers['x-poker-host'] = session.hostToken; }
  let response;
  try { response = await fetch('./api/poker-night' + (body ? '' : '?' + params), {method:body ? 'POST' : 'GET', headers, cache:'no-store', signal:AbortSignal.timeout(12000), ...(body ? {body:JSON.stringify(body)} : {})}); }
  catch (error) { if (!retried && ['create','join'].includes(body?.action)) return api(body,true); throw error; }
  let data; try { data = await response.json(); } catch { throw Error('The table could not connect. We’ll keep trying; your seat is saved.'); }
  if (!response.ok || data.ok === false) throw Object.assign(Error(data.error || 'That action could not be completed.'), {status:response.status,code:data.code});
  return data;
}
function adopt(data) {
  if (data.session && !isTv) { session = {...session,...data.session}; }
  const incoming = data.room || data;
  if (!incoming.code) return;
  room = incoming; code = room.code; syncNeeded = false;
  if (isTv && selectedTvTable && room.tables?.length && !room.tables.some(t => t.id === selectedTvTable)) { selectedTvTable = ''; note('That table has closed. This TV now follows the featured table.'); }
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
  if (isTv) { if (selectedTvTable) clean.searchParams.set('table',selectedTvTable); else clean.searchParams.delete('table'); }
  history.replaceState(null,'',clean);
  showPanel('room'); render();
}
function handleRemoval(error){
 if(error.code!=='REMOVED_FROM_ROOM')return false;
 generation++;const oldCode=code;code='';room=null;session={};preselection=null;syncNeeded=false;
 for(const key of ['links-poker-session-'+oldCode,'links-poker-seat-'+oldCode,'links-poker-last-room'])try{localStorage.removeItem(key)}catch{}
 $('privateCards').replaceChildren();$('seats').replaceChildren();showPanel('welcome');note('The host removed you from this room.',true);return true;
}
async function act(action, extra = {}) {
  if (busy || isTv) return;
  if (['bet','sitout'].includes(action)) { preselection = null; preRaiseOpen = false; }
  busy = true; generation++; updateControls(); note('');
  try {
    const data = await api({action,code,playerId:session.playerId,playerToken:session.playerToken,hostToken:session.hostToken,requestId:crypto.randomUUID(),...extra});
    adopt(data);return true;
  } catch (error) { if(handleRemoval(error))return false;syncNeeded = true; note(`${error.message} Refreshing the table before another move…`,true); }
  finally { busy = false; updateControls(); if (syncNeeded) void poll(); }
}
async function poll() {
  if (!code || busy || fetching || room?.status === 'closed' || (!isTv && !session.playerToken)) return;
  // Final-table players can still choose to show a hand after the match ends.
  if (room?.status === 'finished') { if (Date.now() - lastFinishedPoll < 5000) return; lastFinishedPoll = Date.now(); }
  fetching = true; const ticket = generation;
  try { const data = await api(); if (ticket !== generation) return; const recovered=syncNeeded||connectionFailures; adopt(data); if (recovered) note('Back at the table. Review your current cards and turn.'); connectionFailures = 0; }
  catch (error) {
    if (ticket !== generation) return;
    if(handleRemoval(error))return;
    connectionFailures++; syncNeeded = true; preselection = null; preRaiseOpen = false;
    updateControls();
    if (connectionFailures === 1) note(`${error.message} Betting is paused on this screen until the table reconnects. Your seat is saved; the game clock continues.`,true);
  }
  finally { fetching = false; if (!connectionFailures) runPreselection(); }
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
function tvUrl() { const address = new URL(inviteUrl()); address.searchParams.set('tv','1'); if ($('tvTable').value) address.searchParams.set('table',$('tvTable').value); address.hash = new URLSearchParams({display:room?.displayKey || ''}).toString(); return address.href; }
function displayOptions(id, selected) {
  const options = '<option value="">Follow host’s featured table</option>' + (room?.tables || []).map(t => `<option value="${esc(t.id)}">${esc(String(t.id).replace(/^table[-_]?/i,'Table '))}${room.tables.length === 1 ? ' · Final / only table' : ''}</option>`).join('');
  setHtml(id,options); $(id).value = selected;
}
function refreshTvLink() { $('tvLink').value = tvUrl(); $('openTv').href = tvUrl(); $('tvStatus').textContent = ''; }
function drawQr(target, link) { if ($(target).dataset.link === link) return; const qr = qrcode(0,'M'); qr.addData(link); qr.make(); $(target).innerHTML = qr.createSvgTag({cellSize:6,margin:8,scalable:true}); $(target).dataset.link = link; }
function invitationText() { return `Join me for LINKS Poker Night! Room ${code}. Open the link on your phone and choose your name. Virtual chips only.\n${inviteUrl()}`; }
$('inviteButton').onclick = () => {
  const mobile = navigator.userAgentData?.mobile || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  $('inviteCode').textContent = code; $('inviteLink').value = inviteUrl(); drawQr('inviteQr',inviteUrl());
  $('textInvite').hidden = !mobile; $('textInvite').href = `sms:${ios ? '&' : '?'}body=${encodeURIComponent(invitationText())}`;
  $('emailInvite').href = `mailto:?subject=${encodeURIComponent('Join my LINKS Poker Night')}&body=${encodeURIComponent(invitationText())}`;
  $('shareInvite').hidden = typeof navigator.share !== 'function';
  $('shareHelp').textContent = mobile ? 'Text the invite, share it through another app, or copy the link. Choose who to send it to in your messaging app.' : 'Copy the invite link into a text or chat, email it, or have players scan the QR code with their phones.';
  $('shareStatus').textContent = ''; $('inviteDialog').showModal();
};
async function copyText(text, target) { try { await navigator.clipboard.writeText(text); $(target).textContent = 'Link copied. Paste it into a message.'; } catch { const input = target === 'shareStatus' ? $('inviteLink') : $('tvLink'); input.focus(); input.select(); $(target).textContent = 'Select and copy the link above.'; } }
$('copyInvite').onclick = () => copyText(inviteUrl(),'shareStatus');
$('shareInvite').onclick = async () => { if (!navigator.share) return copyText(inviteUrl(),'shareStatus'); try { await navigator.share({title:'LINKS Poker Night',text:`Join me for LINKS Poker Night! Room ${code}. Choose your name on your phone. Virtual chips only.`,url:inviteUrl()}); } catch (error) { if (error.name !== 'AbortError') void copyText(inviteUrl(),'shareStatus'); } };
$('tvButton').onclick = () => { if (!room?.displayKey) return note('Your TV link is not ready. Try again in a moment.',true); displayOptions('tvTable',$('tvTable').value); refreshTvLink(); $('tvDialog').showModal(); };
$('tvTable').onchange = refreshTvLink;
$('displayTable').onchange = () => { selectedTvTable = $('displayTable').value; generation++; void poll(); };
$('copyTv').onclick = () => copyText(tvUrl(),'tvStatus');
$('fullScreenButton').onclick = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); else note('Use your TV or browser’s full-screen setting.'); } catch { note('Use your TV or browser’s full-screen setting.'); } };
$('exitButton').onclick = async () => {
  if (busy) return note('Wait for your current move to finish before leaving this screen.',true);
  if (!isTv && room?.status === 'playing' && !await confirmAction('Leave this screen?', 'Your seat stays saved. Blinds continue, and missed turns automatically check or fold. Reopen your room link on this browser to return.', 'Leave screen')) return;
  generation++; preselection = null; preRaiseOpen = false; code = ''; room = null; session = {}; history.replaceState(null,'',location.pathname); document.body.classList.remove('tv'); showPanel('welcome'); note('');
};

function sortedStandings() { const list = Array.isArray(room?.standings) ? room.standings : room?.players || []; return list.slice().sort((a,b) => (a.place && b.place ? a.place-b.place : a.place ? 1 : b.place ? -1 : (b.stack || 0) - (a.stack || 0))); }
function render() {
  const host = !isTv && !!(room.isHost || session.hostToken), lobby = room.status === 'lobby', table = room.table,lobbyPlayers=(room.players||[]).filter(p=>!p.removed);
  const inviteHome = lobby ? $('lobbyInvite') : $('profileTools');
  if ($('inviteButton').parentElement !== inviteHome) inviteHome[lobby ? 'append' : 'prepend']($('inviteButton'));
  $('lobbyInvite').hidden = room.mode === 'practice';
  document.body.classList.toggle('tv',isTv);
  $('displayTableControl').hidden = !isTv;
  if (isTv) displayOptions('displayTable',selectedTvTable);
  $('roomLabel').textContent = `${room.mode === 'tournament' ? 'HOSTED TOURNAMENT' : room.mode === 'practice' ? 'PRACTICE · COMPUTER OPPONENTS' : 'TEXAS HOLD’EM'} · ROOM ${code}`;
  $('roomTitle').textContent = room.status === 'closed' ? 'This room is closed.' : room.status === 'finished' ? 'A night to remember.' : lobby ? 'Your seat is waiting.' : isTv ? 'LINKS Poker Night' : 'Play to the last stack.';
  $('lobby').hidden = !lobby; $('gameArea').hidden = lobby || room.status === 'closed'; $('standingsPanel').hidden = lobby; $('hostDesk').hidden = !host || room.status === 'closed'; $('tvButton').hidden = !host; $('fullScreenButton').hidden = !isTv; $('inviteButton').hidden = room.status === 'closed' || room.mode === 'practice';
  $('lobbyCode').textContent = code;
  $('lobbySettings').textContent = `${chips(room.settings?.startingChips)} starting chips · ${room.settings?.tableSize || 9} seats per table · ${room.settings?.turnSeconds || 30} seconds to act`;
  $('lobbyRebuy').textContent = room.settings?.maxReentries ? `${room.settings.maxReentries} virtual-chip buy back${room.settings.maxReentries > 1 ? 's' : ''} per player${room.mode === 'tournament' ? ', through blind level ' + room.settings.reentryLevels : ''}.` : 'No buy backs. Everyone gets one starting stack.';
  setHtml('lobbyRoster',lobbyPlayers.map(p => `<span>${esc(p.name)}${p.id === session.playerId ? ' · You' : ''}</span>`).join(''));
  $('lobbyHelp').textContent = (host ? `${lobbyPlayers.length} joined. Start when everyone is ready; at least two players are needed.` : 'The host will start when everyone is ready. Keep this page open.') + ' After that, hands deal automatically. Keep playing while you have chips; the last stack wins.';
  $('startButton').hidden = !host || !lobby; $('startButton').disabled = busy || (room.players||[]).filter(p=>!p.removed).length < 2;
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
  $('rankValue').previousElementSibling.textContent = isTv ? 'TABLE ON THIS TV' : 'YOUR POSITION';
  if (isTv) $('rankValue').textContent = table ? String(table.id).replace(/^table[-_]?/,'') : '—';
  $('tableLabel').textContent = table ? `${String(table.id).replace(/^table[-_]?/i,'TABLE ')} · HAND ${table.handNumber || 1}` : 'WAITING FOR A SEAT';
  $('actionMessage').textContent = !isTv && myPlayer()?.status === 'waiting' ? 'You are in! Waiting for all tables to finish. You will be dealt into the next hand.' : room.status === 'paused' ? 'Game paused. Your chips and seat are safe.' : table?.waitingForTables ? 'Hand complete. Waiting for the other tables.' : table?.message || (table?.actorId ? `${nameOf(table.actorId)} to act.` : 'The next hand is on its way.');
  $('phaseLabel').textContent = ({preflop:'BEFORE THE FLOP',flop:'THE FLOP',turn:'THE TURN',river:'THE RIVER',showdown:'SHOWDOWN',complete:'HAND COMPLETE',waiting:'NEXT HAND SOON'})[table?.phase] || String(table?.phase || 'WAITING FOR THE DEAL').toUpperCase();
  renderTable(table); renderHand(table); renderStandings(ranking);
  $('finishedPanel').hidden = room.status !== 'finished'; $('championName').textContent = room.winnerId ? `${nameOf(room.winnerId)} wins Poker Night!` : 'Thanks for playing.';
  if (room.status === 'finished' && room.winnerId) {
    const champion = `${code}:${room.winnerId}`;
    if (champion !== lastChampion) { sound('champion'); lastChampion = champion; }
  }
  const tables = room.tables || [];
  $('tableCount').textContent = `${tables.length} table${tables.length === 1 ? '' : 's'}`;
  if (host) setHtml('tableList',tables.map(t => `<article class="table-status ${t.id === room.featuredTableId ? 'featured' : ''}"><h3>${esc(String(t.id).replace(/^table[-_]?/i,'Table '))}${t.id === room.featuredTableId ? ' · Featured' : ''}</h3><p>${t.players?.length || 0} players · ${esc(t.phase || 'Waiting')}<br>Pot ${chips(t.pot)}</p><button type="button" data-feature="${esc(t.id)}" ${t.id === room.featuredTableId || busy ? 'disabled' : ''}>Feature on TV</button></article>`).join(''));
  $('pauseButton').textContent = room.status === 'paused' ? 'Resume game' : 'Pause game'; $('pauseButton').disabled = busy || !['playing','paused'].includes(room.status);
  $('closeButton').disabled = busy || room.status === 'closed';
  const venue = room.venue; $('venueBanner').hidden = !venue?.logo;
  if (venue?.logo) { const logo = new URL(venue.logo,location.origin); if (['https:','http:'].includes(logo.protocol)) { $('venueLogo').src = logo.href; $('venueLogo').alt = venue.name || 'Venue logo'; } else $('venueBanner').hidden = true; }
  tableChat.update(room);pokerProfile.update(room);updateControls(); tick();
}
function renderTable(table) {
  renderActionLog($('recentActions'),actionLog.update(code,table));
  $('recentActionPanel').hidden = !table;
  const recap = handRecap.update(code,table);
  $('handRecapPanel').hidden = !recap;
  if (recap) {
    $('handRecapTitle').textContent = `Last result · ${String(recap.tableId).replace(/^table[-_]?/i,'Table ')} · Hand ${recap.handNumber}`;
    renderActionLog($('handRecapResults'),recapLines(recap).map((text,i)=>({key:recap.key+':'+i,text})));
  }
  const myId = !isTv ? session.playerId : '', players = (table?.players || []).slice();
  const ownSeat = players.find(p => p.id === myId)?.seat;
  const mobile = matchMedia('(max-width:600px)').matches;
  const board = table?.board || [], signature = `${table?.id}:${table?.handNumber}:${board.join(',')}`;
  const fresh = signature !== tableSignature; tableSignature = signature;
  const handKey = `${table?.id}:${table?.handNumber}`, actionKey = `${handKey}:${table?.turnId}`;
  const ended = ['showdown','complete'].includes(table?.phase);
  const freshAllIn = tableAudio?.hand === handKey && tableAudio.action !== actionKey && table?.lastAction?.allIn;
  if (freshAllIn) sound('allin');
  if (table && !ended) {
    if (tableAudio?.hand !== handKey || tableAudio?.board !== board.join(',')) sound('deal');
    else if (!freshAllIn && tableAudio.action !== actionKey && table.lastAction) sound(table.lastAction.type);
  }
  tableAudio = table ? {hand:handKey,action:actionKey,board:board.join(',')} : null;
  const winningCards = table?.phase === 'showdown' && table?.showCards ? (table.winners || []).flatMap(w => w.cards || []) : [];
  setHtml('board',Array.from({length:5},(_,i) => cardHtml(board[i],{empty:!board[i],animate:fresh && !!board[i],winning:winningCards.includes(board[i])})).join(''));
  $('potValue').textContent = chips(table?.phase === 'showdown' ? table.lastPot : table?.pot);
  const potScope = `${code}:${table?.id}:${table?.handNumber}`;
  const potAmount = Number(table?.pot || 0), pot = $('potValue').closest('.pot');
  if (lastPotState?.scope !== potScope || potAmount !== lastPotState.amount) {
    pot.classList.remove('chips-moving');
    // Animate confirmed new chips only, not reconnect snapshots or a new deal.
    if (lastPotState?.scope === potScope && potAmount > lastPotState.amount && !ended && !document.hidden) {
      void pot.offsetWidth; pot.classList.add('chips-moving');
    }
    lastPotState = {scope:potScope,amount:potAmount};
  }
  const seatHtml = players.map(p => {
    const position = pokerSeatPosition(p.seat,ownSeat,room.settings?.tableSize,mobile);
    const revealed = (isTv || p.id !== myId) && ['showdown','complete'].includes(table?.phase) && (!p.folded || p.voluntaryShown);
    const cards = revealed && p.holeCards?.length ? p.holeCards.map(c => cardHtml(c)).join('') : (!p.folded ? cardHtml(null,{back:true}) + cardHtml(null,{back:true}) : '');
    const markers = `${p.seat === table.buttonSeat ? '<b class="marker" title="Dealer">D</b>' : ''}${p.seat === table.smallBlindSeat ? '<b class="marker blind" title="Small blind">SB</b>' : ''}${p.seat === table.bigBlindSeat ? '<b class="marker blind" title="Big blind">BB</b>' : ''}`;
    const won = ended && table.winners?.some(w=>w.playerId===p.id);
    const portrait=[...String(p.id)].reduce((n,c)=>n+c.charCodeAt(0),0)%9;
    const avatar=p.avatar?`<img class="seat-avatar" src="${esc(p.avatar)}" alt="">`:`<span class="seat-avatar avatar-character" style="--avatar-x:${portrait%3*50}%;--avatar-y:${Math.floor(portrait/3)*50}%" aria-hidden="true"></span>`;
    const status = won ? 'Pot winner' : p.voluntaryShown ? (p.folded ? 'Folded · Shown' : 'Hand shown') : p.folded ? 'Folded' : p.allIn ? 'All in' : p.away ? 'Away' : '';
    return `<div class="seat ${won ? 'pot-winner' : ''} ${p.id === myId ? 'you' : ''} ${p.id === table.actorId ? 'active' : ''} ${p.folded && !p.voluntaryShown ? 'folded' : ''}" style="left:${position[0]}%;top:${position[1]}%"><span class="markers">${markers}</span>${avatar}<div class="seat-label"><span class="seat-name">${esc(p.name)}${p.id === myId ? ' · You' : ''}</span><span class="seat-stack">${chips(p.stack)}</span>${status ? `<span class="seat-status">${status}</span>` : ''}</div><div class="seat-cards">${cards}</div>${p.bet ? `<span class="seat-bet">Bet ${chips(p.bet)}</span>` : ''}</div>`;
  }).join('');
  setHtml('seats',seatHtml);
  const winners = table?.winners || [];
  const showWin = winners.length > 0 && ['showdown','complete'].includes(table?.phase);
  $('winnerToast').hidden = !showWin;
  if (showWin) {
    const texts = winners.map(w => typeof w === 'string' ? nameOf(w) : `${w.name || nameOf(w.playerId || w.id)}${w.amount ? ' +' + chips(w.amount) : ''}`);
    const handNames = [...new Set(winners.map(w => w.handName).filter(name => name && name !== 'Uncontested'))];
    $('winnerToast').textContent = texts.join(' · ') + (winners.length > 1 ? ' · Pot awarded' : ' wins this hand!') + (handNames.length ? ' · ' + handNames.join(' / ') : '');
    const win = `${code}:${table?.id}:${table?.handNumber}:${texts.join(',')}`; if (win !== lastWin) { if(room.status !== 'finished')sound(table.showCards ? 'crowdWin' : 'win'); lastWin = win; }
  }
}
function renderHand(table) {
  const player = myPlayer(), seat = table?.players?.find(p => p.id === session.playerId);
  $('myHand').hidden = isTv || !player || (room.status === 'finished' && !seat?.holeCards?.length);
  const blind = Number(table?.bigBlind || room.bigBlind || 0);
  const stackBB = blind > 0 ? ` · ${(Number(player?.stack || 0)/blind).toLocaleString(undefined,{maximumFractionDigits:1})} BB` : '';
  $('myStack').textContent = `${chips(player?.stack)} chips${stackBB}`;
  $('myStack').title = 'BB means big blinds: your remaining stack divided by the big blind for this hand.';
  const privateCards = cardsHidden ? [null,null] : seat?.holeCards || [];
  const signature = JSON.stringify([privateCards,cardsHidden]);
  if (signature !== playerSignature) { const html = privateCards.length ? privateCards.map(c => cardHtml(c,{back:cardsHidden,animate:!cardsHidden})).join('') : cardHtml(null,{back:true}) + cardHtml(null,{back:true}); $('privateCards').innerHTML = html; $('bettingHand').innerHTML = html; $('preselectHand').innerHTML = html; playerSignature = signature; }
  $('hideCardsButton').textContent = cardsHidden ? 'Show cards' : 'Hide cards'; $('hideCardsButton').setAttribute('aria-pressed',String(cardsHidden));
  for(const id of ['preHideCards','dockHideCards']){$(id).textContent=cardsHidden?'Show':'Hide';$(id).setAttribute('aria-pressed',String(cardsHidden));}
  const handName = !isTv && !cardsHidden && seat?.holeCards?.length === 2 ? table?.yourHandName : '';
  for (const id of ['myHandName','bettingHandName','preselectHandName']) { $(id).hidden = !handName; $(id).textContent = handName ? `Your hand: ${handName}` : ''; }
  $('showHandPanel').hidden = isTv || !seat || (!table?.canShowHand && !seat.voluntaryShown);
  $('showHandButton').textContent = seat?.voluntaryShown ? 'Hand shown to everyone' : 'Show hand to everyone';
  $('showHandButton').disabled = busy || !table?.canShowHand;
  $('showHandHelp').textContent = seat?.voluntaryShown ? 'These cards are visible to the other players and the TV.' : 'Optional after the hand ends. Keep your cards private, or show both to the table and TV.';
  $('sitOutButton').textContent = player?.away || seat?.away ? 'I’m back' : 'Sit out'; $('sitOutButton').disabled = busy || !['playing','paused'].includes(room.status);
  $('myStatus').textContent = room.status === 'paused' ? 'The host paused the game.' : player?.status === 'eliminated' ? room.canRebuy ? 'Your stack is out. You can buy back in below.' : 'Your stack is out. Stay to watch the rest of the game.' : player?.away || seat?.away ? 'Sitting out. Blinds continue; turns automatically check or fold.' : seat?.folded ? 'You folded. Watch this hand and get ready for the next.' : seat?.allIn ? 'You’re all in. Good luck.' : table?.actorId === session.playerId ? 'Your turn. Choose your move below.' : !seat ? 'Waiting to be seated for the next hand.' : 'Your cards are private. Watch the table for your turn.';
  if (seat?.voluntaryShown) $('myStatus').textContent = 'You chose to show this hand to everyone.';
  if (!isTv && room.missedBlinds) $('myStatus').textContent += ` Late entry: ${chips(room.missedBlinds)} chips deducted for your share of missed small and big blinds.`;
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
  const table = room.table, legal = table?.legalActions || {}, turn = !isTv && room.status === 'playing' && table?.actorId === session.playerId && !busy && !syncNeeded && (!table.deadline || dateValue(table.deadline) > now());
  document.body.dataset.pokerTurn = String(turn);
  $('bettingControls').hidden = !turn;
  $('foldButton').disabled = !turn || !legal.canFold;
  $('callButton').disabled = !turn || (!legal.canCheck && !(legal.callAmount > 0));
  const stack = table?.players?.find(p => p.id === session.playerId)?.stack;
  $('callButton').textContent = legal.canCheck ? 'Check' : `${legal.callAmount >= stack ? 'All-in call' : 'Call'} ${chips(legal.callAmount)}`;
  $('raiseOpen').disabled = !turn || !legal.canRaise;
  const turnKey = `${table?.id}:${table?.handNumber}:${table?.turnId}`;
  if (turnKey !== lastTurn) { raiseOpen = false; exactDirty = false; lastTurn = turnKey; }
  if(turn && document.visibilityState === 'visible' && lastNotifiedTurn !== turnKey){sound('turn');if(navigator.vibrate)navigator.vibrate(90);lastNotifiedTurn=turnKey;}
  $('raisePanel').hidden = !raiseOpen || !turn || !legal.canRaise;
  $('raiseOpen').textContent = raiseOpen ? 'Cancel' : Number(table?.currentBet || 0) ? 'Raise' : 'Bet';
  $('raiseOpen').setAttribute('aria-expanded',String(raiseOpen && turn));
  const min = Number(legal.minRaiseTo || 0), max = Number(legal.maxRaiseTo || 0);
  $('raiseAmount').min = String(Math.min(min,max)); $('raiseAmount').max = String(max); $('raiseAmount').step = '1';
  if (Number($('raiseAmount').value) < min || Number($('raiseAmount').value) > max) $('raiseAmount').value = String(Math.min(min,max));
  updateRaise();
  $('rebuyButton').disabled = busy; $('startButton').disabled = busy || (room.players||[]).filter(p=>!p.removed).length < 2;
  $('showHandButton').disabled = busy || !table?.canShowHand;
  $('nextButton').disabled = busy || room.status !== 'playing' || !room.nextHandAt || seconds(dateValue(room.nextHandAt)) > 0;
  updatePreselection();
}
function updatePreselection() {
  const options = preselectOptions(room,session.playerId), decision = resolvePreselection(preselection,room,session.playerId);
  if (decision.state === 'cancel') { preselection = null; preRaiseOpen = false; note(decision.reason); }
  $('preselectControls').hidden = isTv || syncNeeded || !options.waiting;
  $('preCall').textContent = options.callAmount ? `Call ${chips(options.callAmount)}` : 'Check';
  for (const [id,move] of [['preFold','fold'],['preCall','call'],['preRaise','raise']]) {
    $(id).setAttribute('aria-pressed',String(preselection?.move === move));
    $(id).disabled = busy || !options.waiting || (move === 'raise' && !options.canRaise);
  }
  $('preRaisePanel').hidden = !preRaiseOpen || !options.waiting || !options.canRaise;
  const input = $('preRaiseAmount'); input.min = String(options.minRaiseTo); input.max = String(options.maxRaiseTo);
  if (!Number(input.value) || Number(input.value) < options.minRaiseTo || Number(input.value) > options.maxRaiseTo) input.value = String(options.minRaiseTo);
  updatePreRaise();
  $('queueRaise').disabled = busy || !options.waiting || !options.canRaise;
  $('cancelPreselection').hidden = !preselection && !preRaiseOpen;
  $('preselectionStatus').textContent = preselection ? `Selected: ${preselection.move === 'fold' ? 'Fold' : preselection.move === 'raise' ? 'Raise to ' + chips(preselection.amount) : preselection.callAmount ? 'Call ' + chips(preselection.callAmount) : 'Check'}. Plays automatically on your turn. Tap again or cancel to change it.` : 'Optional. Pick your next move while you wait. Calls and raises clear if the bet changes. Keep this page open.';
}
function updatePreRaise() {
  const amount = Number($('preRaiseAmount').value), options = preselectOptions(room,session.playerId);
  $('preRaiseOutput').textContent = chips(amount);
  $('queueRaise').textContent = `Preselect ${amount === options.maxRaiseTo ? 'all in' : 'raise to'} ${chips(amount)}`;
}
async function selectMove(move, amount) {
  if (busy || syncNeeded || isTv) return;
  if (preselection?.move === move && move !== 'raise') { preselection = null; updatePreselection(); return; }
  const candidate = choosePreselection(room,session.playerId,move,amount);
  if (!candidate) return;
  if ((move === 'raise' && amount === candidate.stack + candidate.streetBet) || (move === 'call' && candidate.callAmount === candidate.stack)) {
    preselection = null;
    if (!await confirmAction('Preselect all in?', `When your turn arrives, this will commit all ${chips(candidate.stack)} remaining virtual chips if the bet is unchanged.`, 'Preselect all in')) { updatePreselection(); return; }
  }
  if (resolvePreselection(candidate,room,session.playerId).state !== 'waiting') { updatePreselection(); return note('The table changed. Review it before selecting your move.'); }
  preselection = candidate; preRaiseOpen = false; updatePreselection();
}
function runPreselection() {
  if (!preselection || busy || syncNeeded || isTv || document.hidden || confirmResolve) return;
  const decision = resolvePreselection(preselection,room,session.playerId), deadline = dateValue(room?.table?.deadline);
  if (decision.state !== 'ready' || (deadline && deadline <= now())) return;
  // Clear before sending: a network failure must never repeat a queued bet.
  preselection = null; preRaiseOpen = false;
  void bet(decision.move,decision.amount,{preselected:true});
}
$('preFold').onclick = () => void selectMove('fold');
$('preCall').onclick = () => void selectMove('call');
$('preRaise').onclick = () => {
  if (preselection?.move === 'raise') { preselection = null; preRaiseOpen = false; }
  else { preselection = null; preRaiseOpen = !preRaiseOpen; $('preRaiseAmount').value = String(preselectOptions(room,session.playerId).minRaiseTo); }
  updatePreselection();
};
$('preRaiseAmount').oninput = updatePreRaise;
$('queueRaise').onclick = () => void selectMove('raise',Number($('preRaiseAmount').value));
$('cancelPreselection').onclick = () => { preselection = null; preRaiseOpen = false; updatePreselection(); };
const exactLabel = document.createElement('label'); exactLabel.className = 'raise-exact-label'; exactLabel.htmlFor = 'raiseExact'; exactLabel.textContent = 'Total chips';
const exactInput = document.createElement('input'); exactInput.id = 'raiseExact'; exactInput.className = 'raise-exact'; exactInput.type = 'number'; exactInput.inputMode = 'numeric'; exactInput.step = '1'; exactInput.autocomplete = 'off';
$('raiseAmount').after(exactLabel,exactInput);
const raiseSummary = document.createElement('p'); raiseSummary.id = 'raiseSummary'; raiseSummary.className = 'hint';
exactInput.after(raiseSummary);
function updateRaise() {
  const amount = Number($('raiseAmount').value), table = room?.table, all = amount === Number(table?.legalActions?.maxRaiseTo);
  $('raiseOutput').textContent = chips(amount); $('raiseAmount').setAttribute('aria-valuetext',`${chips(amount)} total chips`);
  if (document.activeElement !== exactInput && !exactDirty) exactInput.value = String(amount);
  exactInput.min = $('raiseAmount').min; exactInput.max = $('raiseAmount').max;
  const exactValid = !exactDirty || (exactInput.value !== '' && validRaise(table,Number(exactInput.value)));
  $('raiseButton').textContent = `${all ? 'All in' : Number(table?.currentBet || 0) ? 'Raise to' : 'Bet'} ${chips(amount)}`;
  $('raiseButton').disabled = busy || syncNeeded || !exactValid || !validRaise(table,amount);
  const own = table?.players?.find(p => p.id === session.playerId);
  const added = Math.max(0,amount - Number(own?.streetBet || 0));
  raiseSummary.textContent = exactValid && validRaise(table,amount)
    ? `Adds ${chips(added)} chips · ${chips(Math.max(0,Number(own?.stack || 0)-added))} left in your stack.`
    : 'Choose a valid total bet before submitting.';
  for (const button of document.querySelectorAll('[data-bet]')) {
    const value = raisePreset(table,button.dataset.bet), label = {min:'Min',half:'½ pot',pot:'Pot',all:'All in'}[button.dataset.bet];
    button.textContent = `${label} · ${chips(value)}`; button.setAttribute('aria-label',`${label}, ${chips(value)} total chips`); button.setAttribute('aria-pressed',String(value === amount));
  }
}
exactInput.oninput = () => {
  exactDirty = true;
  const amount = Number(exactInput.value);
  if (exactInput.value && validRaise(room?.table,amount)) $('raiseAmount').value = String(amount);
  updateRaise();
};
exactInput.onblur = () => {
  if (!exactInput.value || !validRaise(room?.table,Number(exactInput.value))) note(`Enter ${chips($('raiseAmount').min)}–${chips($('raiseAmount').max)} total chips.`,true);
  updateRaise();
};
$('raiseAmount').oninput = () => { exactDirty = false; updateRaise(); };
$('raiseOpen').onclick = () => { raiseOpen = !raiseOpen; if (raiseOpen) { exactDirty = false; $('raiseAmount').value = String(Math.min(room.table.legalActions.minRaiseTo,room.table.legalActions.maxRaiseTo)); exactInput.value = $('raiseAmount').value; } updateControls(); };
document.querySelectorAll('[data-bet]').forEach(button => button.onclick = () => { exactDirty = false; $('raiseAmount').value = String(raisePreset(room?.table,button.dataset.bet)); exactInput.value = $('raiseAmount').value; updateRaise(); });
async function bet(move, amount, {preselected = false} = {}) {
  if (busy || syncNeeded || !room?.table || room.table.actorId !== session.playerId || (room.table.deadline && dateValue(room.table.deadline) <= now())) return;
  const table = room.table, hand = {tableId:table.id,handNumber:table.handNumber,turnId:table.turnId}, player = table.players?.find(p => p.id === session.playerId);
  if (move === 'raise' && !validRaise(table,amount)) return note('Choose a whole-chip amount within the allowed raise range.',true);
  if (!preselected && move === 'fold' && table.legalActions?.canCheck) {
    if (!await confirmAction('Check instead?', 'You can stay in this hand without adding chips. Fold only if you want to give up your hand.', 'Fold anyway')) return;
    if (room?.table?.turnId !== hand.turnId || room?.table?.handNumber !== hand.handNumber || room?.table?.id !== hand.tableId) return note('The turn changed. Review the current table.');
  }
  if (!preselected && (move === 'raise' && amount >= table.legalActions.maxRaiseTo || move === 'call' && table.legalActions.callAmount >= (player?.stack || Infinity))) {
    if (!await confirmAction('Put your stack in?', `This commits all ${chips(player?.stack)} of your remaining virtual chips to this hand.`, 'Go all in')) return;
    if (room?.table?.id !== hand.tableId || room?.table?.turnId !== hand.turnId || room?.table?.handNumber !== hand.handNumber) return note('The turn changed while the confirmation was open. Review the current table.');
  }
  await act('bet',{...hand,move,...(amount !== undefined ? {amount} : {})});
}
$('foldButton').onclick = () => bet('fold');
$('callButton').onclick = () => bet(room?.table?.legalActions?.canCheck ? 'check' : 'call');
$('raiseButton').onclick = () => bet('raise',Number($('raiseAmount').value));
$('hideCardsButton').onclick = () => { cardsHidden = !cardsHidden; renderHand(room?.table); };
for(const id of ['preHideCards','dockHideCards'])$(id).onclick=()=>$('hideCardsButton').click();
$('showHandButton').onclick = () => { if (room?.table?.canShowHand) void act('show',{tableId:room.table.id,handNumber:room.table.handNumber}); };
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
  const duration = Number(room.table?.turnSeconds || room.settings?.turnSeconds || 25);
  $('turnProgress').max = duration;
  $('turnProgress').value = Math.min(duration,remaining);
  $('turnProgress').hidden = !deadline || room.status !== 'playing';
  $('turnProgress').classList.toggle('urgent',remaining > 0 && remaining <= 5);
  $('turnClock').setAttribute('aria-label',room.status === 'paused' ? 'Game paused' : `${nameOf(room.table?.actorId)}: ${remaining} seconds to act`);
  $('turnClock').title = room.table?.legalActions?.canCheck && room.table?.actorId === session.playerId
    ? 'If time runs out, your hand checks automatically.' : 'If time runs out, a player checks when free or folds when facing a bet.';
  const ownTurn=!isTv && room.status==='playing' && room.table?.actorId===session.playerId;
  $('turnPrompt').textContent=ownTurn ? `${remaining}s to act` : 'Your turn';
  $('bettingControls').classList.toggle('urgent',ownTurn && remaining>0 && remaining<=5);
  const warningKey=`${room.table?.id}:${room.table?.handNumber}:${room.table?.turnId}`;
  if(ownTurn && remaining>0 && remaining<=5 && document.visibilityState==='visible' && !muted && lastWarning!==warningKey){if(sound('warning'))lastWarning=warningKey;}

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
document.addEventListener('visibilitychange',() => { if (document.hidden) pokerAudio.silence(); else void poll(); });
window.addEventListener('pagehide',()=>pokerAudio.silence());
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
