// LINKS v204 — reference-style visual skin layered over the verified working app.
// Layout, IDs, navigation, forms, pool flows, and game logic remain untouched.
export async function onRequest(context) {
  const response = await context.next();
  if (context.request.method !== "GET") return response;
  const url = new URL(context.request.url);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;
  if (!(url.pathname === "/" || url.pathname === "/index.html")) return response;

  let html = await response.text();
  const css = `
<style id="links-v204-reference-skin">
:root{--links-orange:#ff6418;--links-orange2:#ff7b24;--links-steel:#71808b;--links-steel-dark:#34414b;--links-wood:#25140b;--links-navy:#0b1722}
body{background:#05090d!important;background-image:radial-gradient(circle at 50% -8%,rgba(255,255,255,.12),transparent 25%),linear-gradient(180deg,#060b10 0,#090d12 55%,#04070a 100%)!important}
.wrap{max-width:800px!important}
.card,.login{background:linear-gradient(180deg,rgba(25,34,44,.98),rgba(12,18,25,.98))!important;border:2px solid #52606c!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.045),0 8px 22px rgba(0,0,0,.38)!important}
button{border:2px solid #52606c!important;box-shadow:inset 0 1px rgba(255,255,255,.08),0 4px 10px rgba(0,0,0,.28)}
button.blue,.blue{background:linear-gradient(180deg,var(--links-orange2),var(--links-orange))!important;border-color:#ff9a5e!important;color:#fff!important;text-shadow:0 2px 2px rgba(0,0,0,.35)}
/* Keep the current page layout; give its existing sections the reference's wood/metal sports finish. */
#home .card{background:linear-gradient(90deg,rgba(41,21,11,.97),rgba(23,12,7,.97),rgba(41,21,11,.97))!important;border:3px solid #687680!important;border-radius:20px!important;box-shadow:inset 0 0 0 3px #11181e,0 10px 24px rgba(0,0,0,.45)!important}
#home h1,#home h2,#home h3,#home b{letter-spacing:.3px}
#home button{font-weight:950;text-transform:uppercase;letter-spacing:.25px}
#home button.blue{background:linear-gradient(180deg,#ff7a22,#ff5b0b)!important;border-color:#ff9a5e!important;box-shadow:inset 0 1px rgba(255,255,255,.25),0 7px 15px rgba(0,0,0,.38)!important}
#home .small{color:#e1e5e8!important}
/* Existing v202 benefit/game cards: preserve grid and content, replace generic visual treatment. */
#home .links-v202-benefit-card,#home .links-v202-game-card,#home [class*="benefit-card"],#home [class*="game-card"]{background:linear-gradient(180deg,#2c170d 0%,#160c07 100%)!important;border:4px solid #69757d!important;border-radius:18px!important;box-shadow:inset 0 0 0 3px #0d1216,0 7px 16px rgba(0,0,0,.45)!important;color:#fff!important}
#home .links-v202-benefit-card:hover,#home .links-v202-game-card:hover{transform:translateY(-2px);border-color:#8e9aa2!important}
/* Replace the oversized emoji look with restrained icon badges while retaining existing text/content. */
#home .links-v202-benefit-icon,#home .links-v202-game-icon,#home [class*="benefit-icon"],#home [class*="game-icon"]{display:flex!important;align-items:center!important;justify-content:center!important;width:54px!important;height:54px!important;margin:0 auto 8px!important;border-radius:13px!important;background:linear-gradient(180deg,#172532,#09121b)!important;border:2px solid #69757d!important;font-size:26px!important;line-height:1!important;overflow:hidden!important;text-shadow:none!important}
/* Main player navigation keeps every existing click handler and image, but gets the reference's steel framing. */
.tabs{gap:8px!important;background:linear-gradient(180deg,#071019,#05090d)!important;border-bottom:1px solid #3f4d58;padding:8px 0!important}
.tabs button,.demo-tabs-real button,.special-tabs-v137 button{border:3px solid #687680!important;border-radius:13px!important;background:linear-gradient(180deg,#1b2732,#0c141c)!important;box-shadow:inset 0 0 0 2px #0b1015,0 4px 10px rgba(0,0,0,.38)!important}
.tabs button.active{border-color:#ff7a22!important;box-shadow:inset 0 0 0 2px #111,0 0 0 1px #ff9a5e,0 4px 12px rgba(0,0,0,.45)!important}
/* PickEm pages use the same visual language without moving controls. */
#picks > .card.row:first-of-type{position:relative;flex-wrap:wrap;gap:4px 12px;padding:14px 16px 13px;background:linear-gradient(180deg,#163f69 0%,#0d2b4b 58%,#081d35 100%)!important;border:3px solid #71808b!important;box-shadow:inset 0 0 0 2px rgba(255,255,255,.05),0 7px 18px rgba(0,0,0,.35)!important}
#picks > .card.row:first-of-type::before{content:'PICKS';width:100%;color:#fff;font-size:12px;font-weight:950;letter-spacing:1.7px;text-transform:uppercase;opacity:.92}
#picks #weekTitle{font-size:18px;font-weight:950;color:#fff}#picks #pickCount{font-size:14px;font-weight:950;color:#bfe1ff}
.game,.compare-player,.score-game{border:2px solid #4d5c68!important;box-shadow:0 5px 13px rgba(0,0,0,.3)!important}
.team{border-width:3px!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.07),0 4px 10px rgba(0,0,0,.3)!important}
#savePicks{background:linear-gradient(180deg,#ff7a22,#ff5b0b)!important;border-color:#ff9a5e!important;font-weight:950!important}
/* Standings personal rank from v203. */
#standingsBody tr.links-my-rank-v204 td{background:rgba(255,100,24,.12)!important;border-top:2px solid #ff7a22!important;border-bottom:2px solid #ff7a22!important}
#standingsBody tr.links-my-rank-v204 td:first-child{border-left:2px solid #ff7a22!important}#standingsBody tr.links-my-rank-v204 td:last-child{border-right:2px solid #ff7a22!important}
#standingsBody .links-my-rank-label-v204{display:inline-block;margin-left:6px;padding:2px 6px;border-radius:999px;background:#ff6418;color:#fff;font-size:9px;font-weight:950;letter-spacing:.5px;vertical-align:middle}
.links-build-footer{color:#aeb7bd!important;letter-spacing:1.4px!important}
@media(max-width:560px){.wrap{padding-left:10px!important;padding-right:10px!important}#home .card{border-radius:16px!important}#picks > .card.row:first-of-type{padding:12px 13px}.tabs{gap:6px!important}}
</style>`;
  html = html.replace("</head>", `${css}\n</head>`);

  // Preserve v203 Top-10 + signed-in player's true rank behavior.
  const rowsSource = '(d.rows||[]).map((r,i)=>{';
  const rowsReplacement = `(()=>{const allRows=d.rows||[];const visibleRows=allRows.slice(0,10).map((r,i)=>({...r,__v204Rank:i+1,__v204Mine:false}));const meName=String($("#currentUser")?.textContent||"").trim();const meIndex=allRows.findIndex(r=>String(r.player||"").trim()===meName);if(meIndex>=10){visibleRows.push({...allRows[meIndex],__v204Rank:meIndex+1,__v204Mine:true})}else if(meIndex>=0&&visibleRows[meIndex]){visibleRows[meIndex].__v204Mine=true}return visibleRows})().map((r,i)=>{`;
  html = html.replace(rowsSource, rowsReplacement);
  const rowSource = 'return `<tr class="${won?"winner":""}"><td>${i+1}</td><td>${r.player}${won?" 🏆 WINNER":""}</td>';
  const rowReplacement = 'return `<tr class="${won?"winner":""}${r.__v204Mine?" links-my-rank-v204":""}"><td>${r.__v204Rank||i+1}</td><td>${r.player}${r.__v204Mine?" <span class=\\"links-my-rank-label-v204\\">YOU</span>":""}${won?" 🏆 WINNER":""}</td>';
  html = html.replace(rowSource, rowReplacement);

  html = html.replace("LINKS PICK’EM POOLS — v202", "LINKS PICK’EM POOLS — v204");
  html = html.replace("LINKS PICK'EM POOLS — v202", "LINKS PICK'EM POOLS — v204");
  html = html.replace("LINKS PICK’EM POOLS — v203", "LINKS PICK’EM POOLS — v204");
  html = html.replace("LINKS PICK'EM POOLS — v203", "LINKS PICK'EM POOLS — v204");

  const headers = new Headers(response.headers);headers.delete("content-length");headers.set("cache-control","no-cache, no-store, must-revalidate");headers.set("x-links-build","v204");
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
