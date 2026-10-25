import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,existsSync,mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {playmakerPublic} from '../functions/new-build/api/playmaker-public.js';
const require=createRequire(import.meta.url),{chromium}=require('playwright'),root=resolve('public'),origin='https://links.test',out='output/playmaker-web';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const width of [320,390,1440]){
 const {db}=fixture(),now=Date.now(),errors=[],missing=[];let aiCalls=0,liveCalls=0,providerInput;
 const payload={success:true,data:[{eventID:'fixture-game',leagueID:'NFL',sportID:'FOOTBALL',status:{startsAt:new Date(now+86400000).toISOString(),started:false,ended:false},teams:{home:{name:'Test Home'},away:{name:'Test Away'}},odds:{'points-home-game-ml-home':{byBookmaker:{draftkings:{odds:'-110',lastUpdatedAt:new Date(now-60000).toISOString()}}}}}]};
 for(let i=0;i<8;i++){
  const event=i===0?payload.data[0]:structuredClone(payload.data[0]);event.eventID='fixture-game-'+i;event.teams.away.name='Test Away '+i;
  event.odds['points-home-game-ml-home'].byBookmaker.caesars={odds:'+144',lastUpdatedAt:new Date(now-60000).toISOString()};
  event.odds['points-home-game-ml-home'].byBookmaker.bovada={odds:'+145',lastUpdatedAt:new Date(now-60000).toISOString()};
  if(i)payload.data.push(event);
 }
 const env={DB:db,OPENAI_API_KEY:'fixture-only',SPORTS_GAME_ODDS_API_KEY:'fixture-only'},services={session:async()=>null,odds:async context=>{const league=new URL(context.request.url).searchParams.get('leagueID'),data=structuredClone(payload);for(const event of data.data){event.leagueID=league;const playerID='TEST_PLAYER_1_'+league;event.players={[playerID]:{name:'Test Player'}};for(const [stat,type,side] of [['receiving_receptions','ou','over'],['touchdowns','yn','yes'],['points','ou','over'],['assists','ou','over'],['shots_onGoal','ou','over'],['batting_hits','ou','over']]){const id=`${stat}-${playerID}-game-${type}-${side}`;event.odds[id]={statID:stat,statEntityID:playerID,periodID:'game',betTypeID:type,sideID:side,byBookmaker:{draftkings:{odds:'-110',overUnder:'5.5',lastUpdatedAt:new Date(now-60000).toISOString()}}}}}return Response.json(data)},fetch:async(url,options)=>{aiCalls++;providerInput=JSON.parse(options.body);const context=JSON.parse(providerInput.input);if(context.task==='build'){const candidate=context.candidates.find(p=>p.eventId==='fixture-game-1'&&p.book==='draftkings');return Response.json({status:'completed',output_text:JSON.stringify({analysis:'Fixture built card. Risk note: uncertain.',picks:[{id:candidate.id,reason:'Fixture selection.'}]})})}return Response.json({status:'completed',output_text:'Fixture analysis <script>window.compromised=true</script>. Risk note: uncertain outcomes.'})}};
 const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());
  if(u.pathname.endsWith('/api/playmaker-public')){const r=await playmakerPublic({env,request:new Request(req.url(),{method:req.method(),headers:{...req.headers(),'CF-Connecting-IP':'192.0.2.1'},...(req.method()==='POST'?{body:req.postData()}:{})})},services);return route.fulfill({status:r.status,body:await r.text(),headers:Object.fromEntries(r.headers)})}
  if(u.pathname.endsWith('/api/playmaker-logos'))return route.fulfill({json:{logos:{testhome:'https://a.espncdn.com/i/teamlogos/nfl/500/home.png',testaway1:'https://a.espncdn.com/i/teamlogos/nfl/500/away.png'}}});
  if(u.hostname==='a.espncdn.com')return route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50"><circle cx="25" cy="25" r="24" fill="gold"/></svg>'});
  if(u.pathname.endsWith('/api/live-scores')){liveCalls++;return route.fulfill({json:{asOf:Date.now(),events:[{league:'NFL',state:'in',away:{name:'AWAY',score:7},home:{name:'HOME',score:liveCalls*10},detail:'Q2'}]}})}
  if(u.pathname.includes('/api/'))return route.fulfill({json:{signedIn:false,events:[],pools:[],rooms:[]}});
  if(u.origin!==origin)return route.abort();
  const file=resolve(root,'.'+decodeURIComponent(u.pathname)+(u.pathname.endsWith('/')?'index.html':''));if(!file.startsWith(root)||!existsSync(file)){missing.push(u.pathname);return route.fulfill({status:404,body:''})}
  return route.fulfill({body:readFileSync(file),contentType:({'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[extname(file)]||'application/octet-stream')});
 });
 try{
  await page.goto(origin+'/new-build/index.html');await page.locator('#playmaker a[href="./playmaker/"]').click();await page.waitForURL('**/playmaker/');
  await page.waitForFunction(()=>!document.querySelector('#analyze-button').disabled);
  assert.equal(await page.locator('#board').count(),0,'Market board removed, not merely hidden');assert.equal(await page.locator('a[href*="browse.html"]').count(),0);assert.equal(await page.locator('#optional-odds').count(),0);
  assert(await page.locator('#build-risk').isVisible());assert(await page.locator('#sport-filters').isVisible());assert(await page.locator('#book-filter').isVisible());assert.equal(aiCalls,0);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Builder fits '+width);
  await page.locator('#how-it-works').click();assert(await page.locator('#guide-dialog').isVisible());await page.locator('#close-guide').click();
  assert(await page.locator('#build-category option[value="touchdowns"]').count());
  for(const [sport,category] of [['NBA','assists'],['NCAAB','rebounds'],['NHL','shots'],['MLB','strikeouts'],['NCAAF','receiving_yards']]){await page.locator(`[data-sport="${sport}"]`).click();assert.equal(await page.locator(`#build-category option[value="${category}"]`).count(),1);assert.equal(await page.locator('#build-category option[value="mixed"]').count(),1);}
  await page.locator('[data-sport="NFL"]').click();assert.equal(await page.locator('#build-category').inputValue(),'game');
  await page.locator('#build-risk').selectOption('aggressive');await page.locator('#build-kind').selectOption('single');assert(await page.locator('#build-legs').isDisabled());
  await page.locator('#question-input').fill('Build an aggressive NFL pick.');await page.locator('#analyze-button').click();await page.getByRole('button',{name:'View my card',exact:true}).waitFor();
  await page.locator('.builder-team .badge img').first().waitFor();assert.equal(await page.locator('.builder-team .badge img').count(),2);assert.equal(aiCalls,1);const sent=JSON.parse(providerInput.input);assert.equal(sent.risk,'aggressive');assert.equal(sent.kind,'single');assert.equal(sent.legs,1);assert(sent.candidates.length>0);assert.match(await page.locator('#ai-remaining').innerText(),/4 requests/);
  await page.locator('#analyst').screenshot({path:`${out}/builder-only-${width}.png`});
  await page.getByRole('button',{name:'View my card',exact:true}).click();await page.waitForURL('**/playmaker/card.html?*');
  assert.equal(await page.locator('#results-count').innerText(),'1 pick');assert.match(await page.locator('#results-picks').innerText(),/Test Away 1/);assert.equal(await page.locator('.badge').count(),2);await page.locator('.badge img').first().waitFor();assert.equal(await page.locator('.badge img').count(),2);
  assert(!(await page.locator('#results-analysis').isVisible()));assert(!(await page.locator('.pick details p').isVisible()));await page.locator('.pick summary').click();assert.match(await page.locator('.pick details p').innerText(),/Fixture selection/);
  await page.locator('#results-stake').fill('20');assert.equal(await page.locator('#results-return').innerText(),'$38.18');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`${out}/card-results-${width}.png`});await page.reload();assert.match(await page.locator('#results-picks').innerText(),/Test Away 1/);assert.equal(aiCalls,1);
  const firstCardUrl=page.url();await page.getByRole('link',{name:'My Cards',exact:true}).click();await page.waitForURL('**/playmaker/cards.html');assert.equal(await page.locator('#history-list .pick').count(),1);assert.equal(aiCalls,1);
  await page.locator('#history-filter').selectOption('visit');assert.equal(await page.locator('#history-list .pick').count(),1);await page.getByRole('link',{name:'Open card',exact:true}).click();assert.equal(page.url(),firstCardUrl);
  await page.evaluate(()=>{for(const storage of [localStorage,sessionStorage]){const key='links-playmaker:history:v1',entries=JSON.parse(storage.getItem(key)||'[]');for(const entry of entries){entry.createdAt=Date.now()-1200000;for(const pick of entry.card){pick.updatedAt=new Date(entry.createdAt-60000).toISOString()}}storage.setItem(key,JSON.stringify(entries))}});await page.reload();assert.equal(await page.locator('.pick').count(),1,'Archived picks still visible after prices age');assert.match(await page.locator('#results-status').innerText(),/saved prices, not live odds/);assert.equal(aiCalls,1);
  await page.getByRole('link',{name:'Change preferences',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('#analyze-button').disabled);assert(await page.locator('#build-risk').isVisible());
  await page.locator('#build-category').selectOption('receptions');await page.locator('#build-kind').selectOption('single');await page.locator('#analyze-button').click();await page.getByRole('button',{name:'View my card',exact:true}).waitFor();assert.equal(aiCalls,2);assert.equal(JSON.parse(providerInput.input).category,'receptions');await page.locator('.primary-nav a[href="./cards.html"]').click();await page.waitForURL('**/playmaker/cards.html');assert.equal(await page.locator('#history-list .pick').count(),2,'Every successful build saved even before View my card');assert.equal(aiCalls,2);await page.getByRole('link',{name:'Open card',exact:true}).first().click();await page.waitForURL('**/card.html?*');assert.match(await page.locator('#results-picks').innerText(),/Test Player.*Receptions over 5.5/s);assert.equal(await page.locator('#results-return').innerText(),'$19.09');await page.goto(origin+'/new-build/playmaker/');await page.waitForFunction(()=>!document.querySelector('#analyze-button').disabled);
  if(width===1440){services.session=async()=>({email:'jakedoutt@yahoo.com'});await page.reload();await page.waitForFunction(()=>document.querySelector('#ai-remaining').textContent.includes('Lifetime testing pass'));}
  await page.goto(origin+'/new-build/playmaker/browse.html');await page.waitForURL('**/playmaker/');assert.equal(await page.locator('#board').count(),0);assert.equal(aiCalls,2,'Old board bookmarks redirect without AI calls');
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log(`PASS Playmaker ${width}px: builder-only entry, no board links, real canonical build request, visual saved results, collapsed explanations, return math, owner allowance and old bookmark redirect.`);
 }finally{await page.close();db.raw.close()}
}}finally{await browser.close()}
