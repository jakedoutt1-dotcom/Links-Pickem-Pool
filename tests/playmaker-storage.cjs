const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../public/new-build/playmaker-storage.js'),'utf8');
const data=new Map([['links-playmaker-my-play',JSON.stringify([{selection:'Unowned legacy data'}])]]);
function load(pool,player){
 if(pool)data.set('links-current-pool',JSON.stringify({id:pool}));else data.delete('links-current-pool');
 if(player)data.set('links-player-id',player);else data.delete('links-player-id');
 const listeners={},window={addEventListener:(key,fn)=>listeners[key]=fn};let reloads=0;
 const localStorage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};
 vm.runInNewContext(source,{window,localStorage,location:{reload:()=>reloads++}});
 return {api:window.LINKS_PLAYMAKER_STORAGE,listeners,reloads:()=>reloads};
}
const alice=load('1','Alice');assert.equal(alice.api.read().length,0,'Unowned legacy data is not exposed');assert.equal(alice.api.write([{selection:'Private Alice data'}]),true);
const bob=load('1','Bob');assert.equal(bob.api.read().length,0);assert.equal(alice.api.write([{selection:'Wrong account'}]),false);alice.listeners.storage({key:'links-player-id'});assert.equal(alice.reloads(),1);
assert.equal(load('2','Alice').api.read().length,0,'Pools are isolated');assert.equal(load('1','Alice').api.read()[0].selection,'Private Alice data');
const key='links-playmaker-private:'+encodeURIComponent(JSON.stringify(['1','Alice']));
for(const bad of ['{','null','{}','[null,4,{},[]]']){data.set(key,bad);assert.equal(load('1','Alice').api.read().length,0,'Malformed data cannot break rendering')}
const guest=load(null,null);assert.equal(guest.api.read().length,0);assert.equal(guest.api.write([{selection:'Guest'}]),false);
assert.ok(data.has('links-playmaker-my-play'),'Legacy data preserved without assigning it to another player');
console.log('PASS private storage: player/pool isolation, account changes, malformed data, and guest behavior');
