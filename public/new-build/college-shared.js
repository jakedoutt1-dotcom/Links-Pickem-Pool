// LINKS College shared module — v738
(function(){
 if(window.LINKS_COLLEGE)return;
 const q=()=>new URLSearchParams(location.search),poolObj=()=>{try{return JSON.parse(localStorage.getItem('links-current-pool')||'null')||{}}catch{return{}}};
 function poolId(){const p=poolObj();return q().get('pool')||p.id||p.poolId||p.pool_id||''}
 function playerName(){return localStorage.getItem('links-player-name')||''}
 function role(){return localStorage.getItem('links-player-role')||''}
 function isCommissioner(){return /admin|commissioner/i.test(role())}
 async function currentWeek(){try{const r=await fetch('https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?limit=1&groups=80',{cache:'no-store'}),j=await r.json();return Number(j.week?.number||1)||1}catch{return 1}}
 async function selectedWeek(){return Number(q().get('week'))||await currentWeek()}
 async function href(file,extra={}){const u=new URL('./'+file,location.href),p=poolId(),w=await selectedWeek();if(p)u.searchParams.set('pool',p);u.searchParams.set('week',w);Object.entries(extra).forEach(([k,v])=>v!=null&&u.searchParams.set(k,v));return u.pathname+u.search}
 async function settings(){const p=poolId(),w=await selectedWeek();if(!p)return null;const r=await fetch('./api/game-settings?pool='+encodeURIComponent(p)+'&game='+encodeURIComponent('College Pick’em')+'&period=week-'+w+'&_='+Date.now(),{cache:'no-store'}),j=await r.json();return r.ok?j.settings:null}
 async function saveSettings(s){const p=poolId(),w=await selectedWeek();const r=await fetch('./api/game-settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pool:p,game:'College Pick’em',period:'week-'+w,settings:s})});return r.json()}
 window.LINKS_COLLEGE={version:'738',poolId,playerName,role,isCommissioner,currentWeek,selectedWeek,href,settings,saveSettings};
})();