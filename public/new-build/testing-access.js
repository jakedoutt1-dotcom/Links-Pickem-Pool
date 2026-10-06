// Public notice follows the same server switch that controls hosting access.
(async()=>{
 try{
  const response=await fetch('/new-build/api/testing-access',{cache:'no-store'});
  if(!response.ok||!(await response.json()).freeGameTesting)return;
  const page=location.pathname.split('/').pop().replace(/\.html$/,'');
  if(!['','index','party-room','party-pack','commissioner-hub','my-pools','create-pool'].includes(page))return;
  const notice=document.createElement('p');notice.setAttribute('role','status');notice.style.cssText='padding:16px 20px;margin:16px;border:1px solid #bfa15e;border-radius:12px;background:#171a17;color:#f4d583;font:600 16px/1.5 system-ui';notice.textContent='Free during testing: host pool and party games with friends. No package or Party Pass needed. Hosted Trivia Night still requires paid host access.';
  const main=document.querySelector('main')||document.body;main.prepend(notice);
  const packages=document.getElementById('packages');if(packages)packages.hidden=true;
  const replacements=new Map([
   ['One host pays. Explore packages for your whole crew.','Host pool and party games free during testing. Hosted Trivia Night is sold separately.'],
   ['Explore the Party Pack: $4.99 for 24 hours or $39.99 for 365 days. One host pays. Up to 8 players total, with no per-player fees.','Party games are free during testing. Bring up to 8 players total; player limits vary by game. Hosted Trivia Night is sold separately.']
  ]);
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;
  while(node=walker.nextNode()){const replacement=replacements.get(node.textContent.trim());if(replacement)node.textContent=replacement}

 }catch{/* Keep existing navigation available if the notice cannot load. */}
})();
