/* LINKS NFL current-week rollover controller
   If ESPN still labels the just-completed week as current, advance Picks to the next week
   once every game in that week is final. Keeps manual/history week selections intact. */
(function(){
 'use strict';
 if(!/\/nfl(?:\.html)?$/i.test(location.pathname))return;
 const qp=new URLSearchParams(location.search);
 if(qp.has('week'))return; // explicit week links/history must stay where requested
 async function run(){
   try{
     const base='https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?limit=100';
     const cur=await fetch(base,{cache:'no-store'}).then(r=>r.json());
     let w=Number(cur.week?.number||cur.week||cur.season?.week||0);
     if(!w){
       const sel=document.getElementById('weekSelect');
       w=Number(sel?.value||0);
     }
     if(!w)return;
     const st=Number(cur.season?.type||2);
     const data=await fetch(base+'&seasontype='+st+'&week='+encodeURIComponent(w),{cache:'no-store'}).then(r=>r.json());
     const events=data.events||[];
     const allFinal=events.length>0&&events.every(e=>e.status?.type?.completed===true||e.status?.type?.state==='post');
     const target=allFinal&&w<22?w+1:w;
     const sel=document.getElementById('weekSelect');
     if(!sel)return;
     if(typeof currentWeek!=='undefined')currentWeek=target;
     if(typeof syncWeekNav==='function')syncWeekNav();
     if(Number(sel.value)!==target&&typeof setWeek==='function')setWeek(target);
   }catch(e){}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,250));else setTimeout(run,250);
})();