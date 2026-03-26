#!/usr/bin/env bash
set -euo pipefail

REMOVED_PACKAGES="@node-minify/babel-minify|@node-minify/uglify-es|@node-minify/yui|@node-minify/sqwish|@node-minify/crass|@node-minify/run"

# Search for removed package references in source files
# Exclude: CHANGELOG files, node_modules, docs/plans, migration guide, .changeset, compressor-registry (intentional data), test files (intentional test data), dist files (bundled)
MATCHES=$(grep -rn --include="*.ts" --include="*.js" --include="*.json" \
  -E "$REMOVED_PACKAGES" \
  packages/ examples/ \
  2>/dev/null \
  | grep -v "CHANGELOG" \
  | grep -v "node_modules" \
  | grep -v "docs/plans" \
  | grep -v "v11-migration" \
  | grep -v ".changeset" \
  | grep -v "compressor-registry" \
  | grep -v "__tests__" \
  | grep -v "/dist/" \
  || true)

if [ -n "$MATCHES" ]; then
  echo "ERROR: Found references to removed packages:"
  echo "$MATCHES"
  exit 1
fi

echo "Guard passed: no removed compressor references found."
exit 0
