---
date: 2025-10-06
summary: Configured 301 redirects from old domain, submitted GSC Change of Address
tags: [seo, domain, redirects]
files_changed: []
---

## What we built

- Configured 301 redirects from aaronmichaelroy.com → aaronroy.com using WordPress Redirection plugin
- Set up regex-based catch-all redirect pattern to preserve all URL paths
- Submitted Google Search Console Change of Address from old domain to new domain
- Verified redirect functionality across homepage, about page, writing archive, and blog posts

## Technical decisions

- **Redirect method**: Chose WordPress Redirection plugin over .htaccess for easier management and visibility in WordPress admin
- **Redirect pattern**: Used regex pattern `^(.*)$` with target `https://aaronroy.com$1` to preserve exact URL paths
- **Redirect type**: 301 Permanent redirect (critical for SEO) to signal permanent move to search engines
- **Domain retention strategy**: Keep aaronmichaelroy.com active with redirects through 2029 (domain expiration) to catch long-tail traffic and old backlinks
- **GSC timing**: Submitted Change of Address immediately after redirect configuration to expedite ranking signal transfer

## Issues encountered

- **Plugin UI confusion**: Initial configuration showed validation errors for regex syntax until "Regex" checkbox was enabled
- **Target URL format**: Needed to remove slash before `$1` variable (`https://aaronroy.com$1` not `https://aaronroy.com/$1`) to avoid double-slash issues

## Verification

- Redirects tested and working correctly:
  - `aaronmichaelroy.com` → `aaronroy.com`
  - `aaronmichaelroy.com/about` → `aaronroy.com/about`
  - `aaronmichaelroy.com/writing` → `aaronroy.com/writing`
  - Blog post URLs preserve exact paths
- Google Search Console Change of Address submitted (processing started October 6, 2025)
- Both HTTP and HTTPS variants redirect correctly
- 301 status code confirmed (not 302 temporary redirect)

## SEO migration status

- **Old domain**: aaronmichaelroy.com (owned through 2029, hosted on GoDaddy)
- **New domain**: aaronroy.com (live on Vercel with SSL)
- **Redirect strategy**: Permanent 301 redirects preserving all URL paths
- **Google notification**: Change of Address submitted in Search Console
- **Expected timeline**:
  - Week 1-2: Google verifies redirects, begins processing
  - Week 2-4: Search results gradually switch to new domain
  - Month 2-6: Rankings stabilize on new domain, old traffic drops to near-zero

## Outcomes

- Site fully live on aaronroy.com with complete SEO preservation
- Old domain will continue redirecting permanently to preserve SEO value from backlinks
- Domain migration following best practices: 301 redirects + GSC Change of Address
