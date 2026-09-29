// Keep private browser data scoped to the signed-in pool and player.
// Unscoped legacy data has no provable owner and must not be imported.
(()=>{
 const identity=()=>{try{const pool=JSON.parse(localStorage.getItem('links-current-pool')||'null'),player=localStorage.getItem('links-player-id');return pool?.id&&player?JSON.stringify([String(pool.id),player]):null}catch{return null}};
 const owner=identity(),key=owner?'links-playmaker-private:'+encodeURIComponent(owner):null;
 const valid=value=>Array.isArray(value)?value.filter(x=>x&&typeof x==='object'&&!Array.isArray(x)&&typeof x.selection==='string').slice(0,100):[];
 window.LINKS_PLAYMAKER_STORAGE={
  read(){if(!key||identity()!==owner)return [];try{return valid(JSON.parse(localStorage.getItem(key)||'[]'))}catch{return []}},
  write(value){if(!key||identity()!==owner)return false;try{localStorage.setItem(key,JSON.stringify(valid(value)));return true}catch{return false}}
 };
 // A different tab signing out or switching accounts must hide this tab's data.
 window.addEventListener('storage',event=>{if(event.key===null||['links-current-pool','links-player-id'].includes(event.key)){if(identity()!==owner)location.reload()}});
 window.addEventListener('pageshow',()=>{if(identity()!==owner)location.reload()});
})();
