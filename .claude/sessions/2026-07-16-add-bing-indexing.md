---
date: 2026-07-16
summary: IndexNow submission (key file + script + blog-publish ping) and /feed/ redirect to fix zero Bing-family indexing
tags: [seo, bing, indexnow, redirects]
---

## Summary
Bing (and DuckDuckGo/Yahoo/Ecosia, which ride its index) had zero pages for
aaronroy.com despite nothing blocking Bingbot — the site was simply never
submitted. Implemented the repo half of the fix from
`claude-channels/plans/aaronroy-bing-indexing-handoff-2026-07-16.md` (trimmed:
the plan's GitHub Action was dropped as overkill). Bulk-submitted all 57
sitemap URLs to IndexNow (202 accepted). The decisive step — Bing Webmaster
Tools "Import from GSC" — is Aaron's, login-gated.

## Changes
- `public/b3203c392ece6abbe1f75c459d01b46d.txt` — IndexNow key file (public by design)
- `scripts/indexnow-submit.js` — no-dep ESM script; no args = submit whole live
  sitemap, args = specific URLs; verifies the key file is live first, fails loud
- `.claude/skills/blog-publish/SKILL.md` — publish step now pings IndexNow after
  live-verification
- `vercel.json` — 301/308 `/feed` + `/feed/` → `/rss.xml` (legacy WP feed path)
- `CLAUDE.md` — SEO section documents IndexNow + legacy-path posture

## Decisions
- **No GitHub Action for IndexNow.** ~2 posts/month doesn't justify standing CI
  with a deploy-race guard; the blog-publish skill already ends with live
  verification, so the ping lives there. One-off pings: run the script manually.
- **No speculative WP redirects.** Slugs and `/category/*` were preserved in the
  migration; only `/feed/` was high-confidence. `/tag/*`, `?p=<id>` wait for real
  404 evidence from GSC Coverage / Bing WMT crawl errors.
- **No BingSiteAuth.xml** — unnecessary if Aaron uses the GSC import (auto-verifies).

## Notes
- Verified on Vercel preview (deployment-protection bypass via Vercel MCP) before
  fast-forward merge to main; prod verified live; bulk submit returned 202.
- Aaron's remaining tasks: Bing WMT "Import from GSC" (the actual fix), confirm
  sitemap listed there, check GSC Pages/Coverage for excluded URLs → candidate
  redirects.
- Success check: `site:aaronroy.com` on DuckDuckGo in ~3–7 days.
