# Claude Code Configuration

This directory contains hooks and configuration for Claude Code sessions.

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
