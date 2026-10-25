import {shareCardButton} from './share-card.mjs';
import {requireAccount} from './account-client.mjs';
import {categories} from './markets.mjs';
import {cards,visitId,legacyCards,importLegacyCards} from './card-history.mjs';
import {teamBadge} from './team-logos.mjs';
const verifiedAccount=await requireAccount().catch(()=>{document.getElementById('history-status').textContent='Unable to load your account. Please reload.';return null});if(!verifiedAccount)await new Promise(()=>{});
const node=(tag,cls,text)=>{const el=document.createElement(tag);el.className=cls;el.textContent=text;return el},list=document.getElementById('history-list'),filter=document.getElementById('history-filter'),visit=visitId();
function render(){const savedIds=new Set(cards().map(item=>item.id));document.getElementById('legacy-cards').hidden=!legacyCards().some(item=>!savedIds.has(item.id));list.replaceChildren();const today=new Date().toDateString();const entries=cards().filter(item=>filter.value==='visit'?item.visit===visit:new Date(item.createdAt).toDateString()===today);
 document.getElementById('history-status').textContent=entries.length?`${entries.length} saved card${entries.length===1?'':'s'}`:'No cards yet. Cards save automatically when you build them.';
 entries.forEach(item=>{const article=node('article','pick',''),top=node('div','pick-top','');top.append(node('span','leg',`${item.card.length} PICK${item.card.length===1?'':'S'} · ${item.sport}`),node('span','',new Date(item.createdAt).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})));article.append(top,node('p','market',`${categories(item.sport).find(c=>c.id===item.category)?.label||'Game lines'} · ${item.risk||'balanced'} · ${item.kind||'parlay'}`));
 for(const pick of item.card){const row=node('div','history-pick','');row.append(teamBadge(pick.awayTeam,pick.league),teamBadge(pick.homeTeam,pick.league),node('strong','',pick.label),node('span','',`${pick.americanOdds>0?'+':''}${pick.americanOdds}`));article.append(row)}
 const open=node('a','open-card','Open card');open.href='./card.html?id='+encodeURIComponent(item.id);article.append(open,shareCardButton(item.card,item.createdAt));list.append(article)});
}
document.getElementById('import-legacy').addEventListener('click',()=>{if(importLegacyCards())render();else document.getElementById('history-status').textContent='Unable to save earlier cards. Check browser storage and try again.'});filter.addEventListener('change',render);render();
