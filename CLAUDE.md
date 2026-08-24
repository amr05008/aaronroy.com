# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog for Aaron Michael Roy, built with Astro and migrated from WordPress. The site is a static blog with clean design, SEO optimization, and Markdown-based content management.

## Which Skill for What (content workflow)

The blog pipeline is split across three skills — each ends where the next begins:

| I want to… | Skill | Lives | Say |
|---|---|---|---|
| Decide what to write / plan promotion | `content-plan` | global (`~/.claude/skills/`) | "/content-plan", "what should I write this week?" |
| Get editorial feedback on a draft | `blog-review` | global (`~/.claude/skills/`) | "review my draft", "does this sound like me?" |
| Scaffold a new draft file, or take a finished draft live | `blog-publish` | this repo (`.claude/skills/`) | "new post about X", "publish this" |

`blog-publish` owns the mechanics (frontmatter, images, links, llms.txt, tests,
single publish commit + live verification) — design rationale in
`.claude/decisions/005-blog-publish-skill.md`. General git skills (`/ship` for
mid-session commits, `/wrap-up` for session closeout) apply here like any repo,
but don't use `/ship` for a post — `blog-publish` makes its own publish commit.

## Tech Stack

- **Astro 5.x** - Static site generator with TypeScript support
- **Tailwind CSS** - Utility-first styling with typography plugin
- **MDX** - Markdown with JSX capabilities for blog posts
- **Content Collections** - Type-safe content management via `src/content/config.ts`
- **Expressive Code** - Enhanced code blocks with syntax highlighting and copy buttons
- **marked** - Markdown to HTML parser for RSS feed content
- **@astrojs/rss** - RSS feed generation

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run smoke tests (builds first, then tests)
npm run test

# Run smoke tests only (skip build, faster)
npm run test:quick
```

## Testing

The site uses Playwright for smoke testing. Tests validate that the site builds correctly and all pages load without errors.

### What the Smoke Tests Cover

- All static pages load (/, /writing, /about, /404)
- All published blog posts return 200 status
- Homepage displays the latest N posts (capped at `LATEST_COUNT`)
- Writing archive contains all posts
- Navigation links work correctly
- Essential meta tags exist (title, description, canonical, OG)
- 404 page renders for non-existent routes
- RSS feed validity and post count
- RSS auto-discovery link in page head
- RSS links visible to users (footer and writing page)
- **Category links on blog posts** (display, navigation, URL slugification, styling)
- **Older/newer post navigation** (both columns, edge cases, valid links)
- **Sitemap `<lastmod>`**: every published post's `<lastmod>` matches its
  frontmatter, none is future-dated, and robots.txt's crawl-trap rules cover
  **every** user-agent group (not just `*`)
- **Crawler files**: robots.txt (sitemap pointer), sitemap validity, and every
  internal link in llms.txt resolving 200 with no redirect (llms.txt is
  hand-curated, so its links rot silently otherwise)
- **Email notify form** (renders on posts and `/about/` with the Buttondown
  action URL from config; absent on homepage/writing/categories) and the
  subscribe-flow landing pages (`/subscribed/`, `/confirmed/`: render, noindex,
  excluded from sitemap)
- **Category archive indexability** — thin archives are noindex and excluded
  from the sitemap; the kept set matches llms.txt; noindex never leaks onto the
  posts an archive lists (see *Category indexability* below)
- **Post header dek**: every published post renders its frontmatter `description` as a visible
  dek under the H1, and the dek precedes the date line
- **Related reading**: never the current post, never a draft, at most three; and every post that
  shares a category with another post has an inbound link from some other post.
  `tests/related.spec.ts` unit-tests the ranking rule itself on synthetic posts. It runs inside the
  normal Playwright suite, whose preview server needs a build to exist: `npm run test` on a fresh clone

### Category indexability

Only the categories in `INDEXABLE_CATEGORIES` (`src/utils/seo-categories.mjs`)
are indexable. The rest render normally and stay linked from `/categories/`, but
carry `noindex` and are excluded from the sitemap — the same both-places rule as
the subscribe-flow pages, since a noindex page listed in the sitemap sends
crawlers mixed signals.

**Why:** GSC reported "Crawled – currently not indexed" on thin archives
(2026-08-16). That status is Google's judgment, not a fault — an archive is a
list of titles whose content lives on the posts it links to. All 16 categories
sat in the sitemap, so the site kept requesting indexing that was never coming.

**The list mirrors the "Browse by topic" section of `public/llms.txt`**, which is
the curated source of truth for which topics are worth surfacing. **Change one,
change the other** — the `llms.txt only recommends categories we let Google
index` smoke test enforces it, because the older llms.txt link test only checks
those URLs resolve, and they still do when a page is noindex.

`noindex` alone, never `noindex, nofollow`: `follow` is the default, and links
to the real posts must still pass through.

### Running Tests

```bash
# Full test (recommended before deploy)
# Builds the site, starts preview server, runs all tests
npm run test

# Quick test (if you recently built)
# Skips build, just runs tests against existing build
npm run test:quick
```

### First-Time Setup

Playwright requires browser binaries. Install them once:

```bash
npx playwright install chromium
```

### Test Files

- `playwright.config.ts` - Playwright configuration
- `tests/smoke.spec.ts` - All smoke tests

### Adding New Blog Posts

Use the `blog-publish` skill to scaffold or publish posts — see "Which Skill
for What" at the top of this file.

No test updates needed. The test suite automatically:
- Reads blog posts from `src/content/blog/`
- Derives the homepage's latest-post count from the content directory

Just add your post and run `npm run test` to verify everything works.

## Architecture & Routing

### URL Structure
- Homepage: `/` (index.astro)
- Writing archive: `/writing` (writing.astro)
- Individual posts: `/{slug}` ([...slug].astro) - matches WordPress structure
- About page: `/about` (about.astro)
- Category listing: `/categories` (categories.astro)
- Category archives: `/category/{slug}` (category/[slug].astro) - dynamic routes for each category
- RSS feed: `/rss.xml` (rss.xml.ts) - Full-content RSS feed with HTML rendering

### Content Collections
Blog posts live in `src/content/blog/` as `.md` or `.mdx` files. Schema defined in `src/content/config.ts`:
- Required: `title`, `description` (non-empty: it renders as the visible dek under the H1), `pubDate`
- Optional: `updatedDate`, `categories`, `heroImage`, `draft`

Posts are rendered via the catch-all route `[...slug].astro` which uses the `BlogPost` layout.

### Video Storage

All videos are YouTube embeds (Aaron's channel: `@aaron_wa`) — no self-hosted
MP4s. See any existing post with a video for the iframe pattern (e.g.
`reflecting-on-cx-2025.md`). Self-hosted conventions from before 2026-07-23
are in git history if ever needed.

### Draft System

The blog supports a draft system for working on posts privately before publishing. Posts with `draft: true` in frontmatter are visible during development but excluded from production builds.

**Creating a draft:**
```markdown
---
title: "My Upcoming Post"
description: "Still working on this"
pubDate: 2026-01-03
categories: ["AI"]
draft: true
---

Work in progress content...
```

**Publishing a draft:**
Change `draft: true` to `draft: false` or remove the `draft` field entirely (defaults to `false`).

**Behavior by environment:**

| Environment | Draft Visibility | Routes | RSS Feed |
|------------|-----------------|--------|----------|
| Dev (`npm run dev`) | ✅ Visible everywhere except RSS | ✅ Accessible at `/{slug}` | ❌ Excluded |
| Production (`npm run build`) | ❌ Hidden everywhere | ❌ 404 if accessed | ❌ Excluded |
| Preview (`npm run preview`) | ❌ Hidden (simulates production) | ❌ 404 | ❌ Excluded |

**Implementation details:**
- Filtering logic centralized in `src/utils/posts.ts`
- All page queries use `getPublishedPosts()` helper
- RSS feed uses `getPostsForRSS()` to exclude drafts in all modes
- Smoke tests automatically detect and filter drafts
- Example draft available at `src/content/blog/example-draft-post.md`

### Layouts
- `BaseLayout.astro` - Base HTML structure, SEO meta tags, Open Graph, Twitter Cards
- `BlogPost.astro` - Blog post template with reading time calculation and JSON-LD structured data

### Components
- `PostNavigation.astro` - Older/newer post navigation rendered after each blog post article. Shows chronologically adjacent posts with title links and a "View Archive" link to `/writing`. Posts sorted ascending by date with secondary slug sort for deterministic ordering.
- `RelatedPosts.astro` - "Related reading" block after the email form: up to three other posts
  chosen at build time by `src/utils/related.ts` (see *Related reading* below).

### Related reading

`src/utils/related.ts` picks up to three posts for every post page, all at once at build
time. Slots 1 and 2 are pure relevance: shared categories, weighted so a rare category counts
more than a common one, newest first among equals. Slot 3 is the coverage slot: the topical
match that the fewest other pages link to. Nothing is padded in, so a post with one peer shows
one link and a post with no peers shows no section at all.

**Relevance beats coverage, deliberately** (Aaron, 2026-08-23). An earlier rule let coverage
win every tie and reached zero orphans, at the cost of a 2016 onboarding video outranking the
June 2026 agents post on the PM-hiring post. A post ends up unlinked only if nothing shares a
category with it (fix: a tag on the post, not a weaker rule) or, in theory, if four or more posts
all have the same hub as their only peer and lose the race for its one coverage slot (never seen
here; the smoke-test peer invariant fails loud if it happens).
Peerless today: `in-appreciation-of-the-internet` (the lone `Life` post).

### Homepage Features

The homepage (`src/pages/index.astro`) displays a "Latest" section: the most
recent published posts, newest first, capped at `LATEST_COUNT` (currently 7).
This is recency-driven (Simon-Willison-style) rather than hand-curated, so newly
published posts surface automatically with no manual upkeep.

To change how many posts appear, edit `LATEST_COUNT` in `src/config.ts` — the
homepage and the smoke tests both import it, so there's nothing to keep in sync.

(History: the homepage previously used a hand-curated `src/data/highlights.ts`
list. That was removed in favor of recency — see git history if you need it back.)

### Category Pages

The site includes a category browsing system with two page types:

**Category Listing (`/categories`):**
- Displays all categories with post counts
- Grid layout sorted by post count (descending), then alphabetically
- Each category links to its archive page

**Category Archives (`/category/{slug}`):**
- Dynamic routes generated at build time via `getStaticPaths()`
- Shows all posts within a category, sorted by date (newest first)
- Each category page includes:
  - Category name as heading
  - Post count
  - Full post listing with titles, dates, and descriptions
  - Back link to `/categories`

**Navigation:**
- "Categories" link added to main header navigation
- Category names on Writing page are clickable, linking to respective archive pages
- **Blog posts display all categories** as clickable links in the metadata line (after reading time)
  - All categories shown (not just first), comma-separated
  - Consistent styling with hover effects
  - Each category links to `/category/{slug}` archive page
- Categories use URL-friendly slugs (e.g., "Product Management" → `product-management`)
- Shared `slugify()` utility in `src/utils/posts.ts` ensures consistent URL generation

**Categories:**
Posts are tagged across categories such as Projects, Tutorials, Product,
3D Printing, Presentations, Startups, Agents, Bikes, Cybersecurity, Student
Loans, and Life. Run `node scripts/count-categories.js` for the current breakdown
and per-category post counts (counts drift as posts are added, so they're not
hardcoded here).

## WordPress Migration

The site was migrated from WordPress in 2025. The migration is complete; the
one-off tooling (`migrate-wordpress.js`, `update-yoast-descriptions.js` and
their deps: axios, jsdom, turndown, xml2js) was removed on 2026-07-02 and lives
in git history if ever needed again.

## Content Analysis

### Counting Categories

To analyze category usage across all blog posts:

```bash
node scripts/count-categories.js
```

This script provides a full breakdown of:
- All categories used in the blog
- Number of posts per category
- Complete list of post titles within each category
- Total count of unique categories and analyzed posts

Useful for content auditing, identifying popular topics, and planning future content strategy.

## Configuration

- **Site metadata**: Centralized in `src/config.ts` (site title, description, author info, social profiles)
- **Site URL**: Set in `astro.config.mjs` as `site: 'https://aaronroy.com'`
- **Code blocks**: Expressive Code integration with `github-dark` theme and copy button enabled
- **Integrations**: Expressive Code, MDX, Sitemap, Tailwind CSS

### Site Config (`src/config.ts`)

The `src/config.ts` file contains centralized site metadata used across all layouts and pages:

- `SITE`: Site title, description, URL, and a stable `WebSite` schema.org `id` (`https://aaronroy.com/#website`)
- `AUTHOR`: Author name, legal name (for copyright), email, location, and social profile URLs. Also carries the entity facts used to build `Person` structured data — a stable schema.org `id` (`https://aaronroy.com/#person`), `image` (headshot), `jobTitle`, `bio`, `affiliations` (becomes `worksFor`), `alumniOf`, and `knowsAbout` (topical-authority signals)

To update author information site-wide, edit `src/config.ts`. Changes automatically apply to:
- Page titles and meta descriptions
- Footer copyright notice
- JSON-LD structured data (author and publisher fields)
- Social profile links in structured data
- The `Person` / `ProfilePage` schema on `/about` (entity facts above)

## SEO Optimizations

The site includes comprehensive SEO features:

- **Meta descriptions**: All posts have handcrafted SEO descriptions
- **Canonical URLs**: Set on all pages to match WordPress URL structure (/{slug})
- **Open Graph tags**: Complete OG and Twitter Card metadata in BaseLayout
- **Structured data**: JSON-LD BlogPosting schema on all blog posts with enhanced author metadata
  - Includes author name, URL, and `sameAs` array linking to Twitter, LinkedIn, and GitHub profiles
  - Helps search engines understand author identity across platforms for rich results
  - The `/about` page emits `ProfilePage` → `Person` structured data (built from `AUTHOR` in `src/config.ts`) with a stable `@id`, making Aaron a machine-readable entity for the Knowledge Graph and AI answer engines
  - The homepage emits a `WebSite` node; the homepage publisher and every `BlogPosting` author/publisher reference the same Person `@id` (`#person`), so the whole site resolves to one author entity
- **Sitemap**: Auto-generated via @astrojs/sitemap. `astro.config.mjs` also emits **`<lastmod>`**,
  built from frontmatter (`updatedDate ?? pubDate`); listing and category pages take the newest date
  they contain; `/about/` is the one URL deliberately left without one. Dates are **never** `new
  Date()` — Google discounts `<lastmod>` site-wide when it's inaccurate, so an edited post only gets
  a fresh date by setting `updatedDate` (see the `blog-publish` checklist).
  The build **hard-fails** (exit 1) on a future date, a `categories:` key that parses to nothing, or
  any sitemap URL missing a `<lastmod>`. That last check lives in an `astro:build:done` hook, not in
  sitemap's `serialize()` — **@astrojs/sitemap swallows whatever `serialize` throws, writes no
  sitemap, and still exits 0**, so a guard placed there looks loud and isn't.
- **robots.txt**: Located in `public/robots.txt`. Allows all crawlers and explicitly welcomes AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc., including training) with a sitemap + `/llms.txt` reference.
  It also blocks a **legacy Elementor crawl trap** (`?lid=`, `*_page=`, `elementor_`): the WordPress-era
  widgets emitted pagination links that appended to the query string instead of replacing it, and Astro
  serves the homepage 200 for any query string, so those URLs still resolve. They were 139 of the 172
  "Crawled - currently not indexed" URLs and most of the ~2,225 "Alternate page with proper canonical"
  bucket in the 2026-08-08 GSC audit.
  Two non-obvious things, both load-bearing:
  1. **This can't be a redirect.** Vercel forwards query strings to redirect destinations, so a
     `source: "/"` + `has: lid` rule emits `Location: /?lid=...` for a request to `/?lid=...` — an
     infinite loop on the homepage. Legacy `routes` could express it but is mutually exclusive with
     `redirects`/`rewrites`/`headers`/`trailingSlash`.
  2. **The rules are duplicated into the AI-crawler group on purpose.** robots.txt is
     most-specific-user-agent-wins: a named `User-agent` group overrides the `*` group *entirely*
     rather than merging with it. The per-vendor blocks silently exempted Bingbot and every AI crawler
     until they were collapsed into one stanza. Splitting a vendor back out reopens the trap — a smoke
     test asserts per-group coverage, so don't "tidy" the duplication away.
- **llms.txt** (AEO): `public/llms.txt` is a hand-curated Markdown map for AI tools — identity statement + featured posts + topic links + projects. It is **static and manually maintained**, so update it when adding a notable evergreen post (this is the one place curation still lives, now that the homepage is recency-driven)
- **IndexNow (Bing-family indexing)**: `public/<32-hex-key>.txt` is the IndexNow key file (public by
  design — fine that it's committed). `node scripts/indexnow-submit.js [/slug/ ...]` submits URLs to
  api.indexnow.org (Bing, Yandex, Seznam, Naver; DuckDuckGo rides Bing); with no args it submits the
  whole live sitemap. The `blog-publish` skill pings it after live-verification — no CI job, on purpose.
  Getting *into* Bing's index in the first place was done via Bing Webmaster Tools "Import from GSC"
  (Aaron's dashboard, 2026-07-16); IndexNow only accelerates discovery of new/changed URLs
- **GSC indexing report**: `node scripts/gsc-index-report.mjs [--post] [--dry-run]` sweeps every URL
  in the live sitemap through the Search Console **URL Inspection API** and reports what isn't
  indexed, what hasn't been crawled in 60+ days, and what changed since the last run (state in
  `~/.config/aaronroy-indexing/gsc-state.json`). `--post` sends it to #content-studio.
  ⚠️ **There is no API for the Index Coverage report** — that one is export-only, which is why the
  2026-08-08 audit needed a hand-exported CSV. URL Inspection is the closest equivalent and is
  actually better here: it covers *our* 58 URLs rather than the thousands of legacy junk URLs
  Coverage lumps in. Quota is 2,000/day, 600/min per property, so a full sweep is cheap.
  Auth is a GCP **service account** (no `googleapis` dep — the RS256 JWT is signed with
  `node:crypto`), configured via `GSC_SERVICE_ACCOUNT_JSON` in `~/.config/aaronroy-indexing/env`
  (either the JSON itself or a path to the key file). Setup: create a Cloud project → enable the
  Search Console API → create a service account + JSON key → in Search Console, add the
  service-account email as a user on the property. The property string is auto-detected, since
  domain (`sc-domain:`) and URL-prefix properties need different values and guessing returns a 403
  that reads like a permissions error.
- **Legacy WordPress paths**: `/feed` and `/feed/` 301 to `/rss.xml` (vercel.json `redirects`). Other
  WP-era paths (`/tag/*`, `?p=<id>`) were left alone pending real 404 evidence from GSC/Bing WMT
- **Homepage meta**: Custom description set in index.astro (not using generic fallback)
- **RSS feed**: Full-content RSS feed at `/rss.xml`
  - Markdown converted to HTML using `marked` library
  - Absolute image URLs for proper display in feed readers
  - Auto-discovery link in `<head>` tag on all pages
  - User-facing links on Writing page and footer
  - Author metadata included in feed items

### SEO Notes

- **Favicon**: `public/zuko_favicon.png` (128px PNG, linked in `BaseLayout.astro`)
- **OG Images**: Default fallback image at `public/images/og-default.png` used for all social sharing (LinkedIn, Facebook, Twitter)
  - Individual posts can override with custom images via `heroImage` frontmatter field
  - Custom images should be 1200×630px and stored in `public/og-images/` or `public/images/`
  - Example: `heroImage: "/og-images/my-custom-image.png"`
- **Author metadata**: Centralized in `src/config.ts` with social profile links included in structured data for enhanced rich results

## Deployment

Optimized for Vercel:
- Build command: `npm run build`
- Output directory: `dist`
- Astro auto-detected by Vercel

SSL and DNS configured for custom domain (aaronroy.com).

Blog content (new posts, edits) is committed directly to `main` — Vercel
auto-deploys on every push, so no branch or PR is needed to publish. "Going live"
means pushing to `main`.

## Email Notifications (Buttondown)

A quiet email-capture form (`src/components/EmailNotify.astro`) renders at the
bottom of every blog post (in `BlogPost.astro`, after the article, before
`PostNavigation`) and on `/about/` inside the "Get in touch" section — **those
two placements only** (no homepage, archives, footer, or popups). It is a
*notification layer, not a newsletter*: copy promises "an email when I post
something new," button says "Notify me" (never "Subscribe").

- **Provider:** Buttondown, username `aaronroy` (in `src/config.ts` as
  `BUTTONDOWN_USERNAME` — the component and smoke tests both build the form
  action from it). Native form POST to
  `https://buttondown.com/api/emails/embed-subscribe/aaronroy` — use the
  `.com` endpoint (legacy `.email` 301s, which downgrades the POST). No widget
  JS. A brief Cloudflare bot-check flash on submit is Buttondown-side and
  expected.
- **Flow:** submit → Buttondown → redirect back to `/subscribed/` ("check your
  email"); after the double-opt-in confirmation link → `/confirmed/`. Both
  landing pages are noindex, sitemap-excluded (filter in `astro.config.mjs`),
  and unlinked. The redirect URLs are configured in Buttondown → Settings →
  Subscribing → Redirects. Double opt-in is Buttondown's default (no toggle).
- **Plan/sending:** Free plan — **no RSS-to-email; sends are manual** (short
  title+link email in Buttondown per post; the `blog-publish` skill's
  post-publish checklist carries the reminder). Revisit paid automation at
  ~100 subscribers, which is also the Free plan's sending cap.
- **Measurement:** submit fires PostHog `email_notify_submitted` via
  `sendBeacon` (survives the navigation; default batching would lose it). The
  form never depends on PostHog being present. Buttondown's dashboard is the
  source of truth for confirmed subscribers — submit counts include bots.

## Analytics

Two layers, both privacy-conscious:

- **Vercel Analytics** (`@vercel/analytics`, in `BaseLayout.astro`) — left as-is.
- **PostHog** (`src/components/PostHogAnalytics.astro`) — the **queryable** layer that feeds the
  `content-studio` `/content-plan` loop: referral sources (did a thread drive reads?), per-post
  traffic, time-on-page, and link clicks.

**Privacy posture:** anonymous (`person_profiles: 'identified_only'` — no profiles for readers),
**no** session recording, honors **Do Not Track** (`respect_dnt`). Captures pageviews (carrying
`$referrer`/UTM), page-leave (time-on-page), and autocaptured clicks (incl. outbound "give" links).

**Wiring:** build-time env vars. The component **emits nothing when `PUBLIC_POSTHOG_KEY` is unset**,
so it's safe to deploy before the PostHog project exists.
- `PUBLIC_POSTHOG_KEY` — project public key (`phc_…`). Set in Vercel (Production + Preview) and local `.env`.
- `PUBLIC_POSTHOG_HOST` — optional; defaults to the same-origin **reverse-proxy path `/zuko`**.

**Reverse proxy (adblock resistance):** `vercel.json` rewrites `/zuko/*` → PostHog, so the browser
only ever talks to `aaronroy.com` — adblockers that filter by third-party domain can't drop it. The
SDK's `api_host` is `/zuko`; `ui_host` stays `https://us.posthog.com` so the toolbar/links resolve.
The non-obvious path name is deliberate (PostHog docs: blockers catch `/ingest`, `/analytics`, etc.).

⚠️ **`trailingSlash: 'always'` (needed for blog SEO) conflicts with a wildcard proxy.** A
`/zuko/:path*` catch-all does NOT match trailing-slash paths — and posthog-js, when given a custom
`api_host`, POSTs captures to `/zuko/e/` (legacy endpoint, with trailing slash). That 404'd silently
and pageviews stopped landing. **Fix:** explicit *literal* rewrites for each trailing-slash endpoint
(`/zuko/e/`, `/zuko/i/v0/e/`, `/zuko/flags/`, `/zuko/decide/`) — literal sources match where `:path*`
doesn't. The `/static` + `/array` wildcards (no trailing slash, `.js`) → `us-assets.i.posthog.com`;
the literal endpoints + final `/zuko/:path*` catch-all → `us.i.posthog.com`. Verified 2026-06-30:
a real pageview POSTs to `/zuko/e/` → 200 → lands in the project. **If you add an endpoint, add its
literal rewrite** or it'll silently 404.

See `.env.example`. **Verify after deploy:** load the site and confirm network requests go to
`aaronroy.com/zuko/*` (not `*.posthog.com`) and return 200; then check the PostHog project's events
(or query via the PostHog MCP).

**Querying via the PostHog MCP:** the aaronroy.com project is **id `491375`** (token `phc_xw9…`).
⚠️ The MCP defaults to the *GlutenOrNot* project (`457245`) — always `switch-project` to `491375`
first, or every query silently targets the wrong site. Pageviews carry `$pathname`,
`$referring_domain`, and `$referrer`; outbound clicks land on `$autocapture` under
`$external_click_url`. Bot/automation is classified at query time via `$virt_is_bot` /
`$virt_traffic_type` (UA-based, so only catches JS-executing crawlers).

**Dashboard:** [Blog Analytics — Traffic & Sources](https://us.posthog.com/project/491375/dashboard/1782625)
(pinned) — traffic tiles (total pageviews, pageviews over time, pageviews by post/page, referring
sources, outbound link clicks — all last-30-days) plus email-capture tiles added 2026-07-24 ("Email
signups": submits → /subscribed/ → /confirmed/ flow; "Email submits by post": `email_notify_submitted`
by `$pathname`) and engagement tiles added 2026-07-23: read-through
by post (scroll depth + median read time from `$pageleave`), weekly bounce rate & pages/session (from
the `sessions` table), sessions by channel with a dedicated "AI assistant" referrer bucket, and weekly
new-vs-returning visitors (SQL on `person_id` — PostHog's lifecycle insight can't be used because
`person_profiles: 'identified_only'` means anonymous readers have no person profiles). The pageview
tiles exclude UA-detected bots **and** legacy `/hynews/*` WordPress paths (old-URL scanners that
present as a real browser, so the bot filter alone misses them). Filters are scoped per-insight, not
project-wide. Note: AI *crawlers* (GPTBot etc.) never execute JS, so PostHog structurally can't see
them — use GSC/Bing WMT for that question.

## Recent Changes

- **2026-08-23**: Post page: frontmatter `description` rendered as a dek under the H1; "Related
  reading" block (`RelatedPosts.astro` + `src/utils/related.ts`, relevance-first with one coverage
  slot); 4 ranking unit tests + 6 new smoke tests
- **2026-08-08**: GSC Coverage audit — blocked the legacy Elementor crawl trap in robots.txt (and
  collapsed the per-vendor AI-crawler blocks into one stanza, which had been silently exempting
  Bingbot); added sitemap `<lastmod>` with build-time invariants that hard-fail on future dates,
  unparsed categories, or missing dates; 3 new smoke tests; fixed `blog-review`'s stale category list
  ("AI"/"Product Management" never existed, which is where the dead `/category/ai/` came from)
- **2026-07-24**: Email form added to `/about/` "Get in touch" (spec amended by Aaron — high-intent visitors); PostHog dashboard gains email signup-flow + submits-by-post tiles; dependency vulnerability cleanup (all non-Astro-7 fixes; 4 alerts remain, gated on the deferred Astro 7 major)
- **2026-07-23**: Email notification layer — Buttondown capture form at the bottom of posts (`EmailNotify.astro`), `/subscribed/` + `/confirmed/` redirect landing pages (noindex), PostHog submit event via sendBeacon, 5 new smoke tests; manual-send step added to `blog-publish`
- **2026-07-22**: Mobile typography — blog H1 steps down on small screens (`text-3xl sm:text-4xl md:text-5xl`); markdown image captions (`![...]` then `*caption*`) auto-styled via `.prose img + em` in `src/styles/global.css`
- **2026-07-16**: Bing/IndexNow indexing fix — IndexNow key file + `scripts/indexnow-submit.js`, publish-time ping in `blog-publish` skill, `/feed/`→`/rss.xml` 301
- **2026-07-06**: Added repo-local `blog-publish` skill (scaffold → checklist → gated one-commit publish; see `.claude/decisions/005-blog-publish-skill.md`); deleted legacy `wrap-session` skill (superseded by global `wrap-up`)
- **2026-07-02**: Repo cleanup — landed trailing-slash internal links (kills sitewide 301s), fixed nested anchor on /writing, security headers in vercel.json, favicon 547KB→31KB, fixed llms.txt category links, removed migration scripts + 5 unused deps, `LATEST_COUNT` moved to `src/config.ts`
- **2026-06-30**: Built the PostHog "Blog Analytics — Traffic & Sources" dashboard (pageviews per post, referring sources, outbound clicks) with bot + `/hynews/` legacy-path filters
- **2026-02-03**: Older/newer post navigation at bottom of blog posts with smoke tests
- **2026-01-10**: Blog posts display clickable category links in metadata; added smoke tests for category functionality
- **2026-01-02**: RSS feed implementation with full HTML content and absolute image URLs
- **2026-01-02**: Abstracted session management to global `~/.claude/rules/session-management.md`
- **2026-01-02**: Restructured session history to `.claude/` directory
- **2026-01-02**: Code block copy buttons via Expressive Code
- **2026-01-01**: Category archive pages (`/categories`, `/category/{slug}`)
- **2025-10-10**: Centralized config (`src/config.ts`), OG image system
- **2025-10-06**: Production deployment, domain migration with 301 redirects

## Session Management

@~/.claude/rules/session-management.md
