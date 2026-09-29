/* LINKS v809 — NFL slate rescue waits for the page engine, then paints schedule first. */
(()=>{
'use strict';
if(!/\/nfl(?:\.html)?$/i.test(location.pathname))return;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const timed=(p,ms)=>Promise.race([Promise.resolve(p),new Promise((_,rej)=>setTimeout(()=>rej(Error('timeout')),ms))]);
async function fetchJson(url,ms=6500){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,{cache:'no-store',signal:c.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(t)}}
async function waitForEngine(){for(let i=0;i<60;i++){try{if(typeof draw==='function'&&typeof syncWeekNav==='function'&&typeof selectedPeriod==='function'&&typeof hydrate==='function')return true}catch{}await sleep(100)}return false}
async function go(){
 const box=document.getElementById('slate');if(!box)return;
 if(!(await waitForEngine())){if(/Loading/i.test(box.textContent||''))box.innerHTML='<b>NFL page engine did not initialize.</b><br><span style="font-size:13px">Refresh once to load the newest LINKS build.</span>';return}
 if(document.querySelector('#slate .game-matchup')&&!/Loading/i.test(box.textContent||''))return;
 try{
  let fallbackWeek=1;try{fallbackWeek=Number(selectedWeek)||1}catch{}
  const wanted=Math.max(1,Math.min(22,Number(new URLSearchParams(location.search).get('week')||document.getElementById('weekSelect')?.value||fallbackWeek||1))),st=wanted<=18?2:3,fw=wanted<=18?wanted:wanted-18;
  const j=await fetchJson('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2026&seasontype='+st+'&week='+fw+'&limit=100&_='+Date.now()),found=j.events||[];if(!found.length)throw Error('No NFL games returned for Week '+wanted);
  games=found;selectedWeek=wanted;
  /* Do not manufacture currentWeek from the selected week. Keep the page engine's real current week. */
  historicalView=!!currentWeek&&wanted<currentWeek;period=selectedPeriod();document.body.classList.toggle('history-mode',historicalView);syncWeekNav();
  /* Render the games before any database or odds request. */
  draw();updateCountdown();
  try{await timed(hydrate(),4500)}catch(e){console.warn('saved picks hydration timeout',e)}
  draw();try{restoreCardLock()}catch{}try{updatePM()}catch{}
  if(!historicalView&&typeof hydrateEspnMoneylines==='function')timed(hydrateEspnMoneylines(),5000).then(()=>draw()).catch(()=>{});
  const line=document.getElementById('gameStatusLine');if(line)line.textContent='NFL PICK’EM · '+weekLabel(wanted)+(historicalView?' · SAVED PICKS':' · WEEKLY PICK CARD');
 }catch(err){if(!document.querySelector('#slate .game-matchup')){box.className='empty';box.innerHTML='<b>NFL schedule could not load.</b><br><span style="font-size:13px">'+String(err?.message||err)+'</span>'}}
}
/* Dynamic build modules can execute before nfl.html's inline engine. Start after full page load and retry safely. */
if(document.readyState==='complete')go();else window.addEventListener('load',go,{once:true});
})();