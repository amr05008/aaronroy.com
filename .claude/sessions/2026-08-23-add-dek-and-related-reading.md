---
date: 2026-08-23
summary: Reviewed and shipped the post-page dek + Related reading PR, replacing its coverage-first ranking with relevance-first plus one coverage slot after the balancer produced bad referrals on a real page
tags: [blog, related-posts, dek, seo, ranking, testing, review]
---

## Summary

PR #7 (opened from an earlier session's search-visibility audit) rendered the
frontmatter description as a visible dek and added a category-balanced
"Related reading" block. Grilled it before merge and found two things the
tests couldn't see: the email form's `-mt-7` was overlapping the last related
description by 28px on every post, and the balancer, built to reach zero
orphans, ranked a 2016 onboarding video above the most relevant 2026 post.
Aaron reviewed the ranking on the dev server and reframed the goal: relevance
first, coverage best-effort. Simulated four rules on the real 39-post corpus,
implemented the winner test-first, re-grilled with a fresh-context subagent,
shipped, squash-merged.

## Changes

- `src/utils/related.ts` — rewritten: rarity-weighted shared categories; slots
  1–2 pure relevance, slot 3 the topical match with fewest inbound links; no
  padding, no nearest-by-date rescue
- `src/layouts/BlogPost.astro` — `EmailNotify` now precedes `RelatedPosts`
  (fixes the overlap)
- `src/content/config.ts` — `description` required non-empty now that it renders
- `tests/related.spec.ts` — 4 ranking unit tests (watched them fail on the old
  rule first)
- `tests/smoke.spec.ts` — "no post is orphaned" became "every post with a
  topical peer is linked from a Related section"; block-list `categories:`
  guard; `RELATED_POST_LIMIT` imported instead of a hardcoded 3
- `CLAUDE.md`, `README.md`, `.claude/decisions/006-related-reading-relevance-over-coverage.md`
- PR #7 body — appended an update section; original text preserved

Commits: `e193aca`, `496f100` (pre-session, on the PR branch), `23ff263` (this
session), squash-merged as `e4c8b33`.

## Decisions

The ranking decision is in decision record 006. Session-specific:

- **Overlap fix: reorder, don't pad.** Moving the email form above Related
  keeps `EmailNotify`'s `-mt-7` assumption true (it tucks into the article's
  bottom padding) and puts the ask before the detour. Padding Related was the
  alternative.
- **No separate `node --test` runner for the unit tests.** They run under the
  existing Playwright config, which needs a build for its preview server.
  Thinnest setup; the cost is one sentence of docs.
- **The peerless post stays unlinked** rather than faking a relation.
  `in-appreciation-of-the-internet` (lone `Life`) is the only one; tagging it
  is Aaron's call and was left open.

## Notes

- Evidence at merge: 45/45 Playwright; built-HTML census counting Related
  sections only: 1 orphan (peerless), inbound max 12 / mean 2.77; the PM page
  reads personal-agent · morning-briefing · product-role.
- Grill findings deliberately not acted on: `limit = 1` would invert "relevance
  first" (unexercised parameter); `.astro` files aren't typechecked here
  (`astro check` wants `@astrojs/check`); 18 pre-existing `tsc` errors in
  `astro.config.mjs` and `rss.xml.ts`.
- Dek copy worth a content pass now that it's visible:
  `building-products-age-of-ai` repeats its first sentence;
  `researching-student-loan-products` is a 2019 survey CTA; "experienece" in
  `lessons-learned-refinancing-student-loan-debt`; terminal periods are
  inconsistent across ~8 posts.
