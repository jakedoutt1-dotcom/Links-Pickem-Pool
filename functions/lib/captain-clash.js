export const LIBRARY=Array.from({length:5},(_,i)=>({id:'links-'+i,url:'./assets/captain-scene-'+(i+1)+'.png',label:['Sideline surprise','Office meeting','Golf getaway','Cookout special','Race day errands'][i]}));
export function shuffle(a){const copy=[...a];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
export function startRound(s,now){s.phase='write';s.startsAt=now+3000;s.deadline=s.startsAt+30000;for(const p of Object.values(s.players)){p.caption='';p.vote=null;p.roundPoints=0}delete s.options;}
export function advance(s,now){
 if(s.phase==='write'&&now>=s.deadline){s.options=shuffle(Object.entries(s.players).filter(([,p])=>p.caption).map(([seat,p])=>({id:crypto.randomUUID(),seat,text:p.caption})));s.phase='vote';s.deadline=now+20000;return true}
 if(s.phase==='vote'&&now>=s.deadline){const value=s.index===4?200:100;for(const p of Object.values(s.players)){const option=s.options.find(o=>o.id===p.vote);if(option&&s.players[option.seat]){s.players[option.seat].score+=value;s.players[option.seat].roundPoints+=value}}s.phase='reveal';s.deadline=now+10000;return true}
 if(s.phase==='reveal'&&now>=s.deadline){if(s.index===4){s.phase='ended';s.deadline=0}else{s.index++;startRound(s,now)}return true}return false;
}
export function view(s,seat,now,display=false){
 const you=s.players[seat],reveal=['reveal','ended'].includes(s.phase),photo=s.deck?.[s.index];
 return {code:s.code,game:s.game,index:s.index,phase:s.phase,mode:s.mode,serverNow:now,startsAt:s.startsAt,deadline:s.deadline,host:!display&&seat===s.owner,display,photo:photo||null,
 players:Object.entries(s.players).map(([id,p])=>({name:p.name,score:p.score,ready:p.ready,you:!display&&id===seat,roundPoints:reveal?p.roundPoints:0})).sort((a,b)=>b.score-a.score),
 caption:!display?you?.caption||'':'',vote:!display?you?.vote||null:null,
 submitted:Object.values(s.players).filter(p=>s.phase==='write'?p.caption:p.vote).length,
 options:['vote','reveal','ended'].includes(s.phase)?(s.options||[]).map(o=>({id:o.id,text:o.text,mine:!display&&o.seat===seat,...(reveal?{author:s.players[o.seat]?.name||'Player',votes:Object.values(s.players).filter(p=>p.vote===o.id).length}:{})})):[],
 photos:s.phase==='lobby'?(s.photos||[]).filter(p=>p.approved||(!display&&(seat===s.owner||p.seat===seat))).map(p=>({id:p.id,approved:p.approved,by:s.players[p.seat]?.name||'Player'})):[],
 ...(seat===s.owner&&!display?{displayKey:s.displayKey}:{})};
}
