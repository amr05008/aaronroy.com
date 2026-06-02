---
date: 2026-06-01
summary: Full SEO + AEO audit of the live site, grounded in code review and a Google Search Console export
tags: [seo, aeo, audit, analysis, gsc]
---

## Summary
Produced a comprehensive SEO and AEO (AI answer-engine optimization) audit of aaronroy.com, delivered as `SEO-AEO-AUDIT.md` at the repo root. Combined a code-level review (layouts, schema, config, robots, sitemap, RSS), live-site verification (curl of rendered HTML/JSON-LD), and analysis of a 12-month Google Search Console export (queries + pages). No code changes — analysis + prioritized roadmap only.

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
