// Keep verified replay payloads until the server acknowledges them.
export function createPendingScores({storage,send,key='links-goal-line-pending-v1'}){
 let active=null;
 const read=()=>{try{const rows=JSON.parse(storage.getItem(key)||'[]');return Array.isArray(rows)?rows:[]}catch{return []}};
 const write=rows=>storage.setItem(key,JSON.stringify(rows));
 return {count:()=>read().length,enqueue(payload){const rows=read(),index=rows.findIndex(r=>r.run===payload.run);if(index>=0)rows[index]=payload;else rows.push(payload);write(rows)},flush(){if(active)return active;active=(async()=>{let saved=0;while(read().length){const payload=read()[0];await send(payload);const rows=read();write(rows.filter(r=>r.run!==payload.run||JSON.stringify(r)!==JSON.stringify(payload)));saved++}return saved})().finally(()=>{active=null});return active}};
}
