(()=>{
'use strict';
let records={},loading=false,lastLoad=0,painting=false;
const key=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
function saveTeam(team,record){if(!record)return;[team?.abbreviation,team?.shortDisplayName,team?.displayName,team?.name,team?.slug].filter(Boolean).forEach(v=>records[key(v)]=record)}
async function loadRecords(){if(loading||Date.now()-lastLoad<180000)return;loading=true;lastLoad=Date.now();try{const r=await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',{cache:'no-store'});if(!r.ok)throw new Error('records');const d=await r.json();for(const event of d.events||[])for(const comp of event.competitions||[])for(const c of comp.competitors||[]){const rs=c.records||[],overall=rs.find(x=>x.type==='total'||x.name==='overall')||rs[0];saveTeam(c.team,overall?.summary||'')}}catch(e){}finally{loading=false;paint()}}
function recordFor(btn){const code=btn?.dataset?.team||'',name=(btn?.querySelector('.nm')?.textContent||'').replace(/✓ WINNER|✕ LOSS/gi,'').trim();for(const v of [code,name]){const k=key(v);if(records[k])return records[k];for(const [rk,rv] of Object.entries(records))if(k&&rk&&(k===rk||k.includes(rk)||rk.includes(k)))return rv}return''}
function paint(){if(painting)return;const picks=document.getElementById('picks');if(!picks)return;painting=true;try{picks.querySelectorAll('.team').forEach(btn=>{const logo=btn.querySelector('.logo-pad');if(!logo)return;let el=btn.querySelector('.links-record-v264');if(!el){el=document.createElement('div');el.className='links-record-v264';logo.insertAdjacentElement('afterend',el)}const r=recordFor(btn);if(r)el.textContent=r;else if(btn.querySelector('.rec')?.textContent){el.textContent=btn.querySelector('.rec').textContent.replace(/^Record:\s*/i,'')}})}finally{painting=false}}
function start(){paint();loadRecords();new MutationObserver(()=>requestAnimationFrame(paint)).observe(document.body,{childList:true,subtree:true});setInterval(()=>{paint();loadRecords()},3000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

/* LINKS v293 — persistent pre-deadline player lock overlay. */
(()=>{
'use strict';
const OVERLAY='linksPlayerLockOverlayV293';
const STORE='links-player-soft-lock-v293:'+location.pathname+':'+location.search;
const root=()=>document.getElementById('picks');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(){try{return JSON.parse(localStorage.getItem(STORE)||'null')}catch(e){return null}}
function write(v){try{localStorage.setItem(STORE,JSON.stringify(v))}catch(e){}}
function clear(){try{localStorage.removeItem(STORE)}catch(e){}}
function deadlineLocked(){const r=root();const t=(document.getElementById('pickLockCard')?.textContent||'')+' '+(r?.textContent||'');return /PICKS LOCKED|DEADLINE LOCKED|NO LONGER (?:BE )?CHANGED/i.test(t)}
function currentPicks(){const r=root();if(!r)return[];return [...r.querySelectorAll('.game')].map((g,i)=>{const t=[...g.querySelectorAll('.team')].find(x=>x.classList.contains('sel')||x.dataset.picked==='1'||/YOUR PICK/i.test(x.textContent||''));if(!t)return null;return{game:i+1,team:(t.querySelector('.nm')?.textContent||t.dataset.team||'Team').replace(/✓ WINNER|✕ LOSS/gi,'').trim()}}).filter(Boolean)}
function tie(){const r=root();if(!r)return'';const h=[...r.querySelectorAll('*')].find(e=>/^Tiebreaker$/i.test((e.textContent||'').trim()));return (h?.closest('.card')?.querySelector('input')?.value||'').trim()}
function addCss(){if(document.getElementById('linksPlayerLockCssV293'))return;const s=document.createElement('style');s.id='linksPlayerLockCssV293';s.textContent=`#${OVERLAY}{position:fixed;z-index:9999;left:max(12px,calc((100vw - 720px)/2));right:max(12px,calc((100vw - 720px)/2));top:calc(env(safe-area-inset-top) + 72px);max-height:calc(100vh - 105px);overflow:auto;padding:16px;border:2px solid #d6aa31;border-radius:16px;background:#0f1720;box-shadow:0 14px 45px rgba(0,0,0,.75)}#${OVERLAY} .title{text-align:center;color:#ffd45d;font-size:21px;font-weight:950}#${OVERLAY} .sub{text-align:center;color:#c8d2dc;font-size:13px;margin:5px 0 13px}#${OVERLAY} .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}#${OVERLAY} .pick{display:flex;justify-content:space-between;gap:10px;padding:9px;background:#18222d;border:1px solid #34404d;border-radius:9px;font-size:13px}#${OVERLAY} .pick b{text-align:right}#${OVERLAY} .tie{margin:11px 0;padding:10px;background:#18222d;border-radius:9px}#${OVERLAY} button{width:100%;min-height:52px;margin-top:6px;background:#2563eb!important;border:1px solid #69a2ff!important;font-weight:950!important}@media(max-width:500px){#${OVERLAY} .grid{grid-template-columns:1fr}}body.links-player-softlocked-v293 #picks .game,body.links-player-softlocked-v293 #picks .card:has(input){pointer-events:none!important}`;document.head.appendChild(s)}
function hide(){document.getElementById(OVERLAY)?.remove();document.body.classList.remove('links-player-softlocked-v293')}
function show(data){if(deadlineLocked()){clear();hide();return}addCss();hide();const o=document.createElement('div');o.id=OVERLAY;o.innerHTML=`<div class="title">🔒 MY PICKS ARE LOCKED IN</div><div class="sub">Your picks stay locked until you unlock them or the weekly deadline expires.</div><div class="grid">${(data.picks||[]).map(x=>`<div class="pick"><span>Game ${x.game}</span><b>${esc(x.team)}</b></div>`).join('')}</div>${data.tie?`<div class="tie"><b>Tiebreaker:</b> ${esc(data.tie)}</div>`:''}<button type="button" id="linksUnlockMyPicksV293">🔓 UNLOCK MY PICKS</button>`;document.body.appendChild(o);document.body.classList.add('links-player-softlocked-v293');document.getElementById('linksUnlockMyPicksV293').onclick=()=>{clear();hide()}}
function lockAfterSave(){if(deadlineLocked())return;const picks=currentPicks();if(!picks.length)return;const data={picks,tie:tie(),lockedAt:Date.now()};write(data);show(data)}
function restore(){if(deadlineLocked()){clear();hide();return}const d=read();if(d?.picks?.length)show(d)}
window.addEventListener('links:picks-saved',lockAfterSave);
window.addEventListener('pageshow',restore);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)restore()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore,{once:true});else restore();
})();