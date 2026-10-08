// Share only public join addresses, never account tokens or TV/host controls.
export function publicInvite(value,base=location.href){
 const source=new URL(value,base),home=new URL(base);if(source.origin!==home.origin)throw Error('Use a LINKS invitation from this site.');
 const allowed=['room','qr','invite'],url=new URL(source.pathname,home.origin);for(const key of allowed){const v=source.searchParams.get(key);if(v)url.searchParams.set(key,v)}
 if(!url.searchParams.size)throw Error('Create a room or invitation first.');return url.href;
}
export function mountInviteShare({anchor,getUrl,title='a game',status}){
 if(!anchor||anchor.dataset.inviteShare)return;anchor.dataset.inviteShare='1';
 if(!document.getElementById('links-invite-share-style')){const style=document.createElement('style');style.id='links-invite-share-style';style.textContent='.links-invite-share{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:12px 0}.links-invite-share>a,.links-invite-share>button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;box-sizing:border-box;padding:10px 14px;border:1px solid #9b814c;border-radius:9px;background:#211e16;color:#f3d58b;font:700 14px system-ui;text-decoration:none;cursor:pointer}.links-invite-share>[aria-disabled=true]{opacity:.5;pointer-events:none}.links-invite-share+small{display:block;color:#b9b5a8;font:12px/1.5 system-ui;margin-bottom:12px}.links-invite-share [hidden]{display:none!important}';document.head.append(style)}
 const box=document.createElement('div');box.className='links-invite-share';anchor.before(box);box.append(anchor);anchor.textContent='Copy Invite';
 const share=document.createElement('button');share.type='button';share.textContent='Share Invite';box.prepend(share);
 const note=document.createElement('small');note.textContent='Share through your favorite app, or copy the invitation link.';box.after(note);
 const msg=status||document.createElement('p');if(!status){msg.setAttribute('role','status');note.after(msg)}
 const invite=()=>{const label=typeof title==='function'?title():title;return {title:'Join '+label+' on LINKS',text:'Join me for '+label+' on LINKS!',url:publicInvite(getUrl())}};
 const fallback=value=>{msg.textContent='Copy this invitation: '+value};
 anchor.onclick=async()=>{try{const d=invite(),value=d.text+'\n'+d.url;try{await navigator.clipboard.writeText(value);msg.textContent='Invitation copied. Paste it into a message.'}catch{fallback(value)}}catch(error){msg.textContent=error.message}};
 share.onclick=async()=>{try{const d=invite();if(navigator.share){try{await navigator.share(d);msg.textContent='Invitation shared.'}catch(error){if(error.name!=='AbortError')fallback(d.text+'\n'+d.url)}}else{try{await navigator.clipboard.writeText(d.text+'\n'+d.url);msg.textContent='Invitation copied. Paste it into your messaging app.'}catch{fallback(d.text+'\n'+d.url)}}}catch(error){msg.textContent=error.message}};
 return {setEnabled(enabled){anchor.disabled=share.disabled=!enabled}};
}
