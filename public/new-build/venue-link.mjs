const el=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e};
let context='',last=0,loading=false,box,requestHeaders,activeGame,activeRoom,autoTried=false,bannerOnly=false,bannerHost=null,choosing=false,locating=false;
async function api(body){const r=await fetch('./api/venue-scoreboard'+(body?'':'?'+new URLSearchParams({game:activeGame,room:activeRoom})),{method:body?'POST':'GET',headers:requestHeaders,cache:'no-store',...(body?{body:JSON.stringify({game:activeGame,room:activeRoom,...body})}:{})});const j=await r.json();if(!r.ok)throw Error(j.error||'Venue unavailable.');return j}
function button(text,fn){const b=el('button',text);b.type='button';b.onclick=fn;return b}
function mount(){if(box)return;const style=el('style');style.textContent='.links-venue{box-sizing:border-box;max-width:1280px;margin:10px auto;padding:10px 16px;border:1px solid #b8985055;border-radius:12px;background:#11171b;color:#efd28a;font:14px system-ui;display:flex;align-items:center;gap:10px;flex-wrap:wrap}.links-venue[hidden]{display:none}.links-venue button,.links-venue a{font:inherit;padding:10px 12px;min-height:44px;border:1px solid #b89850;border-radius:8px;background:#20241f;color:#efd28a;text-decoration:none}.links-venue p{width:100%;margin:0;font:13px system-ui;color:#ccd0d2}.links-venue img{width:44px;height:36px;object-fit:contain}.links-venue input{max-width:100%;font:16px system-ui}.links-venue details{width:100%}';document.head.append(style);box=el('aside');box.className='links-venue';box.setAttribute('aria-label','Venue standings');box.hidden=true;if(bannerHost)bannerHost.append(box);else (document.querySelector('header')||document.body.firstElementChild).after(box)}
function show(j){mount();if(bannerOnly){showBanner(j);return}box.replaceChildren();box.hidden=!j.venue&&!j.canChoose;
 if(j.venue){const img=el('img');img.src=j.venue.logo;img.alt='';img.onerror=()=>img.remove();const a=el('a',j.venue.name+' Standings');a.href='./venue-scoreboard.html?'+new URLSearchParams({partner:j.venue.id,game:activeGame,room:activeRoom});a.target='_blank';a.rel='noopener';box.append(img,el('span','Playing at '+j.venue.name),a);return}
 if(!j.canChoose)return;box.append(button('Find my venue · GPS',locate));box.append(el('p','Connect this room before starting. Your game names and scores appear on the venue board. Only the host needs location.'));
 const d=el('details'),summary=el('summary','Have a venue QR link?'),input=el('input');input.placeholder='Paste the partner QR link';input.setAttribute('aria-label','Partner QR link');d.append(summary,input,button('Use this venue',async()=>{try{const ref=new URL(input.value).searchParams.get('ref');if(!ref)throw Error('Paste a LINKS partner QR link.');show(await api({ref}))}catch(e){box.append(el('p',e.message))}}));box.append(d);
 if(!autoTried){autoTried=true;navigator.permissions?.query({name:'geolocation'}).then(p=>{if(p.state==='granted')locate()}).catch(()=>{})}
}
async function locate(){if(locating)return;locating=true;const locationContext=context;try{await findVenue(locationContext)}finally{locating=false}}
async function findVenue(locationContext){if(bannerOnly){choosing=true;box.hidden=false;box.replaceChildren()}if(!navigator.geolocation){if(bannerOnly)await manualVenues('GPS is unavailable. Choose your venue.',locationContext);else box.append(el('p','Location unavailable. Use the venue QR link.'));return}const note=el('p','Finding venue…');box.append(note);try{const position=await new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,maximumAge:0,timeout:12000}));if(locationContext!==context)return;const coords={latitude:position.coords.latitude,longitude:position.coords.longitude,accuracy:position.coords.accuracy};if(coords.accuracy>150)throw Error('Location is too approximate. Try again near the venue or use its QR link.');const r=await fetch('./api/partners?public=1',{cache:'no-store'});if(!r.ok)throw Error('Partner list unavailable.');const {nearby}=await import('./partner-match.mjs'),data=await r.json();const candidates=nearby(data.partners,coords).candidates.filter(p=>p.distance<=p.radius);if(!candidates.length)throw Error('No partner found at this location. You can still play normally.');if(locationContext!==context)return;if(candidates.length===1){const result=await api({partner:candidates[0].id,coords});if(locationContext===context)show(result);return}if(bannerOnly){showChoices(candidates,coords);return}note.textContent='Which venue are you playing at?';for(const p of candidates)box.append(button(p.name,async()=>{try{show(await api({partner:p.id,coords}))}catch(e){note.textContent=e.message}}));}catch(e){note.textContent=e.code?'Location unavailable.':e.message;if(locationContext!==context)return;if(bannerOnly)await manualVenues(e.code?'GPS is unavailable. Choose your venue.':'GPS could not pinpoint your venue. Choose it below.',locationContext)}}
export async function updateVenueRoom(game,room,token,authorization='',options={}){
 bannerOnly=!!options.bannerOnly;bannerHost=options.host||null;
 if(!room||(!token&&!authorization&&!options.account))return;const key=game+':'+room;if(key!==context){context=key;last=0;autoTried=false;choosing=false;if(box)box.hidden=true}if(loading||Date.now()-last<15000)return;loading=true;last=Date.now();activeGame=game;activeRoom=room;requestHeaders={'Content-Type':'application/json','x-venue-token':token||'',...(options.account?{'x-links-account':options.account}:{}),...(authorization?{Authorization:'Bearer '+authorization}:{})};try{const j=await api();if(context===key)show(j)}catch{}finally{loading=false}
}

function showBanner(j){
 box.setAttribute('aria-label','Venue banner');box.classList.add('venue-banner');
 if(j.venue){choosing=false;box.replaceChildren();box.hidden=false;const img=el('img');img.src=j.venue.logo;img.alt=j.venue.name;img.onerror=()=>img.remove();box.append(img,el('strong',j.venue.name));return}
 if(choosing&&j.canChoose)return;
 box.replaceChildren();box.hidden=true;
 if(j.canChoose&&!autoTried){autoTried=true;try{if(localStorage.getItem('links-partner-location')==='no'){box.hidden=false;void manualVenues('Choose your venue.',context);return}}catch{}box.hidden=false;locate()}
}
function showChoices(candidates,coords,manual=false){
 const choiceContext=context;
 choosing=true;box.replaceChildren();box.hidden=false;
 const details=el('details'),summary=el('summary','Choose venue');details.append(summary);
 for(const p of candidates)details.append(button(p.name+(p.address?' · '+p.address:''),async()=>{try{if(choiceContext!==context)return;const result=await api({partner:p.id,...(manual?{confirmVenue:true}:{coords})});if(choiceContext===context)show(result)}catch(e){box.append(el('p',e.message))}}));
 box.append(details);
}

async function manualVenues(message,locationContext){
 if(locationContext!==context)return;
 try{const response=await fetch('./api/partners?public=1',{cache:'no-store'});if(!response.ok)throw Error('Venue list unavailable.');const data=await response.json();if(locationContext!==context)return;
 if(data.partners?.length){showChoices(data.partners,null,true);box.prepend(el('p',message))}else{box.replaceChildren(el('p','No active venues are available. Check the venue setup.'))}
 }catch{if(locationContext===context)box.replaceChildren(el('p','Venue list unavailable. Please retry.'))}
 if(locationContext===context)box.append(button('Retry GPS',locate));
}
