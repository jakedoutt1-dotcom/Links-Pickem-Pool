#!/usr/bin/env node
/**
 * Package the owner's existing ZIPs without changing or publishing plaintext.
 * Usage: DESTINY_DOWNLOAD_PASSWORD=<password> node scripts/package-private-workbooks.mjs
 *   --windows <original-windows.zip> --mac <original-mac.zip>
 *   [--out public/downloads/private]
 *
 * LWX1: magic (4 bytes), JSON-header length (uint32 BE), UTF-8 JSON header,
 * AES-256-GCM ciphertext, then the 16-byte authentication tag. The complete
 * prefix and header are authenticated additional data. Every file receives
 * a fresh random 16-byte salt and 12-byte IV. Never commit the password.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  createCipheriv, createDecipheriv, createHash, pbkdf2Sync, randomBytes,
  timingSafeEqual,
} from 'node:crypto';

const options = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i];
  const value = process.argv[i + 1];
  if (!['--windows', '--mac', '--out'].includes(key) || !value || value.startsWith('--')) {
    throw new Error('Use --windows <ZIP> --mac <ZIP> [--out <directory>].');
  }
  if (options[key]) throw new Error(`Duplicate option: ${key}`);
  options[key] = value;
}
if (!options['--windows'] || !options['--mac']) {
  throw new Error('Both original Windows and Mac ZIP paths are required.');
}
const password = process.env.DESTINY_DOWNLOAD_PASSWORD;
if (!password) throw new Error('Set DESTINY_DOWNLOAD_PASSWORD before running this script.');

const iterations = 100000;
const outputDir = path.resolve(options['--out'] || 'public/downloads/private');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

function encryptAndVerify(plain) {
  if (plain.length < 4 || plain.readUInt32LE(0) !== 0x04034b50) {
    throw new Error('Input must be an existing ZIP archive.');
  }
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const header = Buffer.from(JSON.stringify({
    v: 1, kdf: 'PBKDF2', hash: 'SHA-256', iterations,
    salt: salt.toString('base64'), iv: iv.toString('base64'),
  }), 'utf8');
  const prefix = Buffer.alloc(8);
  prefix.write('LWX1', 0, 'ascii');
  prefix.writeUInt32BE(header.length, 4);
  const aad = Buffer.concat([prefix, header]);
  const key = pbkdf2Sync(Buffer.from(password, 'utf8'), salt, iterations, 32, 'sha256');
  try {
    const cipher = createCipheriv('aes-256-gcm', key, iv, { authTagLength: 16 });
    cipher.setAAD(aad);
    const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
    const envelope = Buffer.concat([aad, encrypted, cipher.getAuthTag()]);

    // Parse the final bytes as a reader would; verify all plaintext byte-for-byte.
    const headerLength = envelope.readUInt32BE(4);
    const parsed = JSON.parse(envelope.subarray(8, 8 + headerLength).toString('utf8'));
    const readerKey = pbkdf2Sync(Buffer.from(password, 'utf8'),
      Buffer.from(parsed.salt, 'base64'), parsed.iterations, 32, 'sha256');
    try {
      const decipher = createDecipheriv('aes-256-gcm', readerKey,
        Buffer.from(parsed.iv, 'base64'), { authTagLength: 16 });
      decipher.setAAD(envelope.subarray(0, 8 + headerLength));
      decipher.setAuthTag(envelope.subarray(-16));
      const restored = Buffer.concat([
        decipher.update(envelope.subarray(8 + headerLength, -16)), decipher.final(),
      ]);
      if (restored.length !== plain.length || !timingSafeEqual(restored, plain)) {
        throw new Error('Encrypted ZIP verification failed.');
      }
      restored.fill(0);
    } finally { readerKey.fill(0); }
    return envelope;
  } finally { key.fill(0); }
}

const packages = [];
for (const edition of ['windows', 'mac']) {
  const source = path.resolve(options[`--${edition}`]);
  const sourceStat = await fs.stat(source);
  if (!sourceStat.isFile()) throw new Error(`${edition} input is not a regular file.`);
  const plain = await fs.readFile(source);
  try {
    packages.push({
      edition, bytes: plain.length, sourceSha256: hash(plain),
      encrypted: encryptAndVerify(plain), filename: `destiny-${edition}.enc`,
    });
  } finally { plain.fill(0); }
}
await fs.mkdir(outputDir, { recursive: true });
for (const item of packages) {
  await fs.writeFile(path.join(outputDir, item.filename), item.encrypted);
  const saved = await fs.readFile(path.join(outputDir, item.filename));
  if (!timingSafeEqual(saved, item.encrypted)) throw new Error('Saved package verification failed.');
  console.log(JSON.stringify({
    edition: item.edition, file: item.filename, plaintextBytes: item.bytes,
    encryptedBytes: saved.length, plaintextSha256: item.sourceSha256,
    encryptedSha256: hash(saved), verified: true,
  }));
}
