#!/usr/bin/env bash
# PreToolUse Hook: Audits command lines before execution.
set -euo pipefail

INPUT=$(cat)

python3 -c '
import sys, json, re

try:
    payload = json.loads(sys.argv[1])
except Exception:
    print(json.dumps({"decision": "allow"}))
    sys.exit(0)

cmd = payload.get("toolCall", {}).get("args", {}).get("CommandLine", "")

dangerous_patterns = [
    r"rm\s+-rf\s+(/|\.\.|\*)",
    r":\(\)\s*\{\s*:\|:&\s*\};:",
    r"drop\s+database",
    r"chmod\s+777",
]

for pattern in dangerous_patterns:
    if re.search(pattern, cmd, re.IGNORECASE):
        print(json.dumps({
            "decision": "deny",
            "reason": f"Execution blocked: Detected potentially destructive command matching pattern {pattern}."
        }))
        sys.exit(0)

print(json.dumps({"decision": "allow"}))
' "$INPUT"
