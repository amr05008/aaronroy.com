# ADR 003: Hybrid OG Image System (Default + Custom Override)

**Date**: 2025-10-10
**Status**: Accepted
**Related session**: [2025-10-10-og-images](../sessions/2025-10-10-og-images.md)

## Context

Social sharing (LinkedIn, Twitter, Facebook) requires Open Graph images. Options considered:

1. **No OG images**: Let platforms generate previews (poor UX)
2. **Auto-generated images**: Build-time generation with post titles (complex setup)
3. **Default fallback only**: Single branded image for all pages
4. **Hybrid approach**: Default fallback + optional per-post custom images

## Decision

Use hybrid approach: default branded image at `public/images/og-default.png` with optional override via `heroImage` frontmatter field.

## Rationale

**Why hybrid over alternatives:**

- **Immediate coverage**: Every page has an OG image from day one
- **Future flexibility**: Can add custom images for important posts without changing architecture
- **Low maintenance**: Default handles 90% of cases; custom images only where valuable
- **Simple implementation**: No build-time image generation complexity

**Why not auto-generation:**

- Adds build dependencies (canvas, sharp, puppeteer)
- Generic generated images often look worse than a well-designed default
- Increases build time
- Can be added later if needed

## Implementation

```astro
// src/layouts/BaseLayout.astro
const ogImage = ogImageProp
  ? new URL(ogImageProp, Astro.site).toString()
  : new URL('/images/og-default.png', Astro.site).toString();
```

```markdown
// Blog post frontmatter (optional)
---
heroImage: "/og-images/my-custom-image.png"
---
```

## Image Specifications

- **Dimensions**: 1200×630px (LinkedIn/Facebook/Twitter standard)
- **Default location**: `public/images/og-default.png`
- **Custom location**: `public/og-images/[post-slug].png`
- **Format**: PNG recommended for text clarity

## Consequences

- All pages have OG images (social sharing always shows image preview)
- Custom images require manual creation (1200×630px)
- Default image should be branded but generic enough for any page
- `heroImage` field serves dual purpose (OG image + potential future hero display)
