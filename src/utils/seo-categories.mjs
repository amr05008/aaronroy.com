/**
 * Which /category/<slug>/ archive pages are allowed into the index.
 *
 * Why this exists: GSC reported "Crawled – currently not indexed" on
 * /category/tutorials/, /category/bikes/ and /category/student-loans/ (email
 * 2026-08-16, after the 2026-08-08 validation attempt failed). That status is
 * Google's *judgment*, not a technical fault — it fetched those pages fine and
 * declined to index them, because a category archive is a list of titles whose
 * content lives in full on the posts it links to.
 *
 * Google is right, and it will keep being right. The problem was that all 16
 * category pages sat in the sitemap, so the site kept asking for indexing that
 * was never coming — 16 of 58 sitemap URLs generating permanent GSC noise.
 *
 * The fix is to stop asking, for the archives that can't earn it. This list is
 * the single source of truth for two behaviours that MUST agree:
 *   1. `noindex` on the page          (src/pages/category/[slug].astro)
 *   2. exclusion from the sitemap     (astro.config.mjs)
 * A page that is noindex but still listed in the sitemap sends crawlers exactly
 * the mixed signal this change exists to remove — the same reason /subscribed/
 * and /confirmed/ are handled in both places.
 *
 * NOTE: noindexing an archive does NOT hide its posts. Every post keeps its own
 * indexable URL; only the list page drops out.
 *
 * Selection rule — a category stays indexable when BOTH hold:
 *   - it has enough posts to be a real hub (>= 4 of the 39 published), and
 *   - it matches what Aaron writes now, so it could plausibly answer a search.
 *
 * Post counts at time of writing (2026-08-17):
 *   kept:    projects 10 · tutorials 10 · product 10 · agents 4
 *   dropped: 3d-printing 7 · presentations 6 · wami 5 · startups 4 · bikes 3 ·
 *            3dprinteros 3 · teachable 2 · bond 2 · glutenornot 2 ·
 *            cybersecurity 2 · student-loans 2 · life 1
 *
 * 3d-printing (7) and presentations (6) clear the size bar but fail the second
 * test — two careers back, and not topics being invested in. wami / bond /
 * 3dprinteros / teachable are company names with no search demand.
 *
 * Changing this list is a one-line edit; both behaviours follow automatically.
 * If a dropped category later becomes a real topic hub (curated intro + internal
 * links, not just a post list — see plans/seo-aeo-learnings-from-vhpc-2026-06.md),
 * add it back here and it re-enters the sitemap on the next build.
 */
export const INDEXABLE_CATEGORIES = ['agents', 'product', 'projects', 'tutorials'];

/** True when this category slug should carry `noindex` / stay out of the sitemap. */
export const isThinCategory = (slug) => !INDEXABLE_CATEGORIES.includes(slug);
