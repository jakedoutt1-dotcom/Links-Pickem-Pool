// Read the browser's autofill state, never infer it from nonempty fields alone.
export function browserAutofilled(input){
 for(const selector of [':autofill',':-webkit-autofill']){
  try{if(input.matches(selector))return true}catch{}
 }
 return false;
}
export function enableAutofillLogin(form,{isAutofilled=browserAutofilled,delay=600}={}){
 const username=form.elements.namedItem('login'),password=form.elements.namedItem('password');
 if(!username||!password)return ()=>{};
 let attempted=false,manual=false,timer;
 const controller=new AbortController(),options={signal:controller.signal};
 function stop(){clearInterval(timer);controller.abort()}
 function check(){
  if(!form.isConnected){stop();return}
  if(attempted||manual||document.hidden||!username.value.trim()||!password.value)return;
  if(!isAutofilled(username)||!isAutofilled(password)||!form.checkValidity())return;
  if(form.querySelector('[type="submit"]')?.disabled)return;
  attempted=true;stop();form.requestSubmit();
 }
 function edited(event){
  // Ordinary typing/pasting must never trigger automatic submission.
  if(event.type==='paste'||event.type==='keydown'&&(event.key.length===1||['Backspace','Delete'].includes(event.key)))manual=true;
 }
 for(const input of [username,password]){
  input.addEventListener('keydown',edited,options);input.addEventListener('paste',edited,options);
 }
 form.addEventListener('submit',()=>{attempted=true;stop()},options);
 window.addEventListener('pagehide',stop,options);
 timer=setInterval(check,delay);
 return stop;
}
