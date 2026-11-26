// Read-only guidance. The existing NFL page owns picks, saving and kickoff locks.
const slate=document.getElementById('slate');
if(slate){
 const panel=document.createElement('section');
 panel.id='nflPickProgress';panel.hidden=true;
 panel.setAttribute('aria-label','Your pick progress');
 panel.style.cssText='margin:12px 0;padding:12px;border:1px solid #315168;border-radius:9px;background:#081925';
 const summary=document.createElement('p');summary.setAttribute('role','status');summary.setAttribute('aria-live','polite');summary.style.margin='0 0 8px';
 const next=document.createElement('button');next.type='button';next.className='action';next.textContent='Go to next unpicked game';next.style.minHeight='44px';
 panel.append(summary,next);slate.before(panel);
 const unpicked=()=>[...slate.querySelectorAll('.game-matchup')].filter(game=>!game.querySelector('.game-team.primary')&&game.querySelector('.game-team:not(:disabled)'));
 next.onclick=()=>{const target=unpicked()[0];if(!target)return;target.scrollIntoView({behavior:'smooth',block:'center'});target.querySelector('.game-team:not(:disabled)').focus({preventScroll:true});};
 function update(){
  const games=[...slate.querySelectorAll('.game-matchup')];panel.hidden=!games.length;if(!games.length)return;
  const chosen=games.filter(game=>game.querySelector('.game-team.primary')).length,missing=unpicked().length;
  const text=chosen+' of '+games.length+' games selected'+(missing?' · '+missing+' open '+(missing===1?'game needs':'games need')+' a pick.':'.');
  if(summary.textContent!==text)summary.textContent=text;
  next.hidden=!missing;
 }
 const observer=new MutationObserver(update);
 const observe=()=>{observer.observe(slate,{childList:true,subtree:true,attributes:true,attributeFilter:['class','disabled']});update();};
 observe();
 window.addEventListener('pagehide',()=>observer.disconnect());
 window.addEventListener('pageshow',event=>{if(event.persisted)observe();});
}
