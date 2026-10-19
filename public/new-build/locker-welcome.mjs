export function mountLockerWelcome({needsSetup=false,playerKey='player'}={}){
 if(document.getElementById('lockerWelcome'))return;
 const key='links-locker-welcome-v1:'+encodeURIComponent(playerKey);
 const read=(store,name)=>{try{return store.getItem(name)}catch{return null}};
 const write=(store,name,value)=>{try{store.setItem(name,value)}catch{}};
 const dialog=document.createElement('dialog');dialog.id='lockerWelcome';dialog.className='locker-welcome';dialog.setAttribute('aria-labelledby','lockerWelcomeTitle');
 dialog.innerHTML='<img class="welcome-brand" src="/links-small-logo.png" alt="LINKS"><h2 id="lockerWelcomeTitle">Welcome to your Locker Room</h2>'+
 (needsSetup?'<section><h3>Make your next login easier</h3><p>Haven’t set up your new LINKS login yet? Create one username and password so you can sign in without searching for your pool each time.</p><p>Your existing pools, picks and roles stay saved. Already set it up? Keep using your new username and password.</p><a class="action welcome-primary" href="./links-login.html?setup=1">Set up my new login</a></section>':'')+
 '<section><h3>Help us make LINKS better</h3><p>Something not working well? Is a feature missing, or do you have an idea to improve LINKS? Your feedback is appreciated.</p><a id="lockerTextFeedback" class="action welcome-primary">Text Jake your feedback</a><p class="welcome-small">Opens a draft in your text app. You review and send it. You can also text 615-561-6218.</p></section><div class="welcome-actions"><button type="button" class="action" id="lockerWelcomeContinue" autofocus>Continue to Locker Room</button><button type="button" class="action welcome-quiet" id="lockerWelcomeDismiss">Don’t show again</button></div>';
 const body='Hi Jake, I have some feedback about LINKS.\n\nWhat could work better:\n\nSomething missing or an idea to improve it:\n';
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;
 dialog.querySelector('#lockerTextFeedback').href='sms:+16155616218'+(ios?'&':'?')+'body='+encodeURIComponent(body);
 document.body.append(dialog);
 const opener=document.createElement('button');opener.type='button';opener.className='action';opener.id='lockerWelcomeOpen';opener.textContent='Login help & feedback';
 document.querySelector('.room-footer')?.append(opener);
 function open(){if(dialog.open)return;history.pushState({...history.state,lockerWelcome:true},'',location.href);dialog.showModal();}
 function close(){dialog.close();if(history.state?.lockerWelcome)history.back();opener.focus({preventScroll:true});}
 opener.onclick=open;
 dialog.querySelector('#lockerWelcomeContinue').onclick=close;
 dialog.querySelector('#lockerWelcomeDismiss').onclick=()=>{write(localStorage,key,'dismissed');close();};
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 window.addEventListener('popstate',()=>{if(dialog.open&&!history.state?.lockerWelcome)dialog.close();});
 if(read(localStorage,key)!=='dismissed'&&!read(sessionStorage,key)){
  write(sessionStorage,key,'shown');open();
 }
}
