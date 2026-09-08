---
date: 2026-09-07
summary: Triaged the GSC "Crawled - currently not indexed" alert; redirected the renamed AI category, demoted two archives, and closed two one-directional test gaps a grill pass exposed
tags: [seo, gsc, redirects, categories, testing, review, indexnow]
---

## Summary

A GSC alert flagged 11 sitemap URLs as "Crawled - currently not indexed" with a validation
that failed 9/5. Read the report in Search Console via Chrome, then used
`scripts/gsc-index-report.mjs` for the precise picture: 27 of 51 sitemap URLs indexed.

Most of the 11 needed no code change — the status is Google's judgment, not a fault. Two
things were genuinely fixable, and a grill pass on the PR found a third problem in the tests
that guard them. Shipped as PR #8 (squashed to `1a58c3d`), then requested indexing on the two
URLs that turned out to be the real story.

## Changes

- `vercel.json` — `/category/ai` and `/category/ai/` redirect to `/category/agents/`
- `src/utils/seo-categories.mjs` — `INDEXABLE_CATEGORIES` 7 → 5 (dropped `tutorials`, `bikes`)
- `public/llms.txt` — same two topics removed, keeping the mirror
- `tests/smoke.spec.ts` — category indexability asserted in both directions over every archive;
  llms.txt checked as set equality
- `CLAUDE.md`, `README.md` — redirect semantics, the renamed-category rule, test list, stale counts

Commit: `1a58c3d` (squash of `ffea3cc`, `5b5102b`, `0699585`)

## Decisions

**Demoted `tutorials` and `bikes` on evidence over curation.** Both survived the 2026-08-17 cut
only because `llms.txt` listed them. The failed validation was Google declining them a second
time. New rule, recorded in `seo-categories.mjs`: llms.txt breaks ties on categories Google
hasn't ruled on, but a *completed validation that declines an archive is evidence*, and evidence
beats curation.

**Accepted the three video-stub posts as portfolio pages.** `how-brands-are-adapting-...` (105
words), `user-activation-onboarding-...` (115), `3d-printing-101-class` (150) are a short
preamble plus a YouTube iframe. Google can't read the video. Adding 300-500 words of takeaways
would likely fix them; Aaron chose not to. Not a bug, and not worth reopening without a reason.

**Did not re-run the GSC validation.** It only passes when Google actually indexes the URLs, so
it would fail again on the remaining 9 and generate another failure email.

**Kept the redundant unslashed redirect.** Vercel's trailing-slash normalizer runs ahead of
custom redirects, so `/category/ai` never reaches the `/category/ai` rule — it's normalized to
`/category/ai/` first. The rule is dead config, kept only for symmetry with the existing `/feed`
pair. Worth removing both together if that ever gets tidied.

**Kept the hardcoded expected-category list in the smoke test** rather than importing
`INDEXABLE_CATEGORIES`. The sitemap is *generated* from that constant, so importing it would
assert the constant against itself and pass regardless of what the build emitted. Comment added
so it doesn't get "simplified" into a circular test later.

## Notes

**The grill pass earned its keep.** `pi` running `gpt-6-astra` via Herdr mutation-tested the
category-indexability block and found it green under two mutations it should have caught:
stripping `noindex` from the bikes archive, and deleting the startups line from llms.txt. Both
passed 5/5. The block only checked one direction of each rule. It also compiled `vercel.json`
with `@vercel/routing-utils` and caught that `permanent: true` emits **308, not 301** — the PR
description and commit message both said 301 and were amended. Full report at
`scratchpad/grill-pr8.md` (session-local, not in the repo).

**`permanent: true` is 308.** Verified independently and against production. Google treats 308
and 301 the same for consolidation, so this is a naming trap rather than a behavior one. Now
documented in CLAUDE.md, along with the two-hop chain for unslashed sources.

**The alert pointed at the wrong bucket.** "Crawled - currently not indexed" is Google having
looked and passed. The more interesting bucket was the 8 marked "Discovered - currently not
indexed" — never fetched at all. Seven are 2018-2020 stubs that should stay that way, but
`/giving-agents-personal-context/` (2026-04-07, 812 words, on-topic) and `/writing/` (in the main
nav) both showed **Last crawl: N/A** in URL Inspection despite three discovery paths each
(sitemap, RSS, GitHub profile). That's crawl starvation, not thin content. Requested indexing on
both; the dialog notes re-submitting does not improve queue position, so one request is the whole
intervention.

**Watch on the next report:** `/how-we-brought-3dprinteros-to-life/` was indexed and *dropped* to
"Crawled - not indexed" since the previous run. One data point is noise; a second drop is a
signal. The monthly job runs on the 3rd.

**Not verified:** nothing outstanding. The redirect chain was confirmed against production
(308 → 308 → 200) after merge, which the SSO-protected preview had blocked.
