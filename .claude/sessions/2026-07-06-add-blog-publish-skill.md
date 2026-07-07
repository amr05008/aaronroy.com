---
date: 2026-07-06
summary: Added repo-local blog-publish skill (TDD-tested); deleted legacy wrap-session skill
tags: [skills, publishing, workflow]
---

## Summary
Created `.claude/skills/blog-publish/` — a scaffold → checklist → gated
one-commit publish pipeline for blog posts, designed from the friction visible
in git history (multi-commit nit tails, broken frontmatter, uncompressed
images, forgotten llms.txt). Built TDD-style per superpowers:writing-skills:
a baseline subagent publishing a booby-trapped draft *without* the skill
missed 4 of 10 planted issues; the same scenario *with* the skill caught all
10 and stopped at the publish gate.

## Changes
- `.claude/skills/blog-publish/SKILL.md` — new skill (13-row checklist, gate, publish + live verification)
- `.claude/decisions/005-blog-publish-skill.md` — design rationale (committed separately)
- `.claude/skills/wrap-session/` — deleted; superseded by global `wrap-up` (note: `npm run wrap` / `session-end.sh` left in place)
- `CLAUDE.md` — pointer under "Adding New Blog Posts" + Recent Changes entry
- `~/.claude/skills/blog-review/SKILL.md` (global, not in this repo) — scope note handing publish requests to blog-publish

## Decisions
See `.claude/decisions/005-blog-publish-skill.md`. Key: repo-local (needs the
checkout), one skill not two, checklist → explicit gate → single "Publish:"
commit, OG image never blocks, llms.txt decision never silent.

## Notes
Baseline test's most interesting failure: it "validated" the post's new
category against `count-categories.js` output that included the post itself —
self-confirming. The skill now requires categories to be used by *another*
published post. Test fixtures (booby-trapped draft + images) were removed
after testing.
