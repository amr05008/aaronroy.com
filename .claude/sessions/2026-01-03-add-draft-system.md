---
date: 2026-01-03
summary: Implemented blog draft system with frontmatter-based filtering
tags: [feature, draft-system, content-management]
---

## Summary
Added a complete draft system allowing blog posts to be worked on locally without exposing them in production. Posts with `draft: true` in frontmatter are visible during `npm run dev` but excluded from production builds.

## Changes

### New Files Created
- **`src/utils/posts.ts`** - Centralized filtering logic with three key functions:
  - `getPublishedPosts()` - Returns all posts in dev, excludes drafts in production
  - `getPostsForRSS()` - Always excludes drafts, even in dev mode
  - `filterDrafts()` - Core filtering function checking `import.meta.env.DEV`
- **`src/content/blog/example-draft-post.md`** - Example draft post for testing and reference

### Schema Updates
- **`src/content/config.ts`** - Added `draft: z.boolean().optional().default(false)` to blog schema

### Query Location Updates (6 files)
All locations now use helper functions instead of direct `getCollection('blog')`:
- **`src/pages/index.astro`** - Homepage highlights
- **`src/pages/writing.astro`** - Writing archive
- **`src/pages/categories.astro`** - Category listing
- **`src/pages/category/[slug].astro`** - Category archive pages
- **`src/pages/[...slug].astro`** - Individual post routing (critical for 404 behavior)
- **`src/pages/rss.xml.ts`** - RSS feed (special handling to exclude drafts in all modes)

### Test Updates
- **`tests/smoke.spec.ts`** - Added frontmatter parsing to detect drafts and filter from test expectations

## Decisions

### Storage Approach
**Decision:** Use same folder (`src/content/blog/`) with `draft: true` frontmatter field

**Rationale:**
- Simpler than separate collections or git branches
- Follows Astro conventions
- Easy to publish (just change one field)
- Backward compatible (defaults to false)

### Visibility Strategy
**Decision:** Drafts visible only in dev mode (`npm run dev`), hidden in all builds

**Rationale:**
- Allows local preview without deployment
- `import.meta.env.DEV` is Astro's standard environment detection
- Prevents accidental exposure in preview or production builds

### RSS Handling
**Decision:** Exclude drafts from RSS even in dev mode

**Rationale:**
- RSS readers cache content aggressively
- Prevents accidental subscription to draft content
- Separate `getPostsForRSS()` function enforces this consistently

### Centralized Filtering
**Decision:** Create helper functions in `src/utils/posts.ts` instead of inline filtering

**Rationale:**
- Used in 6 locations - DRY principle
- Single source of truth for filtering logic
- Easier to maintain and extend (e.g., scheduled publishing)
- Better type safety

## Notes

### Behavior Summary
| Mode | Draft Visibility | Routes Generated | In RSS |
|------|-----------------|------------------|--------|
| Dev (`npm run dev`) | ✅ Visible everywhere except RSS | ✅ Accessible at `/{slug}` | ❌ No |
| Build (`npm run build`) | ❌ Hidden everywhere | ❌ 404 if accessed | ❌ No |
| Preview (`npm run preview`) | ❌ Hidden | ❌ 404 if accessed | ❌ No |

### Edge Cases Handled
- **Highlighted draft posts**: Gracefully filtered in production (fewer highlights shown)
- **Categories with only drafts**: Won't appear in production
- **Direct URL access**: Works in dev, 404 in production
- **Sitemap**: Auto-excludes drafts (Astro generates from routes)

### Test Results
- All 10 smoke tests passed
- Production build generated 31 routes (excluding 1 draft)
- RSS feed contains 31 posts (draft correctly excluded)

### Future Enhancements
Potential additions for future consideration:
- Scheduled publishing based on `pubDate`
- Visual draft indicators in dev mode (badges, banners)
- Dedicated `/drafts` page in dev mode
- Console warnings when highlights reference drafts
