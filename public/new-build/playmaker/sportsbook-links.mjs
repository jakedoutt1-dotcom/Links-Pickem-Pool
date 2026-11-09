const domains={draftkings:['draftkings.com'],fanduel:['fanduel.com'],betmgm:['betmgm.com'],caesars:['caesars.com'],bet365:['bet365.com']};
export function verifiedPickLink(raw,book){if(typeof raw!=='string'||raw.length>2000)return null;try{const url=new URL(raw);if(url.protocol!=='https:'||url.username||url.password||url.port||!domains[book]?.some(domain=>url.hostname===domain||url.hostname.endsWith('.'+domain)))return null;return url.href}catch{return null}}

// Combine only selection IDs supplied by the sportsbook feed. Never substitute
// another book's IDs, silently omit legs, set a stake, or submit a wager.
export function cardSlipLink(picks){
 if(!Array.isArray(picks)||!picks.length||picks.length>12)return null;
 const book=picks[0].bookmakerId;if(picks.some(p=>p.bookmakerId!==book))return null;
 const links=picks.map(p=>verifiedPickLink(p.sportsbookLink,book));if(links.some(l=>!l))return null;
 const urls=links.map(l=>new URL(l));if(urls.some(u=>u.origin!==urls[0].origin))return null;
 if(picks.length===1)return links[0];
 const out=new URL(urls[0].origin);const values=[];
 if(book==='betmgm'){
  const legs=urls.map(u=>u.searchParams.get('options'));
  const pattern=/^((?:\d+:)?\d+)-(-?\d+)-(-?\d+)(?:-(-?\d+))?(?:_(true|false))?$/;
  if(legs.some(v=>!v||!pattern.test(v)))return null;
  const groups=new Map();for(const leg of legs){const m=leg.match(pattern),id=m[1];if(!groups.has(id))groups.set(id,[]);groups.get(id).push(m)}
  for(const [id,group]of groups){
   if(group.length===1){values.push(group[0][0]);continue}
   if(group.some(m=>m[4]||m[5]==='true'))return null;
   // BetMGM's documented SGP syntax groups legs with a shared pickGroupId.
   const groupId=crypto.randomUUID();values.push(group.map(m=>[id,groupId,m[2],m[3],...(m[4]?[m[4]]:[]),m[5]||'false'].join('_')).join('~'));
  }
  if(new Set(legs).size!==legs.length)return null;
  out.pathname='/en/sports';out.searchParams.set('options',values.join(','));out.searchParams.set('type','COMBO');
 }else if(book==='draftkings'){
  for(const u of urls){const v=u.searchParams.get('outcomes');if(!v||!/^[a-zA-Z0-9_#.-]{1,240}$/.test(v))return null;values.push(v)}
  if(new Set(values).size!==values.length)return null;
  out.pathname='/';// DK uses a literal + separator; encode each outcome independently.
  out.search='?outcomes='+values.map(encodeURIComponent).join('+');
 }else if(book==='fanduel'){
  out.pathname='/addToBetslip';for(const [i,u]of urls.entries()){
   const market=u.searchParams.get('marketId'),selection=u.searchParams.get('selectionId');if(!/^\d+\.\d+$/.test(market||'')||!/^\d+$/.test(selection||''))return null;
   const key=market+':'+selection;if(values.includes(key))return null;values.push(key);out.searchParams.set(`marketId[${i}]`,market);out.searchParams.set(`selectionId[${i}]`,selection);
  }
 }else return null;
 return out.href.length<=6000?out.href:null;
}
