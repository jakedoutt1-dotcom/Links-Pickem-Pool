const slides=[...document.querySelectorAll('main>section')],intro=document.getElementById('venueIntro');let index=0,playing=true,timer,ready=false;
const nav=document.createElement('nav');nav.className='presentation-controls';nav.setAttribute('aria-label','Presentation controls');nav.innerHTML='<button type="button" data-prev>← Back</button><button type="button" data-play>Pause</button><button type="button" data-next>Forward →</button><small role="status"></small>';document.body.append(nav);
const prev=nav.querySelector('[data-prev]'),next=nav.querySelector('[data-next]'),play=nav.querySelector('[data-play]'),status=nav.querySelector('small');
const music=new Audio('./audio/game-night-groove.mp3');music.loop=true;music.volume=.28;music.preload='none';
let muted=false,audioPending=false;try{muted=localStorage.getItem('links-promo-muted')==='yes'}catch{}
const sound=document.createElement('button');sound.type='button';sound.className='promo-sound';document.querySelector('header').append(sound);
function soundLabel(){sound.textContent=muted?'Sound off':music.paused?'Sound on':'Mute';sound.setAttribute('aria-label',muted||music.paused?'Turn presentation music on':'Mute presentation music');sound.setAttribute('aria-pressed',String(!muted&&!music.paused))}
async function syncMusic(){if(muted||!ready||!playing||document.hidden){music.pause();soundLabel();return}if(audioPending||!music.paused)return;audioPending=true;try{await music.play();if(muted||!playing||document.hidden)music.pause()}catch{}finally{audioPending=false;soundLabel()}}
sound.onclick=()=>{muted=!music.paused&&!muted;try{localStorage.setItem('links-promo-muted',muted?'yes':'no')}catch{}syncMusic()};
intro.addEventListener('pointerdown',()=>{intro.hidden=true;ready=true;syncMusic();schedule()});
intro.insertAdjacentHTML('beforeend','<p class="music-hint">Tap for music · Presentation starts automatically</p>');
window.addEventListener('pagehide',()=>music.pause());document.addEventListener('visibilitychange',syncMusic);soundLabel();
function schedule(){clearTimeout(timer);if(ready&&playing&&!document.hidden)timer=setTimeout(()=>{if(index<slides.length-1)show(index+1);else{playing=false;draw()}},18000)}
function fitSlide(){const top=document.querySelector('main').getBoundingClientRect().top+scrollY;const space=Math.max(0,innerHeight-nav.getBoundingClientRect().height-top-24);document.documentElement.style.setProperty('--slide-space',space+'px')}
window.addEventListener('resize',fitSlide);window.visualViewport?.addEventListener('resize',fitSlide);
function draw(){slides.forEach((s,i)=>s.hidden=i!==index);prev.disabled=index===0;next.disabled=index===slides.length-1;play.textContent=playing?'Pause':'Play';play.setAttribute('aria-pressed',String(playing));status.textContent=(index+1)+' / '+slides.length+(playing?'':' · Paused');fitSlide();schedule();syncMusic()}
function show(i){index=Math.max(0,Math.min(slides.length-1,i));draw();window.scrollTo({top:0,behavior:'instant'})}
prev.onclick=()=>show(index-1);next.onclick=()=>show(index+1);play.onclick=()=>{if(!playing&&index===slides.length-1)index=0;playing=!playing;draw()};document.addEventListener('visibilitychange',schedule);
document.addEventListener('keydown',e=>{if(e.target.closest('button,.game-reel'))return;if(e.key==='ArrowRight'){e.preventDefault();show(index+1)}if(e.key==='ArrowLeft'){e.preventDefault();show(index-1)}});
draw();setTimeout(()=>{intro.hidden=true;ready=true;schedule();syncMusic()},2200);

for(const reel of document.querySelectorAll('.game-reel')){const pauseGallery=()=>{if(playing){playing=false;draw()}};reel.addEventListener('pointerdown',pauseGallery);reel.addEventListener('focusin',pauseGallery);reel.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();reel.scrollBy({left:reel.clientWidth*(e.key==='ArrowRight'?1:-1),behavior:'smooth'})}})}
