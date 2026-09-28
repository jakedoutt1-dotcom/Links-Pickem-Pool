/* LINKS single-source build version. Bump only this file for each release. */
window.LINKS_VERSION='777';
window.LINKS_BUILD=window.LINKS_VERSION;
(()=>{
 const V=String(window.LINKS_VERSION);
 function apply(){
  document.documentElement.dataset.linksBuild=V;
  document.querySelectorAll('[data-links-version]').forEach(el=>el.textContent='v'+V);
  document.querySelectorAll('.version,.foot,footer').forEach(el=>{
   const t=el.textContent||'';
   if(/new build/i.test(t)||/links new build/i.test(t)||/version/i.test(t)){
    el.textContent=t.replace(/(?:version\s*)?v?\s*\d+(?:\.\d+)?/ig,m=>/version/i.test(m)?'Version v'+V:'v'+V);
   }
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
 window.addEventListener('pageshow',apply);
})();
