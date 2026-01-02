---
date: 2026-01-01
summary: Implemented category listing and archive pages with dynamic routing
tags: [feature, navigation, categories]
files_changed: [src/pages/categories.astro, src/pages/category/[slug].astro, src/layouts/BaseLayout.astro, src/pages/writing.astro]
---

## What we built

- Created category listing page at `/categories` showing all 11 categories with post counts
- Implemented dynamic category archive pages at `/category/{slug}` using Astro's `getStaticPaths()`
- Added "Categories" link to main header navigation in `BaseLayout.astro`
- Made category names clickable on Writing page, linking to respective archive pages
- Added `slugify()` helper function for URL-friendly category slugs
- Created `PROJECT_IDEAS.md` (git-ignored) to track potential enhancement projects

## Technical decisions

- **Dynamic route generation**: Used `getStaticPaths()` in `category/[slug].astro` to generate static pages for all categories at build time
- **Slugification approach**: Inline arrow function within `getStaticPaths()` to avoid scope issues with build-time execution
- **Category mapping**: Built categoryMap to track category names and associated posts, preserving original casing while using lowercase slugs for URLs
- **Grid layout**: 2-column grid on categories listing page for better visual organization
- **Sorting strategy**: Categories sorted by post count (descending), then alphabetically for consistent ordering
- **Navigation placement**: Added Categories between Writing and About in header for logical information architecture

## Issues encountered

- **Initial build error**: `slugify is not defined` - function was defined in frontmatter but not in scope during `getStaticPaths()` execution. Fixed by moving slugify logic inline within the function.
- No other issues: Build completed successfully on first attempt after fix

## Verification

- Production build successful (47 pages, up from 33)
- All 11 category pages generated correctly
- Category listing page shows accurate post counts
- Product Management category verified with all 9 posts displayed correctly
- Clickable category links working on Writing page
- "Categories" link added to main navigation
- All pages follow consistent Tailwind styling

## Build metrics

- Pages before: 33 (homepage, writing, about, 404, 31 posts)
- Pages after: 47 (added 1 category listing + 11 category archives + 2 dynamic routes)
- Build time: ~3.74s (minimal impact)
- Categories generated: 11 (Product Management, 3D Printing, Presentations, Projects, Tutorials, Startups, AI, Bikes, Cybersecurity, Student Loans, Life)

## Outcomes

- **Improved content discoverability**: Readers can now browse posts by topic instead of only chronological order
- **Better SEO**: Category pages provide additional entry points for search traffic
- **Enhanced navigation**: Three ways to find content (homepage highlights, chronological writing archive, topic-based categories)
- **Zero maintenance overhead**: Categories automatically generated from existing frontmatter, no manual curation needed
- **Scalable architecture**: Adding new categories requires no code changes, just adding category to post frontmatter
