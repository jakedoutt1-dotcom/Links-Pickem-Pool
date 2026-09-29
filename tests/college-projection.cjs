const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../public/new-build/college-projection.js'),'utf8'),{window});
const project=window.LINKS_COLLEGE_PROJECTION,games=[{eventId:'1',home:'A',away:'B',completed:false}],players=[{player:'Alice',picks:{1:'A'}},{player:'Bob',picks:{1:'B'}}];
let rows=project(players,games,{1:.8});assert.ok(Math.abs(rows.find(r=>r.player==='Alice').chance-.8)<.02);assert.equal(rows[0].expected,.8);
players[1].picks[1]='A';rows=project(players,games,{1:.8});assert.ok(rows.every(r=>Math.abs(r.chance-1)<.0001),'Identical cards tie for first on every outcome');
games[0].completed=true;games[0].winner='B';rows=project(players,games,{});assert.ok(rows.every(r=>r.expected===0&&r.chance===1),'Final wrong picks remain tied at zero');
assert.equal(project([],games,{}).length,0);const many=Array.from({length:25},(_,i)=>({eventId:String(i),home:'A',away:'B',completed:false}));assert.ok(Number.isFinite(project(players,many,{})[0].chance));
console.log('PASS independent college projections: shared outcomes, probability estimates, ties, finals, and 25-game slates');
