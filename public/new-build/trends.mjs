import {renderTrends} from './personal-trends.mjs';
const status=document.getElementById('trendsStatus'),content=document.getElementById('trendsContent'),refresh=document.getElementById('refreshTrends');
let selected={};try{selected=JSON.parse(localStorage.getItem('links-current-pool')||'{}')}catch{}
const pool=new URLSearchParams(location.search).get('pool')||selected.id,token=()=>localStorage.getItem('links-legacy-token')||localStorage.getItem('links-token');let busy=false;
window.LINKS_NFL_NAV?.mount('trends',document.querySelector('main'));
async function load(){
 if(busy)return;
 if(!pool||!token()){status.textContent='Sign in through your Locker Room to see your own trends.';return}
 busy=true;refresh.disabled=true;status.textContent='Loading your results...';
 try{
  const response=await fetch('./api/season-standings?'+new URLSearchParams({pool}),{headers:{Authorization:'Bearer '+token()},cache:'no-store',signal:AbortSignal.timeout(20000)}),data=await response.json();
  if(!response.ok)throw Error(data.error||'Trends could not load. Try again.');
  content.innerHTML=renderTrends(data.history||[],data.player||'');
  status.textContent=(data.failedWeeks?.length?'Some weeks could not refresh; these trends are incomplete. ':'')+(data.courtesy?.message?data.courtesy.message+' ':'')+'Updated '+new Date().toLocaleTimeString();
 }catch(error){status.textContent=error.message+' Previously loaded trends, if shown, may be out of date.'}
 finally{busy=false;refresh.disabled=false}
}
refresh.onclick=load;void load();
