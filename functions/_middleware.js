// LINKS v206 — approved-reference visual pass. Existing app structure and logic stay intact.
export async function onRequest(context){
 const response=await context.next();
 if(context.request.method!=="GET")return response;
 const url=new URL(context.request.url),ct=response.headers.get("content-type")||"";
 if(!ct.includes("text/html")||!(url.pathname==="/"||url.pathname==="/index.html"))return response;
 let html=await response.text();
 const css=`<style id="links-v206-approved-reference">
:root{--o:#ff6418;--ohi:#ff8a35;--steel:#8a9296;--wood:#29150b;--ink:#05090c}
body{background:#03070a!important;background-image:radial-gradient(ellipse at 50% 0,rgba(65,103,132,.18),transparent 34%),linear-gradient(#071018,#03070a 48%,#020405)!important}
.wrap{max-width:800px!important}
/* Approved reference: stadium header panel, compact landscape category cards, wood nameplates. */
#home .links-v202-games-shell,#home [class*="games-shell"],#home [class*="category-shell"]{background:radial-gradient(ellipse at 50% 28%,#17334a 0,#0a1721 45%,#050a0e 100%)!important;border:3px solid #667078!important;border-radius:18px!important;box-shadow:inset 0 0 0 2px #11181d,0 10px 24px #0009!important;padding:14px!important}
#home [class*="games-title"],#home [class*="category-title"]{font-family:Impact,'Arial Narrow',Arial,sans-serif!important;text-transform:uppercase!important;letter-spacing:1px!important;color:#f4f4f2!important;text-shadow:0 3px 2px #000!important}
#home [class*="game-card"],#home [class*="category-card"]{box-sizing:border-box!important;position:relative!important;min-width:0!important;min-height:0!important;height:190px!important;overflow:hidden!important;padding:0!important;border:4px solid #737b80!important;border-radius:15px!important;background:linear-gradient(180deg,#153148 0 58%,#351a0d 58% 100%)!important;box-shadow:inset 0 0 0 2px #0b0f12,inset 0 1px #ffffff28,0 6px 14px #0009!important}
#home [class*="game-card"]:before,#home [class*="category-card"]:before{content:'';position:absolute;inset:5px;border:1px solid #a7afb43b;border-radius:9px;pointer-events:none}
#home [class*="game-card"]:after,#home [class*="category-card"]:after{content:'';position:absolute;left:0;right:0;top:58%;height:2px;background:#6d3217;box-shadow:0 1px #120805;pointer-events:none}
/* Keep all existing content but force it into the compact reference proportions. */
#home [class*="game-card"] *,#home [class*="category-card"] *{box-sizing:border-box!important;word-break:normal!important;overflow-wrap:normal!important;hyphens:none!important}
#home [class*="game-card"] b,#home [class*="game-card"] strong,#home [class*="category-card"] b,#home [class*="category-card"] strong{position:absolute!important;left:18px!important;right:62px!important;bottom:37px!important;margin:0!important;font-family:Impact,'Arial Narrow',Arial,sans-serif!important;font-size:21px!important;line-height:1!important;letter-spacing:.45px!important;text-transform:uppercase!important;white-space:normal!important;word-break:keep-all!important;color:#f6f5f1!important;text-shadow:0 3px 2px #000!important;z-index:4!important}
#home [class*="game-card"] .small,#home [class*="category-card"] .small{position:absolute!important;left:18px!important;bottom:15px!important;margin:0!important;font-size:10px!important;line-height:1!important;letter-spacing:1.1px!important;text-transform:uppercase!important;color:#e8e6e0!important;z-index:4!important}
#home [class*="game-icon"],#home [class*="category-icon"]{position:absolute!important;top:16px!important;left:18px!important;width:58px!important;height:58px!important;margin:0!important;display:flex!important;align-items:center!important;justify-content:center!important;border-radius:50%!important;background:radial-gradient(circle at 35% 25%,#52697b,#162734 60%,#080d11)!important;border:3px solid #91999e!important;box-shadow:inset 0 0 0 2px #10161a,0 5px 10px #0009!important;font-size:29px!important;line-height:1!important;z-index:3!important}
#home [class*="game-card"] button,#home [class*="category-card"] button{position:absolute!important;right:13px!important;bottom:15px!important;width:42px!important;height:42px!important;min-width:42px!important;min-height:42px!important;padding:0!important;border-radius:9px!important;background:linear-gradient(#32170a,#130906)!important;border:2px solid #e65a12!important;color:#ff6a1c!important;font-size:25px!important;box-shadow:inset 0 0 0 2px #080504,0 0 10px #ff5b0b35!important;z-index:5!important}
/* Feature cards use the same metal-and-wood language without moving their grid. */
#home [class*="benefit-card"],#home [class*="feature-card"]{min-width:0!important;overflow:hidden!important;background:linear-gradient(180deg,#152a3a,#09131b)!important;border:3px solid #747d82!important;border-radius:12px!important;box-shadow:inset 0 0 0 2px #0a0e11,0 5px 12px #0008!important;padding:10px 7px!important;text-align:center!important}
#home [class*="benefit-card"] *,#home [class*="feature-card"] *{word-break:normal!important;overflow-wrap:normal!important;hyphens:none!important}
#home [class*="benefit-card"] b,#home [class*="benefit-card"] strong,#home [class*="feature-card"] b,#home [class*="feature-card"] strong{display:block!important;font-family:Impact,'Arial Narrow',Arial,sans-serif!important;font-size:14px!important;line-height:1.05!important;word-break:keep-all!important;white-space:normal!important}
#home [class*="benefit-card"] .small,#home [class*="feature-card"] .small{font-size:9px!important;line-height:1.15!important}
/* Footer reference: wood stadium strip, slogan left, LINKS centered, community message right. */
#home .links-v202-footer-panel,#home [class*="brand-footer"],#home [class*="closing-panel"]{background:radial-gradient(ellipse at 50% 15%,#482412 0,#1c0e08 55%,#080504 100%)!important;border:3px solid #5d4638!important;box-shadow:inset 0 0 40px #0009,0 8px 20px #000!important}
#home .links-v202-footer-panel:before,#home [class*="brand-footer"]:before,#home [class*="closing-panel"]:before{background:linear-gradient(90deg,transparent,#ffb05b,transparent)!important}
/* General reference styling; functionality untouched. */
#home .card{border-color:#5f676c!important;box-shadow:inset 0 0 0 2px #101519,0 8px 20px #0008!important}
button.blue,#home button.blue,#savePicks{background:linear-gradient(var(--ohi),#ff5909)!important;border:2px solid #ff9a5c!important;color:#fff!important;font-weight:950!important;box-shadow:inset 0 1px #ffffff55,0 5px 11px #0008!important}
.tabs{background:linear-gradient(#09131b,#04080b)!important}.tabs button{border:3px solid #727a7f!important;background:linear-gradient(#1b2a35,#0a1117)!important}.tabs button.active{border-color:#ff6a1c!important}
#picks>.card.row:first-of-type{background:linear-gradient(#173c58,#0a2031)!important;border:3px solid #798187!important}#picks>.card.row:first-of-type::before{content:'PICKS';color:#ff7624;font-weight:950;letter-spacing:1.6px}
#standingsBody tr.links-my-rank-v206 td{background:#ff641821!important;border-top:2px solid var(--o)!important;border-bottom:2px solid var(--o)!important}.links-my-rank-label-v206{display:inline-block;margin-left:6px;padding:2px 6px;border-radius:99px;background:var(--o);color:#fff;font-size:9px;font-weight:950}
.links-build-footer{color:#9ca5aa!important;letter-spacing:1.5px!important}
@media(max-width:560px){.wrap{padding-left:8px!important;padding-right:8px!important}#home [class*="game-card"],#home [class*="category-card"]{height:154px!important}#home [class*="game-card"] b,#home [class*="game-card"] strong,#home [class*="category-card"] b,#home [class*="category-card"] strong{left:13px!important;right:52px!important;bottom:31px!important;font-size:16px!important;line-height:1.02!important}#home [class*="game-card"] .small,#home [class*="category-card"] .small{left:13px!important;bottom:12px!important;font-size:8px!important}#home [class*="game-icon"],#home [class*="category-icon"]{top:12px!important;left:13px!important;width:48px!important;height:48px!important;font-size:24px!important}#home [class*="game-card"] button,#home [class*="category-card"] button{right:10px!important;bottom:11px!important;width:36px!important;height:36px!important;min-width:36px!important;min-height:36px!important;font-size:21px!important}}
</style>`;
 html=html.replace("</head>",css+"\n</head>");
 const rowsSource='(d.rows||[]).map((r,i)=>{';
 const rowsReplacement=`(()=>{const allRows=d.rows||[];const visibleRows=allRows.slice(0,10).map((r,i)=>({...r,__v206Rank:i+1,__v206Mine:false}));const meName=String($("#currentUser")?.textContent||"").trim();const meIndex=allRows.findIndex(r=>String(r.player||"").trim()===meName);if(meIndex>=10)visibleRows.push({...allRows[meIndex],__v206Rank:meIndex+1,__v206Mine:true});else if(meIndex>=0&&visibleRows[meIndex])visibleRows[meIndex].__v206Mine=true;return visibleRows})().map((r,i)=>{`;
 html=html.replace(rowsSource,rowsReplacement);
 const rs='return `<tr class="${won?"winner":""}"><td>${i+1}</td><td>${r.player}${won?" 🏆 WINNER":""}</td>';
 const rr='return `<tr class="${won?"winner":""}${r.__v206Mine?" links-my-rank-v206":""}"><td>${r.__v206Rank||i+1}</td><td>${r.player}${r.__v206Mine?" <span class=\\"links-my-rank-label-v206\\">YOU</span>":""}${won?" 🏆 WINNER":""}</td>';
 html=html.replace(rs,rr);
 for(const v of ["v202","v203","v204","v205"]){html=html.replace(`LINKS PICK’EM POOLS — ${v}`,"LINKS PICK’EM POOLS — v206");html=html.replace(`LINKS PICK'EM POOLS — ${v}`,"LINKS PICK'EM POOLS — v206")}
 const headers=new Headers(response.headers);headers.delete("content-length");headers.set("cache-control","no-cache, no-store, must-revalidate");headers.set("x-links-build","v206");
 return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
