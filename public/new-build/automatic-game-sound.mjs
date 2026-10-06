// Browsers require a user gesture for audio. The first normal game tap unlocks it.
export function automaticGameSound(button,isEnabled){
 const toggle=button.onclick;let muted=false,busy=false;
 try{muted=localStorage.getItem('links-games-muted')==='1'}catch{}
 function draw(){button.textContent=muted?'Unmute':'Mute';button.setAttribute('aria-label',muted?'Unmute game sound':'Mute game sound');button.setAttribute('aria-pressed',String(muted));button.title=muted?'Game audio is muted on this device.':'Sound starts with your first tap. Mute on extra devices to avoid echo.'}
 async function apply(){if(busy||button.disabled)return;busy=true;try{if(isEnabled()===muted)await toggle();if(muted&&isEnabled())await toggle()}finally{busy=false;draw()}}
 button.onclick=()=>{muted=!muted;try{localStorage.setItem('links-games-muted',muted?'1':'0')}catch{}return apply()};
 const activate=e=>{if(button===e.target||button.contains?.(e.target))return;if(!muted&&!isEnabled())void apply()};
 document.addEventListener('click',activate,true);document.addEventListener('keydown',activate,true);draw();
}
