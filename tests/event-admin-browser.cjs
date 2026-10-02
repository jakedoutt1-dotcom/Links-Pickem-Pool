const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
(async()=>{const {cleanConfig,rules}=await import('../public/new-build/event-pool-core.mjs');const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 for(const game of ['golf','nascar']){
 const page=await browser.newPage({viewport:{width:390,height:844}});let state={role:'admin',player:'Owner',events:[],config:null,results:{},version:1,closed:false,card:null,used:[],rows:[],entries:0};
 await page.route('https://admin.test/**',async r=>{const u=new URL(r.request().url());
 if(u.pathname.endsWith('/api/golf-schedule'))return r.fulfill({json:u.searchParams.has('event')?{event:{id:'123'},golfers:['A','B','C','D','E','F'],message:'Review deadline.'}:{events:[{id:'123',name:'Imported Tournament',date:'2090-10-01T12:00:00Z'}]}});
 if(u.pathname.endsWith('/api/nascar-schedule'))return r.fulfill({json:u.searchParams.has('raceId')?{race:{id:'123',name:'Imported Race',date:'2090-10-01T12:00:00Z',drivers:['A','B','C','D','E','F']},message:'Review field.'}:{races:[{id:'123',name:'Imported Race',date:'2090-10-01T12:00:00Z'}],source:'Fixture'}});
 if(u.pathname.endsWith('/api/event-pool')){if(r.request().method()==='POST'){const b=r.request().postDataJSON();assert.equal(b.action,'configure');state.config=cleanConfig(game,b.config);state.event=b.event;state.events=[{id:b.event,title:state.config.title}];state.rules=rules(game,state.config);return r.fulfill({json:{ok:true,event:b.event}})}return r.fulfill({json:state});}
 if(u.pathname.endsWith('/'+game+'.html'))return r.fulfill({contentType:'text/html',body:'<link rel="stylesheet" href="/new-build/event-pool.css"><main class="grid"><p>Legacy entries</p></main><script>window.LINKS_API_FETCH=fetch</script><script type="module" src="/new-build/event-pool-app.mjs"></script>'});
 const f=path.join('public',decodeURIComponent(u.pathname));return fs.existsSync(f)?r.fulfill({path:f,contentType:/\.(mjs|js)$/.test(f)?'text/javascript':f.endsWith('.css')?'text/css':'text/html'}):r.fulfill({status:404,body:''});});
 await page.goto('https://admin.test/new-build/'+game+'.html?pool=1');await page.getByRole('button',{name:'ADMIN',exact:true}).click();
 const form=page.locator('#eventSetup');
 await page.getByRole('button',{name:game==='golf'?'Load PGA tournaments':'Load Cup Series schedule'}).click();
 await form.locator('select:not([name])').selectOption('123');
 await page.waitForFunction(()=>document.querySelector('[name=field]').value.split('\n').length===6);
 assert.equal(await form.locator('[name=title]').inputValue(),game==='golf'?'Imported Tournament':'Imported Race');
await form.locator('[name=id]').fill('sample-event');await form.locator('[name=title]').fill('Test event');await form.locator('[name=lockAt]').fill('2090-10-01T12:00');await form.locator('[name=field]').fill('A\nB\nC\nD\nE\nF');
 if(game==='nascar'){await form.locator('[name=format]').selectOption('fantasy');await form.locator('[name=raceStart]').fill('2090-10-01T12:05');await form.locator('[name=garageClosesAt]').fill('2090-10-01T14:00');}
 await page.getByRole('button',{name:'Save setup',exact:true}).click();await page.getByText('Saved to your pool.',{exact:true}).waitFor();assert.equal(state.events.length,1);
 await page.getByRole('button',{name:'PICKS',exact:true}).click();assert.equal(await page.locator('.event-choice').count(),6);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 state.role='player';await page.reload();await page.locator('.event-choice').first().waitFor();assert.equal(await page.getByRole('button',{name:'ADMIN',exact:true}).count(),0);assert.ok(await page.getByText('Previous event controls and saved entries').count());await page.close();
 }
 console.log('PASS real event setup forms, mobile layout, old-entry access, commissioner-only Admin');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
