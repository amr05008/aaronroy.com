# Aaron Roy - Personal Blog

A modern, fast static site built with Astro and Tailwind CSS. Live at [aaronroy.com](https://aaronroy.com).

## Tech Stack

- **Astro 5.x** - Static site generator with TypeScript support
- **Tailwind CSS** - Utility-first styling with typography plugin
- **MDX** - Markdown with JSX capabilities
- **Content Collections** - Type-safe content management
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
│   ├── favicon.svg      # Site favicon
│   └── robots.txt       # Search engine directives
├── tests/
│   └── smoke.spec.ts   # Playwright smoke tests
├── scripts/
│   ├── migrate-wordpress.js          # WordPress → Markdown migration
│   ├── update-yoast-descriptions.js  # Extract Yoast SEO descriptions
│   └── count-categories.js           # Content analysis utility
├── src/
│   ├── config.ts        # Site metadata (title, author, social profiles)
│   ├── content/
│   │   ├── blog/        # Blog posts (Markdown/MDX)
│   │   └── config.ts    # Content collections schema
│   ├── data/
│   │   └── highlights.ts # Homepage featured posts
│   ├── layouts/
│   │   ├── BaseLayout.astro   # Base HTML, SEO, Open Graph
│   │   └── BlogPost.astro     # Blog template with JSON-LD
│   ├── pages/
│   │   ├── index.astro        # Homepage
│   │   ├── about.astro        # About page
│   │   ├── writing.astro      # Blog archive
│   │   ├── 404.astro          # Custom 404 page
│   │   └── [...slug].astro    # Dynamic blog post routes
│   └── styles/
│       └── global.css   # Tailwind imports
└── docs/
    └── MIGRATION.md     # WordPress migration guide
```

## Content Management

### Adding New Posts

Create a new `.md` or `.mdx` file in `src/content/blog/`:

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

The alt text serves as the image caption and is important for accessibility and SEO.

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

### Custom Open Graph Images

Create custom 1200×630px images for social sharing (LinkedIn, Twitter, Facebook):

1. Design image at 1200×630px
2. Save to `public/og-images/your-post-name.png`
3. Add to frontmatter:

```yaml
heroImage: "/og-images/your-post-name.png"
```

If no custom image is set, the default fallback (`/images/og-default.png`) will be used.

### Managing Homepage Highlights

The homepage features a curated "Highlights" section. To update featured posts:

1. Edit `src/data/highlights.ts`
2. Update the array of post slugs in your preferred display order
3. Changes hot-reload automatically in dev mode

**Example:**

```typescript
export const highlights = [
  'building-products-age-of-ai',
  'making-migrations-fun-with-claude-code',
  'reflecting-on-cx-2025',
];
```

## Configuration

### Site Metadata (src/config.ts)

Centralized configuration for site-wide metadata:

```typescript
export const SITE = {
  title: 'Aaron Roy',
  description: 'Product manager, writer, and tech enthusiast',
  url: 'https://aaronroy.com',
};

export const AUTHOR = {
  name: 'Aaron Roy',
  legalName: 'Aaron Roy',
  email: 'aaron@aaronroy.com',
  url: 'https://aaronroy.com',
  location: 'Brooklyn, NY',
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
- JSON-LD structured data (author and publisher)
- Social profile links in structured data

### Content Schema (src/content/config.ts)

Content collections are defined with Zod schema validation:

```typescript
const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    categories: z.array(z.string()).optional(),
    heroImage: z.string().optional(),
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

- All pages load (homepage, writing, about, 404)
- All blog posts return 200 status
- Homepage displays correct highlights
- Navigation links work
- Essential meta tags exist (title, description, canonical, OG)

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

No test updates needed. Tests automatically read from `src/content/blog/` and `src/data/highlights.ts`.

## URL Structure

- **Homepage:** `/`
- **Writing archive:** `/writing`
- **Individual posts:** `/{slug}` (matches WordPress structure)
- **About page:** `/about`
- **404 page:** `/404`

URLs are automatically generated from markdown filenames to preserve SEO continuity with WordPress.

## SEO Features

- **Meta descriptions** - All posts have handcrafted SEO descriptions
- **Canonical URLs** - Set on all pages matching WordPress structure
- **Open Graph & Twitter Cards** - Complete social sharing metadata
- **OG Images** - Hybrid system with default fallback + custom per-post images
- **Structured data** - JSON-LD BlogPosting schema with author social profiles
- **Sitemap** - Auto-generated at `/sitemap-index.xml`
- **robots.txt** - Configured with sitemap reference
- **Analytics** - Vercel Analytics (privacy-friendly, no cookie consent needed)

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

See **[docs/MIGRATION.md](docs/MIGRATION.md)** for complete WordPress migration guide including:

- WordPress XML export process
- Running migration scripts
- Image handling and downloads
- SEO description extraction (Yoast)
- Post-migration verification steps
- Common issues and solutions

## License

© 2025 Aaron Roy. All rights reserved.

## Built With

This site was built using [Claude Code](https://www.claude.com/product/claude-code), an AI-powered coding assistant. Source code available at [github.com/amr05008/aaronroy.com](https://github.com/amr05008/aaronroy.com).
