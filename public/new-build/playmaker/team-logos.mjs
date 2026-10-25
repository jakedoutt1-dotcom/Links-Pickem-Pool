const requests=new Map();
const key=value=>String(value||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
function directory(league){if(!requests.has(league))requests.set(league,fetch('/new-build/api/playmaker-logos?league='+encodeURIComponent(league),{credentials:'omit'}).then(r=>r.ok?r.json():{}).then(data=>data.logos||{}).catch(()=>({})));return requests.get(league)}
export function teamBadge(name,league){
 const badge=document.createElement('span');badge.className='badge';badge.textContent=String(name).split(/\s+/).map(w=>w[0]).join('').slice(0,3).toUpperCase();
 directory(league).then(logos=>{const source=logos[key(name)];let url;try{url=new URL(source)}catch{return}if(url.protocol!=='https:'||url.hostname!=='a.espncdn.com'||!url.pathname.startsWith('/i/teamlogos/'))return;
 const img=document.createElement('img');img.alt=`${name} logo`;img.width=42;img.height=42;img.decoding='async';img.referrerPolicy='no-referrer';
 img.addEventListener('load',()=>{badge.replaceChildren(img);badge.classList.add('has-logo')},{once:true});img.src=url.href;
 });return badge;
}
