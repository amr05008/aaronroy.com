#!/usr/bin/env node
/**
 * Google Search Console indexing report for aaronroy.com.
 *
 * Why this exists: nothing watched GSC, so the 2026-08-08 audit — 11 real posts
 * sitting unindexed, some last crawled in February — needed a hand-exported CSV
 * to find. This sweeps every URL in the live sitemap through the URL Inspection
 * API and reports what isn't indexed and what has gone stale.
 *
 * Note there is NO API for the Index Coverage report; that one is export-only.
 * URL Inspection is the closest equivalent and is better for this purpose
 * anyway: it answers "which of MY pages are indexed" without the thousands of
 * legacy junk URLs Coverage lumps in.
 *
 * Usage:
 *   node scripts/gsc-index-report.mjs              # report to stdout
 *   node scripts/gsc-index-report.mjs --post       # also post to Discord
 *   node scripts/gsc-index-report.mjs --dry-run    # no API calls; validates setup
 *
 * Credentials (env, or ~/.config/aaronroy-indexing/env):
 *   GSC_SERVICE_ACCOUNT_JSON   full JSON key, or a path to the .json file
 *   DISCORD_CONTENT_STUDIO_WEBHOOK   only needed with --post
 *
 * Exits non-zero on any failure. A monitoring script that fails quietly is
 * worse than no monitoring script — it converts "broken" into "all clear".
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

const SITEMAP = 'https://aaronroy.com/sitemap-0.xml';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const STATE_FILE = path.join(os.homedir(), '.config', 'aaronroy-indexing', 'gsc-state.json');
const ENV_FILE = path.join(os.homedir(), '.config', 'aaronroy-indexing', 'env');

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has('--dry-run');
const POST = args.has('--post');

const die = (msg) => {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
};

/** Load ~/.config/aaronroy-indexing/env without clobbering real env vars. */
function loadEnvFile() {
  if (!fs.existsSync(ENV_FILE)) return;
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    const value = rest.join('=').trim();
    if (value && !process.env[key]) process.env[key] = value;
  }
}

function loadServiceAccount() {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    die(
      'GSC_SERVICE_ACCOUNT_JSON is not set.\n' +
        `  Add it to ${ENV_FILE} as either the JSON itself or a path to the .json key file.\n` +
        '  See the setup steps in CLAUDE.md ("GSC indexing report").'
    );
  }
  const text = raw.trim().startsWith('{') ? raw : fs.readFileSync(raw.trim(), 'utf8');
  let key;
  try {
    key = JSON.parse(text);
  } catch {
    die('GSC_SERVICE_ACCOUNT_JSON is neither valid JSON nor a readable path to a JSON key file');
  }
  for (const field of ['client_email', 'private_key']) {
    if (!key[field]) die(`service account key is missing "${field}"`);
  }
  return key;
}

const b64url = (input) =>
  Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** Mint an access token from the service account key (no googleapis dependency). */
async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: SCOPE,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  );
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(`${header}.${claim}`)
    .sign(key.private_key.replace(/\\n/g, '\n'), 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claim}.${signature}`,
    }),
  });
  const body = await response.json();
  if (!response.ok) {
    die(
      `token request failed (${response.status}): ${body.error_description || JSON.stringify(body)}\n` +
        '  Common cause: the Search Console API is not enabled on the Cloud project.'
    );
  }
  return body.access_token;
}

/**
 * Find the GSC property covering aaronroy.com. Auto-detected rather than
 * hardcoded because domain properties (sc-domain:aaronroy.com) and URL-prefix
 * properties (https://aaronroy.com/) need different strings, and guessing wrong
 * returns a 403 that reads like a permissions problem.
 */
async function resolveSiteUrl(token) {
  const response = await fetch('https://searchconsole.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json();
  if (!response.ok) die(`sites.list failed (${response.status}): ${JSON.stringify(body)}`);

  const entries = body.siteEntry ?? [];
  const match = entries.find(
    (e) => e.siteUrl === 'sc-domain:aaronroy.com' || e.siteUrl === 'https://aaronroy.com/'
  );
  if (!match) {
    die(
      'the service account can see no aaronroy.com property.\n' +
        `  Visible: ${entries.map((e) => e.siteUrl).join(', ') || '(none)'}\n` +
        '  Add the service-account email as a user on the property in Search Console.'
    );
  }
  return match.siteUrl;
}

async function fetchSitemapUrls() {
  const response = await fetch(SITEMAP);
  if (!response.ok) die(`could not fetch ${SITEMAP} (${response.status})`);
  const urls = [...(await response.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  if (urls.length === 0) die(`${SITEMAP} contained no <loc> entries`);
  return urls;
}

async function inspect(token, siteUrl, inspectionUrl) {
  const response = await fetch(
    'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inspectionUrl, siteUrl, languageCode: 'en-US' }),
    }
  );
  if (response.status === 429) return { url: inspectionUrl, error: 'rate limited' };
  const body = await response.json();
  if (!response.ok) {
    return { url: inspectionUrl, error: `${response.status} ${body.error?.message ?? ''}`.trim() };
  }
  const result = body.inspectionResult?.indexStatusResult ?? {};
  return {
    url: inspectionUrl,
    verdict: result.verdict ?? 'UNKNOWN',
    coverageState: result.coverageState ?? 'unknown',
    lastCrawlTime: result.lastCrawlTime ?? null,
    indexingState: result.indexingState ?? null,
  };
}

const readState = () => {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return null;
  }
};

function writeState(results) {
  const state = Object.fromEntries(results.map((r) => [r.url, r.coverageState ?? 'error']));
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function buildReport(results, previous) {
  const indexed = results.filter((r) => r.verdict === 'PASS');
  const errors = results.filter((r) => r.error);
  const notIndexed = results.filter((r) => !r.error && r.verdict !== 'PASS');

  const staleDays = 60;
  const cutoff = Date.now() - staleDays * 24 * 60 * 60 * 1000;
  const stale = results
    .filter((r) => r.lastCrawlTime && new Date(r.lastCrawlTime).valueOf() < cutoff)
    .sort((a, b) => new Date(a.lastCrawlTime) - new Date(b.lastCrawlTime));

  const lines = [
    `**aaronroy.com indexing** — ${indexed.length}/${results.length} indexed`,
    '',
  ];

  if (previous) {
    const changes = results
      .filter((r) => previous[r.url] && previous[r.url] !== r.coverageState)
      .map((r) => `  ${r.url.replace('https://aaronroy.com', '')}: ${previous[r.url]} → ${r.coverageState}`);
    const added = results.filter((r) => !(r.url in previous));
    if (changes.length) lines.push(`**Changed since last run (${changes.length})**`, ...changes, '');
    if (added.length) lines.push(`**New URLs (${added.length})**`, ...added.map((r) => `  ${r.url}`), '');
    if (!changes.length && !added.length) lines.push('_No change since last run._', '');
  } else {
    lines.push('_First run — no baseline to compare against yet._', '');
  }

  if (notIndexed.length) {
    lines.push(`**Not indexed (${notIndexed.length})**`);
    for (const r of notIndexed) {
      lines.push(`  ${r.url.replace('https://aaronroy.com', '')} — ${r.coverageState}`);
    }
    lines.push('');
  }
  if (stale.length) {
    lines.push(`**Not crawled in ${staleDays}+ days (${stale.length})**`);
    for (const r of stale.slice(0, 15)) {
      lines.push(`  ${r.url.replace('https://aaronroy.com', '')} — ${r.lastCrawlTime.slice(0, 10)}`);
    }
    if (stale.length > 15) lines.push(`  …and ${stale.length - 15} more`);
    lines.push('');
  }
  if (errors.length) {
    lines.push(`⚠️ **Inspection errors (${errors.length})**`);
    for (const r of errors.slice(0, 10)) lines.push(`  ${r.url} — ${r.error}`);
    lines.push('');
  }
  return { text: lines.join('\n').trim(), errorCount: errors.length };
}

async function postToDiscord(text) {
  const webhook = process.env.DISCORD_CONTENT_STUDIO_WEBHOOK;
  if (!webhook) die('--post given but DISCORD_CONTENT_STUDIO_WEBHOOK is not set');
  // Discord hard-caps messages at 2000 characters.
  const content = text.length > 1900 ? `${text.slice(0, 1900)}\n…(truncated)` : text;
  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) die(`Discord post failed (${response.status}): ${await response.text()}`);
}

async function main() {
  loadEnvFile();

  const urls = await fetchSitemapUrls();
  console.error(`sitemap: ${urls.length} URLs`);

  if (DRY_RUN) {
    loadServiceAccount();
    console.error('dry run: credentials parse, sitemap reachable. No API calls made.');
    return;
  }

  const token = await getAccessToken(loadServiceAccount());
  const siteUrl = await resolveSiteUrl(token);
  console.error(`property: ${siteUrl}`);

  // URL Inspection allows 600 queries/minute per site; small batches stay well
  // under it while keeping a 58-URL sweep to a few seconds.
  const results = [];
  for (let i = 0; i < urls.length; i += 5) {
    results.push(...(await Promise.all(urls.slice(i, i + 5).map((u) => inspect(token, siteUrl, u)))));
  }

  const { text, errorCount } = buildReport(results, readState());
  console.log(text);

  if (POST) await postToDiscord(text);

  // Only persist a baseline from a clean sweep, so a partial run can't make the
  // next one report bogus "recoveries".
  if (errorCount === 0) writeState(results);
  else die(`${errorCount} URL(s) failed inspection — state not updated`);
}

main().catch((error) => die(error.stack ?? String(error)));
