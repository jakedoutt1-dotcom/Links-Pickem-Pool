export function renderSoloResult(state,game){
 if(state.mode!=='solo')return;
 const $=id=>document.getElementById(id);$('roomCode').textContent='SOLO · '+state.category+' · '+state.difficulty;
 $('heading').textContent=state.phase==='ended'?'Solo run complete':game==='trivia-rally'?'Solo Trivia Rally':'Solo Trivia Challenge';
 $('lobby').hidden=true;$('boardTitle').textContent=state.phase==='ended'?'Your final score':'Your score';
 $('rematchNote').hidden=true;$('readyNote').textContent='Play again with fresh questions. Your best is saved on this device for this name, category and difficulty.';
 if($('tvLink'))$('tvLink').hidden=true;
 let result=$('soloBest');if(!result){result=document.createElement('p');result.id='soloBest';$('readyPanel').prepend(result)}
 if(state.phase==='ended'){
  const me=state.players.find(p=>p.you);if(!me)return;
  const key='links-solo-best:'+JSON.stringify([game,me.name,state.category,state.difficulty]);
  try{const previous=Number(localStorage.getItem(key))||0,best=Math.max(previous,me.score);localStorage.setItem(key,String(best));result.textContent='Final score: '+me.score.toLocaleString()+' · Personal best on this device: '+best.toLocaleString()}
  catch{result.textContent='Final score: '+me.score.toLocaleString()+'. Your browser could not save a personal best.'}
 }
}
