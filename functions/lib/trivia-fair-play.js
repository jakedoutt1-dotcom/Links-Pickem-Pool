import {isTeamPlay,triviaParticipant,currentLock,triviaError} from './trivia-team-play.js';
export const fairPlayMode=s=>['warn','strict'].includes(s.fairPlay)?s.fairPlay:'off';
export function fairPlayView(s,seat,host){
 const p=triviaParticipant(s,seat),last=p?.fairLast;
 return {fairPlay:fairPlayMode(s),fairLocked:currentLock(s,p?.fairLock),...(p?{fairIdentity:seat,fairNotice:last?.game===s.game?{index:last.index,strict:last.strict,excused:!!last.excused}:null}:{}),...(host?{fairEvents:(s.fairEvents||[]).map(({id,name,teamName,game,index,at,strict,excused})=>({id,name,teamName,game,index,at,strict,excused:!!excused}))}:{})};
}
export function reportFairLeave(s,seat,b,now){
 const p=triviaParticipant(s,seat),team=isTeamPlay(s)?s.players[p?.team]:null,target=team||p;
 if(!p)triviaError('Join this room first.',401);
 if(fairPlayMode(s)==='off'||s.phase!=='question'||now<(s.startsAt||0)||now>=s.deadline||b.gameNumber!==s.game||b.index!==s.index||p.eligible>s.index||target.eligible>s.index||target.answer?.index===s.index&&target.answer.submitted||currentLock(s,p.fairLast))return false;
 const strict=fairPlayMode(s)==='strict',lock={game:s.game,index:s.index,member:seat};
 p.fairLast={...lock,strict};
 if(strict){p.fairLock=lock;if(team?.captain===seat)team.fairLock=lock;}
 // One report per participant/question, bounded room history, private to host.
 s.fairEvents=[...(s.fairEvents||[]),{id:crypto.randomUUID(),member:seat,team:p.team||null,name:p.name,teamName:team?.name||'',game:s.game,index:s.index,at:now,strict}].slice(-200);
 return true;
}
export function excuseFairLeave(s,b,now){
 const event=(s.fairEvents||[]).find(e=>e.id===b.eventId);
 if(!event)triviaError('That Fair Play notice is no longer available.',404);
 event.excused=true;
 const p=triviaParticipant(s,event.member),team=isTeamPlay(s)?s.players[event.team]:null;
 if(p?.fairLast?.game===event.game&&p.fairLast.index===event.index)p.fairLast.excused=true;
 // Never reopen a past question or undo a final submitted answer.
 if(event.game===s.game&&event.index===s.index&&s.phase==='question'&&now<s.deadline){
  if(currentLock(s,p?.fairLock))delete p.fairLock;
  if(currentLock(s,team?.fairLock)&&team.fairLock.member===event.member)delete team.fairLock;
 }
}
