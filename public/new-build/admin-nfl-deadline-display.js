/* LINKS v796 — week-specific NFL commissioner deadline control (display/settings only; does not block picks) */
(()=>{
'use strict';
if(!/\/commissioner(?:\.html)?$/i.test(location.pathname))return;
const q=new URLSearchParams(location.search), game=q.get('game')||'NFL Pick’em';
if(!/nfl/i.test(game)||/college/i.test(game))return;
const pool=()=>{try{const p=JSON.parse(localStorage.getItem('links-current-pool')||'null')||{};return q.get('pool')||p.id||p.poolId||p.pool_id||''}catch{return q.get('pool')||''}};
const label=w=>w<=18?'Week '+w:({19:'Wild Card',20:'Divisional',21:'Conference Championships',22:'Super Bowl'}[w]||('Week '+w));
const localValue=iso=>{if(!iso)return'';const d=new Date(iso);if(!Number.isFinite(d.getTime()))return'';const z=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())+'T'+z(d.getHours())+':'+z(d.getMinutes())};
async function currentWeek(){try{const j=await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=1',{cache:'no-store'}).then(r=>r.json());let w=Number(j.week?.number||1),st=Number(j.season?.type||2);if(st===3&&w>0)w=18+w;return Math.max(1,Math.min(22,w||1))}catch{return 1}}
async function firstKickoff(w){try{const base='https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=100';const cur=await fetch(base,{cache:'no-store'}).then(r=>r.json()),st=Number(cur.season?.type||2);const j=await fetch(base+'&seasontype='+st+'&week='+encodeURIComponent(w),{cache:'no-store'}).then(r=>r.json());const ds=(j.events||[]).map(e=>e.date).filter(Boolean).sort((a,b)=>Date.parse(a)-Date.parse(b));return ds[0]||null}catch{return null}}
async function setting(w){const p=pool();if(!p)return null;try{const r=await fetch('./api/game-settings?pool='+encodeURIComponent(p)+'&game='+encodeURIComponent('NFL Pick’em')+'&period='+encodeURIComponent(String(w))+'&week='+w+'&_='+Date.now(),{cache:'no-store'});if(!r.ok)return null;const j=await r.json();return j.settings||j.setting||null}catch{return null}}
async function boot(){
 const lock=document.getElementById('lock'),oldSave=document.getElementById('saveLock'),msg=document.getElementById('lockMsg'),web=document.getElementById('webKickoff');if(!lock||!oldSave)return;
 let sel=document.getElementById('deadlineWeek');if(!sel){sel=document.createElement('select');sel.id='deadlineWeek';sel.innerHTML=Array.from({length:22},(_,i)=>'<option value="'+(i+1)+'">'+label(i+1)+'</option>').join('');const lab=document.createElement('label');lab.className='small';lab.innerHTML='<b>WEEK</b>';lab.appendChild(sel);const card=oldSave.closest('.admin-card');const live=card?.querySelector('.live-kickoff');card?.insertBefore(lab,live||lock.parentElement)}
 sel.value=String(await currentWeek());
 const save=oldSave.cloneNode(true);oldSave.replaceWith(save);save.id='saveLock';
 async function load(){const w=Number(sel.value),[kick,s]=await Promise.all([firstKickoff(w),setting(w)]),ov=s?.lockAt||s?.lock_at||'';if(web)web.textContent=kick?new Date(kick).toLocaleString():'Schedule kickoff unavailable';lock.value=localValue(ov);if(msg)msg.textContent=ov?label(w)+' commissioner deadline: '+new Date(ov).toLocaleString():label(w)+' uses automatic first kickoff. (Display only for now.)'}
 sel.onchange=load;
 save.onclick=async()=>{const w=Number(sel.value),raw=lock.value,lockAt=raw?new Date(raw).toISOString():'';save.disabled=true;if(msg)msg.textContent='Saving '+label(w)+'…';try{const r=await fetch('./api/game-settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pool:pool(),game:'NFL Pick’em',period:String(w),week:w,lockAt,settings:{week:w,deadlineMode:lockAt?'commissioner':'first-kickoff',enforce:false}})}),j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.error||'Deadline not saved');if(msg)msg.textContent=lockAt?label(w)+' deadline saved: '+new Date(lockAt).toLocaleString()+' · not enforced yet.':label(w)+' reset to automatic first kickoff · not enforced yet.'}catch(e){if(msg)msg.textContent=e.message||'Deadline not saved.'}finally{save.disabled=false}}
 await load();
}
let tries=0;const t=setInterval(()=>{tries++;if(document.getElementById('saveLock')){clearInterval(t);boot()}else if(tries>80)clearInterval(t)},100);
})();