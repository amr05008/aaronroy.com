#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}📝 Session End Workflow${NC}\n"

# Check if there are any changes
if [[ -z $(git status -s) ]]; then
  echo -e "${YELLOW}ℹ️  No changes detected. Skipping session documentation.${NC}"
  exit 0
fi

# =============================================================================
# STEP 0: Auto-detect trivial changes
# =============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Analyzing Changes${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Get statistics
CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null || echo "")
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null || echo "")
ALL_CHANGED=$(echo -e "${CHANGED_FILES}\n${STAGED_FILES}" | sort -u | grep -v "^$")
NUM_FILES=$(echo "$ALL_CHANGED" | grep -v "^$" | wc -l | xargs)

# Count lines changed (both staged and unstaged)
LINES_ADDED=$(git diff HEAD --numstat 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
LINES_DELETED=$(git diff HEAD --numstat 2>/dev/null | awk '{sum+=$2} END {print sum+0}')
TOTAL_LINES=$((LINES_ADDED + LINES_DELETED))

echo -e "${CYAN}📊 Change Statistics:${NC}"
echo "   Files changed: $NUM_FILES"
echo "   Lines added: $LINES_ADDED"
echo "   Lines deleted: $LINES_DELETED"
echo "   Total lines: $TOTAL_LINES"
echo ""

# Determine if trivial
IS_TRIVIAL=false
TRIVIAL_REASON=""

# Rule 1: Very small changes (< 10 lines, 1-2 files)
if [[ $TOTAL_LINES -lt 10 ]] && [[ $NUM_FILES -le 2 ]]; then
  IS_TRIVIAL=true
  TRIVIAL_REASON="Small change (< 10 lines, ≤ 2 files)"
fi

# Rule 2: Only documentation/markdown changes
if echo "$ALL_CHANGED" | grep -qv "\.md$" || [[ $NUM_FILES -eq 0 ]]; then
  : # Has non-markdown files, not trivial
else
  IS_TRIVIAL=true
  TRIVIAL_REASON="Only documentation changes (.md files)"
fi

# Rule 3: Only gitignore or config file tweaks
if echo "$ALL_CHANGED" | grep -qE "^(\.gitignore|\.env\.example|\.editorconfig|\.prettierrc)$"; then
  if [[ $NUM_FILES -le 2 ]]; then
    IS_TRIVIAL=true
    TRIVIAL_REASON="Config file updates only"
  fi
fi

# Rule 4: Only whitespace/formatting changes (check git diff)
DIFF_WITHOUT_WHITESPACE=$(git diff HEAD -w --stat 2>/dev/null | tail -1)
if echo "$DIFF_WITHOUT_WHITESPACE" | grep -q "0 insertions(+), 0 deletions(-)"; then
  IS_TRIVIAL=true
  TRIVIAL_REASON="Only whitespace/formatting changes"
fi

# Display trivial detection result
if [[ "$IS_TRIVIAL" == "true" ]]; then
  echo -e "${YELLOW}⚡ Trivial Change Detected:${NC} $TRIVIAL_REASON"
  echo -e "${YELLOW}This change doesn't require a session file.${NC}\n"

  read -p "Skip session documentation and just commit? (Y/n): " SKIP_SESSION
  SKIP_SESSION=${SKIP_SESSION:-y}  # Default to yes

  if [[ "$SKIP_SESSION" =~ ^[Yy]$ ]]; then
    CREATE_SESSION="n"
    echo -e "${BLUE}Skipping to commit step...${NC}\n"
  else
    CREATE_SESSION="y"
    echo -e "${BLUE}Creating session file anyway...${NC}\n"
  fi
else
  echo -e "${GREEN}✓ Substantial change detected - session documentation recommended${NC}\n"
  CREATE_SESSION="y"
fi

# =============================================================================
# STEP 1: Analyze changes and suggest documentation/test updates
# =============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 1: Documentation & Test Review${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Show git status
echo -e "${GREEN}Changed files:${NC}"
git status -s

echo -e "\n${YELLOW}📋 Documentation & Test Recommendations:${NC}\n"

# Check if source code changed
if echo "$ALL_CHANGED" | grep -q "src/"; then
  echo -e "${YELLOW}⚠️  Source code changed - consider:${NC}"

  # Check specific file types
  if echo "$ALL_CHANGED" | grep -q "src/pages/\|src/layouts/"; then
    echo "   • Update CLAUDE.md if new routes or components added"
  fi

  if echo "$ALL_CHANGED" | grep -q "src/content/"; then
    echo "   • No test updates needed (content changes)"
  fi

  if echo "$ALL_CHANGED" | grep -q "src/utils/"; then
    echo "   • Consider adding unit tests for utility functions"
  fi

  # Check if tests exist for changed files
  if ! echo "$ALL_CHANGED" | grep -q "tests/"; then
    echo -e "   • ${RED}No test files modified - should tests be updated?${NC}"
  fi
fi

# Check if tests were updated
if echo "$ALL_CHANGED" | grep -q "tests/"; then
  echo -e "${GREEN}✓ Test files updated${NC}"
fi

# Check if CLAUDE.md was updated
if echo "$ALL_CHANGED" | grep -q "CLAUDE.md"; then
  echo -e "${GREEN}✓ CLAUDE.md documentation updated${NC}"
else
  if echo "$ALL_CHANGED" | grep -q "src/"; then
    echo -e "${YELLOW}⚠️  CLAUDE.md not updated - does documentation need changes?${NC}"
  fi
fi

# Check if package.json changed (new dependencies)
if echo "$ALL_CHANGED" | grep -q "package.json"; then
  echo -e "${YELLOW}⚠️  package.json changed - update CLAUDE.md tech stack section?${NC}"
fi

if [[ "$CREATE_SESSION" == "y" ]]; then
  echo ""
  read -p "Press Enter to continue or Ctrl+C to cancel..."
fi

# =============================================================================
# STEP 2: Smart session filename suggestions (if creating session)
# =============================================================================

if [[ "$CREATE_SESSION" == "y" ]]; then
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}STEP 2: Session Documentation${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

  TODAY=$(date +%Y-%m-%d)

  # Analyze changes to suggest filename
  echo -e "${CYAN}🤖 Analyzing changes to suggest session filename...${NC}\n"

  # Determine action verb
  ACTION_VERB=""
  if echo "$ALL_CHANGED" | grep -q "src/pages/\|src/layouts/\|src/components/" && [[ $LINES_ADDED -gt $LINES_DELETED ]]; then
    ACTION_VERB="add"
  elif echo "$ALL_CHANGED" | grep -q "fix\|bug" || git diff HEAD | grep -qi "fix\|bug"; then
    ACTION_VERB="fix"
  elif echo "$ALL_CHANGED" | grep -q "test"; then
    ACTION_VERB="add"
  elif [[ $LINES_DELETED -gt 50 ]]; then
    ACTION_VERB="refactor"
  elif echo "$ALL_CHANGED" | grep -qE "\.astro$|\.ts$|\.js$" && [[ $TOTAL_LINES -gt 50 ]]; then
    ACTION_VERB="update"
  else
    ACTION_VERB="update"
  fi

  # Determine noun/subject
  SUBJECT=""
  if echo "$ALL_CHANGED" | grep -q "BlogPost.astro\|blog"; then
    SUBJECT="blog-post-"
  fi

  if echo "$ALL_CHANGED" | grep -q "category\|categories"; then
    SUBJECT="${SUBJECT}category-"
  fi

  if echo "$ALL_CHANGED" | grep -q "test"; then
    SUBJECT="${SUBJECT}tests"
  fi

  if echo "$ALL_CHANGED" | grep -q "utils/"; then
    UTIL_FILE=$(echo "$ALL_CHANGED" | grep "utils/" | head -1 | xargs basename | sed 's/\.[^.]*$//')
    SUBJECT="${SUBJECT}${UTIL_FILE}"
  fi

  if echo "$ALL_CHANGED" | grep -q "rss\|feed"; then
    SUBJECT="${SUBJECT}rss-feed"
  fi

  if echo "$ALL_CHANGED" | grep -q "video"; then
    SUBJECT="${SUBJECT}video-"
  fi

  # Remove trailing dash
  SUBJECT=$(echo "$SUBJECT" | sed 's/-$//')

  # If we couldn't determine subject, use generic
  if [[ -z "$SUBJECT" ]]; then
    SUBJECT="updates"
  fi

  # Generate suggestions
  SUGGESTION_1="${ACTION_VERB}-${SUBJECT}"

  # Alternative suggestions
  if [[ "$ACTION_VERB" == "add" ]]; then
    SUGGESTION_2="implement-${SUBJECT}"
  elif [[ "$ACTION_VERB" == "fix" ]]; then
    SUGGESTION_2="resolve-${SUBJECT}"
  else
    SUGGESTION_2="${ACTION_VERB}-${SUBJECT}-feature"
  fi

  # Show most changed file for context
  MOST_CHANGED=$(git diff HEAD --numstat | sort -rn -k1,1 | head -1 | awk '{print $3}')

  echo -e "${GREEN}💡 Suggested session filenames:${NC}"
  echo -e "   ${CYAN}1)${NC} ${TODAY}-${SUGGESTION_1}  ${YELLOW}(recommended)${NC}"
  echo -e "   ${CYAN}2)${NC} ${TODAY}-${SUGGESTION_2}"
  echo -e "   ${CYAN}3)${NC} Custom (you enter manually)"
  echo ""
  echo -e "${CYAN}Context:${NC} Most changed file: ${MOST_CHANGED}"
  echo ""

  read -p "Choose option (1/2/3) or press Enter for #1: " FILENAME_CHOICE
  FILENAME_CHOICE=${FILENAME_CHOICE:-1}

  case $FILENAME_CHOICE in
    1)
      SESSION_SLUG="$SUGGESTION_1"
      ;;
    2)
      SESSION_SLUG="$SUGGESTION_2"
      ;;
    3)
      echo -e "\n${GREEN}Enter custom slug (without date):${NC}"
      echo "Format: verb-noun (e.g., add-dark-mode, fix-auth-bug)"
      read -p "> " SESSION_SLUG
      ;;
    *)
      SESSION_SLUG="$SUGGESTION_1"
      ;;
  esac

  SESSION_FILE=".claude/sessions/${TODAY}-${SESSION_SLUG}.md"

  if [[ -f "$SESSION_FILE" ]]; then
    echo -e "\n${YELLOW}⚠️  Session file already exists. Updating existing file...${NC}"
    UPDATING_EXISTING=true
  else
    UPDATING_EXISTING=false
  fi

  echo -e "\n${GREEN}One-line summary:${NC}"
  read -p "> " SUMMARY

  echo -e "\n${GREEN}Tags (comma-separated):${NC}"
  echo "Examples: feature, bugfix, refactor, tests, documentation"
  read -p "> " TAGS_INPUT

  # Convert comma-separated tags to array format
  IFS=',' read -ra TAGS_ARRAY <<< "$TAGS_INPUT"
  TAGS_FORMATTED="["
  for i in "${!TAGS_ARRAY[@]}"; do
    tag=$(echo "${TAGS_ARRAY[$i]}" | xargs) # trim whitespace
    if [[ $i -eq 0 ]]; then
      TAGS_FORMATTED+="\"$tag\""
    else
      TAGS_FORMATTED+=", \"$tag\""
    fi
  done
  TAGS_FORMATTED+="]"

  echo -e "\n${GREEN}What was accomplished? (2-3 sentences, end with empty line):${NC}"
  ACCOMPLISHMENTS=""
  while IFS= read -r line; do
    [[ -z "$line" ]] && break
    ACCOMPLISHMENTS+="$line"$'\n'
  done

  # Generate list of changed files
  echo -e "\n${GREEN}Generating file changes list...${NC}"
  FILES_LIST=""
  while IFS= read -r file; do
    if [[ -n "$file" ]]; then
      FILES_LIST+="- \`$file\`"$'\n'
    fi
  done <<< "$ALL_CHANGED"

  echo -e "\n${GREEN}Key decisions/rationale (optional, end with empty line):${NC}"
  DECISIONS=""
  while IFS= read -r line; do
    [[ -z "$line" ]] && break
    DECISIONS+="$line"$'\n'
  done

  # Create session file
  if [[ "$UPDATING_EXISTING" == "true" ]]; then
    echo -e "\n${BLUE}Appending to existing session file...${NC}"
    cat >> "$SESSION_FILE" << EOF

## Update: $(date +%Y-%m-%d)

$ACCOMPLISHMENTS

### Additional Changes
$FILES_LIST
EOF
  else
    echo -e "\n${BLUE}Creating session file: $SESSION_FILE${NC}"

    cat > "$SESSION_FILE" << EOF
---
date: $TODAY
summary: $SUMMARY
tags: $TAGS_FORMATTED
---

## Summary

$ACCOMPLISHMENTS

## Changes

$FILES_LIST

## Decisions

${DECISIONS:-None.}

## Notes

- Created via SessionEnd hook
- Stats: $NUM_FILES files, +$LINES_ADDED/-$LINES_DELETED lines
- Run \`npm run test\` to verify all tests pass
EOF
  fi

  # Update session index
  echo -e "${BLUE}Updating session index...${NC}"

  INDEX_FILE=".claude/sessions/index.md"
  INDEX_ENTRY="- **$TODAY**: [$SUMMARY]($TODAY-$SESSION_SLUG.md)"

  # Check if entry already exists
  if grep -q "$TODAY-$SESSION_SLUG" "$INDEX_FILE" 2>/dev/null; then
    echo -e "${YELLOW}Entry already exists in index${NC}"
  else
    # Add to index (prepend after header)
    if [[ -f "$INDEX_FILE" ]]; then
      # Insert after the first blank line (after header)
      awk -v entry="$INDEX_ENTRY" 'NR==1{print; print ""; print entry; next} NR>1' "$INDEX_FILE" > "$INDEX_FILE.tmp"
      mv "$INDEX_FILE.tmp" "$INDEX_FILE"
    else
      # Create new index
      cat > "$INDEX_FILE" << EOF
# Session History

$INDEX_ENTRY
EOF
    fi
    echo -e "${GREEN}✓ Updated session index${NC}"
  fi

  # Stage the session files
  git add "$SESSION_FILE" "$INDEX_FILE"
fi

# =============================================================================
# STEP 3: Commit and push changes
# =============================================================================

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 3: Commit & Push${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Show what will be committed
echo -e "${GREEN}Files to commit:${NC}"
git status -s

# Suggest commit message based on changes
if [[ "$CREATE_SESSION" == "y" ]] && [[ -n "$SUMMARY" ]]; then
  SUGGESTED_COMMIT="$SUMMARY"
else
  # Generate commit message from changes
  if echo "$ALL_CHANGED" | grep -q "src/pages/\|src/components/"; then
    SUGGESTED_COMMIT="Update UI components"
  elif echo "$ALL_CHANGED" | grep -q "test"; then
    SUGGESTED_COMMIT="Update tests"
  elif echo "$ALL_CHANGED" | grep -q "\.md$"; then
    SUGGESTED_COMMIT="Update documentation"
  else
    SUGGESTED_COMMIT="Update files"
  fi
fi

echo -e "\n${GREEN}Suggested commit message:${NC} ${CYAN}${SUGGESTED_COMMIT}${NC}"
read -p "Use this message? (Y/n): " USE_SUGGESTED
USE_SUGGESTED=${USE_SUGGESTED:-y}

if [[ "$USE_SUGGESTED" =~ ^[Yy]$ ]]; then
  COMMIT_MSG="$SUGGESTED_COMMIT"
else
  echo -e "\n${GREEN}Enter commit message:${NC}"
  read -p "> " COMMIT_MSG
fi

# Offer to stage all files
if [[ -n $(git status -s | grep "^??") ]]; then
  echo -e "\n${YELLOW}Untracked files detected:${NC}"
  git status -s | grep "^??"
  read -p "Stage all files? (y/n): " STAGE_ALL
  if [[ "$STAGE_ALL" == "y" ]]; then
    git add -A
  fi
fi

# Stage modified/deleted files if not already staged
if [[ -n $(git status -s | grep "^ M\| M\| D") ]]; then
  git add -u
fi

# Create commit
echo -e "\n${BLUE}Creating commit...${NC}"
git commit -m "$COMMIT_MSG

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

echo -e "${GREEN}✓ Commit created${NC}"

# Push to remote
read -p "Push to remote? (y/n): " PUSH_CHANGES
if [[ "$PUSH_CHANGES" == "y" ]]; then
  CURRENT_BRANCH=$(git branch --show-current)
  echo -e "\n${BLUE}Pushing to origin/$CURRENT_BRANCH...${NC}"
  git push origin "$CURRENT_BRANCH"
  echo -e "${GREEN}✓ Pushed to remote${NC}"
fi

# =============================================================================
# Summary
# =============================================================================

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Session End Complete${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if [[ "$CREATE_SESSION" == "y" ]]; then
  echo -e "📄 Session file: ${BLUE}$SESSION_FILE${NC}"
fi
echo -e "📋 Commit: ${BLUE}$(git log -1 --oneline)${NC}"
if [[ "$PUSH_CHANGES" == "y" ]]; then
  echo -e "🚀 Pushed to: ${BLUE}origin/$CURRENT_BRANCH${NC}"
fi

echo -e "\n${YELLOW}💡 Tip: Review the session file and ensure all documentation is up to date${NC}\n"
