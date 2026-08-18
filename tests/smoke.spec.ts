import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { BUTTONDOWN_USERNAME, LATEST_COUNT } from "../src/config";

// Dynamically read blog posts from content directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const contentDir = join(__dirname, "../src/content/blog");

// Function to check if a post is a draft by reading its frontmatter
function isDraft(filename: string): boolean {
  const filePath = join(contentDir, filename);
  const content = readFileSync(filePath, 'utf-8');

  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return false;

  const frontmatter = frontmatterMatch[1];
  // Check for draft: true
  return /draft:\s*true/i.test(frontmatter);
}

const blogPostFiles = readdirSync(contentDir)
  .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));

// All blog posts (including drafts)
const allBlogPosts = blogPostFiles
  .map((file) => file.replace(/\.(md|mdx)$/, "").toLowerCase());

// Published posts only (excluding drafts)
const publishedPosts = blogPostFiles
  .filter((file) => !isDraft(file))
  .map((file) => file.replace(/\.(md|mdx)$/, "").toLowerCase());

// Read a post's pubDate (epoch ms) from frontmatter.
function getPubDate(filename: string): number {
  const content = readFileSync(join(contentDir, filename), "utf-8");
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[1] : "";
  const dateMatch = frontmatter.match(/pubDate:\s*['"]?(\d{4}-\d{2}-\d{2})/);
  return dateMatch ? new Date(dateMatch[1]).valueOf() : 0;
}

// Derive the chronological edges so the navigation edge-case tests don't drift
// as posts are added. Mirrors the site's sort in src/pages/[...slug].astro:
// ascending by pubDate, tie-broken by slug.localeCompare.
const sortedPublished = blogPostFiles
  .filter((file) => !isDraft(file))
  .map((file) => ({
    slug: file.replace(/\.(md|mdx)$/, "").toLowerCase(),
    pubDate: getPubDate(file),
  }))
  .sort((a, b) => a.pubDate - b.pubDate || a.slug.localeCompare(b.slug));

const oldestPostSlug = sortedPublished[0].slug;
const newestPostSlug = sortedPublished[sortedPublished.length - 1].slug;

// Homepage shows the latest N published posts (LATEST_COUNT lives in
// src/config.ts, shared with src/pages/index.astro).
const expectedLatestCount = Math.min(LATEST_COUNT, publishedPosts.length);

test.describe("Smoke Tests", () => {
  test("homepage loads and shows latest posts", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    // Check page title
    await expect(page).toHaveTitle(/Aaron Roy/);

    // Check latest section shows the expected number of posts
    // Selector targets article links (excludes "View all" link)
    const latestLinks = page.locator("main article a");
    await expect(latestLinks).toHaveCount(expectedLatestCount);

    // Check navigation exists (in header)
    await expect(page.locator('header a[href="/writing/"]')).toBeVisible();
    await expect(page.locator('header a[href="/about/"]')).toBeVisible();
  });

  test("writing page loads and has posts", async ({ page }) => {
    const response = await page.goto("/writing/");
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/Writing/);

    // Should have at least as many post links as we have published posts
    const postLinks = page.locator('main a[href^="/"]');
    const count = await postLinks.count();
    expect(count).toBeGreaterThanOrEqual(publishedPosts.length);
  });

  test("about page loads", async ({ page }) => {
    const response = await page.goto("/about/");
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/About/);
  });

  test("404 page renders correctly", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist/");
    expect(response?.status()).toBe(404);

    await expect(page.locator("text=Page Not Found")).toBeVisible();
  });

  test("all blog posts load", async ({ page }) => {
    const failures: string[] = [];

    // Only test published posts (drafts should not have routes in production build)
    for (const slug of publishedPosts) {
      const response = await page.goto(`/${slug}/`);
      if (response?.status() !== 200) {
        failures.push(`/${slug}/ returned ${response?.status()}`);
      }
    }

    expect(failures).toEqual([]);
  });

  test("blog posts have required meta tags", async ({ page }) => {
    // Test a sample published post for meta tags
    await page.goto(`/${publishedPosts[0]}/`);

    // Check essential meta tags exist
    const title = await page.locator("title").textContent();
    expect(title).toBeTruthy();
    expect(title).toContain("Aaron Roy");

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /.+/);

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", /aaronroy\.com/);

    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /.+/);
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");

    // Header nav links carry canonical trailing-slash hrefs and click through
    // without a 301 (bare paths 404 under `astro preview` with trailingSlash: 'always').
    await expect(page.locator('header a[href="/writing/"]')).toBeVisible();
    await expect(page.locator('header a[href="/about/"]')).toBeVisible();
    await expect(page.locator('header a[href="/"]')).toBeVisible();

    await page.click('header a[href="/writing/"]');
    await expect(page).toHaveURL(/\/writing\//);
    await expect(page).toHaveTitle(/Writing/);

    expect((await page.goto("/about/"))?.status()).toBe(200);
    await expect(page).toHaveTitle(/About/);

    expect((await page.goto("/"))?.status()).toBe(200);
  });

  test("RSS feed is valid and contains all posts", async ({ page }) => {
    const response = await page.goto("/rss.xml");
    expect(response?.status()).toBe(200);

    // Check content type
    const contentType = response?.headers()["content-type"];
    expect(contentType).toContain("xml");

    // Get raw RSS feed content (not browser-rendered HTML)
    const rssContent = await response?.text();
    expect(rssContent).toBeTruthy();

    // Verify RSS structure
    expect(rssContent).toContain('<rss version="2.0"');
    expect(rssContent).toContain("<channel>");
    expect(rssContent).toContain("<title>Aaron Roy</title>");
    expect(rssContent).toContain("<language>en-us</language>");

    // Count items - should match published post count (drafts excluded)
    const itemMatches = rssContent!.match(/<item>/g);
    expect(itemMatches?.length).toBe(publishedPosts.length);

    // Verify all published posts are included (drafts should not be in RSS)
    for (const slug of publishedPosts) {
      expect(rssContent).toContain(`https://aaronroy.com/${slug}/`);
    }
  });

  test("RSS feed has auto-discovery link", async ({ page }) => {
    await page.goto("/");

    const rssLink = page.locator('link[type="application/rss+xml"]');
    await expect(rssLink).toHaveAttribute("href", "/rss.xml");
    await expect(rssLink).toHaveAttribute("title", /RSS/);
  });

  test("RSS links are visible to users", async ({ page }) => {
    // Check footer link
    await page.goto("/");
    const footerRssLink = page.locator('footer a[href="/rss.xml"]');
    await expect(footerRssLink).toBeVisible();

    // Check writing page link
    await page.goto("/writing/");
    const writingRssLink = page.locator('a[href="/rss.xml"]').first();
    await expect(writingRssLink).toBeVisible();
  });

  test("blog posts display categories with working links", async ({ page }) => {
    // Test post with multiple categories
    await page.goto("/experiments-with-strava-mcp/");

    // Verify categories are displayed
    const categoryLinks = page.locator('header a[href^="/category/"]');
    await expect(categoryLinks).toHaveCount(2); // Bikes, Tutorials

    // Verify category links have correct hrefs (order matches frontmatter: Bikes, Tutorials)
    const firstCategory = categoryLinks.first();
    await expect(firstCategory).toHaveAttribute("href", "/category/bikes/");

    const secondCategory = categoryLinks.nth(1);
    await expect(secondCategory).toHaveAttribute("href", "/category/tutorials/");

    // Verify categories are comma-separated (normalize whitespace)
    const metadataDiv = page.locator('header div.flex.items-center').first();
    const metadataText = await metadataDiv.textContent();
    const normalizedText = metadataText?.replace(/\s+/g, ' ').trim();
    expect(normalizedText).toContain("Bikes, Tutorials");

    // Click through to the category archive (canonical trailing-slash href).
    await firstCategory.click();
    await expect(page).toHaveURL(/\/category\/bikes\//);
    await expect(page.locator("h1")).toContainText("Bikes");
  });

  test("blog posts with single category display correctly", async ({ page }) => {
    // Test post with one category
    await page.goto("/3d-printing-and-guns/");

    const categoryLinks = page.locator('header a[href^="/category/"]');
    await expect(categoryLinks).toHaveCount(1);

    // Verify no trailing comma
    const metadataDiv = page.locator('header div.flex.items-center').first();
    const metadataText = await metadataDiv.textContent();
    expect(metadataText).toMatch(/3D Printing[^,]/); // No comma after single category
  });

  test("blog posts handle category URL slugification correctly", async ({ page }) => {
    // Test that "Student Loans" becomes "student-loans"
    await page.goto("/lessons-learned-refinancing-student-loan-debt/");

    const categoryLink = page.locator('header a[href^="/category/"]').first();
    await expect(categoryLink).toHaveAttribute("href", "/category/student-loans/");

    // Verify link text remains human-readable
    await expect(categoryLink).toHaveText("Student Loans");

    // Test that 3D Printing becomes "3d-printing"
    await page.goto("/3d-printing-and-guns/");
    const threeDLink = page.locator('header a[href^="/category/"]').first();
    await expect(threeDLink).toHaveAttribute("href", "/category/3d-printing/");
  });

  test("category links use consistent styling", async ({ page }) => {
    await page.goto("/experiments-with-strava-mcp/");

    const categoryLink = page.locator('header a[href^="/category/"]').first();

    // Verify Tailwind classes are applied
    await expect(categoryLink).toHaveClass(/hover:text-blue-600/);
    await expect(categoryLink).toHaveClass(/transition-colors/);
  });

  test("post navigation shows both older and newer on mid-archive post", async ({ page }) => {
    await page.goto("/unlocking-revenue-with-product-led-growth/");

    const nav = page.locator('nav[aria-label="Post navigation"]');
    await expect(nav).toBeVisible();

    // Should show both OLDER and NEWER labels
    await expect(nav.getByText("Older")).toBeVisible();
    await expect(nav.getByText("Newer")).toBeVisible();

    // Should have VIEW ARCHIVE link pointing to /writing/
    const archiveLink = nav.locator('a[href="/writing/"]');
    await expect(archiveLink).toBeVisible();

    // Should have two post title links
    const postLinks = nav.locator('a[href^="/"]:not([href="/writing/"])');
    const count = await postLinks.count();
    expect(count).toBe(2);
  });

  test("post navigation shows only newer on oldest post", async ({ page }) => {
    await page.goto(`/${oldestPostSlug}/`);

    const nav = page.locator('nav[aria-label="Post navigation"]');
    await expect(nav).toBeVisible();

    // Should show NEWER but not OLDER
    await expect(nav.getByText("Newer")).toBeVisible();
    await expect(nav.getByText("Older")).not.toBeVisible();
  });

  test("post navigation shows only older on newest post", async ({ page }) => {
    await page.goto(`/${newestPostSlug}/`);

    const nav = page.locator('nav[aria-label="Post navigation"]');
    await expect(nav).toBeVisible();

    // Should show OLDER but not NEWER
    await expect(nav.getByText("Older")).toBeVisible();
    await expect(nav.getByText("Newer")).not.toBeVisible();
  });

  test("post navigation links point to valid post slugs", async ({ page }) => {
    await page.goto("/unlocking-revenue-with-product-led-growth/");

    const nav = page.locator('nav[aria-label="Post navigation"]');
    const postLinks = nav.locator('a[href^="/"]:not([href="/writing/"])');

    const count = await postLinks.count();
    for (let i = 0; i < count; i++) {
      const href = await postLinks.nth(i).getAttribute("href");
      const slug = href?.replace(/^\//, "").replace(/\/$/, "");
      expect(publishedPosts).toContain(slug);
    }
  });
});

// Crawler-facing files are easy to break silently: they have no visible UI, so
// a bad link or missing file only fails for the bots they exist to serve.
test.describe("Crawler files", () => {
  test("robots.txt is served and points to the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("Sitemap: https://aaronroy.com/sitemap-index.xml");
  });

  test("sitemap exists and lists real pages", async ({ request }) => {
    const index = await request.get("/sitemap-index.xml");
    expect(index.status()).toBe(200);

    // The index references the actual sitemap file(s); fetch each one.
    const indexBody = await index.text();
    const sitemapPaths = [...indexBody.matchAll(/<loc>https:\/\/aaronroy\.com(\/[^<]+)<\/loc>/g)]
      .map((m) => m[1]);
    expect(sitemapPaths.length).toBeGreaterThan(0);

    for (const path of sitemapPaths) {
      const sitemap = await request.get(path);
      expect(sitemap.status(), `sitemap ${path}`).toBe(200);
      const body = await sitemap.text();
      expect(body).toContain("https://aaronroy.com/about/");
    }
  });

  // <lastmod> is the only signal telling Google a URL is worth re-crawling. It's
  // generated from frontmatter in astro.config.mjs, and every way that generation
  // has broken so far was silent: the sitemap still validated, it just carried
  // wrong or missing dates. These assertions are what make that loud.
  test("every published post in the sitemap has a lastmod matching its frontmatter", async ({
    request,
  }) => {
    const sitemap = await request.get("/sitemap-0.xml");
    expect(sitemap.status()).toBe(200);
    const body = await sitemap.text();

    const lastmodByUrl = new Map<string, string>();
    for (const block of body.match(/<url>[\s\S]*?<\/url>/g) ?? []) {
      const url = block.match(/<loc>(.*?)<\/loc>/)?.[1];
      const lastmod = block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1];
      if (url) lastmodByUrl.set(url, lastmod ?? "");
    }
    expect(lastmodByUrl.size).toBeGreaterThan(0);

    const failures: string[] = [];
    for (const file of blogPostFiles.filter((f) => !isDraft(f))) {
      const slug = file.replace(/\.(md|mdx)$/, "").toLowerCase();
      const url = `https://aaronroy.com/${slug}/`;
      const actual = lastmodByUrl.get(url);

      if (actual === undefined) {
        failures.push(`${url} — absent from sitemap`);
        continue;
      }
      if (!actual) {
        failures.push(`${url} — no <lastmod>`);
        continue;
      }
      // Expected date is updatedDate when present, else pubDate.
      const frontmatter = readFileSync(join(contentDir, file), "utf-8").match(
        /^---\n([\s\S]*?)\n---/,
      )?.[1] ?? "";
      const expected = (
        frontmatter.match(/updatedDate:\s*['"]?(\d{4}-\d{2}-\d{2})/) ??
        frontmatter.match(/pubDate:\s*['"]?(\d{4}-\d{2}-\d{2})/)
      )?.[1];
      if (expected && !actual.startsWith(expected)) {
        failures.push(`${url} — lastmod ${actual.slice(0, 10)}, frontmatter says ${expected}`);
      }
    }
    expect(failures, `sitemap lastmod problems:\n${failures.join("\n")}`).toEqual([]);
  });

  test("no sitemap lastmod is in the future", async ({ request }) => {
    // A future lastmod is worse than none — Google discounts it, and because the
    // listing pages take the newest post date, one typo'd year poisons the
    // homepage too. This caught a real bug when pubDate was mistyped as 2036.
    const body = await (await request.get("/sitemap-0.xml")).text();
    const tomorrow = Date.now() + 24 * 60 * 60 * 1000;

    const future = [...body.matchAll(/<url>[\s\S]*?<\/url>/g)]
      .map((m) => ({
        url: m[0].match(/<loc>(.*?)<\/loc>/)?.[1] ?? "",
        lastmod: m[0].match(/<lastmod>(.*?)<\/lastmod>/)?.[1],
      }))
      .filter((e) => e.lastmod && new Date(e.lastmod).valueOf() > tomorrow)
      .map((e) => `${e.url} → ${e.lastmod}`);

    expect(future, `future lastmod values:\n${future.join("\n")}`).toEqual([]);
  });

  test("robots.txt blocks the legacy crawl trap for every user-agent group", async ({
    request,
  }) => {
    // robots.txt is most-specific-user-agent-wins: a named User-agent group
    // overrides the `*` group entirely instead of merging with it. The AI-crawler
    // block silently exempted Bingbot and every AI crawler from these rules until
    // 2026-08-08. Splitting a vendor back out into its own group would reopen the
    // trap with nothing else failing, so assert per-group rather than file-wide.
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();

    const REQUIRED = ["/*?lid=", "/*&lid=", "/*_page=", "/*elementor_"];

    // Split into groups: consecutive User-agent lines, then that group's rules.
    const groups: { agents: string[]; rules: string[] }[] = [];
    for (const raw of body.split("\n")) {
      const line = raw.replace(/#.*$/, "").trim();
      if (!line) continue;
      const [key, ...rest] = line.split(":");
      const value = rest.join(":").trim();
      if (/^user-agent$/i.test(key)) {
        const last = groups[groups.length - 1];
        if (last && last.rules.length === 0) last.agents.push(value);
        else groups.push({ agents: [value], rules: [] });
      } else if (/^disallow$/i.test(key) && groups.length > 0) {
        groups[groups.length - 1].rules.push(value);
      }
    }
    expect(groups.length).toBeGreaterThan(0);

    const failures = groups
      .filter((g) => REQUIRED.some((rule) => !g.rules.includes(rule)))
      .map((g) => `[${g.agents.join(", ")}] missing: ${REQUIRED.filter((r) => !g.rules.includes(r)).join(", ")}`);

    expect(failures, `user-agent groups not covered by the crawl-trap rules:\n${failures.join("\n")}`)
      .toEqual([]);
  });

  test("every internal link in llms.txt resolves without a redirect", async ({ request }) => {
    // llms.txt is hand-curated, so its links rot silently as categories are
    // renamed or posts move. Check each one directly (no redirect-following:
    // a 301 here means a stale URL that should be updated at the source).
    const served = await request.get("/llms.txt");
    expect(served.status()).toBe(200);

    const body = await served.text();
    const internalPaths = [...body.matchAll(/https:\/\/aaronroy\.com(\/[^\s)]*)/g)]
      .map((m) => m[1]);
    expect(internalPaths.length).toBeGreaterThan(0);

    const failures: string[] = [];
    for (const path of internalPaths) {
      const response = await request.get(path, { maxRedirects: 0 });
      if (response.status() !== 200) {
        failures.push(`${path} → ${response.status()}`);
      }
    }
    expect(failures, `stale llms.txt links:\n${failures.join("\n")}`).toEqual([]);
  });
});

test.describe("Email notify form", () => {
  // Form action is built from the shared config value — see src/config.ts.
  const buttondownAction = `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`;

  test("renders on blog posts with the Buttondown action", async ({ page }) => {
    await page.goto(`/${publishedPosts[0]}/`);

    const form = page.locator(`form[action="${buttondownAction}"]`);
    await expect(form).toBeVisible();
    await expect(form.locator('input[type="email"]')).toBeVisible();
    await expect(form.getByRole("button", { name: "Notify me" })).toBeVisible();
  });

  test("renders on the about page", async ({ page }) => {
    // Spec amendment 2026-07-24: about-page visitors are high-intent, so the
    // form renders there too (originally posts-only).
    await page.goto("/about/");

    const form = page.locator(`form[action="${buttondownAction}"]`);
    await expect(form).toBeVisible();
  });

  test("does not render on the homepage or archive pages", async ({ page }) => {
    // No sitewide footer, no homepage presence — posts and about only.
    for (const path of ["/", "/writing/", "/categories/"]) {
      await page.goto(path);
      await expect(page.locator(`form[action="${buttondownAction}"]`)).toHaveCount(0);
    }
  });
});

test.describe("Subscribe flow pages", () => {
  // Landing pages for Buttondown's post-subscribe redirects (Settings →
  // Subscribing → Redirects), so readers return to the site instead of
  // stranding on Buttondown's page after submitting the email form.

  test("subscribed page tells the reader to confirm by email", async ({ page }) => {
    const response = await page.goto("/subscribed/");
    expect(response?.status()).toBe(200);

    await expect(page.locator("main")).toContainText(/check your email/i);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("confirmed page confirms the subscription", async ({ page }) => {
    const response = await page.goto("/confirmed/");
    expect(response?.status()).toBe(200);

    await expect(page.locator("main")).toContainText(/on the list/i);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("subscribe flow pages stay out of the sitemap", async ({ request }) => {
    // noindex pages listed in the sitemap send crawlers mixed signals.
    const index = await request.get("/sitemap-index.xml");
    const indexBody = await index.text();
    const sitemapPaths = [...indexBody.matchAll(/<loc>https:\/\/aaronroy\.com(\/[^<]+)<\/loc>/g)]
      .map((m) => m[1]);

    for (const path of sitemapPaths) {
      const body = await (await request.get(path)).text();
      expect(body).not.toContain("https://aaronroy.com/subscribed/");
      expect(body).not.toContain("https://aaronroy.com/confirmed/");
    }
  });
});

test.describe("category archive indexability", () => {
  // GSC reported "Crawled – currently not indexed" on thin category archives
  // (2026-08-16). Google is right — an archive is a list of titles whose content
  // lives on the posts it links to. These tests lock in the two behaviours that
  // must agree, both driven off INDEXABLE_CATEGORIES in src/utils/seo-categories.mjs.

  test("thin category archives are noindex", async ({ page }) => {
    const response = await page.goto("/category/wami/");
    expect(response?.status()).toBe(200);

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("indexable category archives are not noindex", async ({ page }) => {
    const response = await page.goto("/category/agents/");
    expect(response?.status()).toBe(200);

    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  });

  test("noindex categories stay out of the sitemap", async ({ request }) => {
    // A page that is noindex but still listed sends crawlers mixed signals —
    // the exact contradiction this change exists to remove.
    const index = await request.get("/sitemap-index.xml");
    const sitemapPaths = [
      ...(await index.text()).matchAll(/<loc>https:\/\/aaronroy\.com(\/[^<]+)<\/loc>/g),
    ].map((m) => m[1]);

    const listed: string[] = [];
    for (const path of sitemapPaths) {
      const body = await (await request.get(path)).text();
      for (const [, slug] of body.matchAll(
        /<loc>https:\/\/aaronroy\.com\/category\/([^/]+)\/<\/loc>/g
      )) {
        listed.push(slug);
      }
    }

    // Guard against passing vacuously: a filter that dropped everything, or a
    // regex that matched nothing, would otherwise look like a pass.
    expect(listed.sort()).toEqual([
      "3d-printing",
      "agents",
      "bikes",
      "product",
      "projects",
      "startups",
      "tutorials",
    ]);

    for (const slug of listed) {
      const body = await (await request.get(`/category/${slug}/`)).text();
      expect(body, `/category/${slug}/ is in the sitemap but noindex`).not.toContain("noindex");
    }
  });

  test("llms.txt only recommends categories we let Google index", async ({ request }) => {
    // llms.txt's "Browse by topic" list is the curated source of truth for which
    // topics are worth surfacing, and INDEXABLE_CATEGORIES mirrors it by hand.
    // Nothing else enforces that: the llms.txt link test only checks the URLs
    // resolve, which they still do when a page is noindex. Without this test the
    // two drift silently, and the site ends up telling AI crawlers to browse
    // topics it tells search crawlers not to index.
    const llms = await (await request.get("/llms.txt")).text();
    const recommended = [
      ...llms.matchAll(/https:\/\/aaronroy\.com\/category\/([^/]+)\//g),
    ].map((m) => m[1]);

    expect(recommended.length).toBeGreaterThan(0);
    for (const slug of recommended) {
      const body = await (await request.get(`/category/${slug}/`)).text();
      expect(body, `llms.txt recommends /category/${slug}/ but it is noindex`).not.toContain(
        "noindex"
      );
    }
  });

  test("posts in a noindex category are still indexable", async ({ page }) => {
    // Noindexing an archive must never leak onto the posts it lists — that is
    // the one way this change could do real damage. This post's only category
    // (student-loans) is noindex, so it exercises the leak path directly.
    const response = await page.goto("/lessons-learned-refinancing-student-loan-debt/");
    expect(response?.status()).toBe(200);

    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  });
});
