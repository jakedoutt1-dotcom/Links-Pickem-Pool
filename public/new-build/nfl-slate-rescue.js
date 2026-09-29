/* LINKS v808 — render NFL schedule before saved-pick/odds hydration. */
(()=>{
'use strict';
if(!/\/nfl(?:\.html)?$/i.test(location.pathname))return;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const timed=(p,ms)=>Promise.race([Promise.resolve(p),new Promise((_,rej)=>setTimeout(()=>rej(Error('timeout')),ms))]);
async function fetchJson(url,ms=6500){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,{cache:'no-store',signal:c.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(t)}}
async function go(){
 await sleep(700);const box=document.getElementById('slate');if(!box)return;if(document.querySelector('#slate .game-matchup')&&!/Loading/i.test(box.textContent||''))return;
 try{
  const wanted=Math.max(1,Math.min(22,Number(new URLSearchParams(location.search).get('week')||document.getElementById('weekSelect')?.value||selectedWeek||1))),st=wanted<=18?2:3,fw=wanted<=18?wanted:wanted-18;
  const j=await fetchJson('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2026&seasontype='+st+'&week='+fw+'&limit=100&_='+Date.now()),found=j.events||[];if(!found.length)throw Error('No NFL games returned');
  games=found;currentWeek=Math.max(currentWeek||0,wanted);selectedWeek=wanted;historicalView=!!currentWeek&&wanted<currentWeek;period=selectedPeriod();document.body.classList.toggle('history-mode',historicalView);syncWeekNav();
  /* Paint immediately. Nothing else is allowed to hold the slate hostage. */
  draw();updateCountdown();
  picks={};tieTotal='';
  try{await timed(hydrate(),4500)}catch(e){console.warn('saved picks hydration timeout',e)}
  draw();try{restoreCardLock()}catch{}try{updatePM()}catch{}
  if(!historicalView)timed(hydrateEspnMoneylines(),5000).then(()=>draw()).catch(()=>{});
  const line=document.getElementById('gameStatusLine');if(line)line.textContent='NFL PICK’EM · '+weekLabel(wanted)+(historicalView?' · SAVED PICKS':' · WEEKLY PICK CARD');
 }catch(err){if(!document.querySelector('#slate .game-matchup')){box.className='empty';box.innerHTML='<b>NFL schedule could not load.</b><br><span style="font-size:13px">'+String(err?.message||err)+'</span>'}}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();