---
date: 2025-10-06
summary: Created 404 page, installed Vercel Analytics, deployed to production
tags: [deployment, analytics, 404]
files_changed: [src/pages/404.astro, src/layouts/BaseLayout.astro, package.json]
---

## What we built

- Created custom branded 404 error page at `src/pages/404.astro`
- Installed and integrated Vercel Analytics (`@vercel/analytics`)
- Verified domain change from aaronmichaelroy.com to aaronroy.com in production build
- Deployed to Vercel with auto-detected Astro configuration
- Connected custom domains (aaronroy.com and www.aaronroy.com) in Vercel
- Enabled Vercel Web Analytics in dashboard

## Technical decisions

- **404 page design**: Created minimal, branded error page with CTAs to /writing and homepage, using consistent Tailwind styling from existing pages
- **Analytics choice**: Chose Vercel Analytics over Google Analytics for privacy-friendly tracking (no cookie consent needed), seamless Vercel integration, and built-in Core Web Vitals monitoring
- **Analytics implementation**: Used official `@vercel/analytics/astro` component in BaseLayout for site-wide tracking without additional configuration
- **Domain setup**: Added both apex domain (aaronroy.com) and www subdomain with automatic SSL certificate provisioning
- **Meta tags**: Set 404 page title as "Page Not Found | Aaron Roy" (not "Aaron Michael Roy") for consistency with new domain

## Issues encountered

- None - Deployment went smoothly with all systems working as expected

## Verification

- Production build successful (33 pages including new 404)
- Sitemap verified: All 32 URLs use `https://aaronroy.com` (0 references to old domain)
- Canonical URLs confirmed on all pages
- Open Graph and Twitter Card meta tags use new domain
- Custom 404 page displays correctly with proper HTTP 404 status
- Vercel Analytics script injected on all pages
- Preview site live at https://aaronroy-com.vercel.app/
- SSL certificates generating for custom domains

## Deployment status

- **Preview URL**: https://aaronroy-com.vercel.app/ (live and tested)
- **Custom domains**: aaronroy.com and www.aaronroy.com (SSL provisioning in progress)
- **Analytics**: Enabled in Vercel dashboard, ready to track once DNS propagates
- **DNS**: Configured at domain registrar, awaiting propagation (1-48 hours)
