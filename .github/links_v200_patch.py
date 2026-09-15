from pathlib import Path
import re
p=Path('public/index.html'); s=p.read_text(encoding='utf-8')
# v210 startup stability — stop automatic pool/session resume from switching screens after first paint.
# Invite/setup links still route directly. Normal pool login/select remains unchanged.
new_restore='''async function restore(){
  try{history.replaceState({linksScreen:"home"},"",location.href)}catch(e){}
  const launchQs=new URLSearchParams(location.search),setupParam=launchQs.get("setup"),inviteParam=launchQs.get("invite");
  if(setupParam){await openPlayerSetup(setupParam);return;}
  if(inviteParam){await openInviteJoin(inviteParam);return;}
  // Keep startup pinned to HOME. A saved pool token remains available for normal login/select flows,
  // but it no longer auto-enters a pool during page boot and blanks the screen if restore data is stale.
  applyPoolAdMode(false);
  showOnly("home");
  Promise.allSettled([refreshLinksPurchase(),loadPoolMenu(poolCode)]).catch(()=>{});
}
applyPoolAdMode(sessionStorage.getItem("linksPoolAdFree")==="1");
restore();'''
pattern=r'async function restore\(\)\{[\s\S]*?\n\}\napplyPoolAdMode\(sessionStorage\.getItem\("linksPoolAdFree"\)===\"1\"\);\nrestore\(\);'
s,n=re.subn(pattern,new_restore,s,count=1)
if n!=1:
 raise SystemExit('v210: restore block not found exactly once')
# Version/cache bump only; preserve v205 Home redesign and all existing game logic.
s=s.replace('nav-v174/standings.png?v=209','nav-v174/standings.png?v=210')
s=s.replace("navigator.serviceWorker.register('/links-sw.js?v=209'", "navigator.serviceWorker.register('/links-sw.js?v=210'")
s=s.replace('links-pickem-v209','links-pickem-v210')
s=re.sub(r'LINKS PICK[’\']EM POOLS — v\d+','LINKS PICK’EM POOLS — v210',s)
p.write_text(s,encoding='utf-8')
sw=Path('public/links-sw.js')
if sw.exists():
 t=sw.read_text(encoding='utf-8').replace('links-pickem-v209','links-pickem-v210')
 sw.write_text(t,encoding='utf-8')
