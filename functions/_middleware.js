// LINKS v205 — reference-match polish over the verified working app.
// No layout, navigation, form, pool-flow, or game-logic changes.
export async function onRequest(context) {
  const response = await context.next();
  if (context.request.method !== "GET") return response;
  const url = new URL(context.request.url);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;
  if (!(url.pathname === "/" || url.pathname === "/index.html")) return response;
  let html = await response.text();

  const css = `
<style id="links-v205-reference-match">
:root{--l205-orange:#ff6418;--l205-orange-hi:#ff8b38;--l205-steel:#89959d;--l205-steel2:#4d5962;--l205-black:#070b0f;--l205-blue:#102536;--l205-wood:#2b160b}
body{background:#05090d!important;background-image:radial-gradient(ellipse at 50% 0,rgba(145,184,213,.12) 0,rgba(5,9,13,0) 34%),linear-gradient(180deg,#081018 0,#05090d 38%,#030609 100%)!important}
.wrap{max-width:800px!important;padding-top:8px!important}
/* steel sports framing */
.card,.login{border:2px solid #596670!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),0 9px 24px rgba(0,0,0,.42)!important}
#home .card{position:relative;background:repeating-linear-gradient(90deg,rgba(55,27,13,.98) 0 28px,rgba(39,19,10,.98) 28px 56px)!important;border:3px solid var(--l205-steel2)!important;border-radius:16px!important;box-shadow:inset 0 0 0 2px #10161b,inset 0 1px rgba(255,255,255,.12),0 10px 24px rgba(0,0,0,.46)!important}
#home .card:before{content:'';position:absolute;inset:3px;border:1px solid rgba(190,204,214,.16);border-radius:11px;pointer-events:none}
#home h1,#home h2,#home h3{font-family:Impact,'Arial Narrow',Arial,sans-serif;text-transform:uppercase;letter-spacing:.8px;text-shadow:0 3px 3px rgba(0,0,0,.55)}
#home .small{color:#d7dde2!important}
button{font-weight:900!important}
button.blue,#home button.blue,#savePicks{background:linear-gradient(180deg,var(--l205-orange-hi),#ff5b0b)!important;border:2px solid #ff9d62!important;color:#fff!important;box-shadow:inset 0 1px rgba(255,255,255,.28),0 5px 12px rgba(0,0,0,.4)!important;text-shadow:0 2px 2px rgba(0,0,0,.45)}
/* Preserve grids but force sane text sizing/wrapping. */
#home [class*="benefit"],#home [class*="feature"],#home [class*="game-card"],#home [class*="category-card"]{min-width:0!important;overflow:hidden!important}
#home [class*="benefit"] *,#home [class*="feature"] *,#home [class*="game-card"] *,#home [class*="category-card"] *{word-break:normal!important;overflow-wrap:normal!important;hyphens:none!important}
#home [class*="benefit-card"],#home [class*="feature-card"]{background:linear-gradient(180deg,#152735 0%,#0a131c 100%)!important;border:3px solid #74818a!important;border-radius:13px!important;box-shadow:inset 0 0 0 2px #0a0f13,0 6px 13px rgba(0,0,0,.4)!important;padding:12px 8px!important;text-align:center!important}
#home [class*="benefit-card"] b,#home [class*="benefit-card"] strong,#home [class*="feature-card"] b,#home [class*="feature-card"] strong{display:block!important;font-family:Impact,'Arial Narrow',Arial,sans-serif!important;font-size:15px!important;line-height:1.08!important;letter-spacing:.35px!important;white-space:normal!important;word-break:keep-all!important;overflow-wrap:normal!important}
#home [class*="benefit-card"] .small,#home [class*="feature-card"] .small{font-size:10px!important;line-height:1.25!important;margin-top:5px!important}
#home [class*="benefit-icon"],#home [class*="feature-icon"]{width:48px!important;height:48px!important;display:flex!important;align-items:center!important;justify-content:center!important;margin:0 auto 7px!important;border-radius:50%!important;background:radial-gradient(circle at 35% 25%,#30485b,#101b25 58%,#070c11)!important;border:2px solid #84919a!important;box-shadow:inset 0 0 0 2px #0b1116,0 4px 8px rgba(0,0,0,.4)!important;font-size:23px!important;line-height:1!important}
/* category/game tiles: blue upper panel, dark wood lower panel like reference */
#home [class*="game-card"],#home [class*="category-card"]{position:relative!important;background:linear-gradient(180deg,#183348 0 47%,#32190d 47% 100%)!important;border:3px solid #707d86!important;border-radius:14px!important;box-shadow:inset 0 0 0 2px #0b1116,0 7px 15px rgba(0,0,0,.42)!important;padding:13px!important;min-height:170px!important}
#home [class*="game-card"] b,#home [class*="game-card"] strong,#home [class*="category-card"] b,#home [class*="category-card"] strong{font-family:Impact,'Arial Narrow',Arial,sans-serif!important;font-size:18px!important;line-height:1.05!important;letter-spacing:.35px!important;white-space:normal!important;word-break:keep-all!important;overflow-wrap:normal!important;max-width:100%!important}
#home [class*="game-card"] .small,#home [class*="category-card"] .small{font-size:10px!important;line-height:1.15!important;letter-spacing:.4px!important;text-transform:uppercase!important}
#home [class*="game-icon"],#home [class*="category-icon"]{display:flex!important;align-items:center!important;justify-content:center!important;width:50px!important;height:50px!important;border-radius:50%!important;background:radial-gradient(circle at 35% 25%,#526677,#172633 60%,#091018)!important;border:2px solid #9aa4aa!important;box-shadow:inset 0 0 0 2px #0c1115,0 4px 9px rgba(0,0,0,.45)!important;font-size:25px!important;line-height:1!important}
/* existing arrow controls become orange metal buttons */
#home [class*="game-card"] button,#home [class*="category-card"] button{background:linear-gradient(180deg,#31180b,#160b06)!important;border:2px solid #e75b12!important;color:#ff7a24!important;border-radius:9px!important;min-width:34px!important;min-height:34px!important;padding:4px 8px!important}
/* navigation remains exactly where it is */
.tabs{gap:7px!important;background:linear-gradient(180deg,#08121a,#04080c)!important;border-bottom:1px solid #46545f!important;padding:8px 0!important}
.tabs button,.demo-tabs-real button,.special-tabs-v137 button{border:3px solid #75828b!important;border-radius:12px!important;background:linear-gradient(180deg,#1b2a36,#0a1118)!important;box-shadow:inset 0 0 0 2px #090e12,0 4px 10px rgba(0,0,0,.42)!important}
.tabs button.active{border-color:#ff7622!important;box-shadow:inset 0 0 0 2px #111,0 0 0 1px #ff9a5e,0 5px 12px rgba(0,0,0,.45)!important}
/* Picks header/reference treatment */
#picks > .card.row:first-of-type{position:relative;flex-wrap:wrap;gap:4px 12px;padding:14px 16px 13px;background:linear-gradient(180deg,#173e5b,#0b2235)!important;border:3px solid #7a8790!important;box-shadow:inset 0 0 0 2px #0a1117,0 7px 18px rgba(0,0,0,.4)!important}
#picks > .card.row:first-of-type::before{content:'PICKS';width:100%;color:#ff7a24;font-size:12px;font-weight:950;letter-spacing:1.7px;text-transform:uppercase}
#picks #weekTitle{font-size:18px;font-weight:950;color:#fff}#picks #pickCount{font-size:14px;font-weight:950;color:#dce9f3}
.game,.compare-player,.score-game{border:2px solid #566570!important;box-shadow:0 5px 13px rgba(0,0,0,.32)!important}
.team{border-width:3px!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.07),0 4px 10px rgba(0,0,0,.3)!important}
#standingsBody tr.links-my-rank-v205 td{background:rgba(255,100,24,.13)!important;border-top:2px solid #ff7622!important;border-bottom:2px solid #ff7622!important}
#standingsBody tr.links-my-rank-v205 td:first-child{border-left:2px solid #ff7622!important}#standingsBody tr.links-my-rank-v205 td:last-child{border-right:2px solid #ff7622!important}
#standingsBody .links-my-rank-label-v205{display:inline-block;margin-left:6px;padding:2px 6px;border-radius:999px;background:#ff6418;color:#fff;font-size:9px;font-weight:950;letter-spacing:.5px;vertical-align:middle}
.links-build-footer{color:#9da8b0!important;letter-spacing:1.4px!important}
@media(min-width:650px){#home [class*="benefit-card"] b,#home [class*="feature-card"] b{font-size:16px!important}#home [class*="game-card"] b,#home [class*="category-card"] b{font-size:20px!important}}
@media(max-width:560px){.wrap{padding-left:9px!important;padding-right:9px!important}#home .card{border-radius:14px!important}#home [class*="benefit-card"] b,#home [class*="feature-card"] b{font-size:12px!important}#home [class*="game-card"] b,#home [class*="category-card"] b{font-size:15px!important}#home [class*="game-card"],#home [class*="category-card"]{min-height:145px!important;padding:9px!important}.tabs{gap:5px!important}#picks > .card.row:first-of-type{padding:12px 13px}}
</style>`;
  html = html.replace("</head>", `${css}\n</head>`);

  // Top 10 plus signed-in player's actual rank; no standings data changes.
  const rowsSource='(d.rows||[]).map((r,i)=>{';
  const rowsReplacement=`(()=>{const allRows=d.rows||[];const visibleRows=allRows.slice(0,10).map((r,i)=>({...r,__v205Rank:i+1,__v205Mine:false}));const meName=String($("#currentUser")?.textContent||"").trim();const meIndex=allRows.findIndex(r=>String(r.player||"").trim()===meName);if(meIndex>=10){visibleRows.push({...allRows[meIndex],__v205Rank:meIndex+1,__v205Mine:true})}else if(meIndex>=0&&visibleRows[meIndex]){visibleRows[meIndex].__v205Mine=true}return visibleRows})().map((r,i)=>{`;
  html=html.replace(rowsSource,rowsReplacement);
  const rowSource='return `<tr class="${won?"winner":""}"><td>${i+1}</td><td>${r.player}${won?" 🏆 WINNER":""}</td>';
  const rowReplacement='return `<tr class="${won?"winner":""}${r.__v205Mine?" links-my-rank-v205":""}"><td>${r.__v205Rank||i+1}</td><td>${r.player}${r.__v205Mine?" <span class=\\"links-my-rank-label-v205\\">YOU</span>":""}${won?" 🏆 WINNER":""}</td>';
  html=html.replace(rowSource,rowReplacement);

  for(const v of ["v202","v203","v204"]){html=html.replace(`LINKS PICK’EM POOLS — ${v}`,"LINKS PICK’EM POOLS — v205");html=html.replace(`LINKS PICK'EM POOLS — ${v}`,"LINKS PICK'EM POOLS — v205")}
  const headers=new Headers(response.headers);headers.delete("content-length");headers.set("cache-control","no-cache, no-store, must-revalidate");headers.set("x-links-build","v205");
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
