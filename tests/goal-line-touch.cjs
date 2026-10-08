const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 for(const target of ['A','B']){
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.route('**/*',r=>{const file=path.join(process.cwd(),'public',new URL(r.request().url()).pathname);return fs.existsSync(file)?r.fulfill({path:file}):r.fulfill({status:404,body:''})});
 await page.goto('https://test/new-build/goal-line.html');await page.locator('#start').tap();
 await page.waitForFunction(()=>!document.getElementById('passA').disabled);
 const pad=await page.locator('#pad').boundingBox(),button=await page.locator('#pass'+target).boundingBox();
 const cdp=await page.context().newCDPSession(page);
 const finger={x:pad.x+pad.width/2,y:pad.y+pad.height/2,id:1};
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[finger]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[finger,{x:button.x+button.width/2,y:button.y+button.height/2,id:2}]});
 await page.waitForFunction(t=>document.getElementById('status').textContent.includes('Pass to '+t),target);
 assert.equal(await page.locator('#passA').isDisabled(),true);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 console.log('PASS real multitouch: hold run pad and touch Pass '+target);await page.close();
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
