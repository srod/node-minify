#!/usr/bin/env bash
set -euo pipefail

# Enforces the type-suppression rules documented in AGENTS.md > Anti-Patterns.
#
# Biome covers only part of this: `noTsIgnore` catches `@ts-ignore`, but it never
# sees `@ts-nocheck`, and the root `lint` script runs `bun run --filter '*' lint`,
# which reaches workspace packages only. The shared `tests/` helpers and
# `scripts/` live outside `workspaces`, so no Biome rule applies to them at all.
# This guard is the mechanism behind the claims; without it they are review-only.
#
# Three rules, all mechanical:
#   1. `@ts-nocheck` and `@ts-ignore` are banned everywhere — both disable
#      checking without proving an error exists.
#   2. `@ts-expect-error` is banned in `src/` — production types get fixed.
#   3. `@ts-expect-error` in tests MUST carry a reason on the same line, so the
#      suppression states which specific condition it tolerates.

CODE_INCLUDES=(
  --include="*.ts" --include="*.tsx" --include="*.mts" --include="*.cts"
  --include="*.js" --include="*.jsx" --include="*.mjs" --include="*.cjs"
  --include="*.astro" --include="*.svelte" --include="*.vue"
)

# Build output, dependencies, coverage reports and test scratch space are either
# generated or vendored: a suppression there is not authored by us.
EXCLUDE_PATHS=(
  --exclude-dir="node_modules"
  --exclude-dir="dist"
  --exclude-dir="coverage"
  --exclude-dir="tmp"
  --exclude-dir=".astro"
)

# Every hand-written code location in the repo. `tests/` and `scripts/` are
# listed explicitly because they are not workspace packages.
SCAN_ROOTS=(packages/ tests/ scripts/ examples/ docs/src/)

# 1. @ts-nocheck / @ts-ignore anywhere.
NOCHECK_MATCHES=$(grep -rnE "@ts-(nocheck|ignore)\b" \
  "${CODE_INCLUDES[@]}" "${EXCLUDE_PATHS[@]}" \
  "${SCAN_ROOTS[@]}" \
  2>/dev/null || true)

# 2. @ts-expect-error inside any src/ directory. Matched on the path so a
#    directive in production code is caught regardless of how it is worded.
SRC_EXPECT_MATCHES=$(grep -rnE "@ts-expect-error" \
  "${CODE_INCLUDES[@]}" "${EXCLUDE_PATHS[@]}" \
  "${SCAN_ROOTS[@]}" \
  2>/dev/null | grep -E "(^|/)src/" || true)

# 3. Bare @ts-expect-error: the directive with nothing after it but optional
#    whitespace and an optional block-comment terminator. A reason comment makes
#    the suppression self-documenting and is required by AGENTS.md.
BARE_EXPECT_MATCHES=$(grep -rnE "@ts-expect-error[[:space:]]*(\*/)?[[:space:]]*$" \
  "${CODE_INCLUDES[@]}" "${EXCLUDE_PATHS[@]}" \
  "${SCAN_ROOTS[@]}" \
  2>/dev/null || true)

FAILED=0

if [ -n "$NOCHECK_MATCHES" ]; then
  echo "ERROR: @ts-nocheck / @ts-ignore are banned — they disable checking instead of proving an error exists."
  echo "$NOCHECK_MATCHES"
  echo
  FAILED=1
fi

if [ -n "$SRC_EXPECT_MATCHES" ]; then
  echo "ERROR: @ts-expect-error is not allowed in src/ — fix the type instead."
  echo "$SRC_EXPECT_MATCHES"
  echo
  FAILED=1
fi

if [ -n "$BARE_EXPECT_MATCHES" ]; then
  echo "ERROR: @ts-expect-error must state the condition it tolerates on the same line."
  echo "Example: // @ts-expect-error testing invalid input: settings is missing required fields"
  echo "$BARE_EXPECT_MATCHES"
  echo
  FAILED=1
fi

if [ "$FAILED" -ne 0 ]; then
  exit 1
fi

echo "Guard passed: no banned type suppressions found."
exit 0
