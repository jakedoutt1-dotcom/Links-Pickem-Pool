// LINKS v219 — fix Home footer: one dark wood/metal LINKS banner, remove duplicate feature block.
export async function onRequest(context){
 const url=new URL(context.request.url);
 if(context.request.method!=="GET")return context.next();
 if(url.pathname==="/pick-your-games"){
  const r=await context.next();return r;
 }
 const response=await context.next();const ct=response.headers.get("content-type")||"";
 if(!ct.includes("text/html")||!(url.pathname==="/"||url.pathname==="/index.html"))return response;
 let html=await response.text();
 const css=`<style id="links-v219">
.links-pyg-v212{display:block;width:100%;overflow:hidden;border:3px solid #6d7479;border-radius:16px;background:#05090b;box-shadow:0 10px 24px #000a}.links-pyg-v212 img{display:block;width:100%;height:auto}.links-build-footer{color:#9ca5aa!important}
/* keep only the original four upper benefit boxes, without overlay emoji */
#home .links-benefits-v193>div{position:relative;min-height:128px;padding:25px 12px 18px!important;border:2px solid #7d858a!important;border-radius:13px!important;background:linear-gradient(145deg,#32190b,#140a05 60%,#251207)!important;box-shadow:inset 0 0 0 3px #111,0 6px 14px #0009!important;display:flex!important;flex-direction:column!important;justify-content:center!important;overflow:hidden!important}
#home .links-benefits-v193>div:before{content:'LINKS';position:absolute;top:6px;left:50%;transform:translateX(-50%);font-size:9px;letter-spacing:2px;color:#d8b28d;border:1px solid #66503c;padding:1px 7px;background:#160b06}
#home .links-benefits-v193 b{font-size:17px;text-shadow:0 2px 2px #000}#home .links-benefits-v193 span{color:#eee!important}
/* old five-box bottom feature grids */
.links-feature-grid-v120,.landing-feature-grid,.feature-grid-v120,.links-home-features,.home-feature-grid,.feature-grid,.links-features-v120,.links-features{display:none!important}
/* single permanent footer matching the approved dark wood/metal reference */
.links-footer-v219{position:relative;margin:30px auto 12px;max-width:980px;min-height:180px;padding:22px 24px;display:grid;grid-template-columns:1fr 1.55fr 1fr;align-items:center;gap:16px;overflow:hidden;border-top:5px solid #24282b;border-bottom:5px solid #24282b;background:repeating-linear-gradient(0deg,#120b07 0,#120b07 16px,#1d1009 17px,#25140b 31px,#160c07 32px);box-shadow:inset 0 2px 0 #696969,inset 0 -2px 0 #050505,0 8px 20px #000c;color:#fff;text-align:center}
.links-footer-v219:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 13% 24%,#ff8b35 0 2px,transparent 8px),radial-gradient(circle at 27% 20%,#ffd08b 0 2px,transparent 7px),radial-gradient(circle at 73% 20%,#ffd08b 0 2px,transparent 7px),radial-gradient(circle at 87% 24%,#ff8b35 0 2px,transparent 8px);pointer-events:none}
.links-footer-v219 .tag{position:relative;z-index:1;font-family:'Arial Narrow',Arial,sans-serif;font-style:italic;font-weight:900;font-size:clamp(17px,2.7vw,30px);line-height:1.15;text-shadow:0 3px 3px #000;transform:rotate(-3deg)}
.links-footer-v219 .tag.right{transform:rotate(3deg)}
.links-footer-v219 .brand{position:relative;z-index:1;padding:13px 14px 11px;border:4px solid #74787a;border-radius:8px;background:linear-gradient(#28170f,#0c0907);box-shadow:inset 0 0 0 3px #171717,0 4px 10px #000}
.links-footer-v219 .brand:before{content:'🐾';display:block;margin:-34px auto -4px;width:46px;height:46px;line-height:46px;border:3px solid #56595b;border-radius:50%;background:#171717;font-size:25px;filter:saturate(1.5)}
.links-footer-v219 .brand strong{display:block;font-family:Georgia,'Times New Roman',serif;font-weight:900;font-size:clamp(34px,6vw,66px);line-height:.9;letter-spacing:2px;color:#d8c1ad;text-shadow:0 2px 0 #fff4,0 4px 3px #000}
.links-footer-v219 .brand small{display:block;margin-top:5px;font-weight:900;letter-spacing:3px;font-size:clamp(9px,1.5vw,15px);color:#e8ddd5}
@media(max-width:560px){.links-pyg-v212{border-radius:10px}.links-footer-v219{min-height:130px;padding:17px 8px;gap:7px;grid-template-columns:.9fr 1.45fr .9fr}.links-footer-v219 .tag{font-size:14px}.links-footer-v219 .brand{padding:10px 5px 8px;border-width:3px}.links-footer-v219 .brand:before{width:34px;height:34px;line-height:34px;margin:-27px auto -2px;font-size:19px}.links-footer-v219 .brand strong{font-size:29px}.links-footer-v219 .brand small{font-size:8px;letter-spacing:1.5px}}
</style>`;
 html=html.replace("</head>",css+"\n</head>");
 const banner=`<section class="links-games-categories-v193" aria-label="Choose your games"><a class="links-pyg-v212" href="/pick-your-games" aria-label="Pick Your Games"><img src="/pick-your-games-v207.svg?v=219" alt="Pick Your Games"></a></section>`;
 html=html.replace(/<section class="links-games-categories-v193" aria-label="Choose a Links pool category">[\s\S]*?<\/section>\s*(?=<section class="links-plans-cta-v201">)/,banner+'\n');
 /* remove emojis only from the known upper four benefits */
 const benefitOpen=html.indexOf('<div class="links-benefits-v193">');if(benefitOpen>-1){const busy=html.indexOf('<div class="links-no-busywork-v193">',benefitOpen);if(busy>-1){const part=html.slice(benefitOpen,busy).replace(/[🏆📊🔒👥📅📱]+/gu,'');html=html.slice(0,benefitOpen)+part+html.slice(busy)}}
 /* remove the entire legacy five-feature block robustly, including the last Secure & Reliable row */
 const fs=html.search(/AUTOMATED\s+SCORING/i),fe=html.search(/SECURE\s*(?:&amp;|&)\s*RELIABLE/i);if(fs>-1&&fe>fs){let s=html.lastIndexOf('<section',fs);const d=html.lastIndexOf('<div',fs);if(d>s)s=d;let cursor=fe,depth=0,e=-1;const token=/<div\b[^>]*>|<\/div>/gi;token.lastIndex=s;let m;while((m=token.exec(html))){if(m.index>=s){if(/^<div\b/i.test(m[0]))depth++;else depth--;if(depth===0){e=token.lastIndex;break}}}if(s>-1&&e>s)html=html.slice(0,s)+html.slice(e)}
 /* remove any v218 injected duplicate footer */
 html=html.replace(/<section class="links-footer-v218"[\s\S]*?<\/section>/gi,'');
 /* replace the original branded bottom panel with exactly one approved-style footer */
 const footer=`<section class="links-footer-v219" aria-label="Links Pick'em Pools"><div class="tag">YOU PICK.<br>WE TRACK. YOU WIN.</div><div class="brand"><strong>LINKS</strong><small>PICK’EM POOLS</small></div><div class="tag right">BRINGING PEOPLE<br>TOGETHER</div></section>`;
 const ba=html.search(/BRINGING\s+PEOPLE\s+TOGETHER/i);if(ba>-1){let s=html.lastIndexOf('<section',ba);if(s<0)s=html.lastIndexOf('<div',ba);let e=s>-1?html.indexOf('</section>',ba):-1;if(e>-1){e+=10;html=html.slice(0,s)+footer+html.slice(e)}}else{const mark=html.search(/LINKS PICK(?:’|')EM POOLS\s*[—-]\s*v\d+/i);if(mark>-1){const s=html.lastIndexOf('<',mark);html=html.slice(0,s)+footer+'\n'+html.slice(s)}}
 for(const v of ["v202","v203","v204","v205","v206","v207","v208","v209","v210","v211","v212","v213","v214","v215","v216","v217","v218"]){html=html.replaceAll(`LINKS PICK’EM POOLS — ${v}`,"LINKS PICK’EM POOLS — v219");html=html.replaceAll(`LINKS PICK'EM POOLS — ${v}`,"LINKS PICK'EM POOLS — v219")}
 const headers=new Headers(response.headers);headers.delete("content-length");headers.set("cache-control","no-cache, no-store, must-revalidate");headers.set("x-links-build","v219");return new Response(html,{status:response.status,statusText:response.statusText,headers});
}
