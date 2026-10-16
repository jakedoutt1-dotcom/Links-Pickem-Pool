import {fairPlayText} from './trivia-fair-play.mjs?v=teams1';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountRoomExtras({act,refreshJoin}){
 const $=id=>document.getElementById(id);let joinInfo=null,hostSignature='',lastQuestion='';
 function joinFields(){
  const create=$('teamJoinAction').value==='create';
  $('newTeamField').hidden=!create;$('existingTeamFields').hidden=create;
  $('newTeamName').required=!!joinInfo?.teamPlay&&create;
  $('joinTeamId').required=$('joinTeamCode').required=!!joinInfo?.teamPlay&&!create;
  $('newTeamName').disabled=!joinInfo?.teamPlay||!create;
  $('joinTeamId').disabled=$('joinTeamCode').disabled=!joinInfo?.teamPlay||create;
 }
 $('teamJoinAction').onchange=joinFields;
 $('refreshTeams').onclick=async()=>{const button=$('refreshTeams');button.disabled=true;try{prepareJoin(await refreshJoin(),true)}catch(e){$('quickJoinMessage').textContent=e.message}finally{button.disabled=false}};
 function prepareJoin(info,refresh=false){
  joinInfo=info;$('teamJoinFields').hidden=!info.teamPlay;
  $('quickNameLabel').textContent=info.mode==='teams'&&!info.teamPlay?'Team name':'Your name';
  $('quickName').placeholder=info.mode==='teams'&&!info.teamPlay?'Choose your team name':'Your name for tonight';
  $('quickJoinHelp').textContent=info.teamPlay?'Create your team to become captain, or join your captain’s team. Everyone uses their own phone; the captain submits one team answer.':info.mode==='teams'?'Use one phone for your whole team. Talk through each question and submit one answer together.':'Enter your name to join. No LINKS account needed.';
  const selected=$('joinTeamId').value;
  $('joinTeamId').innerHTML='<option value="">Choose your team</option>'+(info.teams||[]).map(t=>`<option value="${esc(t.id)}">${esc(t.name)} · ${t.members} joined</option>`).join('');
  if((info.teams||[]).some(t=>t.id===selected))$('joinTeamId').value=selected;
  if(!refresh)$('teamJoinAction').value=info.teams?.length?'join':'create';
  joinFields();
  $('joinFairPlayText').textContent=fairPlayText(info.fairPlay);
  const enabled=['warn','strict'].includes(info.fairPlay);$('fairPlayAgreement').hidden=!enabled;$('acceptFairPlay').required=enabled;
  if(!refresh)$('acceptFairPlay').checked=false;
 }
 function joinData(){
  if(!joinInfo)throw Error('Room details could not load. Refresh the team list or reopen the invitation.');
  return {...(joinInfo.teamPlay?{teamAction:$('teamJoinAction').value,teamName:$('newTeamName').value.trim(),teamId:$('joinTeamId').value,teamCode:$('joinTeamCode').value.trim()}:{}),fairPlayAccepted:$('acceptFairPlay').checked};
 }
 function render(s){
  if(s.host&&s.phase==='lobby')$('lobbyJoinHelp').textContent=s.teamPlay?'Everyone scans this QR code on their own phone. Create a team or join with your captain’s team code. No account needed.':s.mode==='teams'?'Scan this QR code and enter your team name. This room uses one phone per team. No account needed.':'Scan this QR code and enter your name. Use one phone per player. No account needed.';
  const team=s.team;$('teamPanel').hidden=!team;$('hostTeams').hidden=!s.host||!s.teamPlay;
  if(team){
   const question=s.code+':'+s.game+':'+s.index;
   if(s.phase==='question'&&question!==lastQuestion){lastQuestion=question;$('teamPanel').open=false;}
   $('myTeamHeading').textContent=team.name+' · '+(team.isCaptain?'You are captain':'Teammate');
   $('myTeamRole').textContent=team.isCaptain?'Share this team code with your teammates. You choose and submit the final answer.':'Captain: '+team.captainName+'. Tap answers to recommend them privately. Your captain sees the percentages.';
   $('myTeamCode').textContent=team.isCaptain?'Team code: '+team.code:'';
   $('copyTeamCode').hidden=!team.isCaptain;$('copyTeamCode').onclick=async()=>{try{await navigator.clipboard.writeText(team.code);$('teamCopyStatus').textContent='Team code copied.'}catch{$('teamCopyStatus').textContent='Team code: '+team.code}};
   $('myTeamMembers').textContent=team.members.map(m=>m.name+(m.captain?' (captain)':'')).join(' · ');
  }
  const hostNext=JSON.stringify(s.teamRoster||[]);
  if(s.host&&s.teamPlay&&hostNext!==hostSignature){
   hostSignature=hostNext;$('teamCaptainList').innerHTML=(s.teamRoster||[]).map(t=>`<div class="team-captain-row"><label>${esc(t.name)}<select data-captain-team="${esc(t.id)}">${t.members.map(m=>`<option value="${esc(m.id)}" ${m.id===t.captain?'selected':''}>${esc(m.name)}</option>`).join('')}</select></label><button type="button" data-assign-team="${esc(t.id)}">Set captain</button></div>`).join('')||'<p>No teams yet.</p>';
   $('teamCaptainList').querySelectorAll('[data-assign-team]').forEach(button=>button.onclick=()=>act('change-captain',{teamId:button.dataset.assignTeam,memberId:[...$('teamCaptainList').querySelectorAll('select')].find(select=>select.dataset.captainTeam===button.dataset.assignTeam).value}));
  }
  const tally=team?.isCaptain&&s.question?team.recommendations:null;$('teamRecommendations').hidden=!tally;
  $('answers').classList.toggle('team-choices',!!tally);
  for(const button of $('answers').querySelectorAll('[data-choice]')){
   let badge=button.querySelector('.answer-recommendation');
   if(!tally){badge?.remove();continue;}
   if(!badge){badge=document.createElement('span');badge.className='answer-recommendation';button.append(badge);}
   const i=Number(button.dataset.choice),count=tally.counts[i];
   badge.textContent=tally.percentages[i]+'%';badge.setAttribute('aria-label',`${count} teammate vote${count===1?'':'s'}, ${tally.percentages[i]} percent`);
  }
  if(tally)$('recommendCount').textContent=`Teammate votes: ${tally.voted} / ${tally.eligible}`;
  $('fairPlayRoom').hidden=s.host||s.fairPlay==='off';
  if(!s.host){const notice=s.fairNotice;$('fairPlayRoom').textContent=notice&&!notice.excused?'Fair Play: leaving the page during question '+(notice.index+1)+' was reported to the host. '+(s.fairLocked?'Your saved answer or recommendation is locked. Ask the host about an accidental interruption.':'An interruption is not proof of cheating.'):notice?.excused?'Fair Play: the host excused your interruption.':'Fair Play · '+(s.fairPlay==='strict'?'Strict mode: stay on this page while answering. Leaving locks your saved answer or recommendation.':'Stay on this page while answering. Leaving during a question may notify the host.');}
  $('fairPlayHost').hidden=!s.host||s.fairPlay==='off';
  if(s.host){
   const events=(s.fairEvents||[]).filter(e=>!e.excused);$('fairPlayHostTitle').textContent='Fair Play · '+events.length+' notice'+(events.length===1?'':'s');
   $('fairPlayEvents').innerHTML=events.slice(-20).reverse().map(e=>`<li><span><strong>${esc(e.name)}</strong>${e.teamName?' · '+esc(e.teamName):''}<br>Game ${e.game} · Question ${e.index+1}${e.strict?' · Selection locked':''}</span><button type="button" data-excuse="${esc(e.id)}">Excuse interruption</button></li>`).join('')||'<li>No notices.</li>';
   $('fairPlayEvents').querySelectorAll('[data-excuse]').forEach(b=>b.onclick=()=>act('fair-play-excuse',{eventId:b.dataset.excuse}));
  }
 }
 function tick(s,seconds,waiting){
  if(s.teamPlay&&!s.host&&s.team){
   if(!s.team.isCaptain)$('submitAnswer').hidden=true;
   else $('submitAnswer').textContent=s.submitted?'Team answer submitted ✓':'Submit team answer';
   if(['reveal','ended'].includes(s.phase))$('answerNote').textContent=(s.team.answerChoice===null?'Your team did not select an answer.':'Team answer: '+ 'ABCD'[s.team.answerChoice]+'.')+' Scores are updated.';
   if(s.phase==='question'&&!waiting){
    if(s.teamLocked)$('answerNote').textContent='The captain’s selection is locked by Fair Play. The host can excuse an accidental interruption.';
    else if(s.fairLocked)$('answerNote').textContent='Your recommendation is locked by Fair Play. Your teammates can keep playing.';
    else if(s.submitted)$('answerNote').textContent='Your captain submitted the final team answer. Recommendations are closed.';
    else if(!s.eligible)$('answerNote').textContent='You joined during this question. You can play from the next question.';
    else if(!s.team.isCaptain)$('answerNote').textContent=seconds===0?'Recommendations closed. Your captain’s selected answer counts.':s.choice===null?'Tap an answer to recommend it. Only your captain sees the team percentages.':'Recommendation saved. You can change it until your captain submits or time runs out.';
   }
  }else if(s.fairLocked&&s.phase==='question'&&!waiting)$('answerNote').textContent='Your saved answer is locked by Fair Play. Ask the host to excuse an accidental interruption.';
 }
 return {prepareJoin,joinData,render,tick};
}
