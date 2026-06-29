---
date: 2026-06-28
summary: Replaced curated homepage highlights with a recency-driven Latest feed; fixed a Playwright test footgun; triaged Dependabot; refreshed homepage meta + dropped page taglines
tags: [homepage, testing, security, seo]
---

## Summary
Reworked the homepage to lead with the most recent published posts ("Latest"
feed) instead of a hand-maintained `highlights.ts` list, eliminating the manual
upkeep that had let curation drift. Along the way: fixed a Playwright config
footgun, triaged the repo's Dependabot alerts, and tightened the homepage/writing
copy.

## Changes
- **`src/pages/index.astro`** — homepage now renders the N newest published posts
  (`LATEST_COUNT = 7`, newest first) instead of `highlights`; removed the visible
  intro tagline; refreshed the meta description (also flows to OG/Twitter).
- **`src/data/highlights.ts`** — deleted (orphaned).
- **`src/pages/writing.astro`** — removed the redundant tagline under the heading.
- **`tests/smoke.spec.ts`** — homepage test asserts the capped Latest count; fixed
  a stale category assertion (strava post tags are `Bikes, Tutorials`, not `AI`).
- **`playwright.config.ts`** — `reuseExistingServer: false`.
- **`README.md` / `CLAUDE.md`** — documented the Latest feed; removed highlights refs.
- **`.claude/decisions/001-highlights-over-frontmatter.md`** — marked Superseded.

## Commits
- `492a511` Replace curated homepage highlights with a recency-driven Latest feed
- `e36e0f5` Patch transitive form-data and undici advisories via npm audit fix
- `edef7d2` Refresh homepage meta description; drop redundant page taglines
- (doc/wrap-up changes shipped separately at session end)

## Decisions
- **Recency over curation** (supersedes ADR 001). The newest *published* post now
  always leads. Note: `go-get-yourself-a-personal-agent` is `draft: true`, so it
  isn't live yet — it'll take the top slot when published.
- **Kept `/writing`** as the archive hub (rejected the idea of deleting it).
- **Deferred** the Simon-Willison two-column layout + category pills — not enough
  content/cadence yet; the category counts are also stale (PM dominated by old posts).
- **Dependabot**: patched form-data + undici (real, but only used by the one-off
  WordPress migration script); dismissed esbuild (dev/Windows-only, Mac user) and
  the Astro XSS/SSRF set (static single-author site exposes none of the vectors;
  fix requires a deliberate Astro 5→7 major upgrade — no 5.x backport exists).

## Notes
- **Test footgun fixed:** Playwright had `reuseExistingServer: true`, so smoke tests
  silently ran against a stale `npm run dev` server on :4321 (renders drafts, skips
  the build) — that produced a false nav-test failure that took real digging to trace.
- **Open follow-up:** Astro 5→7 upgrade is the only genuine to-do, maintenance-grade,
  on Aaron's schedule (would clear the dismissed esbuild/Astro alerts for real).
