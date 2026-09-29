const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const plans={free:{label:'Free',slots:1},plus:{label:'LINKS Plus',slots:3},nfl_package:{label:'LINKS Pro',slots:6},all_access:{label:'LINKS All Access',slots:10}},games={nfl:'NFL Pick’em',college:'College Pick’em'};
 try{for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));let signed=false,payload=null;
  await page.route('**/*',async route=>{const request=route.request(),url=new URL(request.url());
   if(url.pathname.endsWith('/api/account')){const b=request.method()==='POST'?request.postDataJSON():null;if(b?.action==='send-code')return route.fulfill({json:{sent:true,email:b.email}});if(b?.action==='verify'){signed=true;return route.fulfill({json:{token:'verified',email:'owner@example.com'}})}if(b?.action==='create'){payload=b;return route.fulfill({status:402,json:{error:'Fixture full capacity'}})}if(b?.action==='logout'){signed=false;return route.fulfill({json:{ok:true}})}if(!signed)return route.fulfill({status:401,json:{error:'Verify email'}});return route.fulfill({json:{email:'owner@example.com',plan:plans.plus,used:1,remaining:2,overLimit:false,pools:[{id:'1',name:'Office NFL',code:'OFFICE',games:[{key:'nfl',name:games.nfl,active:true}]}],purchases:[],plans,games}})}
   const local=path.resolve(__dirname,'../public',decodeURIComponent(url.pathname).replace(/^\//,''));if(local.startsWith(path.resolve(__dirname,'../public'))&&fs.existsSync(local)&&fs.statSync(local).isFile())return route.fulfill({body:fs.readFileSync(local),contentType:local.endsWith('.js')?'text/javascript':local.endsWith('.css')?'text/css':local.endsWith('.html')?'text/html':'image/png'});return route.fulfill({status:404,body:''});
  });
  await page.goto('https://fixture/new-build/commissioner-hub.html');assert.equal(await page.locator('#accountArea').isVisible(),false);
  await page.locator('#accountEmail').fill('owner@example.com');await page.locator('#emailForm button').click();await page.locator('#accountCode').fill('12345678');await page.locator('#codeForm button').click();await page.locator('#ownedPools [data-open]').waitFor();
  assert.match(await page.locator('#capacity').textContent(),/1 of 3/);assert.equal(await page.locator('[data-plan]').count(),3);assert.match(await page.locator('#packageCards').textContent(),/6 separate NFL pools/);
  await page.locator('[name=name]').fill('Family NFL');await page.locator('[name=displayName]').fill('Owner');await page.locator('[name=password]').fill('longpassword');await page.locator('[name=password2]').fill('longpassword');await page.locator('#gameChoices input[value=nfl]').check();await page.locator('#createForm button').click();await page.getByText('Fixture full capacity').waitFor();assert.deepEqual(payload.games,['nfl']);assert.ok(!JSON.stringify(await page.evaluate(()=>({...localStorage}))).includes('longpassword'),'No plaintext password saved');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal page overflow');
  await page.screenshot({path:path.join(process.env.TEMP||'.','links-commissioner-hub-'+width+'.png'),fullPage:true});
  await page.locator('#accountLogout').click();await page.locator('#emailForm').waitFor({state:'visible'});assert.deepEqual(errors,[]);await context.close();
 }
 console.log('PASS mobile/desktop account verification, package copy, repeated NFL creation, server error handling, no password persistence, sign-out and responsive layout');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

