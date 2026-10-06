const games=new Set(['trivia-rally','million-point','dead-air','say-what','last-alibi','captain-clash','friend-challenge','trivia-night']);
const query=new URLSearchParams(location.search);
const candidate=query.get('returnTo') || (query.get('next') ? './'+query.get('next') : '');
if(candidate){
 try{
  const url=new URL(candidate,location.href);
  const game=url.pathname.replace(/^\/new-build\//,'').replace(/\.html$/,'');
  if(url.origin===location.origin && url.pathname.startsWith('/new-build/') && games.has(game)){
   document.querySelectorAll('[data-host-back]').forEach(link=>link.href=url.pathname+url.search+url.hash);
  }
 }catch{}
}
