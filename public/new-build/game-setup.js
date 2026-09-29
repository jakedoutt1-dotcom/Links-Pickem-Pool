(async()=>{
 const q=new URLSearchParams(location.search),pool=q.get('pool'),game=q.get('game'),form=document.getElementById('setup'),message=document.getElementById('message');form.hidden=true;
 async function api(url,body){const r=await window.LINKS_API_FETCH(url,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{cache:'no-store'}),j=await r.json();if(!r.ok)throw Error(j.error||'Request failed');return j}
 try{
 const session=await api('/api/session');let selected={};try{selected=JSON.parse(localStorage.getItem('links-current-pool')||'{}')}catch{}
 if(session.role!=='admin'||String(selected.id)!==String(pool)||selected.code!==session.poolCode)throw Error('Sign in as this pool’s commissioner first.');
 if(!['Golf','NASCAR','Custom'].includes(game))throw Error('Open the game’s own commissioner controls for setup.');
 document.getElementById('title').textContent=game+' setup';const query='?pool='+encodeURIComponent(pool)+'&game='+encodeURIComponent(game)+'&period=current';
 const j=await api('./api/game-settings'+query),settings=j.settings||{};form.elements.title.value=settings.title||game;form.elements.limit.value=settings.settings?.pickLimit||1;
 if(settings.lockAt){const d=new Date(settings.lockAt);form.elements.deadline.value=new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}
 const options=await api('./api/options'+query);message.textContent=options.options?.length?'Existing eligible names: '+options.options.join(', '):'Add the eligible names for this event.';form.hidden=false;
 form.onsubmit=async e=>{e.preventDefault();const button=form.querySelector('button');button.disabled=true;try{const data=new FormData(form),lockAt=new Date(data.get('deadline')).toISOString();await api('./api/game-settings',{pool,game,period:'current',title:data.get('title'),lockAt,settings:{...settings.settings,pickLimit:Number(data.get('limit'))}});for(const value of [...new Set(String(data.get('options')).split('\n').map(x=>x.trim()).filter(Boolean))])await api('./api/options',{pool,game,period:'current',value});message.textContent='Game setup saved.'}catch(e){message.textContent=e.message}finally{button.disabled=false}};
 }catch(e){message.textContent=e.message}
})();
