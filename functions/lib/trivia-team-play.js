export const isTeamPlay=s=>s.mode==='teams'&&s.teamPlay===1;
export const triviaParticipant=(s,id)=>(isTeamPlay(s)?s.members:s.players)?.[id];
export const currentLock=(s,lock)=>lock?.game===s.game&&lock.index===s.index;
export function triviaError(message,status=400){throw Object.assign(Error(message),{publicTrivia:true,status});}
const roster=(s,team)=>Object.entries(s.members||{}).filter(([,p])=>p.team===team);
export function teamList(s){return Object.entries(s.players).map(([id,p])=>({id,name:p.name,members:roster(s,id).length}));}

export function joinTeam(s,b,id){
 const name=String(b.name||'').trim();
 if(!name||name.length>32)triviaError('Enter your name, up to 32 characters.');
 if(Object.keys(s.members).length>=200)triviaError('This room is full (200 people, including captains).',409);
 let team;
 if(b.teamAction==='create'){
  const teamName=String(b.teamName||'').trim();
  if(!teamName||teamName.length>32)triviaError('Enter a team name, up to 32 characters.');
  if(Object.values(s.players).some(p=>p.name.toLowerCase()===teamName.toLowerCase()))triviaError('That team name is taken. Join that team or choose another name.',409);
  team=crypto.randomUUID();
  s.players[team]={name:teamName,score:0,eligible:s.index+1,answer:null,captain:id,joinCode:String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,'0')};
 }else if(b.teamAction==='join'){
  team=String(b.teamId||'');
  if(!Object.hasOwn(s.players,team)||String(b.teamCode||'').trim()!==s.players[team].joinCode)triviaError('Check the team and its 6-digit code with your captain.',403);
  if(roster(s,team).some(([,p])=>p.name.toLowerCase()===name.toLowerCase()))triviaError('Someone on this team has that name. Add an initial or choose another name.',409);
 }else triviaError('Choose Create a team or Join a team.');
 s.members[id]={name,team,eligible:s.index+1,vote:null};
}

export function teamAnswer(s,seat,b,now,elapsed){
 const member=s.members[seat],team=member&&s.players[member.team];
 if(!team)triviaError('Join a team first.',401);
 const captain=team.captain===seat,recommend=b.action==='recommend';
 if(recommend===captain)triviaError(captain?'Choose the final team answer on your captain screen.':'Only your captain can submit the team answer. Tap an answer to recommend it.',403);
 if(s.phase!=='question'||now<(s.startsAt||0)||now>=s.deadline||b.gameNumber!==s.game||b.index!==s.index||member.eligible>s.index||team.eligible>s.index||team.answer?.index===s.index&&team.answer.submitted||currentLock(s,team.fairLock)||currentLock(s,member.fairLock))triviaError('Answer locked. Wait for the next question.',409);
 if(!Number.isInteger(b.choice)||b.choice<0||b.choice>3)triviaError('Choose an answer.');
 if(recommend){member.vote={index:s.index,choice:b.choice};return;}
 if(b.action==='submit-answer'&&(team.answer?.index!==s.index||team.answer.choice!==b.choice))triviaError('Choose your answer before submitting.',409);
 if(b.action==='submit-answer'||team.answer?.index!==s.index||team.answer.choice!==b.choice)team.answer={index:s.index,choice:b.choice,submitted:b.action==='submit-answer',elapsed};
}

export function changeCaptain(s,b,now){
 if(!isTeamPlay(s))triviaError('This room does not use team captains.');
 const member=s.members[b.memberId],team=member&&s.players[member.team];
 if(!team||member.team!==b.teamId)triviaError('Choose a player from that team.');
 if(s.phase==='question'&&now<s.deadline&&member.eligible>s.index)triviaError('This player can become captain after the current question.',409);
 // Existing team selection, submission and Fair Play lock survive a transfer.
 team.captain=b.memberId;
}

export function teamView(s,seat,host){
 if(!isTeamPlay(s))return {};
 const data={teamPlay:true,participantCount:Object.keys(s.members).length};
 if(host)return {...data,teamRoster:Object.entries(s.players).map(([id,t])=>({id,name:t.name,captain:t.captain,members:roster(s,id).map(([id,m])=>({id,name:m.name}))}))};
 const member=s.members[seat],team=member&&s.players[member.team];
 if(!team)return data;
 const captain=team.captain===seat,submitted=team.answer?.index===s.index&&team.answer.submitted===true;
 const teammates=roster(s,member.team).filter(([id,m])=>id!==team.captain&&m.eligible<=s.index);
 const votes=[0,0,0,0];for(const [,m] of teammates)if(m.vote?.index===s.index)votes[m.vote.choice]++;
 const voted=votes.reduce((a,b)=>a+b,0);
 return {...data,team:{id:member.team,name:team.name,memberName:member.name,isCaptain:captain,captainName:s.members[team.captain]?.name||'Captain',members:roster(s,member.team).map(([id,m])=>({name:m.name,captain:id===team.captain})),...(['reveal','ended'].includes(s.phase)?{answerChoice:team.answer?.index===s.index?team.answer.choice:null}:{}),...(captain?{code:team.joinCode,recommendations:{counts:votes,percentages:votes.map(n=>voted?Math.round(n/voted*100):0),voted,eligible:teammates.length}}:{})},
  choice:captain?(team.answer?.index===s.index?team.answer.choice:null):(member.vote?.index===s.index?member.vote.choice:null),submitted,teamLocked:currentLock(s,team.fairLock),eligible:member.eligible<=s.index&&team.eligible<=s.index};
}
