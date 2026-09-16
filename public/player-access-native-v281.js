(()=>{'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const original=window.renderPaid;
if(typeof original!=='function')return;
window.renderPaid=async function(){
  await original.apply(this,arguments);
  const body=document.getElementById('paidBody');
  if(!body)return;
  let deadlineLocked=false;
  try{const d=await api(q('/api/lock-status'));deadlineLocked=!!d?.locked}catch(e){}
  const rows=[...body.querySelectorAll('.pay-status')];
  rows.forEach(row=>{
    const name=row.querySelector('b')?.textContent?.trim()||'';
    const control=row.querySelector('[data-paid-player]');
    const raw=(control?.textContent||row.textContent||'').toUpperCase();
    const active=raw.includes('ACTIVE')&&!raw.includes('ACTIVATE PLAYER')&&!raw.includes('PENDING');
    const access=active?'✅ ACTIVE':'⛔ NOT ACTIVE';
    const pick=deadlineLocked?'🔒 DEADLINE LOCKED':'⬜ NOT LOCKED IN';
    row.classList.add('links-native-access-v281');
    row.innerHTML=`<div class="links-native-player-v281"><b>${esc(name)}</b></div><div class="links-native-status-v281"><div><span>PLAYER ACCESS:</span><strong class="${active?'ok':'off'}">${access}</strong></div><div><span>PICK STATUS:</span><strong class="${deadlineLocked?'locked':'open'}">${pick}</strong></div></div>`;
    if(control){
      const btn=document.createElement('button');btn.type='button';btn.dataset.paidPlayer=name;btn.className=active?'green':'red';btn.textContent=active?'ACTIVE ✓':'ACTIVATE PLAYER';row.appendChild(btn);
      btn.onclick=async()=>{await api(q('/api/admin/payment'),{method:'POST',body:JSON.stringify({sport,week,player:name,paid:!active})});await window.renderPaid()};
    }
  });
  let help=document.getElementById('linksNativeAccessHelpV281');
  if(!help){help=document.createElement('div');help.id='linksNativeAccessHelpV281';help.className='links-native-help-v281';body.insertAdjacentElement('beforebegin',help)}
  help.innerHTML='<div><b>PLAYER ACCESS</b><p>✅ ACTIVE — the commissioner has activated this player for the pool/week. The player can make and save picks.</p><p>⛔ NOT ACTIVE — the commissioner must activate the player before picks can be submitted.</p></div><div><b>PICK STATUS</b><p>⬜ NOT LOCKED IN — the player can still make or change picks.</p><p>✅ PLAYER LOCKED IN — the player has locked in picks, but can unlock and make changes until the weekly deadline.</p><p>🔒 DEADLINE LOCKED — the weekly deadline has passed. Picks can no longer be changed.</p></div>';
};
})();
