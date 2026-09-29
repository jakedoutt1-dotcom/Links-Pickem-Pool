// Isolated browser regression: all requests are intercepted; no live API or database is used.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../public');
const origin = 'http://nfl-regression.test';
const kickoff = {3:'2026-09-24T00:00:00Z',4:'2026-10-02T00:00:00Z',5:'2026-10-09T00:00:00Z'};
function scoreboard(week) {
  return {week:{number:4},season:{type:2},events:[{id:'event-'+week,date:kickoff[week],status:{type:{completed:week===3}},competitions:[{competitors:[
    {homeAway:'away',team:{id:'1',abbreviation:'BUF',shortDisplayName:'Bills'},records:[{summary:'2-1'}]},
    {homeAway:'home',team:{id:'2',abbreviation:'MIA',shortDisplayName:'Dolphins'},records:[{summary:'1-2'}]}
  ]}]}]};
}
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  try {
    for (const viewport of [{width:1280,height:900},{width:390,height:844}]) {
      const context=await browser.newContext({viewport,hasTouch:viewport.width<600,isMobile:viewport.width<600});
      const posts=[], errors=[], reads=[];
      await context.route('**/*',async route=>{
        const request=route.request(),url=new URL(request.url());
        const json=body=>route.fulfill({json:body});
        if(url.hostname==='site.api.espn.com')return json(scoreboard(Number(url.searchParams.get('week')||4)));
        if(url.pathname==='/new-build/api/picks') {
          if(request.method()==='POST'){posts.push(request.postDataJSON());return json({success:true})}
          reads.push(url);
          const player=url.searchParams.get('player'),week=url.searchParams.get('week');
          return json({success:true,picks:player==='Alice'&&week==='4'?[{gameIndex:0,selection:'BUF'}]:[]});
        }
        if(url.pathname==='/new-build/api/compare-picks')return json(url.searchParams.get('week')==='3'?{locked:true,players:[{player:'Bob',picks:{0:'BUF'}}]}:{locked:false,players:[]});
        if(url.hostname===new URL(origin).hostname&&!url.pathname.includes('/api/')) {
          const file=path.resolve(root,'.'+url.pathname);
          if(file.startsWith(root+path.sep)&&fs.existsSync(file))return route.fulfill({body:fs.readFileSync(file),contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html'});
        }
        return json({});
      });
      const page=await context.newPage();
      page.on('pageerror',e=>errors.push(e.message));
      await page.clock.install({time:new Date('2026-09-29T12:00:00Z')});
      await page.addInitScript(()=>{
        localStorage.setItem('links-current-pool',JSON.stringify({id:'test-pool'}));
        if(!localStorage.getItem('links-player-id')){
          localStorage.setItem('links-player-id','Alice');
          localStorage.setItem('links-player-name','Alice');
        }
        // Contaminated legacy practice cache must not be loaded by a real player.
        localStorage.setItem('links-nfl-picks-v1',JSON.stringify({'event-4':'2','event-5':'2'}));
      });
      await page.goto(origin+'/new-build/nfl.html?pool=test-pool&week=4');
      await page.waitForFunction(()=>document.querySelectorAll('#slate [data-g]').length===2&&document.querySelector('.links-nfl-shared-nav'));
      assert.equal(await page.locator('#legacySlate,#linksRealSlate').count(),0);
      assert.equal(await page.locator('#slate .primary').getAttribute('data-t'),'1');
      await page.locator('[data-nfl-nav="print"]').click();
      await page.waitForSelector('.links-print-modal');
      assert.ok((await page.locator('.links-print-head').textContent()).includes('Alice'));
      assert.ok((await page.locator('.links-print-head').textContent()).includes('WEEK 4'));
      assert.equal(await page.locator('.links-print-pick b').textContent(),'BUF');
      assert.equal(posts.length,0,'Print preview never saves or locks picks');
      await page.evaluate(()=>{window.print=()=>{window.printCalled=true}});
      await page.locator('#linksPrintNow').click();
      assert.equal(await page.evaluate(()=>window.printCalled),true);
      await page.locator('#linksPrintClose').click();
      assert.equal(await page.locator('.links-print-modal').count(),0);
      const choose=async team=>{
        const button=page.locator('#slate [data-t="'+team+'"]');
        if(viewport.width<600)await button.tap();else await button.click();
      };
      await choose('2');
      await page.waitForFunction(()=>document.querySelector('#slate [data-t="2"]').classList.contains('primary'));
      assert.equal(posts.length,1);
      assert.deepEqual([posts[0].pool,posts[0].player,posts[0].week,posts[0].eventId,posts[0].gameIndex,posts[0].selection],['test-pool','Alice',4,'event-4',0,'MIA']);
      await choose('1');
      await page.waitForFunction(()=>document.querySelector('#slate [data-t="1"]').classList.contains('primary'));
      assert.equal(posts.length,2);
      await page.locator('#tieTotal').fill('42');
      await page.locator('#savePicksBtn').click();
      await page.locator('#skipPlaymaker').click();
      await page.clock.runFor(1600);
      assert.equal(await page.locator('#slate button:disabled').count(),2,'Voluntary lock survives both background controllers');
      assert.equal(await page.locator('#tieTotal').isDisabled(),true);
      assert.equal(await page.locator('#savePicksBtn').isEnabled(),true,'Unlock remains available before kickoff');
      await page.reload();
      await page.waitForFunction(()=>document.querySelectorAll('#slate [data-g]').length===2);
      await page.clock.runFor(1600);
      assert.equal(await page.locator('#slate button:disabled').count(),2,'Card stays locked on reload');
      await page.locator('#linksGlobalSignOut').click();await page.waitForURL('**/index.html');
      await page.goto(origin+'/new-build/nfl.html?pool=test-pool&week=4');await page.waitForFunction(()=>document.querySelectorAll('#slate [data-g]').length===2);await page.clock.runFor(1600);
      assert.equal(await page.locator('#slate button:disabled').count(),2,'Card stays locked after sign-out and returning as the same player');
      assert.equal(await page.locator('#savePicksBtn').textContent(),'UNLOCK MY PICKS');
      await page.locator('#savePicksBtn').click();
      await page.waitForFunction(()=>document.querySelectorAll('#slate button:enabled').length===2);
      assert.equal(await page.locator('#tieTotal').isEnabled(),true);
      assert.equal(posts.length,3,'Unlock must not save a pick');
      await page.evaluate(()=>{localStorage.setItem('links-player-id','Bob');localStorage.setItem('links-player-name','Bob')});
      await page.reload();
      await page.waitForFunction(()=>document.querySelectorAll('#slate [data-g]').length===2&&document.querySelector('.links-nfl-shared-nav'));
      assert.equal(await page.locator('#slate .primary').count(),0,'Bob must not inherit Alice or practice picks');
      await page.locator('#weekSelect').selectOption('5');
      await page.waitForFunction(()=>document.querySelector('#slate [data-g="event-5"]'));
      assert.equal(await page.locator('#slate .primary').count(),0);
      await choose('1');
      await page.waitForFunction(()=>document.querySelector('#slate .primary'));
      assert.equal(posts.at(-1).week,5);
      assert.equal(posts.at(-1).player,'Bob');
      await page.waitForFunction(()=>document.documentElement.dataset.nflDeadlineClosed==='0');
      await page.clock.setSystemTime(new Date('2026-10-10T12:00:00Z'));
      await page.clock.runFor(1500);
      await page.waitForFunction(()=>document.documentElement.dataset.nflDeadlineClosed==='1');
      assert.equal(await page.locator('#slate button:disabled').count(),2,'Existing deadline disables both teams after kickoff');
      assert.equal(await page.locator('#countdownClock').textContent(),'PICKS CLOSED');
      await page.clock.setSystemTime(new Date('2026-09-29T12:00:00Z'));
      await page.locator('#weekSelect').selectOption('3');
      await page.waitForFunction(()=>document.querySelector('#slate [data-g="event-3"]'));
      assert.equal(await page.locator('#slate button:disabled').count(),2,'Historical week remains locked');
      assert.equal(posts.length,4,'Loading history must not save anything');
      assert.ok(reads.some(url=>url.searchParams.get('player')==='Bob'&&url.searchParams.get('week')==='5'));
      await page.evaluate(()=>localStorage.setItem('links-player-role','commissioner'));
      for(const file of ['compare-picks.html','pick-tools.html']){
        await page.goto(origin+'/new-build/'+file+'?pool=test-pool&week=4');
        await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Picks are private until the first kickoff of the week.'));
        assert.equal(await page.locator('.compare-player,.gtm-game').count(),0);
      }
      assert.deepEqual(errors,[]);
      await context.close();
      console.log('PASS '+viewport.width+'px: clicks/taps, saves, player isolation, week changes, deadline and historical locks');
    }
  } finally {await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
