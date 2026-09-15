// LINKS v207 — Pick Your Games home entry. Existing app/game logic stays intact.
export async function onRequest(context){
 const response=await context.next();
 if(context.request.method!=="GET")return response;
 const url=new URL(context.request.url),ct=response.headers.get("content-type")||"";
 if(!ct.includes("text/html")||!(url.pathname==="/"||url.pathname==="/index.html"))return response;
 let html=await response.text();
 const css=`<style id="links-v207">
:root{--o:#ff6418;--ohi:#ff8a35}
body{background:#03070a!important;background-image:radial-gradient(ellipse at 50% 0,rgba(65,103,132,.18),transparent 34%),linear-gradient(#071018,#03070a 48%,#020405)!important}
.links-pick-games-home-v207{display:block;width:min(1100px,100%);margin:18px auto 24px;padding:0;border:0;background:transparent;text-decoration:none;cursor:pointer}
.links-pick-games-home-v207 img{display:block;width:100%;height:auto;border-radius:16px;border:2px solid #6f7477;box-shadow:0 14px 34px #000b,0 0 0 2px #111 inset}
.links-pick-games-home-v207:focus-visible{outline:3px solid #ff6418;outline-offset:5px;border-radius:16px}
.links-pick-games-note-v207{text-align:center;margin-top:7px;color:#c7d0d7;font-size:11px;font-weight:850;letter-spacing:.5px}
button.blue,#home button.blue,#savePicks{background:linear-gradient(var(--ohi),#ff5909)!important;border:2px solid #ff9a5c!important;color:#fff!important;font-weight:950!important}
.tabs{background:linear-gradient(#09131b,#04080b)!important}.tabs button.active{border-color:#ff6a1c!important}
#picks>.card.row:first-of-type{background:linear-gradient(#173c58,#0a2031)!important;border:3px solid #798187!important}#picks>.card.row:first-of-type::before{content:'PICKS';color:#ff7624;font-weight:950;letter-spacing:1.6px}
#standingsBody tr.links-my-rank-v207 td{background:#ff641821!important;border-top:2px solid var(--o)!important;border-bottom:2px solid var(--o)!important}.links-my-rank-label-v207{display:inline-block;margin-left:6px;padding:2px 6px;border-radius:99px;background:var(--o);color:#fff;font-size:9px;font-weight:950}
.links-build-footer{color:#9ca5aa!important;letter-spacing:1.5px!important}
@media(max-width:560px){.links-pick-games-home-v207{margin:12px auto 17px}.links-pick-games-home-v207 img{border-radius:10px}.links-pick-games-note-v207{font-size:10px}}
</style>`;
 html=html.replace("</head>",css+"\n</head>");
 const categoryMarker='<div class="kicker">CHOOSE WHAT YOU WANT TO RUN</div>';
 const homeEntry=`<a class="links-pick-games-home-v207" href="#linksGameCategoriesV207" aria-label="Pick your games"><img src="/pick-your-games-v207.svg?v=207" alt="Pick Your Games — one Links platform, multiple ways to play"><div class="links-pick-games-note-v207">TAP TO PICK YOUR GAMES</div></a><div id="linksGameCategoriesV207"></div>`;
 if(html.includes(categoryMarker))html=html.replace(categoryMarker,homeEntry+categoryMarker);
 const rowsSource='(d.rows||[]).map((r,i)=>{';
 const rowsReplacement=`(()=>{const allRows=d.rows||[];const visibleRows=allRows.slice(0,10).map((r,i)=>({...r,__v207Rank:i+1,__v207Mine:false}));const meName=String($("#currentUser")?.textContent||"").trim();const meIndex=allRows.findIndex(r=>String(r.player||"").trim()===meName);if(meIndex>=10)visibleRows.push({...allRows[meIndex],__v207Rank:meIndex+1,__v207Mine:true});else if(meIndex>=0&&visibleRows[meIndex])visibleRows[meIndex].__v207Mine=true;return visibleRows})().map((r,i)=>{`;
 html=html.replace(rowsSource,rowsReplacement);
 const rs='return `<tr class="${won?"winner":""}"><td>${i+1}</td><td>${r.player}${won?" 🏆 WINNER":""}</td>';
 const rr='return `<tr class="${won?"winner":""}${r.__v207Mine?" links-my-rank-v207":""}"><td>${r.__v207Rank||i+1}</td><td>${r.player}${r.__v207Mine?" <span class=\\"links-my-rank-label-v207\\">YOU</span>":""}${won?" 🏆 WINNER":""}</td>';
 html=html.replace(rs,rr);
 for(const v of ["v202","v203","v204","v205","v206"]){html=html.replace(`LINKS PICK’EM POOLS — ${v}`,"LINKS PICK’EM POOLS — v207");html=html.replace(`LINKS PICK'EM POOLS — ${v}`,"LINKS PICK'EM POOLS — v207")}
 const headers=new Headers(response.headers);headers.delete("content-length");headers.set("cache-control","no-cache, no-store, must-revalidate");headers.set("x-links-build","v207");
 return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
