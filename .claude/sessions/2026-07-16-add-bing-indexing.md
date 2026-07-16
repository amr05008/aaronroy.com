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
- Aaron completed his half same-session: added the site to Bing WMT and
  submitted `sitemap-index.xml` (crawled with Status Success within the hour).
- Success check: `site:aaronroy.com` on DuckDuckGo in ~3–7 days.

## Follow-up monitoring (same session, lives outside the repo)

Aaron asked for a one-week check reporting to Discord #content-studio, headless
(no Chrome dependency):
- Bing WMT **API key** generated (headless dashboard access, verified working)
  and a #content-studio **webhook** created; both in
  `~/.config/aaronroy-indexing/env` on the M3 (never in this public repo).
- `~/.config/aaronroy-indexing/check-indexing.mjs` — the check (Bing API
  sitemap/crawl/issues/traffic + DDG `site:` proxy + IndexNow key health);
  posted the day-0 baseline to #content-studio.
- **Cloud routine** `trig_019yQLgzHaZoo7eu3u2VLc42` fires once
  2026-07-23T13:57Z and posts the Day-7 report to the webhook (chosen over a
  launchd job — fires even with the Mac off; a launchd version was built then
  replaced same day). Credentials are duplicated in the routine prompt — if
  rotated, update both places.
- If the Day-7 report lists crawl-issue URLs, those become the deferred
  WP-redirect list (§A.2 of the handoff plan).
