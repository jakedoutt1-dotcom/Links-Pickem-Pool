// Original evergreen question bank. Answers never leave the server before grading.
const rows = [
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
['Science','Which planet is known as the Red Planet?','Mars|Venus|Jupiter|Mercury',0,'Iron minerals give Mars its reddish appearance.'],
['Science','What gas do plants take in during photosynthesis?','Carbon dioxide|Helium|Hydrogen|Neon',0,'Plants use carbon dioxide and water to make sugars.'],
['Science','What is the chemical symbol for gold?','Au|Ag|Fe|Pb',0,'Gold is represented by Au.'],
['Science','How many bones does a typical adult human skeleton have?','206|106|306|406',0,'The typical adult skeleton has 206 bones.'],
['Science','Which force keeps planets in orbit around the Sun?','Gravity|Friction|Magnetism|Buoyancy',0,'Gravity attracts planets toward the Sun.'],
['Science','Which organ pumps blood around the body?','Heart|Liver|Lung|Kidney',0,'The heart pumps blood through the circulatory system.'],
['Science','What is the largest planet in our solar system?','Jupiter|Earth|Saturn|Neptune',0,'Jupiter is the largest planet.'],
['Science','What is the boiling point of pure water at standard sea-level pressure?','100°C|90°C|80°C|120°C',0,'At standard atmospheric pressure, water boils at 100°C.'],
['Science','Which animal is a mammal?','Dolphin|Shark|Trout|Octopus',0,'Dolphins breathe air and nurse their young.'],
['Science','How many sides does a hexagon have?','6|5|7|8',0,'A hexagon has six sides.'],
['Science','What does a thermometer measure?','Temperature|Pressure|Speed|Mass',0,'A thermometer measures temperature.'],
['Science','Which part of a plant usually absorbs water from soil?','Roots|Flowers|Fruit|Petals',0,'Roots absorb water from the soil.'],
['Movies','Which movie features the character Buzz Lightyear?','Toy Story|Shrek|Finding Nemo|Cars',0,'Buzz Lightyear appears in Toy Story.'],
['Movies','What is the name of the fictional school in the Harry Potter stories?','Hogwarts|Narnia|Neverland|Camelot',0,'Harry attends Hogwarts School of Witchcraft and Wizardry.'],
['Movies','Which character famously carries a shield with a star?','Captain America|Thor|Hulk|Iron Man',0,'Captain America carries the star-emblazoned shield.'],
['Movies','What kind of animal is Simba in The Lion King?','Lion|Tiger|Leopard|Cheetah',0,'Simba is a lion.'],
['Movies','Which movie features a snowman named Olaf?','Frozen|Tangled|Moana|Brave',0,'Olaf is the snowman in Frozen.'],
['Movies','Who is the friendly ghost in the film named after him?','Casper|Shrek|Gizmo|Stitch',0,'Casper is known as the friendly ghost.'],
['Movies','Which film series features a DeLorean time machine?','Back to the Future|Jurassic Park|The Matrix|Men in Black',0,'The DeLorean is the time machine in Back to the Future.'],
['Movies','Which movie features the song Hakuna Matata?','The Lion King|Aladdin|Cinderella|Mulan',0,'Timon and Pumbaa sing Hakuna Matata in The Lion King.'],
['Movies','Which superhero is also known as Peter Parker?','Spider-Man|Batman|Superman|Aquaman',0,'Peter Parker is Spider-Man.'],
['Movies','Which fictional archaeologist uses a whip and wears a fedora?','Indiana Jones|James Bond|Sherlock Holmes|Han Solo',0,'Those are signature items of Indiana Jones.'],
['Movies','What is the name of the green ogre who befriends Donkey?','Shrek|Sulley|Hulk|Grinch',0,'Shrek befriends Donkey.'],
['Movies','Which Pixar movie follows a clownfish searching for his son?','Finding Nemo|Up|WALL-E|Inside Out',0,'Marlin searches for Nemo in Finding Nemo.'],
['Music','How many strings does a standard guitar usually have?','6|4|5|8',0,'A standard guitar has six strings.'],
['Music','Which instrument has black and white keys?','Piano|Trumpet|Violin|Flute',0,'Pianos have black and white keys.'],
['Music','Which band recorded the album Abbey Road?','The Beatles|Queen|U2|ABBA',0,'Abbey Road is a Beatles album.'],
['Music','Which instrument is played with drumsticks?','Snare drum|Harp|Clarinet|Trombone',0,'A snare drum is commonly played with drumsticks.'],
['Music','In written music, what does a rest tell a musician to do?','Be silent|Play louder|Play faster|Repeat forever',0,'A rest indicates a period of silence.'],
['Music','Which singer was known as the King of Rock and Roll?','Elvis Presley|Frank Sinatra|Johnny Cash|Ray Charles',0,'Elvis Presley earned that nickname.'],
['Music','How many musicians are in a quartet?','4|3|5|6',0,'A quartet has four performers.'],
['Music','Which family of instruments includes the trumpet?','Brass|Strings|Woodwind|Keyboard',0,'The trumpet belongs to the brass family.'],
['Music','Which symbol raises a musical note by a semitone?','Sharp|Flat|Rest|Clef',0,'A sharp raises a note by a semitone.'],
['Music','Which instrument typically has 88 keys?','Piano|Violin|Ukulele|Saxophone',0,'A standard full-size piano has 88 keys.'],
['Music','What does the musical term tempo describe?','Speed|Pitch|Volume|Instrument size',0,'Tempo describes the speed of the music.'],
['Music','Which instrument is associated with a bow and four strings?','Violin|Trumpet|Flute|Tuba',0,'A violin is commonly bowed and has four strings.'],
['World','What is the capital of France?','Paris|Rome|Madrid|Berlin',0,'Paris is the capital of France.'],
['World','On which continent are the pyramids at Giza?','Africa|Europe|South America|Australia',0,'The pyramids at Giza are in the African part of Egypt.'],
['World','What is the largest ocean on Earth?','Pacific|Atlantic|Indian|Arctic',0,'The Pacific is the largest ocean.'],
['World','Which country is home to the ancient city of Machu Picchu?','Peru|Mexico|Chile|Brazil',0,'Machu Picchu is in Peru.'],
['History','Who was the first president of the United States?','George Washington|Abraham Lincoln|John Adams|Thomas Jefferson',0,'George Washington was the first U.S. president.'],
['History','In which year did Apollo 11 land people on the Moon?','1969|1959|1979|1989',0,'Apollo 11 landed in July 1969.'],
['World','Which country is famous for the Great Barrier Reef?','Australia|Canada|Japan|Norway',0,'The Great Barrier Reef lies off Australia.'],
['World','Which city is home to the Colosseum?','Rome|Athens|Paris|London',0,'The Colosseum is in Rome.'],
['World','Which language is primarily spoken in Brazil?','Portuguese|Spanish|French|Italian',0,'Portuguese is the official language of Brazil.'],
['History','Which ancient civilization built the pyramids at Giza?','Egyptians|Romans|Vikings|Aztecs',0,'The pyramids at Giza were built by ancient Egyptians.'],
['World','Which U.S. state is known as the Aloha State?','Hawaii|Alaska|Florida|California',0,'Hawaii is nicknamed the Aloha State.'],
['World','What is the tallest land animal?','Giraffe|Elephant|Camel|Ostrich',0,'Giraffes are the tallest living land animals.']
];
export const BANK=rows.map(([category,text,choices,answer,explanation])=>({category,text,choices:choices.split('|'),answer,explanation}));
export const centralDay=(now)=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
export function resetAt(now){const day=centralDay(now);let low=now,high=now+27*3600000;while(high-low>1){const mid=Math.floor((low+high)/2);if(centralDay(mid)===day)low=mid;else high=mid}return new Date(high).toISOString()}
export function previousDay(day){return new Date(Date.parse(day+'T12:00:00Z')-86400000).toISOString().slice(0,10)}
export function dailyDeck(day){
 const dayIndex=Math.floor(Date.parse(day+'T00:00:00Z')/86400000),epochDays=Math.floor(BANK.length/5),epoch=Math.floor(dayIndex/epochDays),offset=((dayIndex%epochDays)+epochDays)%epochDays;
 let seed=2166136261;for(const c of String(epoch))seed=Math.imul(seed^c.charCodeAt(0),16777619);
 const rand=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296};
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 // Each epoch deals every question once before starting another shuffled bank.
 const selected=shuffle([...BANK]).slice(offset*5,offset*5+5);seed^=dayIndex;
 return shuffle(selected).map(q=>{const order=shuffle([0,1,2,3]);return {...q,choices:order.map(i=>q.choices[i]),answer:order.indexOf(q.answer)}})
}
export async function ensureDaily(db){for(const statement of [
 db.prepare('CREATE TABLE IF NOT EXISTS links_daily_profiles(owner TEXT PRIMARY KEY,id TEXT UNIQUE NOT NULL,name TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_daily_decks(day TEXT PRIMARY KEY,deck TEXT NOT NULL)'),
 db.prepare('CREATE TABLE IF NOT EXISTS links_daily_attempts(owner TEXT NOT NULL,day TEXT NOT NULL,id TEXT UNIQUE NOT NULL,version INTEGER NOT NULL,state TEXT NOT NULL,score INTEGER NOT NULL DEFAULT 0,completed INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(owner,day))'),
 db.prepare('CREATE INDEX IF NOT EXISTS links_daily_ranking ON links_daily_attempts(day,completed,score)')
])await statement.run()}
