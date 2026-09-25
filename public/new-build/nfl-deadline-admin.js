/* LINKS NFL commissioner deadline adapter.
   Keeps deadline controls outside commissioner.html and stores one override per NFL week.
*/
(function(){
 'use strict';
 if(!/\/commissioner\.html$/i.test(location.pathname))return;
 const q=new URLSearchParams(location.search);
 if(/college/i.test(q.get('game')||''))return;
 const pool=q.get('pool')||(()=>{try{const p=JSON.parse(localStorage.getItem('links-current-pool')||'null')||{};return p.id||p.poolId||p.pool_id||''}catch{return''}})();
 const api='./api/game-settings';
 const weekLabel=w=>w<=18?'Week '+w:({19:'Wild Card',20:'Divisional',21:'Conference Championships',22:'Super Bowl'}[w]||'Week '+w);
 const wait=()=>{
   const lock=document.getElementById('lock'),save=document.getElementById('saveLock'),msg=document.getElementById('lockMsg');
   if(!lock||!save||!msg){setTimeout(wait,150);return}
   let select=document.getElementById('deadlineWeek');
   if(!select){
     select=document.createElement('select'); select.id='deadlineWeek';
     select.innerHTML=Array.from({length:22},(_,i)=>'<option value="'+(i+1)+'">'+weekLabel(i+1)+'</option>').join('');
     const label=document.createElement('label'); label.className='small'; label.innerHTML='<b>WEEK FOR THIS DEADLINE</b>'; label.appendChild(select);
     lock.parentNode.insertBefore(label,lock);
   }
   const inferred=Number(q.get('week'))||Math.max(1,Math.min(22,Number(localStorage.getItem('links-nfl-week'))||1));
   select.value=String(inferred);
   const period=()=>String(select.value||'1');
   async function load(){
     msg.textContent='Checking '+weekLabel(Number(period()))+'…';
     try{
       const r=await fetch(api+'?pool='+encodeURIComponent(pool)+'&game='+encodeURIComponent('NFL Pick’em')+'&period='+encodeURIComponent(period())+'&_='+Date.now(),{cache:'no-store'});
       const j=await r.json().catch(()=>({})); const s=j.settings||{};
       lock.value=s.lockAt?String(s.lockAt).slice(0,16):'';
       msg.textContent=s.lockAt?weekLabel(Number(period()))+' override is saved.':'Automatic first kickoff is active for '+weekLabel(Number(period()))+'.';
     }catch{msg.textContent='Could not load this week’s deadline.'}
   }
   select.addEventListener('change',load);
   save.addEventListener('click',async e=>{
     e.preventDefault(); e.stopImmediatePropagation();
     msg.textContent='Saving '+weekLabel(Number(period()))+'…';
     try{
       const r=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pool,game:'NFL Pick’em',period:period(),lockAt:lock.value||''})});
       const j=await r.json().catch(()=>({}));
       msg.textContent=r.ok?(lock.value?weekLabel(Number(period()))+' override saved.':'Automatic first kickoff restored for '+weekLabel(Number(period()))+'.'):(j.error||'Deadline not saved.');
     }catch{msg.textContent='Deadline not saved.'}
   },true);
   load();
 };
 wait();
})();
