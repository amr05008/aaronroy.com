---
date: 2026-02-03
summary: Added older/newer post navigation component to blog posts
tags: [navigation, component, blog]
---

## Summary

Added a two-column navigation component at the bottom of each blog post showing chronologically adjacent posts. Inspired by kalzumeus.com, styled to match the site's existing brand. Also fixed a pre-existing category order test bug.

## Changes

- `src/pages/[...slug].astro` - Sort posts ascending by pubDate with secondary slug sort; compute olderPost/newerPost props for each post
- `src/layouts/BlogPost.astro` - Accept navigation props, render PostNavigation component after `</article>` tag
- `src/components/PostNavigation.astro` - New component: two-column grid with older/newer post titles and "View Archive" link
- `tests/smoke.spec.ts` - Added 4 navigation tests; fixed pre-existing category order assertions for experiments-with-strava-mcp
- `CLAUDE.md` - Documented new component, test coverage, and recent changes

## Decisions

- Navigation placed outside `<article>` for better HTML semantics (screen readers distinguish article content from navigation)
- Secondary sort on slug ensures deterministic order when posts share the same pubDate
- Titles only (no descriptions) to keep the component compact
- "View Archive" links to /writing without a post count

## Notes

- Two posts share the date 2024-06-25 (Yahoo 2FA and online scammers), validating the secondary sort decision
- The pre-existing category test failure was caused by the test assuming alphabetical order ("AI, Bikes") but frontmatter lists them as `["Bikes", "AI"]`
