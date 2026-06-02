---
date: 2026-06-01
summary: SEO + AEO audit of the live site, then implemented the structured-data, AEO, and technical-SEO baseline (7 items)
tags: [seo, aeo, audit, analysis, gsc, structured-data, schema, implementation]
---

## Summary
Produced a comprehensive SEO and AEO (AI answer-engine optimization) audit of aaronroy.com (delivered as gitignored `SEO-AEO-AUDIT.md`), then implemented the highest-priority groundwork across 5 commits: the full author **entity graph** (Person/ProfilePage + WebSite + unified `@id` + enriched BlogPosting), the **AEO baseline** (`llms.txt` + AI-crawler `robots.txt`), and the **technical baseline** (`og:type=article` + `article:*`). Audit scorecard moved Technical SEO A−→A, Structured data C+→A−, AEO/GEO C→B.

## Implementation (commits, in order)
- `0ba9e8b` **S1** — `Person`/`ProfilePage` on `/about` + entity facts centralized in `src/config.ts`; added `public/images/aaron-roy.jpg` headshot (schema-only, not displayed)
- `41b4b20` **S3 + A4** — `WebSite` schema on homepage; stable `@id` (`#person`) unifying author across `/about`, homepage, and all posts
- `3da1450` **S2** — enriched `BlogPosting` JSON-LD (image, mainEntityOfPage, inLanguage, keywords, articleSection, timeRequired)
- `c6bb48c` **A1 + A2** — `public/llms.txt` curated map; `public/robots.txt` explicit AI-crawler welcome (chose "all incl. training")
- `0967a8d` **T1** — `og:type="article"` + `article:*` meta on posts (via new `ogType`/`publishedTime`/`modifiedTime` props on `BaseLayout`)

Parallel agent (same session) shipped `2b23ec7`: dependency `npm audit fix` (22→3 advisories) + fixed the pre-existing trailing-slash smoke-test failures (suite now 18/18 green = working verification gate).

## Original audit summary
Combined a code-level review (layouts, schema, config, robots, sitemap, RSS), live-site verification (curl of rendered HTML/JSON-LD), and analysis of a 12-month Google Search Console export (queries + pages).

## Changes
- Added `SEO-AEO-AUDIT.md` (repo root, non-published) — scorecard, findings with `file:line` refs and impact×effort, GSC-driven opportunities, prioritized P0–P3 roadmap, and MCP/tooling recommendations.

## Decisions
- **Deliverable = written audit + roadmap, no code changes** this pass (Aaron's choice). Each finding is scoped to become its own implementation task later.
- **Optimize equally for organic + AEO.** Highest-leverage items (structured data, machine-readable author identity) serve both.
- **Report lives at repo root**, not `src/pages`/`public`, so it won't deploy.

## Notes — key findings (for future implementation sessions)
- **Biggest gaps (P0):** no `Person`/`ProfilePage` schema on `/about` (S1); minimal `BlogPosting` JSON-LD missing image/mainEntityOfPage/inLanguage/keywords/timeRequired (S2); `og:type` hardcoded `"website"` even on posts (T1, `BaseLayout.astro:39`); no `llms.txt` (A1); no explicit AI-crawler rules in `robots.txt` (A2); no `WebSite` schema (S3).
- **GSC reality check:**
  - Ranks only **#9 for "aaron roy"** → entity schema (S1/S3/A4) is the most direct lever.
  - **Yahoo 2FA post: 3,420 impressions, 0 clicks, position 26.5** — #1 impression page by 3×, but off-brand. Strategic fork flagged: harvest vs. let-ride.
  - **Strava MCP** post is the best on-brand striking-distance cluster (pos 11–24, target audience).
  - Several page-1 posts earn 0 clicks (3DPrinterOS 333 imp/#8.65, ChatGPT 156 imp/#8.05) → title-rewrite targets (3DPrinterOS likely answered inline = AEO win).
  - Trailing-slash duplicate URLs in index are self-healing (verified 308 redirects).
- **MCP recommendation:** connect a GSC MCP (e.g. `AminForou/mcp-gsc`) for future live pulls; Playwright + WebFetch/WebSearch already available. Paid (DataForSEO/Ahrefs) unnecessary for a personal blog.
- Live-site output verified to match source on audit date.
