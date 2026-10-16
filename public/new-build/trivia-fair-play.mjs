// Page visibility is a best-effort signal, not evidence of a search or cheating.
export function watchFairPlay({getState,send,changed=()=>{},storage=sessionStorage,doc=document,win=window,now=()=>Date.now()}){
 const key='trivia-fair-pending-v1',seen=new Set();let active=false,memory=[],canStore=true;
 const read=()=>{if(canStore)try{const rows=JSON.parse(storage.getItem(key)||'[]');memory=Array.isArray(rows)?rows.slice(-8):[]}catch{canStore=false}return memory};
 const write=rows=>{memory=rows;if(canStore)try{storage.setItem(key,JSON.stringify(rows))}catch{canStore=false}};
 const identity=s=>s?.code+':'+s?.fairIdentity+':'+s?.game+':'+s?.index;
 const pending=s=>read().some(p=>p.key===identity(s));
 async function flush(){
  if(active)return;const s=getState();if(!s?.fairIdentity)return;active=true;
  try{for(const p of read()){
   if(p.code!==s.code||p.identity!==s.fairIdentity)continue;
   await send({action:'fair-play-leave',code:p.code,gameNumber:p.gameNumber,index:p.index});
   write(read().filter(row=>row.key!==p.key));
  }}catch{/* Retry this bounded notice when the page is visible or reconnects. */}
  finally{active=false;changed();}
 }
 function leave(){
  const s=getState(),time=now();
  if(!s||s.host||!s.fairIdentity||!['warn','strict'].includes(s.fairPlay)||s.phase!=='question'||!s.eligible||s.submitted||time<s.startsAt||time>=s.deadline)return;
  const id=identity(s);if(!seen.has(id)){seen.add(id);const rows=read();if(!rows.some(p=>p.key===id))write([...rows,{key:id,code:s.code,identity:s.fairIdentity,gameNumber:s.game,index:s.index}].slice(-8));}
  changed();void flush();
 }
 const visibility=()=>{if(doc.hidden)leave();else void flush()};
 doc.addEventListener('visibilitychange',visibility);win.addEventListener('pagehide',leave);win.addEventListener('online',flush);
 return {flush,pending,dispose(){doc.removeEventListener('visibilitychange',visibility);win.removeEventListener('pagehide',leave);win.removeEventListener('online',flush)}};
}

export function fairPlayText(mode){
 if(mode==='off')return 'Please play without searching for answers or using extra devices. This host has turned Fair Play alerts off.';
 return 'Stay on this page during each question. Switching apps or tabs, locking your phone, or taking a call may notify the host. This reports leaving the page, not what you opened. '+(mode==='strict'?'Strict mode also locks your saved answer or recommendation for that question. A teammate leaving does not lock the captain’s answer. ':'')+'Ask the host to excuse an accidental interruption. Please do not use searches or extra devices.';
}
