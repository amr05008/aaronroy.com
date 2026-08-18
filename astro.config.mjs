// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import expressiveCode from 'astro-expressive-code';
import { isThinCategory } from './src/utils/seo-categories.mjs';

const SITE = 'https://aaronroy.com';
const BLOG_DIR = fileURLToPath(new URL('./src/content/blog', import.meta.url));

/**
 * Read blog frontmatter at config time to build the sitemap's <lastmod> dates.
 *
 * Why this exists: without <lastmod>, Google has no signal that a URL changed
 * and no reason to re-crawl it. The 2026-08-08 GSC audit found every unindexed
 * post stuck on a pre-July crawl date, so the July SEO fixes were invisible to
 * Google on exactly the pages that needed them.
 *
 * Dates come from real frontmatter (`updatedDate ?? pubDate`) — never `new Date()`.
 * A sitemap that claims everything changed today is inaccurate, and Google
 * discounts <lastmod> wholesale on sites that do it.
 *
 * This parses frontmatter by hand rather than using the content collection API,
 * which isn't available inside astro.config.mjs. Only the four fields below are
 * read, so the parsing stays small — but every one of them throws rather than
 * degrading. A partial lastmod map is worse than no build: it ships a sitemap
 * that looks complete and silently misinforms Google. All three failure modes
 * guarded here were live bugs found by grilling the first version of this file.
 */

/** Fail the build loudly — a silent SEO regression is invisible for months. */
function fail(file, message) {
  throw new Error(`[sitemap lastmod] ${file}: ${message}`);
}

const unquote = (s) => s.trim().replace(/^["']|["']$/g, '').trim();

/**
 * Approximates Astro's content-collection slug (github-slugger): lowercase,
 * whitespace/underscores to hyphens, drop the rest. This is deliberately an
 * approximation — the coverage assertion in serialize() is the real guarantee.
 * If Astro's slugging ever diverges from this, the build fails with the exact
 * URL rather than quietly omitting a <lastmod>.
 */
const slugifyFilename = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-');

/**
 * Categories accept both YAML forms, because both are valid and both pass the
 * Zod schema: inline (`categories: ["A", "B"]`) and block list (`- A` lines).
 * Returns null when the key is absent, so the caller can tell "no categories"
 * apart from "categories present but unparsed" — the latter is a bug, not data.
 */
function parseCategories(body) {
  if (!/^categories:/m.test(body)) return null;

  const inline = body.match(/^categories:[ \t]*\[([^\]]*)\][ \t]*$/m);
  if (inline) return inline[1].split(',').map(unquote).filter(Boolean);

  const block = body.match(/^categories:[ \t]*\r?\n((?:[ \t]*-[ \t]*\S.*\r?\n?)+)/m);
  if (block) {
    return block[1]
      .split(/\r?\n/)
      .map((line) => unquote(line.replace(/^[ \t]*-[ \t]*/, '')))
      .filter(Boolean);
  }
  return [];
}

function readBlogDates() {
  const posts = [];
  const now = Date.now();

  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!/\.mdx?$/.test(file)) continue;
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) fail(file, 'no frontmatter block found');
    const body = fm[1];
    const field = (name) => body.match(new RegExp(`^${name}:[ \\t]*(.+)$`, 'm'))?.[1].trim();

    if (/^draft:[ \t]*true[ \t]*$/m.test(body)) continue; // drafts aren't in the sitemap

    const pubDate = field('pubDate');
    if (!pubDate) fail(file, 'published post has no pubDate');

    const stamp = unquote(field('updatedDate') || pubDate);
    const date = new Date(stamp);
    if (Number.isNaN(date.valueOf())) fail(file, `unparseable date "${stamp}"`);

    // A future lastmod is worse than none: Google discounts it, and via the
    // listing pages one typo'd year poisons the homepage too.
    if (date.valueOf() > now) {
      fail(file, `date "${stamp}" is in the future — a future <lastmod> is discounted by Google`);
    }

    const categories = parseCategories(body);
    if (categories !== null && categories.length === 0) {
      fail(file, 'has a `categories:` key that parsed to nothing — check the YAML form');
    }

    posts.push({ slug: slugifyFilename(file.replace(/\.mdx?$/, '')), date, categories: categories ?? [] });
  }
  return posts;
}

/**
 * Map every sitemap URL to an accurate lastmod.
 *
 * Posts get their own date. Listing pages (home, /writing/, /categories/) get the
 * newest post date, and each /category/<slug>/ gets the newest date within that
 * category — those pages genuinely do change when a post is added. Pages with no
 * honest date (/about/) are left without a lastmod rather than given a fake one.
 */
function buildLastmodMap() {
  const posts = readBlogDates();
  if (posts.length === 0) return {};

  const newest = (list) => new Date(Math.max(...list.map((p) => p.date.valueOf())));
  /** @type {Record<string, Date>} */
  const map = {};

  for (const post of posts) map[`${SITE}/${post.slug}/`] = post.date;

  const newestOverall = newest(posts);
  map[`${SITE}/`] = newestOverall;
  map[`${SITE}/writing/`] = newestOverall;
  map[`${SITE}/categories/`] = newestOverall;

  // Mirrors slugify() in src/utils/posts.ts. Nothing can import that TS module
  // here, so drift is caught instead of prevented: if these disagree, a
  // /category/<slug>/ page comes out with no lastmod and serialize() throws.
  const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-');
  /** @type {Record<string, typeof posts>} */
  const byCategory = {};
  for (const post of posts) {
    for (const category of post.categories) {
      (byCategory[slugify(category)] ||= []).push(post);
    }
  }
  for (const [slug, list] of Object.entries(byCategory)) {
    map[`${SITE}/category/${slug}/`] = newest(list);
  }

  return map;
}

const LASTMOD = buildLastmodMap();

/**
 * The only URLs allowed into the sitemap without a <lastmod>. Everything else
 * must resolve to a real date, so a slug-derivation drift fails the build
 * instead of silently shipping a post with no freshness signal.
 */
const LASTMOD_EXEMPT = new Set([`${SITE}/about/`]);

/**
 * Verify the emitted sitemap after the build, and fail if it's wrong.
 *
 * This lives in `astro:build:done` rather than in sitemap's `serialize()` for a
 * measured reason: @astrojs/sitemap catches whatever serialize throws, logs it,
 * writes NO sitemap, and still exits 0 — so the guard that looks like it fails
 * loud actually ships a site with no sitemap at all. Throwing from this hook
 * exits non-zero and stops the deploy.
 */
function assertSitemapLastmod() {
  return {
    name: 'assert-sitemap-lastmod',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const dirPath = fileURLToPath(dir);
        const files = fs.readdirSync(dirPath).filter((f) => /^sitemap-\d+\.xml$/.test(f));
        if (files.length === 0) throw new Error('[sitemap lastmod] no sitemap-N.xml was emitted');

        const missing = [];
        let checked = 0;
        for (const file of files) {
          const xml = fs.readFileSync(path.join(dirPath, file), 'utf8');
          for (const block of xml.match(/<url>[\s\S]*?<\/url>/g) ?? []) {
            const url = block.match(/<loc>(.*?)<\/loc>/)?.[1];
            if (!url) continue;
            checked++;
            if (!/<lastmod>/.test(block) && !LASTMOD_EXEMPT.has(url)) missing.push(url);
          }
        }
        if (missing.length > 0) {
          throw new Error(
            `[sitemap lastmod] ${missing.length} URL(s) emitted with no <lastmod>:\n` +
              missing.map((u) => `  - ${u}`).join('\n') +
              `\nThe slug or category slugify in astro.config.mjs has drifted from Astro's.`
          );
        }
        logger.info(`lastmod verified on ${checked - LASTMOD_EXEMPT.size} of ${checked} sitemap URLs`);
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://aaronroy.com',
  trailingSlash: 'always',
  integrations: [
    expressiveCode({
      themes: ['github-dark'],
      styleOverrides: {
        borderRadius: '0.5rem',
        borderColor: 'transparent',
      },
      frames: {
        showLanguage: true,
      },
    }),
    mdx(),
    sitemap({
      // Anything noindex must also stay out of the sitemap, or crawlers get
      // mixed signals: subscribe-flow landing pages, and the thin category
      // archives Google already declines to index (see src/utils/seo-categories.mjs).
      filter: (page) => {
        if ([`${SITE}/subscribed/`, `${SITE}/confirmed/`].includes(page)) return false;
        const category = page.match(/^https:\/\/aaronroy\.com\/category\/([^/]+)\/$/);
        return !category || !isThinCategory(category[1]);
      },
      // Attach <lastmod> where we have an honest date for it (see buildLastmodMap).
      // Coverage is enforced afterwards by assertSitemapLastmod() — throwing from
      // here would be swallowed by the integration and exit 0.
      serialize: (item) => {
        const lastmod = LASTMOD[item.url];
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
    tailwind(),
    assertSitemapLastmod(),
  ],
});