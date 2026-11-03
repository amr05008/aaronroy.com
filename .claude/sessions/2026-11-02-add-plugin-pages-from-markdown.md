---
date: 2026-11-02
summary: Competitive Analysis plugin pages updated for its MCP server and moved to markdown Aaron edits in Obsidian; merged and live
tags: [competitive-analysis, content-collections, obsidian, privacy]
---

## Summary

The project, privacy and terms pages under `/competitive-analysis/` now describe the plugin's own MCP server, and their copy moved out of the `.astro` files into a content collection that Aaron edits in his vault. Built on `competitive-analysis-server`, merged to `main` and live on 2026-11-02, where OpenAI's submission checks read them.

## Changes

- `src/content/competitive-analysis/{index,privacy,terms}.md` - the copy, with `title` and `description` frontmatter
- `src/content/config.ts` - `competitive-analysis` collection (legacy `type: 'content'`)
- `src/pages/competitive-analysis/{index,privacy,terms}.astro` - render the entry inside the prose wrapper; privacy and terms stay `noindex`
- `CLAUDE.md` - where the copy lives, and keep the `## Support` heading

Commits: 4cb0a17, 0e069cb (privacy and terms for the server), 70b56ac (copy to markdown).

## Decisions

**Copy in a collection, edited through a vault symlink.** The vault's `_areas/competitive-analysis/site` links to `src/content/competitive-analysis/`, so there's one copy and Aaron edits it in Obsidian the way he does blog drafts. That folder must stay out of Obsidian Sync.

**No docs subdomain.** The plugin manifests and OpenAI's checks already point at `aaronroy.com/competitive-analysis/` URLs, and three static pages don't need their own site.

**`## Support` is load-bearing.** The manifests link to `/competitive-analysis/#support`, so the heading's id can't change.

## Notes

- The privacy copy is checked against the server's code, not the plan: it names the Vercel relay and says Vercel keeps its usual request log.
