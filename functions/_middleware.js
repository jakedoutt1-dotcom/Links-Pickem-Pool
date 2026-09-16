// LINKS v228 — real JPEG artwork, footer replacement, no generated images.
export async function onRequest(context){
 const url=new URL(context.request.url);
 if(context.request.method!=="GET")return context.next();
 const response=await context.next();
 const ct=response.headers.get("content-type")||"";
 if(!ct.includes("text/html")||!(url.pathname==="/"||url.pathname==="/index.html"))return response;
 let html=await response.text();
 const css=`<style id="links-v228">.links-pyg-v228{display:block;width:100%;border:3px solid #6d7479;border-radius:16px;background:#05090b}.links-pyg-v228 img{display:block;width:100%;height:auto;object-fit:contain;image-rendering:auto}.links-home-art-v228{max-width:1120px;margin:18px auto 0;padding:0 12px;box-sizing:border-box}.links-home-grid-v228{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.links-home-grid-v228 img,.links-home-wide-v228 img{display:block;width:100%;height:auto;object-fit:contain;border-radius:14px;overflow:visible}.links-home-wide-v228{margin-top:14px}.links-home-bottom-v228{max-width:1120px;margin:14px auto 0;padding:0 12px;box-sizing:border-box}.links-home-bottom-v228 img{display:block;width:100%;height:auto;object-fit:contain}.links-home-master-v225,.links-approved-grid-v224,.links-approved-busy-v224,.links-approved-footer-v224,.links-home-art-v227{display:none!important}@media(max-width:700px){.links-home-grid-v228{grid-template-columns:1fr;gap:10px}.links-home-art-v228,.links-home-bottom-v228{padding:0 8px}.links-home-wide-v228{margin-top:10px}}</style>`;
 html=html.replace("</head>",css+"\n</head>");
 const banner=`<section class="links-games-categories-v193"><a class="links-pyg-v228" href="/pick-your-games"><img src="/pick-your-games-v207.svg?v=228" alt="Pick Your Games"></a></section>`;
 html=html.replace(/<section class="links-games-categories-v193"[\s\S]*?<\/section>\s*(?=<section class="links-plans-cta-v201">)/,banner+'\n');
 html=html.replace(/<section class="links-home-master-v225">[\s\S]*?<\/section>/g,'');
 const features=`<section class="links-home-art-v228" aria-label="LINKS features"><div class="links-home-grid-v228"><img src="/links-art/web-auto-v227.jpg?v=228" alt="Automatic scoring — no hand scoring" loading="lazy"><img src="/links-art/web-standings-v227.jpg?v=228" alt="Live standings — players follow results themselves" loading="lazy"><img src="/links-art/web-deadlines-v227.jpg?v=228" alt="Picks and deadlines — everything stays organized" loading="lazy"><img src="/links-art/web-management-v227.jpg?v=228" alt="Player management — one commissioner dashboard" loading="lazy"></div><div class="links-home-wide-v228"><img src="/links-art/web-busy-v227.jpg?v=228" alt="No paper, no Excel, no weekly busywork" loading="lazy"></div></section>`;
 const anchor=/<section class="links-plans-cta-v201">/;
 if(anchor.test(html))html=html.replace(anchor,features+'\n<section class="links-plans-cta-v201">');
 const bottom=`<section class="links-home-bottom-v228" aria-label="LINKS Admin and branding"><img src="/links-art/web-admin-v227.jpg?v=228" alt="Links Admin" loading="lazy"><img src="/links-art/web-footer-v227.jpg?v=228" alt="Links Pick'em Pools — You pick. We track. You win. Bringing people together." loading="lazy"></section>`;
 // Replace the old landing footer with the approved Admin + LINKS branding artwork.
 if(/<footer[\s\S]*?<\/footer>/i.test(html))html=html.replace(/<footer[\s\S]*?<\/footer>/i,bottom);else html=html.replace("</body>",bottom+"\n</body>");
 html=html.replace(/LINKS PICK[’']EM POOLS — v\d+/g,"LINKS PICK’EM POOLS — v228");
 const headers=new Headers(response.headers);headers.delete("content-length");headers.set("cache-control","no-cache, no-store, must-revalidate");headers.set("x-links-build","v228");return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
