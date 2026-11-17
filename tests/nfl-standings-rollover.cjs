const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('public/new-build/nfl-standings.html', 'utf8');
const script = html.split('<script>(async()=>{const requestedWeek=')[1].split('</script>')[0];
const pending = [];
const final = {
 week: 10, locked: true, allFinal: true, tieLocked: true,
 finalGames: 14, expectedGames: 14, finalizedWinners: ['Thad'],
 rows: [
  {player: 'Thad', wins: 10, losses: 4, tiePick: 41, tieDiff: 1},
  {player: 'Ethan', wins: 10, losses: 4, tiePick: 50, tieDiff: 10},
  {player: 'No guess', wins: 10, losses: 4, tieDiff: null}
 ]
};
function page(query) {
 const location = {href: 'https://site.test/new-build/nfl-standings.html?pool=1'+query};
 Object.defineProperty(location,'search',{get:()=>new URL(location.href).search});
 const elements = {
  week: {add() {}}, standingsStatus: {}, standingsBody: {}
 };
 const winner = [];
 let poll;
 const context = {
  URL, URLSearchParams, location, Option: function(){}, prev: {}, next: {},
  history: {replaceState(a,b,url){location.href=String(url)}},
  document: {getElementById: id=>elements[id]},
  localStorage: {getItem:()=>null},
  window: {
   LINKS_NFL_CURRENT_WEEK: 11,
   LINKS_NFL_WEEK_READY: Promise.resolve().then(()=>{
    if (!query) location.href+='&week=11';
   }),
   LINKSStandingsWinner: {celebrate: options=>winner.push(options.winner)}
  },
  fetch: url=>new Promise(resolve=>pending.push({url,resolve})),
  setInterval: fn=>{poll=fn}
 };
 const boot=vm.runInNewContext('(async()=>{const requestedWeek='+script,context);
 return {boot,elements,winner,refresh:()=>poll()};
}
async function answer(request,data){
 request.resolve({ok:true,json:async()=>data});
 await new Promise(setImmediate);
}
(async()=>{
 const exact=page('&week=10');
 await exact.boot;
 let request=pending.shift();
 assert.match(request.url,/week=10&/);
 assert.doesNotMatch(request.url,/default=1/);
 await answer(request,final);
 assert.deepEqual(exact.winner,['Thad']);
 assert.match(exact.elements.standingsBody.innerHTML,/Thad.*Ethan.*No guess/);

 const automatic=page('');
 await automatic.boot;
 request=pending.shift();
 assert.match(request.url,/week=11&default=1/);
 await answer(request,final);
 assert.equal(automatic.elements.week.value,10);
 automatic.refresh();
 await answer(pending.shift(),{...final,allFinal:false,finalizedWinners:[]});
 assert.match(automatic.elements.standingsStatus.innerHTML,/FINAL/);
 assert.deepEqual(automatic.winner,['Thad']);

 automatic.refresh();
 const stale=pending.shift();
 automatic.elements.week.value=9;
 automatic.elements.week.onchange();
 await answer(pending.shift(),{...final,week:9,finalizedWinners:[]});
 await answer(stale,final);
 assert.match(automatic.elements.standingsStatus.innerHTML,/WEEK 9/);
 console.log('PASS explicit week, rollover winner, missing tiebreaker, feed regression, navigation race');
})().catch(error=>{console.error(error);process.exitCode=1});
