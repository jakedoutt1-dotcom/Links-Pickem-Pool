// Preserve modern LINK- codes; retain normalized lookup for older bookmarks.
export async function lookupPoolCode(db,input){
 const raw=String(input||'').trim();if(!raw)return null;
 const exact=await db.prepare('SELECT * FROM pools WHERE upper(code)=upper(?)').bind(raw).first();if(exact)return exact;
 const legacy=raw.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,20);
 if(legacy!==raw.toUpperCase())return db.prepare('SELECT * FROM pools WHERE upper(code)=upper(?)').bind(legacy).first();
 return null;
}
