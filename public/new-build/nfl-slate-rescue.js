/* LINKS v806 — isolated NFL slate loader/rescue. Does not own picks or database writes. */
(()=>{
'use strict';
if(!/\/nfl(?:\.html)?$/i.test(location.pathname))return;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function rescue(){
  await sleep(1800);
  const box=document.getElementById('slate');
  if(!box||(!/Loading/i.test(box.textContent||'')&&document.querySelector('#slate .game-matchup')))return;
  try{
    const base='https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=100';
    const ctl1=new AbortController(),t1=setTimeout(()=>ctl1.abort(),7000);
    const r=await fetch(base,{cache:'no-store',signal:ctl1.signal});clearTimeout(t1);
    if(!r.ok)throw Error('NFL current-week feed '+r.status);
    const current=await r.json();
    const wk=Number(current.week?.number||0)||1,seasonType=Number(current.season?.type||2);
    if(typeof currentWeek!=='undefined'&&!currentWeek)currentWeek=wk;
    if(typeof selectedWeek!=='undefined'&&!selectedWeek)selectedWeek=typeof currentWeek!=='undefined'?currentWeek:wk;
    const w=typeof selectedWeek!=='undefined'?selectedWeek:wk;
    const ctl2=new AbortController(),t2=setTimeout(()=>ctl2.abort(),7000);
    const wr=await fetch(base+'&seasontype='+seasonType+'&week='+w,{cache:'no-store',signal:ctl2.signal});clearTimeout(t2);
    if(!wr.ok)throw Error('NFL week feed '+wr.status);
    const wj=await wr.json(),found=wj.events||[];
    if(!found.length)throw Error('No games returned for Week '+w);
    if(typeof games!=='undefined')games=found;
    if(typeof historicalView!=='undefined')historicalView=w<wk&&found.every(e=>!!(e.status?.type?.completed||e.competitions?.[0]?.status?.type?.completed));
    if(typeof period!=='undefined'&&typeof selectedPeriod==='function')period=selectedPeriod();
    document.body.classList.toggle('history-mode',typeof historicalView!=='undefined'&&historicalView);
    if(typeof syncWeekNav==='function')syncWeekNav();
    if(typeof picks!=='undefined')picks={};
    if(typeof tieTotal!=='undefined')tieTotal='';
    const ti=document.getElementById('tieTotal');if(ti)ti.value='';
    if(typeof hydrate==='function')await hydrate();
    if(typeof historicalView!=='undefined'&&!historicalView&&typeof hydrateEspnMoneylines==='function')await hydrateEspnMoneylines();
    if(typeof restoreCardLock==='function')restoreCardLock();
    if(typeof draw==='function')draw();
    if(typeof updatePM==='function')updatePM();
    if(typeof updateCountdown==='function')updateCountdown();
    const line=document.getElementById('gameStatusLine');
    if(line)line.textContent='NFL PICK’EM · '+(typeof weekLabel==='function'?weekLabel(w):'Week '+w)+((typeof historicalView!=='undefined'&&historicalView)?' · SAVED PICKS':' · WEEKLY PICK CARD');
  }catch(err){
    if(box&&/Loading/i.test(box.textContent||'')){box.className='empty';box.innerHTML='<b>NFL schedule could not load.</b><br><span style="font-size:13px">'+String(err?.message||err)+'</span>'}
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',rescue);else rescue();
})();