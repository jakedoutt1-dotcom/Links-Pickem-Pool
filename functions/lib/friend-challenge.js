import {makeDeck,points,answerSeconds} from './trivia-night.js';
export function challengeDeck(questions,categories,difficulty){const deck=makeDeck(questions,categories,difficulty);if(deck.length<10)throw Error('Not enough questions for ten rounds. Choose Mixed categories or another difficulty and try again.');return deck.slice(0,30)}
export function begin(s,now){s.phase='question';s.index=0;s.contenders=null;s.startsAt=now+3000;s.deadline=s.startsAt+answerSeconds(s.deck[0].difficulty)*1000;for(const p of Object.values(s.players)){p.score=0;p.answer=null;p.ready=false}}
export function advance(s,now){
 let changed=false;
 for(let i=0;i<70;i++){
  if(s.phase==='question'&&now>=s.deadline){const q=s.deck[s.index];for(const [id,p] of Object.entries(s.players)){if(s.contenders&&!s.contenders.includes(id))continue;const a=p.answer;if(a?.index===s.index&&a.choice===q.correct)p.score+=points(q,a.elapsed)}s.phase='reveal';s.nextAt=s.deadline+6000;changed=true;continue}
  if(s.phase==='reveal'&&now>=s.nextAt){
   if(s.index>=9){const eligible=Object.entries(s.players).filter(([id])=>!s.contenders||s.contenders.includes(id));const top=Math.max(...eligible.map(([,p])=>p.score));const tied=eligible.filter(([,p])=>p.score===top).map(([id])=>id);if(tied.length===1||s.index+1>=s.deck.length){s.phase='ended';s.winners=tied;for(const p of Object.values(s.players))p.ready=false;changed=true;break}s.contenders=tied}
   s.index++;s.phase='question';s.startsAt=s.nextAt+3000;s.deadline=s.startsAt+answerSeconds(s.deck[s.index].difficulty)*1000;changed=true;continue
  }break;
 }return changed;
}
export function challengeView(s,seat,now){const q=s.deck[s.index],revealed=['reveal','ended'].includes(s.phase),countdown=s.phase==='question'&&now<s.startsAt;return {code:s.code,mode:s.mode||'friends',phase:s.phase,game:s.game,index:s.index,serverNow:now,startsAt:s.startsAt||0,deadline:s.deadline||0,nextAt:s.nextAt||0,countdown,category:s.category,difficulty:s.difficulty,question:!countdown&&q?{text:q.text,answers:q.answers,category:q.category,difficulty:q.difficulty,...(revealed?{correct:q.correct,source:q.source,license:q.license}:{})}:null,eligible:!!s.players[seat]&&(!s.contenders||s.contenders.includes(seat)),choice:s.players[seat]?.answer?.index===s.index?s.players[seat].answer.choice:null,ready:!!s.players[seat]?.ready,players:Object.entries(s.players).map(([id,p])=>({name:p.name,score:p.score,ready:p.ready,you:id===seat,winner:!!s.winners?.includes(id),contender:!!s.contenders?.includes(id)})).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name)),suddenDeath:s.index>=10,sharedWin:s.phase==='ended'&&s.winners?.length>1,notice:s.notice||''}}
