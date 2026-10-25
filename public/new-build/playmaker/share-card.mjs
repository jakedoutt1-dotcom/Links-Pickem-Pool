export function cardShareText(card, createdAt) {
 const lines=['My LINKS Playmaker card', ...(createdAt ? ['Built '+new Date(createdAt).toLocaleString()] : [])];
 card.forEach((pick,i)=>lines.push(`${i+1}. ${pick.awayTeam} at ${pick.homeTeam}\n${pick.label} (${pick.americanOdds>0?'+':''}${pick.americanOdds}) · ${pick.bookmakerName}`));
 lines.push('Saved odds; prices can change. No bet has been placed.','Build yours: https://linkspickempools.com/new-build/playmaker/');
 return lines.join('\n\n');
}
export function shareCardButton(card, createdAt) {
 const button=document.createElement('button');button.type='button';button.className='open-card';button.textContent='Share card';
 const status=document.createElement('span');status.setAttribute('role','status');status.className='disclaimer';
 button.addEventListener('click',async()=>{
  const text=cardShareText(card,createdAt);status.textContent='';
  try {
   if(navigator.share){await navigator.share({title:'My LINKS Playmaker card',text});status.textContent='Share menu closed.';}
   else {await navigator.clipboard.writeText(text);status.textContent='Card copied. Paste it into a text or message.';}
  } catch(error) {
   if(error.name==='AbortError')return;
   try {await navigator.clipboard.writeText(text);status.textContent='Card copied. Paste it into a text or message.';}
   catch {status.textContent='Copy the card text below to share.';let area=status.querySelector('textarea');if(!area){area=document.createElement('textarea');area.readOnly=true;area.setAttribute('aria-label','Card text to share');status.append(area)}area.value=text;area.focus();area.select();}
  }
 });
 const group=document.createElement('div');group.className='share-card';group.append(button,status);return group;
}
