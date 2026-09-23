---
date: 2026-09-22
summary: Published "Getting jevvy with it" (TypeSafe Jev vs. Opus 4.8); rebuilt the latency chart and an HTML-rendered OG image; added a site-wide 1px gray border to post images after checking all 128
tags: [blog, publishing, og-images, images, css]
---

## Summary

Took the Jev post from a vault draft through three blog-review passes to a live post. Along the way the latency chart got a headline that matches the post's median claim, the OG image was designed from scratch (six variants, Aaron picked D), and post images gained a hairline border site-wide so white screenshots stop bleeding into the white page.

## Changes

- `src/content/blog/getting-jevvy-with-it.md` - new post, slug from the title; mechanical fixes only (missing link space, dangling `&t` on the YouTube URL, hyphenation)
- `public/images/getting-jevvy-with-it/` - four images; the hot-dog screenshot downscaled 456 KB → 47 KB
- `public/og-images/getting-jevvy-with-it-og.png` - variant D ("17× faster, ~240× cheaper", full-bleed blue)
- `src/styles/global.css` - `.prose img { border: 1px solid #d1d5db }`

Commit: 2866b05. Chart and OG sources live in the vault (`inbox/attachments/jev-latency.html`, `jev-og.html`).

## Decisions

**Site-wide border, checked before shipping.** All 128 post images were scanned: 5 have transparent edges (Venmo steps, Teachable sales page, Vätternrundan map, GitHub profile, Kimi slide) and each was rendered with the border and eyeballed — none look boxed-in, so no exemptions. 27 are white-edged and benefit. Black was tried and rejected as too heavy against the site's gray chrome.

**OG image rendered from HTML, not composited.** Built as a 1200×630 HTML page and screenshotted with this repo's own Playwright (`node_modules/playwright`) — easier to iterate headline/color variants than Pillow compositing. heroImage is OG/schema only, never rendered in the body, so the OG can differ from the in-post chart.

**Skipped llms.txt.** First impressions of a week-old model; the numbers will date fast. Same reasoning as the Airbnb post's skip.

## Notes

- `npm run test` fails with "port 4321 is already used" while `astro dev` is running — stop the dev server before the gate's test row.
- No LinkedIn spoke drafted; the vault calendar (`Ranked ideas.md`) carries it as open.
