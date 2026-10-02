import {nearby} from './partner-match.mjs';
let started=false;
export function mountPartners(panel,{host,controlsHost,onPartner=()=>{}}={}){if(started)return;started=true;
 const box=document.createElement('section');box.id='linksPartnerBanner';box.setAttribute('aria-label','LINKS partners');box.style.cssText='box-sizing:border-box;grid-column:1/-1;width:100%;min-width:0;padding:16px;border:1px solid #304b5d;border-radius:16px;background:#0b1b27;color:#fff;margin:0 0 16px';if(host)host.append(box);else panel.after(box);
 let generation=0,enabled=false,dismissed=false,controlRow=null;
 const mobile=matchMedia('(max-width:900px)');
 function clearControls(){controlRow?.remove();controlRow=null}
 function placeControls(){if(controlRow)(controlsHost&&mobile.matches?controlsHost:box).append(controlRow)}
 function actionControls(...buttons){clearControls();controlRow=document.createElement('div');controlRow.className='partner-location-controls';controlRow.append(...buttons);placeControls()}
 mobile.addEventListener('change',placeControls);
 try{enabled=localStorage.getItem('links-partner-location')==='yes'}catch{}
 const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.className='action';b.textContent=label;b.style.cssText='max-width:100%;white-space:normal;margin:4px 4px 0 0';b.onclick=fn;return b};
 function text(tag,value){const el=document.createElement(tag);el.textContent=value;return el}
 function base(message){clearControls();onPartner(null);box.replaceChildren();box.hidden=dismissed;const head=text('strong','Check out these offers');head.style.color='#edc466';const close=button('×',()=>{dismissed=true;generation++;clearControls();onPartner(null);box.hidden=true;box.replaceChildren()});close.setAttribute('aria-label','Dismiss partner banner');close.style.float='right';box.append(close,head,text('p',message));}
 function general(message='Discover offers from the LINKS partners you visit.'){
 base(message);box.append(button('Show partners near me',()=>{dismissed=false;enabled=true;try{localStorage.setItem('links-partner-location','yes')}catch{}check(true)}));box.append(text('small','Optional location access. Your coordinates stay on this device.'));if(enabled)actionControls(button('Turn off location ads',()=>{enabled=false;generation++;try{localStorage.removeItem('links-partner-location')}catch{}general()}));
 }
 function controls(){actionControls(button('Check my location again',()=>check(true)),button('Turn off location ads',()=>{enabled=false;generation++;try{localStorage.removeItem('links-partner-location')}catch{}general()}))}
 function show(p){
   base('Partner offer');onPartner(p);
   const identity=document.createElement('div');identity.className='partner-brand';identity.style.cssText='display:flex;align-items:center;gap:14px;min-width:0';
   const img=document.createElement('img');img.src=p.logo;img.alt=p.name;img.referrerPolicy='no-referrer';img.style.cssText='width:80px;height:64px;object-fit:contain;flex-shrink:0';img.onerror=()=>img.remove();
   const name=text('h3',p.name);name.style.cssText='margin:0;min-width:0;overflow-wrap:anywhere';identity.append(img,name);
   const offer=text('p',p.offer||p.address);offer.style.cssText='margin:16px 0;padding:16px;border:1px solid #edc466;border-radius:12px;background:#102b3b;color:#fff;font-size:1.2rem;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere';
   box.append(identity,offer);
   if(p.website){const link=document.createElement('a');link.href=p.website;link.target='_blank';link.rel='noopener noreferrer';link.className='action';link.textContent='Visit website';link.style.cssText='display:inline-block;max-width:100%;box-sizing:border-box;white-space:normal;margin-bottom:12px';box.append(link)}
   controls();
 }

 async function check(explicit=false){const serial=++generation;base('Checking nearby partners…');if(!enabled||dismissed)return;
 if(!navigator.geolocation){general('Location is unavailable. Enjoy your LINKS pool.');return}
 if(!explicit){try{const permission=await navigator.permissions.query({name:'geolocation'});if(serial!==generation)return;if(permission.state!=='granted'){general('Allow location to see offers from the partner location you are visiting.');return}}catch{general();return}}
 try{
 const [position,response]=await Promise.all([new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,maximumAge:0,timeout:12000})),fetch('./api/partners?public=1',{cache:'no-store'})]);
 if(serial!==generation||document.hidden)return;if(!response.ok)throw Error();const data=await response.json();if(serial!==generation)return;const result=nearby(data.partners,position.coords);
 if(!result.candidates.length){general('No nearby LINKS partner was found. Enjoy your pool.');return}
 if(result.certain){show(result.candidates[0]);return}
 base('Location cannot confirm which partner location you are visiting. Choose your location:');for(const p of result.candidates){box.append(button(p.name+' — '+p.address,()=>{if(serial===generation)show(p)}))}box.append(button('None of these',()=>general()));controls();
 }catch{if(serial===generation)general('Location or partner information is unavailable. No partner location has been selected.')}
 }
 document.addEventListener('visibilitychange',()=>{generation++;if(document.hidden){clearControls();onPartner(null);box.replaceChildren();return}if(!dismissed){general();if(enabled)check()}});
 window.addEventListener('pagehide',()=>{generation++;clearControls();onPartner(null);box.replaceChildren()});window.addEventListener('pageshow',e=>{if(e.persisted&&!dismissed){general();if(enabled)check()}});
 const sync=()=>{box.style.display=panel.style.display==='none'?'none':''};new MutationObserver(sync).observe(panel,{attributes:true,attributeFilter:['style']});sync();general();if(enabled)check();
}
