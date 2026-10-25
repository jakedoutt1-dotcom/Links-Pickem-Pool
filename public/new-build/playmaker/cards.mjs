import {cards,visitId} from './card-history.mjs';
import {teamBadge} from './team-logos.mjs';
const node=(tag,cls,text)=>{const el=document.createElement(tag);el.className=cls;el.textContent=text;return el},list=document.getElementById('history-list'),filter=document.getElementById('history-filter'),visit=visitId();
function render(){list.replaceChildren();const today=new Date().toDateString();const entries=cards().filter(item=>filter.value==='visit'?item.visit===visit:new Date(item.createdAt).toDateString()===today);
 document.getElementById('history-status').textContent=entries.length?`${entries.length} saved card${entries.length===1?'':'s'}`:'No cards yet. Cards save automatically when you build them.';
 entries.forEach(item=>{const article=node('article','pick',''),top=node('div','pick-top','');top.append(node('span','leg',`${item.card.length} PICK${item.card.length===1?'':'S'} · ${item.sport}`),node('span','',new Date(item.createdAt).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})));article.append(top,node('p','market',`${item.risk||'balanced'} · ${item.kind||'parlay'}`));
 for(const pick of item.card){const row=node('div','history-pick','');row.append(teamBadge(pick.awayTeam,pick.league),teamBadge(pick.homeTeam,pick.league),node('strong','',pick.label),node('span','',`${pick.americanOdds>0?'+':''}${pick.americanOdds}`));article.append(row)}
 const open=node('a','open-card','Open card');open.href='./card.html?id='+encodeURIComponent(item.id);article.append(open);list.append(article)});
}
filter.addEventListener('change',render);render();
