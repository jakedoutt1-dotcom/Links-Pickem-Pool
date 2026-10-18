export async function ensureWorkbookDownloadActivity(db) {
  await db.prepare('CREATE TABLE IF NOT EXISTS links_workbook_download_activity (id TEXT PRIMARY KEY, version TEXT NOT NULL, prepared_at TEXT NOT NULL, received_at TEXT, bytes INTEGER NOT NULL)').run();
}
export async function recordWorkbookDownload(db, version, bytes) {
  await ensureWorkbookDownloadActivity(db);
  const receipt = crypto.randomUUID();
  await db.prepare('INSERT INTO links_workbook_download_activity(id,version,prepared_at,bytes) VALUES(?,?,?,?)').bind(receipt,version,new Date().toISOString(),bytes).run();
  return receipt;
}
export async function confirmWorkbookDownload(db, receipt) {
  if (typeof receipt !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(receipt)) return false;
  await ensureWorkbookDownloadActivity(db);
  return !!await db.prepare('UPDATE links_workbook_download_activity SET received_at=COALESCE(received_at,?) WHERE id=? AND prepared_at>=? RETURNING id').bind(new Date().toISOString(),receipt,new Date(Date.now()-86400000).toISOString()).first();
}
export async function workbookDownloadActivity(db) {
  await ensureWorkbookDownloadActivity(db);
  const summaries = (await db.prepare('SELECT version,COUNT(*) prepared,COUNT(received_at) received,MAX(prepared_at) lastPrepared,MAX(received_at) lastReceived FROM links_workbook_download_activity GROUP BY version').all()).results || [];
  const recent = (await db.prepare('SELECT version,prepared_at,received_at,bytes FROM links_workbook_download_activity ORDER BY prepared_at DESC LIMIT 25').all()).results || [];
  return {summaries,recent};
}
