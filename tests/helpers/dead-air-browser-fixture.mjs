import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const origin='http://127.0.0.1:8775';
const publicRoot=fileURLToPath(new URL('../../public/',import.meta.url));
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.woff2':'font/woff2'};

// Every browser request is fulfilled locally; these tests need no listening server.
export async function offlineDeadAir(context,api){
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!==origin)return route.abort('blockedbyclient');
  if(url.pathname==='/new-build/api/dead-air')return api(route);
  if(url.pathname.includes('/api/'))return route.fulfill({json:{ok:true}});
  const file=path.resolve(publicRoot,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(path.resolve(publicRoot)+path.sep))return route.fulfill({status:404,body:'Not found'});
  try{return await route.fulfill({body:await readFile(file),contentType:types[path.extname(file)]||'application/octet-stream'})}
  catch{return route.fulfill({status:404,body:'Not found'})}
 });
}
