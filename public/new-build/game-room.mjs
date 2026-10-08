const $=id=>document.getElementById(id),headers=()=>({'x-links-account':localStorage.getItem('links-account-token')||''});
async function get(url){const r=await fetch('./api/'+url,{headers:headers(),cache:'no-store',signal:AbortSignal.timeout(15000)});const j=await r.json();if(!r.ok)throw Object.assign(Error(j.error||'Could not load your account.'),{status:r.status});return j}
const games={'trivia-rally':'Trivia Rally','million-point':'Million Point Challenge','dead-air':'Dead Air','last-alibi':'Last Alibi','friend-challenge':'Challenge a Friend Trivia'};
function roomLink(label,url){const a=document.createElement('a');a.href=url;a.textContent=label;$('roomLinks').append(a);$('savedRooms').hidden=false}
try{const recent=JSON.parse(localStorage.getItem('links-recent-games')||'[]');for(const r of recent){if(games[r.game]&&/^[a-z0-9-]{4,80}$/i.test(r.room)&&Date.now()-r.at<86400000)roomLink(games[r.game]+' · '+r.room,'./'+r.game+'.html?room='+encodeURIComponent(r.room))}}catch{}
async function load(){try{const session=await get('game-room');if(!session.signedIn){$('accountMessage').textContent='Create one LINKS account for your games and pools, or sign in to your existing account. You can still try the party games below.';return}
$('roomTitle').textContent=session.displayName?session.displayName+'’s Game Room':'MY GAME ROOM';$('accountMessage').textContent='Signed in · '+session.email;
$('gameAccount').replaceChildren();const pools=document.createElement('a');pools.href='./control-center.html';pools.textContent='My Locker Room';const signout=document.createElement('button');signout.textContent='Sign out';signout.onclick=async()=>{signout.disabled=true;try{const identity=await fetch('./api/player-account',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});if(!identity.ok&&identity.status!==401)throw Error('Could not sign out. Try again.');if(localStorage.getItem('links-account-token'))await fetch('./api/account',{method:'POST',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});await fetch('./api/party-pack',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});for(const k of ['links-account-token','links-legacy-token','links-token','links-current-pool'])localStorage.removeItem(k);location.reload()}catch(e){$('accountMessage').textContent=e.message;signout.disabled=false}};$('gameAccount').append(pools,signout);if(!session.identity){const login=document.createElement('a');login.href='./links-login.html?next=game-room';login.textContent='Use or create my LINKS login';$('gameAccount').prepend(login)}
try{const access=await get('party-pack');$('hostAccess').textContent=access.venueAccess?'Your hosted trivia access is active through '+new Date(access.venueAccess.paid_until).toLocaleDateString()+'.':'Choose a trivia host pass or use your admin-granted access. Guests join free.';if(access.venueAccess){const library=await get('trivia-night?action=library');for(const room of library.rooms||[])if(/^[A-F0-9]{10}$/.test(room.code))roomLink('Hosted Trivia · '+room.code,'./trivia-night.html?room='+room.code)}}catch(e){$('hostAccess').textContent='Could not check your trivia access. Open My trivia access to retry.'}
}catch(e){$('accountMessage').textContent='Your account could not load. Refresh to retry. Games below remain available.'}}
const carousel=$('gameCarousel');
// Shuffle only the visual game cards once per page entry; keep game URLs and state intact.
(function shuffleGameCards(){
  const cards=Array.from(carousel.querySelectorAll(':scope > .game'));
  if(cards.length<2)return;
  const random=new Uint32Array(cards.length);
  if(globalThis.crypto?.getRandomValues)crypto.getRandomValues(random);
  else for(let i=0;i<random.length;i++)random[i]=Math.floor(Math.random()*4294967296);
  for(let i=cards.length-1;i>0;i--){
    const j=random[i]%(i+1);
    [cards[i],cards[j]]=[cards[j],cards[i]];
  }
  carousel.replaceChildren(...cards);
  carousel.scrollLeft=0;
})();

function shelfEdges(){$('gamePrev').disabled=carousel.scrollLeft<=5;$('gameNext').disabled=carousel.scrollLeft+carousel.clientWidth>=carousel.scrollWidth-3}
function moveShelf(direction){const card=carousel.querySelector('.game');carousel.scrollBy({left:direction*(card.getBoundingClientRect().width+parseFloat(getComputedStyle(carousel).gap)),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
$('gamePrev').onclick=()=>moveShelf(-1);$('gameNext').onclick=()=>moveShelf(1);
carousel.addEventListener('scroll',shelfEdges,{passive:true});new ResizeObserver(shelfEdges).observe(carousel);
carousel.addEventListener('keydown',e=>{if(e.target===carousel&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();moveShelf(e.key==='ArrowLeft'?-1:1)}});shelfEdges();
await load();
