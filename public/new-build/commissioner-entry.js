// Shared pool tabs. The server, never a cached role or display name, grants access.
(()=>{
 if(document.getElementById('linksCommissionerEntryModule'))return;
 const marker=document.createElement('meta');marker.id='linksCommissionerEntryModule';document.head.append(marker);
 // Compact shared actions on phones; additional pools stay reachable by swiping.
 const compact=document.createElement('style');compact.textContent=`
 @media(max-width:640px){
 #linksPoolActions{flex-wrap:nowrap!important;gap:6px!important;overflow-x:auto;max-width:100%;padding:2px 0 6px;align-items:center!important}
 #linksPoolTabs{flex:0 0 auto!important;flex-wrap:nowrap!important;gap:6px!important;max-width:none!important}
 #linksPoolTabs .action,#linksPoolActions #addMyHomepage{font-size:11px!important;line-height:1.2!important;letter-spacing:0!important;padding:8px!important;min-height:40px!important;white-space:nowrap!important;width:auto!important;max-width:none!important;margin:0!important;border-radius:8px!important;text-transform:none!important}
 #linksPoolTabs [role=status]:empty{display:none}
 #linksPoolActions #addMyHomepage{flex:0 0 auto!important}
 }
 @media(max-width:420px){#linksPoolTabs .action,#linksPoolActions #addMyHomepage{font-size:10px!important;padding:8px 6px!important}}
 `;document.head.append(compact);
 const token=localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token');if(!token)return;
 const routes={nfl:'nfl.html',college:'college.html',survivor:'survivor.html',confidence:'confidence.html','33':'game33.html',squares:'squares.html',props:'props.html',playoff:'playoff.html',march:'march-madness.html',masters:'golf.html',nascar:'nascar.html',fantasy:'fantasy.html',dynasty:'dynasty.html',custom:'custom.html'};
 let state,bar;
 async function api(body,path='pool-switcher'){
 const r=await fetch('/new-build/api/'+path,{method:body?'POST':'GET',cache:'no-store',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,'x-links-account':localStorage.getItem('links-account-token')||''},...(body?{body:JSON.stringify(body)}:{})});const j=await r.json();if(!r.ok)throw Error(j.error||'Please try again.');return j;
 }
 function enter(j){
 localStorage.setItem('links-legacy-token',j.token);localStorage.setItem('links-token',j.token);localStorage.setItem('links-current-pool',JSON.stringify(j.pool));localStorage.setItem('links-player-id',j.playerId);localStorage.setItem('links-player-name',j.playerId);localStorage.setItem('links-player-role',j.pool.role);
 for(const key of ['links-playmaker-import','links-signed-out','links-nfl-selected-week'])sessionStorage.removeItem(key);
 const route=j.gameKeys.length===1?routes[j.gameKeys[0]]:null;location.assign('./'+(route||'control-center.html')+'?pool='+encodeURIComponent(j.pool.id));
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
 if(!bar)return;const main=document.querySelector('main');if(!main)return;
 let row=document.getElementById('linksPoolActions');if(!row){row=document.createElement('div');row.id='linksPoolActions';row.style.cssText='grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:12px;width:100%;min-width:0;margin:12px 0';main.prepend(row)}
 if(bar.parentElement!==row)row.prepend(bar);
 const home=document.getElementById('addMyHomepage');if(home&&home.parentElement!==row){home.style.margin='0 0 0 auto';home.style.flex='0 0 auto';row.append(home)}
 }
 function render(){
 if(!bar){bar=document.createElement('nav');bar.id='linksPoolTabs';bar.setAttribute('aria-label','My pools');bar.style.cssText='display:flex;flex:1 1 300px;gap:8px;flex-wrap:wrap;align-items:center;box-sizing:border-box;min-width:0;max-width:100%';place()}
 bar.replaceChildren();
 for(const pool of state.pools){const b=button(pool.name,async()=>{b.disabled=true;try{enter(await api({action:'open',pool:pool.id}))}catch(e){message.textContent=e.message;b.disabled=false}});b.style.cssText='flex:0 0 auto;white-space:nowrap';if(pool.id===state.currentPool){b.setAttribute('aria-current','page');b.disabled=true;b.style.cssText+=';background:#edc466!important;color:#101820!important;border-color:#edc466!important;opacity:1!important;filter:none!important;cursor:default;text-shadow:none!important'}bar.append(b)}
 const current=state.pools.find(p=>p.id===state.currentPool);
 if(current?.games?.length>1){const change=document.createElement('a');change.className='action';change.href='./control-center.html?pool='+encodeURIComponent(state.currentPool);change.textContent='Change Game';change.style.whiteSpace='nowrap';bar.append(change)}
 if(state.commissioner){const a=document.createElement('a');const page=location.pathname.split('/').pop(),q=new URLSearchParams(location.search);let game=Object.keys(routes).find(k=>routes[k]===page);if(!game&&/^(nfl-|compare-picks|pick-tools|year-standings)/.test(page))game='nfl';if(!game&&page==='commissioner.html')game=/college/i.test(q.get('game')||'')?'college':'nfl';a.href='./commissioner-hub.html'+(game?'?returnGame='+encodeURIComponent(game):'');a.className='action';a.dataset.commissionerPools='1';a.textContent='＋ Add Pool / Game';a.style.whiteSpace='nowrap';bar.append(a)}
 bar.append(button(state.verified?'Link this player':'Connect my pools',connect));const message=document.createElement('span');message.setAttribute('role','status');message.setAttribute('aria-live','polite');bar.append(message);
 }
 const observer=new MutationObserver(place);observer.observe(document.body,{childList:true,subtree:true});window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
 api().then(j=>{state=j;render()}).catch(()=>{});
})();
