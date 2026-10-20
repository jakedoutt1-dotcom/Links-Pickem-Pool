import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,existsSync,mkdirSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {fixture} from './helpers/pool-format-fixture.mjs';
import {dailyRequest} from '../functions/new-build/api/daily-challenge.js';
import {ensureAccounts,digest} from '../functions/lib/commissioner-account.js';
import {ensurePartners} from '../functions/lib/partners.js';
import {dailyDeck} from '../functions/lib/daily-challenge.js';

const {db}=fixture(),origin='https://venue-integration.test',root=resolve('public');
let now=Date.parse('2026-10-20T17:00:00Z');
const venueModule=await import('../functions/new-build/api/venue-leaderboard.js');
const venueRequest=venueModule.venueLeaderboardRequest||venueModule.leaderboardRequest||venueModule.onRequest;
async function call(route,body=null,{token='alice',query=''}={}){
 const request=new Request(origin+'/new-build/api/'+route+query,{method:body?'POST':'GET',headers:{Origin:origin,...(token?{'x-links-account':token}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const response=await (route==='venue-leaderboard'?venueRequest:dailyRequest)({request,env:{DB:db}},{now:()=>now});
 return {status:response.status,...await response.json()};
}
async function finish(token,partnerId){
 let r=await call('daily-challenge',{action:'start',...(partnerId?{partnerId}:{})},{token});assert.equal(r.status,200);
 const act=async(action,extra={})=>call('daily-challenge',{action,id:r.attempt.id,version:r.attempt.version,...extra},{token});
 if(r.attempt.needsSpin)r=await act('spin');r=await act('next');for(let i=0;i<5;i++){r=await act('answer',{choice:dailyDeck(r.day)[i].answer});assert.equal(r.status,200);r=await act('next')}
 assert.equal(r.attempt.status,'complete');assert.equal(r.attempt.score,r.attempt.maxScore);assert.equal(r.attempt.correct,5);return r;
}
try{
 await ensureAccounts(db);await ensurePartners(db);
 for(const token of ['alice','bob','carol'])await db.prepare('INSERT INTO links_account_sessions VALUES(?,?,?)').bind(await digest(token),token+'@private.example','2099-01-01').run();
 for(const [id,name,active]of [['alpha','Alpha Venue',1],['beta','Beta Venue',1],['closed','Closed Venue',0]])await db.prepare('INSERT INTO links_partners VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,name,'/links-small-logo.png','Private street address',36.1,-86.3,100,'Venue special','https://example.com',0,active,'2026-10-20').run();
 let r=await call('daily-challenge',null,{token:null});assert.equal(r.signedIn,false);assert.equal(r.venues.length,2);
 assert.equal((await call('daily-challenge',{action:'start',partnerId:'alpha'},{token:null})).status,401);
 assert.equal((await call('daily-challenge',{action:'start',partnerId:'missing'})).status,400);
 assert.equal((await call('daily-challenge',{action:'start',partnerId:'closed'})).status,400);
 r=await call('daily-challenge',{action:'start',partnerId:'alpha'});assert.equal(r.attempt.venue.id,'alpha');
 r=await call('daily-challenge',{action:'start',partnerId:'beta'});assert.equal(r.attempt.venue.id,'alpha','A started attempt cannot be retagged');
 const aliceScore=(await finish('alice','alpha')).attempt.maxScore,bobScore=(await finish('bob','beta')).attempt.maxScore;await finish('carol');
 r=await call('venue-leaderboard',null,{token:null,query:'?period=today'});assert.equal(r.status,200);assert.equal(r.period,'today');assert.equal(r.venueStandings.find(v=>v.id==='alpha').score,aliceScore);assert.equal(r.venueStandings.find(v=>v.id==='alpha').players,1);
 assert(r.leaderboard.some(p=>p.venueName==='Alpha Venue'));assert(r.leaderboard.some(p=>p.venueName==='Beta Venue'));
 r=await call('venue-leaderboard',null,{query:'?period=today&venue=alpha'});assert.equal(r.selectedVenue.id,'alpha');assert(r.leaderboard.every(p=>p.venueId==='alpha'));assert.equal(r.leaderboard.length,1);assert.equal(r.leaderboard[0].correct,5);
 const before=r.leaderboard[0].score;await call('daily-challenge',{action:'start',partnerId:'beta'});r=await call('venue-leaderboard',null,{query:'?period=today&venue=alpha'});assert.equal(r.leaderboard[0].score,before,'Repeated start never duplicates results');
 const publicText=JSON.stringify(r);for(const value of ['@private.example','Private street','latitude','longitude'])assert(!publicText.includes(value));
 now=Date.parse('2026-10-21T17:00:00Z');const nextScore=(await finish('alice','beta')).attempt.maxScore;r=await call('venue-leaderboard',null,{query:'?period=today&venue=beta'});assert.equal(r.leaderboard[0].score,nextScore);assert.equal(r.leaderboard[0].correct,5);
 r=await call('venue-leaderboard',null,{query:'?period=all&venue=beta'});assert.equal(r.venueStandings.find(v=>v.id==='beta').score,bobScore+nextScore);
 db.raw.prepare('UPDATE links_partners SET active=0,name=? WHERE id=?').run('Renamed Alpha','alpha');r=await call('venue-leaderboard',null,{query:'?period=all&venue=alpha'});assert.equal(r.leaderboard[0].venueName,'Alpha Venue');
 console.log('PASS venue leaderboard real account + Daily flow: optional active venue, immutable saved venue, complete-only score, filters, today/all time, no replay double count, historical names and privacy.');

 const require=createRequire(import.meta.url),{chromium}=require('playwright'),browser=await chromium.launch({channel:'msedge',headless:true});
 try{for(const width of [320,390,1280]){
  const page=await browser.newPage({viewport:{width,height:920}}),errors=[];let unavailable=false;page.on('pageerror',e=>errors.push(e.message));
  const browserToken='browser-'+width;await db.prepare('INSERT INTO links_account_sessions VALUES(?,?,?)').bind(await digest(browserToken),browserToken+'@private.example','2099-01-01').run();await page.addInitScript(t=>localStorage.setItem('links-account-token',t),browserToken);
  await page.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());if(u.origin!==origin)return route.abort();
   if(u.pathname.endsWith('/api/venue-leaderboard')||u.pathname.endsWith('/api/daily-challenge')){
    if(unavailable)return route.fulfill({status:503,json:{error:'Temporarily unavailable'}});
    const response=await (u.pathname.endsWith('/api/daily-challenge')?dailyRequest:venueRequest)({request:new Request(u,{method:req.method(),headers:req.headers(),...(req.method()==='POST'?{body:req.postData()}:{} )}),env:{DB:db}},{now:()=>now});
    return route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});
   }
   const f=resolve(root,'.'+decodeURIComponent(u.pathname));if(!f.startsWith(root)||!existsSync(f))return route.fulfill({status:404,body:''});return route.fulfill({body:readFileSync(f),contentType:({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.png':'image/png'}[extname(f)]||'application/octet-stream')});
  });
  try{
   await page.goto(origin+'/new-build/venue-leaderboard.html');await page.locator('#leaders').waitFor();await page.waitForFunction(()=>document.querySelector('#leaders').textContent.includes('Beta Venue'));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Board fits '+width);
   await page.locator('#period').selectOption('all');await page.locator('#venue').selectOption('alpha');await page.waitForFunction(()=>document.querySelector('#leaders').textContent.includes('Alpha Venue'));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Filtered board fits '+width);assert.equal(await page.locator('#play').getAttribute('href'),'./daily-challenge.html','Past venue results do not suggest joining an inactive venue');
   unavailable=true;await page.locator('#refresh').click();await page.waitForFunction(()=>/unavailable/i.test(document.querySelector('#notice').textContent));unavailable=false;await page.locator('#refresh').click();await page.waitForFunction(()=>!/unavailable/i.test(document.querySelector('#notice').textContent));
   await page.evaluate(()=>navigator.share=()=>Promise.reject(Object.assign(new Error(),{name:'AbortError'})));await page.locator('#share').click();assert.equal(await page.locator('#shareStatus').innerText(),'');
   await page.evaluate(()=>navigator.share=()=>Promise.resolve());await page.locator('#share').click();assert.match(await page.locator('#shareStatus').innerText(),/shared/i);
   mkdirSync('output/venue-leaderboard',{recursive:true});await page.screenshot({path:`output/venue-leaderboard/board-${width}.png`,fullPage:true});
   await page.goto(origin+'/new-build/daily-challenge.html?venue=beta');await page.locator('#start:visible').waitFor();assert.equal(await page.locator('#venuePicker').inputValue(),'beta','Venue link suggests a choice before start');
   await page.locator('#start').click();await page.locator('#spin:visible').waitFor();await page.locator('#spin').click();await page.locator('#next:visible').waitFor();assert.match(await page.locator('#playingFor').innerText(),/Beta Venue/);await page.reload();await page.locator('#next:visible').waitFor();assert.match(await page.locator('#playingFor').innerText(),/Beta Venue/);
   await page.locator('#next').click();const deck=dailyDeck('2026-10-21');for(let i=0;i<5;i++){await page.locator('#choices button').nth(deck[i].answer).click();await page.locator('#submit').click();await page.locator('#feedback:visible').waitFor();await page.locator('#next').click()}
   await page.locator('#finish:visible').waitFor();assert.match(await page.locator('#badges').innerText(),/Perfect Five/);assert.match(await page.locator('#result').innerText(),/Beta Venue/);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Daily picker/game fits '+width);assert.deepEqual(errors,[]);
   console.log('PASS venue leaderboard browser '+width+'px: real endpoint, today/all filters, venue names, history, failure/retry and fit.');
  }finally{await page.close()}
 }}finally{await browser.close()}
}finally{db.raw.close()}
