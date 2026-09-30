(()=>{
 const page=location.pathname.split('/').pop().replace(/\.html$/,'');
 if(!['college','survivor','confidence','game33','squares','props','playoff','march-madness','fantasy','dynasty','game-setup'].includes(page)||new URLSearchParams(location.search).has('demo'))return;
 const css=document.createElement('link');css.rel='stylesheet';css.href='./game-admin-layout.css?v=1';document.head.append(css);
 const opened=new Map();
 function wrap(nodes,title,key){const d=document.createElement('details');d.className='admin-task';d.open=opened.get(key)??false;const summary=document.createElement('summary');summary.textContent=title;d.append(summary);const body=document.createElement('div');body.className='admin-task-body';nodes[0].before(d);nodes.forEach(n=>body.append(n));d.append(body);d.addEventListener('toggle',()=>{if(d.isConnected)opened.set(key,d.open)});return d;}
 function update(){
 observer.disconnect();
 const active=page==='game-setup'||!!document.querySelector('[data-view="admin"].active');
 document.querySelectorAll('.links-admin-workspace').forEach(n=>{if(!active)n.classList.remove('links-admin-workspace')});
 if(active){const root=page==='game-setup'?document.querySelector('.hub-panel'):document.querySelector('#game33Admin,#content,#formatContent,#leagueContent,#confidence,#survivor');
 if(root){root.classList.add('links-admin-workspace');
 if(page==='game-setup'){const form=root.querySelector('#setup');if(form&&!form.hidden&&!form.querySelector('.admin-task')){const nodes=[...form.children].filter(n=>!n.matches('button:not([type=button]),button[type=submit]'));let groups=[],group=[];nodes.forEach(n=>{if(n.matches('label')&&n.querySelector('[name=limit],[name=drivers],[name=options]')&&group.length){groups.push(group);group=[]}group.push(n)});if(group.length)groups.push(group);groups.forEach((nodes,i)=>{const first=nodes[0];const title=first.querySelector('[name=drivers],[name=options]')?'Eligible players & drivers':first.querySelector('[name=limit]')?'Player selection limit':'Event & schedule';wrap(nodes,title,page+':'+title)});}}

 if(page!=='game33'&&page!=='game-setup'&&!root.querySelector(':scope > .admin-task')){
 const cards=[...root.children].filter(n=>n.matches('section')&&n.querySelector('h2,h3'));
 if(cards.length){cards.forEach((card,i)=>{const h=card.querySelector('h2,h3');const title=h.textContent;h.hidden=true;wrap([card],title,page+':'+title);});}
 else {const children=[...root.children].filter(n=>!n.matches('[data-game-invites]'));let groups=[],group=[];children.forEach(n=>{if(n.matches('h2,h3,h4')&&group.length){groups.push(group);group=[]}group.push(n)});if(group.length)groups.push(group);groups.forEach((nodes,i)=>{const h=nodes[0].matches('h2,h3,h4')?nodes[0]:null;const title=h?.textContent||'Game settings';if(h)h.hidden=true;wrap(nodes,title,page+':'+title);});}
 }
 }}
 observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
 }
 const observer=new MutationObserver(update);update();
 // Reveal invalid fields before native validation focuses them.
 document.addEventListener('invalid',e=>{let n=e.target.closest('details');while(n){n.open=true;n=n.parentElement.closest('details')}},true);
})();
