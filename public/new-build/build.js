window.LINKS_BUILD='770';
(function(){
const V=window.LINKS_BUILD,LOGO='./assets/ChatGPT Image Sep 22, 2026, 07_35_27 PM.png';
function syncVisibleBuild(){
  document.querySelectorAll('.version,[data-links-build]').forEach(function(el){
    if(el.classList.contains('version')) el.textContent='NEW BUILD · v'+V;
    else el.textContent='v'+V;
  });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',syncVisibleBuild);
else syncVisibleBuild();
})();