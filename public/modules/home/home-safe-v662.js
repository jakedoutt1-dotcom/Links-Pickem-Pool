/* LINKS safe homepage adapter v662. Runs once. No observers. No API/database changes. */
(()=>{"use strict";
function init(){
 const home=document.getElementById("home");
 if(!home||home.dataset.safeHomeV662==="1")return;
 home.dataset.safeHomeV662="1";home.classList.add("links-home-safe-v662");document.body.classList.add("links-home-safe-v662");
 const login=document.getElementById("openPoolLoginV150")||document.getElementById("enterPoolBtn");
 const create=document.getElementById("createFreePoolTopV339")||document.getElementById("showCreatePool");
 const old=document.createElement("div");old.className="links-safe-old-v662";
 while(home.firstChild)old.appendChild(home.firstChild);
 const shell=document.createElement("div");shell.className="links-safe-shell-v662";
 shell.innerHTML=`<section class="links-safe-hero-v662"><div class="links-safe-copy-v662"><div class="script">Every Game.</div><div class="sub">ONE CONNECTION.</div></div><div class="links-safe-logo-v662"><img src="/new-build/assets/links-logo.png" alt="LINKS"></div><div class="links-safe-right-v662">PICK.<br><b>PLAY.</b><br>CONNECT.</div></section><div class="links-safe-actions-v662"></div><div class="links-safe-playmaker-v662" aria-label="LINKS Playmaker"></div><div class="links-safe-live-v662"><strong>● LINKS LIVE</strong><span>LIVE SCORES • POOL RESULTS • GAMES THAT MATTER</span></div><section class="links-safe-games-v662"></section><section class="links-safe-bigger-v662"><h2>REAL GAMES. REAL PEOPLE.<br><span>BIGGER TOGETHER.</span></h2><div class="links-safe-steps-v662"><div><strong>1</strong>CREATE</div><div><strong>2</strong>INVITE</div><div><strong>3</strong>PICK</div><div><strong>4</strong>PLAY</div></div></section>`;
 const actions=shell.querySelector(".links-safe-actions-v662");
 if(login){login.classList.add("links-login-action-v662");actions.appendChild(login)}
 if(create){create.classList.add("links-create-action-v662");actions.appendChild(create)}
 const games=shell.querySelector(".links-safe-games-v662");
 ["NFL PICK’EM","COLLEGE","SURVIVOR","CONFIDENCE","GAME 33","SQUARES","MARCH MADNESS","GOLF","NASCAR","CUSTOM"].forEach(name=>{const d=document.createElement("div");d.className="links-safe-game-v662";d.innerHTML=`<div><b>${name}</b>LINKS POOL GAME</div>`;games.appendChild(d)});
 home.append(shell,old);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();