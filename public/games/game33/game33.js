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
   const admin=document.getElementById("g33NewAdminV595");if(admin){const commissioner=!!window.isCommissioner||window.role==="admin"||sessionStorage.getItem("poolIsCommissioner")==="1";admin.style.display=commissioner?"block":"none";admin.classList.toggle("links-g33-admin-visible-v598",commissioner)}
   admin?.addEventListener("click",()=>{const p=document.getElementById("g33Admin");p?.classList.remove("hide");setTimeout(()=>p?.scrollIntoView({behavior:"smooth",block:"start"}),40)},{once:false});
   return host;
 }
 function leave(){document.body.classList.remove("links-game33-standalone-v596");document.getElementById("game33NewHostV596")?.classList.add("hide")}
 return Object.freeze({mount,leave});
})();

/* v597 dedicated Game 33 admin page controls */
(()=>{
 const byId=id=>document.getElementById(id);
 function openAdmin(){
   const commissioner=!!window.isCommissioner||window.role==="admin"||sessionStorage.getItem("poolIsCommissioner")==="1"; if(!commissioner)return;
   const p=byId("g33Admin"); if(!p)return;
   p.classList.remove("hide");
   byId("game33NewV595")?.classList.add("g33-admin-open-v597");
   const b=byId("g33NewAdminV595"); if(b)b.textContent="← BACK TO GAME 33";
 }
 function closeAdmin(){
   byId("g33Admin")?.classList.add("hide");
   byId("game33NewV595")?.classList.remove("g33-admin-open-v597");
   const b=byId("g33NewAdminV595"); if(b)b.textContent="⚙️ ADMIN";
 }
 document.addEventListener("click",e=>{
   const b=e.target.closest?.("#g33NewAdminV595"); if(!b)return;
   e.preventDefault();
   if(byId("game33NewV595")?.classList.contains("g33-admin-open-v597"))closeAdmin();else openAdmin();
 });
})();

/* v598 commissioner visibility: use the same persisted session flag as the working login. */
(()=>{
 function syncAdmin(){
   const b=document.getElementById("g33NewAdminV595");if(!b)return;
   const commissioner=!!window.isCommissioner||window.role==="admin"||sessionStorage.getItem("poolIsCommissioner")==="1";
   b.style.setProperty("display",commissioner?"block":"none","important");
   b.classList.toggle("links-g33-admin-visible-v598",commissioner);
 }
 document.addEventListener("links-game33-mounted",syncAdmin);
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)syncAdmin()});
 setInterval(()=>{if(document.body.classList.contains("links-game33-standalone-v596"))syncAdmin()},1000);
})();

/* v599 native Game 33 admin — never opens the shared NFL admin. */
(()=>{
 const $=id=>document.getElementById(id);
 async function call(path,opt={}){return api(path,opt)}
 async function loadPlayers(){
   const box=$("g33AdminPlayerListV599");if(!box)return;
   box.innerHTML='<div class="small">Loading players…</div>';
   try{
     const d=await call(q("/api/33?_="+Date.now()));
     const players=d.players||d.assignments||[];
     const rows=Array.isArray(players)?players:Object.entries(players).map(([name,x])=>({name,...(typeof x==="object"?x:{team:x})}));
     box.innerHTML=rows.length?rows.map(x=>'<div class="g33-admin-player-v599"><b>'+escapeHtml(x.name||x.player||"Player")+'</b><span>'+(x.team?escapeHtml(g33TeamName(x.team)):"Waiting for team draw")+'</span></div>').join(""):'<div class="small">No players added yet.</div>';
   }catch(e){box.innerHTML='<div class="small">Could not load players: '+escapeHtml(e.message)+'</div>'}
 }
 async function addPlayer(){
   const name=$("g33AdminPlayerNameV599")?.value.trim(),email=$("g33AdminPlayerEmailV599")?.value.trim(),st=$("g33AdminPlayerStatusV599"),b=$("g33AdminAddPlayerV599");
   if(!name||!email){if(st)st.textContent="Enter the player name and email.";return}
   b.disabled=true;if(st)st.textContent="Adding player…";
   try{
     await call("/api/admin/player",{method:"POST",body:JSON.stringify({name,password:"",email})});
     const d=await call("/api/admin/player-setup-invite",{method:"POST",body:JSON.stringify({player:name,email,delivery:"email"})});
     if(st)st.textContent=d.sent?"✅ Player added and setup email sent.":"✅ Player added. Setup email was not sent.";
     $("g33AdminPlayerNameV599").value="";$("g33AdminPlayerEmailV599").value="";
     await loadPlayers(); if(typeof render33==="function")await render33();
   }catch(e){if(st)st.textContent="⚠️ "+e.message}finally{b.disabled=false}
 }
 document.addEventListener("click",e=>{
   if(e.target.closest?.("#g33NewAdminV595"))setTimeout(loadPlayers,0);
   if(e.target.closest?.("#g33AdminAddPlayerV599")){e.preventDefault();addPlayer()}
 });
})();

/* v600 — 2026 Game 33 commissioner-provided yearly assignments. */
window.LINKS_GAME33_2026_ASSIGNMENTS=Object.freeze([
["Tailgate Trey","LAC",true],["Jack","DET",true],["Fred","PHI",false],["TD","TB",true],
["TD2","HOU",true],["Robb","MIN",true],["Karen","NYJ",true],["Randy","JAX",true],
["Lockman","NYG",false],["Bill A","CHI",true],["Cindy A","TEN",true],["Almarode","CIN",true],
["B-man","ATL",true],["Kelly","NO",true],["Taylor","NE",false],["Daniel","KC",false],
["Mike D","BAL",false],["Katie","LV",true],["Thad","BUF",true],["Cristen","DEN",true],
["Grizzo","LAR",false],["Jake","ARZ",false],["Amanda","DAL",false],["Austin Hale","CLE",true],
["Lee","WAS",true],["Kirsten","SF",true],["Mark","GB",true],["Franklin","MIA",true],
["Laura Hale 1","SEA",true],["Laura Hale 2","CAR",true],["Codie","PIT",true],["Rob","IND",true]
]);
(()=>{
 function show2026(){
   const box=document.getElementById("g33ManualAssignments");if(!box||box.dataset.links2026==="1")return;
   box.dataset.links2026="1";
   box.innerHTML='<div class="g33-2026-list-v600">'+window.LINKS_GAME33_2026_ASSIGNMENTS.map(([n,t,paid])=>'<div class="g33-2026-row-v600"><b>'+escapeHtml(n)+'</b><span>'+escapeHtml(t)+'</span><span>'+(paid?'💯':'—')+'</span></div>').join("")+'</div>';
 }
 document.addEventListener("click",e=>{if(e.target.closest?.("#g33NewAdminV595"))setTimeout(show2026,30)});
})();
