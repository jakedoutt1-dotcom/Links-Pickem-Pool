const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../public'),origin='https://nfl-usability.test';
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 for(const width of [390,1280]){
  const ctx=await browser.newContext({viewport:{width,height:844}}),posts=[],errors=[];
  await ctx.route('**/*',async route=>{
   const req=route.request(),u=new URL(req.url()),json=data=>route.fulfill({json:data});
   if(req.method()==='POST')posts.push(u.pathname);
   if(u.hostname==='site.api.espn.com')return json({week:{number:12},season:{year:2026,type:2},events:[]});
   if(u.pathname==='/api/session')return json({role:'admin',poolCode:'FAM',poolName:'Family'});
   if(u.pathname.endsWith('/api/pools'))return json({pool:{id:'1',code:'FAM',name:'Family'}});
   if(u.pathname.endsWith('/api/members'))return json({members:[]});
   if(u.pathname.endsWith('/api/nfl-player-access'))return json({access:[],invites:[]});
   if(u.pathname.endsWith('/api/nfl-admin-week'))return json({games:[],requests:[],commissionerEmail:'owner@example.com',rules:'Have fun'});
   if(u.pathname.endsWith('/api/standings-v649'))return json({allFinal:false,finalizedWinners:[]});
   if(u.pathname.includes('/api/'))return json({});
   if(u.pathname==='/progress-fixture')return route.fulfill({contentType:'text/html',body:`<link rel="stylesheet" href="/new-build/shell.css"><main style="max-width:900px;margin:auto"><div id="slate"><div class="game-matchup"><button class="action game-team primary" data-id="saved">Saved team</button><button class="action game-team">Other team</button></div><div class="game-matchup"><button class="action game-team" disabled>Locked missed game</button></div><div style="height:1000px"></div><div class="game-matchup"><button class="action game-team" data-id="open">Open team</button></div></div></main><script type="module" src="/new-build/nfl-pick-progress.mjs"></script>`});
   const file=path.resolve(root,'.'+decodeURIComponent(u.pathname));
   if(u.origin===origin&&file.startsWith(root+path.sep)&&fs.existsSync(file))return route.fulfill({path:file,contentType:/\.(mjs|js)$/.test(file)?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'image/png'});
   return route.fulfill({status:204,body:''});
  });
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('links-legacy-token','test-token');localStorage.setItem('links-current-pool',JSON.stringify({id:'1',code:'FAM',name:'Family'}));localStorage.setItem('links-player-role','commissioner');localStorage.setItem('links-player-id','Alice');localStorage.setItem('links-player-name','Alice');});
  await page.goto(origin+'/progress-fixture');
  await page.getByText('1 of 3 games selected · 1 open game needs a pick.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Go to next unpicked game'}).click();
  assert.equal(await page.locator('[data-id=open]').evaluate(n=>n===document.activeElement),true);
  assert.equal(await page.locator('[data-id=open]').evaluate(n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}),true);
  await page.locator('[data-id=open]').evaluate(n=>n.classList.add('primary'));
  await page.getByText('2 of 3 games selected.',{exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Go to next unpicked game'}).isVisible(),false);
  await page.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));document.querySelector('[data-id=open]').classList.remove('primary');window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});
  await page.getByText('1 of 3 games selected · 1 open game needs a pick.',{exact:true}).waitFor();
  await page.locator('[data-id=open]').evaluate(n=>n.classList.add('primary'));
  await page.getByText('2 of 3 games selected.',{exact:true}).waitFor();
  assert.deepEqual(posts,[],'guidance never writes picks');
  await page.goto(origin+'/new-build/commissioner.html?pool=1&week=12');
  await page.getByRole('button',{name:'Pick deadlines Review kickoff locks or set a shared deadline',exact:true}).click();
  await page.locator('#lockMode:enabled').waitFor();
  for(const id of ['lockWeek','accessWeek'])assert.equal(await page.locator('#'+id+' option[value="19"]').innerText(),'Wild Card');
  assert.match(await page.locator('#pickLocks').innerText(),/usual weekly pool/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);
  await ctx.close();console.log('PASS '+width+'px pick progress, next open pick focus, read-only guidance and Admin deadline navigation/postseason labels');
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
