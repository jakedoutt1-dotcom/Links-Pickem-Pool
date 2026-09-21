/* LINKS Game 33 module v593 — intentionally contains no NFL Pick'em handlers. */
window.LinksGame33Module=Object.freeze({game:"33",version:"v593"});

(()=>{
 function sync(){
   const b=document.getElementById("g33AdminButtonV594"); if(!b)return;
   if(window.isCommissioner)b.classList.add("links-g33-commissioner"); else b.classList.remove("links-g33-commissioner");
 }
 document.addEventListener("click",e=>{
   const b=e.target.closest?.("#g33AdminButtonV594");if(!b)return;
   e.preventDefault();
   const panel=document.getElementById("g33Admin");if(!panel)return;
   panel.classList.remove("hide");b.classList.add("active");
   if(typeof window.render33==="function")window.render33();
   setTimeout(()=>panel.scrollIntoView({behavior:"smooth",block:"start"}),60);
 });
 new MutationObserver(sync).observe(document.documentElement,{subtree:true,childList:true,attributes:true});
 document.addEventListener("DOMContentLoaded",sync);setTimeout(sync,500);
})();
