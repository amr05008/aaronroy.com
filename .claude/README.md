# Claude Code Configuration

This directory contains hooks and configuration for Claude Code sessions.

## SessionStart Hook

The `session-start.sh` hook automatically sets up your environment when starting a Claude Code web session.

**What it does:**
- Installs npm dependencies (`npm install`)
- Runs a build verification (`npm run build`)
- Only runs in web sessions (detects via `CLAUDE_CODE_REMOTE` environment variable)

**Setup Instructions:**

1. Open Claude Code settings (gear icon in bottom-left)
2. Add this SessionStart hook configuration:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "aaronroy.com",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/session-start.sh"
          }
        ]
      }
    ]
  }
}
```

3. Start a new Claude Code web session to test

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
