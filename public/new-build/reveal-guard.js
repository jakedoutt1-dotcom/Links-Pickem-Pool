// LINKS New Build v150 — reveal-critical truth guard.
// Keeps prototype/demo state from presenting as real user or live sportsbook data.
const DEMO_SELECTORS=[
  ".pick-engine",".slate-engine",".score-engine",".integrity",".deadline-center",
  ".field-reveal",".entrant-manager",".rivalry-card",".nightboard-card",".moment-card",
  ".pool-room-card",".spotlight-card",".field-card",".exposure-card",".broadcast-rail",
  ".stadium-hero .hero-score",".legacy-card",".recap-card",".trophy-card",
  ".home-live-strip",".home-brief",".mobile-readiness-v6"
];

function removePrototypeSurfaces(){
  DEMO_SELECTORS.forEach(sel=>document.querySelectorAll(sel).forEach(el=>el.remove()));
  document.querySelectorAll(".badge.live").forEach(el=>{
    if(/LIVE|SCORING/i.test(el.textContent||"")) {
      el.textContent="LINKS";
      el.classList.remove("live");
    }
  });
}

function validPoolName(name){
  if(!name) return false;
  try {
    if(typeof PoolHubData!=="undefined" && PoolHubData && Object.prototype.hasOwnProperty.call(PoolHubData,name)) return true;
  } catch {}
  try {
    const saved=JSON.parse(localStorage.getItem("links-created-pools-v1")||"[]");
    return Array.isArray(saved)&&saved.some(p=>p&&p.name===name);
  } catch { return false; }
}

function guardUnknownPool(){
  const u=new URL(location.href);
  if(u.searchParams.get("view")!=="pool") return;
  const name=u.searchParams.get("pool")||"";
  if(validPoolName(name)) return;
  u.searchParams.set("view","my-pools");
  u.searchParams.delete("pool");
  history.replaceState({route:"my-pools",pool:""},"",u);
  document.documentElement.dataset.view="my-pools";
  delete document.documentElement.dataset.pool;
  try { localStorage.setItem("links-new-build-state-v1",JSON.stringify({route:"my-pools",pool:""})); } catch {}
  const host=document.querySelector(".route-workspace");
  if(host) host.innerHTML='<section class="route-hero"><div><span>POOL NOT FOUND</span><h1>That pool is not available.</h1><p>Use your invite link or choose one of your saved pools. LINKS will never substitute a different pool.</p></div></section>';
}

function labelUnconnectedActions(){
  document.querySelectorAll("[data-remind],[data-remind-all]").forEach(btn=>{
    btn.dataset.delivery="local-only";
    btn.title="Testing only — no email or text is sent without a connected delivery service.";
  });
}

function revealTruthPass(){
  removePrototypeSurfaces();
  guardUnknownPool();
  labelUnconnectedActions();
}

queueMicrotask(revealTruthPass);
addEventListener("popstate",()=>setTimeout(revealTruthPass,0));
let revealQueued=false;
const revealObserver=new MutationObserver(()=>{if(revealQueued)return;revealQueued=true;requestAnimationFrame(()=>{revealQueued=false;revealObserver.disconnect();try{revealTruthPass()}finally{const a=document.querySelector("#app");if(a)revealObserver.observe(a,{childList:true,subtree:true})}})});
const app=document.querySelector("#app");
if(app) revealObserver.observe(app,{childList:true,subtree:true});


// v152 — one-time cleanup of prototype-only browser state.
// Deliberately preserves created pools, commissioner setup, invites, and New Build navigation state.
(function clearLegacyPrototypeState(){
  const marker="links-reveal-clean-v152";
  try{
    if(localStorage.getItem(marker)==="1") return;
    [
      "links-demo-kickoffs-v1",
      "links-picks-v1",
      "links-reminders-v1"
    ].forEach(key=>localStorage.removeItem(key));
    localStorage.setItem(marker,"1");
  }catch{}
})();

function neutralizePrototypeCopy(){
  document.querySelectorAll(".home-scorebug,.home-radar").forEach(el=>{
    if(/85%|LIVE|4\s*games|1\s*due/i.test(el.textContent||"")) el.remove();
  });
}
// v166: app.js owns the current build stamp and lifecycle. Keep this guard cleanup-only.
queueMicrotask(neutralizePrototypeCopy);
