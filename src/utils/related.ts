import type { CollectionEntry } from 'astro:content';

export interface RelatedPost {
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
}

/** How many related posts a post page shows at most. */
export const RELATED_POST_LIMIT = 3;

/**
 * Choose what to read next, for every post at once.
 *
 * Why this exists: before it, the only post-to-post links were the chronological
 * prev/next pair, so the archive was a chain — the oldest posts sat ~34 hops from
 * the homepage, and a reader arriving on one deep link (47% of this site's
 * traffic comes from LinkedIn, almost always to a single post) hit a dead end
 * unless the neighbouring post by date happened to be relevant.
 *
 * Why it's computed for all posts together rather than per post: the obvious
 * implementation — rank each post's category siblings by recency and take the
 * top three — quietly fails at the only job it has. In a category with ten posts
 * the three slots go to the three newest every single time, so the newest posts
 * collect every inbound link and the oldest collect none. That leaves exactly
 * the posts that were already unindexed still orphaned. A test asserting no post
 * is orphaned caught it; the fix is to make selection aware of what it has
 * already handed out.
 *
 * Ranking, in order: most shared categories, then fewest inbound links assigned
 * so far, then most recent, then slug. The middle term is the load balancer —
 * once the newest siblings have picked up links, older ones start winning the
 * slot. Iterating in slug order (not date order) keeps the whole thing
 * deterministic, so an unrelated content change doesn't churn every post page.
 *
 * Posts whose categories nothing else shares fall back to the most recent posts.
 * That is weaker than a real topical match, but a dead end is worse, and it
 * guarantees every post is reachable from somewhere other than the date chain.
 */
export function buildRelatedMap(
  all: CollectionEntry<'blog'>[],
  limit: number = RELATED_POST_LIMIT
): Map<string, RelatedPost[]> {
  const inbound = new Map<string, number>(all.map((p) => [p.slug, 0]));
  const byRecency = [...all].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.slug.localeCompare(b.slug)
  );
  const result = new Map<string, RelatedPost[]>();

  for (const current of [...all].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const categories = new Set(current.data.categories ?? []);

    const scored = all
      .filter((post) => post.slug !== current.slug)
      .map((post) => ({
        post,
        shared: (post.data.categories ?? []).filter((c) => categories.has(c)).length,
      }))
      .filter(({ shared }) => shared > 0);

    scored.sort((a, b) => {
      if (b.shared !== a.shared) return b.shared - a.shared;
      const byInbound = (inbound.get(a.post.slug) ?? 0) - (inbound.get(b.post.slug) ?? 0);
      if (byInbound !== 0) return byInbound;
      const byDate = b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf();
      if (byDate !== 0) return byDate;
      return a.post.slug.localeCompare(b.post.slug);
    });

    const chosen = scored.slice(0, limit).map(({ post }) => post);

    // Nothing shares a category — better to offer recent writing than a dead end.
    if (chosen.length === 0) {
      chosen.push(...byRecency.filter((p) => p.slug !== current.slug).slice(0, limit));
    }

    for (const post of chosen) inbound.set(post.slug, (inbound.get(post.slug) ?? 0) + 1);

    result.set(current.slug, chosen.map(toRelated));
  }

  // Coverage pass. Balancing shares links out among a post's category siblings,
  // but a post whose category nothing else uses — /in-appreciation-of-the-internet/
  // is the only post tagged Life — never enters anyone's candidate list, so it
  // stays unreachable no matter how the ranking is tuned. Place each such post
  // on its nearest neighbour by date, which is the mildest available host for
  // something that has no topical peer, and the only claim this makes is the one
  // that matters: no post is a dead end.
  const uncovered = all
    .filter((post) => (inbound.get(post.slug) ?? 0) === 0)
    .sort((a, b) => a.slug.localeCompare(b.slug));

  for (const post of uncovered) {
    const host = all
      .filter((candidate) => candidate.slug !== post.slug)
      .sort(
        (a, b) =>
          Math.abs(a.data.pubDate.valueOf() - post.data.pubDate.valueOf()) -
            Math.abs(b.data.pubDate.valueOf() - post.data.pubDate.valueOf()) ||
          a.slug.localeCompare(b.slug)
      )[0];
    if (!host) continue;

    const list = result.get(host.slug) ?? [];
    result.set(host.slug, [...list.slice(0, limit - 1), toRelated(post)]);
    inbound.set(post.slug, (inbound.get(post.slug) ?? 0) + 1);
  }

  return result;
}

function toRelated(post: CollectionEntry<'blog'>): RelatedPost {
  return {
    slug: post.slug,
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.pubDate,
  };
}
