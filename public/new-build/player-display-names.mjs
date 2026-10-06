// Presentation only: player IDs, input values and saved picks are never renamed.
let names=new Map(),version=0;
const originals=new WeakMap();
function paint(){
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),changes=[];
 while(walker.nextNode()){
  const node=walker.currentNode,parent=node.parentElement;
  if(!parent||parent.closest('script,style,textarea,input,[contenteditable],dialog,#accountForm,#loginTransition'))continue;
  const prior=originals.get(node),source=prior&&node.nodeValue===prior.rendered?prior.source:node.nodeValue;
  const trimmed=source.trim();let replacement=names.get(trimmed);
  if(!replacement&&trimmed.endsWith('’s Locker Room')){const name=trimmed.slice(0,-14);if(names.has(name))replacement=names.get(name)+'’s Locker Room'}
  const rendered=replacement?source.replace(trimmed,replacement):source;
  if(node.nodeValue!==rendered)changes.push([node,source,rendered]);
 }
 observer.disconnect();for(const [node,source,rendered] of changes){node.nodeValue=rendered;originals.set(node,{source,rendered})}observer.observe(document.body,{childList:true,subtree:true,characterData:true});
}
let scheduled=false;
const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;paint()})});
async function refresh(){
 const token=localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token');if(!token)return;
 const request=++version;
 try{const response=await fetch('./api/login-name',{headers:{Authorization:'Bearer '+token},cache:'no-store',signal:AbortSignal.timeout(10000)});if(!response.ok)return;const data=await response.json();if(request!==version||token!==(localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token')))return;
 names=new Map((data.names||[]).map(x=>[x.player_name,x.display_name]));paint();
 }catch{/* Keep the last verified display names during a temporary outage. */}
}
observer.observe(document.body,{childList:true,subtree:true,characterData:true});
refresh();setInterval(()=>{if(!document.hidden)refresh()},15000);
for(const event of ['links:names-changed','links:pools-ready','pageshow'])window.addEventListener(event,refresh);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
