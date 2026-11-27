const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{for(const width of [390,1280]){
 const page=await browser.newPage({viewport:{width,height:900}}),errors=[];let accountName='Old Player',reads=0,expired=false;
 const pool=()=>({id:accountName==='Old Player'?'1':'2',name:accountName+' Pool',playerName:accountName,role:'player',games:['cfp'],allGames:['cfp'],leftGames:[]});
 page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{localStorage.setItem('links-token','old-pool-token');localStorage.setItem('links-player-name','Old Player')});
 await page.route('https://locker.test/**',r=>{const u=new URL(r.request().url());if(u.pathname.endsWith('/links-login.html'))return r.fulfill({body:'<h1>LINKS account login</h1>',contentType:'text/html'});
  if(u.pathname.includes('/api/')){
   if(u.pathname.endsWith('/login-transition'))return r.fulfill({json:{phase:'transition'}});
   if(u.pathname.endsWith('/player-account')){const b=r.request().postDataJSON();if(expired)return r.fulfill({status:401,json:{error:'Sign in'}});if(b?.action==='open')return r.fulfill({json:{token:'bridge-'+accountName,playerId:accountName,pool:pool()}});reads++;return r.fulfill({json:{account:{id:accountName,username:'user',displayName:accountName},pools:[pool()],currentPool:pool().id}})}
   if(u.pathname.endsWith('/pool-switcher'))return r.fulfill({status:401,json:{error:'Stale legacy pool token'}});
   if(u.pathname.endsWith('/members'))return r.fulfill({json:{members:[]}});return r.fulfill({json:{}});
  }
  const file=path.join('public',decodeURIComponent(u.pathname));return fs.existsSync(file)?r.fulfill({path:file,contentType:/\.(m?js)$/.test(file)?'text/javascript':file.endsWith('.css')?'text/css':undefined}):r.fulfill({status:404,body:''});
 });
 await page.goto('https://locker.test/new-build/control-center.html');await page.getByRole('heading',{name:'Old Player’s Locker Room',exact:true}).waitFor();
 accountName='Current Player';await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
 await page.getByRole('heading',{name:'Current Player’s Locker Room',exact:true}).waitFor();await page.getByRole('button',{name:'Current Player Pool · College Playoff Pick’em',exact:true}).waitFor();
 assert(reads>=2);assert.equal(await page.locator('#topGameGrid').getByText('Your pool list could not load.').count(),0);assert.equal(await page.locator('dialog.account-profile').count(),1,'Restoring replaces the old profile dialog');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 expired=true;await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await page.waitForURL('**/links-login.html');assert.deepEqual(errors,[]);
 await page.close();console.log('PASS Locker Room '+width+'px Back restore refreshes account, avoids stale names/pool tokens, and expired identity returns to account login');
}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
