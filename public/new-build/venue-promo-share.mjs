import qrcode from './vendor/qrcode.mjs';
const url=new URL('./venue-partners.html',location.href).href;
for(const root of document.querySelectorAll('[data-venue-promo-share]')){
 const label=document.createElement('p');label.textContent=url;label.style.overflowWrap='anywhere';const status=document.createElement('p');status.setAttribute('role','status');
 const copy=document.createElement('button');copy.textContent='Copy page link';copy.onclick=async()=>{try{await navigator.clipboard.writeText(url);status.textContent='Link copied.'}catch{status.textContent='Copy the link shown above.'}};
 const share=document.createElement('button');share.textContent='Share introduction';share.onclick=async()=>{try{if(navigator.share)await navigator.share({title:'Bring LINKS to your venue',text:'Explore LINKS games, hosted trivia and venue branding for your next game night.',url});else await copy.onclick()}catch(e){if(e.name!=='AbortError')status.textContent='Use Copy page link to share.'}};
 const qr=qrcode(0,'M');qr.addData(url);qr.make();const box=document.createElement('div');box.innerHTML=qr.createSvgTag({cellSize:5,margin:16,scalable:true});box.style.cssText='width:200px;max-width:100%;background:white;padding:10px;border-radius:12px;margin:20px 0';box.setAttribute('aria-label','QR code to the venue introduction');
 const download=document.createElement('a');download.textContent='Download QR code';download.download='LINKS-venue-introduction.svg';download.href=URL.createObjectURL(new Blob([qr.createSvgTag({cellSize:8,margin:24})],{type:'image/svg+xml'}));
 for(const b of [copy,share]){b.type='button';b.style.cssText='padding:12px 18px;margin:4px;border:1px solid #b99a54;border-radius:10px;background:#edc568;color:#17150f;font:700 16px system-ui;cursor:pointer'}root.append(label,share,copy,box,download,status);
}
const intro=document.getElementById('venueIntro');if(intro){const close=()=>intro.close();intro.querySelector('button').onclick=close;intro.showModal();setTimeout(close,2200)}
