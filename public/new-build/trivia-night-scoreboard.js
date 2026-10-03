// A presentation view of the existing room standings; no separate score source.
(()=>{
 const button=document.getElementById('showStandings'),leaders=document.getElementById('leaders');
 if(!button||!leaders)return;
 const dialog=document.createElement('dialog');dialog.id='triviaStandingsScreen';dialog.setAttribute('aria-labelledby','presentationTitle');
 dialog.innerHTML='<section class="standings"><p class="eyebrow">LINKS TRIVIA NIGHT</p><div class="dialog-head"><h2 id="presentationTitle">Live standings</h2><button type="button">Back to game</button></div><p data-note></p><div class="board-columns"><span>RANK / PLAYER OR TEAM</span><span>POINTS</span></div><ol data-scores></ol><p>Equal scores share rank. Scores update after the host reveals each answer.</p></section>';
 document.body.append(dialog);
 function update(){dialog.querySelector('h2').textContent=document.getElementById('scoreboardTitle').textContent;dialog.querySelector('[data-note]').textContent=document.getElementById('scoreNote').textContent;dialog.querySelector('[data-scores]').replaceChildren(...[...leaders.children].map(row=>row.cloneNode(true)));}
 window.showTriviaStandings=()=>{update();if(!dialog.open)dialog.showModal();};
 button.onclick=window.showTriviaStandings;
 dialog.querySelector('button').onclick=()=>dialog.close();
 new MutationObserver(()=>{if(dialog.open)update()}).observe(leaders,{childList:true,subtree:true,characterData:true});
})();
