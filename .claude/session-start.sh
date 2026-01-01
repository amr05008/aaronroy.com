#!/bin/bash
set -e  # Exit on any error

# Only run in Claude Code web sessions
if [ "$CLAUDE_CODE_REMOTE" = "true" ]; then
  echo "🚀 Setting up aaronroy.com for Claude Code web session..."

  # Install npm dependencies
  echo "📦 Installing npm dependencies..."
  npm install --prefer-offline --no-audit

  # Verify setup by running a quick build
  echo "🔨 Verifying Astro build works..."
  npm run build

  echo "✅ Session setup complete! Ready to work on the blog."
else
  echo "ℹ️  Running locally - skipping web session setup"
fi
