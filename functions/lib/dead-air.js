import {balancedCategories} from './trivia-category-balance.js';
// Dead Air: original LINKS rules and question wording. Correct answers never enter active public views.
export const QUESTIONS = [
['Which planet has the shortest year?','Mercury','Venus','Mars','Earth'],
['What is the chemical symbol for gold?','Au','Ag','Fe','Cu'],
['Which instrument measures atmospheric pressure?','Barometer','Thermometer','Seismometer','Anemometer'],
['How many sides does a dodecagon have?','12','10','8','14'],
['Which organ produces insulin?','Pancreas','Liver','Kidney','Lung'],
['Which ocean is the largest by surface area?','Pacific','Atlantic','Indian','Arctic'],
['What is the square root of 144?','12','14','16','18'],
['Which element has atomic number 1?','Hydrogen','Helium','Oxygen','Carbon'],
['Who wrote Frankenstein?','Mary Shelley','Bram Stoker','Jane Austen','Emily Brontë'],
['Which city hosted the first modern Olympic Games in 1896?','Athens','Paris','London','Rome'],
['Which gas makes up most of Earth’s atmosphere?','Nitrogen','Oxygen','Carbon dioxide','Hydrogen'],
['In chess, which piece can jump over other pieces?','Knight','Bishop','Rook','Queen'],
['What is the smallest prime number?','2','0','1','3'],
['Which blood vessels carry blood away from the heart?','Arteries','Veins','Capillaries only','Lymph vessels'],
['Which country is home to the ancient city of Petra?','Jordan','Egypt','Greece','Turkey'],
['What is the main ingredient in traditional hummus?','Chickpeas','Lentils','Potatoes','Peas'],
['How many strings does a standard violin have?','4','5','6','8'],
['Which scientist is associated with the laws of planetary motion?','Johannes Kepler','Charles Darwin','Louis Pasteur','Gregor Mendel'],
['Which number is represented by the Roman numeral XL?','40','60','90','15'],
['What does a light-year measure?','Distance','Time','Brightness','Temperature'],
['Which layer of Earth lies directly beneath the crust?','Mantle','Outer core','Inner core','Atmosphere'],
['What is the currency of Japan?','Yen','Won','Yuan','Rupee'],
['Which artist painted The Starry Night?','Vincent van Gogh','Claude Monet','Pablo Picasso','Salvador Dalí'],
['Which musical term means gradually getting louder?','Crescendo','Diminuendo','Adagio','Staccato'],
['In which sport would you perform a pommel horse routine?','Gymnastics','Polo','Fencing','Diving'],
['What is 15 percent of 200?','30','15','20','45'],
['Which animal is a marsupial?','Koala','Otter','Badger','Hedgehog'],
['Which metal is liquid at ordinary room temperature?','Mercury','Copper','Aluminum','Iron'],
['What is the capital of Canada?','Ottawa','Toronto','Vancouver','Montreal'],
['How many degrees are in a right angle?','90','45','180','360'],
['Which part of a plant usually absorbs water from the soil?','Roots','Petals','Seeds','Fruit'],
['Which author created Sherlock Holmes?','Arthur Conan Doyle','Agatha Christie','Charles Dickens','Jules Verne'],
['Which planet is famous for its Great Red Spot?','Jupiter','Saturn','Neptune','Venus'],
['What is the hardest natural mineral on the Mohs scale?','Diamond','Quartz','Topaz','Corundum'],
['Which language is the source of the word karaoke?','Japanese','Italian','Spanish','Arabic'],
['Which number comes next: 3, 6, 12, 24?','48','36','30','42'],
['Which scientist discovered penicillin?','Alexander Fleming','Isaac Newton','Michael Faraday','Niels Bohr'],
['What is the term for an animal that eats both plants and animals?','Omnivore','Herbivore','Carnivore','Insectivore'],
['Which sea separates northeastern Africa from the Arabian Peninsula?','Red Sea','Black Sea','Baltic Sea','Caspian Sea'],
['How many players from one team are on court in standard basketball?','5','6','7','11']
].map(([text,correct,...wrong],id)=>({id,text,correct,wrong}));
export const AVATARS=['Anchor','Camera','Stagehand','Producer','Engineer','Reporter','Editor','Runner'];
export const SYMBOLS=['◆','●','▲','✚','★','■','☾','☀'];
export const OBJECTS=['Key','Camera','Tape','Lamp','Clock','Headphones','Glasses','Microphone','Envelope','Antenna'];
export const TYPES=['signal','evidence','frequency','power'];
export const TITLES={signal:'Signal Lost',evidence:'Evidence Edit',frequency:'Frequency Lock',power:'Power Split'};
export function random(n){return crypto.getRandomValues(new Uint32Array(1))[0]%n}
export function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=random(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
export function question(id,bank=QUESTIONS){const q=bank.find(q=>q.id===id),options=shuffle([q.correct,...q.wrong]);return {text:q.text,options,correct:options.indexOf(q.correct)}}
export function puzzle(type,players,level=0){
 if(type==='signal')return {type,sequence:Array.from({length:4+Math.min(2,level)},()=>random(8))};
 if(type==='evidence'){const all=shuffle(OBJECTS),before=all.slice(0,6),changed=random(6),after=[...before];after[changed]=all[6];return {type,before,after,changed}}
 if(type==='frequency'){const divisor=3+random(7),correct=(3+random(7))*divisor,parity=correct%2,low=correct-3,high=correct+3;const pool=Array.from({length:80},(_,i)=>i+10).filter(n=>n!==correct&&!(n>=low&&n<=high&&n%divisor===0&&n%2===parity));const options=shuffle([correct,...shuffle(pool).slice(0,3)]);return {type,options,correct:options.indexOf(correct),clues:[`Between ${low} and ${high}, inclusive.`,`A multiple of ${divisor}.`,parity?'An odd number.':'An even number.']}}
 const capacities=players===2?[1,1,0]:[Math.max(1,Math.floor(players/3)),Math.max(1,Math.floor((players-1)/3)),Math.max(1,Math.ceil(players/3))];return {type,capacities};
}
function phase(s,name,now,seconds){s.phase=name;s.phaseId=(s.phaseId||0)+1;s.startsAt=now;s.deadline=now+seconds*1000;s.responses={}}
export function start(s,now,bank=QUESTIONS){s.questionBank=bank;s.deck=balancedCategories(bank).slice(0,16).map(q=>q.id);s.cycle=0;s.finalIndex=0;s.puzzleOrder=shuffle(s.mode==='solo'?TYPES.map(t=>t==='power'?'frequency':t):TYPES);s.results=[];for(const p of Object.values(s.players)){p.score=0;p.lives=3;p.echoCharge=0;p.progress=0;p.atRisk=false}phase(s,'intro',now,20)}
function quiz(s,now){s.question=question(s.deck[s.cycle],s.questionBank);phase(s,'question',now,25)}
function quizResult(s,now){s.results=[];for(const [id,p]of Object.entries(s.players)){const r=s.responses[id],ok=r?.answer===s.question.correct;p.atRisk=!ok&&p.lives>0;const points=ok?100+Math.floor(50*Math.max(0,s.deadline-r.at)/25000):0;p.score+=points;s.results.push({name:p.name,ok,points,note:ok?'Signal secure':p.lives?'At risk in the next challenge':'Echo: keep playing'})}phase(s,'answer',now,8)}
function challengeResult(s,now){const c=s.challenge,counts=[0,0,0];if(c.type==='power')for(const r of Object.values(s.responses))counts[r.answer]++;
 s.results=[];for(const [id,p]of Object.entries(s.players)){const r=s.responses[id];let ok=false;if(r){if(c.type==='signal')ok=JSON.stringify(r.answer)===JSON.stringify(c.sequence);if(c.type==='evidence')ok=r.answer===c.changed;if(c.type==='frequency')ok=r.answer===c.correct;if(c.type==='power')ok=counts[r.answer]<=c.capacities[r.answer]}
 const points=ok?150:0;p.score+=points;let note=ok?'Challenge cleared':'Challenge missed';if(p.lives===0){if(ok)p.echoCharge++;if(p.echoCharge>=2){p.lives=1;p.echoCharge=0;note='BACK ON AIR · 1 life restored'}else note+=` · Echo charge ${p.echoCharge}/2`}else if(p.atRisk&&!ok){p.lives--;note=p.lives?'Lost one life':'SIGNAL LOST · You are an Echo'}p.atRisk=false;s.results.push({name:p.name,ok,points,note})}
 s.challengeOutcome=c.type==='power'?{counts,capacities:c.capacities}:c.type==='signal'?{sequence:c.sequence}:c.type==='evidence'?{changed:c.changed,before:c.before,after:c.after}:{correct:c.options[c.correct]};phase(s,'result',now,12)}
function finalQuestion(s,now){if(s.finalIndex%2===0){s.question=question(s.deck[12+s.finalIndex/2],s.questionBank);s.finalType='trivia'}else{s.challenge=puzzle('frequency',Object.keys(s.players).length);s.finalType='frequency'}phase(s,'final',now,20)}
function finalResult(s,now){const answer=s.finalType==='trivia'?s.question.correct:s.challenge.correct;s.results=[];for(const[id,p]of Object.entries(s.players)){const ok=s.responses[id]?.answer===answer;if(ok){p.progress+=2;p.score+=250}s.results.push({name:p.name,ok,points:ok?250:0,note:ok?'+2 transmitter bars':'No progress'})}phase(s,'finalAnswer',now,6)}
export function advance(s,now){if(!s.deadline||now<s.deadline||['lobby','ended'].includes(s.phase))return false;
 switch(s.phase){case'intro':quiz(s,now);break;case'question':quizResult(s,now);break;case'answer':s.challenge=puzzle(s.puzzleOrder[s.cycle%4],Object.keys(s.players).length,Math.floor(s.cycle/4));phase(s,'brief',now,10);break;case'brief':phase(s,'observe',now,8);break;case'observe':phase(s,'challenge',now,25);break;case'challenge':challengeResult(s,now);break;case'result':s.cycle++;if(s.cycle<12)quiz(s,now);else{for(const p of Object.values(s.players))p.progress=Math.min(3,Math.floor(p.score/1200))+(p.lives>0?1:0);phase(s,'finalIntro',now,15)}break;case'finalIntro':finalQuestion(s,now);break;case'final':finalResult(s,now);break;case'finalAnswer':s.finalIndex++;if(s.finalIndex>=8||Object.values(s.players).some(p=>p.progress>=12)){phase(s,'ended',now,0);s.deadline=0}else finalQuestion(s,now);break;}return true;
}
export function respond(s,seat,answer,now){if(!['question','challenge','final'].includes(s.phase)||now>=s.deadline||now<s.startsAt)throw Error('This screen is locked.');if(s.responses[seat])throw Error('Your answer is already locked.');const signal=s.phase==='challenge'&&s.challenge.type==='signal';if(signal){if(!Array.isArray(answer)||answer.length!==s.challenge.sequence.length||!answer.every(n=>Number.isInteger(n)&&n>=0&&n<8))throw Error('Enter the complete symbol sequence.')}else{const max=s.phase==='challenge'?(s.challenge.type==='evidence'?6:s.challenge.type==='power'?3:4):4;if(!Number.isInteger(answer)||answer<0||answer>=max)throw Error('Choose one of the available answers.')}s.responses[seat]={answer,at:now}}
export function view(s,seat,now,display=false){const p=s.players[seat],out={code:s.code,mode:s.mode,game:s.game,phase:s.phase,phaseId:s.phaseId,serverNow:now,startsAt:s.startsAt,deadline:s.deadline,cycle:s.cycle||0,finalIndex:s.finalIndex||0,host:!display&&seat===s.owner,display,displayKey:!display&&seat===s.owner?s.displayKey:undefined,submitted:Object.keys(s.responses||{}).length,locked:!display&&!!s.responses?.[seat],selection:!display?s.responses?.[seat]?.answer:undefined,players:Object.entries(s.players).map(([id,p])=>({name:p.name,avatar:p.avatar,ready:p.ready,score:p.score,lives:p.lives,echoCharge:p.echoCharge,progress:p.progress,atRisk:p.atRisk,you:!display&&id===seat})).sort((a,b)=>(s.phase==='ended'||s.phase.startsWith('final'))?b.progress-a.progress||b.score-a.score:b.score-a.score)};
 const quizVisible=['question','answer'].includes(s.phase)||(['final','finalAnswer'].includes(s.phase)&&s.finalType==='trivia');if(quizVisible)out.question={text:s.question.text,options:s.question.options,...(['answer','finalAnswer'].includes(s.phase)?{correct:s.question.correct}:{})};
 if(['brief','observe','challenge','result'].includes(s.phase)||(['final','finalAnswer'].includes(s.phase)&&s.finalType==='frequency')){const c=s.challenge;out.challenge={type:c.type,title:TITLES[c.type]};if(c.type==='signal'){out.challenge.length=c.sequence.length;if(s.phase==='observe'||s.phase==='result')out.challenge.sequence=c.sequence}
 if(c.type==='evidence'){if(s.phase==='observe')out.challenge.board=c.before;if(['challenge','result'].includes(s.phase))out.challenge.board=c.after}
 if(c.type==='frequency'){
 const revealed=['result','finalAnswer'].includes(s.phase),answering=['challenge','final'].includes(s.phase),count=revealed?c.clues.length:answering?Math.min(c.clues.length,1+Math.floor(Math.max(0,now-s.startsAt)/5000)):0;
 out.challenge.clues=c.clues.slice(0,count);out.challenge.clueCount=c.clues.length;out.challenge.nextClueAt=answering&&count<c.clues.length?s.startsAt+count*5000:null;
 out.challenge.options=answering||revealed?c.options:[];if(s.phase==='finalAnswer')out.challenge.correct=c.correct;
 }
 if(c.type==='power')out.challenge.capacities=c.capacities;if(s.phase==='result')out.outcome=s.challengeOutcome;}
 if(['answer','result','finalAnswer'].includes(s.phase))out.results=s.results;return out;
}
