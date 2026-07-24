# Aaron Roy - Personal Blog

A modern, fast static site built with Astro and Tailwind CSS. Live at [aaronroy.com](https://aaronroy.com).

## Tech Stack

- **Astro 5.x** - Static site generator with TypeScript support
- **Tailwind CSS** - Utility-first styling with typography plugin
- **MDX** - Markdown with JSX capabilities
- **Content Collections** - Type-safe content management
- **Expressive Code** - Enhanced code blocks with syntax highlighting and copy buttons
- **Playwright** - Smoke testing
- **Vercel** - Hosting and analytics

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Run Tests

```bash
# Full test (builds site first)
npm run test

# Quick test (uses existing build)
npm run test:quick
```

## Project Structure

```
/
├── public/
│   ├── images/          # Blog post images
│   ├── og-images/       # Custom Open Graph images
│   ├── zuko_favicon.png # Site favicon
│   ├── robots.txt       # Search engine + AI crawler directives
│   └── llms.txt         # Curated site map for AI tools (AEO)
├── tests/
│   └── smoke.spec.ts   # Playwright smoke tests
├── scripts/
│   ├── count-categories.js           # Content analysis utility
│   └── indexnow-submit.js            # Submit URLs to IndexNow (Bing-family engines)
├── src/
│   ├── config.ts        # Site metadata (title, author, social profiles, LATEST_COUNT)
│   ├── components/
│   │   ├── EmailNotify.astro       # Email-notify form at the bottom of posts (Buttondown)
│   │   ├── PostHogAnalytics.astro  # PostHog analytics (emits nothing without PUBLIC_POSTHOG_KEY)
│   │   └── PostNavigation.astro    # Older/newer post navigation on blog posts
│   ├── content/
│   │   ├── blog/        # Blog posts (Markdown/MDX)
│   │   └── config.ts    # Content collections schema
│   ├── layouts/
│   │   ├── BaseLayout.astro   # Base HTML, SEO, Open Graph
│   │   └── BlogPost.astro     # Blog template with JSON-LD
│   ├── pages/
│   │   ├── index.astro        # Homepage
│   │   ├── about.astro        # About page
│   │   ├── writing.astro      # Blog archive
│   │   ├── categories.astro   # Category listing
│   │   ├── category/[slug].astro  # Category archive pages
│   │   ├── 404.astro          # Custom 404 page
│   │   ├── rss.xml.ts         # Full-content RSS feed
│   │   ├── subscribed.astro   # Buttondown post-subscribe redirect landing (noindex)
│   │   ├── confirmed.astro    # Buttondown post-confirm redirect landing (noindex)
│   │   └── [...slug].astro    # Dynamic blog post routes
│   ├── styles/
│   │   └── global.css   # Tailwind imports + image caption styling
│   └── utils/
│       └── posts.ts     # Post queries (draft filtering) + slugify()
└── docs/
    └── MIGRATION.md     # WordPress migration guide
```

## Content Management

### Adding New Posts

Working with Claude Code? The repo-local `blog-publish` skill
(`.claude/skills/blog-publish/`) scaffolds drafts and runs the full
pre-publish checklist (frontmatter, images, links, llms.txt, tests) before
shipping the post in a single commit.

Manually: create a new `.md` or `.mdx` file in `src/content/blog/`:

```markdown
---
title: "Your Post Title"
description: "Brief SEO description (155 characters max recommended)"
pubDate: 2025-01-15
categories: ["Product Management", "Startups"]
heroImage: "/og-images/your-post.png"  # Optional: Custom OG image for social sharing
---

Your content here...
```

**Frontmatter Fields:**

- **`title`** (required) - Post title, used in page title and meta tags
- **`description`** (required) - SEO meta description, shown in search results
- **`pubDate`** (required) - Publication date (YYYY-MM-DD format)
- **`categories`** (optional) - Array of category strings
- **`heroImage`** (optional) - Path to custom Open Graph image (1200×630px recommended)
- **`updatedDate`** (optional) - Date of last update (YYYY-MM-DD format)
- **`draft`** (optional, default `false`) - Draft posts are visible in `npm run dev` but excluded from production builds, preview, and the RSS feed

### Drafts

Add `draft: true` to frontmatter to work on a post privately. Drafts render at their normal URL in dev mode but return 404 in production/preview builds and never appear in the RSS feed or smoke tests. To publish, remove the field or set it to `false`.

### Editing Existing Posts

Edit the markdown file directly in `src/content/blog/`. If making significant changes, add an `updatedDate` field to frontmatter:

```yaml
updatedDate: 2025-01-20
```

### Adding Images with Captions

Place images in `public/images/` (organized by post slug recommended):

```markdown
![Descriptive caption text](/images/your-post/image-name.jpg)
```

Alt text is for accessibility and SEO. For a visible caption, add an italic line
directly under the image (no blank line between) — `.prose img + em` in
`src/styles/global.css` styles it as a caption (small, gray, centered):

```markdown
![Descriptive alt text](/images/your-post/image-name.jpg)
*Visible caption shown under the image*
```

**Best Practices:**

- Use descriptive, meaningful alt text (not just "image" or "photo")
- Organize images in subdirectories by post slug (e.g., `/images/my-post-slug/`)
- Optimize images before uploading (compress, resize to reasonable dimensions)
- Use web-friendly formats (JPG for photos, PNG for graphics, SVG for logos)
- Recommended max width: 1200px for blog content images

**Example:**

```markdown
![Screenshot of the pmquiz.xyz interface showing question 1](/images/building-products-ai/quiz-interface.png)
```

### Adding Videos

Videos are embedded via YouTube iframes (see any existing post with a video for the pattern — e.g. `reflecting-on-cx-2025.md`). No self-hosted video.

### Adding Code Blocks

Code blocks automatically include a copy button and syntax highlighting powered by Expressive Code.

**Basic usage:**

````markdown
```
Your code here
```
````

**With language-specific syntax highlighting:**

````markdown
```javascript
const greeting = "Hello, world!";
console.log(greeting);
```
````

````markdown
```bash
npm install
npm run dev
```
````

**Features:**
- **Copy button** - Automatically appears on all code blocks
- **Dark theme** - Uses `github-dark` for better readability
- **Syntax highlighting** - Supports 100+ languages when specified
- **Mobile-friendly** - Touch-friendly copy button and horizontal scroll for long lines

**Supported languages:** JavaScript, TypeScript, Python, Bash, Markdown, HTML, CSS, JSON, YAML, and many more. Simply add the language name after the opening triple backticks.

### Custom Open Graph Images

Create custom 1200×630px images for social sharing (LinkedIn, Twitter, Facebook):

1. Design image at 1200×630px
2. Save to `public/og-images/your-post-name.png`
3. Add to frontmatter:

```yaml
heroImage: "/og-images/your-post-name.png"
```

If no custom image is set, the default fallback (`/og-images/aaron-roy-dot-com-og.png`) will be used.

### Homepage Latest Feed

The homepage shows a "Latest" section: the most recent published posts,
newest first, capped at `LATEST_COUNT` (currently 7). It's recency-driven
rather than hand-curated, so new posts surface automatically with no manual
upkeep.

To change how many posts appear, edit `LATEST_COUNT` in `src/config.ts` — the
homepage and the smoke tests both import it.

## Configuration

### Site Metadata (src/config.ts)

Centralized configuration for site-wide metadata (see `src/config.ts` for the full file, including comments):

```typescript
export const LATEST_COUNT = 7; // Homepage "Latest" section cap

export const SITE = {
  title: 'Aaron Roy',
  description: '...',
  url: 'https://aaronroy.com',
  id: 'https://aaronroy.com/#website', // Stable schema.org @id (WebSite entity)
};

export const AUTHOR = {
  name: 'Aaron Roy',
  legalName: 'Aaron Roy',
  email: 'aaron@aaronroy.com',
  url: 'https://aaronroy.com',
  location: 'Brooklyn, NY',
  id: 'https://aaronroy.com/#person', // Stable schema.org @id (Person entity)
  image: '/images/aaron-roy.jpg',     // 1000x1000 headshot for Person schema
  jobTitle: 'Product Director',
  bio: '...',
  affiliations: [{ name: 'Manychat', url: '...' }, { name: 'Wami' }],
  alumniOf: 'University of Connecticut School of Law',
  knowsAbout: ['Product Management', '...'],
  social: {
    twitter: 'https://twitter.com/aaronmroy',
    linkedin: 'https://linkedin.com/in/aaronmichaelroy',
    github: 'https://github.com/amr05008',
  },
};
```

Updating `src/config.ts` automatically applies changes to:

- Page titles and meta descriptions
- Footer copyright notice
- JSON-LD structured data — the `Person` entity on `/about`, the `WebSite` node on the homepage, and author/publisher fields on every blog post all resolve to the single `#person` `@id`
- Social profile links in structured data
- Homepage "Latest" post count (via `LATEST_COUNT`)

### Content Schema (src/content/config.ts)

Content collections are defined with Zod schema validation:

```typescript
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    categories: z.array(z.string()).optional(),
    heroImage: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});
```

### Styling

Global styles use Tailwind CSS configured in `tailwind.config.mjs`:

- **Typography plugin** - Enhanced prose styling for blog content
- **Custom colors** - Can be extended in config
- **Responsive breakpoints** - Default Tailwind breakpoints (sm, md, lg, xl)

## Development Scripts

### Content Analysis

Analyze category usage across all blog posts:

```bash
node scripts/count-categories.js
```

Outputs:
- All categories used in the blog
- Number of posts per category
- Complete list of post titles within each category
- Total count of unique categories

Useful for content auditing and planning.

## Testing

The site uses Playwright for smoke testing. Tests automatically discover blog posts and validate the site works correctly.

### What's Tested

- All pages load (homepage, writing, about, 404) — category archives verified via link click-through
- All blog posts return 200 status
- Homepage displays the latest N posts (capped at `LATEST_COUNT`)
- Navigation links work
- Essential meta tags exist (title, description, canonical, OG)
- Category links on blog posts (display, navigation, URL slugification)
- Older/newer post navigation on blog posts
- RSS feed validity, auto-discovery link, and user-facing RSS links
- Email notify form on posts (correct Buttondown action; absent off-post), and the
  subscribe-flow landing pages (render, noindex, excluded from sitemap)
- Crawler files: robots.txt, sitemap, and every internal llms.txt link resolves

### Running Tests

```bash
# Recommended before deploying
npm run test

# Quick check (skip build)
npm run test:quick
```

### First-Time Setup

Install Playwright browsers once:

```bash
npx playwright install chromium
```

### Adding New Posts

No test updates needed. Tests automatically read from `src/content/blog/`.

## URL Structure

- **Homepage:** `/`
- **Writing archive:** `/writing`
- **Individual posts:** `/{slug}` (matches WordPress structure)
- **About page:** `/about`
- **Categories:** `/categories` and `/category/{slug}`
- **404 page:** `/404`

URLs are automatically generated from markdown filenames to preserve SEO continuity with WordPress.

### Trailing Slashes

The site uses `trailingSlash: 'always'` (in `astro.config.mjs`) for blog SEO. **All internal links must include a trailing slash** (`/writing/`, `/about/`, `/category/product/`) — without one, every click costs a sitewide 301 redirect. Note this also affects the PostHog reverse proxy: wildcard `/zuko/:path*` rewrites do NOT match trailing-slash paths, which is why `vercel.json` uses literal rewrites for each PostHog endpoint.

## SEO Features

- **Meta descriptions** - All posts have handcrafted SEO descriptions
- **Canonical URLs** - Set on all pages matching WordPress structure
- **Open Graph & Twitter Cards** - Complete social sharing metadata; posts use `og:type="article"` with `article:published_time`/`modified_time`/`author`
- **OG Images** - Hybrid system with default fallback + custom per-post images
- **Structured data** - Unified JSON-LD entity graph: `Person`/`ProfilePage` on `/about`, `WebSite` on the homepage, and enriched `BlogPosting` on posts, all referencing one author `@id` (`#person`)
- **Sitemap** - Auto-generated at `/sitemap-index.xml`
- **IndexNow** - Key file in `public/` + `scripts/indexnow-submit.js` for instant URL submission to Bing/Yandex/etc; pinged automatically on publish
- **robots.txt** - Allows all crawlers and explicitly welcomes AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.)
- **llms.txt** - Curated Markdown map of the site for AI tools (Answer Engine Optimization)
- **Analytics** - Vercel Analytics (privacy-friendly, no cookie consent needed) + PostHog for queryable product analytics

### PostHog Analytics

PostHog (`src/components/PostHogAnalytics.astro`) is the queryable analytics layer — referral sources, per-post traffic, time-on-page, link clicks. It's privacy-conscious: anonymous (`identified_only`), no session recording, honors Do Not Track.

Wired via build-time env vars — the component emits nothing when `PUBLIC_POSTHOG_KEY` is unset, so it's safe to deploy without them:

- `PUBLIC_POSTHOG_KEY` — project public key (`phc_…`), set in Vercel (Production + Preview) and local `.env`
- `PUBLIC_POSTHOG_HOST` — optional; defaults to the same-origin reverse-proxy path `/zuko`

**Reverse proxy:** `vercel.json` rewrites `/zuko/*` → PostHog so the browser only talks to `aaronroy.com` (adblock resistance). ⚠️ Because of `trailingSlash: 'always'`, each trailing-slash PostHog endpoint needs a *literal* rewrite (`/zuko/e/`, `/zuko/i/v0/e/`, `/zuko/flags/`, `/zuko/decide/`) — a wildcard `:path*` won't match them and events silently 404. See `.env.example` and CLAUDE.md for details.

## Deployment

### Vercel (Current Hosting)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Vercel auto-detects Astro and configures build settings
4. Deploy!

**Build Settings:**
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Astro (auto-detected)

### Custom Domain

1. Add domain in Vercel dashboard (Settings → Domains)
2. Update DNS records as instructed by Vercel
3. SSL certificate automatically provisioned
4. Both apex (aaronroy.com) and www supported

## Migrating from WordPress

The migration is complete. The one-off scripts and their dependencies were
removed on 2026-07-02 — see **[docs/MIGRATION.md](docs/MIGRATION.md)** for the
historical guide and how to restore the tooling from git history if ever needed.

## License

© 2026 Aaron Roy. All rights reserved.

## Built With

This site was built using [Claude Code](https://www.claude.com/product/claude-code), an AI-powered coding assistant. Source code available at [github.com/amr05008/aaronroy.com](https://github.com/amr05008/aaronroy.com).
