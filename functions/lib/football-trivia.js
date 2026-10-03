// Original LINKS questions. Answers checked against linked primary sources, October 2026.
const R='https://operations.nfl.com/rules-officiating/nfl-football-basics/football-terms';
const P='https://www.profootballhof.com/teams/green-bay-packers/team-facts';
const B='https://www.profootballhof.com/teams/chicago-bears/team-facts';
const S='https://www.profootballhof.com/teams/pittsburgh-steelers/team-facts';
const K='https://www.profootballhof.com/teams/kansas-city-chiefs/team-facts';
const rows=[
['easy','A touchdown is worth how many points before the try?','6','3','7','2',R],
['easy','A field goal is worth how many points?','3','1','2','6',R],
['easy','How many points does a safety award?','2','1','3','6',R],
['easy','Who usually receives the snap to direct the offense?','Quarterback','Cornerback','Safety','Defensive tackle',R],
['easy','What is a defender catching an opponent’s pass called?','Interception','Punt','Snap','Touchback',R],
['easy','Which action starts a play from scrimmage?','Snap','Tackle','Fair catch','Field goal',R],
['easy','Which team won Super Bowl I?','Packers','Chiefs','Bears','Steelers',P],
['easy','Which Bears legend wore number 34?','Walter Payton','Gale Sayers','Mike Ditka','Dick Butkus',B],
['easy','Which team’s retired number 15 belongs to Bart Starr?','Packers','Bears','Chiefs','Steelers',P],
['easy','Which Steelers legend wore number 32?','Franco Harris','Joe Greene','Hines Ward','Terry Bradshaw',S],
['easy','Len Dawson’s number 16 was retired by which team?','Chiefs','Packers','Bears','Steelers',K],
['easy','Which Bears star wore number 51?','Dick Butkus','Walter Payton','Gale Sayers','Mike Ditka',B],
['medium','Who lost to Green Bay in Super Bowl I?','Chiefs','Raiders','Colts','Jets',P],
['medium','Chicago beat which team in Super Bowl XX?','Patriots','Dolphins','Raiders','Broncos',B],
['medium','Which team lost to Pittsburgh in Super Bowl IX?','Vikings','Cowboys','Rams','Raiders',S],
['medium','Before becoming the Chiefs, the franchise was called what?','Dallas Texans','Houston Oilers','Dallas Cowboys','Kansas City Blues',K],
['medium','What was Pittsburgh’s original NFL nickname?','Pirates','Steelers','Ironmen','Panthers',S],
['medium','What nickname did the Bears use when founded in Decatur?','Staleys','Cardinals','Bulldogs','Tigers',B],
['medium','In which year did the Chiefs move to Kansas City?','1963','1960','1966','1970',K],
['medium','Which team won the NFL championship in 1929?','Packers','Bears','Giants','Cardinals',P],
['medium','Who wore Green Bay’s retired number 92?','Reggie White','Ray Nitschke','Don Hutson','Tony Canadeo',P],
['medium','Who wore Pittsburgh’s retired number 75?','Joe Greene','Franco Harris','Ernie Stautner','Jack Lambert',S],
['medium','Who wore Chicago’s retired number 40?','Gale Sayers','Walter Payton','Brian Piccolo','Red Grange',B],
['medium','Who wore Kansas City’s retired number 58?','Derrick Thomas','Bobby Bell','Willie Lanier','Buck Buchanan',K],
['hard','Who was Green Bay’s first NFL draft selection?','Russ Letlow','Don Hutson','Tony Canadeo','Cecil Isbell',P],
['hard','Who first rushed for 1,000 yards in a Packers season?','Tony Canadeo','Jim Taylor','Ahman Green','John Brockington',P],
['hard','Who first passed for 400 yards in a Packers game?','Don Horn','Bart Starr','Lynn Dickey','Cecil Isbell',P],
['hard','Who was Chicago’s first draft selection in 1936?','Joe Stydahar','George Musso','Dan Fortmann','Clyde Turner',B],
['hard','Who gained 1,004 rushing yards for Chicago in 1934?','Beattie Feathers','Bronko Nagurski','Red Grange','George McAfee',B],
['hard','Whose contract did Chicago buy from Rock Island in 1922?','Ed Healey','George Trafton','Hunk Anderson','Guy Chamberlin',B],
['hard','Who was Pittsburgh’s first draft choice in 1936?','Bill Shakespeare','Byron White','Johnny Blood','Walt Kiesling',S],
['hard','Who scored Pittsburgh’s first regular-season touchdown?','Martin Kottler','Warren Heller','John McNally','Bill Shakespeare',S],
['hard','Who first rushed for 1,000 yards in a Steelers season?','John Henry Johnson','Franco Harris','Joe Geri','Dick Hoak',S],
['hard','Which team lost the 1962 AFL title game to the Dallas Texans?','Houston Oilers','San Diego Chargers','Oakland Raiders','Boston Patriots',K],
['hard','Who wore Kansas City’s retired number 33?','Stone Johnson','Mack Lee Hill','Abner Haynes','Emmitt Thomas',K],
['hard','Who wore Kansas City’s retired number 36?','Mack Lee Hill','Stone Johnson','Bobby Bell','Willie Lanier',K]
];
export const QUESTIONS=rows.map((r,i)=>({id:'f'+i,difficulty:r[0],text:r[1],answers:r.slice(2,6),source:r[6]}));
export const SECONDS={easy:6,medium:8,hard:10};
export const POINTS={easy:10,medium:20,hard:40};
export function shuffled(values){return [...values].map(v=>({v,n:crypto.getRandomValues(new Uint32Array(1))[0]})).sort((a,b)=>a.n-b.n).map(x=>x.v)}
export function weekKey(now=Date.now()){const d=new Date(now);d.setUTCHours(0,0,0,0);d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return d.toISOString().slice(0,10)}
export function publicAttempt(a){const deck=JSON.parse(a.deck),item=deck[a.idx],q=item&&QUESTIONS.find(q=>q.id===item.id);return {id:a.id,week:a.week,difficulty:a.difficulty,score:a.score,correct:a.correct,misses:a.misses,play:a.idx+1,status:a.status,version:a.version,deadline:a.deadline,serverNow:Date.now(),question:a.status==='active'&&q?{text:q.text,choices:item.order.map(i=>q.answers[i])}:null};}
export function speedBonus(difficulty,deadline,now){return Math.floor((POINTS[difficulty]/2)*Math.max(0,Math.min(1,(deadline-now)/(SECONDS[difficulty]*1000))));}
export function grade(a,choice,now){const deck=JSON.parse(a.deck),item=deck[a.idx],q=QUESTIONS.find(q=>q.id===item.id);const correct=now<=a.deadline&&Number.isInteger(choice)&&choice>=0&&choice<4&&item.order[choice]===0;const bonus=correct?speedBonus(a.difficulty,a.deadline,now):0,earned=correct?POINTS[a.difficulty]+bonus:0;const idx=a.idx+1,misses=correct?0:a.misses+1;return {idx,score:a.score+earned,correct:a.correct+(correct?1:0),misses,status:idx===10||misses>=4?'complete':'active',feedback:{correct,earned,bonus,answer:q.answers[0],source:q.source,timedOut:now>a.deadline}};}
