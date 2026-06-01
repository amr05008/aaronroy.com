---
date: 2026-06-01
summary: Published "How to build a personal morning briefing" workshop blog post
tags: [blog, content, ai, tutorials]
---

## Summary

Wrote and published a new blog post recapping the Manychat workshop "How to build
a personal morning briefing." The post was developed in parallel with a LinkedIn
version (kept in Notion); the two are intentionally not cross-linked at publish
time. Post went live on `main` with body screenshots, an OG image, and a homepage
highlight.

## Changes

- `src/content/blog/how-to-build-a-personal-morning-briefing.md` - New post: workshop recap, the `prompt > sources > schedule > delivery` pattern, two starter prompts (weather; weather + Slack), and a Claude Cowork scheduled tasks vs. Claude Code routines comparison.
- `public/images/daily-briefing/` - Three body screenshots (Discord briefing example, Cowork scheduled tasks, Claude Code routines).
- `public/og-images/daily-briefing-og.png` - Social/OG image.
- `src/data/highlights.ts` - Featured the new post at the top of homepage highlights.

Commits: `7571637` (post + images), `9a987a0` (highlight + header tidy).

## Decisions

- **Shipped directly to `main`** rather than via a branch/PR. "Live" means Vercel's
  auto-deploy on push to `main`; a branch wouldn't deploy. Matches the repo's
  existing content workflow (prior blog posts committed straight to `main`).
- **Dropped the in-body H1** — the `BlogPost` layout renders `title` from
  frontmatter as the `<h1>`, so an in-body H1 would duplicate it.
- **Localized images** — the draft's Notion-hosted screenshots used expiring S3
  URLs; replaced with local `<figure>` blocks under `public/images/daily-briefing/`.

## Notes

- A transient `[glob-loader] Duplicate id` warning appears during `npm run build`
  only when the dev server is running concurrently (shared content cache). Only one
  file exists on disk; a clean build (cache cleared / dev stopped) shows no warning,
  and Vercel's clean build is unaffected.
- LinkedIn version is still owned by Aaron in Notion (pending: Patryk's last name,
  screenshot crop). The live post URL can serve as its "go deeper" companion link.
- Pre-existing doc drift surfaced: CLAUDE.md's hardcoded post counts (31/29) and
  category breakdown (e.g. AI listed as 3, actually 8) are stale independent of this
  session. See the wrap-up discussion for proposed handling.
