# 005: blog-publish skill — one-commit publishing pipeline

**Date:** 2026-07-06
**Status:** Accepted

## Context

Publishing a post has been ad-hoc. Git history shows the cost: nearly every post
is followed by a 3–6 commit nit tail ("minor fix", "spelling fixes", "Tag
changes", "Fixing some hyperlinks"), one post shipped with broken YAML
frontmatter, image folders are inconsistently named (`Experiments with Strava
MCP/` with spaces vs kebab-case), images shipped uncompressed (19 needed
compression in the 2026-07-02 audit), and hand-curated steps (llms.txt) are
easy to forget.

The editorial and ideation halves are already covered by existing global
skills: `blog-review` (feedback on the words) and `content-plan` (what to
write, and promotion after). The gap is the mechanical publish pipeline.

## Decision

Add a **repo-local** skill at `.claude/skills/blog-publish/SKILL.md` covering
scaffold → checklist → gated publish. Repo-local (not `~/.claude/skills/`)
because it is useless without the checkout — it edits files, runs
`npm run test`, and pushes. (`blog-review` stays global because it works on a
Notion draft from anywhere.)

### Two modes, detected from input

1. **Scaffold** (no draft yet): create `src/content/blog/<kebab-slug>.md` with
   valid frontmatter (`draft: true`, description placeholder flagged loudly,
   categories chosen from the existing set via `scripts/count-categories.js`),
   note `public/images/<slug>/` as the image home.
2. **Publish** (draft exists — repo file, Notion URL via MCP, or pasted text):
   ingest if needed, then run the pre-publish checklist.

### Pre-publish checklist (fail-loud, reported as a table before the gate)

- Frontmatter parses and matches schema; description 120–160 chars; pubDate =
  today; categories already exist; heroImage path resolves
- Images in `public/images/<slug>/` (kebab-case, no spaces), each ≤ ~300 KB
  (compress via `sips` if over), all references resolve
- OG image: install + resize to 1200×630 if provided; else fall back to
  `og-default.png` and list as follow-up — **never blocks publish**
- External links fetched once (200 check); internal links have trailing slashes
- Offer `blog-review` if the post hasn't been through it (don't force)
- llms.txt: explicit yes/no decision ("evergreen/notable?") — never silently
  skipped
- Flip `draft: true → false`; `npm run test` passes

### Gate and publish

Show checklist results + diff summary → user says go → **single commit**
(`Publish: <title>`), push to main, verify live URL returns 200 and the post
appears in `/rss.xml`. Post-publish note lists deferred follow-ups (OG image,
llms.txt) and points at `content-plan` for promotion spokes.

## Skill-composition rules

- **Trigger disjointness with `blog-review`:** blog-review owns "feedback /
  does this sound like me / is this ready"; blog-publish owns "ship it / put
  it live / publish". Each description cross-references the other.
- **`/ship` overlap:** the publish commit has semantics ship lacks (single
  squashed commit, post-deploy live verification), so blog-publish does its
  own commit/push and says not to also run `/ship` for the post.
- **`wrap-session` deleted:** the repo-local wrap-session skill (wrapper
  around interactive `session-end.sh`) is superseded by global `wrap-up` and
  removed as part of this change.

## Alternatives considered

- **Two skills (new-post + publish-post):** rejected — the scaffold half is
  small and the two share all conventions; a split duplicates context.
- **Script-heavy (`scripts/new-post.js` + thin skill):** rejected — smoke
  tests already validate the output; one more script to maintain for ~1
  post/month.
- **Fully autonomous publish (no gate):** rejected — push to main = live
  site; one explicit confirm is cheap.

## Success criterion

A post publishes in one commit instead of a multi-commit nit tail, with zero
broken-frontmatter / oversized-image / forgotten-llms.txt incidents.
