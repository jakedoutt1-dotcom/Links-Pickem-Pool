// LINKS v225 — clean Home assembly from safe v224.
export async function onRequest(context){
 const url=new URL(context.request.url);
 if(context.request.method!=="GET")return context.next();
 const response=await context.next();
 const ct=response.headers.get("content-type")||"";
 if(!ct.includes("text/html")||!(url.pathname==="/"||url.pathname==="/index.html"))return response;
 let html=await response.text();
 const css=`<style id="links-v225">.links-pyg-v225{display:block;width:100%;overflow:hidden;border:3px solid #6d7479;border-radius:16px;background:#05090b}.links-pyg-v225 img,.links-home-master-v225 img{display:block;width:100%;height:auto}.links-home-master-v225{width:100%;margin:12px 0 8px;overflow:hidden;border-radius:12px}.links-footer-v218,.links-footer-v219,.links-footer-art-v220,.links-footer-art-v221,.links-footer-art-v222,.links-approved-footer-v224,.links-approved-grid-v224,.links-approved-busy-v224{display:none!important}</style>`;
 html=html.replace("</head>",css+"\n</head>");
 const banner=`<section class="links-games-categories-v193"><a class="links-pyg-v225" href="/pick-your-games"><img src="/pick-your-games-v207.svg?v=225" alt="Pick Your Games"></a></section>`;
 html=html.replace(/<section class="links-games-categories-v193"[\s\S]*?<\/section>\s*(?=<section class="links-plans-cta-v201">)/,banner+'\n');
 const art=`<section class="links-home-master-v225"><img src="/home-master-v221.svg?v=225" alt="LINKS features"></section>`;
 html=html.replace(/<div class="links-benefits-v193">[\s\S]*?<div class="links-no-busywork-v193">[\s\S]*?<\/div>/,art);
 html=html.replace(/LINKS PICK[’']EM POOLS — v\d+/g,"LINKS PICK’EM POOLS — v225");
 const headers=new Headers(response.headers);headers.delete("content-length");headers.set("cache-control","no-cache, no-store, must-revalidate");headers.set("x-links-build","v225");return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
