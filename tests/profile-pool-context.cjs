const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const pools=[
   {id:'1',code:'FIRST',name:'First pool',role:'player'},
   {id:'2',code:'CURRENT',name:'Current pool',role:'admin'}
  ];
  const opens=[];
  await page.addInitScript(()=>{
   localStorage.setItem('links-current-pool',JSON.stringify({id:'2',code:'CURRENT',role:'admin'}));
   localStorage.setItem('links-legacy-token','current-token');
  });
  await page.route('https://profile.test/**',async route=>{
   const request=route.request(),url=new URL(request.url());
   if(url.pathname.endsWith('/api/login-transition'))return route.fulfill({json:{phase:'transition'}});
   if(url.pathname.endsWith('/api/player-account')){
    const body=request.postDataJSON();
    const account={id:'account',username:'alice',displayName:'Alice'};
    if(body?.action==='open'){
     opens.push(body.pool);
     return route.fulfill({json:{token:'token-'+body.pool,playerId:'Alice',pool:pools.find(pool=>pool.id===body.pool)}});
    }
    if(body?.action==='profile')return route.fulfill({json:{account}});
    return route.fulfill({json:{account,pools}});
   }
   if(url.pathname.endsWith('/links-account-client.mjs'))return route.fulfill({contentType:'text/javascript',body:fs.readFileSync('public/new-build/links-account-client.mjs','utf8')});
   if(url.pathname.endsWith('.css'))return route.fulfill({contentType:'text/css',body:''});
   return route.fulfill({contentType:'text/html',body:'<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><div id="lockerAccount"></div><h1 id="controlTitle"></h1><p id="attention"></p><script type="module">import {bootLocker} from "./links-account-client.mjs";await bootLocker();</script>'});
  });
  await page.goto('https://profile.test/new-build/control-center.html');
  await page.getByRole('button',{name:'My Profile',exact:true}).click();
  await page.getByLabel('Current LINKS password',{exact:true}).fill('old-password-123');
  await page.getByLabel('New password (optional)',{exact:true}).fill('new-password-123');
  await page.getByLabel('Confirm new password',{exact:true}).fill('new-password-123');
  await page.getByRole('button',{name:'Save profile',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('button[type=submit]')?.disabled===false);
  assert.deepEqual(opens,['2','2'],'Password changes must refresh the active pool session');
  const saved=await page.evaluate(()=>({
   pool:JSON.parse(localStorage.getItem('links-current-pool')),
   token:localStorage.getItem('links-legacy-token')
  }));
  assert.equal(saved.pool.id,'2');
  assert.equal(saved.token,'token-2');
  assert.match(await page.getByRole('status').innerText(),/Saved/);
  console.log('PASS password update retains the selected pool, role and renewed session on phone width');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
