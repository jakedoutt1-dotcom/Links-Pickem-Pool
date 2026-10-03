import {CATEGORIES,SECONDS,validateBank} from './trivia-night.js';
// Keep provider credentials on the server. Questions are snapshots for one room,
// never written into the owner-managed question library.
const PROVIDER_CATEGORIES={football:'sport_and_leisure',music:'music',movies:'film_and_tv',history:'history',science:'science',general:'general_knowledge,geography,arts_and_literature,society_and_culture,food_and_drink'};
export function normalizeQuestions(rows,category,difficulty){
 if(!Array.isArray(rows))return [];
 const ids=new Set(),texts=new Set(),result=[];
 for(const row of rows.slice(0,20)){
  if(row?.type!=='text_choice'||typeof row.id!=='string'||!row.id||row.id.length>70||!PROVIDER_CATEGORIES[category]?.split(',').includes(row.category)||row.difficulty!==difficulty||row.adultContent===true)continue;
  try{const q=validateBank([{id:'trivia-'+row.id,category,difficulty,text:row.question?.text,answers:[row.correctAnswer,...(Array.isArray(row.incorrectAnswers)?row.incorrectAnswers:[])],correct:0,source:'The Trivia API',license:'Commercial subscription'}])[0];const text=q.text.toLowerCase();if(ids.has(q.id)||texts.has(text))continue;ids.add(q.id);texts.add(text);result.push(q)}catch{/* Ignore malformed provider questions. */}
 }
 return result;
}
export async function loadGameQuestions({env,categories,backup,exclude=[],fetcher=fetch,perGroup=6,difficulties=Object.keys(SECONDS),tags=[]}){
 if(!Array.isArray(categories)||!categories.length||categories.some(c=>!CATEGORIES.includes(c)))throw Error('Choose categories and a difficulty.');
 if(!Array.isArray(difficulties)||!difficulties.length||difficulties.some(d=>!Object.hasOwn(SECONDS,d)))throw Error('Choose a difficulty.');
 if(!Array.isArray(tags)||tags.some(t=>typeof t!=='string'||!/^[a-z0-9_]+$/.test(t)))throw Error('Invalid question tags.');
 const selected=[...new Set(categories)],key=typeof env.TRIVIA_API_KEY==='string'?env.TRIVIA_API_KEY.trim():'';
 if(!key)return {questions:backup,source:'LINKS question library',notice:''};
 const used=new Set(exclude),ids=new Set(),texts=new Set(),questions=[];let fallback=false;
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),7000);
 const groups=selected.flatMap(category=>[...new Set(difficulties)].map(difficulty=>({category,difficulty})));
 try{
  const settled=await Promise.allSettled(groups.map(async({category,difficulty})=>{
   const url=new URL('https://the-trivia-api.com/v2/questions');url.search=new URLSearchParams({limit:String(Math.max(1,Math.min(20,Number(perGroup)||6))),categories:PROVIDER_CATEGORIES[category],difficulties:difficulty,types:'text_choice',region:'US',contentFilter:'family'}).toString();
   if(tags.length)url.searchParams.set('tags',tags.join(','));
   const response=await fetcher(url.href,{headers:{'X-API-Key':key,Accept:'application/json'},signal:controller.signal,redirect:'error'});
   if(!response.ok)throw Error('Provider unavailable');
   const rows=await response.json();
   return normalizeQuestions(tags.length&&Array.isArray(rows)?rows.filter(row=>Array.isArray(row.tags)&&tags.some(tag=>row.tags.includes(tag))):rows,category,difficulty);
  }));
  for(let i=0;i<groups.length;i++){
   const group=groups[i],fresh=settled[i].status==='fulfilled'?settled[i].value.filter(q=>!used.has(q.id)):[];
   const rows=fresh.length?fresh:backup.filter(q=>q.category===group.category&&q.difficulty===group.difficulty&&!used.has(q.id));
   if(!fresh.length)fallback=true;
   for(const q of rows){const text=q.text.toLowerCase();if(ids.has(q.id)||texts.has(text))continue;ids.add(q.id);texts.add(text);questions.push(q)}
  }
 }finally{clearTimeout(timeout)}
 if(!questions.length)return {questions:backup,source:'LINKS question library',notice:'Fresh questions are unavailable. This game uses the LINKS library; questions may repeat.'};
 return {questions,source:questions.some(q=>q.id.startsWith('trivia-'))?'The Trivia API':'LINKS question library',notice:fallback?'Some categories or difficulty levels use the LINKS library because fresh questions were unavailable.':''};
}

// Complete a private game snapshot if the provider returns too few questions.
export function completeQuestionBank(fresh,backup,{exclude=[],minimum=1}={}){
 const used=new Set(exclude),ids=new Set(),texts=new Set(),out=[];
 const add=q=>{const text=q.text.trim().toLowerCase();if(ids.has(q.id)||texts.has(text))return;ids.add(q.id);texts.add(text);out.push(q)};
 for(const q of fresh)if(!used.has(q.id))add(q);
 for(const q of backup)if(out.length<minimum&&!used.has(q.id))add(q);
 if(out.length<minimum)for(const q of [...fresh,...backup])if(out.length<minimum)add(q);
 return out;
}
