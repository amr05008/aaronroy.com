// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import expressiveCode from 'astro-expressive-code';

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
 * which isn't available inside astro.config.mjs. Only the three fields below are
 * read, so the parsing stays trivial.
 */
function readBlogDates() {
  const posts = [];
  for (const file of fs.readdirSync(BLOG_DIR)) {
    if (!/\.mdx?$/.test(file)) continue;
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
    const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) continue;
    const body = fm[1];
    const field = (name) => body.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1].trim();

    if (/^draft:\s*true\s*$/m.test(body)) continue; // drafts aren't in the sitemap

    const pubDate = field('pubDate');
    if (!pubDate) continue;
    const stamp = field('updatedDate') || pubDate;
    const date = new Date(stamp.replace(/^["']|["']$/g, ''));
    if (Number.isNaN(date.valueOf())) continue;

    // Astro derives a post's slug from its filename, lowercased.
    const slug = file.replace(/\.mdx?$/, '').toLowerCase();
    const categories = (field('categories') || '')
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((c) => c.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);

    posts.push({ slug, date, categories });
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

  // Mirrors slugify() in src/utils/posts.ts — keep the two in step.
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
      // Subscribe-flow landing pages are noindex; listing them in the sitemap
      // would send crawlers mixed signals.
      filter: (page) => ![`${SITE}/subscribed/`, `${SITE}/confirmed/`].includes(page),
      // Attach <lastmod> where we have an honest date for it (see buildLastmodMap).
      serialize: (item) => {
        const lastmod = LASTMOD[item.url];
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
    tailwind(),
  ],
});