# 006: Related reading — relevance first, one coverage slot

**Date:** 2026-08-23
**Status:** Accepted (supersedes the balancer first shipped on PR #7 in `496f100`)

## Context

Until PR #7 the only post-to-post links were the chronological prev/next pair;
30 of 39 posts had no inbound link from any other post outside that chain. The
first implementation ranked category siblings by shared-category count, then
fewest inbound links assigned so far, then recency, with a rescue pass that
bolted any still-uncovered post onto its nearest neighbour by date. It reached
zero orphans.

Reviewing it on the dev server, Aaron looked at *What I look for in product
managers now* (Product, Tutorials, Agents) and saw a 2016 onboarding video, the
morning-briefing post, and the 2021 product-job post, while *Go get yourself a
personal agent* (Agents + Tutorials, June 2026), the strongest match, was cut
because it already had five inbound links. The balancer treated "has 5" vs
"has 2" as a strict ordering and traded the best match for the neediest one on
every tie. The rescue pass had the same character: the lone `Life` post was
placed on a 3DPrinterOS post because their dates were close.

## Options simulated

All 39 published posts, counting Related-section links only. Relevance in
V1–V3 is shared categories weighted by rarity, `log(N / count)`, so sharing
`Agents` (5 posts) outweighs sharing `Projects` (11).

| rule | orphans | posts with ≤1 inbound | PM page |
|---|---|---|---|
| V0 balancer (shipped first) | 0 | 6 | onboarding-2016 · briefing · product-role |
| V1 pure relevance | 7 | 20 | personal-agent · briefing · product-role |
| V2 relevance, need breaks exact ties only | 2 | 6 | personal-agent · briefing · product-role |
| **V3 two relevance slots + one coverage slot** | **1** | **3** | personal-agent · briefing · product-role |

V1 is the "obvious" version: the newest post in each category collects every
link (one post reached 16 inbound) and the oldest collect none.

## Decision

V3. Slots 1–2 are pure relevance (weighted shared categories, newest first
among equals; they depend only on the two posts being compared, so publishing
an unrelated post leaves them alone). Slot 3 goes to the remaining topical
match with the fewest inbound links so far, in slug order for determinism.
Nothing is padded in: fewer peers means fewer links; no peers means no section.
The nearest-by-date rescue pass is removed.

Aaron's framing: a site where most write-ups aren't orphans but every article
refers out to relevant articles beats one with no orphans and bad referrals.

## Consequences

- The only post the algorithm leaves unlinked is one with no category in
  common with any other post (today `in-appreciation-of-the-internet`, the lone
  `Life` post). The remedy is a tag on the post, not a weaker rule.
- In theory a hub whose four or more satellites each have it as their only peer
  can starve one of them for its single coverage slot. Never observed on this
  corpus; the smoke-test peer invariant fails loud if it happens.
- Link distribution is less even than under the balancer (max inbound 12 vs 6),
  by design.
- `tests/related.spec.ts` pins the rule on synthetic posts;
  `tests/smoke.spec.ts` asserts the peer invariant on the built site.
- The build-time cost is unchanged (O(n²) over ~40 posts).
