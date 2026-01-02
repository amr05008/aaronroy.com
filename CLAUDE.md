# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog for Aaron Michael Roy, built with Astro and migrated from WordPress. The site is a static blog with clean design, SEO optimization, and Markdown-based content management.

## Tech Stack

- **Astro 5.x** - Static site generator with TypeScript support
- **Tailwind CSS** - Utility-first styling with typography plugin
- **MDX** - Markdown with JSX capabilities for blog posts
- **Content Collections** - Type-safe content management via `src/content/config.ts`
- **Expressive Code** - Enhanced code blocks with syntax highlighting and copy buttons

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
- All 31 blog posts return 200 status
- Homepage displays the correct number of highlights
- Writing archive contains all posts
- Navigation links work correctly
- Essential meta tags exist (title, description, canonical, OG)
- 404 page renders for non-existent routes

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

No test updates needed. The test suite automatically:
- Reads blog posts from `src/content/blog/`
- Imports highlights from `src/data/highlights.ts`

Just add your post and run `npm run test` to verify everything works.

## Architecture & Routing

### URL Structure
- Homepage: `/` (index.astro)
- Writing archive: `/writing` (writing.astro)
- Individual posts: `/{slug}` ([...slug].astro) - matches WordPress structure
- About page: `/about` (about.astro)
- Category listing: `/categories` (categories.astro)
- Category archives: `/category/{slug}` (category/[slug].astro) - dynamic routes for each category

### Content Collections
Blog posts live in `src/content/blog/` as `.md` or `.mdx` files. Schema defined in `src/content/config.ts`:
- Required: `title`, `description`, `pubDate`
- Optional: `updatedDate`, `categories`, `heroImage`

Posts are rendered via the catch-all route `[...slug].astro` which uses the `BlogPost` layout.

### Layouts
- `BaseLayout.astro` - Base HTML structure, SEO meta tags, Open Graph, Twitter Cards
- `BlogPost.astro` - Blog post template with reading time calculation and JSON-LD structured data

### Homepage Features

The homepage (`src/pages/index.astro`) displays a curated "Highlights" section instead of recent posts. To manage which posts appear:

1. Edit `src/data/highlights.ts`
2. Update the array of post slugs in desired display order
3. Changes hot-reload automatically in dev mode

This approach provides explicit control over featured content without requiring redeployment-heavy frontmatter flags.

### Category Pages

The site includes a category browsing system with two page types:

**Category Listing (`/categories`):**
- Displays all 11 categories with post counts
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
- Categories use URL-friendly slugs (e.g., "Product Management" → `product-management`)

**Current Categories (11 total):**
- Product Management (9 posts)
- 3D Printing (7 posts)
- Presentations (6 posts)
- Projects (6 posts)
- Tutorials (5 posts)
- Startups (4 posts)
- AI (3 posts)
- Bikes (2 posts)
- Cybersecurity (2 posts)
- Student Loans (2 posts)
- Life (1 post)

## WordPress Migration

The site was migrated from WordPress using `scripts/migrate-wordpress.js`. To migrate content:

```bash
node scripts/migrate-wordpress.js /path/to/wordpress-export.xml
```

The script:
- Parses WordPress XML exports
- Converts HTML to Markdown using Turndown
- Downloads images to `public/images/` with slug-based naming
- Creates frontmatter with title, description, pubDate, categories
- Preserves URL slugs for SEO continuity

Post-migration: Review generated markdown in `src/content/blog/`, verify images in `public/images/`, and test URL mappings.

### Updating Yoast SEO Descriptions

To update blog post descriptions with Yoast SEO meta descriptions from WordPress XML:

```bash
node scripts/update-yoast-descriptions.js /path/to/wordpress-export.xml
```

This script extracts `_yoast_wpseo_metadesc` values from WordPress postmeta and updates the `description` field in blog post frontmatter. Hand-crafted Yoast descriptions are more SEO-optimized than auto-generated excerpts.

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

- `SITE`: Site title, description, and URL
- `AUTHOR`: Author name, legal name (for copyright), email, location, and social profile URLs

To update author information site-wide, edit `src/config.ts`. Changes automatically apply to:
- Page titles and meta descriptions
- Footer copyright notice
- JSON-LD structured data (author and publisher fields)
- Social profile links in structured data

## SEO Optimizations

The site includes comprehensive SEO features:

- **Meta descriptions**: All 29 posts have handcrafted SEO descriptions
- **Canonical URLs**: Set on all pages to match WordPress URL structure (/{slug})
- **Open Graph tags**: Complete OG and Twitter Card metadata in BaseLayout
- **Structured data**: JSON-LD BlogPosting schema on all blog posts with enhanced author metadata
  - Includes author name, URL, and `sameAs` array linking to Twitter, LinkedIn, and GitHub profiles
  - Helps search engines understand author identity across platforms for rich results
- **Sitemap**: Auto-generated via @astrojs/sitemap integration
- **robots.txt**: Located in `public/robots.txt` with sitemap reference
- **Homepage meta**: Custom description set in index.astro (not using generic fallback)

### SEO Notes

- **Favicon**: Custom branded favicon installed in `public/favicon.svg`
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

## Recent Changes

- **2026-01-02**: Abstracted session management to global `~/.claude/rules/session-management.md`
- **2026-01-02**: Restructured session history to `.claude/` directory
- **2026-01-02**: Code block copy buttons via Expressive Code
- **2026-01-01**: Category archive pages (`/categories`, `/category/{slug}`)
- **2025-10-10**: Centralized config (`src/config.ts`), OG image system
- **2025-10-06**: Production deployment, domain migration with 301 redirects

## Session Management

@~/.claude/rules/session-management.md
