import {playoffNavigation} from './cfp-navigation.mjs?v=1';
import {hostedMode,hostedAdmin,eventHeaders,mountHostedEvent,shareHostedEvent} from './hosted-cfp.mjs?v=challenge-share2';
import {mountBracket} from './cfp-bracket-ui.mjs?v=pool-results1';
import {SLOTS,participants,BRACKET_RULES,bracketStandings,cleanBracket} from './cfp-bracket-core.mjs?v=pool-return1';
import {cfpSeason} from './cfp-core.mjs';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const q=new URLSearchParams(location.search),demo=q.get('demo')==='1';let selected={};try{selected=JSON.parse(localStorage.getItem('links-current-pool')||'{}')}catch{}
let pool=q.get('pool')||selected.id;const token=()=>localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token');let season=Number(q.get('season')||q.get('returnSeason'))||cfpSeason(),view='picks',data,busy=false,demoEntry=null,demoFinal=false,demoSnapshot=null;const practiceKey='links-cfp-practice-v3';

$('cfpContenders').closest('main').querySelector('.workspace').after($('cfpContenders'));
if(demo||(pool&&!hostedMode))$('hostedEvent').hidden=true;
if(demo){const back=$('cfpBack'),nav=playoffNavigation(q,{season});back.href=nav.returnHref;back.textContent=nav.returnLabel;}
$('rules').textContent=BRACKET_RULES;$('demoNotice').hidden=!demo;
for(let y=season-2;y<=season+1;y++)$('season').add(new Option(y+'-'+String(y+1).slice(-2),y));$('season').value=season;
function fixture(){
 const teams=demoSnapshot.teams;
 const config={teams,revision:1,deadline:new Date(Date.now()+86400000).toISOString(),locked:demoFinal},actual={},games=SLOTS.map(s=>{const ids=participants(s,actual,teams);actual[s.id]={team:ids[0]};return {id:s.id,title:['CFP First Round','CFP Quarterfinal','CFP Semifinal','CFP National Championship'][s.round],start:config.deadline,home:{...teams.find(t=>t.id===ids[0]),score:demoFinal?28:null},away:{...teams.find(t=>t.id===ids[1]),score:demoFinal?24:null},final:demoFinal,winner:demoFinal?ids[0]:null,status:demoFinal?'Final':'Scheduled'}});
 const entries=demoEntry?[demoEntry]:[];return {player:'You',admin:true,available:true,games,bracket:{config,locked:demoFinal,setupLocked:!!demoEntry,entry:demoEntry,shared:demoFinal?entries:[],standings:bracketStandings(['You','Demo Rival'],entries,teams,games,demoFinal)}};
}
async function api(body,counts=false){
 if(demo){if(body?.action==='bracketSave'){demoEntry={player:'You',picks:structuredClone(body.picks),guess:body.guess,winningGuess:body.winningGuess,submitted:body.submit,version:(demoEntry?.version||0)+1};try{localStorage.setItem(practiceKey,JSON.stringify({date:demoSnapshot.date,entry:demoEntry}))}catch{throw Error('Your browser could not save this practice bracket. Check its storage settings.')}return {ok:true}}throw Error('Setup changes are disabled in the demo.');}
 const r=await fetch('./api/cfp?'+new URLSearchParams({pool,season,...(counts?{counts:1}:{})}),{method:body?'POST':'GET',headers:hostedMode?eventHeaders():{Authorization:'Bearer '+token(),'Content-Type':'application/json'},cache:'no-store',signal:AbortSignal.timeout(20000),...(body?{body:JSON.stringify({pool,season,...body})}:{})}),j=await r.json();if(!r.ok)throw Error(j.error||'Unable to complete this request.');return j;
}
function renderCounts(data){$('cfpCounts').innerHTML='<span><strong>'+Number(data.playerCount??data.bracket?.standings?.rows.length??0)+'</strong> joined</span><span><strong>'+Number(data.entryCount??data.bracket?.standings?.rows.filter(r=>r.submitted).length??0)+'</strong> entered</span>';}

function render(){
 const field=$('cfpContenders'),confirmed=!demo&&data.bracket?.config?.teams;field.hidden=!confirmed;
 if(confirmed){field.innerHTML='<div class="contender-title"><h2>OFFICIAL PLAYOFF LINEUP</h2><p>The confirmed tournament seeds.</p></div><ol class="cfp-team-standings">'+confirmed.map(t=>'<li><span class="cfp-team-rank">#'+t.seed+'</span><img src="'+esc(t.logo)+'" alt="" width="28" height="28"><span class="cfp-team-full">'+esc(t.name)+'</span><abbr class="cfp-team-short" title="'+esc(t.name)+'">'+esc(t.name.slice(0,4).toUpperCase())+'</abbr><span class="cfp-team-record">'+esc(t.record||'')+'</span></li>').join('')+'</ol>';}else field.replaceChildren();
 $('identity').textContent=(demo?'Practice bracket — example teams, not the official field':selected.name||'College playoff pool')+(hostedMode?'': ' — '+data.player);
 if(hostedMode){$('identity').textContent='Your bracket · '+data.player;$('identity').title=selected.name||'LINKS College Playoff Challenge';}
 renderCounts(data);
 const views={picks:'Full bracket',scores:demo?'Sample results':'Live scores',standings:'Leaderboard',compare:'Everyone’s picks'};$('tabs').innerHTML=Object.entries(views).map(([key,label])=>'<button data-view="'+key+'" class="'+(view===key?'active':'')+'">'+label+'</button>').join('');$('tabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(busy)return;view=b.dataset.view;render()});
 if(!demo&&data.admin&&!hostedMode){const share=document.createElement('button');share.type='button';share.textContent='Share pool';share.onclick=async()=>{share.disabled=true;try{await (await import('./invite-qr.mjs')).openInviteQR(pool)}catch(error){$('message').textContent=error.message}finally{share.disabled=false}};$('tabs').append(share);}
 const accessPanel=$('playerAccess');accessPanel.hidden=demo||!data.admin||hostedMode;
 if(!accessPanel.hidden){
  accessPanel.innerHTML='<details><summary>Manage player access</summary><p>Unlock each player when they are ready to enter this playoff pool. Access applies to this season only. Unlocking does not extend the first-kickoff deadline.</p><div class="table-wrap"><table><thead><tr><th>Player</th><th>Access</th><th>Action</th></tr></thead><tbody>'+(data.access?.players||[]).map((p,i)=>'<tr><td>'+esc(p.name)+'</td><td>'+(p.unlocked?'Unlocked':'Waiting for commissioner')+'</td><td><button type="button" data-access-index="'+i+'">'+(p.unlocked?'Lock picks':'Unlock picks')+'</button></td></tr>').join('')+'</tbody></table></div><p id="accessStatus" role="status"></p></details>';
  accessPanel.querySelectorAll('[data-access-index]').forEach(button=>button.onclick=async()=>{
   const player=data.access.players[Number(button.dataset.accessIndex)];
   accessPanel.querySelectorAll('button').forEach(b=>b.disabled=true);
   try{await api({action:'playerAccess',player:player.name,unlocked:!player.unlocked});await load();accessPanel.querySelector('details').open=true;accessPanel.querySelector('#accessStatus').textContent=player.name+' — picks '+(player.unlocked?'locked.':'unlocked.');}
   catch(error){accessPanel.querySelector('#accessStatus').textContent=error.message;accessPanel.querySelectorAll('button').forEach(b=>b.disabled=false);}
  });
 }
 if(mountBracket({root:$('content'),data,view,api,reload:load,demo,navigation:playoffNavigation(q,{pool,season}),showPicks:player=>{view='compare';$('content')._comparePlayer=player;render();}}))return;
 if(!demo&&!data.bracket?.config){$('content').innerHTML='<h2>Waiting for the official lineup</h2><p>The confirmed teams and schedule will appear automatically.</p>';return;}
 $('content').innerHTML='<h2>'+(demo?'Simulated playoff results':'Official playoff results')+'</h2>'+(data.games.length?data.games.map(g=>'<article class="cfp-entry"><h3>'+esc(g.title)+'</h3><p>'+esc(g.away.name)+' '+esc(g.away.score??'')+' vs. '+esc(g.home.name)+' '+esc(g.home.score??'')+'</p><p>'+esc(g.status)+' · '+(demo?'Practice matchup':esc(new Date(g.start).toLocaleString()))+'</p></article>').join(''):'<p>No playoff schedule is posted yet.</p>')+(demo?'<button id="demoResults">'+(demoFinal?'Reset demo results':'Simulate final results')+'</button>':'');
 if($('demoResults'))$('demoResults').onclick=()=>{demoFinal=!demoFinal;void load()};
}
async function load(){
 if(busy)return;busy=true;$('message').textContent='Loading playoff bracket…';
 try{
  if(demo&&!demoSnapshot){
   demoSnapshot={date:'seed-preview-v1',teams:[['Georgia',61],['Utah',254],['Texas',251],['Notre Dame',87],['Tennessee',2633],['Alabama',333],['Miami',2390],['Wake Forest',154],['UCLA',26],['BYU',252],['Texas Tech',2641],['Oregon',248]].map(([name,logoId],i)=>({id:'practice-seed-'+(i+1),seed:i+1,name,record:'Practice',logo:'./assets/cfp-practice/'+logoId+'.png'}))};
   try{const saved=JSON.parse(localStorage.getItem(practiceKey)||'null');if(saved?.date===demoSnapshot.date&&saved.entry)demoEntry={...saved.entry,picks:cleanBracket(saved.entry.picks,demoSnapshot.teams)};}catch{}
   $('demoNotice').textContent='PRACTICE ONLY — example teams. Saves stay on this device.';$('season').disabled=true;
  }
  data=demo?fixture():await api();render();$('message').textContent=data.warning||'';
 }catch(error){$('message').textContent=error.message;$('content').querySelectorAll('button,select,input').forEach(b=>b.disabled=true)}finally{busy=false}
}
$('refresh').onclick=()=>void load();$('season').onchange=()=>{if(busy){$('season').value=season;return}season=Number($('season').value);demoEntry=null;demoFinal=false;void load()};
if(hostedMode)void mountHostedEvent($('hostedEvent'),async event=>{pool=event.id;season=event.season;selected={name:event.name};$('season').value=season;$('season').disabled=true;await load()});else if(demo||(pool&&token()))void load();else $('message').innerHTML='Sign in through <a href="./control-center.html">your Locker Room</a>, or <a href="'+esc(playoffNavigation(q,{pool,season}).practiceHref)+'">try the demo</a>.';
const timer=setInterval(()=>{if(!demo&&data?.bracket?.config&&Date.now()>=Date.parse(data.bracket.config.deadline)){data.bracket.locked=true;$('content').querySelectorAll('#bracketSave button,#bracketSave input,#championshipGuess,#championshipWinnerGuess,[data-slot] button,[data-slot] select').forEach(b=>b.disabled=true);const note=$('bracketStatus');if(note)note.textContent='The entire bracket is locked. No more edits can be saved.';}},1000);
const countTimer=setInterval(()=>{if(!demo&&data&&!busy&&!document.hidden)void api(null,true).then(renderCounts).catch(()=>{})},30000);window.addEventListener('pagehide',e=>{if(!e.persisted)clearInterval(countTimer)},{once:true});
const refreshTimer=setInterval(()=>{if(!document.hidden&&!busy&&data&&(['scores','standings','compare'].includes(view)||!data?.bracket?.config||data?.access?.unlocked===false))void load()},60000);window.addEventListener('pagehide',e=>{if(!e.persisted){clearInterval(timer);clearInterval(refreshTimer)}},{once:true});

// Official Selection Day broadcast start; this is not the bracket entry deadline.
function updateFieldCountdown(){
 const el=$('fieldCountdown');if(!el)return;
 el.hidden=season!==2026||(!demo&&!!data?.bracket?.config);if(el.hidden)return;
 const left=Date.parse('2026-12-06T12:00:00-05:00')-Date.now();
 const label=$('fieldCountdownClock');if(left<=0){label.textContent=left>-10800000?'Selection show is underway — awaiting the official field':'Awaiting the confirmed official field';return;}
 const seconds=Math.floor(left/1000),days=Math.floor(seconds/86400),hours=Math.floor(seconds%86400/3600),minutes=Math.floor(seconds%3600/60);
 label.textContent=days+'d '+hours+'h '+minutes+'m '+seconds%60+'s';
}
updateFieldCountdown();const fieldCountdownTimer=setInterval(updateFieldCountdown,1000);
window.addEventListener('pagehide',e=>{if(!e.persisted)clearInterval(fieldCountdownTimer)},{once:true});
