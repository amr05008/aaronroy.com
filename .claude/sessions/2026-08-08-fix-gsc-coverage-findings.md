---
date: 2026-08-08
summary: GSC Coverage audit — blocked a legacy Elementor crawl trap, shipped sitemap lastmod with fail-loud build invariants, added a Search Console indexing report, fixed a stale skill list that was creating dead URLs
tags: [seo, gsc, robots, sitemap, lastmod, crawl-budget, testing, skills, monitoring]
---

## Summary

Started as "look at this GSC Coverage export, is anything up?" The scariest number
(2,225 "Alternate page with proper canonical tag") was benign, but the drilldown
revealed a WordPress-era Elementor crawl trap and, underneath it, the real problem:
only 28 of 58 real pages were indexed, with every unindexed one stuck on a
pre-July crawl date. Fixed the trap, shipped `<lastmod>` so Google has a reason to
re-crawl, then grilled that work and found it had shipped three silent failure
modes of its own. Closed with a monthly Search Console report so the next
occurrence doesn't need a hand-exported CSV.

## Changes

- `public/robots.txt` — block the Elementor crawl trap (`?lid=`, `*_page=`,
  `elementor_`); collapse the per-vendor AI-crawler blocks into one stanza
- `astro.config.mjs` — sitemap `<lastmod>` from frontmatter; build-time invariants
  (future dates, unparsed categories, missing lastmod) via an `astro:build:done` hook
- `tests/smoke.spec.ts` — 3 tests: lastmod matches frontmatter, none future-dated,
  robots trap rules cover every user-agent group
- `scripts/gsc-index-report.mjs` — URL Inspection sweep of all sitemap URLs
- `.claude/skills/blog-publish/SKILL.md` — `updatedDate` row, absolute-internal-link
  rule, archive-linking prompt, category/robots warnings
- `CLAUDE.md`, `README.md` — document all of the above
- 4 blog posts — internal links added by Aaron, plus `updatedDate`

Outside this repo: `claude-channels` `skills/blog-review/SKILL.md` (d177cef);
`~/.config/aaronroy-indexing/run-gsc-report.sh` +
`~/Library/LaunchAgents/com.aaronroy.gsc-index-report.plist`.

Commits: bd3d5be, f9c3632, a9626b2, e88f358, a4d3073, fd49e0f, 0ff2be8, f60cde1

## Decisions

**robots.txt, not a Vercel redirect, for the crawl trap.** Vercel forwards query
strings to redirect destinations (verified against the live `/feed` rule), so
`source: "/"` + `has: lid` → `destination: "/"` emits `Location: /?lid=...` for a
request to `/?lid=...` — an infinite loop on the homepage. Legacy `routes` can
express it safely but is mutually exclusive with
`redirects`/`rewrites`/`headers`/`trailingSlash`, which this config depends on.

**Trap rules duplicated across user-agent groups on purpose.** robots.txt is
most-specific-user-agent-wins: a named group overrides `*` entirely rather than
merging. The per-vendor AI-crawler blocks had been silently exempting Bingbot and
every AI crawler. A smoke test now asserts per-group coverage.

**lastmod coverage check lives in `astro:build:done`, not sitemap's `serialize()`.**
@astrojs/sitemap catches whatever `serialize` throws, logs it, writes **no
sitemap**, and still exits 0 — measured, not assumed. A guard there looks loud and
silently ships a site with no sitemap.

**Local launchd over a cloud routine for the GSC report.** Cuts against the usual
preference, because that preference was formed around the Bing routine's 32-char
API key. This credential is an RSA private key with Full property access, and a
cloud routine would carry it in its prompt indefinitely. At monthly cadence the
reliability gain is negligible.

**Left the ~2,225 canonicalized URLs alone.** Google reports them as correctly
handled and stopped crawling them on 2026-06-09. robots.txt stops future crawling
without purging what's already known.

## Notes

- **The Coverage report has no API.** Search Console exposes Search Analytics,
  Sitemaps, Sites, and URL Inspection only. `gsc-index-report.mjs` uses URL
  Inspection, which is a better fit anyway — it covers our 58 URLs rather than
  thousands of legacy junk ones.
- **"URL is unknown to Google" means queued-but-never-crawled, not undiscovered.**
  The Sitemaps report showed sitemap-index.xml read successfully on 2026-08-01
  with all 58 pages discovered, while 14 of those URLs reported "unknown". This
  cost the session a wrong hypothesis; the script relabels it at the source.
- **Baseline 2026-08-08:** 30/58 indexed, 14 queued-never-crawled, 10
  crawled-not-indexed, 4 discovered-not-indexed. Saved to
  `~/.config/aaronroy-indexing/gsc-state.json`; the next run reports deltas.
- **Internal linking is the main open lever.** 29 of 38 published posts had zero
  inbound links from another post; 257 external links against 13 internal. Aaron
  linked 3 targets this session. `vibe-coding-a-tour-de-france-app` (1,482 words,
  July 2025) has still never been crawled once despite having inbound links —
  likely needs a Request Indexing nudge.
- **Not covered by tests:** the launchd job and wrapper script. The wrapper's
  failure path was verified manually (missing node → exit 1 → Discord alert).
- The first scheduled run is **2026-09-03**; nothing runs before then
  (`RunAtLoad` is false). `launchctl kickstart gui/$(id -u)/com.aaronroy.gsc-index-report`
  to fire it early.
