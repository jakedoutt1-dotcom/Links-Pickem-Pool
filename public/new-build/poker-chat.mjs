export function createTableChat(send){
 const panel=document.createElement('details');panel.className='poker-chat';panel.hidden=true;
 panel.innerHTML='<summary>Table chat <span class="chat-unread"></span></summary><p class="chat-info help"></p><ol class="chat-messages" aria-label="Table messages"></ol><div class="chat-reactions"></div><form><label>Message your table<input name="message" maxlength="240" autocomplete="off" placeholder="Say something…" required></label><button type="submit">Send</button></form><p class="chat-status help" role="status"></p>';
 document.getElementById('myHand').append(panel);
 const mod=document.createElement('details');mod.className='poker-chat-moderation';mod.hidden=true;mod.innerHTML='<summary>Manage table chat</summary><p class="help">Mute applies across this tournament. Messages stay private to each table and off the TV.</p><div></div>';
 document.getElementById('hostDesk').append(mod);
 const $=q=>panel.querySelector(q),list=$('.chat-messages'),input=$('input'),form=$('form'),status=$('.chat-status');let room=null,sending=false,signature='',moderationSignature='';
 const read=(key,fallback='')=>{try{return localStorage.getItem(key)||fallback}catch{return fallback}},write=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
 panel.open=read('links-poker-chat-open',matchMedia('(min-width:900px)').matches?'yes':'no')==='yes';
 const key=()=>`links-poker-chat-seen:${room.code}:${room.playerId}:${room.chat.tableId}`;
 function unread(){const messages=room?.chat?.messages||[];if(!room?.chat?.tableId)return;const last=messages.at(-1)?.id||'';if(panel.open){write(key(),last);$('.chat-unread').textContent='';return}const seen=read(key()),index=messages.findIndex(m=>m.id===seen),count=index<0?messages.length:messages.length-index-1;$('.chat-unread').textContent=count?'· '+count+' new':''}
 panel.addEventListener('toggle',()=>{write('links-poker-chat-open',panel.open?'yes':'no');unread();if(panel.open)list.scrollTop=list.scrollHeight});
 async function submit(text){if(sending||!room?.chat?.enabled||room.chat.muted)return;sending=true;status.textContent='Sending…';form.querySelector('button').disabled=true;try{await send('chat',{text});input.value='';status.textContent=''}catch(e){status.textContent=e.message}finally{sending=false;form.querySelector('button').disabled=!room?.chat?.enabled||room.chat.muted}}
 form.onsubmit=e=>{e.preventDefault();void submit(input.value)};
 for(const text of ['Nice hand!','Good luck!','Wow!','Good game!']){const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>void submit(text);$('.chat-reactions').append(b)}
 return {update(next){
  room=next;const chat=room.chat;panel.hidden=room.isTv||room.mode==='practice'||!chat?.tableId;mod.hidden=room.isTv||!room.isHost;
  if(!chat){list.replaceChildren();return}
  $('.chat-info').textContent=String(chat.tableId||'').replace('table-','Table ')+' · Private to players at this table';
  const sig=chat.tableId+':'+chat.messages.map(m=>m.id).join(',');
  if(sig!==signature){signature=sig;const bottom=list.scrollHeight-list.scrollTop-list.clientHeight<45;list.replaceChildren();for(const m of chat.messages){const li=document.createElement('li'),name=document.createElement('strong'),text=document.createElement('span');name.textContent=m.name+(m.playerId===room.playerId?' · You':'');text.textContent=m.text;li.append(name,text);list.append(li)}if(!chat.messages.length){const li=document.createElement('li');li.textContent='Say hello to your table.';list.append(li)}if(bottom||panel.open)list.scrollTop=list.scrollHeight}
  const disabled=!chat.enabled||chat.muted||sending;input.disabled=disabled;for(const b of panel.querySelectorAll('button'))b.disabled=disabled;if(chat.muted)status.textContent='The host has muted your chat.';else if(!sending&&status.textContent==='The host has muted your chat.')status.textContent='';unread();
  const mods=chat.moderation||[],ms=JSON.stringify(mods);if(ms!==moderationSignature){moderationSignature=ms;const target=mod.querySelector('div');target.replaceChildren();for(const player of mods){const row=document.createElement('div'),name=document.createElement('span'),b=document.createElement('button');name.textContent=player.name;b.type='button';b.textContent=player.muted?'Unmute':'Mute';b.setAttribute('aria-label',(player.muted?'Unmute ':'Mute ')+player.name);b.onclick=async()=>{b.disabled=true;try{await send('chat-mute',{targetPlayerId:player.id,muted:!player.muted})}catch(e){status.textContent=e.message}finally{b.disabled=false}};row.append(name,b);target.append(row)}}
 }};
}
