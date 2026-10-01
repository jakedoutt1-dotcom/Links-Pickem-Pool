// Keep existing page code compatible while routing only authentication keys to tab storage.
(()=>{
 if(window.LINKS_REMEMBER)return;
 const proto=Storage.prototype,get=proto.getItem,set=proto.setItem,remove=proto.removeItem;
 const keys=new Set(['links-token','links-legacy-token','links-account-token','links-current-pool','links-player-id','links-player-name','links-player-role']);
 const temporary=()=>get.call(sessionStorage,'links-temporary-session')==='1';
 proto.getItem=function(key){return get.call(this===localStorage&&keys.has(String(key))&&temporary()?sessionStorage:this,key)};
 proto.setItem=function(key,value){return set.call(this===localStorage&&keys.has(String(key))&&temporary()?sessionStorage:this,key,value)};
 proto.removeItem=function(key){if(this===localStorage&&keys.has(String(key))){remove.call(localStorage,key);remove.call(sessionStorage,key);return}return remove.call(this,key)};
 window.LINKS_REMEMBER={temporary,set(remember){for(const key of keys){remove.call(localStorage,key);remove.call(sessionStorage,key)}if(remember)remove.call(sessionStorage,'links-temporary-session');else set.call(sessionStorage,'links-temporary-session','1')}};
})();
// Prompt only after the server identifies a protected account mutation.
(()=>{
 const original=window.fetch.bind(window);let pending=false;
 function password(){return new Promise(resolve=>{
 const d=document.createElement('dialog');d.style.cssText='max-width:420px;width:calc(100% - 48px);padding:24px;border:1px solid #edc466;border-radius:14px;background:#0d1b26;color:#fff';d.innerHTML='<h2>Confirm it’s you</h2><p>Enter your current commissioner password to make this account change.</p><form><label>Password<input type="password" autocomplete="current-password" required style="display:block;width:100%;box-sizing:border-box;margin:12px 0"></label><button type="submit">VERIFY & CONTINUE</button><button type="button">CANCEL</button></form>';
 const input=d.querySelector('input');function finish(value){input.value='';d.close();d.remove();resolve(value)}d.querySelector('form').onsubmit=e=>{e.preventDefault();finish(input.value)};d.querySelector('[type=button]').onclick=()=>finish(null);d.oncancel=e=>{e.preventDefault();finish(null)};document.body.append(d);d.showModal();input.focus();
 })}
 window.fetch=async(input,options)=>{
 const request=new Request(input instanceof Request?input:new URL(input,location.href),options);const url=new URL(request.url);
 if(url.origin!==location.origin||!/^\/(?:new-build\/)?api\//.test(url.pathname)||['GET','HEAD'].includes(request.method))return original(input,options);
 const saved=request.clone(),response=await original(request);if(response.status!==428||pending)return response;
 let data;try{data=await response.clone().json()}catch{return response}if(data.code!=='REAUTH_REQUIRED')return response;
 pending=true;try{const value=await password();if(value===null)return response;const headers=new Headers(saved.headers);headers.set('x-links-confirm-password',value);return await original(new Request(saved,{headers}))}finally{pending=false}
 };
})();

(()=>{const script=document.createElement("script");script.src="/new-build/password-visibility.js?v=1";document.head.append(script)})();

// Preserve a verified linked account only for a server-confirmed member signing in again.
window.LINKS_ACCOUNT_FOR_LOGIN=async token=>{const account=localStorage.getItem('links-account-token');if(!account)return '';try{const r=await fetch('/new-build/api/pool-switcher',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,'x-links-account':account},body:JSON.stringify({action:'verify-link'})});return r.ok&&(await r.json()).verified?account:''}catch{return ''}};
