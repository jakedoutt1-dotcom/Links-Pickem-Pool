const fail=message=>{const e=Error(message);e.code='INVALID_ACTION';throw e};
const seated=(s,seat)=>{const p=s.players[seat];return p&&p.status==='active'&&s.tables.find(t=>t.id===p.tableId&&t.players.some(x=>x.id===p.id))};
export function sendTableChat(s,seat,text,now=Date.now()){
 const p=s.players[seat],table=seated(s,seat);
 if(!table||s.mode==='practice')fail('Chat is available when you are seated with other players.');
 if(s.chatMuted?.[p.id])fail('The host has muted your chat.');
 if(typeof text!=='string')fail('Enter a message.');
 text=text.normalize('NFKC').replace(/[\x00-\x1f\x7f]/g,' ').trim();
 if(!text||text.length>240)fail('Messages must be 1–240 characters.');
 if(p.lastChatAt!==undefined&&now-p.lastChatAt<2000)fail('Wait two seconds between messages.');
 s.tableChats||={};
 for(const id of Object.keys(s.tableChats))if(!s.tables.some(t=>t.id===id))delete s.tableChats[id];
 const messages=s.tableChats[table.id]||=[];
 messages.push({id:crypto.randomUUID(),playerId:p.id,name:p.name,text,at:now});
 s.tableChats[table.id]=messages.slice(-40);p.lastChatAt=now;
 // Bound room storage even with 360 players and emoji-heavy messages.
 const all=Object.values(s.tableChats).flat().sort((a,b)=>a.at-b.at);
 if(all.length>600){const expired=new Set(all.slice(0,all.length-600).map(m=>m.id));for(const id of Object.keys(s.tableChats))s.tableChats[id]=s.tableChats[id].filter(m=>!expired.has(m.id));}
}
export function muteTableChat(s,playerId,muted){
 if(typeof muted!=='boolean'||!Object.values(s.players).some(p=>p.id===playerId&&!p.bot))fail('Choose a player to mute or unmute.');
 s.chatMuted||={};if(muted)s.chatMuted[playerId]=true;else delete s.chatMuted[playerId];
}
export function tableChatView(s,seat,{host=false}={}){
 const p=s.players[seat],table=seated(s,seat);
 return {tableId:table?.id||null,enabled:!!table&&s.mode!=='practice'&&['playing','paused'].includes(s.status),muted:!!s.chatMuted?.[p?.id],messages:table?s.tableChats?.[table.id]||[]:[],...(host?{moderation:Object.values(s.players).filter(p=>!p.bot).map(p=>({id:p.id,name:p.name,muted:!!s.chatMuted?.[p.id]}))}:{})};
}
