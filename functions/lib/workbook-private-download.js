// Temporary, server-enforced delivery for Destiny. Set false to close access.
// The password is never stored here; it is required to decrypt the archive.
import {recordWorkbookDownload,confirmWorkbookDownload} from './workbook-download-activity.js';
export const DESTINY_WORKBOOK_DOWNLOAD_ENABLED = true;
const ARCHIVES = Object.freeze({
  windows: {path: '/downloads/private/destiny-windows.enc', name: 'Destiny-NFL-Crew-Windows.zip'},
  mac: {path: '/downloads/private/destiny-mac.enc', name: 'Destiny-NFL-Crew-Mac.zip'},
});
const MAX_REQUEST_BYTES = 2048;
const MAX_ARCHIVE_BYTES = 24 * 1024 * 1024;
const encoder = new TextEncoder();
const PRIVATE_HEADERS = {'Cache-Control': 'private, no-store, max-age=0', Pragma: 'no-cache', 'X-Content-Type-Options': 'nosniff'};
const json = (body, status, extra = {}) => Response.json(body, {status, headers: {...PRIVATE_HEADERS, ...extra}});

async function readBounded(stream, maximum) {
  if (!stream) return new Uint8Array();
  const reader = stream.getReader(), chunks = [];
  let length = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maximum) {await reader.cancel(); throw Error('too large');}
      chunks.push(value);
    }
  } finally {reader.releaseLock();}
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {bytes.set(chunk, offset); offset += chunk.byteLength;}
  return bytes;
}

function fromBase64(value, length) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) throw Error('Invalid archive.');
  const raw = atob(value);
  if (raw.length !== length || btoa(raw) !== value) throw Error('Invalid archive.');
  return Uint8Array.from(raw, character => character.charCodeAt(0));
}

// Envelope: LWX1 + big-endian uint32 JSON length + UTF-8 JSON + ciphertext/tag.
// The prefix and JSON are authenticated as AES-GCM additionalData.
export function parsePrivateWorkbookEnvelope(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length < 25 || bytes.length > MAX_ARCHIVE_BYTES ||
    new TextDecoder().decode(bytes.subarray(0, 4)) !== 'LWX1') throw Error('Invalid archive.');
  const length = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, false);
  if (length < 1 || length > 4096 || 8 + length + 16 >= bytes.length) throw Error('Invalid archive.');
  const header = JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes.subarray(8, 8 + length)));
  if (header.v !== 1 || header.kdf !== 'PBKDF2' || header.hash !== 'SHA-256' || header.iterations !== 100000) throw Error('Invalid archive.');
  return {salt: fromBase64(header.salt, 16), iv: fromBase64(header.iv, 12),
    additionalData: bytes.subarray(0, 8 + length), ciphertext: bytes.subarray(8 + length)};
}

export async function decryptPrivateWorkbook(envelope, password) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({name: 'PBKDF2', hash: 'SHA-256', iterations: 100000, salt: envelope.salt},
    material, {name: 'AES-GCM', length: 256}, false, ['decrypt']);
  return new Uint8Array(await crypto.subtle.decrypt({name: 'AES-GCM', iv: envelope.iv,
    additionalData: envelope.additionalData, tagLength: 128}, key, envelope.ciphertext));
}

async function allowAttempt(request, db) {
  // Separate from account/admin login limits. An atomic insert/update prevents
  // simultaneous requests from bypassing the eight-attempt, 15-minute window.
  if (!db) throw Error('Download unavailable.');
  await db.prepare('CREATE TABLE IF NOT EXISTS links_workbook_download_attempts (ip TEXT PRIMARY KEY, window INTEGER NOT NULL, count INTEGER NOT NULL)').run();
  const ip = request.headers.get('cf-connecting-ip') || 'local';
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode('private-workbook:' + ip));
  const key = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  const window = Math.floor(Date.now() / 900000);
  return !!await db.prepare('INSERT INTO links_workbook_download_attempts(ip,window,count) VALUES(?,?,1) ON CONFLICT(ip) DO UPDATE SET window=excluded.window,count=CASE WHEN window=excluded.window THEN count+1 ELSE 1 END WHERE window<>excluded.window OR count<8 RETURNING count').bind(key, window).first();
}

export async function privateWorkbookDownload({request, env}, {enabled = DESTINY_WORKBOOK_DOWNLOAD_ENABLED} = {}) {
  if (!enabled) return json({error: 'This download is no longer available.'}, 404);
  if (request.method !== 'POST') return json({error: 'Use the download form to request this file.'}, 405, {Allow: 'POST'});
  if (request.headers.get('Origin') !== new URL(request.url).origin) return json({error: 'Open the workbook page to request this download.'}, 403);
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json({error: 'Invalid download request.'}, 400);
  if (Number(request.headers.get('Content-Length')) > MAX_REQUEST_BYTES) return json({error: 'Request too large.'}, 413);
  let input;
  try {input = JSON.parse(new TextDecoder().decode(await readBounded(request.body, MAX_REQUEST_BYTES)));}
  catch (error) {return json({error: error.message === 'too large' ? 'Request too large.' : 'Invalid download request.'}, error.message === 'too large' ? 413 : 400);}
  if (input?.action === 'received') {
    try {return await confirmWorkbookDownload(env?.DB,input.receipt) ? json({ok:true},200) : json({error:'Download receipt not found.'},404);}
    catch {return json({error:'Download confirmation is temporarily unavailable.'},503);}
  }
  const archive = typeof input?.version === 'string' && Object.hasOwn(ARCHIVES, input.version) ? ARCHIVES[input.version] : null;
  if (!archive) return json({error: 'Choose Windows or Mac.'}, 400);
  try {
    if (!await allowAttempt(request, env?.DB)) return json({error: 'Too many attempts. Please try again in 15 minutes.'}, 429, {'Retry-After': '900'});
    if (typeof input.password !== 'string' || !input.password.length || input.password.length > 256) return json({error: 'The password was not accepted. Please try again.'}, 401);
    if (!env?.ASSETS?.fetch) return json({error: 'The download is temporarily unavailable.'}, 503);
    // Never forward the password, cookies, or authorization to the asset store.
    const asset = await env.ASSETS.fetch(new Request(new URL(archive.path, request.url)));
    if (!asset.ok || Number(asset.headers.get('Content-Length')) > MAX_ARCHIVE_BYTES) return json({error: 'The download is temporarily unavailable.'}, 503);
    let envelope;
    try {envelope = parsePrivateWorkbookEnvelope(await readBounded(asset.body, MAX_ARCHIVE_BYTES));}
    catch {return json({error: 'The download is temporarily unavailable.'}, 503);}
    let bytes;
    try {bytes = await decryptPrivateWorkbook(envelope, input.password);}
    catch {return json({error: 'The password was not accepted. Please try again.'}, 401);}
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b || ![3, 5, 7].includes(bytes[2])) return json({error: 'The download is temporarily unavailable.'}, 503);
    let receipt = '';
    try {receipt = await recordWorkbookDownload(env.DB,input.version,bytes.byteLength);}
    catch {console.error('Private workbook download activity could not be recorded.');}
    return new Response(bytes, {headers: {...PRIVATE_HEADERS, ...(receipt ? {'X-Workbook-Download-Receipt':receipt} : {}), 'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="' + archive.name + '"', 'Content-Length': String(bytes.byteLength)}});
  } catch {return json({error: 'The download is temporarily unavailable. Please try again.'}, 503);}
}
