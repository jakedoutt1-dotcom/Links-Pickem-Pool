// Shared keyboard submission and browser-detected saved-password sign-in.
(()=>{
 if(window.LINKS_LOGIN_SUBMIT)return;window.LINKS_LOGIN_SUBMIT=true;
 const fields={poolPassword:['poolPlayer','enterPool'],lpmPassword:['lpmPlayer','lpmEnter']};
 document.addEventListener('keydown',e=>{
  if(e.key!=='Enter'||e.isComposing||e.repeat)return;
  const id=e.target.id,buttonId=fields[id]?.[1]||({poolSearch:'findPool',lpmSearch:'lpmFind'})[id];
  const button=document.getElementById(buttonId);if(button&&!button.disabled){e.preventDefault();button.click()}
 });
 document.addEventListener('change',e=>{if(['poolPlayer','lpmPlayer'].includes(e.target.id))e.target.dataset.playerConfirmed='true'});
 function savedPassword(e){
  const input=e.target,pair=fields[input.id];if(!pair||input.dataset.autoAttempted)return;
  let autofilled=false;try{autofilled=input.matches(':autofill')}catch{}try{autofilled=autofilled||input.matches(':-webkit-autofill')}catch{}
  if(!autofilled)return;
  setTimeout(()=>{
   const player=document.getElementById(pair[0]),button=document.getElementById(pair[1]);
   if(!input.isConnected||!input.value||!player?.value||!button||button.disabled||input.dataset.autoAttempted)return;
   // Never automatically try a saved password against an arbitrary first player.
   if(player.options.length!==1&&player.dataset.playerConfirmed!=='true')return;
   input.dataset.autoAttempted='true';button.click();
  },150);
 }
 for(const event of ['input','change','animationstart'])document.addEventListener(event,savedPassword);
})();
