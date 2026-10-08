export let rollout={phase:'off'},enabled=false;
let readiness;
// Explicit readiness avoids top-level-await initialization races on Safari.
export function identityReady(){
 if(readiness)return readiness;
 readiness=(async()=>{
  for(let attempt=0;attempt<3;attempt++){
   try{const r=await fetch('./api/login-transition',{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error();const state=await r.json();if(!['off','transition','new'].includes(state.phase))throw Error();rollout=state;enabled=state.phase!=='off';window.LINKS_IDENTITY_TEST=enabled;return enabled}
   catch{if(attempt===2)throw Error('Unable to check sign-in right now. Please try again.');await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)))}
  }
 })().catch(e=>{readiness=null;throw e});
 return readiness;
}

export const legacyToken=()=>localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token')||'';
// Retry only loading and opening a pool; never replay passwords, profile edits or purchases.
export async function accountApi(body){
 const canRetry=!body||body.action==='open';
 for(let attempt=0;;attempt++){
  try{
   const r=await fetch('./api/player-account',{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json',Authorization:'Bearer '+legacyToken()},...(body?{body:JSON.stringify(body)}:{})});
   let j;try{j=await r.json()}catch{throw Object.assign(new Error('Account service returned an incomplete response.'),{status:r.status,retryable:r.ok||r.status>=500})}
   if(!r.ok)throw Object.assign(new Error(j.error||'Please try again.'),{status:r.status,retryable:r.status>=500});return j;
  }catch(e){
   const temporary=e.retryable||e.name==='TypeError'||e.name==='TimeoutError'||e.name==='AbortError';
   if(!canRetry||!temporary||attempt>=2)throw e;
   await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));
  }
 }
}

export function savePool(j){localStorage.setItem('links-legacy-token',j.token);localStorage.setItem('links-token',j.token);localStorage.setItem('links-current-pool',JSON.stringify(j.pool));localStorage.setItem('links-player-id',j.playerId);localStorage.setItem('links-player-name',j.playerId);localStorage.setItem('links-player-role',j.pool.role);localStorage.setItem('links-current-role',j.pool.role);sessionStorage.removeItem('links-signed-out')}
export function clearPool(){for(const key of ['links-token','links-legacy-token','links-current-pool','links-player-id','links-player-name','links-player-role','links-current-role','links-account-token'])localStorage.removeItem(key)}
export async function bootLocker(){if(!await identityReady())return;try{const state=await accountApi();window.LINKS_IDENTITY_ACCOUNT=state.account;window.LINKS_IDENTITY_MODE=true;mountAccount(state.account);const title=document.getElementById('controlTitle');if(title)title.textContent=state.account.displayName+'’s Locker Room';let current;try{current=JSON.parse(localStorage.getItem('links-current-pool')||'{}').id}catch{}const pool=state.pools.find(p=>p.id===String(current))||state.pools[0];if(pool){savePool(await accountApi({action:'open',pool:pool.id}));state.currentPool=pool.id}else clearPool();return state;}catch(e){if(e.status===401){if(legacyToken()){const membership=await accountApi({action:'membership-status'});if(!membership.connected){const host=document.getElementById('lockerAccount');if(host){const link=document.createElement('a');link.className='action';link.href='./links-login.html?setup=1';link.textContent='Set up your easier LINKS login';const note=document.createElement('p');note.textContent='Optional: one username and password. No more searching for your pool. Your picks stay saved.';host.replaceChildren(link,note)}return}}location.replace('./links-login.html');await new Promise(()=>{})}throw e}}
function mountAccount(account){const host=document.getElementById('lockerAccount');host.replaceChildren();const css=document.createElement('link');css.rel='stylesheet';css.href='./links-account.css';document.head.append(css);const find=document.createElement('a');find.className='action';find.href='./links-login.html?find=1';find.textContent='Connect My Pools';const profile=document.createElement('button');profile.className='action';profile.textContent='My Profile';const logout=document.createElement('button');logout.className='action';logout.textContent='Sign out';logout.onclick=async()=>{logout.disabled=true;try{await accountApi({action:'logout'});clearPool();location.replace('./links-login.html')}catch(e){logout.disabled=false;document.getElementById('attention').textContent=e.message}};host.append(find,profile,logout);
const d=document.createElement('dialog');d.className='account-profile';d.setAttribute('aria-labelledby','identityProfileTitle');d.innerHTML='<h2 id="identityProfileTitle">My Profile</h2><p>One login for all your connected pools.</p><form><label>Username<input name="username" autocomplete="username" required minlength="3" maxlength="30"></label><label>Display name<input name="displayName" required maxlength="60"></label><label>Current LINKS password<input name="currentPassword" type="password" autocomplete="current-password" required></label><label>New password (optional)<input name="newPassword" type="password" autocomplete="new-password" minlength="10"></label><label>Confirm new password<input name="confirm" type="password" autocomplete="new-password"></label><button class="action" type="submit">Save profile</button></form><p role="status"></p><button class="action" type="button" data-close>Back to Locker Room</button>';document.body.append(d);const f=d.querySelector('form'),msg=d.querySelector('[role=status]');profile.onclick=()=>{f.reset();f.elements.username.value=account.username;f.elements.displayName.value=account.displayName;msg.textContent='';history.pushState({identityProfile:true},'',location.href);d.showModal()};function close(){d.close();if(history.state?.identityProfile)history.back();profile.focus()}d.querySelector('[data-close]').onclick=close;d.addEventListener('cancel',e=>{e.preventDefault();close()});window.addEventListener('popstate',()=>d.close());f.onsubmit=async e=>{e.preventDefault();const b=Object.fromEntries(new FormData(f));if(b.newPassword!==b.confirm){msg.textContent='New passwords must match.';return}const btn=f.querySelector('button');btn.disabled=true;try{const j=await accountApi({action:'profile',...b});account=j.account;window.LINKS_IDENTITY_ACCOUNT=account;f.elements.currentPassword.value='';f.elements.newPassword.value='';f.elements.confirm.value='';msg.textContent='Saved. Your pools and picks are still connected.';if(b.newPassword){const state=await accountApi();if(state.pools[0])savePool(await accountApi({action:'open',pool:state.pools[0].id}))}window.dispatchEvent(new Event('links:names-changed'))}catch(e){msg.textContent=e.message}finally{btn.disabled=false}};
}
