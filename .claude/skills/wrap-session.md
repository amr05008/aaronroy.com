---
name: wrap-session
description: End a work session by documenting changes, running tests, and committing code
runOnInvoke: false
---

# Wrap Session

This skill helps you wrap up a coding session by:
1. Analyzing changes and detecting if they're trivial
2. Suggesting documentation and test updates
3. Creating a session history file with smart filename suggestions
4. Committing and pushing changes

## When to Use

Use `/wrap-session` when you're done with a coding session that made non-trivial changes:
- Added features or components
- Fixed bugs
- Refactored code
- Updated tests

Skip for: typos, single-line changes, or pure Q&A sessions with no code.

## Instructions for Claude

When this skill is invoked, you should:

1. **Run the session-end script** by executing:
   ```bash
   ./.claude/session-end.sh
   ```

2. **Important**: This script is **interactive** and requires user input in the terminal. You cannot run it directly through Claude Code's bash tool because it needs stdin interaction.

3. **Instead**, you should:
   - Tell the user to run the script in their terminal
   - Provide the exact command: `./.claude/session-end.sh`
   - Explain what the script will do (analyze changes, suggest filenames, commit, push)
   - Optionally, offer to update CLAUDE.md first if you detect documentation gaps

4. **Before the user runs the script**, review if any documentation needs updating:
   - Check if CLAUDE.md needs updates for new features
   - Verify tests were added/updated for code changes
   - Look for any package.json changes that affect the tech stack

5. **After reviewing**, provide a summary like:
   ```
   📋 Ready to wrap up this session:

   Changes: X files, +Y/-Z lines

   Documentation checklist:
   ☐ CLAUDE.md needs updating (new feature added)
   ☑ Tests updated
   ☐ Package.json unchanged

   To complete the session:
   1. Run: ./.claude/session-end.sh
   2. The script will guide you through:
      - Creating session file with smart suggestions
      - Committing changes
      - Pushing to remote
   ```

## Example Usage

User types: `/wrap-session`

Claude responds with a summary of changes and instructions to run the interactive script in their terminal.
