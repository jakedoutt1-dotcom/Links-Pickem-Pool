import {
  CARD_STORAGE_KEY, MAX_CARD_SIZE, calculateReturn, isFreshSelection,
  normalizeBook, parseEvents, validateCard,
} from './domain.mjs';

const BOOK_URLS = Object.freeze({
  draftkings: 'https://sportsbook.draftkings.com/',
  fanduel: 'https://sportsbook.fanduel.com/',
  betmgm: 'https://sports.betmgm.com/',
  caesars: 'https://www.caesars.com/sportsbook-and-casino',
  bet365: 'https://www.bet365.com/',
});
const MARKET_NAMES = Object.freeze({ moneyline: 'Moneyline', spread: 'Spread', total: 'Total' });
const state = {
  sport: 'NFL', book: 'all', market: 'all', selections: [], card: [], eventBooks: new Map(),
  config: { mode: 'preview', oddsConnected: false, aiConnected: false },
  hasLoaded: false, loading: false, analyzing: false, storageAvailable: true,
  oddsController: null, aiController: null, remaining: null, testingPass: false, marketCount: 6, aiLastRequestFailed: false,
};
let ui;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function emptyState(title, description, icon = '◇') {
  const node = element('div', 'empty-state');
  const glyph = element('div', 'empty-icon', icon);
  glyph.setAttribute('aria-hidden', 'true');
  node.append(glyph, element('h3', 'empty-title', title), element('p', 'empty-description', description));
  return node;
}

function setStatus(node, message, error = false) {
  node.textContent = message;
  node.classList.toggle('is-error', error);
  if (node.id === 'board-error') node.hidden = !message;
}

function oddsText(odds) { return odds > 0 ? `+${odds}` : String(odds); }
function money(value) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value); }
function dateText(iso) {
  return new Date(iso).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
function updatedText(iso) {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60000));
  return minutes < 1 ? 'Source updated <1m ago' : `Source updated ${minutes}m ago`;
}

function accountHeaders(){try{const token=localStorage.getItem('links-account-token');return token&&token.length<=500?{'x-links-account':token}:{}}catch{return {}}}
function applyAllowance(payload){state.testingPass=payload.testingPass===true;if(state.testingPass){state.remaining=payload.available===false?0:null;ui.aiRemaining.textContent=payload.available===false?'Lifetime testing pass · service capacity reached':'Lifetime testing pass · no daily analysis limit';return true}if(payload.limitEnforced===true&&Number.isSafeInteger(payload.remaining)&&payload.remaining>=0){state.remaining=payload.remaining;ui.aiRemaining.textContent=`${payload.remaining} analyses remaining`;return true}return false}
async function requestJSON(path, { method = 'GET', body, controller = new AbortController(), timeout = 15000 } = {}) {
  const timer = setTimeout(() => controller.abort(new Error('Request timed out. Please try again.')), timeout);
  try {
    const response = await fetch(path, {
      method, signal: controller.signal, credentials: 'same-origin', cache: 'no-store',
      headers: { ...accountHeaders(), Accept: 'application/json', 'X-Playmaker-Client': 'web', ...(body?{'Content-Type':'application/json'}:{}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) throw new Error('The service returned an unexpected response. Try again later.');
    const payload = await response.json();
    if (!response.ok || payload?.success === false || payload?.ok === false) {
      const error = new Error(typeof payload?.error === 'string' ? payload.error.slice(0, 300) : 'The service is unavailable. Please try again later.');
      error.code = payload?.code;
      throw error;
    }
    return payload;
  } catch (error) {
    if (controller.signal.aborted) {
      const abort = new Error(controller.signal.reason?.message || 'Request cancelled.');
      abort.name = 'AbortError';
      throw abort;
    }
    throw error;
  } finally { clearTimeout(timer); }
}

function saveCard() {
  try { localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(state.card)); }
  catch { state.storageAvailable = false; }
  updatePrivacy();
}

function loadCard() {
  try {
    const raw = localStorage.getItem(CARD_STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    state.card = validateCard(saved);
    if (!Array.isArray(saved) || state.card.length !== saved.length) {
      setStatus(ui.cardStatus, 'Expired or invalid saved selections were removed. Load fresh odds before adding them again.');
    } else if (state.card.length) {
      setStatus(ui.cardStatus, `${state.card.length} current selection${state.card.length === 1 ? '' : 's'} restored from this browser. Confirm final odds at your sportsbook.`);
    }
    saveCard();
  } catch {
    state.card = [];
    // A corrupt card is safe to discard; a browser may also prohibit storage.
    try { localStorage.removeItem(CARD_STORAGE_KEY); }
    catch { state.storageAvailable = false; }
  }
}

function updatePrivacy() {
  ui.privacyNote.textContent = state.storageAvailable
    ? 'Your card is saved only in this browser. Clear it on a shared device. When AI is connected, analysis sends your selected lines and question to the analysis service.'
    : 'Browser storage is unavailable. Your card lasts for this visit only. When AI is connected, analysis sends your selected lines and question to the analysis service.';
}

function invalidateAnalysis() {
  if (state.aiController) state.aiController.abort(new Error('Analysis cancelled because your card changed.'));
  ui.analysisOutput.replaceChildren(emptyState('Make your next move informed.', 'Ask about the markets, or add real sportsbook selections to your card. The analyst can explain price, assumptions, and risks.', '⌁'));
  if (!state.analyzing) setStatus(ui.analysisStatus, state.aiLastRequestFailed ? 'The existing AI service failed its last request. Backend repair is pending.' : state.config.aiConnected ? 'Ready for your question or card.' : 'AI analysis is temporarily unavailable.', state.aiLastRequestFailed);
}

function pruneCard() {
  const before = state.card.length;
  state.card = validateCard(state.card);
  if (before !== state.card.length) {
    saveCard();
    invalidateAnalysis();
    setStatus(ui.cardStatus, 'A selection expired or its event started. Load fresh odds to rebuild your card.');
    renderCard();
    return true;
  }
  return false;
}

function renderBoard() {
  ui.marketList.replaceChildren();
  const visible = state.selections.filter((pick) => isFreshSelection(pick)
    && (state.book === 'all' || pick.bookmakerId === state.book)
    && (state.market === 'all' || pick.market === state.market));
  if (!visible.length) {
    const title = state.loading ? 'Finding the current lines…' : state.hasLoaded ? 'No qualifying lines available.' : 'The board is yours.';
    const description = state.loading ? 'Checking the selected league for available pregame markets.'
      : state.hasLoaded ? 'Try another sportsbook or market, or refresh. Missing, expired, and started-event prices stay off this board.'
        : 'Choose your sport and sportsbook, then load the board. Only connected, timestamped prices appear here.';
    ui.marketList.append(!state.loading && !state.hasLoaded && ui.boardEmpty
      ? ui.boardEmpty.cloneNode(true) : emptyState(title, description, '↗'));
    setStatus(ui.boardStatus, state.loading ? 'Loading odds…' : state.hasLoaded ? 'No fresh selections' : 'Awaiting live connection');
    return;
  }
  // One card per event. Books are alternative quotes, not separate games.
  const events = new Map();
  for (const pick of visible) {
    if (!events.has(pick.eventId)) events.set(pick.eventId, []);
    events.get(pick.eventId).push(pick);
  }
  const ordered = [...events.values()].sort((a,b)=>Date.parse(a[0].startTime)-Date.parse(b[0].startTime)||a[0].eventName.localeCompare(b[0].eventName));
  for (const eventPicks of ordered.slice(0, state.marketCount)) {
    const first = eventPicks[0], books = new Map(eventPicks.map(p=>[p.bookmakerId,p.bookmakerName]));
    const selected = state.eventBooks.get(first.eventId);
    const book = state.book !== 'all' ? state.book : books.has(selected) ? selected : books.has('draftkings') ? 'draftkings' : books.keys().next().value;
    const card = element('article', 'market-card');
    const meta = element('div', 'market-meta');
    meta.append(element('span', 'status-pill', `${first.league || first.sport} · Pregame`), element('span', '', dateText(first.startTime)));
    card.append(meta,element('h3','matchup',first.eventName));
    if (state.book === 'all') {
      const label=element('label','event-book-label',`Compare sportsbooks · ${books.size} available`),select=element('select','event-book-select');
      select.setAttribute('aria-label',`Sportsbook for ${first.eventName}`);
      for(const [id,name] of [...books].sort((a,b)=>a[1].localeCompare(b[1]))){const option=element('option','',name);option.value=id;select.append(option);}
      select.value=book;
      select.addEventListener('change',()=>{state.eventBooks.set(first.eventId,select.value);const index=ordered.indexOf(eventPicks);renderBoard();ui.marketList.querySelectorAll('.event-book-select')[index]?.focus({preventScroll:true});});
      label.append(select);card.append(label);
    } else card.append(element('div','book-label',books.get(book)));
    const groups=new Map();
    for(const pick of eventPicks.filter(p=>p.bookmakerId===book)){
      const lineKey=pick.market==='spread'?Math.abs(pick.line):pick.line??'';
      const key=`${pick.market}:${lineKey}`;
      if(!groups.has(key))groups.set(key,[]);groups.get(key).push(pick);
    }
    for(const picks of groups.values()){
      const market=element('section','event-market');
      market.append(element('h4','market-meta',`${MARKET_NAMES[picks[0].market]} · Full game`));
      const choices=element('div','market-picks');
      for(const pick of picks){
        const chosen=state.card.some(item=>item.id===pick.id);
        const button=element('button',`pick-button${chosen?' selected':''}`);button.type='button';
        button.setAttribute('aria-pressed',String(chosen));
        button.setAttribute('aria-label',`${chosen?'Remove':'Add'} ${pick.label}, ${oddsText(pick.americanOdds)}, ${pick.bookmakerName}`);
        button.append(element('span','pick-label',pick.label),element('strong','pick-odds',oddsText(pick.americanOdds)));
        button.addEventListener('click',()=>togglePick(pick));choices.append(button);
      }
      market.append(choices);
      const oldest=picks.reduce((a,b)=>Date.parse(a.updatedAt)<Date.parse(b.updatedAt)?a:b);
      const updated=element('small','market-meta',updatedText(oldest.updatedAt));updated.title=`Provider update: ${dateText(oldest.updatedAt)}`;
      market.append(updated);card.append(market);
    }
    ui.marketList.append(card);
  }
  if(events.size>state.marketCount){
    const more=element('button','button-icon-text','Show more games');more.type='button';more.addEventListener('click',()=>{state.marketCount+=6;renderBoard();});ui.marketList.append(more);
  }
  setStatus(ui.boardStatus, `${events.size} games · showing ${Math.min(events.size,state.marketCount)} · compare sportsbook prices within each matchup`);
}

function renderReturn() {
  const result = calculateReturn(state.card, ui.stake.value);
  ui.payout.textContent = result.valid ? money(result.payout) : '—';
  ui.payout.title = result.valid ? `Includes stake. Potential profit: ${money(result.profit)}. This is arithmetic, not a sportsbook quote or a prediction.` : result.reason;
  const explanation = document.getElementById('payout-note');
  if (explanation) explanation.textContent = result.valid
    ? `Includes stake · ${money(result.profit)} potential profit. Confirm the final price at your sportsbook.`
    : state.card.length ? result.reason : 'Add a selection to estimate a return. Includes stake.';
}

function renderCard() {
  ui.cardList.replaceChildren();
  ui.cardCount.textContent = String(state.card.length);
  ui.clearCard.disabled = state.card.length === 0;
  updateOpenBook();
  for (const pick of state.card) {
    const item = element('div', 'card-item');
    item.setAttribute('role', 'listitem');
    const info = element('div', 'card-item-info');
    const details = element('span', '', `${pick.eventName} · ${MARKET_NAMES[pick.market]}`);
    info.append(element('strong', '', pick.label), details,
      element('small', '', `${pick.bookmakerName} · ${oddsText(pick.americanOdds)} · ${updatedText(pick.updatedAt)}`));
    const remove = element('button', 'remove-pick', '×');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Remove ${pick.label}`);
    remove.addEventListener('click', () => togglePick(pick));
    item.append(info, remove);
    ui.cardList.append(item);
  }
  if (!state.card.length) ui.cardList.append(element('p','empty-play-note','No picks yet. Build a bet with AI or choose a game above.'));
  document.querySelector('#my-play .card-calculator').hidden=state.card.length===0;
  document.querySelector('#my-play .card-meta').hidden=state.card.length===0;
  renderReturn();
  updateAnalyzeButton();
}

function togglePick(pick) {
  pruneCard();
  const index = state.card.findIndex((item) => item.id === pick.id);
  if (index >= 0) state.card.splice(index, 1);
  else {
    if (!isFreshSelection(pick)) { setStatus(ui.cardStatus, 'That line has expired. Refresh the board for a current price.', true); renderBoard(); return; }
    if (state.card.length && state.card[0].league !== pick.league) { setStatus(ui.cardStatus, 'Keep one sport on each card. Clear your current card before adding another sport.', true); return; }
    if (state.card.length >= MAX_CARD_SIZE) { setStatus(ui.cardStatus, `Your card can hold ${MAX_CARD_SIZE} selections. Remove one to continue.`, true); return; }
    state.card.push({ ...pick });
  }
  saveCard();
  invalidateAnalysis();
  renderCard();
  renderBoard();
  setStatus(ui.cardStatus, state.card.length ? `${state.card.length} selection${state.card.length === 1 ? '' : 's'} on your card. Final odds are confirmed at your sportsbook.` : 'Your card is clear.');
}

async function loadOdds({ replace = false } = {}) {
  if (state.loading && !replace) {
    state.oddsController?.abort(new Error('Odds request cancelled.'));
    return;
  }
  state.oddsController?.abort(new Error('The selected sport changed.'));
  state.loading = true;
  state.marketCount = 6;
  state.selections = [];
  state.hasLoaded = false;
  state.oddsController = new AbortController();
  const controller = state.oddsController;
  const sport = state.sport;
  ui.refresh.textContent = 'Cancel loading';
  ui.refresh.setAttribute('aria-busy', 'true');
  setStatus(ui.boardError, '');
  renderBoard();
  try {
    // The server gateway reuses the existing feed; no provider key reaches the browser.
    const payload = await requestJSON(`/new-build/api/playmaker-public?action=odds&leagueID=${encodeURIComponent(sport)}&limit=20`, { controller });
    if (state.oddsController !== controller) return;
    state.selections = parseEvents(payload, 'all');
    state.hasLoaded = true;
  } catch (error) {
    if (state.oddsController !== controller) return;
    setStatus(ui.boardError, error.message || 'Unable to load odds. Check your connection and try again.', error.name !== 'AbortError');
  } finally {
    if (state.oddsController !== controller) return;
    state.loading = false;
    state.oddsController = null;
    ui.refresh.textContent = 'Refresh odds';
    ui.refresh.removeAttribute('aria-busy');
    renderBoard();
  }
}

function updateAnalyzeButton() {
  ui.analyze.disabled = !state.analyzing && (!state.config.aiConnected || state.remaining === 0 || (document.getElementById('request-mode').value!=='build' && state.card.length === 0 && !ui.question.value.trim()));
  ui.analyze.textContent = state.analyzing ? 'Cancel analysis' : document.getElementById('request-mode').value==='build' ? 'Build My Bet' : state.card.length ? 'Analyze my card' : 'Ask Playmaker';
  ui.analyze.setAttribute('aria-busy', String(state.analyzing));
}

function requestCard() {
  return state.card.map((pick) => ({
    id: pick.id, event: pick.eventName, eventID: pick.eventId, oddID: pick.oddId,
    market: MARKET_NAMES[pick.market], selection: pick.label, odds: oddsText(pick.americanOdds),
    bookmaker: pick.bookmakerName, bookmakerID: pick.bookmakerId,
    start: pick.startTime, sourceUpdatedAt: pick.updatedAt,
  }));
}

async function analyze(event) {
  event.preventDefault();
  if (state.analyzing) { state.aiController?.abort(new Error('Analysis cancelled.')); return; }
  if (!state.config.aiConnected) { setStatus(ui.analysisStatus, 'AI analysis is temporarily unavailable.'); return; }
  if (pruneCard()) { setStatus(ui.analysisStatus, 'Your card changed because a price expired. Review your card before analyzing.', true); return; }
  const build=document.getElementById('request-mode').value==='build';
  const question = ui.question.value.trim() || (build?'Build a bet using my selected approach, type and leg count.':'');
  if (!state.card.length && !question) { setStatus(ui.analysisStatus, 'Ask a question or add a current selection to your card.', true); return; }
  if (question.length > 1800) { setStatus(ui.analysisStatus, 'Keep your question to 1,800 characters or fewer.', true); return; }
  const card = requestCard();
  const books = [...new Set(state.card.map((pick) => pick.bookmakerName))];
  state.analyzing = true;
  state.aiController = new AbortController();
  updateAnalyzeButton();
  setStatus(ui.analysisStatus, state.card.length ? 'Reviewing your selected prices and question…' : 'Reviewing your question…');
  ui.analysisOutput.replaceChildren(emptyState('Review in progress', 'Your question and any selected lines are being sent to the connected analysis service.', '⌁'));
  try {
    const payload = await requestJSON('/new-build/api/playmaker-public?action=ai', {
      method: 'POST', controller: state.aiController, timeout: 65000,
      body: {
        question: question || 'Review these selected lines. Explain price, risks, assumptions, and missing information. Do not invent injuries, statistics, or win probabilities.',
        requestId: crypto.randomUUID(), bookmaker: books.join(', '), sport: state.card[0]?.league || state.sport, mode: build?'build':'review',risk:document.getElementById('build-risk').value,kind:document.getElementById('build-kind').value,legs:Number(document.getElementById('build-legs').value),book:state.book,card:build?[]:card,
      },
    });
    if (typeof payload.analysis !== 'string' || !payload.analysis.trim()) throw new Error('The analysis service returned no analysis. Please try again.');
    const output = element('div', 'analysis-text', payload.analysis);
    // Preserve plain text; provider output is never inserted as executable HTML.
    ui.analysisOutput.replaceChildren(output);
    if(build&&Array.isArray(payload.picks)&&payload.picks.length){
      for(const pick of payload.picks){
        const item=element('div','card-item'),info=element('div','card-item-info');
        info.append(element('strong','',`${pick.label} · ${oddsText(pick.americanOdds)}`),element('small','',`${pick.eventName} · ${pick.bookmakerName}`),element('p','',pick.reason));item.append(info);ui.analysisOutput.append(item);
      }
      const use=element('button','button button-primary','Add picks to My Play');use.type='button';
      const confirmation=element('p','analysis-status');confirmation.setAttribute('role','status');
      use.addEventListener('click',()=>{
        if(payload.picks.some(p=>!isFreshSelection(p))){setStatus(confirmation,'These prices expired. Build again for fresh selections.',true);return}
        state.card=payload.picks.map(({reason,...pick})=>pick);saveCard();renderCard();renderBoard();
        const message=`${state.card.length} AI pick${state.card.length===1?'':'s'} added to My Play. Review your picks and estimate a return below.`;
        setStatus(ui.cardStatus,message);setStatus(confirmation,message);
        use.textContent='Card added · View my picks';
        const panel=document.getElementById('my-play');panel.setAttribute('tabindex','-1');
        location.hash='my-play';panel.focus({preventScroll:true});
        panel.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
      });ui.analysisOutput.append(use,confirmation);
    }
    state.aiLastRequestFailed = false;
    const connectionText = ui.connection.querySelector('span:last-child') || ui.connection;
    connectionText.textContent = state.config.oddsConnected ? 'Live odds + AI connected' : 'AI connected · odds unavailable';
    ui.connection.classList.toggle('is-connected', state.config.oddsConnected);
    setStatus(ui.analysisStatus, 'AI review complete. Verify current prices and facts before making a decision.');
    if(!applyAllowance(payload))ui.aiRemaining.textContent='Usage allowance unavailable';
  } catch (error) {
    ui.analysisOutput.replaceChildren(emptyState(error.name === 'AbortError' ? 'Analysis cancelled.' : 'Analysis could not be completed.', 'Your card is still here. You can review your selections and retry when the service is ready.', '⌁'));
    setStatus(ui.analysisStatus, error.message || 'Analysis is unavailable. Try again later.', error.name !== 'AbortError');
    if (['AI_UNAVAILABLE', 'AI_NOT_CONFIGURED', 'AI_CONNECTION_FAILED', 'AI_TIMEOUT'].includes(error.code)) {
      state.aiLastRequestFailed = true;
      const connectionText = ui.connection.querySelector('span:last-child') || ui.connection;
      connectionText.textContent = state.config.oddsConnected ? 'Odds connected · AI request failed' : 'AI request failed';
      ui.connection.classList.remove('is-connected');
    }
    try {
      const health = await requestJSON('/new-build/api/playmaker-public?action=ai', { timeout: 5000 });
      applyAllowance(health);
    } catch { ui.aiRemaining.textContent = 'Usage allowance unavailable'; }
  } finally {
    state.analyzing = false;
    state.aiController = null;
    updateAnalyzeButton();
  }
}

async function checkConnections() {
  try {
    const config = await requestJSON('/new-build/api/playmaker-public?action=config', { timeout: 15000 });
    const preview = config.mode !== 'connected';
    state.config = {
      mode: preview ? 'preview' : 'connected',
      oddsConnected: !preview && config.oddsConnected === true,
      aiConnected: !preview && config.aiConnected === true,
    };
    if (state.config.aiConnected) {
      const health = await requestJSON('/new-build/api/playmaker-public?action=ai', { timeout: 5000 });
      state.config.aiConnected = health.aiConfigured === true;
      state.aiLastRequestFailed = ['failed', 'uncertain'].includes(health.lastRequestStatus);
      applyAllowance(health);
    }
  } catch { state.config = { mode: 'preview', oddsConnected: false, aiConnected: false }; }
  const both = state.config.oddsConnected && state.config.aiConnected;
  const connectionText = ui.connection.querySelector('span:last-child') || ui.connection;
  connectionText.textContent = state.aiLastRequestFailed ? `${state.config.oddsConnected ? 'Odds connected' : 'Odds unavailable'} · AI request failed` : both ? 'Market feed · AI ready for requests' : state.config.oddsConnected ? 'Odds connected · AI unavailable' : state.config.aiConnected ? 'AI service ready · odds unavailable' : 'Services unavailable · retry refresh';
  ui.connection.classList.toggle('is-connected', both && !state.aiLastRequestFailed);
  ui.aiRemaining.textContent = state.testingPass ? (state.remaining===0?'Lifetime testing pass · service capacity reached':'Lifetime testing pass · no daily analysis limit') : !state.config.aiConnected ? 'AI connection pending' : state.remaining === null ? 'Usage allowance unavailable' : `${state.remaining} analyses remaining`;
  setStatus(ui.analysisStatus, state.aiLastRequestFailed ? 'The last AI request did not finish. It used an attempt; you can retry deliberately when the service is available.' : state.config.aiConnected ? 'Ready for your question or card.' : 'AI analysis is temporarily unavailable.', state.aiLastRequestFailed);
  updateAnalyzeButton();
  if (state.config.oddsConnected && !state.hasLoaded && !state.loading) await loadOdds();
}

function chosenBook() {
  const books = [...new Set(state.card.map((pick) => pick.bookmakerId))];
  return state.book !== 'all' ? state.book : books.length === 1 ? books[0] : '';
}

function updateOpenBook() {
  ui.openBook.disabled = !BOOK_URLS[chosenBook()];
  ui.openBook.hidden = state.card.length===0 || ui.openBook.disabled;
  ui.openBook.title = ui.openBook.disabled ? 'Choose a sportsbook in the board filter first.' : 'Open the sportsbook website. No selections or bets are transferred.';
}

function openBook() {
  const selected = chosenBook();
  if (!BOOK_URLS[selected]) { setStatus(ui.cardStatus, 'Choose a sportsbook in the board filter to open its website.'); return; }
  window.open(BOOK_URLS[selected], '_blank', 'noopener,noreferrer');
  setStatus(ui.cardStatus, 'Sportsbook opened. No bets are placed or transferred by Playmaker. Availability depends on your location.');
}

function initialize() {
  const get = (id) => document.getElementById(id);
  ui = {
    connection: get('connection-status'), refresh: get('refresh-odds'), sports: get('sport-filters'),
    book: get('book-filter'), market: get('market-filter'), marketList: get('market-list'),
    boardStatus: get('board-status'), boardError: get('board-error'), cardList: get('card-list'),
    cardCount: get('card-count'), clearCard: get('clear-card'), stake: get('stake-input'),
    payout: get('payout-value'), cardStatus: get('card-status'), form: get('analysis-form'),
    question: get('question-input'), analyze: get('analyze-button'), analysisOutput: get('analysis-output'),
    analysisStatus: get('analysis-status'), aiRemaining: get('ai-remaining'), prompts: get('quick-prompts'),
    openBook: get('open-book'), privacyNote: get('privacy-note'), guide: get('guide-dialog'),
    guideOpen: get('how-it-works'), guideClose: get('close-guide'),
  };
  if (Object.values(ui).some((node) => !node)) throw new Error('Playmaker markup is missing a required application control.');
  ui.boardEmpty = ui.marketList.firstElementChild?.cloneNode(true);
  state.book = normalizeBook(ui.book.value) || 'all';
  state.market = ui.market.value || 'all';
  ui.cardList.setAttribute('role', 'list');
  ui.question.maxLength = 1800;
  ui.question.required = false;
  ui.refresh.addEventListener('click', () => state.config.oddsConnected ? loadOdds() : checkConnections());
  ui.sports.querySelectorAll('[data-sport]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.sport === state.sport));
    button.addEventListener('click', () => {
      if (state.sport === button.dataset.sport) return;
      state.sport = button.dataset.sport;
      state.marketCount = 6;
      state.selections = [];
      state.hasLoaded = false;
      ui.sports.querySelectorAll('[data-sport]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      setStatus(ui.boardError, '');
      renderBoard();
      if (state.config.oddsConnected) loadOdds({ replace: true });
    });
  });
  ui.book.addEventListener('change', () => { state.book = normalizeBook(ui.book.value) || 'all'; state.marketCount = 6; renderBoard(); updateOpenBook(); });
  ui.market.addEventListener('change', () => { state.market = ui.market.value; state.marketCount = 6; renderBoard(); });
  ui.clearCard.addEventListener('click', () => {
    state.card = [];
    saveCard();
    invalidateAnalysis();
    renderCard();
    renderBoard();
    setStatus(ui.cardStatus, 'Your card is clear.');
  });
  ui.stake.addEventListener('input', renderReturn);
  ui.form.addEventListener('submit', analyze);
  const mode=get('request-mode'),options=get('builder-options'),kind=get('build-kind');
  mode.addEventListener('change',()=>{options.hidden=mode.value!=='build';updateAnalyzeButton();});
  kind.addEventListener('change',()=>{get('build-legs').disabled=kind.value==='single';});
  ui.question.addEventListener('input', updateAnalyzeButton);
  ui.prompts.querySelectorAll('[data-prompt]').forEach((button) => {
    button.addEventListener('click', () => {
      ui.question.value = button.dataset.prompt.slice(0, 2000);
      updateAnalyzeButton();
      ui.question.focus();
      ui.question.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
  ui.openBook.addEventListener('click', openBook);
  ui.guideOpen.addEventListener('click', () => ui.guide.showModal());
  ui.guideClose.addEventListener('click', () => ui.guide.close());
  ui.guide.addEventListener('click', (event) => { if (event.target === ui.guide) ui.guide.close(); });
  const updateNavigation = () => {
    const current = ['#board', '#my-play', '#analyst'].includes(location.hash) ? location.hash : '#board';
    document.querySelectorAll('.primary-nav .nav-link').forEach((link) => {
      const active = link.getAttribute('href') === current;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  addEventListener('hashchange', updateNavigation);
  updateNavigation();
  loadCard();
  renderCard();
  renderBoard();
  updatePrivacy();
  invalidateAnalysis();
  checkConnections();
  setInterval(() => { const changed = pruneCard(); if (state.selections.length || changed) renderBoard(); renderCard(); }, 30000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
else initialize();
