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
 * Selection rule — THIS LIST MIRRORS THE "Browse by topic" SECTION OF
 * `public/llms.txt`, and that file is the source of truth for which topics are
 * worth surfacing. It's a hand-curated answer to exactly this question, so it
 * wins over any heuristic (an earlier draft of this file derived a shorter list
 * from post counts, which contradicted llms.txt on three categories and would
 * have had the site telling AI crawlers to browse topics it told search
 * crawlers not to index).
 *
 * **If you change one, change the other.** Nothing enforces it automatically:
 * the llms.txt smoke test only checks those links resolve, and they still do
 * when a page is noindex.
 *
 * Post counts at time of writing (2026-08-17), of 39 published:
 *   kept:    projects 10 · tutorials 10 · product 10 · 3d-printing 7 ·
 *            agents 4 · startups 4 · bikes 3
 *   dropped: presentations 6 · wami 5 · 3dprinteros 3 · teachable 2 · bond 2 ·
 *            glutenornot 2 · cybersecurity 2 · student-loans 2 · life 1
 *
 * The dropped set is company names with no search demand (wami, bond,
 * 3dprinteros, teachable) plus archives too thin to be a hub (<= 6 posts and
 * not curated in llms.txt).
 *
 * Adding a category back re-enters it in the sitemap on the next build. If a
 * dropped one later becomes a real topic hub (curated intro + internal links,
 * not just a post list — see plans/seo-aeo-learnings-from-vhpc-2026-06.md),
 * add it here and to llms.txt together.
 */
export const INDEXABLE_CATEGORIES = [
  'agents',
  'bikes',
  '3d-printing',
  'product',
  'projects',
  'startups',
  'tutorials',
];

/** True when this category slug should carry `noindex` / stay out of the sitemap. */
export const isThinCategory = (slug) => !INDEXABLE_CATEGORIES.includes(slug);
