import { test, expect } from "@playwright/test";
import { readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Dynamically read blog posts from content directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const contentDir = join(__dirname, "../src/content/blog");
const blogPosts = readdirSync(contentDir)
  .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
  .map((file) => file.replace(/\.(md|mdx)$/, ""));

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

    // Should have at least as many post links as we have posts
    const postLinks = page.locator('main a[href^="/"]');
    const count = await postLinks.count();
    expect(count).toBeGreaterThanOrEqual(blogPosts.length);
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

    for (const slug of blogPosts) {
      const response = await page.goto(`/${slug}`);
      if (response?.status() !== 200) {
        failures.push(`/${slug} returned ${response?.status()}`);
      }
    }

    expect(failures).toEqual([]);
  });

  test("blog posts have required meta tags", async ({ page }) => {
    // Test a sample post for meta tags
    await page.goto(`/${blogPosts[0]}`);

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
});
