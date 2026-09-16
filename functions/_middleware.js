// LINKS v233 — restore approved Pick Your Games artwork; no generated replacement.
export async function onRequest(context){
 const url=new URL(context.request.url);
 if(context.request.method!=="GET")return context.next();
 const response=await context.next();
 const ct=response.headers.get("content-type")||"";
 if(!ct.includes("text/html")||!(url.pathname==="/"||url.pathname==="/index.html"))return response;
 let html=await response.text();
 const css=`<style id="links-v233">.links-pyg-v233{display:block;width:100%;border:3px solid #6d7479;border-radius:16px;background:#05090b;overflow:hidden}.links-pyg-v233 img{display:block;width:100%;height:auto;object-fit:contain;image-rendering:auto}.links-home-art-v233{max-width:1120px;margin:18px auto 0;padding:0 18px;box-sizing:border-box;overflow:visible}.links-home-grid-v233{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;overflow:visible}.links-home-card-v233{padding:5px;background:#000;overflow:visible}.links-home-card-v233 img{display:block;width:100%;height:auto;object-fit:contain;border-radius:0!important;clip-path:none!important;overflow:visible}.links-home-bottom-v233{max-width:1120px;margin:14px auto 0;padding:0 18px;box-sizing:border-box}.links-home-bottom-v233 img{display:block;width:100%;height:auto;object-fit:contain}.links-build-v233{text-align:center;color:#8e969d;font:600 12px/1.4 Arial,sans-serif;letter-spacing:.08em;padding:14px 8px 22px}.links-home-footer-v200,.links-home-master-v225,.links-approved-grid-v224,.links-approved-busy-v224,.links-approved-footer-v224,.links-home-art-v227,.links-home-art-v228,.links-home-art-v229,.links-home-art-v230,.links-home-art-v231,.links-home-art-v232,.links-home-bottom-v228,.links-home-bottom-v229,.links-home-bottom-v230,.links-home-bottom-v231,.links-home-bottom-v232,.links-benefits-v200,.links-benefits-v201,.links-benefits-strip-v200,.links-benefit-strip-v200{display:none!important}@media(max-width:700px){.links-home-grid-v233{grid-template-columns:1fr;gap:14px}.links-home-art-v233,.links-home-bottom-v233{padding:0 14px}.links-home-card-v233{padding:6px}}</style>`;
 html=html.replace("</head>",css+"\n</head>");
 const banner=`<section class="links-games-categories-v193"><a class="links-pyg-v233" href="/pick-your-games"><img src="/pick-your-games-v207.svg?v=233" alt="Pick Your Games"></a></section>`;
 html=html.replace(/<section class="links-games-categories-v193"[\s\S]*?<\/section>\s*(?=<section class="links-plans-cta-v201">)/,banner+'\n');
 html=html.replace(/<section class="links-home-master-v225"[\s\S]*?<\/section>/g,'');
 html=html.replace(/<section class="links-home-footer-v200"[\s\S]*?<\/section>/g,'');
 html=html.replace(/<section[^>]*class="[^"]*(?:benefits|benefit-strip)[^"]*"[\s\S]*?<\/section>/gi,'');
 const features=`<section class="links-home-art-v233" aria-label="LINKS features"><div class="links-home-grid-v233"><div class="links-home-card-v233"><img src="/links-art/web-auto-v227.jpg?v=233" alt="Automatic scoring — no hand scoring" loading="lazy"></div><div class="links-home-card-v233"><img src="/links-art/web-standings-v227.jpg?v=233" alt="Live standings — players follow results themselves" loading="lazy"></div><div class="links-home-card-v233"><img src="/links-art/web-deadlines-v227.jpg?v=233" alt="Picks and deadlines — everything stays organized" loading="lazy"></div><div class="links-home-card-v233"><img src="/links-art/web-management-v227.jpg?v=233" alt="Player management — one commissioner dashboard" loading="lazy"></div></div></section>`;
 const anchor=/<section class="links-plans-cta-v201">/;
 if(anchor.test(html))html=html.replace(anchor,features+'\n<section class="links-plans-cta-v201">');
 const bottom=`<section class="links-home-bottom-v233" aria-label="LINKS branding"><img src="/links-art/web-footer-v227.jpg?v=233" alt="Links Pick'em Pools — You pick. We track. You win. Bringing people together." loading="lazy"></section><div class="links-build-v233">LINKS PICK’EM POOLS — v233</div>`;
 if(/<footer[\s\S]*?<\/footer>/i.test(html))html=html.replace(/<footer[\s\S]*?<\/footer>/i,bottom);else html=html.replace("</body>",bottom+"\n</body>");
 html=html.replace(/LINKS PICK[’']EM POOLS — v\d+/g,"LINKS PICK’EM POOLS — v233");
 const headers=new Headers(response.headers);headers.delete("content-length");headers.set("cache-control","no-cache, no-store, must-revalidate");headers.set("x-links-build","v233");return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
