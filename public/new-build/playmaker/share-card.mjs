export async function cardShareImage(card,createdAt) {
 const canvas=document.createElement('canvas');canvas.width=900;canvas.height=260+card.length*170;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#081522';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#e6c677';ctx.lineWidth=4;ctx.strokeRect(14,14,872,canvas.height-28);
 ctx.fillStyle='#e6c677';ctx.font='bold 40px sans-serif';ctx.fillText('LINKS  /  PLAYMAKER',44,76);
 ctx.fillStyle='#fff';ctx.font='bold 28px sans-serif';ctx.fillText(`MY CARD · ${card.length} PICK${card.length===1?'':'S'}`,44,124);
 function fit(text,x,y,max,font=25){let size=font;do{ctx.font=`${size}px sans-serif`;if(ctx.measureText(text).width<=max)break;size--}while(size>14);ctx.fillText(text,x,y)}
 card.forEach((pick,i)=>{const y=155+i*170;ctx.fillStyle='#162e43';ctx.fillRect(36,y,828,152);ctx.fillStyle='#bacbda';fit(`${i+1}. ${pick.league} · ${pick.awayTeam} at ${pick.homeTeam}`,54,y+33,785,24);ctx.fillStyle='#fff';fit(pick.label,54,y+82,630,32);ctx.fillStyle='#e6c677';ctx.font='bold 31px sans-serif';ctx.fillText(`${pick.americanOdds>0?'+':''}${pick.americanOdds}`,735,y+82);ctx.fillStyle='#bacbda';fit(pick.bookmakerName+' · '+new Date(pick.updatedAt).toLocaleString(),54,y+122,785,21)});
 const bottom=canvas.height-64;ctx.fillStyle='#bacbda';fit('Saved odds; prices can change. No bet has been placed.',44,bottom,810,20);ctx.fillStyle='#e6c677';fit('linkspickempools.com · Build your card with LINKS',44,bottom+31,810,20);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('Image unavailable');return new File([blob],'links-playmaker-card.png',{type:'image/png'});
}
export function cardShareText(card, createdAt) {
 const lines=['My LINKS Playmaker card', ...(createdAt ? ['Built '+new Date(createdAt).toLocaleString()] : [])];
 card.forEach((pick,i)=>lines.push(`${i+1}. ${pick.awayTeam} at ${pick.homeTeam}\n${pick.label} (${pick.americanOdds>0?'+':''}${pick.americanOdds}) · ${pick.bookmakerName}`));
 lines.push('Saved odds; prices can change. No bet has been placed.','Build yours: https://linkspickempools.com/new-build/playmaker/');
 return lines.join('\n\n');
}
export function shareCardButton(card, createdAt) {
 const button=document.createElement('button');button.type='button';button.className='open-card';button.textContent='Share card';
 let imageFile=null;const imageReady=cardShareImage(card,createdAt).then(file=>{imageFile=file;return file}).catch(()=>null);
 const status=document.createElement('span');status.setAttribute('role','status');status.className='disclaimer';
 button.addEventListener('click',async()=>{
  const text=cardShareText(card,createdAt);status.textContent='';
  try {
   if(navigator.share){const data={title:'My LINKS Playmaker card',text};if(imageFile&&navigator.canShare?.({files:[imageFile]}))data.files=[imageFile];await navigator.share(data);status.textContent='Share menu closed.';}
   else {await navigator.clipboard.writeText(text);status.textContent='Card copied. Paste it into a text or message.';}
  } catch(error) {
   if(error.name==='AbortError')return;
   try {await navigator.clipboard.writeText(text);status.textContent='Card copied. Paste it into a text or message.';}
   catch {status.textContent='Copy the card text below to share.';let area=status.querySelector('textarea');if(!area){area=document.createElement('textarea');area.readOnly=true;area.setAttribute('aria-label','Card text to share');status.append(area)}area.value=text;area.focus();area.select();}
  }
 });
 const group=document.createElement('div');group.className='share-card';const download=document.createElement('a');download.className='open-card';download.textContent='Download card image';download.hidden=true;const preview=document.createElement('img');preview.alt='Shareable preview of your Playmaker picks';preview.className='share-preview';preview.hidden=true;imageReady.then(file=>{if(!file)return;const url=URL.createObjectURL(file);download.href=url;download.download=file.name;download.hidden=false;preview.src=url;preview.hidden=false});group.append(preview,button,download,status);return group;
}
