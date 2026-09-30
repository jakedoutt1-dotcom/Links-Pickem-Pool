(()=>{
 const token=()=>localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token')||'';if(!token())return;
 let names=new Map(),originals=new WeakMap(),scheduled=false;
 function render(){scheduled=false;const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){const parent=node.parentElement;if(!parent||parent.closest('script,style,textarea,input,option,dialog,header,footer,.links-guide-tools')||!parent.closest('main,.links-nfl-player,.links-print-modal'))continue;const old=originals.get(node),raw=old&&node.nodeValue===old.rendered?old.raw:node.nodeValue,trim=raw.trim();let value=names.get(trim);if(!value&&trim.endsWith(' · NFL PICKS')){const name=trim.slice(0,-12);if(names.has(name))value=names.get(name)+' · NFL PICKS'}if(value){const rendered=raw.replace(trim,value);if(node.nodeValue!==rendered)node.nodeValue=rendered;originals.set(node,{raw,rendered})}}}
 const observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;queueMicrotask(render)}});observer.observe(document.body,{childList:true,subtree:true,characterData:true});
 async function load(){try{const r=await fetch('./api/login-name',{headers:{Authorization:'Bearer '+token()},cache:'no-store'});if(!r.ok)return;const j=await r.json();names=new Map(j.names.map(x=>[x.player_name,x.display_name]));render()}catch{}}
 window.addEventListener('links:names-changed',load);load();
})();
