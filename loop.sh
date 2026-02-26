#!/bin/bash
# Ralph Wiggum Loop - Fresh context per iteration
# Usage: ./loop.sh [plan|build] [max_iterations]
#
# Examples:
#   ./loop.sh plan      # Planning mode, default 5 iterations
#   ./loop.sh plan 3    # Planning mode, max 3 iterations
#   ./loop.sh build     # Build mode, default 25 iterations
#   ./loop.sh build 10  # Build mode, max 10 iterations

set -e

MODE="${1:-build}"

# Default iteration limits
if [ "$MODE" = "plan" ]; then
  DEFAULT_MAX=5
  PROMPT_FILE="PROMPT_plan.md"
elif [ "$MODE" = "build" ]; then
  DEFAULT_MAX=25
  PROMPT_FILE="PROMPT_build.md"
else
  echo "Usage: ./loop.sh [plan|build] [max_iterations]"
  exit 1
fi

MAX_ITERATIONS="${2:-$DEFAULT_MAX}"
ITERATION=0

if [ ! -f "$PROMPT_FILE" ]; then
  echo "Error: $PROMPT_FILE not found"
  exit 1
fi

echo "=========================================="
echo "Ralph Wiggum Loop"
echo "Mode: $MODE"
echo "Prompt: $PROMPT_FILE"
echo "Max iterations: $MAX_ITERATIONS"
echo "=========================================="

while true; do
  if [ $ITERATION -ge $MAX_ITERATIONS ]; then
    echo ""
    echo "Reached max iterations ($MAX_ITERATIONS). Stopping."
    break
  fi

  ITERATION=$((ITERATION + 1))
  echo ""
  echo "=========================================="
  echo "Iteration $ITERATION / $MAX_ITERATIONS (Mode: $MODE)"
  echo "$(date '+%Y-%m-%d %H:%M:%S')"
  echo "=========================================="

  # Fresh Claude session each iteration - context resets!
  cat "$PROMPT_FILE" | claude -p \
    --dangerously-skip-permissions \
    --model sonnet

  # Auto-commit progress after each iteration
  git add -A
  if ! git diff --staged --quiet; then
    git commit -m "Ralph iteration $ITERATION ($MODE mode)

Co-Authored-By: Claude <noreply@anthropic.com>"
    echo "Changes committed."
  else
    echo "No changes to commit."
  fi

  echo "Iteration $ITERATION complete."
  sleep 2
done

echo ""
echo "Ralph loop finished after $ITERATION iterations."
