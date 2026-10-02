// Sample only this pool's active roster. Keep the selected roster order stable per page.
export function jerseyPlayers(members,currentId,displayName,previous=[]){
 const roster=new Map(members.filter(p=>(p.status||'active')==='active').map(p=>[String(p.playerId),p]));
 const candidates=[...roster.keys()].filter(id=>id!==String(currentId));
 const order=previous.filter(id=>candidates.includes(id));
 const remaining=candidates.filter(id=>!order.includes(id));
 for(let i=remaining.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[remaining[i],remaining[j]]=[remaining[j],remaining[i]]}
 order.push(...remaining);
 const slots=Array(6).fill(null);slots[3]={id:String(currentId),name:displayName||roster.get(String(currentId))?.displayName||String(currentId),me:true};
 // Fill the two phone-visible neighbors first, then the additional desktop lockers.
 [1,4,2,0,5].forEach((slot,i)=>{const p=roster.get(order[i]);if(p)slots[slot]={id:String(p.playerId),name:p.displayName||String(p.playerId),me:false}});
 return {slots,order};
}
export function mountJerseys({pool,playerId,displayName,members,previous}){
 const result=jerseyPlayers(members,playerId,displayName,previous),host=document.getElementById('jerseyNames');host.replaceChildren();
 for(const p of result.slots){const label=document.createElement('span');label.className='jersey-name'+(p?.me?' me':'')+(p?.name.length>12?' long':'');if(p){label.textContent=p.name;label.title=p.name+(p.me?' · Your jersey':'');label.setAttribute('aria-label',label.title);label.dataset.player=p.id}host.append(label)}
 document.getElementById('teamCaption').textContent='On the jerseys: '+pool.name;return result.order;
}
