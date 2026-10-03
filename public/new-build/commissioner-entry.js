// Shared pool tabs. The server, never a cached role or display name, grants access.
(()=>{
 const locker=/\/control-center(?:\.html)?\/?$/i.test(location.pathname);
 const picksPage=/\/(nfl|college|survivor|confidence|game33|squares|props|playoff|march-madness|golf|nascar|fantasy|dynasty|custom)(?:\.html)?\/?$/i;
 if(window.LINKS_IDENTITY_TEST&&locker)return;
 if(!locker&&!picksPage.test(location.pathname))return;
 if(document.getElementById('linksCommissionerEntryModule'))return;
 const marker=document.createElement('meta');marker.id='linksCommissionerEntryModule';document.head.append(marker);
 const token=localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token');if(!token)return;
 const routes={nfl:'nfl.html',college:'college.html',survivor:'survivor.html',confidence:'confidence.html','33':'game33.html',squares:'squares.html',props:'props.html',playoff:'playoff.html',march:'march-madness.html',masters:'golf.html',nascar:'nascar.html',fantasy:'fantasy.html',dynasty:'dynasty.html',custom:'custom.html'};
 let state,bar;
 async function api(body,path='pool-switcher'){
 const r=await fetch('/new-build/api/'+path,{method:body?'POST':'GET',cache:'no-store',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,'x-links-account':localStorage.getItem('links-account-token')||''},...(body?{body:JSON.stringify(body)}:{})});const j=await r.json();if(!r.ok)throw Error(j.error||'Please try again.');return j;
 }
 function enter(j){
 localStorage.setItem('links-legacy-token',j.token);localStorage.setItem('links-token',j.token);localStorage.setItem('links-current-pool',JSON.stringify(j.pool));localStorage.setItem('links-player-id',j.playerId);localStorage.setItem('links-player-name',j.playerId);localStorage.setItem('links-player-role',j.pool.role);
 for(const key of ['links-playmaker-import','links-signed-out','links-nfl-selected-week'])sessionStorage.removeItem(key);
 location.assign('./control-center.html?pool='+encodeURIComponent(j.pool.id));
 }
 function button(text,fn){const b=document.createElement('button');b.type='button';b.textContent=text;b.className='action';b.addEventListener('click',fn);return b}
 function connect(){
 const dialog=document.createElement('dialog');dialog.style.cssText='max-width:420px;width:calc(100% - 40px);background:#0d1b26;color:#fff;border:1px solid #edc466;border-radius:16px;padding:24px';
 dialog.innerHTML='<h2>Connect my pools</h2><p>Verify your email, then link this signed-in player. For another pool, sign into it once and link it with the same email. Your picks stay separate.</p><form><label>Email <input name="email" type="email" autocomplete="email" required style="width:100%;box-sizing:border-box"></label><label hidden>Verification code <input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{8}" maxlength="8"></label><p role="status" aria-live="polite"></p><button type="submit" class="action">Send code</button></form>';
 const form=dialog.querySelector('form'),status=dialog.querySelector('[role=status]'),submit=form.querySelector('button');let sent=false;
 const finish=async()=>{state=await api({action:'link'});dialog.close();dialog.remove();render()};
 form.addEventListener('submit',async e=>{e.preventDefault();submit.disabled=true;try{if(!sent){await api({action:'send-code',email:form.email.value},'account');sent=true;form.code.parentElement.hidden=false;form.code.required=true;form.email.readOnly=true;submit.textContent='Verify and link pool';status.textContent='Check your email for the eight-digit code.'}else{const j=await api({action:'verify',email:form.email.value,code:form.code.value,remember:!window.LINKS_REMEMBER?.temporary()},'account');localStorage.setItem('links-account-token',j.token);await finish()}}catch(e){status.textContent=e.message}finally{submit.disabled=false}});
 dialog.append(button('Close',()=>{dialog.close();dialog.remove()}));document.body.append(dialog);dialog.showModal();
 if(state.verified){form.hidden=true;status.textContent='';const link=button('Link this player to my verified account',async()=>{link.disabled=true;try{await finish()}catch(e){form.hidden=false;status.textContent=e.message}finally{link.disabled=false}});dialog.prepend(link)}
 }
 function place(){
 if(locker||!bar)return;
 const header=document.querySelector('header');if(header&&bar.parentElement!==header)header.append(bar);
 }
 function render(){
 if(locker){const b=document.getElementById('connectPools');if(b){b.disabled=false;b.onclick=connect}window.dispatchEvent(new CustomEvent('links:pools-ready',{detail:state}));return}
 if(!bar){const main=document.querySelector('main');if(main){const anchor=document.createElement('div');anchor.hidden=true;main.prepend(anchor);import('./partner-banner.mjs').then(m=>m.mountPartners(anchor)).catch(()=>{})}bar=document.createElement('nav');bar.id='linksPoolTabs';bar.setAttribute('aria-label','Locker Room');bar.style.cssText='display:flex;gap:8px;align-items:center;box-sizing:border-box;min-width:0;max-width:100%';place()}
 bar.replaceChildren();
 const current=state.pools.find(p=>p.id===state.currentPool);
 const pagePool=new URLSearchParams(location.search).get('pool');
 // Games with their own Admin tabs keep those tabs. Generic games get one inside the game navigation.
 const page=location.pathname.split('/').pop().replace(/\.html$/,''),setup={golf:'Golf',nascar:'NASCAR',custom:'Custom'};
 if(setup[page]&&state.commissioner&&current?.role==='admin'&&(!pagePool||[String(current.id),String(current.code)].includes(pagePool))){
 const tabs=document.querySelector('main .tabs');if(tabs&&!tabs.querySelector('[data-game-admin]')){const adminButton=button('ADMIN',()=>location.assign('./game-setup.html?'+new URLSearchParams({pool:current.id,game:setup[page]})));adminButton.dataset.gameAdmin='1';adminButton.style.cssText='background:#0d293b;color:#fff;border:1px solid #3b6178';tabs.append(adminButton)}
 }

 if(current){const change=document.createElement('a');change.className='action';change.href='./control-center.html?pool='+encodeURIComponent(state.currentPool);change.textContent='Back to Locker Room';change.style.whiteSpace='nowrap';bar.append(change)}

 }
 const observer=new MutationObserver(place);observer.observe(document.body,{childList:true,subtree:true});window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
 api().then(j=>{state=j;render()}).catch(()=>{});
})();
