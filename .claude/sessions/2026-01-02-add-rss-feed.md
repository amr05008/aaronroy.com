---
date: 2026-01-02
summary: Implemented full-featured RSS feed with HTML content and absolute image URLs
tags: [rss, seo, content-syndication, testing]
---

## Summary
Added a comprehensive RSS feed implementation to the site with full HTML content rendering, absolute image URLs for proper display in feed readers, auto-discovery links, user-facing subscription links, and automated testing.

## Changes

### Core Implementation
- **src/pages/rss.xml.ts** - Created RSS feed endpoint
  - Uses `@astrojs/rss` package for feed generation
  - Integrates `marked` library to convert markdown to HTML
  - Post-processes HTML to convert relative image URLs to absolute URLs
  - Includes all 31 blog posts with full content
  - Adds author metadata (RFC 822 format)
  - Configured for GitHub Flavored Markdown

### User Interface
- **src/layouts/BaseLayout.astro** - Added RSS auto-discovery link in `<head>`
  - Enables automatic feed detection by RSS readers
  - Added RSS icon + text link in footer (visible on all pages)

- **src/pages/writing.astro** - Added "Subscribe via RSS" link
  - Displays prominently on Writing page header
  - Uses RSS icon + text for clear call-to-action

### Testing
- **tests/smoke.spec.ts** - Added 3 new RSS-focused tests
  - Validates RSS feed structure and post count
  - Checks auto-discovery link presence
  - Verifies user-facing RSS links are visible
  - Fixed slug normalization to handle uppercase filenames

### Documentation
- **CLAUDE.md** - Updated project documentation
  - Added RSS to URL structure
  - Listed new dependencies (marked, @astrojs/rss)
  - Documented RSS in SEO Optimizations section
  - Added RSS tests to smoke test coverage
  - Updated Recent Changes

### Dependencies
- `@astrojs/rss@4.0.9` - Official Astro RSS feed generation
- `marked@15.0.6` - Markdown to HTML parser (48KB)

## Decisions

**Why full content instead of excerpts?**
Full content provides better reader experience and is standard for personal blogs. Readers can consume content directly in their preferred RSS reader without needing to click through.

**Why `marked` over other parsers?**
- Lightweight (48KB) vs alternatives like `markdown-it` (85KB)
- Simple API with single method call
- Industry standard with wide adoption
- Handles GitHub Flavored Markdown out of the box

**Why convert relative URLs to absolute?**
RSS readers need absolute URLs to display images. Without conversion, all 83 images across posts would fail to load in feed readers.

**Why not include hero images as enclosures?**
Only 5 of 31 posts have hero images. Would require filesystem access at build time to calculate file sizes, adding complexity for minimal benefit. Can revisit if more posts adopt hero images.

## Implementation Details

### URL Conversion Strategy
Post-processes rendered HTML to replace relative paths:
- `/images/` → `https://aaronroy.com/images/`
- `/og-images/` → `https://aaronroy.com/og-images/`
- Handles both `src` and `href` attributes

### Feed Metadata
- Feed title: "Aaron Roy"
- Description: "Product manager, writer, and tech enthusiast"
- Language: en-us
- Author: aaron@aaronroy.com (Aaron Roy)
- All 31 posts included, sorted by pubDate (newest first)

## Notes

**RSS Feed Presentation in Browsers:**
When viewing `/rss.xml` directly in a browser, it displays as raw XML source. This is expected and normal. The HTML content is XML-encoded (e.g., `&lt;p&gt;` instead of `<p>`). RSS readers decode this automatically and display formatted content.

**Test Coverage:**
All 10 smoke tests pass, including new RSS-specific tests. Feed validates with 31 posts, proper structure, and all required elements.

**Feed Size:**
Final RSS feed: 166KB (reasonable for full-content feed with 31 posts)

**Future Enhancements (Deferred):**
- Hero images as `<enclosure>` tags
- `<lastBuildDate>` metadata
- Copyright notice in feed
- Updated date support for edited posts
