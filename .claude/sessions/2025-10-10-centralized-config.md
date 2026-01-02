---
date: 2025-10-10
summary: Created centralized site config, enhanced author metadata in structured data
tags: [configuration, seo, structured-data]
files_changed: [src/config.ts, src/layouts/BaseLayout.astro, src/layouts/BlogPost.astro]
---

## What we built

- Created centralized site configuration file at `src/config.ts`
- Defined `SITE` constant with title, description, and URL
- Defined `AUTHOR` constant with name, legal name, email, location, and social profile URLs
- Updated `src/layouts/BaseLayout.astro` to import and use centralized config
- Updated `src/layouts/BlogPost.astro` to import and use centralized author config
- Enhanced JSON-LD structured data with author URL and `sameAs` social profile array
- Updated footer copyright to use `AUTHOR.legalName` from config
- Updated navigation and titles to use `SITE.title` from config

## Technical decisions

- **Centralized config approach**: Created single source of truth (`src/config.ts`) for all site metadata to avoid hardcoded values scattered across files
- **TypeScript constants**: Used `as const` to make configuration values readonly and type-safe
- **Dual naming**: Separated `AUTHOR.name` ("Aaron Roy" for public display) from `AUTHOR.legalName` ("Aaron Michael Roy" for copyright/legal purposes)
- **Schema.org `sameAs`**: Added array of social profile URLs to help search engines understand author identity across platforms
- **Social profiles included**: Twitter, LinkedIn, GitHub (can easily extend with more platforms)

## Issues encountered

- None - Straightforward refactoring with TypeScript providing immediate feedback on any missing imports or references

## Verification

- Production build successful (33 pages, 1.28s)
- JSON-LD structured data includes enhanced author metadata with social profiles
- Footer shows correct copyright: "© 2025 Aaron Michael Roy"
- Site title consistently uses "Aaron Roy" across all pages
- All imports resolved correctly with no TypeScript errors
- Dev server hot-reload working for config changes

## Outcomes

- Single file (`src/config.ts`) now controls all site metadata site-wide
- Enhanced SEO with author social profiles in structured data (helps Google Knowledge Graph)
- Easy to update author information, social links, or site details in one place
- Type-safe configuration prevents typos and missing values
- Future-proof: Can easily add more author fields (bio, image, etc.) or social profiles as needed
