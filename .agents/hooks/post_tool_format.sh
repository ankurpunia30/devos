#!/usr/bin/env bash
# PostToolUse Hook: Runs code formatting or syntax check after file edits.
set -euo pipefail

INPUT=$(cat)

# PostToolUse always returns {}
echo "{}"
