# Claude Code Configuration

This directory contains hooks, configuration, and session history for Claude Code sessions.

## Directory Structure

```
.claude/
├── sessions/           # Detailed logs of each working session
│   ├── index.md        # Quick reference table of all sessions
│   └── YYYY-MM-DD-*.md # Individual session files
├── decisions/          # Architectural Decision Records (ADRs)
│   └── NNN-*.md        # Numbered decision documents
├── settings.json       # Claude Code settings
├── settings.local.json # Local overrides (git-ignored)
├── session-start.sh    # Web session startup hook
└── README.md           # This file
```

## Session History

Session files document what was built, technical decisions made, issues encountered, and outcomes. Use these when:
- Asked about prior work on this project
- Needing context on why something was built a certain way
- Looking up how a past issue was resolved

Start with `sessions/index.md` for quick lookup by date or topic.

## Architecture Decisions

Decision records capture the rationale for significant architectural choices. Check these before:
- Revisiting a past decision
- Making changes that might conflict with established patterns
- Understanding trade-offs that were considered

## SessionStart Hook

The `session-start.sh` hook automatically sets up your environment when starting a Claude Code web session.

**What it does:**
- Installs npm dependencies (`npm install`)
- Runs a build verification (`npm run build`)
- Only runs in web sessions (detects via `CLAUDE_CODE_REMOTE` environment variable)

**Setup:**

✅ Already configured! The hook is defined in `.claude/settings.json` and will run automatically when you start a Claude Code web session on this repository.

No additional setup needed - just start a web session and the hook runs automatically.

**Testing locally:**

```bash
# This will skip the setup and just print a message
./.claude/session-start.sh
```

**Expected output in web sessions:**
```
🚀 Setting up aaronroy.com for Claude Code web session...
📦 Installing npm dependencies...
🔨 Verifying Astro build works...
✅ Session setup complete! Ready to work on the blog.
```

## Future Hooks

You can add more hooks here:
- `stop-hook.sh` - Runs when ending a session (e.g., git status check)
- `pre-commit.sh` - Runs before commits
- Other custom automation
