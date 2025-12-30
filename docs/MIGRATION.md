# WordPress Migration Guide

This guide covers migrating content from WordPress to this Astro-based blog. The site was originally migrated from WordPress in October 2025, and these tools remain available for future content imports.

## Migration Scripts

Three utility scripts are available in the `scripts/` directory:

- **`migrate-wordpress.js`** - Main migration tool (HTML to Markdown conversion)
- **`update-yoast-descriptions.js`** - Extract Yoast SEO meta descriptions
- **`count-categories.js`** - Analyze category usage across posts

## Prerequisites

### 1. Export WordPress Content

1. Go to WordPress Admin → Tools → Export
2. Select "All content"
3. Download the XML file (usually named `wordpress-export.xml`)

### 2. Install Dependencies

```bash
npm install
```

The migration scripts use:
- `xml2js` - Parse WordPress XML export
- `turndown` - Convert HTML to Markdown
- `axios` - Download images
- `cheerio` - HTML parsing and manipulation

## Main Migration: migrate-wordpress.js

### Usage

```bash
node scripts/migrate-wordpress.js /path/to/wordpress-export.xml
```

### What It Does

1. **Parses WordPress XML export**
   - Extracts posts, pages, and metadata
   - Filters out drafts and non-published content

2. **Converts HTML to Markdown**
   - Uses Turndown library for HTML → Markdown conversion
   - Preserves formatting (headings, lists, links, code blocks)
   - Handles WordPress shortcodes and embeds

3. **Downloads Images**
   - Scans content for image URLs
   - Downloads images to `public/images/`
   - Uses slug-based naming (e.g., `post-slug/image.jpg`)
   - Updates image paths in Markdown

4. **Creates Frontmatter**
   - `title` - Post title
   - `description` - Auto-generated excerpt (first 155 characters)
   - `pubDate` - Original publication date
   - `categories` - WordPress categories array
   - `heroImage` - Featured image (if set in WordPress)

5. **Preserves URL Structure**
   - Maintains WordPress slug format
   - Ensures SEO continuity with 1:1 URL mapping
   - Example: `wordpress.com/my-post` → `newsite.com/my-post`

6. **Outputs Markdown Files**
   - Creates `.md` files in `src/content/blog/`
   - Filenames match WordPress slugs

### Example Output

**Input:** WordPress post with slug `building-products-age-of-ai`

**Output:** `src/content/blog/building-products-age-of-ai.md`

```markdown
---
title: "Building Products in the Age of AI"
description: "How AI is transforming product management and enabling non-technical builders..."
pubDate: 2025-01-15
categories: ["Product Management", "AI"]
heroImage: "/images/building-products-age-of-ai/hero.jpg"
---

Your converted Markdown content here...
```

## Enhancing SEO: update-yoast-descriptions.js

WordPress users often have hand-crafted SEO descriptions via Yoast SEO plugin. These are superior to auto-generated excerpts but stored separately in WordPress postmeta.

### Usage

```bash
node scripts/update-yoast-descriptions.js /path/to/wordpress-export.xml
```

### What It Does

1. Extracts `_yoast_wpseo_metadesc` values from WordPress XML
2. Matches descriptions to posts by slug
3. Updates `description` field in existing blog post frontmatter
4. Preserves all other frontmatter fields

### When to Use

Run this **after** the main migration if:
- You used Yoast SEO plugin in WordPress
- Your posts have custom meta descriptions
- You want optimal SEO descriptions (vs auto-generated excerpts)

## Content Analysis: count-categories.js

Useful for auditing your content after migration.

### Usage

```bash
node scripts/count-categories.js
```

### Output

```
Category Breakdown:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Product Management (12 posts):
  - Building Products in the Age of AI
  - Making Product Decisions Under Uncertainty
  - ...

Startups (8 posts):
  - Lessons from My First Failed Startup
  - ...

Total: 15 unique categories across 29 posts
```

### Use Cases

- Identify popular topics
- Find underutilized categories
- Plan content strategy
- Clean up category taxonomy

## Post-Migration Steps

### 1. Review Generated Files

```bash
ls -la src/content/blog/
```

Check that:
- All expected posts are present
- Filenames match WordPress slugs
- No encoding issues in titles

### 2. Verify Images

```bash
ls -la public/images/
```

Ensure:
- Images downloaded successfully
- Organized by post slug (optional)
- No broken image links in content

### 3. Test Frontmatter

Build the site and check for schema validation errors:

```bash
npm run build
```

Astro content collections will report any frontmatter issues.

### 4. URL Mapping Verification

Compare WordPress URLs to new site URLs:

**WordPress:**
```
example.com/my-first-post
example.com/another-article
```

**Astro (should match exactly):**
```
newsite.com/my-first-post
newsite.com/another-article
```

Use `[...slug].astro` catch-all route to match WordPress structure.

### 5. Manual Review

Some content may need manual cleanup:

- **Code blocks** - Verify syntax highlighting works
- **Embeds** - Twitter/YouTube embeds may need MDX components
- **Shortcodes** - WordPress plugins don't translate automatically
- **Tables** - May need formatting adjustments
- **Special characters** - Check for encoding issues (curly quotes, em dashes)

### 6. Update Internal Links

If you had internal links in WordPress content:

```bash
# Search for old domain references
grep -r "oldsite.com" src/content/blog/
```

Replace with new domain or relative paths.

## Common Issues

### Images Not Downloading

**Symptoms:** Script completes but `public/images/` is empty

**Causes:**
- WordPress site requires authentication
- Image URLs are relative (not absolute)
- Firewall blocking automated downloads

**Solutions:**
- Manually download images before migration
- Update script to use authenticated requests
- Use VPN or different network

### Encoding Problems

**Symptoms:** Weird characters in output (`â€™` instead of `'`)

**Causes:**
- WordPress export uses different character encoding

**Solutions:**
```javascript
// In migrate-wordpress.js, ensure UTF-8 encoding
fs.readFileSync(xmlPath, 'utf-8')
```

### Missing Categories

**Symptoms:** Some posts have empty categories array

**Causes:**
- Posts weren't categorized in WordPress
- Category taxonomy not exported

**Solutions:**
- Add default category in script
- Manually categorize after migration

### Broken Markdown Formatting

**Symptoms:** Lists, headers, or formatting looks wrong

**Causes:**
- Complex HTML that Turndown can't parse
- Nested shortcodes or custom WordPress markup

**Solutions:**
- Review and manually fix affected posts
- Add custom Turndown rules for specific HTML patterns
- Use MDX for complex content

## Advanced Customization

### Custom Turndown Rules

Edit `migrate-wordpress.js` to add custom HTML → Markdown conversions:

```javascript
const turndownService = new TurndownService();

// Custom rule for WordPress gallery shortcode
turndownService.addRule('gallery', {
  filter: function (node) {
    return node.classList.contains('gallery');
  },
  replacement: function (content) {
    return '\n<!-- Gallery -->\n' + content + '\n';
  }
});
```

### Filtering Posts

Only migrate posts from specific categories:

```javascript
const posts = items.filter(item => {
  const cats = item.category || [];
  return cats.some(c => c.$.nicename === 'product-management');
});
```

### Custom Frontmatter Fields

Add additional metadata to frontmatter:

```javascript
const frontmatter = {
  title: post.title[0],
  description: description,
  pubDate: new Date(post.pubDate[0]),
  categories: categories,
  author: post['dc:creator'][0], // Add author field
  tags: extractTags(post), // Add tags
};
```

## Migration Checklist

- [ ] Export WordPress content as XML
- [ ] Run `migrate-wordpress.js` script
- [ ] Run `update-yoast-descriptions.js` for SEO descriptions (if applicable)
- [ ] Verify all posts migrated (`ls src/content/blog/`)
- [ ] Check images downloaded (`ls public/images/`)
- [ ] Run `npm run build` to validate frontmatter
- [ ] Test URLs match WordPress structure exactly
- [ ] Review first 3-5 posts for formatting issues
- [ ] Run `count-categories.js` to audit content
- [ ] Update internal links to new domain
- [ ] Test all images display correctly
- [ ] Verify code blocks have proper syntax highlighting
- [ ] Check for special character encoding issues
- [ ] Configure 301 redirects from old domain (if applicable)
- [ ] Submit sitemap to Google Search Console

## SEO Preservation

To maintain search rankings after migration:

1. **Preserve URL structure** - Keep slugs identical
2. **Set canonical URLs** - Already configured in `BaseLayout.astro`
3. **Use quality descriptions** - Run Yoast extraction script
4. **Configure redirects** - 301 redirect old domain to new
5. **Submit to Search Console** - File "Change of Address" if changing domains
6. **Monitor crawl errors** - Check for 404s in first 2 weeks

## Support

If you encounter issues:

1. Check the script output for error messages
2. Verify XML export is valid (open in browser/text editor)
3. Test with a small subset of posts first
4. Review the scripts in `scripts/` directory for customization
5. Open an issue on GitHub with error details

---

**Last Updated:** December 2025
**Original Migration Completed:** October 2025
**Posts Migrated:** 29
**Images Migrated:** 54+
