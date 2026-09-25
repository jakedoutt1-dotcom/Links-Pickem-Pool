/* LINKS NFL weekly deadline module
   Protected extraction: one deadline per selected week.
   Default = first kickoff in selected week's loaded ESPN slate.
   Commissioner override = server game-settings lockAt for selected week when available.
   This module is intentionally standalone so nfl.html does not need to grow further.
*/
(function(){
  'use strict';
  const state={week:null,firstKickoff:null,override:null,effective:null,timer:null};
  const ms=v=>{const n=Date.parse(v||'');return Number.isFinite(n)?n:null};
  const earliest=games=>{
    const times=(games||[]).map(g=>g?.date||g?.kickoff||g?.startTime).map(v=>({raw:v,time:ms(v)})).filter(x=>x.time!==null).sort((a,b)=>a.time-b.time);
    return times[0]?.raw||null;
  };
  function setWeek(week,games){
    state.week=String(week||'');
    state.firstKickoff=earliest(games);
    state.override=null;
    state.effective=state.firstKickoff;
    return state.effective;
  }
  function setOverride(value){
    state.override=ms(value)!==null?value:null;
    state.effective=state.override||state.firstKickoff;
    return state.effective;
  }
  function clearOverride(){return setOverride(null)}
  function closed(now=Date.now()){
    const t=ms(state.effective);
    return t!==null&&now>=t;
  }
  function remaining(now=Date.now()){
    const t=ms(state.effective);
    return t===null?null:Math.max(0,t-now);
  }
  function snapshot(){return {...state,closed:closed(),remaining:remaining()}}
  window.LINKSNFLDeadline={setWeek,setOverride,clearOverride,closed,remaining,snapshot,earliest};
})();
