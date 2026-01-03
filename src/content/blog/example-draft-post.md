---
title: "Draft: Testing the Draft System"
description: "This is a draft post used to test the draft system functionality. It should only be visible during development."
pubDate: 2026-01-03
categories: ["AI"]
draft: true
---

This is an example draft post to demonstrate the draft system functionality.

## What This Post Tests

In **development mode** (`npm run dev`):
- ✅ This post appears in the Writing archive page
- ✅ This post is included in category counts
- ✅ This post is accessible at `/example-draft-post`
- ❌ This post does NOT appear in the RSS feed

In **production builds** (`npm run build`):
- ❌ This post does NOT appear in the Writing archive page
- ❌ This post is NOT included in category counts
- ❌ This post does NOT generate a route (404 if accessed)
- ❌ This post does NOT appear in the RSS feed

## How to Publish This Post

To publish this draft, simply change the frontmatter from:

```markdown
draft: true
```

to:

```markdown
draft: false
```

Or remove the `draft` field entirely (defaults to `false`).

## Testing the Draft System

1. Start the dev server: `npm run dev`
2. Visit http://localhost:4321/writing - you should see this post
3. Visit http://localhost:4321/example-draft-post - you should see this page
4. Visit http://localhost:4321/rss.xml - this post should NOT be included
5. Build for production: `npm run build`
6. Preview the build: `npm run preview`
7. Visit http://localhost:4321/writing - this post should NOT appear
8. Visit http://localhost:4321/example-draft-post - should return 404

Happy drafting! 🎉
