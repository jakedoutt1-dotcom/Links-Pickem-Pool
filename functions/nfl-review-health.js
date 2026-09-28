// NFL review binding diagnostic — redeploy marker 2026-09-28
export async function onRequestGet(context) {
  return new Response(JSON.stringify({ ok: true, redeploy: "2026-09-28-1352", hasDB: Boolean(context.env && context.env.DB), hasLinksDB: Boolean(context.env && context.env.LINKS_DB) }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
