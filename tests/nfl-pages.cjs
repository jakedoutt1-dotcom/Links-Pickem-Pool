const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../public'),origin='http://nfl-pages.test';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{for(const width of [1280,390]){
  const context=await browser.newContext({viewport:{width,height:900}}),errors=[],weeks=[];
  await context.route('**/*',async route=>{
   const url=new URL(route.request().url()),json=data=>route.fulfill({json:data});
   if(url.hostname==='site.api.espn.com'){
    const w=Number(url.searchParams.get('week')||3);
    return json({week:{number:3},season:{type:2,year:2026},events:[{id:'g'+w,date:w<=3?'2026-09-24T00:00:00Z':'2026-10-02T00:00:00Z',status:{type:{completed:w<=3}},competitions:[{competitors:[{homeAway:'away',team:{id:'1',abbreviation:'BUF',shortDisplayName:'Bills'},score:'20',winner:true},{homeAway:'home',team:{id:'2',abbreviation:'MIA',shortDisplayName:'Dolphins'},score:'17'}]}]}]});
   }
   if(url.pathname.endsWith('/api/season-standings'))return json({rows:[{name:'Alice',wins:36,losses:12,weekWins:3}],gradedWeeks:[1,2,3],failedWeeks:[],finalGames:48});
   if(url.pathname.endsWith('/api/standings-v649')){
    const w=Number(url.searchParams.get('week'));weeks.push(w);
    const wins={1:14,2:10,3:12}[w];
    return json({locked:w<=3,allFinal:w<=3,finalGames:w<=3?16:0,expectedGames:16,rows:w<=3?[{player:'Alice',wins,losses:16-wins,tiePick:37,tieDiff:0}]:[],finalizedWinners:w<=3?['Alice']:[]});
   }
   if(url.pathname.endsWith('/api/compare-picks'))return json({locked:Number(url.searchParams.get('week'))<=3,players:[{player:'Alice',picks:{0:'BUF'}},{player:'Bob',picks:{0:'MIA'}}],games:[{gameIndex:0,eventId:'g3',home:'MIA',away:'BUF',completed:true,winner:'BUF'}],results:{0:'BUF'}});
   if(url.pathname.includes('/api/'))return json({locked:false,players:[],picks:[]});
   const file=path.resolve(root,'.'+url.pathname);
   if(url.origin===origin&&file.startsWith(root+path.sep)&&fs.existsSync(file))return route.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});
   return route.fulfill({body:''});
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install({time:new Date('2026-09-29T12:00:00Z')});
  await page.addInitScript(()=>{localStorage.setItem('links-current-pool',JSON.stringify({id:'1'}));localStorage.setItem('links-player-id','Alice');localStorage.setItem('links-legacy-token','test');localStorage.setItem('links-player-name','Alice')});
  for(const file of ['nfl.html','nfl-scores.html','nfl-standings.html','compare-picks.html','pick-tools.html','year-standings.html']){
   await page.goto(origin+'/new-build/'+file+'?pool=1');
   await page.waitForFunction(()=>new URL(location.href).searchParams.get('week')==='4');
   if(file!=='year-standings.html')await page.waitForFunction(()=>document.querySelector('#weekSelect,#week')?.value==='4');
   if(file==='nfl.html'){
    assert.equal(await page.locator('main .card > h2').count(),0);
    assert.equal(await page.locator('#weekSelect option[value="3"]').textContent(),'Week 3');
    assert.equal(await page.locator('#weekSelect option[value="4"]').textContent(),'Week 4 · CURRENT');
    await page.evaluate(()=>localStorage.setItem('links-player-role','commissioner'));
    await page.reload();
    await page.waitForFunction(()=>document.querySelector('#weekSelect option[value="4"]')?.textContent==='Week 4 · CURRENT');
    assert.equal(await page.locator('#weekSelect option[value="3"]').textContent(),'Week 3');
    await page.evaluate(()=>localStorage.setItem('links-player-role','player'));
   }
   if(file==='year-standings.html'){
    await page.waitForFunction(()=>document.querySelector('#standings .player'));
    assert.equal(await page.locator('#standings .row:not(.head) .win').textContent(),'36');
    assert.equal(await page.locator('#standings .row:not(.head) .loss').textContent(),'12');
    assert.match(await page.locator('#status').textContent(),/48 final games/);
    await page.waitForFunction(()=>document.querySelector('.links-nfl-shared-nav'));
    assert.equal(await page.locator('.links-unified-nav').count(),0,'No duplicate unstyled nav');
    assert.equal(await page.locator('.links-nfl-shared-nav').count(),1);
   }
  }
  await page.goto(origin+'/new-build/nfl-standings.html?pool=1&week=3');
  await page.waitForFunction(()=>document.getElementById('standingsStatus').textContent.includes('16 / 16'));
  assert.equal(await page.locator('#week').inputValue(),'3','Explicit history is preserved');
  assert.ok((await page.locator('#standingsBody').textContent()).includes('WEEK WINNER'));
  for(const suffix of ['compare-picks.html','pick-tools.html?tool=matter','pick-tools.html?tool=projected']){
   await page.goto(origin+'/new-build/'+suffix+(suffix.includes('?')?'&':'?')+'pool=1&week=3');
   await page.waitForFunction(()=>document.querySelector('#box,#body')?.textContent.includes('Alice'));
   assert.ok(!(await page.locator('#status').textContent()).includes('private'));
   if(suffix.includes('projected'))assert.ok((await page.locator('#body').textContent()).includes('100.0%'));
  }
  assert.deepEqual(errors,[]);
  console.log('PASS '+width+'px: all NFL page defaults, explicit history, season totals, single navigation, photo text removed, weekly winner');
  await context.close();
 }}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
