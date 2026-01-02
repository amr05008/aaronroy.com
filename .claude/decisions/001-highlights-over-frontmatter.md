# ADR 001: Homepage Highlights via Config File vs Frontmatter

**Date**: 2025-10-05
**Status**: Accepted
**Related session**: [2025-10-05-seo-highlights](../sessions/2025-10-05-seo-highlights.md)

## Context

The homepage needed a way to display curated "highlight" posts rather than just recent posts. Two main approaches were considered:

1. **Frontmatter flags**: Add `featured: true` to post frontmatter
2. **Centralized config file**: Maintain an array of slugs in a separate file

## Decision

Use a centralized config file at `src/data/highlights.ts` containing an ordered array of post slugs.

## Rationale

**Why config file over frontmatter:**

- **Explicit ordering**: Array position determines display order; frontmatter flags would require additional sort logic or manual ordering
- **Single location**: All curation decisions visible in one file vs scattered across 29+ post files
- **No frontmatter pollution**: Posts remain clean; "featured" status is a presentation concern, not content metadata
- **Easier changes**: Reordering or swapping highlights requires editing one file, not multiple
- **Hot reload friendly**: Changes to `highlights.ts` trigger immediate dev server updates

**Trade-offs accepted:**

- Slugs must exactly match filenames (typos fail silently at build time)
- Requires knowing slugs rather than browsing frontmatter

## Implementation

```typescript
// src/data/highlights.ts
export const highlights = [
  'making-migrations-fun-with-claude-code',
  'ai-pm-predictions-2025',
  // ... more slugs
];
```

Homepage imports this array and fetches matching posts in order.

## Consequences

- Adding/removing highlights: Edit `src/data/highlights.ts`
- Changing order: Reorder array items
- New posts aren't automatically featured (intentional)
