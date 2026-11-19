#!/usr/bin/env bash
# Stop Hook: Runs DevOS test suite before allowing agent termination.
set -euo pipefail

# Consume stdin
cat > /dev/null

if [ -f "./package.json" ]; then
  TEST_OUTPUT=$(npm test 2>&1) || TEST_EXIT=$?
  TEST_EXIT=${TEST_EXIT:-0}

  if [ "$TEST_EXIT" -ne 0 ]; then
    python3 -c '
import sys, json

output = sys.argv[1]
msg = f"DevOS Stop rejected: Tests failed with exit code non-zero. You must resolve all test failures before finishing.\n\nTest Output:\n{output}"

result = {
    "terminationBehavior": "force_continue",
    "injectSteps": [
        {
            "systemMessage": {
                "systemMessage": msg
            }
        }
    ]
}
print(json.dumps(result))
' "$TEST_OUTPUT"
    exit 0
  fi
fi

echo '{"terminationBehavior": ""}'
