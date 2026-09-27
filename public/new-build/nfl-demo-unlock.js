// LINKS NFL practice demo — v765
// Demo-only UI override. Real pool kickoff/deadline locks remain untouched.
(()=>{
 const demo=new URLSearchParams(location.search).get('demo')==='1';
 if(!demo)return;
 document.documentElement.dataset.linksDemo='1';
 const apply=()=>{
  const cd=document.getElementById('pickCountdown');
  if(cd){cd.style.display='block';const s=cd.querySelector('span'),b=cd.querySelector('b');if(s)s.textContent='PRACTICE DEMO';if(b)b.textContent='NO DEADLINE · PICKS STAY OPEN'}
  const line=document.getElementById('gameStatusLine');if(line)line.textContent='NFL PICK’EM DEMO · PRACTICE MODE · NO PICK DEADLINE';
  document.querySelectorAll('#slate .game-team').forEach(btn=>{btn.disabled=false;btn.removeAttribute('disabled')});
  document.querySelectorAll('#slate .game-state').forEach(x=>x.textContent='DEMO OPEN');
 };
 const obs=new MutationObserver(apply);
 const start=()=>{apply();obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled']});setInterval(apply,750)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
