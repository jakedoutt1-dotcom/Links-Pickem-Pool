import {cards} from './card-history.mjs';
import {teamBadge} from './team-logos.mjs';
import {CARD_STORAGE_KEY,validateCard,calculateReturn} from './domain.mjs';
const get=id=>document.getElementById(id),money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n),node=(tag,cls,text)=>{const el=document.createElement(tag);el.className=cls;el.textContent=text;return el};
let packet={},raw=[],card=[];
try{packet=JSON.parse(sessionStorage.getItem('links-playmaker:results:v1')||'{}')}catch{}
try{const stored=localStorage.getItem(CARD_STORAGE_KEY);raw=stored===null?packet.card||[]:JSON.parse(stored)}catch{raw=packet.card||[]}
const archiveId=new URL(location.href).searchParams.get('id'),archived=archiveId?cards().find(item=>item.id===archiveId):null;
if(archiveId){packet=archived||{};raw=archived?.card||[]}
card=validateCard(raw,archived?.createdAt||Date.now());
const matches=Array.isArray(packet.card)&&packet.card.length===card.length&&packet.card.every((p,i)=>p.id===card[i]?.id);
if(!Array.isArray(raw)||card.length!==raw.length){card=[];get('results-status').textContent='These prices have expired or changed. Return to Playmaker for a fresh card.'}
else get('results-status').textContent=archiveId&&!archived?'This saved card is no longer available. Open My Cards to choose another.':archived?`Saved ${new Date(archived.createdAt).toLocaleString()}. These are saved prices, not live odds.`:card.length?'Your selected picks. Open a reason only when you want more detail.':'No saved picks yet. Return to Playmaker to build your card.';
get('results-count').textContent=`${card.length} pick${card.length===1?'':'s'}`;
const markets={moneyline:'Game winner',spread:'Point spread',total:'Game total'},stamp=iso=>new Date(iso).toLocaleString(undefined,{weekday:'short',hour:'numeric',minute:'2-digit',month:'short',day:'numeric'});
card.forEach((pick,index)=>{
 const article=document.createElement('article');article.className='pick';const top=node('div','pick-top','');top.append(node('span','leg',`LEG ${index+1} · ${pick.league}`),node('span','',stamp(pick.startTime)));
 const teams=node('div','teams','');for(const [i,name] of [pick.awayTeam,pick.homeTeam].entries()){if(i)teams.append(node('span','versus','AT'));const team=node('div','team','');team.append(teamBadge(name,pick.league),node('span','',name));teams.append(team)}
 const selection=node('div','selection','');selection.append(node('h2','',pick.label),node('strong','odds',pick.americanOdds>0?`+${pick.americanOdds}`:String(pick.americanOdds)));
 article.append(top,teams,selection,node('p','market',`${markets[pick.market]} · ${pick.bookmakerName}`),node('p','pick-foot',`Price updated ${stamp(pick.updatedAt)}`));
 const reason=matches&&packet.reasons?.[pick.id];if(typeof reason==='string'&&reason){const detail=document.createElement('details');detail.append(node('summary','','Why this pick?'),node('p','',reason.slice(0,2000)));article.append(detail)}get('results-picks').append(article);
});
get('results-calculator').hidden=!card.length;
if(matches&&typeof packet.analysis==='string'&&packet.analysis){get('results-explanation').hidden=false;get('results-analysis').textContent=packet.analysis.slice(0,20000)}
function update(){const result=calculateReturn(card,get('results-stake').value);get('results-return').textContent=result.valid?money(result.payout):'—';get('results-return-note').textContent=result.valid?`${money(result.profit)} potential profit. Final odds may change.`:result.reason}
get('results-stake').addEventListener('input',update);update();
