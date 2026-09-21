/* LINKS Game 33 v601 — self-contained game UI. Shared login/API stay outside this folder. */
window.LINKS_GAME33_2026_ASSIGNMENTS=Object.freeze([
["Tailgate Trey","LAC",true],["Jack","DET",true],["Fred","PHI",false],["TD","TB",true],["TD2","HOU",true],["Robb","MIN",true],["Karen","NYJ",true],["Randy","JAX",true],["Lockman","NYG",false],["Bill A","CHI",true],["Cindy A","TEN",true],["Almarode","CIN",true],["B-man","ATL",true],["Kelly","NO",true],["Taylor","NE",false],["Daniel","KC",false],["Mike D","BAL",false],["Katie","LV",true],["Thad","BUF",true],["Cristen","DEN",true],["Grizzo","LAR",false],["Jake","ARZ",false],["Amanda","DAL",false],["Austin Hale","CLE",true],["Lee","WAS",true],["Kirsten","SF",true],["Mark","GB",true],["Franklin","MIA",true],["Laura Hale 1","SEA",true],["Laura Hale 2","CAR",true],["Codie","PIT",true],["Rob","IND",true]
]);
window.LinksGame33=(()=>{
 let loaded=false,data=null,currentView="home",busy=false;
 const el=id=>document.getElementById(id), esc=s=>typeof escapeHtml==="function"?escapeHtml(String(s??"")):String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
 const commissioner=()=>!!window.isCommissioner||window.role==="admin"||sessionStorage.getItem("poolIsCommissioner")==="1";
 const teamName=t=>typeof g33TeamName==="function"?g33TeamName(t):(window.TEAM_NAMES?.[t]||t);
 const logo=t=>typeof g33Logo==="function"?g33Logo(t):(window.ESPN?.[t]?("https://a.espncdn.com/i/teamlogos/nfl/500/"+window.ESPN[t]+".png"):"");
 const call=(path,opt={})=>api(path,opt);
 const path33=s=>q(s);
 function note(s,good=true){const x=el("g33StatusV601");if(!x)return;x.textContent=s;x.classList.remove("hide");x.style.borderColor=good?"#55e894":"#ff7d83";clearTimeout(note.t);note.t=setTimeout(()=>x.classList.add("hide"),3500)}
 function show(view){
   if(view==="admin"&&!commissioner())view="home";currentView=view;
   document.querySelectorAll("#game33NewV601 [data-g33-page]").forEach(x=>x.classList.toggle("hide",x.dataset.g33Page!==view));
   document.querySelectorAll("#g33NavV601 [data-g33-view]").forEach(x=>x.classList.toggle("active",x.dataset.g33View===view));
   if(view==="admin")renderAdmin();
 }
 async function mount(){
   let host=el("game33NewHostV596");if(!host){host=document.createElement("div");host.id="game33NewHostV596";const old=el("game33");old?.parentNode?.insertBefore(host,old)}
   if(!loaded){const r=await fetch("./games/game33/game33.html?v=601",{cache:"no-store"});if(!r.ok)throw new Error("Could not load Game 33");host.innerHTML=await r.text();bind();loaded=true}
   el("game33")?.classList.add("hide");host.classList.remove("hide");document.body.classList.add("links-game33-standalone-v596");
   el("g33AdminNavV601")?.classList.toggle("hide",!commissioner());show(currentView);return host;
 }
 function leave(){document.body.classList.remove("links-game33-standalone-v596");el("game33NewHostV596")?.classList.add("hide")}
 function bind(){
   el("g33NavV601")?.addEventListener("click",e=>{const b=e.target.closest("[data-g33-view]");if(b)show(b.dataset.g33View)});
   el("g33WeekV601")?.addEventListener("change",async e=>{window.week=Number(e.target.value)||1;await render()});
   el("g33AddPlayerV601")?.addEventListener("click",addPlayer);
   el("g33Load2026V601")?.addEventListener("click",load2026);
   el("g33RandomV601")?.addEventListener("click",randomDraw);
   el("g33SaveAssignmentsV601")?.addEventListener("click",saveManual);
   el("g33FinalizeV601")?.addEventListener("click",finalize);
   el("g33PayoutV601")?.addEventListener("click",payout);
   el("g33AccessV601")?.addEventListener("click",async e=>{const b=e.target.closest("[data-player]");if(!b)return;try{await call(path33("/api/33/payment"),{method:"POST",body:JSON.stringify({player:b.dataset.player,paid:b.dataset.paid!=="1"})});await render();note("Player access updated.")}catch(x){note(x.message,false)}});
 }
 function row(a){
   const score=a.score??"—",n=Number(a.score),near=Number.isFinite(n)&&Math.abs(n-33)<=3&&!a.hit33;
   return '<div class="g33-team-v601 '+(a.hit33?"hit":"")+'"><img src="'+esc(logo(a.team))+'" alt=""><div><b>'+esc(a.player||"Open")+' — '+esc(teamName(a.team))+'</b><div class="small">'+(a.opponent?("vs "+esc(teamName(a.opponent))+" • "):"")+esc(a.status||"")+(a.hit33?" • 🎯 HIT 33":"")+'</div></div><div class="score '+(near?"near":"")+'">'+esc(score)+'</div></div>';
 }
 async function render(){
   if(busy)return;busy=true;
   try{
     data=await call(path33("/api/33?_="+Date.now()));
     const w=el("g33WeekV601");if(w){w.innerHTML=Array.from({length:18},(_,i)=>'<option value="'+(i+1)+'">Week '+(i+1)+'</option>').join("");w.value=String(window.week||1)}
     if(el("g33RolloverV601"))el("g33RolloverV601").textContent=data.carryWeeks?(data.carryWeeks+" rollover week"+(data.carryWeeks===1?"":"s")):"No rollover";
     const result=el("g33ResultV601");if(result)result.innerHTML=data.finalized?(data.winners?.length?("🏆 <b>"+data.winners.map(x=>esc(x.player)+" ("+esc(x.team)+")").join(", ")+"</b> hit 33."):"↪️ Nobody hit 33. Rollover continues."):'<div class="small">Live week — final scores determine the result.</div>';
     const mine=el("g33MyTeamCardV601");if(mine){mine.classList.toggle("hide",window.role!=="player");const a=(data.assignments||[]).find(x=>x.player===window.currentUser);if(el("g33MyTeamV601"))el("g33MyTeamV601").innerHTML=a?row(a):'<div class="small">Your yearly team has not been assigned yet.</div>'}
     const sorted=[...(data.assignments||[])].sort((a,b)=>Math.abs(Number(a.score??999)-33)-Math.abs(Number(b.score??999)-33));
     if(el("g33WatchV601"))el("g33WatchV601").innerHTML=sorted.filter(a=>a.score!=null).slice(0,5).map(row).join("")||'<div class="small">Scores will appear when games begin.</div>';
     if(el("g33ScoresV601"))el("g33ScoresV601").innerHTML=(data.assignments||[]).map(row).join("")||'<div class="small">No assignments yet.</div>';
     if(el("g33TeamsV601"))el("g33TeamsV601").innerHTML=(data.assignments?.length?data.assignments.map(a=>[a.player,a.team,!!a.paid]):window.LINKS_GAME33_2026_ASSIGNMENTS).map(x=>'<div class="g33-player-v601"><b>'+esc(x[0]??x.player)+'</b><span>'+esc(x[1]??x.team)+'</span><span>'+((x[2]??x.paid)?"💯":"—")+'</span></div>').join("");
     if(el("g33HistoryV601"))el("g33HistoryV601").innerHTML=(data.history||[]).filter(x=>x.finalized).map(h=>'<div class="g33-player-v601"><b>Week '+h.week+'</b><span>'+(h.winners?.length?esc(h.winners.map(x=>x.player).join(", ")):"Rollover")+'</span><span>'+(h.payoutPaid?"✓":"")+'</span></div>').join("")||'<div class="small">No finalized weeks yet.</div>';
     el("g33AdminNavV601")?.classList.toggle("hide",!commissioner());if(currentView==="admin")renderAdmin();
   }catch(x){note("Game 33 could not refresh: "+x.message,false)}finally{busy=false}
 }
 function renderAdmin(){
   if(!commissioner()||!data)return;
   const locked=!!data.drawLocked,players=data.players||[];
   if(el("g33DrawStatusV601"))el("g33DrawStatusV601").innerHTML=locked?"🔒 YEARLY DRAW LOCKED — teams stay all 18 weeks.":"🔓 No yearly draw locked yet.";
   if(el("g33RandomV601"))el("g33RandomV601").disabled=locked;if(el("g33SaveAssignmentsV601"))el("g33SaveAssignmentsV601").disabled=locked;if(el("g33Load2026V601"))el("g33Load2026V601").disabled=locked;
   if(el("g33AdminPlayersV601"))el("g33AdminPlayersV601").innerHTML=players.map(p=>'<div class="g33-player-v601"><b>'+esc(p)+'</b><span>'+esc((data.assignments||[]).find(a=>a.player===p)?.team||"—")+'</span><span>'+(data.paid?.[p]?"💯":"—")+'</span></div>').join("")||'<div class="small">No players yet.</div>';
   const assigned=Object.fromEntries((data.assignments||[]).map(x=>[x.player,x.team]));
   if(el("g33ManualV601"))el("g33ManualV601").innerHTML=players.map(p=>'<div class="g33-manual-v601"><b>'+esc(p)+'</b><select data-g33-manual="'+esc(p)+'" '+(locked?"disabled":"")+'><option value="">— Team —</option>'+NFL_TEAMS_33.map(t=>'<option value="'+t+'" '+(assigned[p]===t?"selected":"")+'>'+esc(teamName(t))+'</option>').join("")+'</select></div>').join("");
   if(el("g33AccessV601"))el("g33AccessV601").innerHTML=players.map(p=>{const paid=!!data.paid?.[p];return '<button class="g33-access-v601 '+(paid?"active":"pending")+'" data-player="'+esc(p)+'" data-paid="'+(paid?1:0)+'">'+(paid?"✓ ACTIVE":"✕ PENDING")+' — '+esc(p)+'</button>'}).join("");
 }
 async function addPlayer(){const n=el("g33AddNameV601")?.value.trim(),email=el("g33AddEmailV601")?.value.trim(),st=el("g33AddStatusV601");if(!n||!email){if(st)st.textContent="Enter player name and email.";return}try{await call("/api/admin/player",{method:"POST",body:JSON.stringify({name:n,password:"",email})});const r=await call("/api/admin/player-setup-invite",{method:"POST",body:JSON.stringify({player:n,email,delivery:"email"})});if(st)st.textContent=r.sent?"✅ Player added and setup email sent.":"✅ Player added. Setup link created.";el("g33AddNameV601").value="";el("g33AddEmailV601").value="";await render()}catch(x){if(st)st.textContent="⚠️ "+x.message}}
 function fillAssignments(list){document.querySelectorAll("[data-g33-manual]").forEach(s=>{const found=list.find(x=>x[0]===s.dataset.g33Manual);if(found)s.value=found[1]});note("2026 draw loaded. Review it, then SAVE & LOCK ASSIGNMENTS.")}
 function load2026(){if(data?.drawLocked)return;fillAssignments(window.LINKS_GAME33_2026_ASSIGNMENTS)}
 async function saveManual(){const a=[...document.querySelectorAll("[data-g33-manual]")].map(s=>({player:s.dataset.g33Manual,team:s.value}));if(!a.length||a.some(x=>!x.team))return note("Assign a team to every player first.",false);if(new Set(a.map(x=>x.team)).size!==a.length)return note("Each entry must have a different NFL team.",false);if(!confirm("Save and LOCK these teams for all 18 weeks?"))return;try{await call(path33("/api/33/manual-draw"),{method:"POST",body:JSON.stringify({assignments:a})});for(const [p,,paid] of window.LINKS_GAME33_2026_ASSIGNMENTS){if(a.some(x=>x.player===p)&&!!data.paid?.[p]!==paid)await call(path33("/api/33/payment"),{method:"POST",body:JSON.stringify({player:p,paid})}).catch(()=>{})}await render();note("✅ Yearly assignments saved and locked.")}catch(x){note(x.message,false)}}
 async function randomDraw(){if(!confirm("Run one random yearly draw and lock it for all 18 weeks?"))return;try{await call(path33("/api/33/random-draw"),{method:"POST",body:"{}"});await render();note("🎲 Yearly draw complete.")}catch(x){note(x.message,false)}}
 async function finalize(){if(!confirm("Finalize this Game 33 week?"))return;try{const r=await call(path33("/api/33/finalize"),{method:"POST",body:"{}"});await render();note(r.rolled?"↪️ No 33 — rollover recorded.":"🏆 Winner recorded.")}catch(x){note(x.message,false)}}
 async function payout(){try{const r=await call(path33("/api/33/payout"),{method:"POST",body:"{}"});await render();note(r.payoutPaid?"Winner status COMPLETE.":"Winner status reopened.")}catch(x){note(x.message,false)}}
 return Object.freeze({mount,leave,render,show});
})();
window.render33=()=>window.LinksGame33.render();
