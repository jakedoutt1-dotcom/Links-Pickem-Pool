import {dailyDeck} from './daily-challenge.js';
import {triviaFetch,triviaHealth} from './trivia-health.js';
const categories=new Set(['music','sport_and_leisure','film_and_tv','arts_and_literature','history','society_and_culture','science','geography','food_and_drink','general_knowledge']);
const clean=(s,max)=>typeof s==='string'&&s.trim().length>0&&s.trim().length<=max&&!/[<>\u0000-\u001f]/.test(s)?s.trim():null;
export function normalizeDailyQuestions(rows,difficulty,count){
 if(!Array.isArray(rows))return [];const result=[],seen=new Set();
 for(const row of rows.slice(0,20)){
  if(row?.type!=='text_choice'||row.difficulty!==difficulty||!categories.has(row.category)||row.adultContent===true||row.isAdult===true)continue;
  const text=clean(row.question?.text,600),choices=[row.correctAnswer,...(Array.isArray(row.incorrectAnswers)?row.incorrectAnswers:[])].map(s=>clean(s,160));
  if(!text||choices.length!==4||choices.some(s=>!s)||new Set(choices.map(s=>s.toLowerCase())).size!==4||seen.has(text.toLowerCase()))continue;
  seen.add(text.toLowerCase());const order=[0,1,2,3];for(let i=3;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[order[i],order[j]]=[order[j],order[i]]}
  result.push({category:row.category.replaceAll('_',' '),text,choices:order.map(i=>choices[i]),answer:order.indexOf(0),explanation:`The correct answer is ${choices[0]}.`,difficulty,source:'The Trivia API'});if(result.length===count)break;
 }
 return result;
}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function pinnedDailyDeck(env,day,{fetcher=fetch,now=()=>Date.now(),wait=sleep,timeoutMs=7200}={}){
 const db=env.DB,read=async()=>{const row=await db.prepare('SELECT deck FROM links_daily_decks WHERE day=?').bind(day).first();return row?JSON.parse(row.deck):null};let saved=await read();if(saved)return saved;
 const fallback=dailyDeck(day),key=typeof env.TRIVIA_API_KEY==='string'?env.TRIVIA_API_KEY.trim():'';
 const pin=async deck=>{await db.prepare('INSERT OR IGNORE INTO links_daily_decks(day,deck) VALUES(?,?)').bind(day,JSON.stringify(deck)).run();return read()};
 if(!key)return pin(fallback);
 await db.prepare('CREATE TABLE IF NOT EXISTS links_daily_question_leases(day TEXT PRIMARY KEY,owner TEXT NOT NULL,until_ms INTEGER NOT NULL,requested INTEGER NOT NULL DEFAULT 0)').run();
 const owner=crypto.randomUUID(),start=now();await db.prepare('INSERT OR IGNORE INTO links_daily_question_leases(day,owner,until_ms,requested) VALUES(?,?,?,0)').bind(day,owner,start+10000).run();
 // A day may launch one three-request batch only. Expired leases recover using backup,
 // never another paid batch, even if the original Worker stopped before pinning.
 const claim=await db.prepare('UPDATE links_daily_question_leases SET requested=1 WHERE day=? AND owner=? AND requested=0').bind(day,owner).run();
 if(claim.meta?.changes!==1){
  for(let i=0;i<80;i++){saved=await read();if(saved)return saved;const row=await db.prepare('SELECT until_ms FROM links_daily_question_leases WHERE day=?').bind(day).first();if(row&&row.until_ms<=now())return pin(fallback);await wait(100)}
  saved=await read();if(saved)return saved;throw Object.assign(Error('Today’s questions are preparing. Please try again.'),{status:503});
 }
 const controller=new AbortController();let timeout;
 try{
  const groups=[['easy',1],['medium',2],['hard',1]];
  const load=Promise.all(groups.map(async([difficulty,count])=>{
   const url=new URL('https://the-trivia-api.com/v2/questions');url.search=new URLSearchParams({limit:String(count),difficulties:difficulty,types:'text_choice',region:'US',contentFilter:'family'}).toString();
   try{const response=await triviaFetch(env,'daily-'+difficulty,fetcher,url.href,{headers:{'X-API-Key':key,Accept:'application/json'},signal:controller.signal,redirect:'error'});await triviaHealth(env,'daily-'+difficulty,response.status);if(!response.ok)return [];const questions=normalizeDailyQuestions(await response.json(),difficulty,count);await triviaHealth(env,'daily-'+difficulty,response.status,questions.length);return questions}catch{return []}
  }));
  const loaded=await Promise.race([load,new Promise(resolve=>{timeout=setTimeout(()=>{controller.abort();resolve(null)},Math.max(1,Math.min(7200,Number(timeoutMs)||7200)))})]);
  let deck=fallback;
  if(loaded){const fresh=[loaded[0][0],loaded[1][0],loaded[1][1],loaded[2][0]],used=new Set(fallback.map(q=>q.text.toLowerCase()));deck=fallback.map((backup,i)=>{if(i===4)return backup;const q=fresh[i];if(!q||used.has(q.text.toLowerCase()))return backup;used.add(q.text.toLowerCase());return {...q,level:i+1}})}
  return await pin(deck);
 }finally{clearTimeout(timeout);controller.abort()}
}
