(()=>{
 if(window.LINKS_PASSWORD_VISIBILITY)return;window.LINKS_PASSWORD_VISIBILITY=true;
 const start=()=>{
 const style=document.createElement('style');style.textContent='.links-password-field{display:grid!important;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;width:100%;min-width:0}.links-password-field>input{min-width:0!important;width:100%!important;box-sizing:border-box}.links-password-field>.links-password-toggle{position:static!important;width:auto!important;min-width:58px;min-height:44px;margin:0!important;padding:8px!important;border:1px solid #385e75!important;border-radius:7px;background:#102a3b!important;color:#fff!important;font:700 13px Arial,sans-serif!important;cursor:pointer}.links-password-toggle:focus-visible{outline:2px solid #edc466;outline-offset:2px}';document.head.append(style);
 const fields=new Map();let counter=0;
 const conceal=(input,button)=>{input.type='password';button.textContent='Show';button.setAttribute('aria-pressed','false');button.setAttribute('aria-label','Show password')};
 function scan(){for(const [input]of fields)if(!input.isConnected)fields.delete(input);document.querySelectorAll('input[type=password]').forEach(input=>{if(fields.has(input))return;const wrap=document.createElement('span');wrap.className='links-password-field';input.before(wrap);wrap.append(input);const button=document.createElement('button');button.type='button';button.className='links-password-toggle';if(!input.id)input.id='links-password-'+(++counter);button.setAttribute('aria-controls',input.id);conceal(input,button);button.disabled=input.disabled;wrap.append(button);fields.set(input,button);button.onclick=()=>{const shown=input.type==='password';input.type=shown?'text':'password';button.textContent=shown?'Hide':'Show';button.setAttribute('aria-label',shown?'Hide password':'Show password');button.setAttribute('aria-pressed',String(shown))};});}
 scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
 document.addEventListener('reset',e=>{for(const [input,button]of fields)if(input.form===e.target)conceal(input,button)},true);
 document.addEventListener('submit',e=>{for(const [input,button]of fields)if(input.form===e.target)conceal(input,button)},true);
 document.addEventListener('close',e=>{for(const [input,button]of fields)if(e.target.contains(input))conceal(input,button)},true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const [input,button]of fields)conceal(input,button)});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
