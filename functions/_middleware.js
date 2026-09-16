// LINKS v226 — remove broken master image; preserve working site.
export async function onRequest(context){
 const url=new URL(context.request.url);
 if(context.request.method!=="GET")return context.next();
 const response=await context.next();
 const ct=response.headers.get("content-type")||"";
 if(!ct.includes("text/html")||!(url.pathname==="/"||url.pathname==="/index.html"))return response;
 let html=await response.text();
 const css=`<style id="links-v226">.links-pyg-v226{display:block;width:100%;overflow:hidden;border:3px solid #6d7479;border-radius:16px;background:#05090b}.links-pyg-v226 img{display:block;width:100%;height:auto}.links-home-master-v225,.links-approved-grid-v224,.links-approved-busy-v224,.links-approved-footer-v224{display:none!important}</style>`;
 html=html.replace("</head>",css+"\n</head>");
 const banner=`<section class="links-games-categories-v193"><a class="links-pyg-v226" href="/pick-your-games"><img src="/pick-your-games-v207.svg?v=226" alt="Pick Your Games"></a></section>`;
 html=html.replace(/<section class="links-games-categories-v193"[\s\S]*?<\/section>\s*(?=<section class="links-plans-cta-v201">)/,banner+'\n');
 html=html.replace(/<section class="links-home-master-v225">[\s\S]*?<\/section>/g,'');
 html=html.replace(/LINKS PICK[’']EM POOLS — v\d+/g,"LINKS PICK’EM POOLS — v226");
 const headers=new Headers(response.headers);headers.delete("content-length");headers.set("cache-control","no-cache, no-store, must-revalidate");headers.set("x-links-build","v226");return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
