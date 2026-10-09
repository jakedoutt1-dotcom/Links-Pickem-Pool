const slides=[...document.querySelectorAll('main>section')],intro=document.getElementById('venueIntro');let index=0,playing=true,timer,ready=false;
const nav=document.createElement('nav');nav.className='presentation-controls';nav.setAttribute('aria-label','Presentation controls');nav.innerHTML='<button type="button" data-prev>← Back</button><button type="button" data-play>Pause</button><button type="button" data-next>Forward →</button><small role="status"></small>';document.body.append(nav);
const prev=nav.querySelector('[data-prev]'),next=nav.querySelector('[data-next]'),play=nav.querySelector('[data-play]'),status=nav.querySelector('small');
function schedule(){clearTimeout(timer);if(ready&&playing&&!document.hidden)timer=setTimeout(()=>{if(index<slides.length-1)show(index+1);else{playing=false;draw()}},18000)}
function fitSlide(){const top=document.querySelector('main').getBoundingClientRect().top+scrollY;const space=Math.max(0,innerHeight-nav.getBoundingClientRect().height-top-24);document.documentElement.style.setProperty('--slide-space',space+'px')}
window.addEventListener('resize',fitSlide);window.visualViewport?.addEventListener('resize',fitSlide);
function draw(){slides.forEach((s,i)=>s.hidden=i!==index);prev.disabled=index===0;next.disabled=index===slides.length-1;play.textContent=playing?'Pause':'Play';play.setAttribute('aria-pressed',String(playing));status.textContent=(index+1)+' / '+slides.length+(playing?'':' · Paused');fitSlide();schedule()}
function show(i){index=Math.max(0,Math.min(slides.length-1,i));draw();window.scrollTo({top:0,behavior:'instant'})}
prev.onclick=()=>show(index-1);next.onclick=()=>show(index+1);play.onclick=()=>{if(!playing&&index===slides.length-1)index=0;playing=!playing;draw()};document.addEventListener('visibilitychange',schedule);
document.addEventListener('keydown',e=>{if(e.target.closest('button'))return;if(e.key==='ArrowRight'){e.preventDefault();show(index+1)}if(e.key==='ArrowLeft'){e.preventDefault();show(index-1)}});
draw();setTimeout(()=>{intro.hidden=true;ready=true;schedule()},2200);
