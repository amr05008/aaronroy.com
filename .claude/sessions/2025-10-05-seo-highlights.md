---
date: 2025-10-05
summary: Replaced recent posts with highlights, added Yoast SEO descriptions
tags: [seo, homepage, content]
files_changed: [src/pages/index.astro, src/data/highlights.ts, scripts/update-yoast-descriptions.js, public/robots.txt]
---

## What we built

- Replaced "Recent Posts" with "Highlights" section on homepage
- Created `src/data/highlights.ts` for curated post selection
- Built `scripts/update-yoast-descriptions.js` to extract Yoast meta descriptions
- Updated all 29 blog posts with hand-crafted SEO descriptions from WordPress
- Added `public/robots.txt` with sitemap reference
- Fixed broken OG image references (made optional instead of 404)
- Updated homepage meta description from generic to specific
- Installed custom branded favicon (`public/favicon.svg`)

## Technical decisions

- **Highlights config file approach**: Chose centralized slug array over frontmatter flags for easier curation and explicit ordering
- **Yoast extraction**: Parsed WordPress XML postmeta to recover superior SEO descriptions that weren't captured in initial migration
- **Optional OG images**: Removed default image reference to avoid 404s; will add proper OG images in future design phase
- **Location update**: Changed from "Bay Area" to "Brooklyn" across site

## Issues encountered

- Initial migration used generic descriptions instead of Yoast meta descriptions
- Homepage had generic meta description ("Product manager, writer, and tech enthusiast")
- Missing robots.txt would have impacted crawlability
- Broken OG image reference would have caused validation warnings

## Outcomes

- All 29 posts now have optimized SEO descriptions (100% coverage)
- Homepage has specific, location-accurate meta description
- Site is crawler-ready with proper robots.txt
- Highlights feature allows dynamic content curation without code changes
- Custom favicon installed for brand consistency
- All SEO essentials in place for production deployment
