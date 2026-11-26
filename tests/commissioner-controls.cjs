const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try {
  for(const admin of [false,true]){
   const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   let opened=null;
   const state={currentPool:'1',verified:true,commissioner:admin,pools:[
    {id:'1',code:'FAMILY',name:'Family Pool',role:admin?'admin':'player',playerName:'Pat',games:['nfl','nascar']},
    {id:'2',code:'COLLEGE',name:'College Pool',role:'player',playerName:'Pat',games:['college']}
   ]};
   await page.route('**/*',route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.pathname.endsWith('/api/pool-switcher')){
     if(request.method()==='POST'){
      opened=request.postDataJSON();
      return route.fulfill({json:{token:'next',playerId:'Pat',gameKeys:['college'],pool:{...state.pools[1],games:['College Pick’em']}}});
     }
     return route.fulfill({json:state});
    }
    if(url.pathname.endsWith('/api/login-transition'))return route.fulfill({json:{phase:'off'}});
    if(url.pathname.endsWith('/api/login-name'))return route.fulfill({json:{displayName:'Pat',loginName:'Pat'}});
    if(url.pathname.endsWith('/api/members'))return route.fulfill({json:{members:[]}});
    if(url.pathname.includes('/api/'))return route.fulfill({json:{}});
    if(url.pathname.endsWith('/nascar.html'))return route.fulfill({contentType:'text/html',body:'<meta name="viewport" content="width=device-width"><header></header><main><nav class="tabs"></nav><button id="addMyHomepage">Add to My Homepage</button></main>'});
    if(url.pathname.endsWith('/college.html'))return route.fulfill({contentType:'text/html',body:'<h1>College picks</h1>'});
    const file=path.join('public',decodeURIComponent(url.pathname));
    if(fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({path:file,contentType:/\.m?js$/.test(file)?'text/javascript':file.endsWith('.css')?'text/css':undefined});
    return route.fulfill({status:404,body:''});
   });
   await page.goto('https://fixture/new-build/nascar.html?pool=1');
   await page.evaluate(()=>{
    localStorage.setItem('links-token','test');localStorage.setItem('links-legacy-token','test');
    // A stale cached commissioner role must not expose server-denied controls.
    localStorage.setItem('links-player-role','commissioner');localStorage.setItem('links-player-name','Pat');
    localStorage.setItem('links-locker-welcome-v1:'+encodeURIComponent('1:Pat'),'dismissed');
    sessionStorage.setItem('links-nfl-selected-week','3');
   });
   await page.addScriptTag({content:fs.readFileSync('public/new-build/commissioner-entry.js','utf8')});
   const back=page.getByRole('link',{name:'Back to Locker Room',exact:true});await back.waitFor();
   assert.equal(await page.locator('header #linksPoolTabs').count(),1,'Shared game navigation belongs in the header');
   assert.equal(await page.locator('#addMyHomepage').isVisible(),true,'Existing game controls remain available');
   assert.equal(await back.getAttribute('href'),'./control-center.html?pool=1');
   assert.equal(await page.locator('[data-game-admin]').count(),admin?1:0,'Only the current server-authorized commissioner gets NASCAR admin');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await back.click();
   await page.waitForURL('**/control-center.html?pool=1');
   await page.getByRole('heading',{name:'Pat’s Locker Room'}).waitFor();
   await page.getByRole('button',{name:'College Pool · College Pick’em',exact:true}).waitFor();
   assert.equal(await page.locator('#managePools').isVisible(),admin,'Pool management follows the server role');
   await page.getByRole('button',{name:'College Pool · College Pick’em',exact:true}).click();
   await page.waitForURL('**/college.html?**');
   assert.equal(new URL(page.url()).searchParams.get('pool'),'2');
   assert.deepEqual(opened,{action:'open',pool:'2'});
   assert.equal(await page.evaluate(()=>localStorage.getItem('links-token')),'next');
   assert.equal(await page.evaluate(()=>localStorage.getItem('links-legacy-token')),'next');
   assert.equal(await page.evaluate(()=>localStorage.getItem('links-player-role')),'player');
   assert.equal(await page.evaluate(()=>sessionStorage.getItem('links-nfl-selected-week')),null);
   assert.deepEqual(errors,[]);
   await page.close();
  }
  console.log('PASS mobile game navigation, server-authorized NASCAR/Locker Room controls, actual Locker Room return and isolated College switching.');
 } finally {await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
