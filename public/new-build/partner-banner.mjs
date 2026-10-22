import {nearby} from './partner-match.mjs';
let started=false;
export function mountPartners(panel,{host,controlsHost,brandingOnly=false,autoLocate=true,onPartner=()=>{}}={}){if(started)return;started=true;
 const box=document.createElement('section');box.id='linksPartnerBanner';box.setAttribute('aria-label','LINKS partners');box.style.cssText='box-sizing:border-box;grid-column:1/-1;width:100%;min-width:0;padding:16px;border:1px solid #304b5d;border-radius:16px;background:#0b1b27;color:#fff;margin:0 0 16px';if(host)host.append(box);else panel.after(box);
 let generation=0,enabled=false,dismissed=false,controlRow=null,matched=false,checking=false,nearbyCandidates=[];
 const mobile=matchMedia('(max-width:900px)');
 function clearControls(){controlRow?.remove();controlRow=null}
 function placeControls(){if(controlRow)(controlsHost&&mobile.matches?controlsHost:box).append(controlRow)}
 function actionControls(...buttons){clearControls();controlRow=document.createElement('div');controlRow.className='partner-location-controls';controlRow.append(...buttons);placeControls()}
 mobile.addEventListener('change',placeControls);
 try{const preference=localStorage.getItem('links-partner-location');enabled=preference==='yes'||(autoLocate&&preference!=='no')}catch{enabled=autoLocate}
 const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.className='action';b.textContent=label;b.style.cssText='max-width:100%;white-space:normal;margin:4px 4px 0 0';b.onclick=fn;return b};
 function text(tag,value){const el=document.createElement(tag);el.textContent=value;return el}
 function base(message){box.onpointerdown=null;box.onpointerup=null;box.onpointercancel=null;matched=false;clearControls();onPartner(null);box.replaceChildren();box.hidden=dismissed;const head=text('strong','Check out these offers');head.style.color='#edc466';const close=button('×',()=>{dismissed=true;generation++;clearControls();onPartner(null);box.hidden=true;box.replaceChildren()});close.setAttribute('aria-label','Dismiss partner banner');close.style.float='right';box.append(close,head,text('p',message));}
 function general(message='Discover offers from the LINKS partners you visit.'){
 base(message);box.append(button(autoLocate&&enabled?'Check location again':'Show partners near me',()=>{dismissed=false;enabled=true;try{localStorage.setItem('links-partner-location','yes')}catch{}check(true)}));box.append(text('small','Optional location access. Your coordinates stay on this device.'));if(enabled)actionControls(button('Turn off location ads',()=>{enabled=false;generation++;try{localStorage.setItem('links-partner-location','no')}catch{}general()}));
 }
 function controls(){const browse=button('See nearby venues',()=>{if(nearbyCandidates.length)show(nearbyCandidates[0],{candidates:nearbyCandidates,confirmed:false});else check(true)});actionControls(browse,button('Check my location again',()=>check(true)),button('Turn off location ads',()=>{enabled=false;generation++;try{localStorage.setItem('links-partner-location','no')}catch{}general()}))}
 function show(p,{candidates=[p],index=0,confirmed=true}={}){
   base(confirmed?'Partner offer':'Nearby partner offers · GPS has not confirmed your venue.');matched=true;onPartner(confirmed?p:null);
   if(brandingOnly&&confirmed){box.replaceChildren();controls();return}
   const identity=document.createElement('div');identity.className='partner-brand';identity.style.cssText='display:flex;align-items:center;gap:14px;min-width:0';
   const img=document.createElement('img');img.src=p.logo;img.alt=p.name;img.referrerPolicy='no-referrer';img.style.cssText='width:80px;height:64px;object-fit:contain;flex-shrink:0';img.onerror=()=>img.remove();
   const name=text('h3',p.name);name.style.cssText='margin:0;min-width:0;overflow-wrap:anywhere';identity.append(img,name);
   const offer=text('p',p.offer||p.address);offer.style.cssText='margin:16px 0;padding:16px;border:1px solid #edc466;border-radius:12px;background:#102b3b;color:#fff;font-size:1.2rem;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere';
   box.append(identity,offer);
   if(p.website){const link=document.createElement('a');link.href=p.website;link.target='_blank';link.rel='noopener noreferrer';link.className='action';link.textContent='Visit website';link.style.cssText='display:inline-block;max-width:100%;box-sizing:border-box;white-space:normal;margin-bottom:12px';box.append(link)}
   if(!confirmed)box.append(button('Use this venue',()=>show(p,{candidates,index,confirmed:true})));
   if(candidates.length>1){
     const nav=document.createElement('nav');nav.setAttribute('aria-label','Browse venue offers');nav.style.cssText='display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;margin:10px 0';
     const move=delta=>show(candidates[(index+delta+candidates.length)%candidates.length],{candidates,index:(index+delta+candidates.length)%candidates.length,confirmed:false});
     const previous=button('←',()=>move(-1));previous.setAttribute('aria-label','Previous venue offer');const next=button('→',()=>move(1));next.setAttribute('aria-label','Next venue offer');
     nav.append(previous,text('span',(index+1)+' / '+candidates.length),next);box.append(nav);
     let start=null;box.style.touchAction='pan-y';box.onpointerdown=e=>{start=e.target.closest('button,a')?null:{x:e.clientX,y:e.clientY}};box.onpointerup=e=>{if(start&&Math.abs(e.clientX-start.x)>50&&Math.abs(e.clientX-start.x)>Math.abs(e.clientY-start.y)*1.5)move(e.clientX<start.x?1:-1);start=null};box.onpointercancel=()=>{start=null};
   }else{box.onpointerdown=null;box.onpointerup=null;box.onpointercancel=null}
   controls();
 }

 async function check(explicit=false){if(checking||!enabled||dismissed)return;checking=true;try{await locate(explicit)}finally{checking=false}}
 async function locate(explicit=false){const serial=++generation;base('Checking nearby partners…');
 if(!navigator.geolocation){general('Location is unavailable. Enjoy your LINKS pool.');return}
 if(!explicit){try{const permission=await navigator.permissions.query({name:'geolocation'});if(serial!==generation)return;if(permission.state!=='granted'){general('Allow location to see offers from the partner location you are visiting.');return}}catch{general();return}}
 try{
 const [position,response]=await Promise.all([new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,maximumAge:0,timeout:12000})),fetch('./api/partners?public=1',{cache:'no-store'})]);
 if(serial!==generation||document.hidden)return;if(!response.ok)throw Error();const data=await response.json();if(serial!==generation)return;const result=nearby(data.partners,position.coords);nearbyCandidates=nearby(data.partners.map(p=>({...p,radius:3000})),position.coords).candidates.map(p=>({...p,radius:data.partners.find(original=>original.id===p.id)?.radius||p.radius}));
 if(!result.candidates.length){general('No nearby LINKS partner was found. Offers will appear automatically when a partner is detected.');return}
 if(result.certain){show(result.candidates[0],{candidates:result.candidates});return}
 show(result.candidates[0],{candidates:result.candidates,confirmed:false});
 }catch{if(serial===generation)general('Location or partner information is unavailable. No partner location has been selected.')}
 }
 document.addEventListener('visibilitychange',()=>{generation++;if(document.hidden){clearControls();onPartner(null);box.replaceChildren();return}if(!dismissed){general();if(enabled)check()}});
 window.addEventListener('pagehide',()=>{generation++;clearControls();onPartner(null);box.replaceChildren()});window.addEventListener('pageshow',e=>{if(e.persisted&&!dismissed){general();if(enabled)check()}});
 const retryTimer=autoLocate?setInterval(()=>{if(enabled&&!dismissed&&!checking&&!document.hidden)check(autoLocate)},60000):null;window.addEventListener('pagehide',()=>clearInterval(retryTimer),{once:true});
 const sync=()=>{box.style.display=panel.style.display==='none'?'none':''};new MutationObserver(sync).observe(panel,{attributes:true,attributeFilter:['style']});sync();general();if(enabled)check(autoLocate);
}
