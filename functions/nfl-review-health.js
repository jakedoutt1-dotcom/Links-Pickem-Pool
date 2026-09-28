export async function onRequestGet(context) {
  return new Response(JSON.stringify({ ok: true, hasDB: Boolean(context.env && context.env.DB), hasLinksDB: Boolean(context.env && context.env.LINKS_DB) }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}
