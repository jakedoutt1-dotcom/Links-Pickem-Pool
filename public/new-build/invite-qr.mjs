import {mountInviteShare} from './invite-share.mjs';
import qrcode from './vendor/qrcode.mjs';
export async function openInviteQR(pool){
 const d=document.createElement('dialog');d.style.cssText='width:min(440px,calc(100% - 28px));max-height:90dvh;overflow:auto;box-sizing:border-box;padding:22px;background:#091923;color:white;border:1px solid #edc466;border-radius:14px';
 d.innerHTML='<h2>Invite players</h2><h3></h3><p>Text, share, or scan to join this pool. Each person creates their own player name and password.</p><div data-qr></div><p data-expiry></p><p>Anyone with this code can join while it is active. It expires in 7 days. Closing this popup keeps the code active.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="action" data-copy>Copy invite link</button><button type="button" class="action" data-disable>Turn off QR invite</button><button type="button" class="action" data-close>Close</button></div><p role="status">Loading QR code…</p>';
 document.body.append(d);d.showModal();d.querySelector('[data-close]').onclick=()=>d.close();d.onclose=()=>d.remove();
 const status=d.querySelector('[role=status]'),copy=d.querySelector('[data-copy]'),disable=d.querySelector('[data-disable]');copy.disabled=disable.disabled=true;
 async function api(action){const token=localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token')||'';const r=await fetch('./api/qr-invite',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({pool,action})});const j=await r.json();if(!r.ok)throw Error(j.error||'QR invitation unavailable.');return j}
 try{const j=await api('show');if(!d.open)return;d.querySelector('h3').textContent=j.poolName+' · '+j.poolCode;const qr=qrcode(0,'M');qr.addData(j.url);qr.make();d.querySelector('[data-qr]').innerHTML=qr.createSvgTag({cellSize:5,margin:20,scalable:true});const svg=d.querySelector('svg');svg.style.cssText='width:100%;max-width:320px;background:white;display:block;margin:auto';svg.setAttribute('aria-label','Scan to join '+j.poolName);d.querySelector('[data-expiry]').textContent='Expires '+new Date(j.expiresAt).toLocaleString();status.textContent='Ready to scan';copy.disabled=disable.disabled=false;
 const sharing=mountInviteShare({anchor:copy,getUrl:()=>j.url,title:j.poolName,status});

 disable.onclick=async()=>{disable.disabled=true;try{await api('disable');d.querySelector('[data-qr]').replaceChildren();sharing.setEnabled(false);status.textContent='QR invite turned off. Existing players stay in the pool. Close and reopen to create a new code.'}catch(e){status.textContent=e.message;disable.disabled=false}};
 }catch(e){status.textContent=e.message}
}
