const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
  fs.mkdirSync('output/course18',{recursive:true});
  const browser=await chromium.launch({channel:'msedge',headless:true,args:['--enable-unsafe-swiftshader']});
  try {
    for(const width of [390,1280]) {
      const page=await browser.newPage({viewport:{width,height:844},hasTouch:true,isMobile:width===390}),errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/*',route=>{
        const file=path.join('public',new URL(route.request().url()).pathname);
        return fs.existsSync(file)?route.fulfill({path:file}):route.fulfill({status:404,body:'Not found'});
      });
      await page.goto('https://test/new-build/mini-golf.html');
      await page.locator('#loading').waitFor({state:'hidden',timeout:30000});
      assert.equal(await page.locator('#soloHole option').count(),18);
      assert.equal(await page.locator('#coursePreview article').count(),18);
      for(let hole=0;hole<(process.env.TOUCH_ONLY?0:18);hole++) {
        await page.locator('#soloHole').selectOption(String(hole));
        await page.locator('#soloStart').click();
        await page.waitForTimeout(250);
        assert.deepEqual(errors,[],`Hole ${hole+1} must render without errors`);
        assert.match(await page.locator('#courseTitle').textContent(),new RegExp('HOLE '+(hole+1)+'(?:\\D|$)'));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
        const stage=await page.locator('#stage').boundingBox();
        assert(stage.x>=-1&&stage.x+stage.width<=width+1,'Course fits horizontally');
        if([0,3,8,17].includes(hole))await page.screenshot({path:`output/course18/hole-${hole+1}-${width}.png`});
        await page.locator('#lobbyButton').click();
      }
      // Real touch events exercise the same pointer path used by a phone.
      await page.locator('#soloHole').selectOption('0');await page.locator('#soloStart').click();
      await page.waitForTimeout(800);
      const ball=await page.locator('#ballTarget').boundingBox(),stage=await page.locator('#stage').boundingBox();
      const x=ball.x+ball.width/2,y=ball.y+ball.height/2;
      const endY=Math.min(y+65,stage.y+stage.height-15);
      assert(endY-y>12,'Ball has enough screen space for pullback');
      const client=await page.context().newCDPSession(page),scroll=await page.evaluate(()=>scrollY);
      await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
      for(let i=1;i<=5;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+(endY-y)*i/5}]});
      assert.match(await page.locator('#shotPowerValue').textContent(),/m/);
      await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      try {await page.waitForFunction(()=>document.getElementById('score').textContent==='1 stroke');} catch(e) {console.log(await page.evaluate(()=>({status:document.getElementById('status').textContent,score:document.getElementById('score').textContent,power:document.getElementById('power').value,disabled:document.getElementById('putt').disabled})),{x,y,endY,stage,ball},errors);await page.screenshot({path:'output/course18/touch-failure.png'});throw e;}
      assert.equal(await page.evaluate(()=>scrollY),scroll,'Pullback must not scroll the page');
      await page.waitForFunction(()=>!document.getElementById('putt').disabled,{},{timeout:30000});
      assert.deepEqual(errors,[]);
      console.log('PASS 18 holes, viewport fit and touch pullback at '+width);
      await page.close();
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
