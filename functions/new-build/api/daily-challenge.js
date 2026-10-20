import {accountSession,digest,emailKey} from '../../lib/commissioner-account.js';
import {centralDay,resetAt,previousDay,dailyDeck,ensureDaily,spinDailyWheel} from '../../lib/daily-challenge.js';
import {activeDailyVenues,venueSnapshot} from '../../lib/daily-venues.js';
import {pinnedDailyDeck} from '../../lib/daily-question-provider.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
function visible(s,deck){if(!s)return null;const {id,version,status,index,score,correct,deadline,feedback}=s,bonusPerCorrect=s.wheelRequired?s.bonusPerCorrect||0:0;return {id,version,status,index,score,correct,needsSpin:(s.wheelRequired===true||s.status==='ready')&&!Number.isInteger(s.wheelIndex),wheelIndex:Number.isInteger(s.wheelIndex)?s.wheelIndex:null,bonusPerCorrect,maxScore:5*(100+bonusPerCorrect),venue:venueSnapshot(s),deadline:deadline?new Date(deadline).toISOString():null,question:['question','reveal'].includes(status)?{text:deck[index].text,choices:deck[index].choices,category:deck[index].category,...(deck[index].difficulty?{difficulty:deck[index].difficulty,level:deck[index].level}:{} )}:null,feedback:status==='reveal'?feedback:null}}
export async function dailyRequest({request,env},services={}){try{
 if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed.'},405);
 if(!env.DB)return json({error:'Daily Challenge is temporarily unavailable.'},503);
 if(request.method==='POST'&&request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Open Daily Challenge on LINKS to play.'},403);
 const db=env.DB,now=services.now?.()??Date.now(),day=centralDay(now);await ensureDaily(db);const venues=await activeDailyVenues(db);
 const session=await (services.session||accountSession)(request,db);const owner=session?.email?await digest('daily:'+emailKey(session.email)):null;
 let profile=owner?await db.prepare('SELECT id,name FROM links_daily_profiles WHERE owner=?').bind(owner).first():null;
 let attempt=owner?await db.prepare('SELECT * FROM links_daily_attempts WHERE owner=? AND day=?').bind(owner,day).first():null;
 // Persist the server-only deck so a future deployment cannot change an active day's answers.
 const storedDeck=await db.prepare('SELECT deck FROM links_daily_decks WHERE day=?').bind(day).first();let deck=storedDeck?JSON.parse(storedDeck.deck):dailyDeck(day);
 if(request.method==='POST'){
  if(!owner)throw fail('Sign in to save your Daily Challenge score.',401);
  const raw=await request.text();if(raw.length>1200)throw fail('Request too large.',413);let b;try{b=JSON.parse(raw)}catch{throw fail('Invalid request.')};if(!b||Array.isArray(b)||!['start','spin','answer','next'].includes(b.action))throw fail('Choose a valid action.');
  if(b.action==='start'){
   if(!attempt&&b.partnerId!=null&&(typeof b.partnerId!=='string'||b.partnerId.length>100||!venues.some(v=>v.id===b.partnerId)))throw fail('Choose an active venue, or play without a venue.');
   if(!attempt)deck=await pinnedDailyDeck(env,day,{fetcher:services.fetcher,now:services.providerNow,wait:services.wait});
   const id=crypto.randomUUID(),name=String(session.displayName||'').trim().replace(/[\u0000-\u001f<>]/g,'').slice(0,32);await db.prepare('INSERT OR IGNORE INTO links_daily_profiles(owner,id,name) VALUES(?,?,?)').bind(owner,id,name&&!name.includes('@')?name:'Challenger '+id.slice(0,4).toUpperCase()).run();profile=await db.prepare('SELECT id,name FROM links_daily_profiles WHERE owner=?').bind(owner).first();
   if(!attempt){
    const s={id:crypto.randomUUID(),version:0,status:'ready',index:0,score:0,correct:0,deadline:null,venue:null,wheelRequired:true,wheelIndex:null,bonusPerCorrect:0};
    if(b.partnerId){await db.prepare("INSERT OR IGNORE INTO links_daily_attempts(owner,day,id,version,state) SELECT ?,?,?,0,json_set(?,'$.venue',json_object('id',id,'name',name,'logo',logo)) FROM links_partners WHERE id=? AND active=1").bind(owner,day,s.id,JSON.stringify(s),b.partnerId).run()}else await db.prepare('INSERT OR IGNORE INTO links_daily_attempts(owner,day,id,version,state) VALUES(?,?,?,?,?)').bind(owner,day,s.id,0,JSON.stringify(s)).run();
    attempt=await db.prepare('SELECT * FROM links_daily_attempts WHERE owner=? AND day=?').bind(owner,day).first();if(!attempt)throw fail('This venue is no longer active. Choose another venue or play without one.',409)
   }
  }else{
   if(!attempt||b.id!==attempt.id||!Number.isInteger(b.version)||b.version!==attempt.version)throw fail('Your challenge changed. Refresh to resume.',409);
   const s=JSON.parse(attempt.state);if(s.status==='complete')throw fail('Today’s ranked challenge is complete.',409);
   if(b.action==='spin'){
    if(s.status!=='ready'||Number.isInteger(s.wheelIndex))throw fail('This round cannot spin again.',409);
    Object.assign(s,spinDailyWheel(),{wheelRequired:true});
   }else if(b.action==='answer'){
    if(s.status!=='question')throw fail('This question was already answered.',409);
    if(!(now>=s.deadline&&b.choice===null)&&(!Number.isInteger(b.choice)||b.choice<0||b.choice>3))throw fail('Choose one of the four answers.');
    const q=deck[s.index],correct=now<s.deadline&&b.choice===q.answer;s.correct+=correct?1:0;s.score=s.correct*(100+(s.wheelRequired?s.bonusPerCorrect||0:0));s.status='reveal';s.feedback={correct,answer:q.answer,choice:now<s.deadline?b.choice:null,explanation:q.explanation,...(q.source?{source:q.source}:{})};
   }else{
    if(!['ready','reveal'].includes(s.status))throw fail('Answer the current question first.',409);
    if((s.wheelRequired||s.status==='ready')&&!Number.isInteger(s.wheelIndex))throw fail('Spin your bonus wheel before starting the questions.',409);
    if(s.status==='reveal')s.index++;delete s.feedback;
    if(s.index>=5){s.index=4;s.status='complete';s.deadline=null}else{s.status='question';s.deadline=now+20000}
   }
   s.version++;const result=await db.prepare('UPDATE links_daily_attempts SET version=?,state=?,score=?,completed=? WHERE owner=? AND day=? AND version=?').bind(s.version,JSON.stringify(s),s.score,s.status==='complete'?1:0,owner,day,b.version).run();if(result.meta?.changes!==1)throw fail('Your challenge changed. Refresh to resume.',409);attempt={...attempt,version:s.version,state:JSON.stringify(s)};
  }
 }
 const leaderboard=(await db.prepare('SELECT p.id AS profileId,p.name,a.score,a.state FROM links_daily_attempts a JOIN links_daily_profiles p ON p.owner=a.owner WHERE a.day=? AND a.completed=1 ORDER BY a.score DESC,p.id LIMIT 100').bind(day).all()).results.map(({state,...r})=>{const s=JSON.parse(state),venue=venueSnapshot(s);return {...r,correct:Number.isInteger(s.correct)?s.correct:r.score/100,venueName:venue?.name||null,venueId:venue?.id||null}});
 let streak=0,bestStreak=0;if(owner){const days=(await db.prepare('SELECT day FROM links_daily_attempts WHERE owner=? AND completed=1 ORDER BY day DESC').bind(owner).all()).results.map(r=>r.day);let run=0,prior=null;for(const d of days){run=prior&&previousDay(prior)===d?run+1:1;bestStreak=Math.max(bestStreak,run);prior=d}let expected=days[0]===day?day:previousDay(day);for(const d of days){if(d!==expected)break;streak++;expected=previousDay(d)}}
 return json({day,resetsAt:resetAt(now),serverNow:new Date(now).toISOString(),questionCount:5,seconds:20,signedIn:!!owner,playerName:profile?.name||null,attempt:visible(attempt?JSON.parse(attempt.state):null,deck),leaderboard,streak,bestStreak,venues});
 }catch(e){return json({error:e.status?e.message:'Daily Challenge could not load. Please try again.'},e.status||503)}}
export const onRequest=context=>dailyRequest(context);
