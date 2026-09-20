(()=>{'use strict';
function paint(){
  const sec=document.getElementById('standings'),body=document.getElementById('standingsBody');
  if(!sec||!body||sec.classList.contains('hide'))return;
  let n=document.getElementById('linksStandingsLockNotice');
  if(!n){n=document.createElement('div');n.id='linksStandingsLockNotice';n.className='card links-standings-lock-notice';body.insertAdjacentElement('beforebegin',n)}
  const sel=document.getElementById('standingsWeekSelect');
  const shown=Number(sel?.value||window.standingsWeek||window.week||1);
  const rows=[...body.querySelectorAll('tbody tr')];
  const hasVisibleResults=rows.some(tr=>{
    const cells=tr.querySelectorAll('td');
    const wins=Number((cells[2]?.textContent||'').trim()||0);
    const losses=Number((cells[3]?.textContent||'').trim()||0);
    const tie=(cells[5]?.textContent||'').trim();
    return wins>0||losses>0||(tie&&tie!=='—');
  });
  if(hasVisibleResults){n.classList.add('hide');n.innerHTML='';return}
  n.classList.remove('hide');
  n.innerHTML='🔒 <b>Week '+shown+' standings will appear after Week '+shown+' picks lock.</b>';
}
function start(){
  paint();
  document.addEventListener('click',()=>setTimeout(paint,100),true);
  new MutationObserver(()=>requestAnimationFrame(paint)).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  setInterval(paint,1200);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();