/* Each matchup locks independently; never reopen a started game's pick. */
(()=>{
 const paint=()=>{
 const cards=[...document.querySelectorAll('#slate .game-matchup')],now=Date.now();if(!cards.length)return;
 const open=cards.filter(c=>Number.isFinite(Date.parse(c.dataset.kickoff))&&Date.parse(c.dataset.kickoff)>now);
 document.documentElement.dataset.nflDeadlineClosed=open.length?'0':'1';
 for(const card of cards){const closed=!open.includes(card),status=card.querySelector('.game-state');if(status&&status.textContent!=='FINAL')status.textContent=closed?'LOCKED':'OPEN';if(closed)card.querySelectorAll('.game-team').forEach(b=>b.disabled=true);}
 const label=document.querySelector('#pickCountdown span');if(label)label.textContent=open.length?'NEXT GAME LOCKS AT KICKOFF':'ALL GAMES LOCKED';
 const save=document.getElementById('savePicksBtn');if(save)save.disabled=!open.length;
 if(!open.length){const tie=document.getElementById('tieTotal');if(tie)tie.disabled=true;}
 };
 setInterval(paint,1000);document.addEventListener('DOMContentLoaded',paint);
})();
