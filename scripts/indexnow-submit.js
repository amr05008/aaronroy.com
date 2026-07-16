#!/usr/bin/env node
/**
 * Submit URLs to IndexNow (Bing, Yandex, Seznam, Naver; DuckDuckGo via Bing).
 *
 * Usage:
 *   node scripts/indexnow-submit.js                 # all URLs from the live sitemap
 *   node scripts/indexnow-submit.js /my-post/ ...   # specific URLs (paths or full URLs)
 *
 * The key file (public/<key>.txt) must already be deployed — this script
 * verifies it's live before submitting and exits nonzero if anything is off.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HOST = 'aaronroy.com';
const ORIGIN = `https://${HOST}`;

function findKey() {
  const publicDir = path.join(__dirname, '..', 'public');
  const keyFiles = fs
    .readdirSync(publicDir)
    .filter((f) => /^[0-9a-f]{32}\.txt$/.test(f));
  if (keyFiles.length !== 1) {
    throw new Error(
      `Expected exactly one IndexNow key file in public/, found ${keyFiles.length}`
    );
  }
  return keyFiles[0].replace(/\.txt$/, '');
}

async function fetchOk(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.text();
}

async function sitemapUrls() {
  const index = await fetchOk(`${ORIGIN}/sitemap-index.xml`);
  const sitemaps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const urls = [];
  for (const sm of sitemaps) {
    const xml = await fetchOk(sm);
    urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  }
  return urls;
}

async function main() {
  const key = findKey();

  // The key file must be live before any ping, or the submission is discarded.
  const liveKey = (await fetchOk(`${ORIGIN}/${key}.txt`)).trim();
  if (liveKey !== key) {
    throw new Error(`Live key file content mismatch: got "${liveKey}"`);
  }

  const args = process.argv.slice(2);
  const urlList = args.length
    ? args.map((u) => (u.startsWith('http') ? u : `${ORIGIN}${u}`))
    : await sitemapUrls();
  if (urlList.length === 0) throw new Error('No URLs to submit');

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key,
      keyLocation: `${ORIGIN}/${key}.txt`,
      urlList,
    }),
  });
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`IndexNow POST → ${res.status}: ${await res.text()}`);
  }
  console.log(`IndexNow: submitted ${urlList.length} URL(s) → ${res.status}`);
}

main().catch((err) => {
  console.error(`indexnow-submit failed: ${err.message}`);
  process.exit(1);
});
