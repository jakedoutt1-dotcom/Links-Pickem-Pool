
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{for(const width of [390,1280])for(const legacy of [true,false]){
 const context=await browser.newContext({viewport:{width,height:844},...(width===390?{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1'}:{})}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const pool={id:'26',code:'TEST',name:'Test pool',playerName:'Alex',role:'player',games:['nfl'],allGames:['nfl'],leftGames:[]},state={account:{id:'a1',displayName:'Alex',username:'alex'},pools:[pool],currentPool:'26',verified:!legacy};
 await page.addInitScript(()=>{localStorage.setItem('links-token','existing');localStorage.setItem('links-player-id','Alex');localStorage.setItem('links-player-name','Alex')});
 await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname!=='locker.test')return route.abort();if(u.pathname.includes('/api/')){
 if(u.pathname.endsWith('login-transition'))return route.fulfill({json:{phase:'transition'}});
 if(u.pathname.endsWith('player-account')){const b=route.request().postDataJSON();if(b?.action==='membership-status')return route.fulfill({json:{connected:false}});if(b?.action==='open')return route.fulfill({json:{token:'bridge',playerId:'Alex',pool,gameKeys:['nfl']}});return legacy?route.fulfill({status:401,json:{error:'Sign in'}}):route.fulfill({json:state});}
 if(u.pathname.endsWith('pool-switcher'))return route.fulfill({json:state});if(u.pathname.endsWith('members'))return route.fulfill({json:{members:[]}});return route.fulfill({json:{}});}
 const file=path.join('public',decodeURIComponent(u.pathname));return fs.existsSync(file)?route.fulfill({path:file,contentType:/\.(m?js)$/.test(file)?'text/javascript':file.endsWith('.css')?'text/css':undefined}):route.fulfill({status:404,body:''});});
 await page.goto('https://locker.test/new-build/control-center.html');await page.locator('#lockerWelcome').waitFor({state:'visible'});
 assert.equal(await page.locator('#lockerWelcome a[href*=setup]').count(),legacy?1:0,'Only incomplete logins receive setup reminder');
 const href=await page.locator('#lockerTextFeedback').getAttribute('href');assert.ok(href.startsWith('sms:+16155616218'+(width===390?'&':'?')+'body='));assert.match(decodeURIComponent(href),/What could work better/);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 fs.mkdirSync('output/locker-welcome',{recursive:true});await page.screenshot({path:`output/locker-welcome/${legacy?'setup':'feedback'}-${width}.png`});
 await page.goBack();assert.equal(await page.locator('#lockerWelcome').evaluate(d=>d.open),false,'Back closes popup before leaving Locker Room');assert.match(page.url(),/control-center/);
 await page.locator('#lockerWelcomeOpen').click();await page.locator('#lockerWelcomeContinue').click();await page.waitForFunction(()=>!document.querySelector('#lockerWelcome').open);
 await page.reload();await page.locator('#lockerWelcomeOpen').waitFor();assert.equal(await page.locator('#lockerWelcome').evaluate(d=>d.open),false,'Continue suppresses repeat within this session');
 await page.locator('#lockerWelcomeOpen').click();await page.locator('#lockerWelcomeDismiss').click();await page.waitForFunction(()=>!document.querySelector('#lockerWelcome').open);await page.evaluate(()=>sessionStorage.clear());await page.reload();await page.locator('#lockerWelcomeOpen').waitFor();assert.equal(await page.locator('#lockerWelcome').evaluate(d=>d.open),false,'Do not show again persists across sessions');
 await page.locator('#lockerWelcomeOpen').click();await page.keyboard.press('Escape');assert.equal(await page.locator('#lockerWelcome').evaluate(d=>d.open),false);assert.deepEqual(errors,[]);await context.close();
 }console.log('PASS Locker Room welcome: legacy/ready logins, phone/desktop, text draft, persistent dismissal, manual reopen and Back/Escape.');}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
