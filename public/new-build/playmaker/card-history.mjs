import {validateCard} from './domain.mjs';
const KEY='links-playmaker:history:v1',VISIT='links-playmaker:visit:v1';
export function visitId(){try{let id=sessionStorage.getItem(VISIT);if(!id){id=crypto.randomUUID();sessionStorage.setItem(VISIT,id)}return id}catch{return ''}}
function storage(){const entries=new Map();for(const name of ['localStorage','sessionStorage'])try{const text=globalThis[name].getItem(KEY);if(!text||text.length>2000000)continue;const values=JSON.parse(text);if(Array.isArray(values))for(const item of values.slice(0,50))if(item?.id)entries.set(item.id,item)}catch{}return JSON.stringify([...entries.values()].sort((a,b)=>b.createdAt-a.createdAt).slice(0,50))}
export function cards(now=Date.now()){
 try{const text=storage();if(!text||text.length>2000000)return [];const raw=JSON.parse(text);if(!Array.isArray(raw))return [];
 return raw.slice(0,50).filter(item=>item&&typeof item.id==='string'&&/^[a-zA-Z0-9-]{16,80}$/.test(item.id)&&Number.isFinite(item.createdAt)&&item.createdAt<=now+60000&&now-item.createdAt<7*86400000&&Array.isArray(item.card)&&item.card.length>0&&validateCard(item.card,item.createdAt).length===item.card.length).map(item=>({...item,card:validateCard(item.card,item.createdAt)})).sort((a,b)=>b.createdAt-a.createdAt);
 }catch{return []}
}
export function saveBuiltCard(data,preferences){
 const createdAt=Date.now(),card=validateCard(data.picks,createdAt);if(!card.length||card.length!==data.picks.length)return null;
 const item={id:crypto.randomUUID(),createdAt,visit:visitId(),sport:preferences.sport,risk:preferences.risk,kind:preferences.kind,card,analysis:typeof data.analysis==='string'?data.analysis.slice(0,20000):'',reasons:Object.fromEntries(data.picks.map(p=>[p.id,typeof p.reason==='string'?p.reason.slice(0,2000):'']))};
 const text=JSON.stringify([item,...cards(createdAt)].slice(0,50));let saved=false;
 try{localStorage.setItem(KEY,text);saved=true}catch{}
 try{sessionStorage.setItem(KEY,text);saved=true}catch{}
 return saved?item:null;
}
