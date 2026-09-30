(()=>{
 if(document.documentElement.dataset.nflDemo==='true')return;
 const token=()=>localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token')||'';
 if(!token())return;
 const host=document.querySelector('header');if(!host)return;
 const button=document.createElement('button');button.className='action';button.textContent='Change My Password';host.append(button);
 const dialog=document.createElement('dialog');dialog.style.cssText='width:min(440px,calc(100% - 40px));box-sizing:border-box;border:1px solid #b78e39;border-radius:14px;padding:22px;background:#091923;color:#fff';
 dialog.innerHTML='<form><h2>Change My Password</h2><p>Changes your password for this pool. Your picks stay saved.</p><label>Current password<input name="currentPassword" type="password" autocomplete="current-password" required maxlength="256"></label><label>New password<input name="newPassword" type="password" autocomplete="new-password" required minlength="8" maxlength="256"></label><label>Confirm new password<input name="confirmPassword" type="password" autocomplete="new-password" required minlength="8" maxlength="256"></label><p role="status" aria-live="polite"></p><button class="action primary" type="submit">Save password</button> <button class="action" type="button">Close</button></form>';
 dialog.querySelectorAll('input').forEach(i=>i.style.cssText='display:block;box-sizing:border-box;width:100%;margin:7px 0 16px;padding:12px;font-size:16px;background:#06111a;color:white;border:1px solid #385e75;border-radius:7px');
 document.body.append(dialog);const form=dialog.querySelector('form'),status=dialog.querySelector('[role=status]'),save=dialog.querySelector('[type=submit]');
 button.onclick=()=>{form.reset();status.textContent='';dialog.showModal()};dialog.querySelector('[type=button]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>form.reset());
 form.onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form));if(data.newPassword!==data.confirmPassword){status.textContent='The new passwords do not match.';return}save.disabled=true;status.textContent='Saving…';try{const r=await fetch('./api/password',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token()},body:JSON.stringify(data)});const j=await r.json();if(!r.ok)throw Error(j.error||'Password could not be changed.');form.reset();status.textContent='Password changed. Other sessions in this pool have been signed out.'}catch(e){status.textContent=e.message}finally{save.disabled=false}};
})();
