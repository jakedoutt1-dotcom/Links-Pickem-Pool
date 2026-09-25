import * as core from './members-core.js';

// v625 D1 compatibility: Cloudflare Pages exposes D1 by configured binding name.
// Prefer LINKS_DB; accept DB1 for the New Build database. Never use env.DB here:
// DB is reserved for protected v661/reference access.
function normalizeContext(context){
  const env=context?.env||{};
  if(!env.LINKS_DB && env.DB1) env.LINKS_DB=env.DB1;
  return context;
}
export function onRequestGet(context){return core.onRequestGet(normalizeContext(context));}
export function onRequestPost(context){return core.onRequestPost(normalizeContext(context));}
