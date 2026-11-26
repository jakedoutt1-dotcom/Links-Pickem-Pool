import {mountCfpContenders} from './cfp-contenders.mjs?v=standings2';
import {mountBracket} from './cfp-bracket-ui.mjs?v=autofield1';
import {SLOTS,participants,BRACKET_RULES,bracketStandings} from './cfp-bracket-core.mjs?v=autofield1';
import {cfpSeason} from './cfp-core.mjs';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const q=new URLSearchParams(location.search),demo=q.get('demo')==='1';let selected={};try{selected=JSON.parse(localStorage.getItem('links-current-pool')||'{}')}catch{}
const pool=q.get('pool')||selected.id,token=()=>localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token');let season=cfpSeason(),view='picks',data,busy=false,demoEntry=null,demoFinal=false;
void mountCfpContenders($('cfpContenders'));
$('rules').textContent=BRACKET_RULES;$('demoNotice').hidden=!demo;
for(let y=season-2;y<=season+1;y++)$('season').add(new Option(y+'-'+String(y+1).slice(-2),y));$('season').value=season;
function fixture(){
 const teams=['Georgia','Utah','Texas','Notre Dame','Tennessee','Alabama','Miami','Wake Forest','UCLA','BYU','Texas Tech','Oregon'].map((name,i)=>({id:String(i+1),seed:i+1,name,record:'Demo',logo:''}));
 const config={teams,revision:1,deadline:new Date(Date.now()+86400000).toISOString(),locked:demoFinal},actual={},games=SLOTS.map(s=>{const ids=participants(s,actual,teams);actual[s.id]={team:ids[0]};return {id:s.id,title:['CFP First Round','CFP Quarterfinal','CFP Semifinal','CFP National Championship'][s.round],start:config.deadline,home:{...teams.find(t=>t.id===ids[0]),score:demoFinal?28:null},away:{...teams.find(t=>t.id===ids[1]),score:demoFinal?24:null},final:demoFinal,winner:demoFinal?ids[0]:null,status:demoFinal?'Final':'Scheduled'}});
 const entries=demoEntry?[demoEntry]:[];return {player:'You',admin:true,available:true,games,bracket:{config,locked:demoFinal,setupLocked:!!demoEntry,entry:demoEntry,shared:demoFinal?entries:[],standings:bracketStandings(['You','Demo Rival'],entries,teams,games,demoFinal)}};
}
async function api(body){
 if(demo){if(body?.action==='bracketSave'){demoEntry={player:'You',picks:structuredClone(body.picks),guess:body.guess,submitted:body.submit,version:(demoEntry?.version||0)+1};return {ok:true}}throw Error('Setup changes are disabled in the demo.');}
 const r=await fetch('./api/cfp?'+new URLSearchParams({pool,season}),{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token(),'Content-Type':'application/json'},cache:'no-store',signal:AbortSignal.timeout(20000),...(body?{body:JSON.stringify({pool,season,...body})}:{})}),j=await r.json();if(!r.ok)throw Error(j.error||'Unable to complete this request.');return j;
}
function render(){
 $('identity').textContent=(demo?'Demo playoff pool — illustrative teams and seeds':selected.name||'College playoff pool')+' — '+data.player;
 const views={picks:'Full bracket',scores:'Live scores',standings:'Standings'};$('tabs').innerHTML=Object.entries(views).map(([key,label])=>'<button data-view="'+key+'" class="'+(view===key?'active':'')+'">'+label+'</button>').join('');$('tabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(busy)return;view=b.dataset.view;render()});
 if(mountBracket({root:$('content'),data,view,api,reload:load,demo}))return;
 $('content').innerHTML='<h2>Official playoff results</h2>'+(data.games.length?data.games.map(g=>'<article class="cfp-entry"><h3>'+esc(g.title)+'</h3><p>'+esc(g.away.name)+' '+esc(g.away.score??'')+' vs. '+esc(g.home.name)+' '+esc(g.home.score??'')+'</p><p>'+esc(g.status)+' · '+esc(new Date(g.start).toLocaleString())+'</p></article>').join(''):'<p>No playoff schedule is posted yet.</p>')+(demo?'<button id="demoResults">'+(demoFinal?'Reset demo results':'Simulate final results')+'</button>':'');
 if($('demoResults'))$('demoResults').onclick=()=>{demoFinal=!demoFinal;void load()};
}
async function load(){if(busy)return;busy=true;$('message').textContent='Loading playoff bracket…';try{data=demo?fixture():await api();render();$('message').textContent=data.warning||'Submit every round before the first playoff kickoff. Save a draft while you work.'}catch(error){$('message').textContent=error.message;$('content').querySelectorAll('button,select,input').forEach(b=>b.disabled=true)}finally{busy=false}}
$('refresh').onclick=()=>void load();$('season').onchange=()=>{if(busy){$('season').value=season;return}season=Number($('season').value);demoEntry=null;demoFinal=false;void load()};
if(demo||(pool&&token()))void load();else $('message').innerHTML='Sign in through <a href="./control-center.html">your Locker Room</a>, or <a href="./cfp.html?demo=1">try the demo</a>.';
const timer=setInterval(()=>{if(data?.bracket?.config&&Date.now()>=Date.parse(data.bracket.config.deadline)){data.bracket.locked=true;$('content').querySelectorAll('#bracketSave button,#bracketSave input,[data-slot] button,[data-slot] select').forEach(b=>b.disabled=true);const note=$('bracketStatus');if(note)note.textContent='The entire bracket is locked. No more edits can be saved.';}},1000);
const refreshTimer=setInterval(()=>{if(!document.hidden&&!busy&&(['scores','standings'].includes(view)||!data?.bracket?.config))void load()},60000);window.addEventListener('pagehide',()=>{clearInterval(timer);clearInterval(refreshTimer)},{once:true});
