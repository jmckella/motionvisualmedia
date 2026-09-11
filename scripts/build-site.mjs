import { readdir, readFile, writeFile, mkdir, rm, copyFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const out = new URL('../dist/', import.meta.url);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const rootTypes = new Set(['.html', '.css', '.js', '.ico', '.webmanifest', '.pdf']);
const assetTypes = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg', '.ico', '.mp4', '.webm', '.mp3', '.woff', '.woff2', '.pdf']);
const hashes = new Set();
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (!entry.isFile() || !(rootTypes.has(extname(entry.name)) || ['robots.txt', 'sitemap.xml'].includes(entry.name))) continue;
  await copyFile(new URL(entry.name, root), new URL(entry.name, out));
  if (entry.name.endsWith('.html')) {
    const html = await readFile(new URL(entry.name, root), 'utf8');
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (!/\bsrc\s*=/i.test(match[1])) hashes.add(`'sha256-${createHash('sha256').update(match[2]).digest('base64')}'`);
    }
  }
}
async function copyAssets(relative = 'assets') {
  await mkdir(new URL(relative + '/', out), { recursive: true });
  for (const entry of await readdir(new URL(relative + '/', root), { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const path = join(relative, entry.name);
    if (entry.isDirectory()) await copyAssets(path);
    else if (entry.isFile() && assetTypes.has(extname(entry.name).toLowerCase())) await copyFile(new URL(path, root), new URL(path, out));
  }
}
await copyAssets();
const csp = [
  "default-src 'self'", `script-src 'self' ${[...hashes].join(' ')}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com", "img-src 'self' data:",
  "frame-src https://customer-93fnujwdh6707s9m.cloudflarestream.com",
  "media-src 'self'", "connect-src 'self'", "object-src 'none'",
  "base-uri 'none'", "form-action 'self'", "frame-ancestors 'none'", 'upgrade-insecure-requests'
].join('; ');
await writeFile(new URL('_headers', out), `/*\n  Content-Security-Policy: ${csp}\n  X-Frame-Options: DENY\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`);
console.log(`Built public site with ${hashes.size} approved inline script hashes; internal notes and build tools excluded.`);
