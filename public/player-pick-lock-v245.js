(()=>{
  const $=s=>document.querySelector(s);
  let busy=false;
  function deadlinePassed(){
    try{const t=boot?.locks?.[week];return !!(t&&Date.parse(t)<=Date.now())}catch(e){return false}
  }
  function playerName(){try{return String(me?.player||'').trim()}catch(e){return''}}
  function key(){
    let pool='pool';try{pool=sessionStorage.getItem('poolCode')||sessionStorage.getItem('pool')||location.host}catch(e){}
    let sp='nfl',wk='1';try{sp=sport||sp;wk=week||wk}catch(e){}
    return 'links:my-picks-locked:'+pool+':'+sp+':'+wk+':'+playerName().toLowerCase();
  }
  function mineLocked(){try{return localStorage.getItem(key())==='1'}catch(e){return false}}
  function setMine(v){try{if(v)localStorage.setItem(key(),'1');else localStorage.removeItem(key())}catch(e){}}
  function canPlay(){try{return role==='player'||role==='admin'}catch(e){return false}}
  function paint(){
    const sec=$('#picks'),btn=$('#savePicks');if(!sec||!btn||!canPlay())return;
    const hard=deadlinePassed(),soft=!hard&&mineLocked();
    sec.querySelectorAll('.team[data-game]').forEach(b=>{if(soft){b.style.pointerEvents='none';b.setAttribute('aria-disabled','true')}else{b.style.removeProperty('pointer-events');b.removeAttribute('aria-disabled')}});
    const tie=$('#tieInput');if(tie&&soft)tie.disabled=true;
    let card=$('#linksMyPickLockV245');
    if(!card){card=document.createElement('div');card.id='linksMyPickLockV245';card.className='msg';btn.insertAdjacentElement('beforebegin',card)}
    if(hard){card.innerHTML='🔒 <b>WEEKLY PICKS ARE LOCKED</b><br><span class="small">The deadline has passed. Picks can no longer be changed.</span>';btn.style.display='none';return}
    btn.style.display='block';btn.disabled=false;
    if(soft){card.innerHTML='🔒 <b>MY PICKS ARE LOCKED IN</b><br><span class="small">Your picks are saved. You can unlock and change them until the weekly deadline.</span>';btn.textContent='🔓 UNLOCK MY PICKS';btn.classList.remove('blue');btn.classList.add('green')}
    else{card.innerHTML='';card.style.display='none';btn.textContent='🔒 LOCK IN MY PICKS';btn.classList.remove('green');btn.classList.add('blue')}
    if(soft)card.style.display='block';
  }
  async function click(e){
    const btn=e.target.closest?.('#savePicks');if(!btn||busy||!canPlay())return;
    e.preventDefault();e.stopImmediatePropagation();
    if(deadlinePassed()){paint();return}
    if(mineLocked()){setMine(false);try{renderPicks()}catch(x){}paint();try{msg('🔓 <b>Your picks are unlocked.</b><br>You can make changes until the deadline.',true)}catch(x){}return}
    let missing=0;try{missing=gamesNow().length-Object.keys(me.picks||{}).length}catch(x){}
    if(missing){try{msg(`⚠️ <b>You forgot a pick dumbass.</b><br>${missing} pick${missing===1?'':'s'} missing`)}catch(x){}return}
    busy=true;btn.disabled=true;btn.textContent='LOCKING IN…';
    try{
      await api(q('/api/picks'),{method:'POST',body:JSON.stringify({sport,week,picks:me.picks,tie:$('#tieInput').value})});
      me.tie=$('#tieInput').value;try{writePickPageCacheV194({boot,me})}catch(x){}
      setMine(true);try{renderPicks()}catch(x){}paint();try{msg('✅ <b>Your picks are saved and locked in.</b><br>You can unlock them and make changes until the deadline.',true)}catch(x){}
    }catch(err){try{msg(err.message)}catch(x){};paint()}finally{busy=false}
  }
  document.addEventListener('click',click,true);
  const start=()=>{paint();new MutationObserver(()=>requestAnimationFrame(paint)).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','disabled']});setInterval(paint,750)};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start,{once:true}):start();
})();