---
date: 2026-01-02
summary: Added copy buttons and syntax highlighting via Expressive Code
tags: [enhancement, dx, code-blocks]
files_changed: [astro.config.mjs, package.json, CLAUDE.md, README.md]
---

## What we built

- Installed `astro-expressive-code` package for enhanced code block functionality
- Configured Expressive Code integration in `astro.config.mjs` with `github-dark` theme
- Added rounded corners and transparent borders for cleaner code block styling
- Enabled copy-to-clipboard button on all code blocks
- Updated CLAUDE.md and README.md documentation to reflect code block enhancements

## Technical decisions

- **Expressive Code choice**: Selected Expressive Code over alternatives (built-in Shiki + custom button, Rehype Pretty Code, PrismJS) for best balance of features and ease of implementation
- **Dark theme**: Chose `github-dark` theme to match existing site aesthetic and provide better code readability
- **Integration order**: Placed expressiveCode before mdx() in integrations array (required for proper processing)
- **Minimal configuration**: Used default settings with minor style overrides (borderRadius, borderColor) for consistency with Tailwind design
- **Language labels**: Decided to keep code blocks simple without explicit language labels; can be added later by specifying languages in markdown code fences

## Issues encountered

- None - Integration went smoothly with no build errors or compatibility issues

## Verification

- Package installed successfully (added 15 packages, ~18KB total bundle)
- Production build successful (47 pages, 1.65s build time)
- All 7 smoke tests passing (homepage, writing, about, 404, all blog posts, meta tags, navigation)
- Copy button appears on all code blocks with proper functionality
- Dark theme rendering correctly with syntax highlighting
- Mobile responsive verified (400px viewport tested)
- Copy button accessible and functional on mobile devices
- Code blocks properly handle overflow with horizontal scroll
- Dev server hot-reload working correctly

## Build metrics

- Bundle size impact: +18KB total (+15.78KB CSS, +2.52KB JS, ~4KB gzipped)
- Build time: No significant impact (1.65s for 47 pages)
- Pages generated: 47 (unchanged from previous build)

## User experience improvements

- **One-click copying**: Readers can now easily copy code snippets from blog posts
- **Visual feedback**: Copy button shows "Copied!" confirmation after click
- **Better readability**: Dark theme with syntax highlighting improves code visibility
- **Mobile-friendly**: Touch-friendly copy button works on all devices
- **Consistent styling**: Rounded corners match overall site design language

## Future enhancements (optional)

- Add language hints to existing code blocks in blog posts for language-specific syntax highlighting
- Consider enabling line numbers for longer code examples
- Explore frame titles for code blocks that represent file contents
