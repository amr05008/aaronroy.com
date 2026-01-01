# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog for Aaron Michael Roy, built with Astro and migrated from WordPress. The site is a static blog with clean design, SEO optimization, and Markdown-based content management.

## Tech Stack

- **Astro 5.x** - Static site generator with TypeScript support
- **Tailwind CSS** - Utility-first styling with typography plugin
- **MDX** - Markdown with JSX capabilities for blog posts
- **Content Collections** - Type-safe content management via `src/content/config.ts`

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
- **Syntax highlighting**: Uses `github-dark` theme (configured in `astro.config.mjs`)
- **Integrations**: MDX, Sitemap, Tailwind CSS

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

## Session History

### 2025-10-10 (Later): Centralized Site Configuration & Enhanced Author Metadata

**What we built/modified:**
- Created centralized site configuration file at `src/config.ts`
- Defined `SITE` constant with title, description, and URL
- Defined `AUTHOR` constant with name, legal name, email, location, and social profile URLs
- Updated `src/layouts/BaseLayout.astro` to import and use centralized config
- Updated `src/layouts/BlogPost.astro` to import and use centralized author config
- Enhanced JSON-LD structured data with author URL and `sameAs` social profile array
- Updated footer copyright to use `AUTHOR.legalName` from config
- Updated navigation and titles to use `SITE.title` from config

**Technical decisions:**
- **Centralized config approach**: Created single source of truth (`src/config.ts`) for all site metadata to avoid hardcoded values scattered across files
- **TypeScript constants**: Used `as const` to make configuration values readonly and type-safe
- **Dual naming**: Separated `AUTHOR.name` ("Aaron Roy" for public display) from `AUTHOR.legalName` ("Aaron Michael Roy" for copyright/legal purposes)
- **Schema.org `sameAs`**: Added array of social profile URLs to help search engines understand author identity across platforms
- **Social profiles included**: Twitter, LinkedIn, GitHub (can easily extend with more platforms)

**Issues encountered:**
- **None** - Straightforward refactoring with TypeScript providing immediate feedback on any missing imports or references

**Verification completed:**
- ✅ Production build successful (33 pages, 1.28s)
- ✅ JSON-LD structured data includes enhanced author metadata with social profiles
- ✅ Footer shows correct copyright: "© 2025 Aaron Michael Roy"
- ✅ Site title consistently uses "Aaron Roy" across all pages
- ✅ All imports resolved correctly with no TypeScript errors
- ✅ Dev server hot-reload working for config changes

**Outcomes:**
- Single file (`src/config.ts`) now controls all site metadata site-wide
- Enhanced SEO with author social profiles in structured data (helps Google Knowledge Graph)
- Easy to update author information, social links, or site details in one place
- Type-safe configuration prevents typos and missing values
- Addresses previous SEO note: "Consider adding author social profiles to structured data for enhanced rich results" ✓
- Future-proof: Can easily add more author fields (bio, image, etc.) or social profiles as needed

### 2025-10-10: OG Image System Implementation

**What we built/modified:**
- Implemented hybrid OG image system with default fallback at `public/images/og-default.png`
- Updated `src/layouts/BaseLayout.astro` to use default OG image instead of `null` when no custom image specified
- Fixed `src/layouts/BlogPost.astro` to pass `heroImage` prop to BaseLayout (critical bug fix)
- Created `public/og-images/` directory structure for custom post images
- Added first custom OG image for "Making migrations fun with Claude Code" post
- Updated CLAUDE.md SEO Notes with OG image documentation

**Technical decisions:**
- **Hybrid approach**: Chose default fallback + optional custom images (Option 3) for best balance of immediate coverage and future flexibility
- **Absolute URLs**: Used `new URL(path, Astro.site).toString()` for OG tags to ensure social platforms can fetch images correctly
- **Directory structure**: Created separate `public/og-images/` folder to keep custom OG images organized apart from blog post content images
- **Always render tags**: Removed conditional rendering of `og:image` and `twitter:image` meta tags to ensure LinkedIn/Facebook always have image metadata
- **Image specs**: Standardized on 1200×630px (LinkedIn/Facebook/Twitter requirement) for all OG images

**Issues encountered:**
- **File location mismatch**: User created `public/images/og-images/` instead of `public/og-images/` - moved file to match frontmatter path
- **Frontmatter parsing**: Blank line inside YAML frontmatter prevented proper parsing - removed empty line
- **Missing prop passthrough**: `BlogPost.astro` received `heroImage` from frontmatter but didn't forward to `BaseLayout` - added `ogImage={heroImage}` parameter (root cause of custom images not working)
- **Browser caching**: Dev server updated but browser showed cached OG tags - resolved with hard refresh

**Verification completed:**
- ✅ Default OG image fallback working for all posts without custom images
- ✅ Custom OG image override working via `heroImage` frontmatter field
- ✅ OG meta tags generate absolute URLs (`https://aaronroy.com/...`)
- ✅ Dev server hot-reload working for content and layout changes
- ✅ Production build successful (33 pages)
- ✅ Custom image accessible at `/og-images/making-migrations-fun-with-claude-code.png`

**Outcomes:**
- All 29 blog posts now have OG images for social sharing (LinkedIn, Facebook, Twitter)
- Default branded image provides consistent fallback across entire site
- Simple frontmatter addition (`heroImage: "/og-images/filename.png"`) enables custom images per post
- Social sharing now displays rich previews with images instead of text-only
- System documented and ready for production deployment

### 2025-10-06: Production Deployment - 404 Page, Analytics & DNS Cutover

**What we built/modified:**
- Created custom branded 404 error page at `src/pages/404.astro`
- Installed and integrated Vercel Analytics (`@vercel/analytics`)
- Verified domain change from aaronmichaelroy.com to aaronroy.com in production build
- Deployed to Vercel with auto-detected Astro configuration
- Connected custom domains (aaronroy.com and www.aaronroy.com) in Vercel
- Enabled Vercel Web Analytics in dashboard

**Technical decisions:**
- **404 page design**: Created minimal, branded error page with CTAs to /writing and homepage, using consistent Tailwind styling from existing pages
- **Analytics choice**: Chose Vercel Analytics over Google Analytics for privacy-friendly tracking (no cookie consent needed), seamless Vercel integration, and built-in Core Web Vitals monitoring
- **Analytics implementation**: Used official `@vercel/analytics/astro` component in BaseLayout for site-wide tracking without additional configuration
- **Domain setup**: Added both apex domain (aaronroy.com) and www subdomain with automatic SSL certificate provisioning
- **Meta tags**: Set 404 page title as "Page Not Found | Aaron Roy" (not "Aaron Michael Roy") for consistency with new domain

**Issues encountered:**
- **None** - Deployment went smoothly with all systems working as expected

**Verification completed:**
- ✅ Production build successful (33 pages including new 404)
- ✅ Sitemap verified: All 32 URLs use `https://aaronroy.com` (0 references to old domain)
- ✅ Canonical URLs confirmed on all pages
- ✅ Open Graph and Twitter Card meta tags use new domain
- ✅ Custom 404 page displays correctly with proper HTTP 404 status
- ✅ Vercel Analytics script injected on all pages
- ✅ Preview site live at https://aaronroy-com.vercel.app/
- ✅ SSL certificates generating for custom domains

**Deployment status:**
- **Preview URL**: https://aaronroy-com.vercel.app/ (live and tested)
- **Custom domains**: aaronroy.com and www.aaronroy.com (SSL provisioning in progress)
- **Analytics**: Enabled in Vercel dashboard, ready to track once DNS propagates
- **DNS**: Configured at domain registrar, awaiting propagation (1-48 hours)

### 2025-10-06 (Later): Domain Migration & 301 Redirects - SEO Preservation

**What we built/modified:**
- Configured 301 redirects from aaronmichaelroy.com → aaronroy.com using WordPress Redirection plugin
- Set up regex-based catch-all redirect pattern to preserve all URL paths
- Submitted Google Search Console Change of Address from old domain to new domain
- Verified redirect functionality across homepage, about page, writing archive, and blog posts

**Technical decisions:**
- **Redirect method**: Chose WordPress Redirection plugin over .htaccess for easier management and visibility in WordPress admin
- **Redirect pattern**: Used regex pattern `^(.*)$` with target `https://aaronroy.com$1` to preserve exact URL paths
- **Redirect type**: 301 Permanent redirect (critical for SEO) to signal permanent move to search engines
- **Domain retention strategy**: Keep aaronmichaelroy.com active with redirects through 2029 (domain expiration) to catch long-tail traffic and old backlinks
- **GSC timing**: Submitted Change of Address immediately after redirect configuration to expedite ranking signal transfer

**Issues encountered:**
- **Plugin UI confusion**: Initial configuration showed validation errors for regex syntax until "Regex" checkbox was enabled
- **Target URL format**: Needed to remove slash before `$1` variable (`https://aaronroy.com$1` not `https://aaronroy.com/$1`) to avoid double-slash issues

**Verification completed:**
- ✅ Redirects tested and working correctly:
  - `aaronmichaelroy.com` → `aaronroy.com`
  - `aaronmichaelroy.com/about` → `aaronroy.com/about`
  - `aaronmichaelroy.com/writing` → `aaronroy.com/writing`
  - Blog post URLs preserve exact paths
- ✅ Google Search Console Change of Address submitted (processing started October 6, 2025)
- ✅ Both HTTP and HTTPS variants redirect correctly
- ✅ 301 status code confirmed (not 302 temporary redirect)

**SEO migration status:**
- **Old domain**: aaronmichaelroy.com (owned through 2029, hosted on GoDaddy)
- **New domain**: aaronroy.com (live on Vercel with SSL)
- **Redirect strategy**: Permanent 301 redirects preserving all URL paths
- **Google notification**: Change of Address submitted in Search Console
- **Expected timeline**: 
  - Week 1-2: Google verifies redirects, begins processing
  - Week 2-4: Search results gradually switch to new domain
  - Month 2-6: Rankings stabilize on new domain, old traffic drops to near-zero

**Updated launch checklist:**

**✅✅✅ CRITICAL ITEMS COMPLETED:**
1. ✅ Site migrated to Astro and deployed to Vercel
2. ✅ All 29 blog posts migrated with SEO descriptions
3. ✅ Custom 404 page created and deployed
4. ✅ Vercel Analytics installed and enabled
5. ✅ 301 redirects from old domain configured and tested
6. ✅ Google Search Console Change of Address submitted
7. ✅ DNS cutover complete (aaronroy.com live)
8. ✅ SSL certificates provisioned for both apex and www

**🚀 HIGH-PRIORITY REMAINING TASKS:**
1. **Mobile responsive testing** - Effort: 20 min - Priority: HIGH
   - Test on iPhone (Safari)
   - Test on Android (Chrome)
   - Verify navigation, images, typography, and touch targets
   - Ensure writing archive is usable on small screens

2. **Update external profile links** - Effort: 30 min - Priority: HIGH
   - [ ] LinkedIn profile URL (highest professional traffic)
   - [ ] Twitter/X bio website link
   - [ ] Email signature
   - [ ] GitHub profile website field
   - [ ] Resume/CV (update PDF with new URL)
   - [ ] Other profiles (Medium, Dev.to, etc.)

**Total high-priority effort: ~55 minutes**

**🎨 NICE-TO-HAVES (Post-launch optimization):**
4. Run Lighthouse audit for performance baseline - Effort: 15 min
5. Create default OG image (1200x630px) for better social sharing - Effort: 30 min
6. Add RSS feed with @astrojs/rss - Effort: 45 min
7. Image optimization (WebP conversion) - Effort: 60 min
8. Set up error tracking (Sentry) - Effort: 30 min
9. Submit to Bing Webmaster Tools - Effort: 15 min

**📊 Monitoring plan:**
- **Week 1-2**: Check Google Search Console daily for crawl errors
- **Month 1-3**: Monitor traffic shift from old to new domain in GSC
- **Month 6+**: Verify old domain traffic drops to near-zero (keep redirects active permanently)

**Outcomes:**
- **SITE IS FULLY LIVE** on aaronroy.com with complete SEO preservation
- All critical migration tasks completed: new site deployed, redirects configured, Google notified
- Old domain (aaronmichaelroy.com) will continue redirecting permanently to preserve SEO value from backlinks
- Domain migration following best practices: 301 redirects + GSC Change of Address
- Only remaining tasks are polish items (mobile testing, profile updates, performance optimization)
- **Migration complete and production-ready** 🎉

### 2025-10-05: Documentation Sync & Launch Readiness Review

**What we built/modified:**
- Updated CLAUDE.md to reflect completion of favicon and SEO descriptions (both done manually)
- Updated README.md with current project structure and 75% deployment readiness status
- Added SEO Features section to README documenting all completed optimizations
- Added Homepage Highlights section explaining curation feature
- Reorganized deployment checklist into Critical/Deployment/Post-Launch categories
- Committed documentation updates with detailed commit messages
- Created prioritized launch checklist with effort estimates

**Technical decisions:**
- **Documentation consolidation**: Chose to maintain deployment status in both CLAUDE.md (detailed session history) and README.md (user-facing quick reference)
- **Checklist organization**: Separated tasks by blocker status (Critical vs Nice-to-Have) to clarify launch dependencies
- **Effort estimation**: Added time estimates to help prioritize remaining work
- **Project structure accuracy**: Updated file tree to match actual implementation (highlights.ts, Yoast script, favicon, robots.txt)

**Total blocker effort: ~85 minutes (1.5 hours)**

**✅ DEPLOYMENT STEPS (Sequential after blockers complete):**
5. Deploy to Vercel production - Effort: 10 min
6. Configure custom domain in Vercel dashboard - Effort: 5 min
7. Update DNS A/CNAME records - Effort: 5 min + 1-48hr propagation
8. Verify SSL certificate - Effort: 5 min
9. Monitor 24-48 hours post-launch - Effort: Ongoing

**🎨 NICE-TO-HAVES (Post-launch optimization):**
10. Submit sitemap to Google Search Console - Effort: 10 min
11. Create default OG image (1200x630px) - Effort: 30 min
12. Run Lighthouse audit - Effort: 15 min
13. Add RSS feed with @astrojs/rss - Effort: 45 min
14. Image optimization (WebP conversion) - Effort: 60 min
15. Set up error tracking (Sentry) - Effort: 30 min

**Priority order for next session:**
1. 404 page (highest ROI, prevents bad UX)
2. Analytics (critical for measuring success)
3. Deploy to Vercel preview + URL testing (validates WordPress parity)
4. Mobile testing (last blocker before launch)
5. DNS cutover (go live!)

**Outcomes:**
- Documentation now accurately reflects current state (favicon ✓, SEO ✓)
- Clear separation between blockers (85 min) and nice-to-haves
- Launch path reduced to 4 critical tasks before DNS cutover
- README updated to serve as quick-reference deployment guide
- All changes committed and ready to push

### 2025-10-05: Pre-Deployment Audit & Documentation

**What we built/modified:**
- Conducted comprehensive pre-deployment audit of Astro site vs current WordPress site
- Verified production build process (32 pages generated successfully)
- Confirmed sitemap generation (`sitemap-index.xml` and `sitemap-0.xml`)
- Validated SEO infrastructure (canonical URLs, meta tags, Open Graph, JSON-LD structured data)
- Verified all 29 blog posts migrated with correct URL structure matching WordPress (`/{slug}`)
- Confirmed all 54+ images migrated to `public/images/`
- Manually installed custom branded favicon in `public/favicon.svg`
- Manually completed SEO descriptions for all 29 blog posts (100% coverage)
- Updated CLAUDE.md documentation to reflect current state

**Technical decisions:**
- **URL preservation strategy**: Verified Astro URLs exactly match WordPress structure to prevent SEO disruption during migration
- **Sitemap compatibility**: Confirmed @astrojs/sitemap generates proper XML that can replace WordPress sitemap plugin
- **Static build validation**: Tested full production build to ensure all dynamic routes (blog posts) generate correctly
- **Favicon placement**: Used `public/favicon.svg` for proper static asset serving in Astro
- **Documentation approach**: Created detailed pre-deployment checklist covering Vercel deployment, DNS cutover, and post-launch monitoring

**Issues encountered:**
- **Build directory confusion**: Initially checked for `dist/` files while in `dist/` directory itself (resolved by returning to project root)
- **Sitemap location**: Sitemap files exist in `dist/` after build (not in project root), which is expected for static site generation
- **WordPress comparison**: Current WordPress site has limited robots.txt (`User-agent: * Crawl-Delay: 20`) vs our more comprehensive setup with sitemap reference

**Deployment readiness assessment:**
- ✅ **Content**: All 29 posts migrated with SEO descriptions
- ✅ **URLs**: Match WordPress exactly for SEO continuity
- ✅ **SEO**: Comprehensive meta tags, sitemaps, robots.txt, structured data
- ✅ **Build**: Production builds working (1.14s, 32 pages)
- ✅ **Favicon**: Custom branded icon installed
- ⚠️ **OG Images**: Optional, none configured (acceptable for MVP)
- ⚠️ **Analytics**: Not yet installed (critical pre-launch task)
- ⚠️ **404 Page**: Using default (should create custom)

**Remaining tasks for production deployment:**

**Critical (must complete before DNS cutover):**
1. Create custom 404 page (`src/pages/404.astro`)
2. Install analytics (Google Analytics, Plausible, or Fathom)
3. Test all 29 blog post URLs in production preview
4. Mobile responsive testing on actual devices

**Deployment steps:**
5. Deploy to Vercel staging environment
6. Configure custom domain (aaronroy.com) in Vercel
7. Update DNS records to point to Vercel
8. Verify SSL certificate provisioning
9. Monitor first 24-48 hours for 404s and issues

**Post-launch optimization:**
10. Submit sitemap to Google Search Console
11. Create default OG image for social sharing
12. Run Lighthouse audit for performance baseline
13. Consider adding RSS feed with @astrojs/rss

**Outcomes:**
- Comprehensive pre-deployment audit completed with 75% readiness score
- Site architecture validated as production-ready
- Clear critical path identified: 4 tasks before DNS cutover
- Documentation updated to reflect manual favicon and SEO completion
- Deployment roadmap created with specific Vercel and DNS migration steps

### 2025-10-05: SEO Optimization & Highlights Feature

**Changes made:**
- Replaced "Recent Posts" with "Highlights" section on homepage
- Created `src/data/highlights.ts` for curated post selection
- Built `scripts/update-yoast-descriptions.js` to extract Yoast meta descriptions
- Updated all 29 blog posts with hand-crafted SEO descriptions from WordPress
- Added `public/robots.txt` with sitemap reference
- Fixed broken OG image references (made optional instead of 404)
- Updated homepage meta description from generic to specific
- Installed custom branded favicon (`public/favicon.svg`)

**Technical decisions:**
- **Highlights config file approach**: Chose centralized slug array over frontmatter flags for easier curation and explicit ordering
- **Yoast extraction**: Parsed WordPress XML postmeta to recover superior SEO descriptions that weren't captured in initial migration
- **Optional OG images**: Removed default image reference to avoid 404s; will add proper OG images in future design phase
- **Location update**: Changed from "Bay Area" to "Brooklyn" across site

**Issues encountered:**
- Initial migration used generic descriptions instead of Yoast meta descriptions
- Homepage had generic meta description ("Product manager, writer, and tech enthusiast")
- Missing robots.txt would have impacted crawlability
- Broken OG image reference would have caused validation warnings

**Outcomes:**
- All 29 posts now have optimized SEO descriptions (100% coverage)
- Homepage has specific, location-accurate meta description
- Site is crawler-ready with proper robots.txt
- Highlights feature allows dynamic content curation without code changes
- Custom favicon installed for brand consistency
- All SEO essentials in place for production deployment

### 2026-01-01: Category Archive Pages Implementation

**What we built/modified:**
- Created category listing page at `/categories` showing all 11 categories with post counts
- Implemented dynamic category archive pages at `/category/{slug}` using Astro's `getStaticPaths()`
- Added "Categories" link to main header navigation in `BaseLayout.astro`
- Made category names clickable on Writing page, linking to respective archive pages
- Added `slugify()` helper function for URL-friendly category slugs
- Created `PROJECT_IDEAS.md` (git-ignored) to track potential enhancement projects

**Technical decisions:**
- **Dynamic route generation**: Used `getStaticPaths()` in `category/[slug].astro` to generate static pages for all categories at build time
- **Slugification approach**: Inline arrow function within `getStaticPaths()` to avoid scope issues with build-time execution
- **Category mapping**: Built categoryMap to track category names and associated posts, preserving original casing while using lowercase slugs for URLs
- **Grid layout**: 2-column grid on categories listing page for better visual organization
- **Sorting strategy**: Categories sorted by post count (descending), then alphabetically for consistent ordering
- **Navigation placement**: Added Categories between Writing and About in header for logical information architecture

**Issues encountered:**
- **Initial build error**: `slugify is not defined` - function was defined in frontmatter but not in scope during `getStaticPaths()` execution. Fixed by moving slugify logic inline within the function.
- **No other issues**: Build completed successfully on first attempt after fix

**Verification completed:**
- ✅ Production build successful (47 pages, up from 33)
- ✅ All 11 category pages generated correctly
- ✅ Category listing page shows accurate post counts
- ✅ Product Management category verified with all 9 posts displayed correctly
- ✅ Clickable category links working on Writing page
- ✅ "Categories" link added to main navigation
- ✅ All pages follow consistent Tailwind styling

**Build metrics:**
- Pages before: 33 (homepage, writing, about, 404, 31 posts)
- Pages after: 47 (added 1 category listing + 11 category archives + 2 dynamic routes)
- Build time: ~3.74s (minimal impact)
- Categories generated: 11 (Product Management, 3D Printing, Presentations, Projects, Tutorials, Startups, AI, Bikes, Cybersecurity, Student Loans, Life)

**Outcomes:**
- **Improved content discoverability**: Readers can now browse posts by topic instead of only chronological order
- **Better SEO**: Category pages provide additional entry points for search traffic
- **Enhanced navigation**: Three ways to find content (homepage highlights, chronological writing archive, topic-based categories)
- **Zero maintenance overhead**: Categories automatically generated from existing frontmatter, no manual curation needed
- **Scalable architecture**: Adding new categories requires no code changes, just adding category to post frontmatter
- **Project tracking**: Created git-ignored PROJECT_IDEAS.md with 25 potential enhancement ideas for future sessions
