// No production calls: all page/API requests are intercepted.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),jsQR=require('jsqr'),{PNG}=require('pngjs');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const invitation='https://test.local/new-build/join.html?qr=group-token';let verified=true,deletions=0;
 await page.route('**/*',async route=>{const u=new URL(route.request().url());
 if(u.pathname.endsWith('/members'))return route.fulfill({json:{members:[{playerId:'Owner',displayName:'Owner',role:'commissioner'},{playerId:'Alice',displayName:'Alice',role:'player'}]}});
 if(u.pathname.endsWith('/delete-player')){const b=route.request().postDataJSON();assert.equal(b.player,'Alice');assert.equal(b.confirmName,'Alice');assert.equal(b.acknowledge,true);deletions++;return route.fulfill({json:{deleted:'Alice'}})}
 if(u.pathname.endsWith('/login-name'))return route.fulfill({json:{loginName:'New Login',displayName:'New Name',names:[]}});
 if(u.pathname.endsWith('/pool-switcher'))return route.fulfill({json:{verified}});
 if(u.pathname.endsWith('/qr-invite'))return route.fulfill({json:{poolName:'Test pool',poolCode:'TEST',url:invitation,expiresAt:'2099-01-01'}});
 if(u.pathname.endsWith('.html'))return route.fulfill({contentType:'text/html',body:'<meta name="viewport" content="width=device-width,initial-scale=1"><header></header><main>Picks</main><script src="/new-build/session-security.js"></script><script src="/new-build/my-profile.js"></script>'});
 const file=path.resolve('public','.'+u.pathname);if(file.startsWith(path.resolve('public')+path.sep)&&fs.existsSync(file))return route.fulfill({path:file,contentType:'text/javascript'});
 return route.fulfill({status:404,body:''});});
 await page.addInitScript(()=>{localStorage.setItem('links-legacy-token','player-token');localStorage.setItem('links-account-token','verified-account')});
 await page.goto('https://test.local/new-build/links-admin.html');await page.goto('https://test.local/new-build/nfl.html?pool=1');
 await page.getByRole('button',{name:'My Profile',exact:true}).click();await page.locator('dialog[open]').waitFor();await page.goBack();assert.match(page.url(),/nfl.html/);assert.equal(await page.locator('dialog[open]').count(),0);
 await page.getByRole('button',{name:'My Profile',exact:true}).click();await page.getByRole('button',{name:'Back to Picks',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('dialog[open]'));assert.match(page.url(),/nfl.html/);
 assert.equal(await page.evaluate(()=>window.LINKS_ACCOUNT_FOR_LOGIN('new-session')),'verified-account');verified=false;assert.equal(await page.evaluate(()=>window.LINKS_ACCOUNT_FOR_LOGIN('unrelated-session')),'');
 await page.evaluate(async()=>{const m=await import('/new-build/invite-qr.mjs');await m.openInviteQR('1')});await page.getByText('Ready to scan',{exact:true}).waitFor();
 const png=PNG.sync.read(await page.locator('[data-qr] svg').screenshot());const decoded=jsQR(new Uint8ClampedArray(png.data),png.width,png.height);assert.equal(decoded?.data,invitation,'Displayed mobile QR decodes to the correct invitation');
 assert.equal(await page.locator('dialog[open]').evaluate(d=>d.scrollWidth>d.clientWidth),false);
 await page.getByRole('button',{name:'Turn off QR invite'}).click();await page.waitForFunction(()=>document.querySelector('[data-qr]').children.length===0);await page.getByRole('button',{name:'Close',exact:true}).click();
 await page.evaluate(async()=>{const m=await import('/new-build/delete-player.mjs');await m.openDeletePlayer('1','Alice')});assert.equal(await page.locator('select option').count(),1);await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.equal(deletions,0);
 await page.evaluate(async()=>{const m=await import('/new-build/delete-player.mjs');await m.openDeletePlayer('1','Alice')});await page.locator('[name=confirmName]').fill('Alice');await page.locator('[name=ack]').check();await page.getByRole('button',{name:'Delete Player',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('dialog[open]'));assert.equal(deletions,1);assert.deepEqual(errors,[]);
 console.log('PASS mobile profile Back/button, linked-account validation, scannable QR, disable and no horizontal overflow');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
