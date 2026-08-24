import { test, expect } from "@playwright/test";
import { buildRelatedMap } from "../src/utils/related";

// Unit tests for the related-reading ranking. No browser: these call
// buildRelatedMap on synthetic posts, so a ranking regression fails in
// milliseconds and names the rule it broke, instead of surfacing as "some
// page's links changed" after a rebuild. They still run under the Playwright
// config, whose preview server needs a build to exist (`npm run test`, or
// `test:quick` after a build).
//
// The design (see the comment in src/utils/related.ts): the first two slots
// are the best topical matches, full stop; the third slot goes to a topical
// match that few other pages link to. Never pad with unrelated posts.

const post = (slug: string, categories: string[], date = "2026-01-01") =>
  ({ slug, data: { title: slug, description: `about ${slug}`, pubDate: new Date(date), categories } }) as any;

const slugs = (map: Map<string, { slug: string }[]>, slug: string) => (map.get(slug) ?? []).map((p) => p.slug);

test.describe("related reading ranking", () => {
  test("a rarer shared category outranks a common one, even against a newer post", () => {
    // "Rare" is on 2 of 6 posts; "Common" is on 5 of 6. Sharing Rare says more.
    const map = buildRelatedMap([
      post("a", ["Rare", "Common"]),
      post("b", ["Rare"], "2020-01-01"),
      post("c", ["Common"], "2026-06-01"),
      post("d", ["Common"], "2026-05-01"),
      post("e", ["Common"], "2026-04-01"),
      post("f", ["Common"], "2026-03-01"),
    ]);
    expect(slugs(map, "a")[0]).toBe("b");
  });

  test("the first slot is always the best match, no matter how many links it already has", () => {
    // Every q shares a two-post category with the hub and only a six-post
    // category with the other q's, so the hub is each q's strongest match.
    // A ranking that spreads links around would stop picking the hub once
    // it had "enough" inbound links.
    const posts = [post("hub", ["U1", "U2", "U3", "U4", "U5", "U6"])];
    for (let i = 1; i <= 6; i++) posts.push(post(`q${i}`, [`U${i}`, "Common"], `2026-0${i}-01`));
    const map = buildRelatedMap(posts);
    for (let i = 1; i <= 6; i++) expect(slugs(map, `q${i}`)[0], `q${i}`).toBe("hub");
  });

  test("the third slot goes to the topical match with the fewest inbound links", () => {
    // Everyone shares X. a and b also share R, so they are each other's
    // strongest match. Newest first: a, b, c, d, e, f.
    //
    // Slots 1–2 by relevance: c, d, e, f each pick a and b; a and b pick each
    // other plus c (newest of the rest). So going into slot 3, d/e/f have no
    // inbound links and c has two. a's third slot takes d, b's takes e; when
    // c chooses, f is the only remaining sharer with zero inbound links.
    const map = buildRelatedMap([
      post("a", ["X", "R"], "2026-01-01"),
      post("b", ["X", "R"], "2025-12-01"),
      post("c", ["X"], "2025-11-01"),
      post("d", ["X"], "2025-10-01"),
      post("e", ["X"], "2025-09-01"),
      post("f", ["X"], "2025-08-01"),
    ]);
    expect(slugs(map, "c")).toEqual(["a", "b", "f"]);
  });

  test("shows fewer than three when fewer posts share a category, and nothing when none do", () => {
    const map = buildRelatedMap([post("a", ["X"]), post("b", ["X"]), post("c", ["Y"])]);
    expect(slugs(map, "a")).toEqual(["b"]);
    expect(slugs(map, "b")).toEqual(["a"]);
    expect(slugs(map, "c")).toEqual([]);
  });
});
