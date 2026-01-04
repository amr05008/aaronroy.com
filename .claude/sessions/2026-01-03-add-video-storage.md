---
date: 2026-01-03
summary: Add video storage infrastructure for Kap screen recordings
tags: [video, documentation, infrastructure]
---

## Summary

Set up MP4 video storage infrastructure for blog posts using HTML5 `<video>` tags. Created `/public/videos/` directory with human-readable naming convention and comprehensive documentation for embedding Kap screen recordings in Markdown blog posts.

## Changes

- **`public/videos/`** - Created new directory for self-hosted MP4 files
- **`CLAUDE.md`** (line 109-180) - Added "Video Storage" section with:
  - Human-readable naming convention: `{descriptive-name}.mp4`
  - HTML5 video templates (horizontal and vertical)
  - Decision guide for self-hosted vs YouTube embeds
  - File size guidelines (< 10MB recommended)
  - Compression instructions (FFmpeg/HandBrake)
  - Future MDX component roadmap
- **`README.md`** (pending) - Add video section to Content Management

## Decisions

**Naming Convention: Human-Readable Slugs**
- Pattern: `strava-mcp-tutorial.mp4` vs `post-slug-1735848123456.mp4`
- Rationale: Better URLs, more maintainable, easier to reference
- Example: `reflecting-cx-2025-cunningham-park.mp4`

**Display Method: HTML5 Tags First, MDX Component Later**
- Start with raw `<video>` tags in Markdown (no MDX conversion required)
- Future: Build reusable MDX component when 5+ posts use videos
- Rationale: Incremental approach, doesn't force all posts to `.mdx` format

**Self-Hosted vs YouTube: Clear Decision Criteria**
- Self-hosted: Short Kap recordings (< 2 min, < 10MB)
- YouTube: Long-form content (> 2 min, > 20MB, needs analytics)
- Maintains hybrid approach already used in 7 existing posts

**Storage Location: Dedicated Directory**
- `/public/videos/` vs `/public/images/`
- Keeps videos separate, clearer organization
- Matches pattern: images/, og-images/, videos/

## Notes

**Phase 2 (Future Enhancement):**
When 5+ posts use videos, consider building `src/components/Video.astro`:
- Simplified syntax: `<Video src="..." aspectRatio="16/9" />`
- Built-in caption support
- Easy to add lazy loading, poster images, analytics
- Requires converting posts to `.mdx` format

**Browser Compatibility:**
- HTML5 `<video>` universally supported
- MP4 H.264 codec works across all modern browsers
- No polyfills needed

**File Size Optimization:**
Recommended FFmpeg compression:
```bash
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -crf 28 -preset slow output.mp4
```

**Accessibility:**
- `controls` attribute provides keyboard navigation
- Fallback text for unsupported browsers
- Recommend captions/transcripts for complex content
