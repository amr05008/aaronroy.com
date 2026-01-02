---
date: 2026-01-02
summary: Abstracted session management instructions to global ~/.claude/rules/
tags: [documentation, meta, workflow]
---

## Summary

Extracted the session management instructions from this project's CLAUDE.md into a global rules file at `~/.claude/rules/session-management.md`. This enables consistent session tracking across all projects without duplicating instructions.

## Changes

- Created `~/.claude/rules/session-management.md` with refined guidelines
- Updated `CLAUDE.md` to import the global file via `@~/.claude/rules/session-management.md`
- Reduced session management section from ~40 lines to 3 lines

## Decisions

**Refined the session file template:**
- Simplified from 5 sections to 4 (Summary, Changes, Decisions, Notes)
- Removed `files_changed` frontmatter (redundant with git)
- Combined `Issues encountered` and `Verification` into optional `Notes`

**Added clarity on when to create sessions:**
- Explicit "do create" vs "skip" criteria
- Naming convention: `YYYY-MM-DD-verb-noun.md`
- Multi-day work guidance

**Kept project ideas per-project:**
- `PROJECT_IDEAS.md` remains gitignored and project-specific
- Cross-project ideas can go in `~/.claude/ideas.md` if needed later

## Notes

To use this in new projects:
1. Create `.claude/sessions/` and `.claude/decisions/` directories
2. Add `@~/.claude/rules/session-management.md` to project's CLAUDE.md
