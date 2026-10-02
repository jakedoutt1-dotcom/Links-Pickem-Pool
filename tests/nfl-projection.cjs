const assert=require('node:assert/strict');require('../public/new-build/nfl-projection.js');const {probability,project}=globalThis.LINKS_NFL_PROJECTION;
assert.equal(probability({winprobability:[{homeWinPercentage:75}]}),.75);
assert.equal(probability({predictor:{homeTeam:{gameProjection:60},awayTeam:{gameProjection:40}}}),.6);
assert.equal(probability({}),null);
const games=[{gameIndex:0,home:'A',away:'B'}],players=[{player:'Alice',picks:{0:'A'}},{player:'Bob',picks:{0:'B'}}];
let rows=project(players,games,{}, {0:{home:.75}});assert.equal(rows[0].chance,.75);assert.equal(rows[1].chance,.25);
rows=project([...players,{player:'Carol',picks:{0:'A'}}],games,{}, {0:{home:.75}});assert.equal(rows.find(x=>x.player==='Carol').chance,.75);
rows=project(players,[{...games[0],completed:true,winner:'B'}],{0:'B'},{});assert.equal(rows[0].player,'Bob');assert.equal(rows[0].chance,1);assert.equal(rows[1].chance,0);
console.log('PASS projection: normalized live/pregame odds, correlated picks, final outcomes');

const odds={pickcenter:[{homeTeamOdds:{moneyLine:-200},awayTeamOdds:{moneyLine:170}}]};
assert.ok(Math.abs(probability(odds)-(2/3)/((2/3)+(100/270)))<1e-10);
assert.equal(probability({...odds,winprobability:[{homeWinPercentage:.9}]}),.9);
assert.equal(probability({pickcenter:[{moneyline:{home:{current:{odds:'-110'}},away:{current:{odds:'-110'}}}}]}),.5);
rows=project([...players,{player:'Carol',picks:{0:'A'}}],games,{}, {0:{home:.75}});
assert.equal(rows.find(x=>x.player==='Carol').winChance,.375);
assert.equal(rows.find(x=>x.player==='Bob').winChance,.25);
assert.equal(rows.reduce((n,x)=>n+x.winChance,0),1);
console.log('PASS moneyline margin removal, live priority and shared first-place estimates');
