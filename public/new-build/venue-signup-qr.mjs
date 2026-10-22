import qrcode from './vendor/qrcode.mjs';
export function mountVenueSignup(root,{download=true}={}){
 const url=new URL('./venue-manager.html',location.href).href;
 const link=document.createElement('a');link.href=url;link.textContent='Open venue signup →';link.style.cssText='display:inline-block;margin:8px 0;color:#f0ce7a';
 const code=qrcode(0,'M');code.addData(url);code.make();const svg=code.createSvgTag({cellSize:8,margin:24});const box=document.createElement('div');box.innerHTML=svg;box.querySelector('svg').style.cssText='display:block;width:100%;height:auto';box.style.cssText='width:190px;max-width:100%;background:#fff;border-radius:12px;padding:10px;margin:12px 0';box.setAttribute('aria-label','QR code for venue self-signup');
 const copy=document.createElement('button');copy.type='button';copy.textContent='Copy signup link';const status=document.createElement('p');status.setAttribute('role','status');copy.onclick=async()=>{try{await navigator.clipboard.writeText(url);status.textContent='Signup link copied.'}catch{status.textContent=url}};root.append(link,box,copy);
 if(download){const save=document.createElement('a');save.download='LINKS-Venue-Signup-QR.svg';save.href=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));save.textContent='Download signup QR';save.style.cssText='display:inline-block;margin:12px;color:#f0ce7a';root.append(save)}root.append(status);
}
for(const root of document.querySelectorAll('[data-venue-signup-qr]'))mountVenueSignup(root,{download:root.dataset.download==='true'});
