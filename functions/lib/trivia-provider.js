import {triviaHealth,triviaFetch} from './trivia-health.js';
import {openQuestionSession} from './trivia-sessions.js';
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
export async function loadGameQuestions({env,categories,backup,exclude=[],fetcher=fetch,perGroup=6,difficulties=Object.keys(SECONDS),tags=[],sessionScope}){
 if(!Array.isArray(categories)||!categories.length||categories.some(c=>!CATEGORIES.includes(c)))throw Error('Choose categories and a difficulty.');
 if(!Array.isArray(difficulties)||!difficulties.length||difficulties.some(d=>!Object.hasOwn(SECONDS,d)))throw Error('Choose a difficulty.');
 if(!Array.isArray(tags)||tags.some(t=>typeof t!=='string'||!/^[a-z0-9_]+$/.test(t)))throw Error('Invalid question tags.');
 const selected=[...new Set(categories)],key=typeof env.TRIVIA_API_KEY==='string'?env.TRIVIA_API_KEY.trim():'';
 if(!key)return {questions:backup,source:'LINKS question library',notice:''};
 const session=await openQuestionSession(env,env.TRIVIA_VENUE_SCOPE||sessionScope||env.TRIVIA_SESSION_SCOPE,key,fetcher);
 const recentIds=new Set([...exclude,...(session?.ids||[])]),recentTexts=new Set(session?.texts||[]);
 const unseen=q=>!recentIds.has(q.id)&&!recentTexts.has(q.text.trim().toLowerCase().replace(/\s+/g,' '));
 const used=recentIds,ids=new Set(),texts=new Set(),questions=[];let fallback=false;
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),7000);
 const groups=selected.flatMap(category=>[...new Set(difficulties)].map(difficulty=>({category,difficulty})));
 try{
  const settled=await Promise.allSettled(groups.map(async({category,difficulty})=>{
   const url=new URL('https://the-trivia-api.com/v2/questions');url.search=new URLSearchParams({limit:String(Math.max(1,Math.min(20,Number(perGroup)||6))),categories:PROVIDER_CATEGORIES[category],difficulties:difficulty,types:'text_choice',region:'US',contentFilter:'family'}).toString();
   if(session?.id)url.searchParams.set('session',session.id);
   if(tags.length)url.searchParams.set('tags',tags.join(','));
   const response=await triviaFetch(env,'questions-'+category+'-'+difficulty,fetcher,url.href,{headers:{'X-API-Key':key,Accept:'application/json'},signal:controller.signal,redirect:'error'});
   await triviaHealth(env,'questions-'+category+'-'+difficulty,response.status);
   if(!response.ok){if(session?.id&&[400,404,410].includes(response.status))await session.invalidateIfMissing();throw Error('Provider unavailable');}
   const rows=await response.json();
   await triviaHealth(env,'questions-'+category+'-'+difficulty,response.status,Array.isArray(rows)?rows.length:0);
   return normalizeQuestions(tags.length&&Array.isArray(rows)?rows.filter(row=>Array.isArray(row.tags)&&tags.some(tag=>row.tags.includes(tag))):rows,category,difficulty);
  }));
  for(let i=0;i<groups.length;i++){
   const group=groups[i],fresh=settled[i].status==='fulfilled'?settled[i].value.filter(unseen):[];
   const rows=fresh.length?fresh:backup.filter(q=>q.category===group.category&&q.difficulty===group.difficulty&&unseen(q));
   if(!fresh.length)fallback=true;
   for(const q of rows){const text=q.text.toLowerCase();if(ids.has(q.id)||texts.has(text))continue;ids.add(q.id);texts.add(text);questions.push(q)}
  }
 }finally{clearTimeout(timeout)}
 if(!questions.length){const freshBackup=backup.filter(unseen);questions.push(...(freshBackup.length?freshBackup:[...backup].sort(()=>Math.random()-.5)));fallback=true;}
 await session?.remember(questions);
 Object.defineProperty(questions,'recent',{value:{ids:[...recentIds],texts:[...recentTexts]},enumerable:false});
 if(!questions.length)return {questions:backup,source:'LINKS question library',notice:'Fresh questions are unavailable. This game uses the LINKS library; questions may repeat.'};
 return {questions,source:questions.some(q=>q.id.startsWith('trivia-'))?'The Trivia API':'LINKS question library',notice:[session?.warning,fallback?'Some categories or difficulty levels use the LINKS library because fresh questions were unavailable. Questions may repeat if unused questions run out.':''].filter(Boolean).join(' ')};
}

// Complete a private game snapshot if the provider returns too few questions.
export function completeQuestionBank(fresh,backup,{exclude=[],minimum=1}={}){
 const used=new Set([...exclude,...(fresh.recent?.ids||[])]),oldTexts=new Set(fresh.recent?.texts||[]),ids=new Set(),texts=new Set(),out=[];
 const add=q=>{const text=q.text.trim().toLowerCase();if(ids.has(q.id)||texts.has(text))return;ids.add(q.id);texts.add(text);out.push(q)};
 for(const q of fresh)if(!used.has(q.id))add(q);
 for(const q of backup)if(out.length<minimum&&!used.has(q.id)&&!oldTexts.has(q.text.trim().toLowerCase().replace(/\s+/g,' ')))add(q);
 if(out.length<minimum)for(const q of [...fresh,...backup])if(out.length<minimum)add(q);
 return out;
}

// Host games retain IDs and wording across rooms; unchanged wording with a new
// provider/import ID must not bypass recent-question protection.
export const normalizedQuestionText=q=>q.text.trim().toLowerCase().replace(/\s+/g,' ');
export async function loadFreshGameQuestions(args){
 const loaded=await loadGameQuestions(args),ids=[...(args.exclude||[]),...(loaded.questions.recent?.ids||[])],texts=[...(args.excludeTexts||[]),...(loaded.questions.recent?.texts||[])],usedIds=new Set(ids),usedTexts=new Set(texts),questions=[],keys=new Set();let recycled=false,local=false;
 const unused=q=>!usedIds.has(q.id)&&!usedTexts.has(normalizedQuestionText(q));
 for(const category of [...new Set(args.categories)])for(const difficulty of args.difficulties||Object.keys(SECONDS)){
  const matches=q=>q.category===category&&q.difficulty===difficulty;
  let rows=loaded.questions.filter(q=>matches(q)&&unused(q));
  if(!rows.length){rows=args.backup.filter(q=>matches(q)&&unused(q));if(rows.length)local=true}
  if(!rows.length){rows=[...loaded.questions,...args.backup].filter(matches).sort((a,b)=>Math.max(ids.indexOf(a.id),texts.indexOf(normalizedQuestionText(a)))-Math.max(ids.indexOf(b.id),texts.indexOf(normalizedQuestionText(b)))).slice(0,args.perGroup||6);if(rows.length)recycled=true}
  for(const q of rows){const key=normalizedQuestionText(q);if(!keys.has(key)){keys.add(key);questions.push(q)}}
 }
 return {questions,source:questions.some(q=>q.id.startsWith('trivia-'))?'The Trivia API':'LINKS question library',notice:recycled?'No unused questions remain in some categories or levels. Older questions may return.':local?'Some questions use the backup library to avoid recent repeats.':loaded.notice||(!args.env.TRIVIA_API_KEY?'Using the backup question library.':'')};
}
