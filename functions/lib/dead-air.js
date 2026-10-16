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
export const TYPES=['signal','evidence','frequency','power','relay'];
export const TITLES={signal:'Signal Lost',evidence:'Evidence Edit',frequency:'Frequency Lock',power:'Power Split',relay:'Relay Trace'};
export const RELAY_EXITS=['North','East','South','West'];
export function random(n){return crypto.getRandomValues(new Uint32Array(1))[0]%n}
export function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=random(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
export function question(id,bank=QUESTIONS){const q=bank.find(q=>q.id===id),options=shuffle([q.correct,...q.wrong]);return {text:q.text,options,correct:options.indexOf(q.correct)}}
function relayPuzzle(level){
 const size=4,length=7+random(3)+Math.min(2,level),route=[],visited=new Set();let exit=0;
 const step=(cell,direction)=>{const row=Math.floor(cell/size),column=cell%size;return direction===0?(row?cell-size:-1):direction===1?(column<size-1?cell+1:-1):direction===2?(row<size-1?cell+size:-1):(column?cell-1:-1)};
 function trace(cell){
  route.push(cell);visited.add(cell);
  if(route.length===length){const exits=[0,1,2,3].filter(direction=>step(cell,direction)===-1);if(exits.length){exit=exits[random(exits.length)];return true}}
  else for(const direction of shuffle([0,1,2,3])){const next=step(cell,direction);if(next!==-1&&!visited.has(next)&&trace(next))return true}
  route.pop();visited.delete(cell);return false;
 }
 trace(random(size*size));
 const cells=Array.from({length:size*size},()=>random(4));
 for(let i=0;i<route.length-1;i++)cells[route[i]]=[0,1,2,3].find(direction=>step(route[i],direction)===route[i+1]);
 cells[route.at(-1)]=exit;
 return {type:'relay',size,cells,start:route[0],route,correct:exit};
}
export function puzzle(type,players,level=0){
 if(type==='signal')return {type,sequence:Array.from({length:4+Math.min(2,level)},()=>random(8))};
 if(type==='evidence'){const all=shuffle(OBJECTS),before=all.slice(0,6),changed=random(6),after=[...before];after[changed]=all[6];return {type,before,after,changed}}
 if(type==='frequency'){const divisor=3+random(7),correct=(3+random(7))*divisor,parity=correct%2,low=correct-3,high=correct+3;const pool=Array.from({length:80},(_,i)=>i+10).filter(n=>n!==correct&&!(n>=low&&n<=high&&n%divisor===0&&n%2===parity));const options=shuffle([correct,...shuffle(pool).slice(0,3)]);return {type,options,correct:options.indexOf(correct),clues:[`Between ${low} and ${high}, inclusive.`,`A multiple of ${divisor}.`,parity?'An odd number.':'An even number.']}}
 if(type==='relay')return relayPuzzle(level);
 const capacities=players===2?[1,1,0]:[Math.max(1,Math.floor(players/3)),Math.max(1,Math.floor((players-1)/3)),Math.max(1,Math.ceil(players/3))];return {type,capacities};
}
function phase(s,name,now,seconds){s.phase=name;s.phaseId=(s.phaseId||0)+1;s.startsAt=now;s.deadline=now+seconds*1000;s.responses={};s.pausedAt=null}
export function start(s,now,bank=QUESTIONS){s.questionBank=bank;s.deck=balancedCategories(bank).slice(0,16).map(q=>q.id);s.cycle=0;s.finalIndex=0;s.cleanBroadcast=false;s.challengeCounts={};s.puzzleOrder=shuffle(s.mode==='solo'?TYPES.filter(t=>t!=='power'):TYPES);s.results=[];for(const p of Object.values(s.players)){p.score=0;p.lives=3;p.echoCharge=0;p.progress=0;p.atRisk=false}phase(s,'intro',now,20)}
function quiz(s,now){s.cleanBroadcast=false;s.question=question(s.deck[s.cycle],s.questionBank);phase(s,'question',now,15)}
function quizResult(s,now){s.results=[];for(const [id,p]of Object.entries(s.players)){const r=s.responses[id],ok=r?.answer===s.question.correct;p.atRisk=!ok&&p.lives>0;const points=ok?100+Math.floor(50*Math.max(0,s.deadline-r.at)/15000):0;p.score+=points;s.results.push({playerId:id,name:p.name,ok,points,note:ok?'Signal secure':p.lives?'At risk in the next challenge':'Echo: keep playing',outcome:ok?'secure':p.lives?'risk':'echo',choice:r?s.question.options[r.answer]:'No answer saved',solution:s.question.options[s.question.correct],answered:!!r,lives:p.lives,echoCharge:p.echoCharge})}
 s.cleanBroadcast=s.flowVersion===2&&s.results.every(r=>r.ok)&&Object.values(s.players).every(p=>p.lives>0);
 if(s.cleanBroadcast){for(const p of Object.values(s.players))p.score+=150;for(const r of s.results){r.points+=150;r.bonus=150;r.outcome='clean';r.note='Clean broadcast · +150 challenge bonus'}}
 phase(s,'answer',now,8)}
function challengeChoice(c,answer){
 if(answer===undefined)return 'No answer saved';
 if(c.type==='signal')return answer.map(n=>SYMBOLS[n]).join(' ');
 if(c.type==='evidence')return 'Shelf '+(answer+1)+' · '+c.after[answer];
 if(c.type==='frequency')return c.options[answer]+' kHz';
 if(c.type==='relay')return RELAY_EXITS[answer]+' exit';
 return ['North','East','West'][answer]+' generator';
}
function challengeResult(s,now){const c=s.challenge,counts=[0,0,0];if(c.type==='power')for(const r of Object.values(s.responses))counts[r.answer]++;
 s.results=[];for(const [id,p]of Object.entries(s.players)){const r=s.responses[id],livesBefore=p.lives,chargeBefore=p.echoCharge;let ok=false;if(r){if(c.type==='signal')ok=JSON.stringify(r.answer)===JSON.stringify(c.sequence);if(c.type==='evidence')ok=r.answer===c.changed;if(['frequency','relay'].includes(c.type))ok=r.answer===c.correct;if(c.type==='power')ok=counts[r.answer]<=c.capacities[r.answer]}
 const points=ok?150:0;p.score+=points;let note=ok?'Challenge cleared · life safe':'Challenge missed · life safe',outcome=ok?'held':'safe';
 if(p.lives===0){if(ok)p.echoCharge++;if(p.echoCharge>=2){p.lives=1;p.echoCharge=0;note='BACK ON AIR · 1 life restored';outcome='returned'}else{note=ok?`Echo charged · ${p.echoCharge}/2 toward return`:`Echo charge held at ${p.echoCharge}/2`;outcome=ok?'charged':'echo'}}
 else if(p.atRisk&&!ok){p.lives--;note=p.lives?'Lost one life · '+p.lives+' remaining':'SIGNAL LOST · You are an Echo';outcome=p.lives?'lost':'faded'}
 const correct=c.type==='signal'?c.sequence:c.type==='evidence'?c.changed:c.correct;
 const solution=c.type==='power'?r?counts[r.answer]+' players / '+c.capacities[r.answer]+' seats':'No generator selected':challengeChoice(c,correct);
 p.atRisk=false;s.results.push({playerId:id,name:p.name,ok,points,note,outcome,answered:!!r,choice:challengeChoice(c,r?.answer),solution,lives:p.lives,lifeDelta:p.lives-livesBefore,echoCharge:p.echoCharge,echoDelta:p.echoCharge-chargeBefore})}
 s.challengeOutcome=c.type==='power'?{counts,capacities:c.capacities}:c.type==='signal'?{sequence:c.sequence}:c.type==='evidence'?{changed:c.changed,before:c.before,after:c.after}:c.type==='relay'?{route:c.route,correct:c.correct,exit:RELAY_EXITS[c.correct]}:{correct:c.options[c.correct]};phase(s,'result',now,12)}
function finalQuestion(s,now){if(s.finalIndex%2===0){s.question=question(s.deck[12+s.finalIndex/2],s.questionBank);s.finalType='trivia'}else{s.challenge=puzzle('frequency',Object.keys(s.players).length);s.finalType='frequency'}phase(s,'final',now,s.finalType==='trivia'?15:20)}
function finalResult(s,now){const answer=s.finalType==='trivia'?s.question.correct:s.challenge.correct;s.results=[];for(const[id,p]of Object.entries(s.players)){const r=s.responses[id],ok=r?.answer===answer;if(ok){p.progress+=2;p.score+=250}s.results.push({playerId:id,name:p.name,ok,points:ok?250:0,note:ok?'+2 transmitter bars':'No progress',outcome:ok?'advanced':'stalled',answered:!!r,choice:r?(s.finalType==='trivia'?s.question.options[r.answer]:challengeChoice(s.challenge,r.answer)):'No answer saved',solution:s.finalType==='trivia'?s.question.options[answer]:challengeChoice(s.challenge,answer),progress:p.progress})}phase(s,'finalAnswer',now,6)}
function nextBroadcast(s,now){s.cleanBroadcast=false;s.cycle++;if(s.cycle<12)quiz(s,now);else{for(const p of Object.values(s.players))p.progress=Math.min(3,Math.floor(p.score/1200))+(p.lives>0?1:0);phase(s,'finalIntro',now,15)}}
export function advance(s,now){if(s.pausedAt!=null||!s.deadline||now<s.deadline||['lobby','ended'].includes(s.phase))return false;
 switch(s.phase){case'intro':quiz(s,now);break;case'question':quizResult(s,now);break;case'answer':if(s.flowVersion===2&&s.cleanBroadcast){nextBroadcast(s,now);break}s.challenge=puzzle(s.puzzleOrder[s.cycle%s.puzzleOrder.length],Object.keys(s.players).length,Math.floor(s.cycle/s.puzzleOrder.length));s.challengeCounts||={};const repeated=!!s.challengeCounts[s.challenge.type];s.challengeCounts[s.challenge.type]=(s.challengeCounts[s.challenge.type]||0)+1;phase(s,'brief',now,s.flowVersion===2&&repeated?5:10);break;case'brief':{const immediate=s.flowVersion===2&&['frequency','power','relay'].includes(s.challenge.type);phase(s,immediate?'challenge':'observe',now,immediate?(s.challenge.type==='relay'?30:25):8);break}case'observe':phase(s,'challenge',now,s.challenge.type==='relay'?30:25);break;case'challenge':challengeResult(s,now);break;case'result':nextBroadcast(s,now);break;case'finalIntro':finalQuestion(s,now);break;case'final':finalResult(s,now);break;case'finalAnswer':s.finalIndex++;if(s.finalIndex>=8||Object.values(s.players).some(p=>p.progress>=12)){phase(s,'ended',now,0);s.deadline=0}else finalQuestion(s,now);break;}return true;
}
export function pause(s,now,paused){if(['lobby','ended'].includes(s.phase))throw Error('There is no active broadcast to pause.');if(typeof paused!=='boolean')throw Error('Choose pause or resume.');if(paused){if(s.pausedAt!=null)return false;s.pausedAt=now;return true}if(s.pausedAt==null)return false;const elapsed=Math.max(0,now-s.pausedAt);s.deadline+=elapsed;s.startsAt+=elapsed;for(const r of Object.values(s.responses||{}))if(Number.isFinite(r.at))r.at+=elapsed;s.pausedAt=null;return true}
export function respond(s,seat,answer,now){if(s.pausedAt!=null)throw Error('The broadcast is paused. Wait for the host to resume.');if(!['question','challenge','final'].includes(s.phase)||now>=s.deadline||now<s.startsAt)throw Error('This screen is locked.');const signal=s.phase==='challenge'&&s.challenge.type==='signal';if(signal){if(!Array.isArray(answer)||answer.length!==s.challenge.sequence.length||!answer.every(n=>Number.isInteger(n)&&n>=0&&n<8))throw Error('Enter the complete symbol sequence.')}else{const max=s.phase==='challenge'?(s.challenge.type==='evidence'?6:s.challenge.type==='power'?3:4):4;if(!Number.isInteger(answer)||answer<0||answer>=max)throw Error('Choose one of the available answers.')}if(JSON.stringify(s.responses[seat]?.answer)!==JSON.stringify(answer))s.responses[seat]={answer,at:now}}
function nextTask(s){if(s.pausedAt!=null)return 'The host has paused the broadcast. Your answer and remaining time are saved.';switch(s.phase){case'lobby':return 'Choose your identity and mark ready. The host starts when everyone is ready.';case'intro':return 'Answer trivia to protect your lives. Everyone plays the challenges, and Echoes can return.';case'question':return 'Choose an answer before the timer ends. You can change it while the question is open.';case'answer':return s.cleanBroadcast?'Everyone answered correctly. Each player earns a 150-point challenge bonus; the next broadcast opens automatically.':'A challenge is next. Players at risk must succeed to protect a life; Echoes play toward a return.';case'brief':return ['signal','evidence'].includes(s.challenge.type)?'Watch the demonstration next. The challenge begins after the memory screen.':'The challenge opens next. Read the rules and prepare your answer.';case'observe':return s.challenge.type==='signal'?'Remember the symbols in order. Enter them when the challenge opens.':s.challenge.type==='evidence'?'Remember the six objects. Find the changed position when the challenge opens.':'The challenge opens next.';case'challenge':return 'Everyone plays. Protect a life, charge an Echo comeback, or earn 150 points.';case'result':return 'Review the outcome. The next broadcast starts automatically.';case'finalIntro':return 'Race to 12 transmitter bars. Every correct final answer adds two bars; everyone can win.';case'final':return 'Choose your answer. A correct answer adds two transmitter bars.';case'finalAnswer':return 'Check the race positions. Progress decides the winner, then points break a tie.';case'ended':return 'The broadcast is over. Review the final race and scores, or play again.';default:return ''}}
export function view(s,seat,now,display=false){const clock=s.pausedAt??now,out={code:s.code,mode:s.mode,game:s.game,flowVersion:s.flowVersion||1,roundCount:12,paused:s.pausedAt!=null,pausedAt:s.pausedAt??null,cleanBroadcast:s.phase==='answer'&&!!s.cleanBroadcast,broadcastBonus:s.phase==='answer'&&s.cleanBroadcast?150:0,nextTask:nextTask(s),phase:s.phase,phaseId:s.phaseId,serverNow:now,startsAt:s.startsAt,deadline:s.deadline,cycle:s.cycle||0,finalIndex:s.finalIndex||0,host:!display&&seat===s.owner,display,displayKey:!display&&seat===s.owner?s.displayKey:undefined,submitted:Object.keys(s.responses||{}).length,locked:!display&&!!s.responses?.[seat],selection:!display?s.responses?.[seat]?.answer:undefined,players:Object.entries(s.players).map(([id,p])=>({name:p.name,avatar:p.avatar,ready:p.ready,score:p.score,lives:p.lives,echoCharge:p.echoCharge,progress:p.progress,atRisk:p.atRisk,you:!display&&id===seat,...(!display&&seat===s.owner&&s.phase==='lobby'?{id:p.id}:{})})).sort((a,b)=>(s.phase==='ended'||s.phase.startsWith('final'))?b.progress-a.progress||b.score-a.score:b.score-a.score)};
 const quizVisible=['question','answer'].includes(s.phase)||(['final','finalAnswer'].includes(s.phase)&&s.finalType==='trivia');if(quizVisible)out.question={text:s.question.text,options:s.question.options,...(['answer','finalAnswer'].includes(s.phase)?{correct:s.question.correct}:{})};
 if(['brief','observe','challenge','result'].includes(s.phase)||(['final','finalAnswer'].includes(s.phase)&&s.finalType==='frequency')){const c=s.challenge;out.challenge={type:c.type,title:TITLES[c.type]};if(c.type==='signal'){out.challenge.length=c.sequence.length;if(s.phase==='observe'||s.phase==='result')out.challenge.sequence=c.sequence}
 if(c.type==='evidence'){if(s.phase==='observe')out.challenge.board=c.before;if(['challenge','result'].includes(s.phase))out.challenge.board=c.after}
 if(c.type==='relay'){out.challenge.size=c.size;out.challenge.exits=RELAY_EXITS;if(['challenge','result'].includes(s.phase)){out.challenge.cells=c.cells;out.challenge.start=c.start}}
 if(c.type==='frequency'){
 const revealed=['result','finalAnswer'].includes(s.phase),answering=['challenge','final'].includes(s.phase),count=revealed?c.clues.length:answering?Math.min(c.clues.length,1+Math.floor(Math.max(0,clock-s.startsAt)/5000)):0;
 out.challenge.clues=c.clues.slice(0,count);out.challenge.clueCount=c.clues.length;out.challenge.nextClueAt=answering&&count<c.clues.length?s.startsAt+count*5000:null;
 out.challenge.options=answering||revealed?c.options:[];if(s.phase==='finalAnswer')out.challenge.correct=c.correct;
 }
 if(c.type==='power')out.challenge.capacities=c.capacities;if(s.phase==='result')out.outcome=s.challengeOutcome;}
 if(['answer','result','finalAnswer'].includes(s.phase))out.results=(s.results||[]).map(({playerId,...result})=>({...result,you:!display&&(playerId?playerId===seat:result.name===s.players[seat]?.name)}));return out;
}
