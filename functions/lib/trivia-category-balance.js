// Shuffle within categories, then deal one from each available category per pass.
// A larger category must not dominate the opening rounds of a mixed game.
export function balancedCategories(questions){
 const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
 const buckets=new Map();for(const q of questions){const key=q.category||'general';if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(q)}
 for(const [key,rows] of buckets)buckets.set(key,shuffle(rows));
 const result=[];let previous;
 while(buckets.size){const keys=shuffle([...buckets.keys()]);if(keys.length>1&&keys[0]===previous)[keys[0],keys[1]]=[keys[1],keys[0]];for(const key of keys){const rows=buckets.get(key);result.push(rows.pop());previous=key;if(!rows.length)buckets.delete(key)}}
 return result;
}
