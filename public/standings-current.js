(()=>{'use strict';
async function paint(){
  const sec=document.getElementById('standings'),body=document.getElementById('standingsBody');
  if(!sec||!body||sec.classList.contains('hide'))return;
  let n=document.getElementById('linksStandingsLockNotice');
  if(!n){n=document.createElement('div');n.id='linksStandingsLockNotice';n.className='card links-standings-lock-notice';body.insertAdjacentElement('beforebegin',n)}
  const sel=document.getElementById('standingsWeekSelect');
  const shown=Number(sel?.value||window.standingsWeek||window.week||1);
  let locked=false;
  try{
    if(typeof window.api==='function'&&typeof window.qForWeek==='function'){
      const d=await window.api(window.qForWeek('/api/compare',shown));
      locked=!!d?.locked;
    }else{
      const current=Number(window.week||1);
      if(shown===current){
        const games=typeof window.gamesNow==='function'?window.gamesNow():[];
        const kicks=games.map(g=>Date.parse(g?.kickoff)).filter(Number.isFinite);
        const lockAt=window.boot?.locks?.[shown]||(kicks.length?new Date(Math.min(...kicks)).toISOString():null);
        locked=!!(lockAt&&Date.now()>=Date.parse(lockAt));
      }else if(shown<current) locked=true;
    }
  }catch(e){}
  if(locked){n.classList.add('hide');n.innerHTML='';return}
  n.classList.remove('hide');
  n.innerHTML='🔒 <b>Week '+shown+' standings will appear after Week '+shown+' picks lock.</b>';
}
function start(){
  paint();
  document.addEventListener('click',()=>setTimeout(paint,150),true);
  new MutationObserver(()=>setTimeout(paint,50)).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  setInterval(paint,1200);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();