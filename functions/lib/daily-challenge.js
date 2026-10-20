import {EXPERT_BANK} from './daily-expert-bank.js';
// Original backup questions are assigned real difficulty tiers, not randomly relabeled.
const easyRows=[
['Sports','How many points is a touchdown worth before the extra try?','6|3|7|2',0,'A touchdown scores six points.'],
['Sports','How many players does one basketball team have on court during normal play?','5|6|7|9',0,'Five players per team take the court.'],
['Sports','In baseball, what is it called when a batter receives three strikes?','Strikeout|Turkey|Spare|Hat trick',0,'Three strikes result in a strikeout.'],
['Sports','In golf, what is one stroke under par called?','Birdie|Bogey|Eagle|Albatross',0,'A birdie is one stroke under par.'],
['Sports','How many outs end a half-inning in baseball?','3|2|4|6',0,'Three outs end a half-inning.'],
['Sports','Which sport uses a puck?','Ice hockey|Tennis|Cricket|Volleyball',0,'Ice hockey is played with a puck.'],
['Sports','What is the highest possible score with one dart on a standard board?','60|50|100|180',0,'Triple 20 scores 60 with one dart.'],
['Sports','How long is an Olympic swimming pool?','50 meters|25 meters|100 meters|75 meters',0,'An Olympic long-course pool is 50 meters long.'],
['Sports','In tennis, what score is called love?','Zero|One|Fifteen|Thirty',0,'Love means zero in tennis.'],
['Sports','How many bases form a baseball diamond, counting home plate?','4|3|5|6',0,'First, second, third, and home make four.'],
['Sports','Which chess piece can jump over other pieces?','Knight|Bishop|Rook|Queen',0,'The knight can jump over pieces.'],
['Sports','How many holes are in a standard full round of golf?','18|9|12|20',0,'A standard full round has 18 holes.'],
];
const mediumRows=[
["Science","Which part of a cell contains most of its genetic material?","Nucleus|Ribosome|Cell membrane|Cytoplasm",0,"In eukaryotic cells, most genetic material is in the nucleus."],
["Science","What is the chemical symbol for potassium?","K|P|Po|Pt",0,"Potassium has the symbol K, from kalium."],
["Science","What is the process by which a solid changes directly into a gas?","Sublimation|Condensation|Freezing|Deposition",0,"Sublimation skips the liquid phase."],
["Science","Which blood vessels carry blood away from the heart?","Arteries|Veins|Capillaries|Venules",0,"Arteries carry blood away from the heart."],
["Music","Which composer wrote The Four Seasons?","Antonio Vivaldi|Johann Sebastian Bach|Frederic Chopin|Franz Schubert",0,"Vivaldi composed the four violin concertos known as The Four Seasons."],
["Music","What interval spans eight notes of a diatonic scale?","Octave|Perfect fifth|Major third|Tritone",0,"An octave spans eight scale degrees, including both endpoints."],
["Music","Which jazz musician was nicknamed Satchmo?","Louis Armstrong|Duke Ellington|Miles Davis|Charlie Parker",0,"Satchmo was a nickname of Louis Armstrong."],
["Movies","Who directed the 1975 film Jaws?","Steven Spielberg|George Lucas|Ridley Scott|Martin Scorsese",0,"Steven Spielberg directed Jaws."],
["Movies","Which film won the first Academy Award for Best Animated Feature?","Shrek|Toy Story|Spirited Away|Finding Nemo",0,"Shrek won the inaugural award at the 2002 ceremony."],
["Movies","In The Lord of the Rings, what is the name of Frodo’s gardener?","Samwise Gamgee|Peregrin Took|Meriadoc Brandybuck|Bilbo Baggins",0,"Samwise Gamgee is Frodo’s gardener and companion."],
["History","Which treaty formally ended World War I between Germany and the Allied powers?","Treaty of Versailles|Treaty of Paris of 1783|Treaty of Ghent|Treaty of Tordesillas",0,"The Treaty of Versailles was signed in 1919."],
["History","Which empire was ruled by Suleiman the Magnificent?","Ottoman Empire|Roman Empire|Mongol Empire|Persian Achaemenid Empire",0,"Suleiman was an Ottoman sultan."],
["World","Which strait separates Spain from Morocco?","Strait of Gibraltar|Strait of Hormuz|Bering Strait|Strait of Malacca",0,"The Strait of Gibraltar links the Atlantic and Mediterranean."],
["World","What is the capital of New Zealand?","Wellington|Auckland|Christchurch|Dunedin",0,"Wellington is New Zealand’s capital."],
["World","Which river flows through Budapest?","Danube|Rhine|Seine|Po",0,"The Danube runs through Budapest."],
["Literature","Who wrote the novel Pride and Prejudice?","Jane Austen|Charlotte Bronte|Mary Shelley|George Eliot",0,"Jane Austen wrote Pride and Prejudice."],
["Literature","Who created the fictional detective Hercule Poirot?","Agatha Christie|Arthur Conan Doyle|Dorothy L. Sayers|Raymond Chandler",0,"Hercule Poirot was created by Agatha Christie."],
["Art","Which artist painted The Persistence of Memory?","Salvador Dali|Pablo Picasso|Claude Monet|Vincent van Gogh",0,"Salvador Dali painted the work featuring melting clocks."],
["Sports","Which city hosted the 1992 Summer Olympics?","Barcelona|Atlanta|Seoul|Sydney",0,"Barcelona hosted the 1992 Summer Olympics."],
["Sports","In snooker, how many points is the black ball worth?","7|6|5|4",0,"The black ball is worth seven points."],
["Sports","What is the maximum break in a standard snooker frame without a free ball?","147|155|180|170",0,"Fifteen reds with fifteen blacks, then all colors, total 147."],
["Sports","Which country won the 2010 men’s FIFA World Cup?","Spain|Netherlands|Germany|Brazil",0,"Spain defeated the Netherlands in the final."],
["Food","What is the main ingredient in traditional hummus?","Chickpeas|Lentils|White rice|Potatoes",0,"Traditional hummus is made primarily from chickpeas."],
["Science","Which SI unit measures electrical resistance?","Ohm|Watt|Volt|Ampere",0,"Electrical resistance is measured in ohms."]
];
const hardRows=[
["Science","Which physicist introduced the exclusion principle named after him?","Wolfgang Pauli|Max Planck|Niels Bohr|Erwin Schrodinger",0,"Wolfgang Pauli formulated the exclusion principle in 1925."],
["Science","Which element has atomic number 72?","Hafnium|Tantalum|Rhenium|Tungsten",0,"Hafnium, symbol Hf, has atomic number 72."],
["Science","In humans, which cranial nerve is the tenth?","Vagus|Trigeminal|Facial|Hypoglossal",0,"The vagus nerve is cranial nerve X."],
["Space","Which moon of Saturn has a dense atmosphere and liquid methane lakes?","Titan|Enceladus|Rhea|Iapetus",0,"Titan has a dense atmosphere and lakes of liquid hydrocarbons."],
["History","In what year was the Magna Carta first issued?","1215|1066|1297|1415",0,"King John first issued Magna Carta in 1215."],
["History","Which Byzantine emperor commissioned the sixth-century rebuilding of Hagia Sophia?","Justinian I|Constantine XI|Alexios I|Basil II",0,"Justinian I commissioned the church completed in 537."],
["World","Which landlocked country lies entirely within South Africa?","Lesotho|Eswatini|Botswana|Malawi",0,"Lesotho is completely surrounded by South Africa."],
["Literature","Which author wrote the novel The Master and Margarita?","Mikhail Bulgakov|Boris Pasternak|Vladimir Nabokov|Ivan Turgenev",0,"Mikhail Bulgakov wrote The Master and Margarita."],
["Music","Which composer wrote the opera Wozzeck?","Alban Berg|Anton Webern|Gustav Mahler|Richard Strauss",0,"Alban Berg composed Wozzeck."],
["Art","Which Dutch painter created The Garden of Earthly Delights?","Hieronymus Bosch|Pieter Bruegel the Elder|Jan Vermeer|Frans Hals",0,"The triptych was painted by Hieronymus Bosch."],
["Sports","Which athlete won the Olympic men’s marathon in Rome in 1960 while running barefoot?","Abebe Bikila|Emil Zatopek|Kip Keino|Lasse Viren",0,"Ethiopia’s Abebe Bikila won barefoot in Rome."],
["Movies","Who directed the 1954 film Seven Samurai?","Akira Kurosawa|Yasujiro Ozu|Kenji Mizoguchi|Ishiro Honda",0,"Akira Kurosawa directed Seven Samurai."]
];
const convert=(rows,difficulty)=>rows.map(([category,text,choices,answer,explanation])=>({category,text,choices:choices.split('|'),answer,explanation,difficulty,source:'LINKS question library'}));
const moderateIndices=new Set([0,1,2,3,4,5,7,9,13,15,16,22]);
export const BANK=[...convert(easyRows,'easy'),...convert(mediumRows,'medium').map((q,i)=>({...q,stage:moderateIndices.has(i)?2:3})),...convert(hardRows,'hard'),...EXPERT_BANK.map(q=>({...q,difficulty:'expert'}))];
export const centralDay=(now)=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
export function resetAt(now){const day=centralDay(now);let low=now,high=now+27*3600000;while(high-low>1){const mid=Math.floor((low+high)/2);if(centralDay(mid)===day)low=mid;else high=mid}return new Date(high).toISOString()}
export function previousDay(day){return new Date(Date.parse(day+'T12:00:00Z')-86400000).toISOString().slice(0,10)}
export const DAILY_WHEEL_BONUSES=Object.freeze([0,10,20,30,40,50]);
export function spinDailyWheel(draw=()=>crypto.getRandomValues(new Uint32Array(1))[0]){
 // Rejection sampling avoids modulo bias across six equal wheel sectors.
 let value;do{value=draw()}while(value>=4294967292);const wheelIndex=value%DAILY_WHEEL_BONUSES.length,bonusPerCorrect=DAILY_WHEEL_BONUSES[wheelIndex];return {wheelIndex,bonusPerCorrect,maxScore:5*(100+bonusPerCorrect)}
}
export function dailyDeck(day){
 const dayIndex=Math.floor(Date.parse(day+'T00:00:00Z')/86400000),epoch=Math.floor(dayIndex/12),offset=((dayIndex%12)+12)%12;
 const shuffled=(items,label)=>{let seed=2166136261;for(const c of String(epoch)+label)seed=Math.imul(seed^c.charCodeAt(0),16777619);const random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296};const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};
 const tier=(d,stage)=>shuffled(BANK.filter(q=>q.difficulty===d&&(!stage||q.stage===stage)),d+(stage||''));
 const selected=[tier('easy')[offset],tier('medium',2)[offset],tier('medium',3)[offset],tier('hard')[offset],tier('expert')[offset]];
 // Each tier rotates without replacement across twelve days; the final is always expert.
 return selected.map((q,index)=>{const order=shuffled([0,1,2,3],day+'-'+index);return {...q,level:index+1,choices:order.map(i=>q.choices[i]),answer:order.indexOf(q.answer)}})
}
export async function ensureDaily(db){for(const statement of [
 db.prepare('CREATE TABLE IF NOT EXISTS links_daily_profiles(owner TEXT PRIMARY KEY,id TEXT UNIQUE NOT NULL,name TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_daily_decks(day TEXT PRIMARY KEY,deck TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_daily_attempts(owner TEXT NOT NULL,day TEXT NOT NULL,id TEXT UNIQUE NOT NULL,version INTEGER NOT NULL,state TEXT NOT NULL,score INTEGER NOT NULL DEFAULT 0,completed INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(owner,day))'),
 db.prepare('CREATE INDEX IF NOT EXISTS links_daily_ranking ON links_daily_attempts(day,completed,score)')
])await statement.run()}
