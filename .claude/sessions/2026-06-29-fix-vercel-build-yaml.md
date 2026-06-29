---
date: 2026-06-29
summary: Fix broken-YAML Vercel build failure, repair tag-dependent smoke test, gitignore stray MCP artifacts
tags: [deployment, build, testing, yaml]
---

## Summary
A Vercel production deploy failed on commit `6f2ee81` ("Tag changes"). Root
cause was malformed YAML frontmatter in one blog post that broke `astro build`.
Fixed the frontmatter, repaired a smoke test that depended on a category the
same tag-edit had removed, and cleaned up stray Playwright-MCP run artifacts.
All 18 smoke tests pass; the redeploy (`4e51ac1`) is verified **Ready** on Vercel.

## Changes
- `src/content/blog/wami-is-the-featured-product-for-tpg.md` — fixed malformed
  `categories` array. It was `["Startups,"Wami"]` (misplaced quote swallowed the
  comma), which threw `missed comma between flow collection entries` in js-yaml
  and failed the build. Corrected to `["Startups", "Wami"]`.
- `tests/smoke.spec.ts` — retargeted the "category URL slugification" test. It
  was hardcoded to `unlocking-revenue-with-product-led-growth` asserting first
  category "Product Management" → `product-management`. The tag edit renamed
  "Product Management" → "Product" sitewide, so that category no longer exists.
  Repointed to `lessons-learned-refinancing-student-loan-debt`, asserting
  "Student Loans" → `student-loans` (still a multi-word, first-position
  category, so the test's intent is preserved).
- `.gitignore` — added `.playwright-mcp/`. Removed the stray
  `.playwright-mcp/` dir (a console log + page yml left by an MCP run); it was
  untracked and not ignored, so it risked an accidental commit.

## Decisions
- Kept the slugification test meaningful rather than just deleting it: its whole
  point is verifying multi-word categories hyphenate, so it needed a post that
  still has a multi-word first category. "Student Loans" was the cleanest fit.
- Treated the `.playwright-mcp/` files as safe-to-remove junk (transient tool
  output, not project content), mirroring how `test-results/` is handled.

## Notes
- The YAML typo wasn't caught locally because commit `6f2ee81` was pushed
  without a build/test run. `npm run test` builds first and would have caught
  it. Worth running before content pushes, not just code pushes.
- Tag/category renames can silently break smoke tests that hardcode a specific
  post + category. When bulk-editing categories, grep `tests/smoke.spec.ts` for
  hardcoded category names first.
