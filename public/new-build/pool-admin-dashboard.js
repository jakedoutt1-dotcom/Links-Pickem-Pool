(()=>{'use strict';
const roots=new Map();let queued=false;
function organize(root){
 if(!root||root.querySelector(':scope > .pool-admin-tools'))return;
 const nodes=[...root.children];if(!nodes.length)return;
 const groups=[];let group;
 for(const node of nodes){
  const starts=node.matches('section,.admin-card,details,h2,h3,h4');
  if(starts||!group){group={nodes:[],title:node.matches('h2,h3,h4')?node.textContent:node.querySelector('summary,h2,h3,h4')?.textContent||'Pool actions'};groups.push(group)}
  group.nodes.push(node);
 }
 const nav=document.createElement('nav');nav.className='pool-admin-tools';nav.setAttribute('aria-label','Pool admin tools');
 const back=document.createElement('button');back.type='button';back.className='pool-admin-back';back.textContent='← Back to pool admin';back.hidden=true;
 const panels=groups.map((g,i)=>{const panel=document.createElement('div');panel.className='pool-admin-screen';panel.hidden=true;g.nodes.forEach(n=>panel.append(n));const button=document.createElement('button');button.type='button';button.className='pool-admin-tool';const title=document.createElement('strong');title.textContent=g.title.trim();const hint=document.createElement('span');hint.textContent='Open →';button.append(title,hint);button.onclick=()=>{history.pushState(null,'','#pool-admin-'+i);show(i,true)};nav.append(button);return panel});
 root.replaceChildren(nav,back,...panels);
 const legacyNav=document.querySelector('.admin-nav');if(root.id==='manager'&&legacyNav)legacyNav.hidden=true;
 function show(index,focus=false){const valid=Number.isInteger(index)&&index>=0&&index<panels.length;nav.hidden=valid;back.hidden=!valid;panels.forEach((p,i)=>{p.hidden=!valid||i!==index;if(!p.hidden)p.querySelectorAll(':scope > details').forEach(d=>d.open=true)});if(focus){const target=valid?back:nav.querySelector('button');target?.focus();root.scrollIntoView({block:'start',behavior:'smooth'})}}
 back.onclick=()=>{history.pushState(null,'',location.pathname+location.search);show(-1,true)};
 const sync=()=>{const match=location.hash.match(/^#pool-admin-(\d+)$/);show(match?Number(match[1]):-1)};roots.set(root,sync);sync();
}
function scan(){queued=false;
 const manager=document.getElementById('manager');if(manager?.querySelector('#settings'))organize(manager);
 const content=document.getElementById('content');if(content?.querySelector('#gameCount,#loadField,[data-access]'))organize(content);
 const event=document.getElementById('eventBody');if(event?.querySelector('#eventSetup'))organize(event);
 const formats=document.getElementById('formatContent');if(formats?.querySelector('#createBoard,#propsSettings,#playoffSettings'))organize(formats);
 const game33=document.querySelector('[data-admin-section]')?.parentElement;if(game33&&!game33.classList.contains('pool-admin-screen'))organize(game33);
 if(document.querySelector('[data-view="admin"].active')){for(const id of ['leagueContent','confidence','survivor'])organize(document.getElementById(id))}
 for(const root of roots.keys())if(!root.isConnected)roots.delete(root);
}
new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(scan)}}).observe(document.body,{childList:true,subtree:true});
document.addEventListener('invalid',e=>{const panel=e.target.closest('.pool-admin-screen');if(panel){const root=panel.parentElement;const index=[...root.querySelectorAll(':scope > .pool-admin-screen')].indexOf(panel);history.replaceState(null,'','#pool-admin-'+index);roots.get(root)?.();panel.querySelectorAll('details').forEach(d=>d.open=true)}},true);
window.addEventListener('popstate',()=>{for(const sync of roots.values())sync()});scan();
})();
