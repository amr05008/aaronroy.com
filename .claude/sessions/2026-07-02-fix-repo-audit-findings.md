---
date: 2026-07-02
summary: Full repo audit, then fixed the 10 highest-leverage findings (trailing slashes, nested anchor, llms.txt, favicon, security headers, dep pruning, crawler-file tests, image compression)
tags: [audit, seo, a11y, security, dependencies, cleanup, testing, performance]
---

## Summary
Ran a two-agent audit of the whole repo (one auditing code/content/config, one
distilling Aaron's engineering values from the claude-channels repo to calibrate
recommendations). Then fixed the top 8 findings: landed the stranded
trailing-slash branch, fixed the invalid nested anchor on /writing, corrected
two broken llms.txt category links, replaced the 547 KB favicon with a 31 KB
PNG, added security headers, pruned 5 dead dependencies + the finished
WordPress-migration scripts, trimmed CLAUDE.md's unused video section, and
moved `LATEST_COUNT` into `src/config.ts`.

## Changes
- **Cherry-picked `631ef3c`** from abandoned branch `origin/claude/investigate-google-error-c0Bbu`:
  trailing slashes on all internal links (was: every internal click = a 301,
  since `trailingSlash: 'always'`). Resolved conflicts against the newer
  Highlights→Latest homepage and current category tags; restored real
  click-through navigation in the smoke tests (the bare-path goto workarounds
  are no longer needed). Also slashed two links the branch missed
  (`about.astro`, `Making-migrations-fun-with-Claude-Code.md`).
- `src/pages/writing.astro` — removed invalid nested `<a>` (category link was
  inside the post's block anchor with an `onclick="event.stopPropagation()"`
  hack). Title and description are now separate sibling links to the post.
- `public/llms.txt` — `/category/product-management/` and `/category/ai/`
  don't exist (404 for the AI crawlers the file targets); now `Product` →
  `/category/product/` and `Agents` → `/category/agents/`.
- `public/zuko_favicon.png` (new, 31 KB, 128px) replaces `zuko_favicon.svg`
  (547 KB — a 512px PNG base64-embedded in an SVG shell, loaded on every page).
  Deleted the unused `favicon.svg` too. `BaseLayout.astro` links the PNG.
- `vercel.json` — added security headers on all routes: HSTS,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`.
- `package.json` — removed `cheerio` (used by nothing) and `axios`, `jsdom`,
  `turndown`, `xml2js` (used only by the migration scripts). Deleted
  `scripts/migrate-wordpress.js` and `scripts/update-yoast-descriptions.js`
  (migration finished 2025; git history keeps them).
- `src/config.ts` — `LATEST_COUNT` now lives here; `index.astro` and
  `tests/smoke.spec.ts` both import it (was a magic 7 duplicated in both with
  keep-in-sync comments).
- `CLAUDE.md` — video section condensed to 4 lines (convention never used —
  `public/videos/` was empty), WordPress-migration section condensed to a
  git-history pointer, favicon note corrected, category examples updated to
  real names (Product/Agents, not Product Management/AI).
- Pruned branches: remote `claude/investigate-google-error-c0Bbu` (landed),
  local `protoflow/20260113-210310/approach-{a,b,c}` (stale, all pointed at
  an old commit).

### Second chunk (same day, commit f013886)
- `tests/smoke.spec.ts` — new "Crawler files" block: robots.txt must point at
  the sitemap; sitemap index + every referenced sitemap must resolve with real
  pages; every internal llms.txt link must return a direct 200 (`maxRedirects:
  0`, so a stale link fails instead of silently redirecting). Verified the test
  fails on a stale link before shipping.
- Compressed 19 heavy images in place (~8 MB saved, `public/` 25 MB → 17 MB):
  pngquant 65-85 on all PNGs > 250 KB, JPEG requality on the cx2025 race
  photos, and the 3016px design screenshot downscaled to 1600px. Same
  filenames/formats — no post references changed. Animated GIFs left alone.
- Docs: README (structure, LATEST_COUNT pointer, og-default path, migration
  section), docs/MIGRATION.md (restore-from-git-history note), CLAUDE.md test
  coverage list.

## Decisions
- **Did not touch Astro/Tailwind majors** — ADR 004 defers this deliberately.
  New fact worth an ADR update later: Astro 7 is out and `npm audit` now shows
  a high-severity Astro advisory cluster (XSS/SSRF variants); same
  non-applicability logic holds for a fully static, no-user-input site.
- Favicon kept the zuko artwork (extracted + downscaled) rather than reverting
  to the old `favicon.svg` — the zuko swap was a deliberate visual choice.

## Notes
Audit findings still open after this session: 29 empty image alts across 3
migrated posts (Claude can draft, needs review), no skip-link in BaseLayout,
ADR 004 could use a paragraph noting the Astro-7-era advisories were reviewed
and remain non-applicable, hardcoded post slugs in category tests, stale post
count in docs/PROJECT_IDEAS.md, `engines.node` pin + `astro check` script.
Higher-value than any of these: the parked content decisions in
SEO-AEO-AUDIT.md (Yahoo-2FA harvest-vs-ride, Strava MCP cluster).
