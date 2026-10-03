import { QUESTIONS, shuffled } from './football-trivia.js';

export const CATEGORIES = ['football','music','movies','history','science','general'];
export const SECONDS = {easy:10,medium:15,hard:20};
export const BASE = {easy:500,medium:1000,hard:1500};
const extras = [
 ['music','easy','How many strings does a standard violin have?',['4','5','6','8']],
 ['music','medium','What does a sharp sign do to a musical note?',['Raises it one semitone','Lowers it one semitone','Doubles its duration','Makes it silent']],
 ['music','hard','Which mode uses the same notes as C major but starts on D?',['Dorian','Phrygian','Lydian','Mixolydian']],
 ['movies','easy','What is the name for a film made by photographing successive drawings or models?',['Animation','Documentary','Remake','Trailer']],
 ['movies','medium','What does a Foley artist create for a film?',['Sound effects','Costumes','Storyboards','Opening credits']],
 ['movies','hard','In filmmaking, what does a diegetic sound belong to?',['The world of the story','Only the musical score','Only the end credits','The camera equipment']],
 ['history','easy','Which ancient civilization built the pyramids at Giza?',['Egyptian','Roman','Aztec','Viking']],
 ['history','medium','In which year was the United States Declaration of Independence adopted?',['1776','1787','1812','1754']],
 ['history','hard','Which treaty formally ended the American Revolutionary War?',['Treaty of Paris of 1783','Treaty of Ghent','Treaty of Versailles','Treaty of Tordesillas']],
 ['science','easy','What is the chemical formula for water?',['H2O','CO2','O2','NaCl']],
 ['science','medium','Which part of a cell contains most of its genetic material in humans?',['Nucleus','Cell membrane','Ribosome','Cytoplasm']],
 ['science','hard','Which particle mediates the electromagnetic force?',['Photon','Gluon','Neutrino','Higgs boson']],
 ['general','easy','How many sides does a hexagon have?',['6','5','7','8']],
 ['general','medium','Which ocean is the largest by surface area?',['Pacific','Atlantic','Indian','Arctic']],
 ['general','hard','What is the sum of the interior angles of a pentagon?',['540 degrees','360 degrees','450 degrees','720 degrees']]
];
export const STARTER = [
 ...QUESTIONS.map(q=>({...q,category:'football',correct:0,source:q.source,license:'Original LINKS'})),
 ...extras.map((q,i)=>({id:'links-'+i,category:q[0],difficulty:q[1],text:q[2],answers:q[3],correct:0,source:'Original LINKS starter question',license:'Original LINKS'}))
];
export function validateBank(rows){
 if(!Array.isArray(rows)||!rows.length||rows.length>500)throw Error('Upload between 1 and 500 questions.');
 const ids=new Set();
 return rows.map((q,i)=>{
  if(!q||typeof q!=='object')throw Error(`Question ${i+1} is invalid.`);
  const id=String(q.id||'q-'+(i+1)).trim();
  if(!id||id.length>80||ids.has(id))throw Error(`Question ${i+1} needs a unique ID.`);ids.add(id);
  if(!CATEGORIES.includes(q.category)||!Object.hasOwn(SECONDS,q.difficulty))throw Error(`Question ${i+1}: choose a supported category and difficulty.`);
  if(typeof q.text!=='string'||!q.text.trim()||q.text.length>400||!Array.isArray(q.answers)||q.answers.length!==4||q.answers.some(a=>typeof a!=='string'||!a.trim()||a.length>160)||new Set(q.answers.map(a=>a.trim().toLowerCase())).size!==4||!Number.isInteger(q.correct)||q.correct<0||q.correct>3)throw Error(`Question ${i+1}: provide a question, four distinct answers and correct index 0–3.`);
  if(typeof q.source!=='string'||!q.source.trim()||q.source.length>500||typeof q.license!=='string'||!q.license.trim()||q.license.length>160)throw Error(`Question ${i+1}: source and license are required.`);
  return {id,category:q.category,difficulty:q.difficulty,text:q.text.trim(),answers:q.answers.map(a=>a.trim()),correct:q.correct,source:q.source.trim(),license:q.license.trim()};
 });
}
export function makeDeck(bank,categories,difficulty){
 if(!Array.isArray(categories)||!categories.length||categories.some(c=>!CATEGORIES.includes(c))||!['mixed',...Object.keys(SECONDS)].includes(difficulty))throw Error('Choose categories and a difficulty.');
 const deck=shuffled(bank.filter(q=>categories.includes(q.category)&&(difficulty==='mixed'||q.difficulty===difficulty))).map(q=>{
  const order=shuffled([0,1,2,3]);return {...q,answers:order.map(i=>q.answers[i]),correct:order.indexOf(q.correct)};
 });
 if(!deck.length)throw Error('No questions match these settings. Add questions or choose other categories.');return deck;
}
export function points(q,elapsed){return BASE[q.difficulty]+Math.floor(500*Math.max(0,1-elapsed/(SECONDS[q.difficulty]*1000)));}
export function reveal(state){
 if(state.phase!=='question')throw Error('There is no question to reveal.');
 const q=state.deck[state.index];
 for(const p of Object.values(state.players)){const a=p.answer;if(a?.index===state.index&&a.choice===q.correct)p.score+=points(q,a.elapsed)*(q.final?2:1);}
 state.phase=q.final?'ended':'reveal';
}
export function view(state,seat,host,now=Date.now()){
 const q=state.phase==='category'?null:state.deck[state.index],revealed=['reveal','ended'].includes(state.phase);
 const leaders=Object.entries(state.players).map(([id,p])=>({name:p.name,score:p.score,you:id===seat})).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
 leaders.forEach((p,i)=>{p.rank=i&&p.score===leaders[i-1].score?leaders[i-1].rank:i+1;});
 const p=state.players[seat];
 return {code:state.code,title:state.title,phase:state.phase,game:state.game,index:state.index,host,categories:state.categories,difficulty:state.difficulty,serverNow:now,deadline:state.deadline,isFinal:!!state.isFinal,categoryIntro:state.phase==='category'?state.deck[state.index+1]?.category:null,canFinal:!!state.finalQuestion&&!state.isFinal,availableCategories:[...new Set(state.deck.slice(state.index+1).map(q=>q.category))],remaining:state.deck.length-state.index-1,playerCount:leaders.length,leaders,
  answered:Object.values(state.players).filter(p=>p.answer?.index===state.index).length,
  eligible:!!p&&p.eligible<=state.index,choice:p?.answer?.index===state.index?p.answer.choice:null,
  question:q?{text:q.text,answers:q.answers,category:q.category,difficulty:q.difficulty,...(revealed?{correct:q.correct,source:q.source,license:q.license}: {})}:null};
}
