/* LINKS Game 33 standalone page adapter v596. Login/routing remains in index.html. */
window.LinksGame33=(()=>{
 let loaded=false;
 const map=[
 ["g33NewWeekSelectV595","g33WeekSelect"],["g33NewWeekTitleV595","g33WeekTitle"],["g33NewCarryBadgeV595","g33CarryBadge"],
 ["g33NewMyTeamV595","g33MyTeam"],["g33NewWeekResultV595","g33WeekResult"],["g33NewScoreBoardV595","g33ScoreBoard"],["g33NewHistoryV595","g33History"],
 ["g33NewAdminPanelV595","g33Admin"],["g33NewDrawStatusV595","g33DrawStatus"],["g33NewManualAssignmentsV595","g33ManualAssignments"],
 ["g33NewPaymentAdminV595","g33PaymentAdmin"],["g33NewRandomDrawV595","g33RandomDraw"],["g33NewSaveManualV595","g33SaveManual"],
 ["g33NewFinalizeV595","g33Finalize"],["g33NewPayoutV595","g33Payout"]
 ];
 function adaptIds(root){map.forEach(([n,o])=>{const el=root.querySelector("#"+n);if(el)el.id=o})}
 async function mount(){
   let host=document.getElementById("game33NewHostV596");
   if(!host){host=document.createElement("div");host.id="game33NewHostV596";const old=document.getElementById("game33");old?.parentNode?.insertBefore(host,old)}
   if(!loaded){const r=await fetch("./games/game33/game33.html?v=596",{cache:"no-store"});if(!r.ok)throw new Error("Could not load Game 33 page");host.innerHTML=await r.text();adaptIds(host);loaded=true}
   const old=document.getElementById("game33");if(old)old.classList.add("hide");
   host.classList.remove("hide");
   document.body.classList.add("links-game33-standalone-v596");
   const admin=document.getElementById("g33NewAdminV595");if(admin)admin.style.display=window.isCommissioner?"block":"none";
   admin?.addEventListener("click",()=>{const p=document.getElementById("g33Admin");p?.classList.remove("hide");setTimeout(()=>p?.scrollIntoView({behavior:"smooth",block:"start"}),40)},{once:false});
   return host;
 }
 function leave(){document.body.classList.remove("links-game33-standalone-v596");document.getElementById("game33NewHostV596")?.classList.add("hide")}
 return Object.freeze({mount,leave});
})();
