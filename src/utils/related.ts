import type { CollectionEntry } from 'astro:content';

export interface RelatedPost {
  slug: string;
  title: string;
  description: string;
}

/** How many related posts a post page shows at most. */
export const RELATED_POST_LIMIT = 3;

/**
 * Choose what to read next, for every post at once.
 *
 * Why this exists: before it, the only post-to-post links were the chronological
 * prev/next pair, so a reader arriving on one deep link (47% of this site's
 * traffic comes from LinkedIn, almost always to a single post) hit a dead end
 * unless the neighbouring post by date happened to be relevant.
 *
 * Relevance comes first. The first two slots are the strongest topical matches,
 * full stop: shared categories, weighted so that a rare one (two posts tagged
 * GlutenOrNot) says more than a common one (eleven tagged Projects), newest
 * first among equals. These slots depend only on the two posts being compared
 * (plus the category counts, which a new post shifts by so little that no
 * existing slot has moved in simulation), so publishing an unrelated post
 * leaves them alone.
 *
 * Coverage comes second, and gets exactly one slot. Ranking every slot purely by
 * relevance hands the newest post in each category every link and leaves the
 * oldest with none (7 of 39 orphaned, one post collecting 16 links, when it was
 * tried). So the third slot goes to the topical match that the fewest other
 * pages link to. It is still a topical match. That leaves two ways a post can
 * end up unlinked: nothing shares a category with it (the fix is a tag on the
 * post, not a weaker rule here), or four or more posts all have the same hub as
 * their only peer and lose the race for its single coverage slot. The second
 * has never happened on this corpus; the smoke test's peer invariant fails
 * loud if it does. Nothing is ever padded in: fewer peers means fewer links,
 * and no peers means no section.
 *
 * An earlier version let coverage override recency on every tie and bolted
 * peerless posts onto their nearest neighbour by date. That produced zero
 * orphans and, on the "what I look for in PMs" post, a 2016 onboarding video
 * ahead of the June 2026 agents post. Aaron's call (2026-08-23): a site where
 * every page refers out to genuinely related writing beats one with no orphans
 * and bad referrals.
 */
export function buildRelatedMap(
  all: CollectionEntry<'blog'>[],
  limit: number = RELATED_POST_LIMIT
): Map<string, RelatedPost[]> {
  type Post = CollectionEntry<'blog'>;
  // Deduped: a tag repeated on one post must not count twice.
  const categoriesOf = (post: Post) => [...new Set(post.data.categories ?? [])];

  const categoryCount = new Map<string, number>();
  for (const post of all) {
    for (const c of categoriesOf(post)) categoryCount.set(c, (categoryCount.get(c) ?? 0) + 1);
  }
  // Inverse document frequency: a category on every post is worth 0, one shared
  // by only two posts is worth the most.
  const weight = (c: string) => Math.log(all.length / (categoryCount.get(c) ?? all.length));

  const sharesCategory = (a: Post, b: Post) => categoriesOf(a).some((c) => categoriesOf(b).includes(c));
  const relevance = (a: Post, b: Post) =>
    categoriesOf(a).filter((c) => categoriesOf(b).includes(c)).reduce((sum, c) => sum + weight(c), 0);
  const newestFirst = (a: Post, b: Post) =>
    b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.slug.localeCompare(b.slug);
  const mostRelevantTo = (post: Post) => (a: Post, b: Post) =>
    relevance(post, b) - relevance(post, a) || newestFirst(a, b);
  const peersOf = (post: Post) => all.filter((other) => other.slug !== post.slug && sharesCategory(post, other));

  const inbound = new Map<string, number>(all.map((p) => [p.slug, 0]));
  const chosen = new Map<string, Post[]>();
  const relevanceSlots = Math.max(0, limit - 1);

  // Pass 1: the relevance slots. Independent of every other post's choices.
  for (const post of all) {
    const top = peersOf(post).sort(mostRelevantTo(post)).slice(0, relevanceSlots);
    chosen.set(post.slug, top);
    for (const p of top) inbound.set(p.slug, (inbound.get(p.slug) ?? 0) + 1);
  }

  // Pass 2: the coverage slot. Sees every relevance choice, then hands each
  // page's last slot to the peer with the fewest links so far. Slug order
  // keeps the outcome deterministic.
  for (const post of [...all].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const have = chosen.get(post.slug) ?? [];
    if (have.length >= limit) continue;
    const pick = peersOf(post)
      .filter((p) => !have.includes(p))
      .sort((a, b) => (inbound.get(a.slug) ?? 0) - (inbound.get(b.slug) ?? 0) || mostRelevantTo(post)(a, b))[0];
    if (!pick) continue;
    have.push(pick);
    inbound.set(pick.slug, (inbound.get(pick.slug) ?? 0) + 1);
  }

  return new Map([...chosen].map(([slug, posts]) => [slug, posts.map(toRelated)]));
}

function toRelated(post: CollectionEntry<'blog'>): RelatedPost {
  return { slug: post.slug, title: post.data.title, description: post.data.description };
}
