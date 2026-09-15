// LINKS v203 — small presentation/leaderboard patch layered over the verified v202 app.
// Keeping this in middleware avoids a risky full-file rewrite of public/index.html.
export async function onRequest(context) {
  const response = await context.next();
  const req = context.request;
  if (req.method !== "GET") return response;

  const url = new URL(req.url);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;
  if (!(url.pathname === "/" || url.pathname === "/index.html")) return response;

  let html = await response.text();

  // v203: make the Picks page heading/bar use the same strong dark-blue visual
  // language as the PickEm Free header without touching game/pick logic.
  const v203Css = `
<style id="links-v203-picks-header">
#picks > .card.row:first-of-type{
  position:relative;
  flex-wrap:wrap;
  gap:4px 12px;
  padding:14px 16px 13px;
  background:linear-gradient(180deg,#163f69 0%,#0d2b4b 58%,#081d35 100%)!important;
  border:2px solid #4f8fc7!important;
  box-shadow:inset 0 0 0 2px rgba(255,255,255,.05),0 7px 18px rgba(0,0,0,.35)!important;
}
#picks > .card.row:first-of-type::before{
  content:'PICKS';
  width:100%;
  color:#fff;
  font-size:12px;
  font-weight:950;
  letter-spacing:1.7px;
  text-transform:uppercase;
  opacity:.92;
}
#picks #weekTitle{font-size:18px;font-weight:950;color:#fff}
#picks #pickCount{font-size:14px;font-weight:950;color:#bfe1ff}
#standingsBody tr.links-my-rank-v203 td{background:rgba(37,99,235,.16)!important;border-top:2px solid #4f8fc7!important;border-bottom:2px solid #4f8fc7!important}
#standingsBody tr.links-my-rank-v203 td:first-child{border-left:2px solid #4f8fc7!important}
#standingsBody tr.links-my-rank-v203 td:last-child{border-right:2px solid #4f8fc7!important}
#standingsBody tr.links-my-rank-v203 td:nth-child(2){font-weight:950;color:#bfe1ff!important}
#standingsBody .links-my-rank-label-v203{display:inline-block;margin-left:6px;padding:2px 6px;border-radius:999px;background:#2563eb;color:#fff;font-size:9px;font-weight:950;letter-spacing:.5px;vertical-align:middle}
@media(max-width:560px){#picks > .card.row:first-of-type{padding:12px 13px}#picks #weekTitle{font-size:16px}#picks #pickCount{font-size:12px}}
</style>`;
  html = html.replace("</head>", `${v203Css}\n</head>`);

  // v203 leaderboard behavior: show the Top 10 plus the signed-in player's
  // true rank when that player is outside the Top 10.
  const rowsSource = '(d.rows||[]).map((r,i)=>{';
  const rowsReplacement = `(()=>{const allRows=d.rows||[];const visibleRows=allRows.slice(0,10).map((r,i)=>({...r,__v203Rank:i+1,__v203Mine:false}));const meName=String($("#currentUser")?.textContent||"").trim();const meIndex=allRows.findIndex(r=>String(r.player||"").trim()===meName);if(meIndex>=10){visibleRows.push({...allRows[meIndex],__v203Rank:meIndex+1,__v203Mine:true})}else if(meIndex>=0&&visibleRows[meIndex]){visibleRows[meIndex].__v203Mine=true}return visibleRows})().map((r,i)=>{`;
  html = html.replace(rowsSource, rowsReplacement);

  const standingRowSource = 'return `<tr class="${won?"winner":""}"><td>${i+1}</td><td>${r.player}${won?" 🏆 WINNER":""}</td>';
  const standingRowReplacement = 'return `<tr class="${won?"winner":""}${r.__v203Mine?" links-my-rank-v203":""}"><td>${r.__v203Rank||i+1}</td><td>${r.player}${r.__v203Mine?" <span class=\\"links-my-rank-label-v203\\">YOU</span>":""}${won?" 🏆 WINNER":""}</td>';
  html = html.replace(standingRowSource, standingRowReplacement);

  // Visible build marker.
  html = html.replace("LINKS PICK’EM POOLS — v202", "LINKS PICK’EM POOLS — v203");
  html = html.replace("LINKS PICK'EM POOLS — v202", "LINKS PICK'EM POOLS — v203");

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("cache-control", "no-cache, no-store, must-revalidate");
  headers.set("x-links-build", "v203");
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
}
