const {chromium}=require('playwright'),fs=require('fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{for(const target of ['compare-picks.html','pick-tools.html?tool=matter','pick-tools.html?tool=projected']){
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));let calls=0;
 const data={locked:true,games:[{gameIndex:0,eventId:'1',home:'KC',away:'BUF',kickoff:'2000-01-01',completed:false},{gameIndex:4,eventId:'future',home:'DEN',away:'LV',kickoff:'2099-01-01',completed:false}],players:[{player:'Me',picks:{0:'KC',4:'DEN'}},{player:'Bob',picks:{0:'BUF',4:'LV'}},{player:'Carol',picks:{0:'KC',4:'DEN'}}],results:{}};
 await page.addInitScript(()=>{window.polls=[];window.setInterval=(fn,ms)=>{window.polls.push({fn,ms});return 1};localStorage.setItem('links-player-name','Me')});
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.pathname.endsWith('/api/compare-picks')){calls++;return r.fulfill({json:data})}if(u.pathname.endsWith('/summary'))return r.fulfill({json:{pickcenter:[{homeTeamOdds:{moneyLine:-200},awayTeamOdds:{moneyLine:170}}]}});if(u.pathname.endsWith('.html'))return r.fulfill({contentType:'text/html',body:fs.readFileSync('public/new-build/'+u.pathname.split('/').pop(),'utf8')});if(u.pathname.endsWith('/nfl-projection.js'))return r.fulfill({contentType:'text/javascript',body:fs.readFileSync('public/new-build/nfl-projection.js','utf8')});return r.fulfill({contentType:'text/javascript',body:''})});
 await page.goto('https://fixture/new-build/'+target+(target.includes('?')?'&':'?')+'pool=1&week=4');
 const selector=target.startsWith('compare')?'#box': '#body';await page.waitForFunction(s=>document.querySelector(s)?.textContent.includes('Me'),selector);
 if(!target.includes('projected')){const text=await page.locator(selector).innerText();assert.ok(!text.includes('DEN')&&!text.includes('LV')&&!text.includes('G5')&&!text.includes('GAME 5'),'Unstarted matchups must not appear');}
 if(target.includes('matter'))await page.locator('#opp').selectOption('1');
 await page.evaluate(s=>window.original=document.querySelector(s).firstChild,selector);
 assert.equal(await page.evaluate(()=>polls[0].ms),60000);
 await page.evaluate(()=>polls[0].fn());await page.waitForFunction(()=>!document.querySelector('#status').textContent.includes('Loading'));
 await page.waitForTimeout(100);
 if(!target.includes('projected'))assert.equal(await page.evaluate(s=>original===document.querySelector(s).firstChild,selector),true);
 if(target.includes('matter')){assert.equal(await page.locator('#opp').inputValue(),'1');data.results={0:'KC'};await page.evaluate(()=>polls[0].fn());await page.waitForTimeout(100);assert.equal(await page.locator('#opp').inputValue(),'1')}
 if(target.includes('projected')){const values=await page.locator('.pct').allTextContents();assert.ok(Math.abs(values.reduce((n,x)=>n+parseFloat(x),0)-100)<.2)}
 assert.equal(errors.length,0,errors.join('\n'));assert.ok(calls>=2);console.log('PASS quiet refresh '+target);await page.close();
 }}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
