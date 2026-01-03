import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

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

// Import highlights from source of truth
import { highlights } from "../src/data/highlights";

test.describe("Smoke Tests", () => {
  test("homepage loads and has highlights", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    // Check page title
    await expect(page).toHaveTitle(/Aaron Roy/);

    // Check highlights section exists with correct number of posts
    // Selector targets article links (excludes "View all" link)
    const highlightLinks = page.locator("main article a");
    await expect(highlightLinks).toHaveCount(highlights.length);

    // Check navigation exists (in header)
    await expect(page.locator('header a[href="/writing"]')).toBeVisible();
    await expect(page.locator('header a[href="/about"]')).toBeVisible();
  });

  test("writing page loads and has posts", async ({ page }) => {
    const response = await page.goto("/writing");
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/Writing/);

    // Should have at least as many post links as we have published posts
    const postLinks = page.locator('main a[href^="/"]');
    const count = await postLinks.count();
    expect(count).toBeGreaterThanOrEqual(publishedPosts.length);
  });

  test("about page loads", async ({ page }) => {
    const response = await page.goto("/about");
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/About/);
  });

  test("404 page renders correctly", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);

    await expect(page.locator("text=Page Not Found")).toBeVisible();
  });

  test("all blog posts load", async ({ page }) => {
    const failures: string[] = [];

    // Only test published posts (drafts should not have routes in production build)
    for (const slug of publishedPosts) {
      const response = await page.goto(`/${slug}`);
      if (response?.status() !== 200) {
        failures.push(`/${slug} returned ${response?.status()}`);
      }
    }

    expect(failures).toEqual([]);
  });

  test("blog posts have required meta tags", async ({ page }) => {
    // Test a sample published post for meta tags
    await page.goto(`/${publishedPosts[0]}`);

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

    // Click writing link
    await page.click('a[href="/writing"]');
    await expect(page).toHaveURL(/\/writing/);

    // Click about link
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL(/\/about/);

    // Click home link (site title)
    await page.click('header a[href="/"]');
    await expect(page).toHaveURL(/\/$/);
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
    await page.goto("/writing");
    const writingRssLink = page.locator('a[href="/rss.xml"]').first();
    await expect(writingRssLink).toBeVisible();
  });
});
