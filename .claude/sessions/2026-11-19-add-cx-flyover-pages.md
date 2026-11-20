---
date: 2026-11-19
summary: Two cyclocross course flyover pages live at /cx/ by direct link, after a browser check that fixed five bugs upstream; the toolkit moved to its own repo
tags: [cx-flyover, static-pages, noindex, testing, deploy]
---

## Summary

Deployed `/cx/moran-cx.html` and `/cx/mansfield-hollow.html`: self-contained three.js flyovers
of two cyclocross laps, built by cos-m1 in `agent-resources/projects/cx-flyover`. They were
browser-checked first (Playwright, desktop and phone width, light and dark, touch pinch). That
check found five bugs, which were fixed in the toolkit's template and not here. The toolkit then moved to the private
repo `amr05008/cx-flyover` (`~/repos/cx-flyover`).

## Changes

- `public/cx/moran-cx.html`, `public/cx/mansfield-hollow.html` - the pages, copied verbatim
- `CLAUDE.md` - URL Structure entry: where the pages are built, never edit the copies here
- `README.md` - `public/cx/` in the project structure tree

Commits: 044c1bb (pages), fe34230 and 54cc547 (CLAUDE.md note, then its new repo path).
Upstream: agent-resources 81f5aed (fixes), c5fc1e1 (moved out); cx-flyover 8b1f482.

## Decisions

**Static files in `public/`, not Astro pages.** Each page is a finished ~700 KB document with
its course data inlined. In `public/` the files are served byte-for-byte, so an Astro rebuild
can't alter them, and `@astrojs/sitemap` never lists them, so no sitemap filter entry was needed.

**Direct link only (Aaron).** `noindex` in each page, nothing in nav, posts, RSS or llms.txt.

**Fix upstream, copy verbatim.** The five bugs were in the template ("−0%" gradient, marker
invisible in overview, lap cropped at phone width, legend over the hint, favicon 404). They
were fixed in the toolkit and rebuilt, so the copies here never diverge from their source.

## Notes

- `vercel.json`'s `trailingSlash: true` doesn't redirect paths with a file extension: both
  URLs serve 200 directly, the same as `/llms.txt`.
- The site has no `/favicon.ico` (pages link `zuko_favicon.png`). A standalone page in
  `public/` without its own icon link logs a 404 in Chrome's console.
- Left as is: an empty HUD slot on Mansfield (no race speed), soft contours when zoomed in,
  and a near-black start post in dark mode.
