// LINKS v235 — keep v234 Home; replace brown panel backgrounds with solid black. No new images.
export async function onRequest(context){
 const url=new URL(context.request.url);
 if(context.request.method!=="GET")return context.next();
 const response=await context.next();
 const ct=response.headers.get("content-type")||"";
 if(!ct.includes("text/html"))return response;
 let html=await response.text();
 const blackPanels=`<style id="links-v235-black-panels">
/* Approved v235 cleanup: brown decorative panels become solid black. */
.links-plans-cta-v201,.links-plans-cta-v201 *:not(button):not(a),
[class*="category-card"],[class*="category-card"] *:not(button):not(a),
[class*="game-category"],[class*="game-category"] *:not(button):not(a),
[class*="pool-category"],[class*="pool-category"] *:not(button):not(a){background-color:#000!important}
</style><script id="links-v235-brown-to-black">(()=>{const brown=(s)=>{const m=(s||'').match(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)/i);if(!m)return false;const r=+m[1],g=+m[2],b=+m[3];return r>=25&&r<=105&&g>=8&&g<=65&&b<=45&&r>g*1.28&&g>b*1.15};const fix=()=>document.querySelectorAll('section,article,div,li').forEach(el=>{if(el.closest('button')||el.matches('button'))return;const c=getComputedStyle(el);if(brown(c.backgroundColor)){el.style.setProperty('background-color','#000','important');if(c.backgroundImage&&c.backgroundImage!=='none')el.style.setProperty('background-image','none','important')}});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix,{once:true});else fix();setTimeout(fix,350)})();</script>`;
 html=html.replace("</head>",blackPanels+"\n</head>");
 if(url.pathname==="/"||url.pathname==="/index.html"){
  const css=`<style id="links-v235">.links-pyg-v234{display:block;width:100%;border:3px solid #6d7479;border-radius:16px;background:#05090b;overflow:hidden}.links-pyg-v234 img{display:block;width:100%;height:auto;object-fit:contain;image-rendering:auto}.links-home-bottom-v234{max-width:1120px;margin:14px auto 0;padding:0 18px;box-sizing:border-box}.links-home-bottom-v234 img{display:block;width:100%;height:auto;object-fit:contain}.links-build-v234{text-align:center;color:#8e969d;font:600 12px/1.4 Arial,sans-serif;letter-spacing:.08em;padding:14px 8px 22px}.links-home-footer-v200,.links-home-master-v225,.links-approved-grid-v224,.links-approved-busy-v224,.links-approved-footer-v224,.links-home-art-v227,.links-home-art-v228,.links-home-art-v229,.links-home-art-v230,.links-home-art-v231,.links-home-art-v232,.links-home-art-v233,.links-home-bottom-v228,.links-home-bottom-v229,.links-home-bottom-v230,.links-home-bottom-v231,.links-home-bottom-v232,.links-home-bottom-v233,.links-benefits-v200,.links-benefits-v201,.links-benefits-strip-v200,.links-benefit-strip-v200{display:none!important}@media(max-width:700px){.links-home-bottom-v234{padding:0 14px}}</style>`;
  html=html.replace("</head>",css+"\n</head>");
  const banner=`<section class="links-games-categories-v193"><a class="links-pyg-v234" href="/pick-your-games"><img src="/pick-your-games-v207.svg?v=235" alt="Pick Your Games"></a></section>`;
  html=html.replace(/<section class="links-games-categories-v193"[\s\S]*?<\/section>\s*(?=<section class="links-plans-cta-v201">)/,banner+'\n');
  html=html.replace(/<section class="links-home-master-v225"[\s\S]*?<\/section>/g,'');
  html=html.replace(/<section class="links-home-footer-v200"[\s\S]*?<\/section>/g,'');
  html=html.replace(/<section[^>]*class="[^"]*(?:benefits|benefit-strip)[^"]*"[\s\S]*?<\/section>/gi,'');
  const bottom=`<section class="links-home-bottom-v234" aria-label="LINKS branding"><img src="/links-art/web-footer-v227.jpg?v=235" alt="Links Pick'em Pools — You pick. We track. You win. Bringing people together." loading="lazy"></section><div class="links-build-v234">LINKS PICK’EM POOLS — v235</div>`;
  if(/<footer[\s\S]*?<\/footer>/i.test(html))html=html.replace(/<footer[\s\S]*?<\/footer>/i,bottom);else html=html.replace("</body>",bottom+"\n</body>");
  html=html.replace(/LINKS PICK[’']EM POOLS — v\d+/g,"LINKS PICK’EM POOLS — v235");
 }
 const headers=new Headers(response.headers);headers.delete("content-length");headers.set("cache-control","no-cache, no-store, must-revalidate");headers.set("x-links-build","v235");return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
