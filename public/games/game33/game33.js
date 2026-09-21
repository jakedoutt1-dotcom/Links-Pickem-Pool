/* LINKS Game 33 isolated module shell — safe migration step.
   No routing, login, session, or DOM injection is changed here. */
window.LinksGame33=Object.freeze({game:"33",migration:"safe-step-1"});

(()=>{
 function sync(){
   const b=document.getElementById("g33PageAdminV594");
   if(b)b.classList.toggle("links-g33-admin-visible",!!window.isCommissioner);
 }
 document.addEventListener("click",e=>{
   const b=e.target.closest?.("#g33PageAdminV594");if(!b)return;
   e.preventDefault();
   const panel=document.getElementById("g33Admin");if(!panel)return;
   panel.classList.remove("hide");b.classList.add("active");
   if(typeof window.render33==="function")window.render33();
   setTimeout(()=>panel.scrollIntoView({behavior:"smooth",block:"start"}),60);
 });
 new MutationObserver(sync).observe(document.documentElement,{subtree:true,childList:true,attributes:true});
 document.addEventListener("DOMContentLoaded",sync);setTimeout(sync,300);
})();
