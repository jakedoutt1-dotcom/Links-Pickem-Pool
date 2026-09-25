import * as core from './members-core.js';

// v626: normalize the New Build D1 binding without mutating Cloudflare's env object.
// Cloudflare may expose env as an immutable/frozen object. Build a fresh context/env
// and keep protected production DB completely out of this API.
function normalizeContext(context){
  const source=context?.env||{};
  const newBuildDb=source.LINKS_DB||source.DB1||null;
  return {...context,env:{...source,LINKS_DB:newBuildDb}};
}
export function onRequestGet(context){return core.onRequestGet(normalizeContext(context));}
export function onRequestPost(context){return core.onRequestPost(normalizeContext(context));}
